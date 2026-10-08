import "server-only";
import { eq } from "drizzle-orm";
import { getGuestSession } from "@/server/auth/guest-session";
import { db } from "@/server/db/client";
import { orderItems, orders } from "@/server/db/schema";
import { stripe } from "@/server/stripe";
import { syncCheckoutSession } from "./orders";

const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;

export type Confirmation =
  | { kind: "full"; order: typeof orders.$inferSelect; items: (typeof orderItems.$inferSelect)[] }
  /** The link was opened in a browser that did not place the order: show no personal data. */
  | { kind: "limited"; number: string; status: string }
  | null;

/**
 * Order details for the post-payment page, looked up by Stripe's session id. Personal details
 * are only returned to the browser session that placed the order.
 */
export async function getConfirmation(checkoutSessionId: string | undefined): Promise<Confirmation> {
  if (!checkoutSessionId || !SESSION_ID.test(checkoutSessionId)) return null;

  const load = async () => (await db.select().from(orders).where(eq(orders.stripeCheckoutSessionId, checkoutSessionId)).limit(1))[0];
  let order = await load();
  if (!order) return null;

  const guest = await getGuestSession();
  if (!guest || order.sessionId !== guest.id) return { kind: "limited", number: order.number, status: order.status };

  // The redirect can beat the webhook by a few seconds; ask Stripe directly so the customer sees the truth.
  if (order.status === "pending_payment") {
    try {
      await syncCheckoutSession(await stripe().checkout.sessions.retrieve(checkoutSessionId), "system");
      order = (await load()) ?? order;
    } catch (err) {
      console.warn("[confirmation] Stripe sync failed", (err as Error).message);
    }
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { kind: "full", order, items };
}
