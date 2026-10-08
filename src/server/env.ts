import "server-only";
import { z } from "zod";

/**
 * Server environment, validated once on first use. Lazy so `next build` does not need
 * production secrets; any request that touches the backend fails fast if one is missing.
 */
const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.url(),
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
    /** Public origin of the site, e.g. https://flowersandtulips.com (no trailing slash). */
    APP_URL: z.url().transform((v) => v.replace(/\/+$/, "")),
    STRIPE_SECRET_KEY: z.string().regex(/^(sk|rk)_(test|live)_/, "must be a Stripe secret or restricted key"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    STORAGE_DRIVER: z.enum(["local", "vercel-blob"]).default("local"),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    /** Shared secret for /api/cron/maintenance (min 32 chars). Leave unset to disable the endpoint. */
    CRON_SECRET: z.string().min(32).optional(),
    /** Set to "1" only when running behind a proxy that overwrites X-Forwarded-For (Vercel, a configured load balancer). */
    TRUST_PROXY: z.enum(["0", "1"]).default("1"),
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER === "vercel-blob" && !env.BLOB_READ_WRITE_TOKEN) {
      ctx.addIssue({ code: "custom", path: ["BLOB_READ_WRITE_TOKEN"], message: "required when STORAGE_DRIVER=vercel-blob" });
    }
    if (env.NODE_ENV === "production" && env.STRIPE_SECRET_KEY.includes("_test_") && process.env.ALLOW_STRIPE_TEST_IN_PROD !== "1") {
      ctx.addIssue({ code: "custom", path: ["STRIPE_SECRET_KEY"], message: "test key used in production (set ALLOW_STRIPE_TEST_IN_PROD=1 for staging)" });
    }
    if (env.NODE_ENV === "production" && !env.APP_URL.startsWith("https://")) {
      ctx.addIssue({ code: "custom", path: ["APP_URL"], message: "must be https in production" });
    }
  });

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Only names and reasons, never values.
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid server environment: ${problems}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProd = () => process.env.NODE_ENV === "production";

const dbSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * Just the database settings. Catalog pages are prerendered at build time and only need these,
 * so builds do not require payment secrets.
 */
export function dbEnv() {
  const parsed = dbSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid server environment: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  return parsed.data;
}
