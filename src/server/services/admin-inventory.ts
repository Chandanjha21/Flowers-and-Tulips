import "server-only";
import { and, asc, desc, eq, ilike, inArray, lte, or, sql, type SQL } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import type { z } from "zod";
import { db } from "@/server/db/client";
import { addOns, productImages, products, productVariants } from "@/server/db/schema";
import { conflict, notFound, unprocessable } from "@/server/http/errors";
import { deleteStoredImage, storeImage } from "@/server/storage";
import type {
  addOnCreateSchema,
  addOnUpdateSchema,
  productCreateSchema,
  productListQuery,
  productUpdateSchema,
  variantUpdateSchema,
} from "@/server/validation/admin";
import type { AdminPrincipal } from "@/server/auth/admin-session";
import { audit } from "./audit";
import { CATALOG_TAG } from "./catalog";

export interface Actor {
  admin: AdminPrincipal;
  ip: string;
}

const MAX_IMAGES_PER_PRODUCT = 12;

/** Make storefront pages pick up catalog changes (stale-while-revalidate). */
export const revalidateCatalog = () => revalidateTag(CATALOG_TAG, "max");

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

// ── Products ─────────────────────────────────────────────────────────────────

async function withChildren<T extends { id: string }>(rows: T[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [variants, images] = await Promise.all([
    db.select().from(productVariants).where(inArray(productVariants.productId, ids)).orderBy(asc(productVariants.priceCents)),
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
  ]);
  return rows.map((r) => ({
    ...r,
    variants: variants.filter((v) => v.productId === r.id),
    images: images.filter((i) => i.productId === r.id),
  }));
}

export async function listProducts(q: z.infer<typeof productListQuery>) {
  const filters: (SQL | undefined)[] = [];
  if (q.q) filters.push(or(ilike(products.name, `%${escapeLike(q.q)}%`), ilike(products.slug, `%${escapeLike(q.q)}%`)));
  if (q.active !== undefined) filters.push(eq(products.active, q.active));
  if (q.type) filters.push(eq(products.type, q.type));
  if (q.lowStock !== undefined) {
    filters.push(
      inArray(
        products.id,
        db.select({ id: productVariants.productId }).from(productVariants).where(lte(productVariants.stock, q.lowStock)),
      ),
    );
  }
  const where = and(...filters);
  const [rows, total] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db.$count(products, where),
  ]);
  return { items: await withChildren(rows), page: q.page, pageSize: q.pageSize, total };
}

export async function getProduct(id: string) {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) throw notFound("Product");
  return (await withChildren([row]))[0]!;
}

async function assertSlugFree(slug: string, exceptId?: string) {
  const [clash] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  if (clash && clash.id !== exceptId) throw conflict("Another product already uses this slug", { field: "slug" });
}

export async function createProduct(input: z.infer<typeof productCreateSchema>, actor: Actor) {
  await assertSlugFree(input.slug);
  const { variants, ...fields } = input;
  const id = await db.transaction(async (tx) => {
    const [p] = await tx.insert(products).values(fields).returning({ id: products.id });
    await tx.insert(productVariants).values(variants.map((v) => ({ ...v, productId: p!.id })));
    await audit({ adminId: actor.admin.id, action: "product.create", entity: "product", entityId: p!.id, meta: { slug: input.slug }, ip: actor.ip }, tx);
    return p!.id;
  });
  revalidateCatalog();
  return getProduct(id);
}

export async function updateProduct(id: string, input: z.infer<typeof productUpdateSchema>, actor: Actor) {
  const existing = await getProduct(id);
  if (input.slug && input.slug !== existing.slug) await assertSlugFree(input.slug, id);
  const { variants, ...fields } = input;

  await db.transaction(async (tx) => {
    if (Object.keys(fields).length) await tx.update(products).set(fields).where(eq(products.id, id));
    for (const v of variants ?? []) {
      await tx
        .insert(productVariants)
        .values({ ...v, productId: id })
        .onConflictDoUpdate({
          target: [productVariants.productId, productVariants.size],
          set: { priceCents: v.priceCents, note: v.note, stock: v.stock, active: v.active },
        });
    }
    await audit(
      {
        adminId: actor.admin.id,
        action: "product.update",
        entity: "product",
        entityId: id,
        meta: { fields: Object.keys(fields), variants: variants?.map((v) => ({ size: v.size, priceCents: v.priceCents, stock: v.stock })) },
        ip: actor.ip,
      },
      tx,
    );
  });
  revalidateCatalog();
  return getProduct(id);
}

/** Products are archived, never hard-deleted, so past orders keep their references. */
export async function archiveProduct(id: string, actor: Actor) {
  const res = await db.update(products).set({ active: false }).where(eq(products.id, id)).returning({ id: products.id });
  if (!res.length) throw notFound("Product");
  await audit({ adminId: actor.admin.id, action: "product.archive", entity: "product", entityId: id, ip: actor.ip });
  revalidateCatalog();
  return { id, active: false };
}

