import type { NextRequest } from "next/server";
import { safeEqual } from "@/server/auth/tokens";
import { env } from "@/server/env";
import { AppError } from "@/server/http/errors";
import { route } from "@/server/http/handler";
import { runMaintenance } from "@/server/services/maintenance";

/**
 * Scheduled housekeeping. Call with `Authorization: Bearer $CRON_SECRET`
 * (Vercel Cron sends this header automatically when CRON_SECRET is set).
 */
export const GET = route(async (req: NextRequest) => {
  const secret = env().CRON_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !safeEqual(given, secret)) throw new AppError(404, "not_found", "Not found");
  return runMaintenance();
});
