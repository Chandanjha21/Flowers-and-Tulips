# Backend: Flowers and Tulips

Status: **phase 1 + 2 + admin APIs built** (2026-10-08). Forms (contact, events, custom orders, newsletter) and subscriptions are still frontend-only — see "Not in scope yet".

Everything runs inside the existing Next.js 16 app. The only external pieces are **Postgres** and **Stripe**.

---

## 1. Requirements

1. Guests (no login) add products to a bag, check out and pay.
2. Payment happens on **Stripe Checkout** (Stripe-hosted page). No card data ever reaches our server.
3. Admin APIs: manage inventory (products, sizes, prices, stock, images, add-ons), view orders, update order status, revenue/order stats, manage staff accounts.
4. The admin dashboard UI comes later; the APIs must be complete and stable now.
5. Production-grade security: this handles money and customer PII.

---

## 2. Stack

| Concern | Choice | Why |
| --- | --- | --- |
| DB | **Postgres** | Relational, transactional, row locks for stock |
| ORM / migrations | **Drizzle ORM + drizzle-kit** + `pg` | Typed SQL, no codegen step, `SELECT … FOR UPDATE` for stock reservation |
| Validation | **Zod 4** | Every request body, query string and env var |
| Payments | **Stripe Checkout** (hosted, `mode: payment`) + signed webhooks | PCI scope stays with Stripe (SAQ A) |
| Admin passwords | **argon2id** (`@node-rs/argon2`) | OWASP-recommended KDF |
| Sessions | Opaque random tokens in httpOnly cookies, **SHA-256 hash stored in DB** | A DB leak does not leak live sessions; revocable |
| Rate limiting | Postgres fixed-window counter | Works across serverless instances, no Redis needed |
| Image storage | Driver: `local` (dev, `.data/uploads`) or `vercel-blob` (prod) | Swappable via `STORAGE_DRIVER` |
| Tests | Vitest | Pricing, delivery rules, status machine, crypto helpers |

---

## 3. Architecture

```
src/
  proxy.ts                         optimistic admin-cookie gate for /api/admin/* (real check is in each handler)
  server/                          server-only code ("server-only" import guard)
    env.ts                         zod-validated env, fails fast at boot
    db/
      client.ts                    pg Pool + drizzle (singleton across HMR)
      schema.ts                    tables, enums, relations
      seed.ts                      seeds catalog from src/data/*
    http/
      handler.ts                   route wrapper: errors -> JSON, request id, no-store, no stack leaks
      errors.ts                    AppError (status + code)
      security.ts                  same-origin (CSRF) check, client IP, JSON body size limit
      rate-limit.ts                DB-backed limiter
    auth/
      tokens.ts                    random token + sha256 helpers
      guest-session.ts             anonymous shopper session (cookie <-> guest_sessions)
      admin-session.ts             admin login sessions, requireAdmin(role)
      password.ts                  argon2id hash/verify
    services/
      catalog.ts                   public product reads (used by src/lib/data.ts)
      cart.ts                      server-side cart
      pricing.ts                   pure price/fee computation (unit-tested)
      delivery.ts                  delivery date rules in store time zone (unit-tested)
      checkout.ts                  cart -> pending order + stock reservation -> Stripe session
      orders.ts                    status machine, payment/expiry/refund handling
      stripe-webhook.ts            event dispatch, idempotency
      admin-*.ts                   inventory, orders, stats, users, audit log
    storage/                       image upload drivers + magic-byte validation
    stripe.ts                      Stripe client
  app/api/...                      thin route handlers (validate -> service -> JSON)
drizzle/                           generated SQL migrations (committed)
scripts/create-admin.ts            CLI to create the first owner (no public sign-up)
```

Route handlers stay thin. Business logic lives in `src/server/services`, so the future admin dashboard can call the same services from Server Components.

---

## 4. Data model

All money is **integer cents**. Orders keep **snapshots** of names and prices so later catalog edits never rewrite history.

| Table | Key columns |
| --- | --- |
| `products` | slug (unique), name, tagline, description, type, occasions[], flowers[], colors[], details[], badge, featured, **active** (soft delete) |
| `product_variants` | product_id, size (standard/deluxe/premium, unique per product), price_cents, note, **stock** (null = made to order / unlimited) |
| `product_images` | product_id, url, alt, sort_order, storage_key |
| `add_ons` | id (vase/chocolates/card/balloon/candle), name, price_cents, description, image, active |
| `guest_sessions` | token_hash (unique), expires_at, last_seen_at |
| `cart_items` | session_id, variant_id, quantity, add_ons[], card_message |
| `orders` | number `PB-XXXXXX` (unique), session_id, status, subtotal/delivery/total cents, currency, recipient + sender + delivery fields, stripe_checkout_session_id (unique), stripe_payment_intent_id, paid_at, expires_at, stock_released |
| `order_items` | order_id, product_id, variant_id, product_name, size, unit_price_cents, add_ons (jsonb snapshot), card_message, quantity, line_total_cents |
| `order_events` | order_id, from_status, to_status, actor (system/stripe/admin id), note — full status history |
| `stripe_events` | Stripe event id (PK) — webhook idempotency |
| `admin_users` | email (unique, lower-case), password_hash, role (owner/staff), active, failed_logins, locked_until |
| `admin_sessions` | token_hash, admin_id, expires_at, last_seen_at, ip, user_agent |
| `audit_logs` | admin_id, action, entity, entity_id, meta jsonb, ip |
| `rate_limits` | key, window_start, count |

