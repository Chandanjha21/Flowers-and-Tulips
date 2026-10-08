import { describe, expect, it } from "vitest";
import { checkoutSchema, cartAddSchema } from "@/lib/validation";
import { hashToken, looksLikeToken, newToken } from "@/server/auth/tokens";
import { sniffImage } from "@/server/storage";

describe("image sniffing", () => {
  it("recognises real image headers", () => {
    expect(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImage(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
  });

  it("rejects SVG/HTML regardless of extension", () => {
    expect(sniffImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(sniffImage(new TextEncoder().encode("<!doctype html><html>"))).toBeNull();
  });
});

describe("session tokens", () => {
  it("are 256-bit url-safe and hashed deterministically", () => {
    const t = newToken();
    expect(looksLikeToken(t)).toBe(true);
    expect(hashToken(t)).toHaveLength(64);
    expect(hashToken(t)).toBe(hashToken(t));
    expect(looksLikeToken("../../etc/passwd")).toBe(false);
  });
});

describe("request validation", () => {
  const valid = {
    recipient: { name: "Ana", phone: "555 012 3456", addressLine1: "1 Main St", city: "LA", zip: "90001" },
    delivery: { date: "2026-10-10" },
    sender: { name: "Ben", email: "Ben@Example.com" },
  };

  it("accepts a valid checkout and normalises email", () => {
    const parsed = checkoutSchema.parse(valid);
    expect(parsed.sender.email).toBe("ben@example.com");
  });

  it("rejects unknown keys (e.g. a client-supplied price)", () => {
    expect(checkoutSchema.safeParse({ ...valid, totalCents: 1 }).success).toBe(false);
    expect(cartAddSchema.safeParse({ slug: "x", size: "standard", quantity: 1, unitPrice: 0.01 }).success).toBe(false);
  });

  it("rejects control characters and oversize input", () => {
    expect(checkoutSchema.safeParse({ ...valid, recipient: { ...valid.recipient, name: "A\u0000" } }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, giftMessage: "x".repeat(241) }).success).toBe(false);
  });
});
