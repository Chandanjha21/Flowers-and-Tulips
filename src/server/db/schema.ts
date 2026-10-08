import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/*
 * Conventions
 * - Money is always integer cents.
 * - Timestamps are timestamptz.
 * - Orders snapshot product names and prices so catalog edits never rewrite history.
 * - Session tokens are never stored, only their SHA-256 hash.
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ── Enums ──────────────────────────────────────────────────────────────────────

export const productType = pgEnum("product_type", ["bouquet", "arrangement", "gift-box", "plant"]);
export const sizeKey = pgEnum("size_key", ["standard", "deluxe", "premium"]);
export const productBadge = pgEnum("product_badge", ["New", "Bestseller", "Seasonal", "Florist's Pick"]);
export const orderStatus = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "in_design",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "expired",
  "refunded",
]);
export const adminRole = pgEnum("admin_role", ["owner", "staff"]);

// ── Catalog ────────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    type: productType("type").notNull(),
    occasions: text("occasions").array().notNull().default(sql`'{}'::text[]`),
    flowers: text("flowers").array().notNull().default(sql`'{}'::text[]`),
    colors: text("colors").array().notNull().default(sql`'{}'::text[]`),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    badge: productBadge("badge"),
    featured: boolean("featured").notNull().default(false),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("products_slug_uq").on(t.slug), index("products_active_idx").on(t.active, t.featured)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: sizeKey("size").notNull(),
    priceCents: integer("price_cents").notNull(),
    note: text("note").notNull().default(""),
    /** null = made to order (no stock tracking). */
    stock: integer("stock"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("product_variants_product_size_uq").on(t.productId, t.size),
    check("product_variants_price_chk", sql`${t.priceCents} >= 0`),
    check("product_variants_stock_chk", sql`${t.stock} IS NULL OR ${t.stock} >= 0`),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    /** Set for files we uploaded (so we can delete them); null for external URLs. */
    storageKey: text("storage_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("product_images_product_idx").on(t.productId, t.sortOrder)],
);

export const addOns = pgTable(
  "add_ons",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    priceCents: integer("price_cents").notNull(),
    description: text("description").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    imageAlt: text("image_alt").notNull().default(""),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [check("add_ons_price_chk", sql`${t.priceCents} >= 0`)],
);

// ── Guest sessions & cart ─────────────────────────────────────────────────────

export const guestSessions = pgTable(
  "guest_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("guest_sessions_token_uq").on(t.tokenHash), index("guest_sessions_expires_idx").on(t.expiresAt)],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => guestSessions.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    addOns: text("add_ons").array().notNull().default(sql`'{}'::text[]`),
    cardMessage: text("card_message"),
    deliveryDate: date("delivery_date"),
    ...timestamps,
  },
  (t) => [index("cart_items_session_idx").on(t.sessionId), check("cart_items_qty_chk", sql`${t.quantity} BETWEEN 1 AND 20`)],
);

// ── Orders ─────────────────────────────────────────────────────────────────────

export type AddOnSnapshot = { id: string; name: string; priceCents: number };

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull(),
    sessionId: uuid("session_id").references(() => guestSessions.id, { onDelete: "set null" }),
    status: orderStatus("status").notNull().default("pending_payment"),
    currency: text("currency").notNull().default("usd"),
    subtotalCents: integer("subtotal_cents").notNull(),
    deliveryFeeCents: integer("delivery_fee_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    /** What Stripe actually captured; set by the webhook. */
    amountPaidCents: integer("amount_paid_cents"),
    amountRefundedCents: integer("amount_refunded_cents").notNull().default(0),

    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    addressLine1: text("address_line1").notNull(),
    addressLine2: text("address_line2"),
    city: text("city").notNull(),
    zip: text("zip").notNull(),

    deliveryDate: date("delivery_date").notNull(),
    deliveryWindow: text("delivery_window"),
    deliveryNotes: text("delivery_notes"),
    giftMessage: text("gift_message"),

    senderName: text("sender_name").notNull(),
    senderEmail: text("sender_email").notNull(),
    senderPhone: text("sender_phone"),

    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    /** When the pending reservation lapses (mirrors the Stripe session expiry). */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    /** True once reserved stock has been returned (expiry, cancel, refund). Guards double release. */
    stockReleased: boolean("stock_released").notNull().default(false),
    /** Set when the webhook sees something that needs a human (e.g. amount mismatch). */
    reviewReason: text("review_reason"),
    internalNotes: text("internal_notes"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_number_uq").on(t.number),
    uniqueIndex("orders_stripe_session_uq").on(t.stripeCheckoutSessionId),
    index("orders_status_created_idx").on(t.status, t.createdAt),
    index("orders_delivery_date_idx").on(t.deliveryDate),
    index("orders_session_idx").on(t.sessionId),
    index("orders_sender_email_idx").on(t.senderEmail),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    imageUrl: text("image_url"),
    size: sizeKey("size").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    addOns: jsonb("add_ons").$type<AddOnSnapshot[]>().notNull().default([]),
    cardMessage: text("card_message"),
    quantity: integer("quantity").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    /** Whether this line reserved tracked stock (so release knows what to put back). */
    reservedStock: boolean("reserved_stock").notNull().default(false),
  },
  (t) => [index("order_items_order_idx").on(t.orderId), index("order_items_product_idx").on(t.productId)],
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatus("from_status"),
    toStatus: orderStatus("to_status").notNull(),
    /** "system", "stripe" or an admin user id. */
    actor: text("actor").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId, t.createdAt)],
);

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Admin ──────────────────────────────────────────────────────────────────────

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull().default(""),
    passwordHash: text("password_hash").notNull(),
    role: adminRole("role").notNull().default("staff"),
    active: boolean("active").notNull().default(true),
    failedLogins: integer("failed_logins").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (t) => [uniqueIndex("admin_users_email_uq").on(t.email)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("admin_sessions_token_uq").on(t.tokenHash), index("admin_sessions_admin_idx").on(t.adminId)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: uuid("admin_id").references(() => adminUsers.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_logs_created_idx").on(t.createdAt), index("audit_logs_entity_idx").on(t.entity, t.entityId)],
);

// ── Infrastructure ────────────────────────────────────────────────────────────

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("rate_limits_expires_idx").on(t.expiresAt)],
);

// ── Relations ──────────────────────────────────────────────────────────────────

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  images: many(productImages),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  session: one(guestSessions, { fields: [cartItems.sessionId], references: [guestSessions.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  events: many(orderEvents),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));

export const adminSessionsRelations = relations(adminSessions, ({ one }) => ({
  admin: one(adminUsers, { fields: [adminSessions.adminId], references: [adminUsers.id] }),
}));

export type OrderStatus = (typeof orderStatus.enumValues)[number];
export type AdminRole = (typeof adminRole.enumValues)[number];
export type SizeKey = (typeof sizeKey.enumValues)[number];
