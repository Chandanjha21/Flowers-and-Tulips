import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/server/db/client";
import { adminSessions, adminUsers, type AdminRole } from "@/server/db/schema";
import { isProd } from "@/server/env";
import { AppError, forbidden, unauthorized } from "@/server/http/errors";
import { limits, rateLimit, resetRateLimit } from "@/server/http/rate-limit";
import { clientIp } from "@/server/http/security";
import { audit } from "@/server/services/audit";
import { getDummyHash, verifyPassword } from "./password";
import { hashToken, looksLikeToken, newToken } from "./tokens";

const ABSOLUTE_TTL_MS = 12 * 60 * 60 * 1000; // 12 h
const IDLE_TTL_MS = 2 * 60 * 60 * 1000; // 2 h
const TOUCH_AFTER_MS = 60 * 1000;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export const adminCookieName = () => (isProd() ? "__Host-pb_admin" : "pb_admin");

export interface AdminPrincipal {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  sessionId: string;
}

const INVALID = () => new AppError(401, "invalid_credentials", "Email or password is incorrect");

export async function loginAdmin(req: NextRequest, email: string, password: string) {
  const ip = clientIp(req);
  const normalized = email.trim().toLowerCase();
  await rateLimit(limits.loginIp, ip);
  await rateLimit(limits.loginEmail, normalized);

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, normalized)).limit(1);

  if (!user) {
    await verifyPassword(await getDummyHash(), password); // keep timing equal
    throw INVALID();
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await verifyPassword(await getDummyHash(), password);
    // Same message: do not confirm the account exists or is locked.
    throw INVALID();
  }

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok || !user.active) {
    const failed = user.failedLogins + 1;
    await db
      .update(adminUsers)
      .set({
        failedLogins: failed >= MAX_FAILED_LOGINS ? 0 : failed,
        lockedUntil: failed >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_MS) : user.lockedUntil,
      })
      .where(eq(adminUsers.id, user.id));
    await audit({ adminId: user.id, action: failed >= MAX_FAILED_LOGINS ? "auth.locked" : "auth.login_failed", entity: "admin_user", entityId: user.id, ip });
    throw INVALID();
  }

  const token = newToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ABSOLUTE_TTL_MS);

  await db.transaction(async (tx) => {
    await tx.update(adminUsers).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: now }).where(eq(adminUsers.id, user.id));
    // Housekeeping: drop this admin's dead sessions.
    await tx.delete(adminSessions).where(and(eq(adminSessions.adminId, user.id), lt(adminSessions.expiresAt, now)));
    await tx.insert(adminSessions).values({
      tokenHash: hashToken(token),
      adminId: user.id,
      expiresAt,
      ip,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    });
    await audit({ adminId: user.id, action: "auth.login", entity: "admin_user", entityId: user.id, ip }, tx);
  });
  await resetRateLimit(limits.loginEmail, normalized);

  (await cookies()).set(adminCookieName(), token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Resolves the admin for this request or throws 401/403. Every admin route handler calls this. */
export async function requireAdmin(roles: AdminRole[] = ["owner", "staff"]): Promise<AdminPrincipal> {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!looksLikeToken(token)) throw unauthorized();

  const now = new Date();
  const [row] = await db
    .select({
      sessionId: adminSessions.id,
      sessionCreatedAt: adminSessions.createdAt,
      lastSeenAt: adminSessions.lastSeenAt,
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      active: adminUsers.active,
      passwordChangedAt: adminUsers.passwordChangedAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminId))
    .where(and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, now)))
    .limit(1);

  const idle = row && now.getTime() - row.lastSeenAt.getTime() > IDLE_TTL_MS;
  const stale = row && row.sessionCreatedAt < row.passwordChangedAt;
  if (!row || !row.active || idle || stale) {
    if (row) await db.delete(adminSessions).where(eq(adminSessions.id, row.sessionId));
    throw unauthorized("Session expired, please sign in again");
  }
  if (!roles.includes(row.role)) throw forbidden();

  if (now.getTime() - row.lastSeenAt.getTime() > TOUCH_AFTER_MS) {
    await db.update(adminSessions).set({ lastSeenAt: now }).where(eq(adminSessions.id, row.sessionId));
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role, sessionId: row.sessionId };
}

export async function logoutAdmin() {
  const jar = await cookies();
  const token = jar.get(adminCookieName())?.value;
  if (looksLikeToken(token)) {
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
  }
  jar.delete({ name: adminCookieName(), path: "/", secure: isProd(), httpOnly: true, sameSite: "strict" });
}

/** Kill every session for an admin (deactivation, role change, password reset). */
export async function revokeAllSessions(adminId: string) {
  await db.delete(adminSessions).where(eq(adminSessions.adminId, adminId));
}
