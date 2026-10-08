import { checkoutSchema } from "@/lib/validation";
import { getGuestSession } from "@/server/auth/guest-session";
import { unprocessable } from "@/server/http/errors";
import { parse, route } from "@/server/http/handler";
import { limits, rateLimit } from "@/server/http/rate-limit";
import { clientIp, readJson } from "@/server/http/security";
import { createCheckout } from "@/server/services/checkout";

/**
 * Turn the bag into a pending order and a Stripe Checkout Session.
 * Returns the Stripe-hosted payment URL; the browser redirects there. No card data touches us.
 */
export const POST = route(async (req) => {
  const input = parse(checkoutSchema, await readJson(req));
  const session = await getGuestSession();
  if (!session) throw unprocessable("Your bag is empty");
  await rateLimit(limits.checkout, session.id);
  await rateLimit(limits.checkout, `ip:${clientIp(req)}`);
  return createCheckout(session.id, input);
});
