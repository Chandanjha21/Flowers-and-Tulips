import { OWNER, adminRoute } from "@/server/http/admin";
import { json, parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { createAdmin, listAdmins } from "@/server/services/admin-users";
import { adminCreateSchema } from "@/server/validation/admin";

export const GET = adminRoute(OWNER, async () => listAdmins());

export const POST = adminRoute(OWNER, async (req, { actor }) => {
  const input = parse(adminCreateSchema, await readJson(req, 4 * 1024));
  return json(await createAdmin(input, actor), { status: 201 });
});
