import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** 256-bit random, URL-safe. Used for session cookies. */
export const newToken = () => randomBytes(32).toString("base64url");

/** We store only this hash, so a database leak cannot be replayed as live sessions. */
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Basic sanity check before we bother hashing a cookie value. */
export const looksLikeToken = (v: string | undefined): v is string => !!v && /^[A-Za-z0-9_-]{43}$/.test(v);
