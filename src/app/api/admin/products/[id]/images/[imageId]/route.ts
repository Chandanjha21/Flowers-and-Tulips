import { z } from "zod";
import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { parse } from "@/server/http/handler";
import { deleteProductImage } from "@/server/services/admin-inventory";

const params = z.object({ id: z.uuid(), imageId: z.uuid() });

export const DELETE = adminRoute<{ id: string; imageId: string }>(ANY_ADMIN, async (_req, ctx) => {
  const { id, imageId } = parse(params, ctx.params);
  return deleteProductImage(id, imageId, ctx.actor);
});
