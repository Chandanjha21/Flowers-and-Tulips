import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { site } from "@/config/site";
import { db } from "@/server/db/client";
import { cartItems, orderItems, orders, productVariants } from "@/server/db/schema";
import { env } from "@/server/env";
import { AppError, conflict, unprocessable } from "@/server/http/errors";
import { stripe } from "@/server/stripe";
import type { CheckoutInput } from "@/lib/validation";
import { getCart } from "./cart";
import { checkDeliveryDate } from "./delivery";
import { newOrderNumber, recordOrderEvent, releasePendingOrder, syncCheckoutSession } from "./orders";

/** Stripe's minimum Checkout Session lifetime is 30 minutes. */
const CHECKOUT_TTL_SEC = 31 * 60;

/**
 * Before starting a new checkout, close any earlier open one from this browser so its reserved
 * stock comes back. If Stripe says it was actually paid, apply that instead.
 */
async function closeEarlierCheckouts(sessionId: string) {
  const pending = await db
    .select({ id: orders.id, stripeSessionId: orders.stripeCheckoutSessionId })
    .from(orders)
    .where(and(eq(orders.sessionId, sessionId), eq(orders.status, "pending_payment")));

  for (const o of pending) {
    if (!o.stripeSessionId) {
      await db.transaction((tx) => releasePendingOrder(tx, o.id, "cancelled", "system", "Superseded before Stripe session was created"));
      continue;
    }
    let session = await stripe().checkout.sessions.retrieve(o.stripeSessionId);
    if (session.status === "open") {
      try {
        session = await stripe().checkout.sessions.expire(o.stripeSessionId);
      } catch {
        // Completed between our retrieve and expire; fetch the final state.
        session = await stripe().checkout.sessions.retrieve(o.stripeSessionId);
      }
    }
    await syncCheckoutSession(session, "system");
  }
}

