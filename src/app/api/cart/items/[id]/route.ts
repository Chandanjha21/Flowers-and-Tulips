import { z } from "zod";
import { cartUpdateSchema } from "@/lib/validation";
import { getGuestSession } from "@/server/auth/guest-session";
import { notFound } from "@/server/http/errors";
import { parse, route } from "@/server/http/handler";
import { limits, rateLimit } from "@/server/http/rate-limit";
import { readJson } from "@/server/http/security";
import { removeCartItem, updateCartItem } from "@/server/services/cart";

const params = z.object({ id: z.uuid() });

async function requireSession() {
  const session = await getGuestSession();
  if (!session) throw notFound("Cart item");
  await rateLimit(limits.cartWrite, session.id);
  return session;
}

export const PATCH = route<{ id: string }>(async (req, ctx) => {
  const { id } = parse(params, ctx.params);
  const { quantity } = parse(cartUpdateSchema, await readJson(req));
  const session = await requireSession();
  return updateCartItem(session.id, id, quantity);
});

export const DELETE = route<{ id: string }>(async (_req, ctx) => {
  const { id } = parse(params, ctx.params);
  const session = await requireSession();
  return removeCartItem(session.id, id);
});
