import "server-only";
import type { DB, Tx } from "@/server/db/client";
import { db as defaultDb } from "@/server/db/client";
import { auditLogs } from "@/server/db/schema";

export interface AuditEntry {
  adminId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
  ip?: string | null;
}

/** Append-only record of every admin mutation. Pass a transaction to commit it atomically with the change. */
export async function audit(entry: AuditEntry, tx: DB | Tx = defaultDb) {
  await tx.insert(auditLogs).values({
    adminId: entry.adminId,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    meta: entry.meta ?? null,
    ip: entry.ip ?? null,
  });
}
