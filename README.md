# Flowers and Tulips: florist website mockup

Next.js 16 (App Router, TypeScript) + Tailwind CSS v4. No CMS, database, auth or payments. All data is mocked.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Rebranding for a new florist

| What | Where |
| --- | --- |
| Name, phone, email, address, hours, social links, delivery rules | `src/config/site.ts` |
| Every photo and video (swap for the florist's own) | `src/data/media.ts`, videos in `public/videos/` |
| Colors, fonts, type scale, easing | `src/app/globals.css` (`@theme`) and `src/app/layout.tsx` (fonts) |
| Products, occasions, add-ons, filters | `src/data/products.ts`, `src/data/catalog.ts` |
| Events, gallery, testimonials, subscription plans, FAQs, team | `src/data/*.ts` |

## Architecture

- `src/lib/data.ts`: async data-access layer. Pages only call these functions, so a database or CMS can replace the mock files without UI changes.
- `src/lib/filters.ts`: shop filter parsing, serialization (URL query string) and filtering/sorting.
- `src/components/cart/CartProvider.tsx`: in-memory cart (React context). Checkout and confirmation are mocks.
- Forms (event inquiry, custom order wizard, subscribe flow, contact, newsletter) show success states only; nothing is sent.

## Routes

`/` · `/shop` (filters synced to URL, e.g. `/shop?occasion=sympathy&type=plant`) · `/shop/[slug]` · `/checkout` · `/checkout/confirmation` · `/events` · `/custom-orders` · `/subscriptions` · `/about` · `/contact` · `sitemap.xml` · `robots.txt`

## Media credits

Placeholder photography from Unsplash and video from Mixkit, both under free licenses. Replace before going live.
