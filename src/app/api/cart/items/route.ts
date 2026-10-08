import { cartAddSchema } from "@/lib/validation";
import { getOrCreateGuestSession } from "@/server/auth/guest-session";
import { json, parse, route } from "@/server/http/handler";
import { limits, rateLimit } from "@/server/http/rate-limit";
import { readJson } from "@/server/http/security";
import { addCartItem } from "@/server/services/cart";

/** Add a product to the bag. Creates the anonymous session cookie on first use. */
export const POST = route(async (req) => {
  const input = parse(cartAddSchema, await readJson(req));
  const session = await getOrCreateGuestSession(req);
  await rateLimit(limits.cartWrite, session.id);
  return json(await addCartItem(session.id, input), { status: 201 });
});
