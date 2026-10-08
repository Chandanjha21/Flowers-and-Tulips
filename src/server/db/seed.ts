/**
 * Seeds the catalog from the original mock data in src/data. Safe to re-run: existing
 * products (by slug) and add-ons (by id) are left untouched.
 *
 *   npm run db:seed
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { addOns as mockAddOns } from "@/data/catalog";
import { products as mockProducts } from "@/data/products";
import * as schema from "./schema";

const toCents = (d: number) => Math.round(d * 100);

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  let created = 0;

  for (const [i, a] of mockAddOns.entries()) {
    await db
      .insert(schema.addOns)
      .values({ id: a.id, name: a.name, priceCents: toCents(a.price), description: a.description, imageUrl: a.image.src, imageAlt: a.image.alt, sortOrder: i })
      .onConflictDoNothing();
  }

  for (const p of mockProducts) {
    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(schema.products)
        .values({
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          type: p.type,
          occasions: p.occasions,
          flowers: p.flowers,
          colors: p.colors,
          details: p.details,
          badge: p.badge ?? null,
          featured: !!p.featured,
          createdAt: new Date(`${p.createdAt}T12:00:00Z`),
        })
        .onConflictDoNothing({ target: schema.products.slug })
        .returning({ id: schema.products.id });
      if (!row) return;
      created++;
      await tx.insert(schema.productVariants).values(p.sizes.map((s) => ({ productId: row.id, size: s.size, priceCents: toCents(s.price), note: s.note })));
      if (p.images.length) {
        await tx.insert(schema.productImages).values(p.images.map((img, n) => ({ productId: row.id, url: img.src, alt: img.alt, sortOrder: n })));
      }
    });
  }

  console.log(`Seeded ${created} new products (${mockProducts.length - created} already present), ${mockAddOns.length} add-ons checked.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
