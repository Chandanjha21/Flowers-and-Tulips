import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { changeOrderStatus } from "@/server/services/admin-orders";
import { orderStatusSchema, uuidParam } from "@/server/validation/admin";

/** Move an order along its fulfilment flow, e.g. `{ "status": "in_design" }`. */
export const PATCH = adminRoute<{ id: string }>(ANY_ADMIN, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  const { status, note } = parse(orderStatusSchema, await readJson(req));
  return changeOrderStatus(id, status, note, actor);
});
