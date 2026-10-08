import type { Metadata } from "next";
import { site } from "@/config/site";
import { images } from "@/data/media";

export const ogImage = images.moodyVase.src.replace("w=2000", "w=1200&h=630");

export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      type: "website",
      images: [{ url: image ?? ogImage, width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [image ?? ogImage] },
  };
}

export function floristJsonLd() {
  const { address } = site;
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: ogImage,
    priceRange: "$$",
    foundingDate: String(site.established),
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHours: site.hours.map((h) => h.schema),
    sameAs: Object.values(site.social),
  };
}
