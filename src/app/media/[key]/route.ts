import { readLocalImage, sniffImage } from "@/server/storage";

/** Serves images stored by the local storage driver (development / single-server deployments). */
export async function GET(_req: Request, ctx: RouteContext<"/media/[key]">) {
  const { key } = await ctx.params;
  const file = await readLocalImage(key);
  if (!file) return new Response("Not found", { status: 404 });
  const type = sniffImage(file);
  if (!type) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