Order status machine:

```
pending_payment ──► paid ──► in_design ──► out_for_delivery ──► delivered
      │               │           │                │
      ├──► expired    └───────────┴────────────────┴──► cancelled / refunded
      └──► cancelled
```

Only the **Stripe webhook** moves an order to `paid`. Admins move it forward from there.

---

## 5. Checkout flow

```
Browser                         Our server                                   Stripe
  │  POST /api/checkout  ───────► validate body (zod), same-origin, rate limit
  │                               load cart for guest session
  │                               re-price everything from DB (never trust client)
  │                               validate delivery date/ZIP in store time zone
  │                               TX: lock variants FOR UPDATE, reserve stock,
  │                                   insert order(pending_payment) + items
  │                               create Checkout Session (idempotency key = order id,
  │                                   expires in 30 min, metadata.orderId) ─────────►
  │  ◄─────────── { url } ────────
  │  redirect to Stripe-hosted page ────────────────────────────────────────────────►  card entry, 3DS
  │  ◄──────────── success_url /checkout/confirmation?session_id=… ──────────────────
  │                               POST /api/webhooks/stripe  ◄────────────────── signed event
  │                               verify signature on raw body, dedupe event id,
  │                               check amount + currency match the order,
  │                               mark paid, clear cart        (or release stock on expiry)
```

- The confirmation page reads the order **server-side** by `session_id` and only shows PII when the guest-session cookie owns the order.
- Abandoned checkouts: Stripe sends `checkout.session.expired` after 30 min and we release the reserved stock. A new checkout from the same session first expires any previous open one.
- Async methods are handled (`checkout.session.async_payment_succeeded/failed`), plus `charge.refunded`.

---

## 6. API surface

All responses: `{ "data": … }` or `{ "error": { "code", "message", "details"? } }`, with `Cache-Control: no-store`.

### Public (guest)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/cart` | Current cart, re-priced from DB |
| POST | `/api/cart/items` | Add `{ slug, size, quantity, addOns[], cardMessage? }` |
| PATCH | `/api/cart/items/:id` | Change quantity |
| DELETE | `/api/cart/items/:id` | Remove line |
| DELETE | `/api/cart` | Empty bag |
| POST | `/api/checkout` | Create pending order + Stripe Checkout Session, returns `{ url }` |
| POST | `/api/webhooks/stripe` | Stripe only (signature-verified) |

