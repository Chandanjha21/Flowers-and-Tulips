import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { updateOrderNotes } from "@/server/services/admin-orders";
import { orderNotesSchema, uuidParam } from "@/server/validation/admin";

/** Staff-only notes on an order (never shown to the customer). */
export const PUT = adminRoute<{ id: string }>(ANY_ADMIN, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  return updateOrderNotes(id, parse(orderNotesSchema, await readJson(req)).internalNotes, actor);
});
