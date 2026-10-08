import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "@/server/db/client";
import { guestSessions } from "@/server/db/schema";
import { isProd } from "@/server/env";
import { limits, rateLimit } from "@/server/http/rate-limit";
import { clientIp } from "@/server/http/security";
import { hashToken, looksLikeToken, newToken } from "./tokens";

/*
 * Anonymous shopper session. Customers never log in; this opaque cookie ties a browser to
 * its cart and its orders (so the confirmation page can show PII only to the buyer).
 */

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, sliding
const TOUCH_AFTER_MS = 24 * 60 * 60 * 1000; // extend at most once a day

export const guestCookieName = () => (isProd() ? "__Host-pb_sid" : "pb_sid");

export interface GuestSession {
  id: string;
}

async function setCookie(token: string, expires: Date) {
  (await cookies()).set(guestCookieName(), token, {
    httpOnly: true,
    secure: isProd(),
    // Lax so the cookie is sent on the top-level redirect back from Stripe Checkout.
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** The current guest session, or null. Never creates one (safe to call from GET handlers and pages). */
export async function getGuestSession(): Promise<GuestSession | null> {
  const token = (await cookies()).get(guestCookieName())?.value;
  if (!looksLikeToken(token)) return null;

  const now = new Date();
  const [row] = await db
    .select({ id: guestSessions.id, lastSeenAt: guestSessions.lastSeenAt })
    .from(guestSessions)
    .where(and(eq(guestSessions.tokenHash, hashToken(token)), gt(guestSessions.expiresAt, now)))
    .limit(1);
  if (!row) return null;

  if (now.getTime() - row.lastSeenAt.getTime() > TOUCH_AFTER_MS) {
    const expiresAt = new Date(now.getTime() + TTL_MS);
    await db.update(guestSessions).set({ lastSeenAt: now, expiresAt }).where(eq(guestSessions.id, row.id));
    try {
      await setCookie(token, expiresAt);
    } catch {
      // Cookies are read-only while rendering a page; the DB expiry is what matters.
    }
  }
  return { id: row.id };
}

/** Returns the current guest session, creating one (and its cookie) if needed. Mutating requests only. */
export async function getOrCreateGuestSession(req: NextRequest): Promise<GuestSession> {
  const existing = await getGuestSession();
  if (existing) return existing;

  await rateLimit(limits.sessionCreate, clientIp(req));
  const token = newToken();
  const expiresAt = new Date(Date.now() + TTL_MS);
  const [row] = await db.insert(guestSessions).values({ tokenHash: hashToken(token), expiresAt }).returning({ id: guestSessions.id });
  await setCookie(token, expiresAt);
  return { id: row!.id };
}
