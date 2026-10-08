import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { env } from "@/server/env";
import { AppError } from "@/server/http/errors";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;
export type ImageType = keyof typeof TYPES;

/**
 * Identify the image type from its magic bytes. The client-declared MIME type and file name are
 * ignored entirely, so a renamed HTML/SVG/script file can never be stored as an "image".
 */
export function sniffImage(buf: Uint8Array): ImageType | null {
  const b = buf;
  const ascii = (start: number, end: number) => String.fromCharCode(...b.subarray(start, end));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return "image/png";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (b.length >= 12 && ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif";
  return null;
}

export interface StoredFile {
  key: string;
  url: string;
}

// Local driver: files under .data/uploads, served by app/media/[key]/route.ts.
export const LOCAL_DIR = path.join(process.cwd(), ".data", "uploads");
export const LOCAL_KEY = /^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

export async function storeImage(bytes: Uint8Array): Promise<StoredFile & { contentType: ImageType }> {
  if (bytes.byteLength === 0) throw new AppError(400, "empty_file", "File is empty");
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new AppError(413, "file_too_large", "Images must be 5 MB or smaller");
  const contentType = sniffImage(bytes);
  if (!contentType) throw new AppError(415, "unsupported_image", "Only JPEG, PNG, WebP or AVIF images are allowed");

  // Random name: never derived from user input.
  const key = `${randomUUID()}.${TYPES[contentType]}`;

  if (env().STORAGE_DRIVER === "vercel-blob") {
    const blob = await put(`products/${key}`, Buffer.from(bytes), {
      access: "public",
      contentType,
      addRandomSuffix: false,
      token: env().BLOB_READ_WRITE_TOKEN,
    });
    return { key: blob.url, url: blob.url, contentType };
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, key), bytes, { flag: "wx" });
  return { key, url: `/media/${key}`, contentType };
}

export async function deleteStoredImage(key: string) {
  try {
    if (key.startsWith("https://")) await del(key, { token: env().BLOB_READ_WRITE_TOKEN });
    else if (LOCAL_KEY.test(key)) await unlink(path.join(LOCAL_DIR, key));
  } catch (err) {
    console.warn("[storage] delete failed", key, (err as Error).message);
  }
}

export async function readLocalImage(key: string) {
  if (!LOCAL_KEY.test(key)) return null;
  try {
    return await readFile(path.join(LOCAL_DIR, key));
  } catch {
    return null;
  }
}
