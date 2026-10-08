import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, type DB, type Tx } from "@/server/db/client";
import { addOns, cartItems, productImages, products, productVariants, type SizeKey } from "@/server/db/schema";
import { conflict, notFound, unprocessable } from "@/server/http/errors";
import type { CartAddInput } from "@/lib/validation";
import { checkDeliveryDate } from "./delivery";
import { computeTotals, lineTotalCents, MAX_CART_LINES, MAX_LINE_QUANTITY } from "./pricing";

export interface CartItemView {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: { src: string; alt: string } | null;
  size: SizeKey;
  quantity: number;
  unitPriceCents: number;
  addOns: { id: string; name: string; priceCents: number }[];
  cardMessage: string | null;
  deliveryDate: string | null;
  lineTotalCents: number;
  /** False when the product was archived, the size disabled, an add-on removed, or stock ran out. */
  available: boolean;
  issue?: string;
}

export interface CartView {
  items: CartItemView[];
  count: number;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  currency: string;
}

/** Loads and re-prices a session's cart from the database. Unavailable lines are excluded from totals. */
export async function getCart(sessionId: string, conn: DB | Tx = db): Promise<CartView> {
  const rows = await conn
    .select({ item: cartItems, variant: productVariants, product: products })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(cartItems.sessionId, sessionId))
    .orderBy(asc(cartItems.createdAt));

  const productIds = [...new Set(rows.map((r) => r.product.id))];
  const addOnIds = [...new Set(rows.flatMap((r) => r.item.addOns))];
  const [images, addOnRows] = await Promise.all([
    productIds.length
      ? conn.select().from(productImages).where(inArray(productImages.productId, productIds)).orderBy(asc(productImages.sortOrder))
      : Promise.resolve([]),
    addOnIds.length ? conn.select().from(addOns).where(inArray(addOns.id, addOnIds)) : Promise.resolve([]),
  ]);
  const addOnById = new Map(addOnRows.map((a) => [a.id, a]));

  const items: CartItemView[] = rows.map(({ item, variant, product }) => {
    const lineAddOns = item.addOns.map((id) => addOnById.get(id));
    let issue: string | undefined;
    if (!product.active || !variant.active) issue = "This item is no longer available";
    else if (lineAddOns.some((a) => !a || !a.active)) issue = "An add-on on this item is no longer available";
    else if (variant.stock !== null && variant.stock < item.quantity)
      issue = variant.stock === 0 ? "Sold out" : `Only ${variant.stock} left`;

    const priced = lineAddOns.filter((a): a is NonNullable<typeof a> => !!a);
    const image = images.find((i) => i.productId === product.id);
    return {
      id: item.id,
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      image: image ? { src: image.url, alt: image.alt } : null,
      size: variant.size,
      quantity: item.quantity,
      unitPriceCents: variant.priceCents,
      addOns: priced.map((a) => ({ id: a.id, name: a.name, priceCents: a.priceCents })),
      cardMessage: item.cardMessage,
      deliveryDate: item.deliveryDate,
      lineTotalCents: lineTotalCents({
        unitPriceCents: variant.priceCents,
        addOnPricesCents: priced.map((a) => a.priceCents),
        quantity: item.quantity,
      }),
      available: !issue,
      ...(issue ? { issue } : {}),
    };
  });

  const available = items.filter((i) => i.available);
  const totals = computeTotals(
    available.map((i) => ({ unitPriceCents: i.unitPriceCents, addOnPricesCents: i.addOns.map((a) => a.priceCents), quantity: i.quantity })),
  );
  return { items, count: available.reduce((n, i) => n + i.quantity, 0), ...totals, currency: "usd" };
}

const sameAddOns = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

export async function addCartItem(sessionId: string, input: CartAddInput) {
  if (input.deliveryDate) {
    const check = checkDeliveryDate(input.deliveryDate);
    if (!check.ok) throw unprocessable(check.reason, { field: "deliveryDate" });
  }

  await db.transaction(async (tx) => {
    const [found] = await tx
      .select({ variant: productVariants })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(and(eq(products.slug, input.slug), eq(products.active, true), eq(productVariants.size, input.size), eq(productVariants.active, true)))
      .limit(1);
    if (!found) throw notFound("Product");
    const variant = found.variant;

    if (input.addOns.length) {
      const valid = await tx
        .select({ id: addOns.id })
        .from(addOns)
        .where(and(inArray(addOns.id, input.addOns), eq(addOns.active, true)));
      if (valid.length !== input.addOns.length) throw unprocessable("One or more add-ons are unavailable", { field: "addOns" });
    }

    const existing = await tx.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    const cardMessage = input.cardMessage ?? null;
    const deliveryDate = input.deliveryDate ?? null;
    const match = existing.find(
      (l) => l.variantId === variant.id && sameAddOns(l.addOns, input.addOns) && l.cardMessage === cardMessage && l.deliveryDate === deliveryDate,
    );

    const newQty = (match?.quantity ?? 0) + input.quantity;
    if (newQty > MAX_LINE_QUANTITY) throw unprocessable(`At most ${MAX_LINE_QUANTITY} of one item per order`);
    const inCartForVariant = existing.filter((l) => l.variantId === variant.id).reduce((n, l) => n + l.quantity, 0) + input.quantity;
    if (variant.stock !== null && inCartForVariant > variant.stock) {
      throw conflict(variant.stock === 0 ? "Sold out" : `Only ${variant.stock} available`, { available: variant.stock });
    }

    if (match) {
      await tx.update(cartItems).set({ quantity: newQty }).where(eq(cartItems.id, match.id));
    } else {
      if (existing.length >= MAX_CART_LINES) throw unprocessable(`Your bag can hold at most ${MAX_CART_LINES} different items`);
      await tx.insert(cartItems).values({ sessionId, variantId: variant.id, quantity: input.quantity, addOns: input.addOns, cardMessage, deliveryDate });
    }
  });
  return getCart(sessionId);
}

export async function updateCartItem(sessionId: string, itemId: string, quantity: number) {
  // Ownership: the item must belong to this session; otherwise it simply "does not exist".
  const [row] = await db
    .select({ item: cartItems, stock: productVariants.stock })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .where(and(eq(cartItems.id, itemId), eq(cartItems.sessionId, sessionId)))
    .limit(1);
  if (!row) throw notFound("Cart item");
  if (row.stock !== null && quantity > row.stock) throw conflict(`Only ${row.stock} available`, { available: row.stock });
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  return getCart(sessionId);
}

export async function removeCartItem(sessionId: string, itemId: string) {
  const deleted = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.sessionId, sessionId)))
    .returning({ id: cartItems.id });
  if (deleted.length === 0) throw notFound("Cart item");
  return getCart(sessionId);
}

export async function clearCart(sessionId: string, conn: DB | Tx = db) {
  await conn.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
}

export const emptyCart = (): CartView => ({ items: [], count: 0, subtotalCents: 0, deliveryFeeCents: 0, totalCents: 0, currency: "usd" });
