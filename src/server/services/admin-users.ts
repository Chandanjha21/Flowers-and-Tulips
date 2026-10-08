import "server-only";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/server/db/client";
import { adminUsers, auditLogs } from "@/server/db/schema";
import { revokeAllSessions } from "@/server/auth/admin-session";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { AppError, conflict, notFound, unprocessable } from "@/server/http/errors";
import type { adminCreateSchema, adminUpdateSchema, auditListQuery } from "@/server/validation/admin";
import { audit } from "./audit";
import type { Actor } from "./admin-inventory";

// Never select password hashes into API responses.
const publicCols = {
  id: adminUsers.id,
  email: adminUsers.email,
  name: adminUsers.name,
  role: adminUsers.role,
  active: adminUsers.active,
  lastLoginAt: adminUsers.lastLoginAt,
  lockedUntil: adminUsers.lockedUntil,
  createdAt: adminUsers.createdAt,
};

export const listAdmins = () => db.select(publicCols).from(adminUsers).orderBy(asc(adminUsers.createdAt));

export async function createAdmin(input: z.infer<typeof adminCreateSchema>, actor: Actor) {
  const [exists] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, input.email)).limit(1);
  if (exists) throw conflict("An admin with this email already exists", { field: "email" });
  const [row] = await db
    .insert(adminUsers)
    .values({ email: input.email, name: input.name, role: input.role, passwordHash: await hashPassword(input.password) })
    .returning(publicCols);
  await audit({ adminId: actor.admin.id, action: "admin.create", entity: "admin_user", entityId: row!.id, meta: { email: input.email, role: input.role }, ip: actor.ip });
  return row!;
}

/** At least one active owner must always remain, or nobody could manage staff again. */
async function assertAnotherOwner(exceptId: string) {
  const n = await db.$count(adminUsers, and(eq(adminUsers.role, "owner"), eq(adminUsers.active, true), ne(adminUsers.id, exceptId)));
  if (n === 0) throw unprocessable("There must be at least one active owner");
}

export async function updateAdmin(id: string, input: z.infer<typeof adminUpdateSchema>, actor: Actor) {
  const [target] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!target) throw notFound("Admin");
  const demoting = target.role === "owner" && input.role === "staff";
  const deactivating = target.active && input.active === false;
  if (target.role === "owner" && (demoting || deactivating)) await assertAnotherOwner(id);

  const [row] = await db
    .update(adminUsers)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.active !== undefined ? { active: input.active, ...(input.active ? { failedLogins: 0, lockedUntil: null } : {}) } : {}),
      ...(input.password ? { passwordHash: await hashPassword(input.password), passwordChangedAt: new Date() } : {}),
    })
    .where(eq(adminUsers.id, id))
    .returning(publicCols);

  // Any security-relevant change logs the user out everywhere.
  if (input.password || input.role !== undefined || input.active === false) await revokeAllSessions(id);
  await audit({
    adminId: actor.admin.id,
    action: "admin.update",
    entity: "admin_user",
    entityId: id,
    meta: { name: input.name, role: input.role, active: input.active, passwordReset: !!input.password },
    ip: actor.ip,
  });
  return row!;
}

export async function changeOwnPassword(actor: Actor, currentPassword: string, newPassword: string) {
  const [me] = await db.select().from(adminUsers).where(eq(adminUsers.id, actor.admin.id)).limit(1);
  if (!me || !(await verifyPassword(me.passwordHash, currentPassword))) {
    throw new AppError(401, "invalid_credentials", "Current password is incorrect");
  }
  await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() })
    .where(eq(adminUsers.id, me.id));
  await revokeAllSessions(me.id);
  await audit({ adminId: me.id, action: "admin.password_change", entity: "admin_user", entityId: me.id, ip: actor.ip });
}

export async function listAuditLogs(q: z.infer<typeof auditListQuery>) {
  const where = and(q.entity ? eq(auditLogs.entity, q.entity) : undefined, q.entityId ? eq(auditLogs.entityId, q.entityId) : undefined);
  const [items, total] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entity: auditLogs.entity,
        entityId: auditLogs.entityId,
        meta: auditLogs.meta,
        ip: auditLogs.ip,
        createdAt: auditLogs.createdAt,
        adminId: auditLogs.adminId,
        adminEmail: adminUsers.email,
      })
      .from(auditLogs)
      .leftJoin(adminUsers, eq(adminUsers.id, auditLogs.adminId))
      .where(where)
      .orderBy(desc(auditLogs.createdAt))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db.$count(auditLogs, where),
  ]);
  return { items, page: q.page, pageSize: q.pageSize, total };
}
