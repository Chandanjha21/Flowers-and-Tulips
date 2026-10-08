import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/server/db/client";
import { addOns, productImages, products, productVariants } from "@/server/db/schema";
import type { AddOn, Product, SizeKey } from "@/types";
import { toDollars } from "./pricing";

/*
 * Public catalog reads, shaped as the frontend's existing `Product` / `AddOn` types (prices in dollars).
 * Cached under the "catalog" tag; admin mutations call `revalidateCatalog()`.
 * Checkout never uses these cached values; it re-reads prices inside its transaction.
 */

export const CATALOG_TAG = "catalog";
const SIZE_ORDER: Record<SizeKey, number> = { standard: 0, deluxe: 1, premium: 2 };

async function loadActiveProducts(): Promise<Product[]> {
  const rows = await db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.createdAt));
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [variants, images] = await Promise.all([
    db.select().from(productVariants).where(inArray(productVariants.productId, ids)),
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
  ]);

  const out: Product[] = [];
  for (const p of rows) {
    const sizes = variants
      .filter((v) => v.productId === p.id && v.active && (v.stock === null || v.stock > 0))
      .sort((a, b) => SIZE_ORDER[a.size] - SIZE_ORDER[b.size])
      .map((v) => ({ size: v.size, price: toDollars(v.priceCents), note: v.note }));
    if (sizes.length === 0) continue; // nothing purchasable
    out.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      type: p.type,
      occasions: p.occasions as Product["occasions"],
      flowers: p.flowers as Product["flowers"],
      colors: p.colors as Product["colors"],
      details: p.details,
      sizes,
      images: images.filter((i) => i.productId === p.id).map((i) => ({ src: i.url, alt: i.alt })),
      badge: p.badge ?? undefined,
      featured: p.featured,
      createdAt: p.createdAt.toISOString().slice(0, 10),
    });
  }
  return out;
}

async function loadActiveAddOns(): Promise<AddOn[]> {
  const rows = await db.select().from(addOns).where(eq(addOns.active, true)).orderBy(asc(addOns.sortOrder));
  return rows.map((a) => ({
    id: a.id as AddOn["id"],
    name: a.name,
    price: toDollars(a.priceCents),
    description: a.description,
    image: { src: a.imageUrl, alt: a.imageAlt },
  }));
}

export const getActiveProducts = unstable_cache(loadActiveProducts, ["catalog-products"], { tags: [CATALOG_TAG], revalidate: 300 });
export const getActiveAddOns = unstable_cache(loadActiveAddOns, ["catalog-add-ons"], { tags: [CATALOG_TAG], revalidate: 300 });
