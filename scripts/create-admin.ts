/**
 * Create (or reset) an admin account from the command line. There is no public sign-up.
 *
 *   npm run admin:create -- --email you@studio.com --name "Your Name" --role owner
 *
 * The password is read from ADMIN_PASSWORD or prompted for (input hidden), never from argv,
 * so it does not end up in shell history.
 */
import { parseArgs } from "node:util";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hashPassword, MIN_PASSWORD_LENGTH } from "@/server/auth/password";
import * as schema from "@/server/db/schema";

function promptHidden(question: string): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const { values } = parseArgs({
    options: { email: { type: "string" }, name: { type: "string", default: "" }, role: { type: "string", default: "owner" } },
  });
  const email = values.email?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("--email is required");
  const role = values.role === "staff" ? "staff" : values.role === "owner" ? "owner" : null;
  if (!role) throw new Error("--role must be owner or staff");

  const password = process.env.ADMIN_PASSWORD ?? (await promptHidden(`Password for ${email} (min ${MIN_PASSWORD_LENGTH} chars): `));
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const passwordHash = await hashPassword(password);
  const [existing] = await db.select({ id: schema.adminUsers.id }).from(schema.adminUsers).where(eq(schema.adminUsers.email, email));

  if (existing) {
    await db
      .update(schema.adminUsers)
      .set({ passwordHash, role, active: true, failedLogins: 0, lockedUntil: null, passwordChangedAt: new Date(), ...(values.name ? { name: values.name } : {}) })
      .where(eq(schema.adminUsers.id, existing.id));
    await db.delete(schema.adminSessions).where(eq(schema.adminSessions.adminId, existing.id));
    await db.insert(schema.auditLogs).values({ adminId: existing.id, action: "admin.cli_reset", entity: "admin_user", entityId: existing.id });
    console.log(`Updated ${email} (${role}); existing sessions revoked.`);
  } else {
    const [row] = await db.insert(schema.adminUsers).values({ email, name: values.name ?? "", role, passwordHash }).returning({ id: schema.adminUsers.id });
    await db.insert(schema.auditLogs).values({ adminId: row!.id, action: "admin.cli_create", entity: "admin_user", entityId: row!.id });
    console.log(`Created ${role} ${email}.`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
