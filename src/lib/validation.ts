import { z } from "zod";

/*
 * Request schemas shared by the browser (for early feedback) and the server (the real gate).
 * Objects are strict: unknown keys are rejected rather than silently ignored.
 */

// Control characters (except tab/newline in multi-line fields) are never legitimate input.
const SINGLE_LINE = /^[^\u0000-\u001f\u007f]*$/;
const MULTI_LINE = /^[^\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]*$/;

export const line = (max: number, min = 1) =>
  z.string().trim().min(min, min === 1 ? "Required" : `At least ${min} characters`).max(max).regex(SINGLE_LINE, "Invalid characters");
export const multiline = (max: number) => z.string().trim().max(max).regex(MULTI_LINE, "Invalid characters");
const optional = <T extends z.ZodType>(s: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), s.optional());

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
export const phone = z.string().trim().regex(/^[0-9+()\-.\s]{7,20}$/, "Enter a valid phone number");
export const zip = z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code");
export const email = z.email("Enter a valid email").trim().toLowerCase().max(254);

export const sizeKey = z.enum(["standard", "deluxe", "premium"]);
export const addOnId = z.string().regex(/^[a-z0-9-]{1,40}$/);

// ── Cart ────────────────────────────────────────────────────────────────────────

export const cartAddSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  size: sizeKey,
  quantity: z.number().int().min(1).max(20),
  addOns: z.array(addOnId).max(10).default([]).refine((a) => new Set(a).size === a.length, "Duplicate add-on"),
  cardMessage: optional(multiline(200)),
  deliveryDate: optional(isoDate),
});

export const cartUpdateSchema = z.strictObject({
  quantity: z.number().int().min(1).max(20),
});

// ── Checkout ────────────────────────────────────────────────────────────────────

export const checkoutSchema = z.strictObject({
  recipient: z.strictObject({
    name: line(100),
    phone,
    addressLine1: line(200),
    addressLine2: optional(line(200)),
    city: line(100),
    zip,
  }),
  delivery: z.strictObject({
    date: isoDate,
    window: optional(line(100)),
    notes: optional(multiline(500)),
  }),
  giftMessage: optional(multiline(240)),
  sender: z.strictObject({
    name: line(100),
    email,
    phone: optional(phone),
  }),
});

export type CartAddInput = z.infer<typeof cartAddSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
