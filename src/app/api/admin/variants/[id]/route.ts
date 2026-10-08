import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { updateVariant } from "@/server/services/admin-inventory";
import { uuidParam, variantUpdateSchema } from "@/server/validation/admin";

/**
 * Update one size: price, note, active, and stock.
 * Stock: `{ "stock": { "set": 40 } }`, `{ "stock": { "set": null } }` (made to order) or `{ "stock": { "adjust": -3 } }`.
 */
export const PATCH = adminRoute<{ id: string }>(ANY_ADMIN, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  return updateVariant(id, parse(variantUpdateSchema, await readJson(req)), actor);
});
