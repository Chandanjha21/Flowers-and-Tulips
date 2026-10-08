import "server-only";
import { randomInt } from "node:crypto";
import { and, eq, sql, type SQL } from "drizzle-orm";
import type Stripe from "stripe";
import { db, type Tx } from "@/server/db/client";
import { cartItems, orderEvents, orderItems, orders, productVariants, type OrderStatus } from "@/server/db/schema";

/*
 * Payment-driven order state changes. Each function expects to run inside a transaction and
 * locks the order row first, so concurrent webhook deliveries / confirmation-page syncs are safe.
 */

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I
/** Human-friendly, non-sequential (does not leak order volume). */
export const newOrderNumber = () => `PB-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

export async function recordOrderEvent(tx: Tx, orderId: string, from: OrderStatus | null, to: OrderStatus, actor: string, note?: string) {
  await tx.insert(orderEvents).values({ orderId, fromStatus: from, toStatus: to, actor, note: note ?? null });
}

async function lockOrder(tx: Tx, where: SQL | undefined) {
  const [order] = await tx.select().from(orders).where(where).for("update").limit(1);
  return order;
}

/** Return reserved stock to inventory exactly once. */
async function restock(tx: Tx, orderId: string) {
  const lines = await tx
    .select({ variantId: orderItems.variantId, quantity: orderItems.quantity })
    .from(orderItems)
    .where(and(eq(orderItems.orderId, orderId), eq(orderItems.reservedStock, true)));
  for (const l of lines) {
    if (!l.variantId) continue;
    await tx
      .update(productVariants)
      .set({ stock: sql`${productVariants.stock} + ${l.quantity}` })
      .where(and(eq(productVariants.id, l.variantId), sql`${productVariants.stock} IS NOT NULL`));
  }
  await tx.update(orders).set({ stockReleased: true }).where(eq(orders.id, orderId));
}

/** Cancel or expire a still-unpaid order and release its stock. No-op if it is no longer pending. */
export async function releasePendingOrder(tx: Tx, orderId: string, to: "expired" | "cancelled", actor: string, note?: string) {
  const order = await lockOrder(tx, eq(orders.id, orderId));
  if (!order || order.status !== "pending_payment") return false;
  await tx.update(orders).set({ status: to }).where(eq(orders.id, orderId));
  if (!order.stockReleased) await restock(tx, orderId);
  await recordOrderEvent(tx, orderId, order.status, to, actor, note);
  return true;
}

/** Apply a paid Checkout Session to its order. Cross-checks amount and currency. */
export async function markOrderPaid(tx: Tx, session: Stripe.Checkout.Session, actor: string) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return { ok: false as const, reason: "missing orderId metadata" };
  const order = await lockOrder(tx, and(eq(orders.id, orderId), eq(orders.stripeCheckoutSessionId, session.id)));
  if (!order) return { ok: false as const, reason: "order not found for session" };
  if (order.paidAt) return { ok: true as const, order, already: true };

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  const amount = session.amount_total ?? -1;
  const currency = (session.currency ?? "").toLowerCase();

  let reviewReason: string | null = null;
  if (amount !== order.totalCents || currency !== order.currency) {
    reviewReason = `Amount mismatch: charged ${amount} ${currency}, expected ${order.totalCents} ${order.currency}`;
  } else if (order.status !== "pending_payment") {
    // e.g. the order was cancelled by staff but the customer completed payment anyway.
    reviewReason = `Payment received while order was ${order.status}`;
  }

  const nextStatus: OrderStatus = reviewReason ? order.status : "paid";
  await tx
    .update(orders)
    .set({
      status: nextStatus,
      paidAt: new Date(),
      amountPaidCents: amount,
      stripePaymentIntentId: paymentIntentId,
      reviewReason,
    })
    .where(eq(orders.id, order.id));
  await recordOrderEvent(tx, order.id, order.status, nextStatus, actor, reviewReason ?? "Payment confirmed by Stripe");
  if (reviewReason) console.error(`[orders] ${order.number} flagged for review: ${reviewReason}`);

  // The bag has been bought; empty it.
  if (order.sessionId) await tx.delete(cartItems).where(eq(cartItems.sessionId, order.sessionId));
  return { ok: true as const, order: { ...order, status: nextStatus }, already: false };
}

/** Record a (partial or full) refund reported by Stripe. */
export async function applyRefund(tx: Tx, paymentIntentId: string, amountRefundedCents: number, actor: string) {
  const order = await lockOrder(tx, eq(orders.stripePaymentIntentId, paymentIntentId));
  if (!order) return false;
  const full = order.amountPaidCents !== null && amountRefundedCents >= order.amountPaidCents;
  const next: OrderStatus = full ? "refunded" : order.status;
  await tx.update(orders).set({ amountRefundedCents, status: next }).where(eq(orders.id, order.id));
  await recordOrderEvent(tx, order.id, order.status, next, actor, `Refunded ${amountRefundedCents} cents${full ? " (full)" : " (partial)"}`);
  return true;
}

/**
 * Reconcile our order with the live Checkout Session. Used by the confirmation page (so the
 * customer sees "paid" even if the webhook is a few seconds behind) and by the maintenance job.
 */
export async function syncCheckoutSession(session: Stripe.Checkout.Session, actor: string) {
  return db.transaction(async (tx) => {
    if (session.status === "complete" && session.payment_status === "paid") {
      return (await markOrderPaid(tx, session, actor)).ok;
    }
    if (session.status === "expired" && session.metadata?.orderId) {
      return releasePendingOrder(tx, session.metadata.orderId, "expired", actor, "Checkout session expired");
    }
    return false;
  });
}
