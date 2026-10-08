/**
 * Data access layer. Pages and components call these functions instead of importing
 * data sources directly. Products and add-ons come from Postgres (cached, revalidated on
 * admin edits); editorial content (events, testimonials, team, FAQs) is still static.
 */
import "server-only";
import { colors, flowerTypes, occasions, priceRanges, productTypes, sizes, sortOptions } from "@/data/catalog";
import { addOns as mockAddOns } from "@/data/catalog";
import { products as mockProducts } from "@/data/products";
import { FRONTEND_ONLY } from "@/lib/mode";
import { getActiveAddOns as dbAddOns, getActiveProducts as dbProducts } from "@/server/services/catalog";
import { eventServices, weddingGallery } from "@/data/events";
import { testimonials } from "@/data/testimonials";
import { comparisonRows, generalFaqs, subscriptionFaqs, subscriptionPlans } from "@/data/subscriptions";
import { team } from "@/data/team";
import type { Product } from "@/types";

// Frontend-only (demo) mode reads the bundled mock catalog instead of Postgres.
const getActiveProducts = async (): Promise<Product[]> => (FRONTEND_ONLY ? mockProducts : dbProducts());
const getActiveAddOns = async () => (FRONTEND_ONLY ? mockAddOns : dbAddOns());

export async function getProducts(): Promise<Product[]> {
  return getActiveProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getActiveProducts()).find((p) => p.slug === slug);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return (await getActiveProducts()).filter((p) => p.featured).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const score = (p: Product) =>
    p.occasions.filter((o) => product.occasions.includes(o)).length * 2 +
    p.flowers.filter((f) => product.flowers.includes(f)).length +
    (p.type === product.type ? 1 : 0);
  return (await getActiveProducts())
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

export async function getCatalogOptions() {
  return { occasions, flowerTypes, colors, sizes, productTypes, priceRanges, sortOptions };
}

export async function getAddOns() {
  return getActiveAddOns();
}

export async function getOccasions() {
  return occasions;
}

export async function getEventServices() {
  return eventServices;
}

export async function getWeddingGallery() {
  return weddingGallery;
}

export async function getTestimonials() {
  return testimonials;
}

export async function getSubscriptionPlans() {
  return subscriptionPlans;
}

export async function getSubscriptionComparison() {
  return comparisonRows;
}

export async function getSubscriptionFaqs() {
  return subscriptionFaqs;
}

export async function getGeneralFaqs() {
  return generalFaqs;
}

export async function getTeam() {
  return team;
}
