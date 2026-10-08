export type Occasion =
  | "weddings"
  | "engagements"
  | "birthdays"
  | "anniversaries"
  | "corporate"
  | "baby-showers"
  | "graduations"
  | "sympathy"
  | "holidays"
  | "just-because";

export type FlowerType =
  | "roses"
  | "lilies"
  | "tulips"
  | "peonies"
  | "orchids"
  | "hydrangeas"
  | "mixed"
  | "dried";

export type ColorKey = "red" | "pink" | "blush" | "white" | "peach" | "purple" | "yellow" | "mixed";

export type SizeKey = "standard" | "deluxe" | "premium";

export type ProductType = "bouquet" | "arrangement" | "gift-box" | "plant";

export interface MediaAsset {
  src: string;
  alt: string;
  /** Optional credit for the placeholder source */
  credit?: string;
}

export interface VideoAsset {
  src: string;
  poster: string;
  label: string;
}

export interface ProductSize {
  size: SizeKey;
  price: number;
  /** e.g. "12 stems" or "Approx. 14in tall" */
  note: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  type: ProductType;
  occasions: Occasion[];
  flowers: FlowerType[];
  colors: ColorKey[];
  sizes: ProductSize[];
  images: MediaAsset[];
  badge?: "New" | "Bestseller" | "Seasonal" | "Florist's Pick";
  featured?: boolean;
  /** ISO date, used for "newest" sorting */
  createdAt: string;
  details: string[];
}

export interface AddOn {
  id: "vase" | "chocolates" | "card" | "balloon" | "candle";
  name: string;
  price: number;
  description: string;
  image: MediaAsset;
}

export interface Option<K extends string = string> {
  key: K;
  label: string;
}

export interface OccasionInfo extends Option<Occasion> {
  blurb: string;
  image: MediaAsset;
  /** Where the occasion tile links to */
  href: string;
}

export interface ColorInfo extends Option<ColorKey> {
  swatch: string;
}

export interface EventService {
  id: "weddings" | "corporate" | "celebrations" | "sympathy";
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  images: MediaAsset[];
}

export interface GalleryItem extends MediaAsset {
  id: string;
  caption: string;
  tall?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  context: string;
  avatar: MediaAsset;
}

export interface SubscriptionPlan {
  id: "daily-roses" | "weekly-fresh" | "monthly-signature";
  name: string;
  frequency: string;
  price: number;
  priceUnit: string;
  summary: string;
  includes: string[];
  image: MediaAsset;
  highlighted?: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo: MediaAsset;
}

export interface CartLine {
  lineId: string;
  slug: string;
  name: string;
  image: MediaAsset;
  size: SizeKey;
  unitPrice: number;
  addOns: AddOn["id"][];
  cardMessage?: string;
  deliveryDate?: string;
  quantity: number;
  /** Server-computed (dollars), including add-ons. */
  lineTotal?: number;
  addOnNames?: string[];
  /** Set when the line can no longer be purchased (sold out, archived). */
  issue?: string;
}

export interface ShopFilters {
  occasion: Occasion[];
  flower: FlowerType[];
  color: ColorKey[];
  size: SizeKey[];
  type: ProductType[];
  price: string | null;
  sort: "featured" | "price-asc" | "price-desc" | "newest";
}
