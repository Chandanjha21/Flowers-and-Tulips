import "server-only";
import type Stripe from "stripe";
import { db } from "@/server/db/client";
import { stripeEvents } from "@/server/db/schema";
import { env } from "@/server/env";
import { AppError } from "@/server/http/errors";
import { stripe } from "@/server/stripe";
import { applyRefund, markOrderPaid, releasePendingOrder } from "./orders";

/** Verify the signature against the raw body. Throws 400 on any failure (Stripe will retry). */
export function verifyStripeEvent(rawBody: string, signature: string | null): Stripe.Event {
  if (!signature) throw new AppError(400, "missing_signature", "Missing Stripe-Signature header");
  try {
    return stripe().webhooks.constructEvent(rawBody, signature, env().STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new AppError(400, "invalid_signature", "Invalid signature");
  }
}

/**
 * Process an event exactly once. The event id is recorded in the same transaction as the
 * state change, so a crash rolls both back and Stripe's retry processes it again.
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<"processed" | "duplicate" | "ignored"> {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(stripeEvents)
      .values({ id: event.id, type: event.type })
      .onConflictDoNothing()
      .returning({ id: stripeEvents.id });
    if (inserted.length === 0) return "duplicate";

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        // Delayed methods (e.g. bank debits) complete as "unpaid"; we wait for async_payment_succeeded.
        if (session.payment_status !== "paid") return "ignored";
        const res = await markOrderPaid(tx, session, "stripe");
        if (!res.ok) console.warn(`[stripe] ${event.id}: ${res.reason}`);
        return "processed";
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (!orderId) return "ignored";
        const to = event.type === "checkout.session.expired" ? "expired" : "cancelled";
        await releasePendingOrder(tx, orderId, to, "stripe", event.type);
        return "processed";
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (!pi) return "ignored";
        await applyRefund(tx, pi, charge.amount_refunded, "stripe");
        return "processed";
      }
      default:
        return "ignored";
    }
  });
}
