import { route } from "@/server/http/handler";
import { handleStripeEvent, verifyStripeEvent } from "@/server/services/stripe-webhook";

/**
 * Stripe webhook. Authenticated by signature (not cookies), so the same-origin check is off.
 * Must read the raw body: re-serialised JSON would not match the signature.
 */
export const POST = route(
  async (req) => {
    const raw = await req.text();
    if (raw.length > 1_000_000) return Response.json({ error: { code: "payload_too_large" } }, { status: 413 });
    const event = verifyStripeEvent(raw, req.headers.get("stripe-signature"));
    const result = await handleStripeEvent(event);
    return { received: true, result };
  },
  { csrf: false },
);
