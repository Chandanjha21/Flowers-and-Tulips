import { z } from "zod";
import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { updateAddOn } from "@/server/services/admin-inventory";
import { addOnUpdateSchema } from "@/server/validation/admin";

const params = z.object({ id: z.string().regex(/^[a-z0-9-]{1,40}$/) });

/** Update an add-on. Set `active: false` to retire it (kept for order history). */
export const PATCH = adminRoute<{ id: string }>(ANY_ADMIN, async (req, ctx) => {
  const { id } = parse(params, ctx.params);
  return updateAddOn(id, parse(addOnUpdateSchema, await readJson(req)), ctx.actor);
});
