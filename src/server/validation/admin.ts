import { z } from "zod";
import { colors, flowerTypes, occasions, productTypes } from "@/data/catalog";
import { email, isoDate, line, multiline, sizeKey } from "@/lib/validation";
import { MIN_PASSWORD_LENGTH } from "@/server/auth/password";
import { orderStatus } from "@/server/db/schema";

const keys = <T extends { key: string }>(list: readonly T[]) => list.map((x) => x.key) as [T["key"], ...T["key"][]];

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lower-case letters, numbers and dashes").max(80);
/** $0.50 (Stripe minimum) to $10,000 per item. */
const priceCents = z.number().int().min(50).max(1_000_000);
const stock = z.number().int().min(0).max(100_000).nullable();
const uniqueList = <T extends z.ZodType>(item: T, max: number) =>
  z.array(item).max(max).refine((a) => new Set(a).size === a.length, "Duplicate values");

// ── Auth ──────────────────────────────────────────────────────────────────────

export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().min(1).max(200),
});

const password = z.string().min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`).max(200);

// ── Products ─────────────────────────────────────────────────────────────────

export const variantInput = z.strictObject({
  size: sizeKey,
  priceCents,
  note: line(120, 0).default(""),
  stock: stock.default(null),
  active: z.boolean().default(true),
});

const productFields = {
  name: line(120),
  tagline: line(200, 0).default(""),
  description: multiline(4000).default(""),
  type: z.enum(keys(productTypes)),
  occasions: uniqueList(z.enum(keys(occasions)), 20).default([]),
  flowers: uniqueList(z.enum(keys(flowerTypes)), 20).default([]),
  colors: uniqueList(z.enum(keys(colors)), 20).default([]),
  details: z.array(line(200)).max(20).default([]),
  badge: z.enum(["New", "Bestseller", "Seasonal", "Florist's Pick"]).nullable().default(null),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
};

const variantsList = z
  .array(variantInput)
  .min(1)
  .max(3)
  .refine((v) => new Set(v.map((x) => x.size)).size === v.length, "Each size may appear once");

export const productCreateSchema = z.strictObject({ slug, ...productFields, variants: variantsList });

export const productUpdateSchema = z
  .strictObject({
    slug: slug.optional(),
    name: productFields.name.optional(),
    tagline: line(200, 0).optional(),
    description: multiline(4000).optional(),
    type: productFields.type.optional(),
    occasions: uniqueList(z.enum(keys(occasions)), 20).optional(),
    flowers: uniqueList(z.enum(keys(flowerTypes)), 20).optional(),
    colors: uniqueList(z.enum(keys(colors)), 20).optional(),
    details: z.array(line(200)).max(20).optional(),
    badge: z.enum(["New", "Bestseller", "Seasonal", "Florist's Pick"]).nullable().optional(),
    featured: z.boolean().optional(),
    active: z.boolean().optional(),
    /** Upsert by size. Sizes not listed are left unchanged (set `active: false` to hide one). */
    variants: variantsList.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export const productListQuery = z.object({
  q: z.string().trim().max(100).optional(),
  active: z.enum(["true", "false"]).transform((v) => v === "true").optional(),
  type: z.enum(keys(productTypes)).optional(),
  lowStock: z.coerce.number().int().min(0).max(1000).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const variantUpdateSchema = z
  .strictObject({
    priceCents: priceCents.optional(),
    note: line(120, 0).optional(),
    active: z.boolean().optional(),
    /** Either replace the stock level (null = stop tracking) or adjust it by a delta (e.g. +24 delivery, -3 wastage). */
    stock: z.union([z.strictObject({ set: stock }), z.strictObject({ adjust: z.number().int().min(-100_000).max(100_000).refine((n) => n !== 0) })]).optional(),
    reason: line(200).optional(),
  })
  .refine((v) => v.priceCents !== undefined || v.note !== undefined || v.active !== undefined || v.stock !== undefined, "Nothing to update");

export const imageMetaSchema = z.object({ alt: line(200, 0).default("") });

// ── Add-ons ──────────────────────────────────────────────────────────────────

export const addOnCreateSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  name: line(120),
  priceCents: z.number().int().min(0).max(100_000),
  description: line(300, 0).default(""),
  imageUrl: z.union([z.url({ protocol: /^https$/ }), z.string().regex(/^\/[A-Za-z0-9/_.-]+$/), z.literal("")]).default(""),
  imageAlt: line(200, 0).default(""),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(1000).default(0),
});

export const addOnUpdateSchema = addOnCreateSchema
  .omit({ id: true })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

// ── Orders ────────────────────────────────────────────────────────────────────

const statusEnum = z.enum(orderStatus.enumValues);

export const orderListQuery = z.object({
  status: z.union([statusEnum, z.array(statusEnum)]).transform((v) => (Array.isArray(v) ? v : [v])).optional(),
  createdFrom: isoDate.optional(),
  createdTo: isoDate.optional(),
  deliveryFrom: isoDate.optional(),
  deliveryTo: isoDate.optional(),
  needsReview: z.enum(["true"]).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(["created_desc", "created_asc", "delivery_asc", "delivery_desc", "total_desc"]).default("created_desc"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const orderStatusSchema = z.strictObject({
  status: statusEnum,
  note: multiline(500).optional(),
});

export const orderNotesSchema = z.strictObject({ internalNotes: multiline(2000) });

export const refundSchema = z.strictObject({
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer"]).default("requested_by_customer"),
  /** Omit for a full refund. */
  amountCents: z.number().int().min(1).optional(),
  note: multiline(500).optional(),
});

export const statsQuery = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
});

// ── Admin users ───────────────────────────────────────────────────────────────

export const adminCreateSchema = z.strictObject({
  email,
  name: line(100),
  role: z.enum(["owner", "staff"]).default("staff"),
  password,
});

export const adminUpdateSchema = z
  .strictObject({
    name: line(100).optional(),
    role: z.enum(["owner", "staff"]).optional(),
    active: z.boolean().optional(),
    password: password.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");

export const changeOwnPasswordSchema = z.strictObject({ currentPassword: z.string().min(1).max(200), newPassword: password });

export const auditListQuery = z.object({
  entity: z.string().max(40).optional(),
  entityId: z.string().max(80).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

export const uuidParam = z.object({ id: z.uuid() });
