import { ANY_ADMIN, adminRoute } from "@/server/http/admin";

export const GET = adminRoute(ANY_ADMIN, async (_req, { actor }) => {
  const { id, email, name, role } = actor.admin;
  return { id, email, name, role };
});
