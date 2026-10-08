import { z } from "zod";
import { AppError, badRequest } from "@/server/http/errors";
import { ANY_ADMIN, adminRoute } from "@/server/http/admin";
import { json, parse } from "@/server/http/handler";
import { limits, rateLimit } from "@/server/http/rate-limit";
import { readJson } from "@/server/http/security";
import { addProductImage, reorderProductImages } from "@/server/services/admin-inventory";
import { MAX_IMAGE_BYTES } from "@/server/storage";
import { imageMetaSchema, uuidParam } from "@/server/validation/admin";

type P = { id: string };

/** Upload one image: multipart/form-data with `file` and optional `alt`. */
export const POST = adminRoute<P>(ANY_ADMIN, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  await rateLimit(limits.upload, actor.admin.id);

  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
    throw new AppError(415, "unsupported_media_type", "Expected multipart/form-data");
  }
  if (Number(req.headers.get("content-length") ?? "0") > MAX_IMAGE_BYTES + 64 * 1024) {
    throw new AppError(413, "file_too_large", "Images must be 5 MB or smaller");
  }
  const form = await req.formData().catch(() => {
    throw badRequest("Malformed form data");
  });
  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("Missing `file`");
  const { alt } = parse(imageMetaSchema, { alt: form.get("alt") ?? undefined });
  const bytes = new Uint8Array(await file.arrayBuffer());
  return json(await addProductImage(id, bytes, alt, actor), { status: 201 });
});

/** Reorder images: `{ "order": [imageId, ...] }` listing every image once. */
export const PUT = adminRoute<P>(ANY_ADMIN, async (req, { params, actor }) => {
  const { id } = parse(uuidParam, params);
  const { order } = parse(z.strictObject({ order: z.array(z.uuid()).max(50) }), await readJson(req));
  return reorderProductImages(id, order, actor);
});
