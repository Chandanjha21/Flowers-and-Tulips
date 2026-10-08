import "server-only";
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { AppError, badRequest } from "./errors";
import { assertSameOrigin } from "./security";

type Params = Record<string, string | string[]>;

export interface HandlerContext<P extends Params> {
  params: P;
  requestId: string;
}

interface Options {
  /** Enforce same-origin on unsafe methods (default true). Only the Stripe webhook turns this off. */
  csrf?: boolean;
}

const baseHeaders = (requestId: string) => ({
  "Cache-Control": "no-store, max-age=0",
  "X-Request-Id": requestId,
});

export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json({ data }, init);
}

function errorResponse(err: unknown, requestId: string): Response {
  const headers = baseHeaders(requestId);
  if (err instanceof AppError) {
    const extra: Record<string, string> = {};
    if (err.status === 429 && err.details && typeof err.details === "object" && "retryAfter" in err.details) {
      extra["Retry-After"] = String((err.details as { retryAfter: number }).retryAfter);
    }
    return Response.json(
      { error: { code: err.code, message: err.message, ...(err.details !== undefined ? { details: err.details } : {}) } },
      { status: err.status, headers: { ...headers, ...extra } },
    );
  }
  // Postgres unique violation that slipped past service-level checks.
  const pgCode = (err as { code?: string; cause?: { code?: string } })?.code ?? (err as { cause?: { code?: string } })?.cause?.code;
  if (pgCode === "23505") {
    return Response.json({ error: { code: "conflict", message: "A record with these values already exists" } }, { status: 409, headers });
  }
  console.error(`[api] ${requestId} unhandled error`, err);
  return Response.json(
    { error: { code: "internal_error", message: "Something went wrong. Please try again.", requestId } },
    { status: 500, headers },
  );
}

/**
 * Wraps a route handler with: request id, CSRF check, consistent JSON envelope,
 * safe error mapping (no stack traces or SQL reach the client) and no-store caching.
 */
export function route<P extends Params = Params>(
  fn: (req: NextRequest, ctx: HandlerContext<P>) => Promise<Response | unknown>,
  options: Options = {},
) {
  return async (req: NextRequest, ctx: { params: Promise<P> }): Promise<Response> => {
    const requestId = randomUUID();
    try {
      if (options.csrf !== false) assertSameOrigin(req);
      const params = ((await ctx?.params) ?? {}) as P;
      const result = await fn(req, { params, requestId });
      const res = result instanceof Response ? result : json(result);
      for (const [k, v] of Object.entries(baseHeaders(requestId))) if (!res.headers.has(k)) res.headers.set(k, v);
      return res;
    } catch (err) {
      return errorResponse(err, requestId);
    }
  };
}

/** Validate input with a zod schema, turning failures into a 400 with field-level details. */
export function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw badRequest(
      "Invalid input",
      result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }
  return result.data;
}

/** URLSearchParams to a plain object for zod (repeated keys become arrays). */
export function queryObject(req: NextRequest): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(req.nextUrl.searchParams.keys())) {
    const all = req.nextUrl.searchParams.getAll(key);
    out[key] = all.length > 1 ? all : all[0]!;
  }
  return out;
}
