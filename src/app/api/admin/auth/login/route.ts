import { loginAdmin } from "@/server/auth/admin-session";
import { parse, route } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { loginSchema } from "@/server/validation/admin";

/** Email + password sign-in. Sets an httpOnly, SameSite=Strict session cookie. */
export const POST = route(async (req) => {
  const { email, password } = parse(loginSchema, await readJson(req, 4 * 1024));
  return loginAdmin(req, email, password);
});
