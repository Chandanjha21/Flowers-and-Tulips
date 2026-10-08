import { OWNER, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { updateAdmin } from "@/server/services/admin-users";
import { adminUpdateSchema, uuidParam } from "@/server/validation/admin";

/** Owner: rename, change role, (de)activate or reset password. Role/password/deactivation revoke that admin's sessions. */
export const PATCH = adminRoute<{ id: string }>(OWNER, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  return updateAdmin(id, parse(adminUpdateSchema, await readJson(req, 4 * 1024)), actor);
});
