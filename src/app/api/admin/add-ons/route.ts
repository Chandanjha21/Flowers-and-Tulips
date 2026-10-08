import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { json, parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { createAddOn, listAddOns } from "@/server/services/admin-inventory";
import { addOnCreateSchema } from "@/server/validation/admin";

export const GET = adminRoute(ANY_ADMIN, async () => listAddOns());

export const POST = adminRoute(ANY_ADMIN, async (req, { actor }) => {
  const input = parse(addOnCreateSchema, await readJson(req));
  return json(await createAddOn(input, actor), { status: 201 });
});
