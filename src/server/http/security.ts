import "server-only";
import type { NextRequest } from "next/server";
import { env } from "@/server/env";
import { AppError, badRequest } from "./errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * CSRF defence for cookie-authenticated endpoints.
 * Browsers always send `Origin` on cross-site POST/PATCH/DELETE; we require it to match our own origin.
 * `Sec-Fetch-Site` is checked as a second signal when present.
 */
export function assertSameOrigin(req: NextRequest) {
  if (SAFE_METHODS.has(req.method)) return;
  const allowed = new Set([env().APP_URL, req.nextUrl.origin]);
  const origin = req.headers.get("origin");
  if (!origin || !allowed.has(origin)) {
    throw new AppError(403, "bad_origin", "Cross-origin request blocked");
  }
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") {
    throw new AppError(403, "bad_origin", "Cross-origin request blocked");
  }
}

/** Best-effort client IP for rate limiting and audit logs. */
export function clientIp(req: NextRequest): string {
  if (env().TRUST_PROXY === "1") {
    const real = req.headers.get("x-real-ip");
    if (real) return real.trim();
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0]!.trim();
  }
  return "unknown";
}

/** Parse a JSON body with a hard size cap and a JSON content type (forces a CORS preflight cross-site). */
export async function readJson(req: NextRequest, maxBytes = 32 * 1024): Promise<unknown> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().startsWith("application/json")) {
    throw new AppError(415, "unsupported_media_type", "Expected application/json");
  }
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new AppError(413, "payload_too_large", "Request body too large");
  const text = await req.text();
  if (Buffer.byteLength(text) > maxBytes) throw new AppError(413, "payload_too_large", "Request body too large");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw badRequest("Malformed JSON");
  }
}
