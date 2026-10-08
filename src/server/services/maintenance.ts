import "server-only";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminSessions, guestSessions, orders, rateLimits, stripeEvents } from "@/server/db/schema";
import { stripe } from "@/server/stripe";
import { releasePendingOrder, syncCheckoutSession } from "./orders";

const MIN = 60_000;

/**
 * Periodic housekeeping (run every 15 min or so):
 * - reconcile checkouts whose `expired` webhook never arrived, so reserved stock is not stuck
 * - purge expired sessions, rate-limit windows and old webhook ids
 */
export async function runMaintenance() {
  const now = Date.now();
  const stale = await db
    .select({ id: orders.id, stripeSessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.status, "pending_payment"), isNull(orders.reviewReason), lt(orders.expiresAt, new Date(now - 10 * MIN))))
    .limit(50);

  let reconciled = 0;
  for (const o of stale) {
    try {
      if (!o.stripeSessionId) {
        if (await db.transaction((tx) => releasePendingOrder(tx, o.id, "cancelled", "system", "No Stripe session"))) reconciled++;
        continue;
      }
      let session = await stripe().checkout.sessions.retrieve(o.stripeSessionId);
      if (session.status === "open") session = await stripe().checkout.sessions.expire(session.id);
      if (await syncCheckoutSession(session, "system")) reconciled++;
    } catch (err) {
      console.error(`[maintenance] could not reconcile order ${o.id}`, (err as Error).message);
    }
  }

  const nowDate = new Date(now);
  const [guests, admins, limits, events] = await Promise.all([
    db.delete(guestSessions).where(lt(guestSessions.expiresAt, nowDate)).returning({ id: guestSessions.id }),
    db
      .delete(adminSessions)
      .where(or(lt(adminSessions.expiresAt, nowDate), lt(adminSessions.lastSeenAt, new Date(now - 2 * 60 * MIN))))
      .returning({ id: adminSessions.id }),
    db.delete(rateLimits).where(lt(rateLimits.expiresAt, nowDate)).returning({ key: rateLimits.key }),
    db.delete(stripeEvents).where(lt(stripeEvents.processedAt, new Date(now - 30 * 24 * 60 * MIN))).returning({ id: stripeEvents.id }),
  ]);

  return {
    reconciledOrders: reconciled,
    purged: { guestSessions: guests.length, adminSessions: admins.length, rateLimits: limits.length, stripeEvents: events.length },
  };
}
