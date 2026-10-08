import "server-only";
import { and, asc, desc, eq, ilike, inArray, isNotNull, or, sql, type SQL } from "drizzle-orm";
import type { z } from "zod";
import { site } from "@/config/site";
import { db } from "@/server/db/client";
import { orderEvents, orderItems, orders, type OrderStatus } from "@/server/db/schema";
import { AppError, notFound, unprocessable } from "@/server/http/errors";
import { stripe } from "@/server/stripe";
import type { orderListQuery, refundSchema } from "@/server/validation/admin";
import { audit } from "./audit";
import type { Actor } from "./admin-inventory";
import { adminNextStatuses, canAdminTransition, REFUNDABLE_STATUSES } from "./order-status";
import { recordOrderEvent, releasePendingOrder, syncCheckoutSession } from "./orders";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);
/** Calendar date of a timestamp in the studio's time zone. */
const localDate = (col: typeof orders.createdAt) => sql`(${col} AT TIME ZONE ${site.timeZone})::date`;

const SORTS = {
  created_desc: [desc(orders.createdAt)],
  created_asc: [asc(orders.createdAt)],
  delivery_asc: [asc(orders.deliveryDate), asc(orders.createdAt)],
  delivery_desc: [desc(orders.deliveryDate), desc(orders.createdAt)],
  total_desc: [desc(orders.totalCents)],
} as const;

export async function listOrders(q: z.infer<typeof orderListQuery>) {
  const f: (SQL | undefined)[] = [];
  if (q.status?.length) f.push(inArray(orders.status, q.status));
  if (q.createdFrom) f.push(sql`${localDate(orders.createdAt)} >= ${q.createdFrom}`);
  if (q.createdTo) f.push(sql`${localDate(orders.createdAt)} <= ${q.createdTo}`);
  if (q.deliveryFrom) f.push(sql`${orders.deliveryDate} >= ${q.deliveryFrom}`);
  if (q.deliveryTo) f.push(sql`${orders.deliveryDate} <= ${q.deliveryTo}`);
  if (q.needsReview) f.push(isNotNull(orders.reviewReason));
  if (q.q) {
    const like = `%${escapeLike(q.q)}%`;
    f.push(or(ilike(orders.number, like), ilike(orders.senderEmail, like), ilike(orders.senderName, like), ilike(orders.recipientName, like)));
  }
  const where = and(...f);

  const [rows, total] = await Promise.all([
    db
      .select({
        id: orders.id,
        number: orders.number,
        status: orders.status,
        totalCents: orders.totalCents,
        currency: orders.currency,
        amountRefundedCents: orders.amountRefundedCents,
        senderName: orders.senderName,
        senderEmail: orders.senderEmail,
        recipientName: orders.recipientName,
        city: orders.city,
        zip: orders.zip,
        deliveryDate: orders.deliveryDate,
        deliveryWindow: orders.deliveryWindow,
        reviewReason: orders.reviewReason,
        paidAt: orders.paidAt,
        createdAt: orders.createdAt,
        itemCount: sql<number>`(SELECT COALESCE(SUM(${orderItems.quantity}), 0)::int FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id})`,
      })
      .from(orders)
      .where(where)
      .orderBy(...SORTS[q.sort])
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db.$count(orders, where),
  ]);
  return { items: rows, page: q.page, pageSize: q.pageSize, total };
}

export async function getOrder(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw notFound("Order");
  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(asc(orderEvents.createdAt)),
  ]);
  // The guest session id is an internal link, not something staff need.
  return { ...order, sessionId: undefined, items, events, allowedNextStatuses: adminNextStatuses(order.status) };
}

