import { OWNER, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { refundOrder } from "@/server/services/admin-orders";
import { refundSchema, uuidParam } from "@/server/validation/admin";

/**
 * Owner only: refund through Stripe (full by default, or `amountCents` for partial).
 * The order flips to `refunded` when Stripe confirms via webhook.
 */
export const POST = adminRoute<{ id: string }>(OWNER, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  return refundOrder(id, parse(refundSchema, await readJson(req)), actor);
});
