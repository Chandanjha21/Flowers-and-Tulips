import "server-only";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/server/auth/admin-session";
import type { AdminRole } from "@/server/db/schema";
import type { Actor } from "@/server/services/admin-inventory";
import { route, type HandlerContext } from "./handler";
import { limits, rateLimit } from "./rate-limit";
import { clientIp } from "./security";

type Params = Record<string, string | string[]>;

/** Route handler that requires an admin session (and optionally a role) before running. */
export function adminRoute<P extends Params = Params>(
  roles: AdminRole[],
  fn: (req: NextRequest, ctx: HandlerContext<P> & { actor: Actor }) => Promise<Response | unknown>,
) {
  return route<P>(async (req, ctx) => {
    const admin = await requireAdmin(roles);
    if (req.method !== "GET" && req.method !== "HEAD") await rateLimit(limits.adminWrite, admin.id);
    return fn(req, { ...ctx, actor: { admin, ip: clientIp(req) } });
  });
}

export const ANY_ADMIN: AdminRole[] = ["owner", "staff"];
export const OWNER: AdminRole[] = ["owner"];