export async function changeOrderStatus(id: string, to: OrderStatus, note: string | undefined, actor: Actor) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw notFound("Order");
  if (!canAdminTransition(order.status, to)) {
    throw unprocessable(`Cannot move an order from ${order.status} to ${to}`, { allowed: adminNextStatuses(order.status) });
  }

  if (order.status === "pending_payment" && to === "cancelled") {
    // Close the Stripe session first so the customer can no longer pay for a cancelled order.
    if (order.stripeCheckoutSessionId) {
      let session = await stripe().checkout.sessions.retrieve(order.stripeCheckoutSessionId);
      if (session.status === "open") session = await stripe().checkout.sessions.expire(session.id);
      if (session.status === "complete") {
        await syncCheckoutSession(session, "system");
        throw new AppError(409, "already_paid", "The customer has just paid for this order; refund it instead.");
      }
    }
    await db.transaction(async (tx) => {
      await releasePendingOrder(tx, id, "cancelled", actor.admin.id, note);
      await audit({ adminId: actor.admin.id, action: "order.cancel", entity: "order", entityId: id, meta: { note }, ip: actor.ip }, tx);
    });
    return getOrder(id);
  }

  await db.transaction(async (tx) => {
    // Optimistic guard: only apply if nobody changed the status since we read it.
    const res = await tx
      .update(orders)
      .set({ status: to })
      .where(and(eq(orders.id, id), eq(orders.status, order.status)))
      .returning({ id: orders.id });
    if (!res.length) throw new AppError(409, "stale", "This order was updated by someone else. Refresh and try again.");
    await recordOrderEvent(tx, id, order.status, to, actor.admin.id, note);
    await audit({ adminId: actor.admin.id, action: "order.status", entity: "order", entityId: id, meta: { from: order.status, to, note }, ip: actor.ip }, tx);
  });
  return getOrder(id);
}

export async function updateOrderNotes(id: string, internalNotes: string, actor: Actor) {
  const res = await db.update(orders).set({ internalNotes }).where(eq(orders.id, id)).returning({ id: orders.id });
  if (!res.length) throw notFound("Order");
  await audit({ adminId: actor.admin.id, action: "order.notes", entity: "order", entityId: id, ip: actor.ip });
  return getOrder(id);
}

export async function clearOrderReview(id: string, actor: Actor) {
  const res = await db.update(orders).set({ reviewReason: null }).where(eq(orders.id, id)).returning({ id: orders.id });
  if (!res.length) throw notFound("Order");
  await audit({ adminId: actor.admin.id, action: "order.review_cleared", entity: "order", entityId: id, ip: actor.ip });
  return getOrder(id);
}

/**
 * Issue a refund through Stripe. The order's status/amounts are updated when Stripe's
 * `charge.refunded` webhook arrives, so our records always mirror what Stripe actually did.
 */
export async function refundOrder(id: string, input: z.infer<typeof refundSchema>, actor: Actor) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw notFound("Order");
  if (!order.stripePaymentIntentId || order.amountPaidCents === null) throw unprocessable("This order has no captured payment");
  if (!(REFUNDABLE_STATUSES as readonly string[]).includes(order.status) && !order.reviewReason) {
    throw unprocessable(`Orders in status ${order.status} cannot be refunded`);
  }
  const refundable = order.amountPaidCents - order.amountRefundedCents;
  const amount = input.amountCents ?? refundable;
  if (amount <= 0 || amount > refundable) throw unprocessable(`Refund must be between 1 and ${refundable} cents`, { refundable });

  const refund = await stripe().refunds.create(
    {
      payment_intent: order.stripePaymentIntentId,
      amount,
      reason: input.reason,
      metadata: { orderId: order.id, orderNumber: order.number, adminId: actor.admin.id },
    },
    // Same order + same already-refunded amount + same amount = same refund, even if the request is retried.
    { idempotencyKey: `refund-${order.id}-${order.amountRefundedCents}-${amount}` },
  );
  await audit({ adminId: actor.admin.id, action: "order.refund", entity: "order", entityId: id, meta: { amount, reason: input.reason, note: input.note, refundId: refund.id }, ip: actor.ip });
  return { refundId: refund.id, status: refund.status, amountCents: refund.amount };
}
