import { getGuestSession } from "@/server/auth/guest-session";
import { route } from "@/server/http/handler";
import { clearCart, emptyCart, getCart } from "@/server/services/cart";

/** Current bag, re-priced from the database. Never creates a session. */
export const GET = route(async () => {
  const session = await getGuestSession();
  return session ? getCart(session.id) : emptyCart();
});

/** Empty the bag. */
export const DELETE = route(async () => {
  const session = await getGuestSession();
  if (session) await clearCart(session.id);
  return emptyCart();
});
