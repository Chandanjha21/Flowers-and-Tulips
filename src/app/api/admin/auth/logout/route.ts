import { logoutAdmin } from "@/server/auth/admin-session";
import { route } from "@/server/http/handler";

export const POST = route(async () => {
  await logoutAdmin();
  return { signedOut: true };
});
