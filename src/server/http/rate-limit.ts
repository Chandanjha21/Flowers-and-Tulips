import "server-only";
import { eq, lt, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";
import { tooManyRequests } from "./errors";

export interface Limit {
  /** Bucket name, e.g. "login-ip". */
  name: string;
  max: number;
  windowSec: number;
}

export const limits = {
  loginIp: { name: "login-ip", max: 20, windowSec: 15 * 60 },
  loginEmail: { name: "login-email", max: 8, windowSec: 15 * 60 },
  cartWrite: { name: "cart-write", max: 120, windowSec: 60 },
  sessionCreate: { name: "session-create", max: 30, windowSec: 60 * 60 },
  checkout: { name: "checkout", max: 10, windowSec: 10 * 60 },
  upload: { name: "upload", max: 60, windowSec: 60 * 60 },
  adminWrite: { name: "admin-write", max: 300, windowSec: 60 },
} satisfies Record<string, Limit>;

/**
 * Fixed-window counter in Postgres. Shared across all server instances, so it holds up on
 * serverless where in-memory counters do not. Throws 429 when the limit is exceeded.
 */
export async function rateLimit(limit: Limit, identifier: string) {
  const now = Date.now();
  const windowStart = Math.floor(now / (limit.windowSec * 1000)) * limit.windowSec * 1000;
  const key = `${limit.name}:${identifier}:${windowStart}`;
  const expiresAt = new Date(windowStart + limit.windowSec * 1000);

  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, expiresAt })
    .onConflictDoUpdate({ target: rateLimits.key, set: { count: sql`${rateLimits.count} + 1` } })
    .returning({ count: rateLimits.count });

  // Opportunistic cleanup of expired windows (~1% of calls).
  if (Math.random() < 0.01) {
    void db.delete(rateLimits).where(lt(rateLimits.expiresAt, new Date())).catch(() => {});
  }

  if (row && row.count > limit.max) {
    throw tooManyRequests(Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)));
  }
}

/** Reset a bucket, e.g. the per-email login counter after a successful login. */
export async function resetRateLimit(limit: Limit, identifier: string) {
  const windowStart = Math.floor(Date.now() / (limit.windowSec * 1000)) * limit.windowSec * 1000;
  await db.delete(rateLimits).where(eq(rateLimits.key, `${limit.name}:${identifier}:${windowStart}`));
}
