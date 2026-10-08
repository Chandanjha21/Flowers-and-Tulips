import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    // No script-src here: the layout uses a tiny inline script. These directives still block
    // clickjacking, plugin content, <base> hijacking and form posts to foreign origins.
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com",
  },
];

// No database configured -> build the site in frontend-only (demo) mode. See src/lib/mode.ts.
const frontendOnly = process.env.NEXT_PUBLIC_FRONTEND_ONLY ?? (process.env.DATABASE_URL ? "0" : "1");
if (frontendOnly === "1") console.log("▲ Frontend-only mode: no database or payments (set DATABASE_URL to enable the backend)");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_FRONTEND_ONLY: frontendOnly },
  poweredByHeader: false,
  // Native module; keep it out of the server bundle.
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
