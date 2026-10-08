import { logoutAdmin } from "@/server/auth/admin-session";
import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { changeOwnPassword } from "@/server/services/admin-users";
import { changeOwnPasswordSchema } from "@/server/validation/admin";

/** Change your own password. Signs you out of every session, including this one. */
export const POST = adminRoute(ANY_ADMIN, async (req, { actor }) => {
  const { currentPassword, newPassword } = parse(changeOwnPasswordSchema, await readJson(req, 4 * 1024));
  await changeOwnPassword(actor, currentPassword, newPassword);
  await logoutAdmin();
  return { changed: true };
});