### Admin (cookie session; `owner` or `staff` unless noted)

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/admin/auth/login` | Email + password, sets session cookie |
| POST | `/api/admin/auth/logout` | Revoke current session |
| GET | `/api/admin/auth/me` | Current admin |
| GET / POST | `/api/admin/products` | List (search, filter, paginate, incl. inactive) / create with variants |
| GET / PATCH / DELETE | `/api/admin/products/:id` | Read / update (fields + variant upsert) / archive |
| POST | `/api/admin/products/:id/images` | Multipart image upload (jpeg/png/webp/avif, 5 MB) |
| DELETE | `/api/admin/products/:id/images/:imageId` | Remove image |
| PATCH | `/api/admin/variants/:id` | Price, note, stock (`set` or `adjust` by delta) |
| GET / POST | `/api/admin/add-ons` | List / create |
| PATCH | `/api/admin/add-ons/:id` | Update / deactivate |
| GET | `/api/admin/orders` | Filter by status, created range, delivery date, search; paginate |
| GET | `/api/admin/orders/:id` | Order + items + status history |
| PATCH | `/api/admin/orders/:id/status` | Move along the status machine |
| POST | `/api/admin/orders/:id/refund` | **owner**: full refund via Stripe |
| GET | `/api/admin/stats` | Revenue, order counts by status, AOV, revenue by day, top products |
| GET / POST | `/api/admin/users` | **owner**: list / create staff |
| PATCH | `/api/admin/users/:id` | **owner**: role, active, reset password |
| GET | `/api/admin/audit-logs` | **owner**: admin action log |

---

## 7. Security measures

**Payments**
- Stripe-hosted Checkout: card data never touches our servers or logs.
- Amounts computed only on the server from DB prices; client prices are ignored.
- Webhook: signature verified on the raw body, event id deduplicated in a transaction, amount and currency cross-checked against the order. It is the only path to `paid`.
- Stripe idempotency key per order, so retries never double-create sessions.

**Sessions**
- Guest and admin tokens: 256-bit random, only the SHA-256 hash stored, `HttpOnly`, `Secure`, `__Host-` prefix in production.
- Guest cookie `SameSite=Lax` (survives the Stripe redirect back); admin cookie `SameSite=Strict`.
- Admin sessions: 12 h absolute, 2 h idle timeout, revoked on logout, password change or deactivation.

**Requests**
- CSRF: every non-GET API (except the webhook) requires a same-origin `Origin` header and a JSON or multipart content type.
- Zod validation with strict objects (unknown keys rejected) and body size limits.
- Rate limits: login (per IP and per email), cart writes, checkout, uploads.
- Errors never leak stack traces or SQL; a request id is returned and logged.

**Admin**
- No public sign-up. The first owner is created by CLI. Roles: `owner`, `staff`.
- argon2id passwords (min 12 chars), lockout after 5 failed logins for 15 min, same response for unknown email and wrong password (dummy hash keeps timing equal).
- Every admin mutation is written to `audit_logs`.
- `proxy.ts` does an optimistic cookie check; each handler does the real DB-backed check.

**Uploads**
- Magic-byte sniffing (not the client MIME type), allow-list jpeg/png/webp/avif, 5 MB max, random UUID file names, no SVG/HTML.

**Platform**
- Security headers on every response: HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and a CSP with `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`.
- Env validated at boot. Secrets only in env, `.env*` git-ignored, `.env.example` committed.
- `server-only` guard on all server modules so they can never be bundled to the browser.

---

## 8. Running locally

```bash
cp .env.example .env.local           # fill in Stripe test keys
npm run db:up                        # Postgres in .data/pg on port 54329 (or: docker compose up -d)
npm run db:migrate && npm run db:seed
npm run admin:create -- --email you@example.com --name "You" --role owner   # prompts for password
npm run dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe   # copy whsec_… into STRIPE_WEBHOOK_SECRET
```

Test card: `4242 4242 4242 4242`, any future date, any CVC.

Other scripts: `npm run typecheck`, `npm test`, `npm run db:generate` (after editing `schema.ts`), `npm run db:studio`, `npm run db:down`.

Notes:
- `next build` reads the catalog from the DB (product pages are prerendered, ISR 5 min + tag revalidation on admin edits), so the build needs `DATABASE_URL`. It does not need Stripe keys.
- In production the server refuses to start payment flows with a Stripe **test** key or a non-https `APP_URL` (set `ALLOW_STRIPE_TEST_IN_PROD=1` for a staging deploy).
- `TRUST_PROXY=1` assumes Vercel or a proxy that overwrites `X-Forwarded-For`. Set `0` if the app is exposed directly, otherwise per-IP rate limits can be spoofed.
- Maintenance (`/api/cron/maintenance`, every 15 min via `vercel.json`) reconciles checkouts whose webhook was missed and purges expired sessions. Needs `CRON_SECRET`.

### Frontend-only (demo) mode

With no `DATABASE_URL` at build time (or `NEXT_PUBLIC_FRONTEND_ONLY=1`), the site builds as a pure frontend demo: products come from `src/data`, the bag lives in `localStorage`, and checkout validates the form and shows a demo confirmation without taking payment. No env vars are needed, so it deploys to Vercel as-is. Adding `DATABASE_URL` (plus the Stripe keys) switches the real backend back on. See `src/lib/mode.ts`.

## 9. Production checklist

- [ ] Managed Postgres with daily backups + PITR (Neon, Supabase, RDS). Use SSL (`sslmode=require`).
- [ ] Stripe live keys, webhook endpoint registered for: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`.
- [ ] Enable Stripe email receipts (Settings → Emails) until our own emails exist.
- [ ] `STORAGE_DRIVER=vercel-blob` (or add an S3 driver).
- [ ] Error monitoring (Sentry) and log retention.
- [ ] Admin 2FA (TOTP) before giving staff accounts out widely.
- [ ] Privacy policy, terms, refund and substitution policy pages.

---

## 10. Not in scope yet

- Contact, event inquiry, custom order (+ image upload) and newsletter forms → need email (Resend) + Turnstile.
- Subscriptions (Stripe Billing + Customer Portal).
- Transactional emails (order confirmation, florist alert, out-for-delivery).
- Delivery zones / blackout dates in DB (today: flat fee + free-over threshold from `site.ts`, local ZIP check).
- Taxes (Stripe Tax can be switched on in the Checkout Session once the business decides).

Open decisions for the client: courier integration, tax handling, substitution-policy wording, POS sync, SMS notifications.
