import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbEnv } from "@/server/env";
import * as schema from "./schema";

export type DB = NodePgDatabase<typeof schema>;
/** A transaction handle; same query API as `db`. */
export type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

// Reuse one pool across dev hot reloads.
const globalForDb = globalThis as unknown as { __pbPool?: Pool; __pbDb?: DB };

function create(): DB {
  const e = dbEnv();
  const pool =
    globalForDb.__pbPool ??
    new Pool({
      connectionString: e.DATABASE_URL,
      max: e.DATABASE_POOL_MAX,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      // Abort runaway queries instead of holding connections forever.
      statement_timeout: 15_000,
    });
  pool.on("error", (err) => console.error("[db] idle client error", err.message));
  globalForDb.__pbPool = pool;
  return drizzle(pool, { schema });
}

export function getDb(): DB {
  if (!globalForDb.__pbDb) globalForDb.__pbDb = create();
  return globalForDb.__pbDb;
}

/** Lazily-initialised database handle (no connection until first query). */
export const db: DB = new Proxy({} as DB, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});

export { schema };