export async function updateVariant(id: string, input: z.infer<typeof variantUpdateSchema>, actor: Actor) {
  const updated = await db.transaction(async (tx) => {
    const [v] = await tx.select().from(productVariants).where(eq(productVariants.id, id)).for("update").limit(1);
    if (!v) throw notFound("Variant");

    let stock = v.stock;
    if (input.stock && "set" in input.stock) stock = input.stock.set;
    if (input.stock && "adjust" in input.stock) {
      if (v.stock === null) throw unprocessable("This size is made to order; set a stock level first");
      stock = v.stock + input.stock.adjust;
      if (stock < 0) throw unprocessable(`Stock cannot go below zero (currently ${v.stock})`);
    }

    const [row] = await tx
      .update(productVariants)
      .set({
        ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
        stock,
      })
      .where(eq(productVariants.id, id))
      .returning();
    await audit(
      {
        adminId: actor.admin.id,
        action: "variant.update",
        entity: "product_variant",
        entityId: id,
        meta: { before: { priceCents: v.priceCents, stock: v.stock, active: v.active }, after: { priceCents: row!.priceCents, stock: row!.stock, active: row!.active }, reason: input.reason },
        ip: actor.ip,
      },
      tx,
    );
    return row!;
  });
  revalidateCatalog();
  return updated;
}

// ── Images ──────────────────────────────────────────────────────────────────

export async function addProductImage(productId: string, bytes: Uint8Array, alt: string, actor: Actor) {
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!p) throw notFound("Product");
  const n = await db.$count(productImages, eq(productImages.productId, productId));
  if (n >= MAX_IMAGES_PER_PRODUCT) throw unprocessable(`At most ${MAX_IMAGES_PER_PRODUCT} images per product`);

  const stored = await storeImage(bytes);
  try {
    const [img] = await db
      .insert(productImages)
      .values({ productId, url: stored.url, alt, storageKey: stored.key, sortOrder: n })
      .returning();
    await audit({ adminId: actor.admin.id, action: "product.image_add", entity: "product", entityId: productId, meta: { imageId: img!.id }, ip: actor.ip });
    revalidateCatalog();
    return img!;
  } catch (err) {
    await deleteStoredImage(stored.key);
    throw err;
  }
}

export async function deleteProductImage(productId: string, imageId: string, actor: Actor) {
  const [img] = await db
    .delete(productImages)
    .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)))
    .returning();
  if (!img) throw notFound("Image");
  if (img.storageKey) await deleteStoredImage(img.storageKey);
  await audit({ adminId: actor.admin.id, action: "product.image_delete", entity: "product", entityId: productId, meta: { imageId }, ip: actor.ip });
  revalidateCatalog();
  return { id: imageId, deleted: true };
}

export async function reorderProductImages(productId: string, order: string[], actor: Actor) {
  await db.transaction(async (tx) => {
    const imgs = await tx.select({ id: productImages.id }).from(productImages).where(eq(productImages.productId, productId));
    const known = new Set(imgs.map((i) => i.id));
    if (order.length !== known.size || order.some((id) => !known.has(id))) throw unprocessable("Order must list every image of this product exactly once");
    for (const [i, id] of order.entries()) await tx.update(productImages).set({ sortOrder: i }).where(eq(productImages.id, id));
    await audit({ adminId: actor.admin.id, action: "product.image_reorder", entity: "product", entityId: productId, ip: actor.ip }, tx);
  });
  revalidateCatalog();
  return getProduct(productId);
}

// ── Add-ons ─────────────────────────────────────────────────────────────────

export const listAddOns = () => db.select().from(addOns).orderBy(asc(addOns.sortOrder), asc(addOns.name));

export async function createAddOn(input: z.infer<typeof addOnCreateSchema>, actor: Actor) {
  const [exists] = await db.select({ id: addOns.id }).from(addOns).where(eq(addOns.id, input.id)).limit(1);
  if (exists) throw conflict("An add-on with this id already exists", { field: "id" });
  const [row] = await db.insert(addOns).values(input).returning();
  await audit({ adminId: actor.admin.id, action: "add_on.create", entity: "add_on", entityId: input.id, ip: actor.ip });
  revalidateCatalog();
  return row!;
}

export async function updateAddOn(id: string, input: z.infer<typeof addOnUpdateSchema>, actor: Actor) {
  const [row] = await db.update(addOns).set(input).where(eq(addOns.id, id)).returning();
  if (!row) throw notFound("Add-on");
  await audit({ adminId: actor.admin.id, action: "add_on.update", entity: "add_on", entityId: id, meta: input, ip: actor.ip });
  revalidateCatalog();
  return row;
}

/** Variants at or below a threshold, for a "restock soon" widget. */
export async function lowStockReport(threshold = 5) {
  return db
    .select({
      variantId: productVariants.id,
      productId: products.id,
      productName: products.name,
      size: productVariants.size,
      stock: productVariants.stock,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(and(eq(products.active, true), eq(productVariants.active, true), sql`${productVariants.stock} IS NOT NULL`, lte(productVariants.stock, threshold)))
    .orderBy(asc(productVariants.stock));
}