export async function createCheckout(sessionId: string, input: CheckoutInput): Promise<{ url: string; orderNumber: string }> {
  const dateCheck = checkDeliveryDate(input.delivery.date);
  if (!dateCheck.ok) throw unprocessable(dateCheck.reason, { field: "delivery.date" });

  await closeEarlierCheckouts(sessionId);

  // 1. Price, reserve stock and create the pending order atomically.
  const { order, cart } = await db.transaction(async (tx) => {
    const lines = await tx.select({ variantId: cartItems.variantId }).from(cartItems).where(eq(cartItems.sessionId, sessionId));
    if (lines.length === 0) throw unprocessable("Your bag is empty");

    // Lock the variant rows so two buyers cannot take the last stem at once.
    const variantIds = [...new Set(lines.map((l) => l.variantId))];
    await tx.select({ id: productVariants.id }).from(productVariants).where(inArray(productVariants.id, variantIds)).for("update");

    const cart = await getCart(sessionId, tx);
    const problems = cart.items.filter((i) => !i.available);
    if (problems.length) {
      throw conflict("Some items in your bag changed. Please review your bag.", problems.map((p) => ({ id: p.id, name: p.name, issue: p.issue })));
    }

    // Reserve tracked stock (aggregate by variant; the CHECK constraint is a second guard).
    const qtyByVariant = new Map<string, number>();
    for (const i of cart.items) qtyByVariant.set(i.variantId, (qtyByVariant.get(i.variantId) ?? 0) + i.quantity);
    const reserved = new Set<string>();
    for (const [variantId, qty] of qtyByVariant) {
      const res = await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} - ${qty}` })
        .where(and(eq(productVariants.id, variantId), sql`${productVariants.stock} IS NOT NULL`, sql`${productVariants.stock} >= ${qty}`))
        .returning({ id: productVariants.id });
      if (res.length) reserved.add(variantId);
      else {
        const [v] = await tx.select({ stock: productVariants.stock }).from(productVariants).where(eq(productVariants.id, variantId));
        if (v && v.stock !== null) throw conflict("An item in your bag just sold out. Please review your bag.");
      }
    }

    let number = newOrderNumber();
    for (let i = 0; i < 5; i++) {
      const [clash] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.number, number)).limit(1);
      if (!clash) break;
      number = newOrderNumber();
    }

    const [order] = await tx
      .insert(orders)
      .values({
        number,
        sessionId,
        status: "pending_payment",
        currency: site.currency,
        subtotalCents: cart.subtotalCents,
        deliveryFeeCents: cart.deliveryFeeCents,
        totalCents: cart.totalCents,
        recipientName: input.recipient.name,
        recipientPhone: input.recipient.phone,
        addressLine1: input.recipient.addressLine1,
        addressLine2: input.recipient.addressLine2 ?? null,
        city: input.recipient.city,
        zip: input.recipient.zip,
        deliveryDate: input.delivery.date,
        deliveryWindow: input.delivery.window ?? null,
        deliveryNotes: input.delivery.notes ?? null,
        giftMessage: input.giftMessage ?? null,
        senderName: input.sender.name,
        senderEmail: input.sender.email,
        senderPhone: input.sender.phone ?? null,
        expiresAt: new Date(Date.now() + CHECKOUT_TTL_SEC * 1000),
      })
      .returning();

    await tx.insert(orderItems).values(
      cart.items.map((i) => ({
        orderId: order!.id,
        productId: i.productId,
        variantId: i.variantId,
        productSlug: i.slug,
        productName: i.name,
        imageUrl: i.image?.src ?? null,
        size: i.size,
        unitPriceCents: i.unitPriceCents,
        addOns: i.addOns,
        cardMessage: i.cardMessage,
        quantity: i.quantity,
        lineTotalCents: i.lineTotalCents,
        reservedStock: reserved.has(i.variantId),
      })),
    );
    await recordOrderEvent(tx, order!.id, null, "pending_payment", "system", "Checkout started");
    return { order: order!, cart };
  });

  // 2. Create the Stripe Checkout Session outside the transaction (no row locks held over the network).
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: order.currency,
      unit_amount: i.unitPriceCents + i.addOns.reduce((s, a) => s + a.priceCents, 0),
      product_data: {
        name: `${i.name} (${i.size})`,
        ...(i.addOns.length ? { description: `With ${i.addOns.map((a) => a.name).join(", ")}` } : {}),
      },
    },
  }));
  if (order.deliveryFeeCents > 0) {
    lineItems.push({ quantity: 1, price_data: { currency: order.currency, unit_amount: order.deliveryFeeCents, product_data: { name: "Local delivery" } } });
  }
  const stripeTotal = lineItems.reduce((s, l) => s + (l.price_data!.unit_amount ?? 0) * (l.quantity ?? 1), 0);
  if (stripeTotal !== order.totalCents) {
    await db.transaction((tx) => releasePendingOrder(tx, order.id, "cancelled", "system", "Internal total mismatch"));
    throw new Error(`Checkout total mismatch for ${order.number}: ${stripeTotal} != ${order.totalCents}`);
  }

  const appUrl = env().APP_URL;
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: lineItems,
        customer_email: input.sender.email,
        client_reference_id: order.id,
        metadata: { orderId: order.id, orderNumber: order.number },
        payment_intent_data: {
          description: `${site.name} order ${order.number}`,
          metadata: { orderId: order.id, orderNumber: order.number },
        },
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_SEC,
        success_url: `${appUrl}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/checkout?canceled=1`,
      },
      { idempotencyKey: `checkout-${order.id}` },
    );
  } catch (err) {
    await db.transaction((tx) => releasePendingOrder(tx, order.id, "cancelled", "system", "Stripe session creation failed"));
    console.error(`[checkout] Stripe session creation failed for ${order.number}`, err);
    throw new AppError(502, "payment_provider_error", "We couldn't reach our payment provider. Please try again in a moment.");
  }

  await db.update(orders).set({ stripeCheckoutSessionId: session.id }).where(eq(orders.id, order.id));
  if (!session.url) throw new AppError(502, "payment_provider_error", "Payment page unavailable, please try again.");
  return { url: session.url, orderNumber: order.number };
}
