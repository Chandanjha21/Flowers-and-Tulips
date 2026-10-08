import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { readJson } from "@/server/http/security";
import { archiveProduct, getProduct, updateProduct } from "@/server/services/admin-inventory";
import { productUpdateSchema, uuidParam } from "@/server/validation/admin";

type P = { id: string };

export const GET = adminRoute<P>(ANY_ADMIN, async (_req, { params }) => getProduct(parse(uuidParam, params).id));

export const PATCH = adminRoute<P>(ANY_ADMIN, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  return updateProduct(id, parse(productUpdateSchema, await readJson(req, 64 * 1024)), actor);
});

/** Archives (hides) the product. Products are never hard-deleted so order history stays intact. */
export const DELETE = adminRoute<P>(ANY_ADMIN, async (_req, { params, actor }) => archiveProduct(parse(uuidParam, params).id, actor));
