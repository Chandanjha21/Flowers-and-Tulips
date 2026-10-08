import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/config/site";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { floristJsonLd, ogImage } from "@/lib/seo";
import "./globals.css";

// Fonts are bundled in ./fonts (Google Fonts via Fontsource, OFL) so builds never depend on
// downloading from Google, which can fail on CI/Vercel.
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-300-italic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Times New Roman", "serif"],
});

const jost = localFont({
  src: "./fonts/jost-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-jost",
  display: "swap",
  fallback: ["ui-sans-serif", "sans-serif"],
});

const pinyon = localFont({
  src: "./fonts/pinyon-script-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
  fallback: ["cursive"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | Luxury Florist in ${site.address.city}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/",
    title: `${site.name} | Luxury Florist in ${site.address.city}`,
    description: site.description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} ${pinyon.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Flags JS so scroll-reveal styles only hide content when they can be revealed */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.js='1'" }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-wine focus:px-5 focus:py-3 focus:text-ivory">
          Skip to content
        </a>
        <CartProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
        <JsonLd data={floristJsonLd()} />
      </body>
    </html>
  );
}
