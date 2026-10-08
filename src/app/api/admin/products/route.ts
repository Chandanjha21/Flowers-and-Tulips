import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { json, parse, queryObject } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { createProduct, listProducts } from "@/server/services/admin-inventory";
import { productCreateSchema, productListQuery } from "@/server/validation/admin";

/** List products, including archived ones. Filters: q, active, type, lowStock, page, pageSize. */
export const GET = adminRoute(ANY_ADMIN, async (req) => listProducts(parse(productListQuery, queryObject(req))));

/** Create a product with its sizes. */
export const POST = adminRoute(ANY_ADMIN, async (req, { actor }) => {
  const input = parse(productCreateSchema, await readJson(req, 64 * 1024));
  return json(await createProduct(input, actor), { status: 201 });
});
