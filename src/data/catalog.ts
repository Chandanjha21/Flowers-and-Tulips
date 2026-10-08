import type { AddOn, ColorInfo, FlowerType, OccasionInfo, Option, ProductType, SizeKey } from "@/types";
import { images } from "./media";

export const occasions: OccasionInfo[] = [
  { key: "weddings", label: "Weddings", blurb: "Bridal bouquets to full venue design", image: images.brideSmelling, href: "/events#weddings" },
  { key: "engagements", label: "Engagements", blurb: "Proposal roses & party florals", image: images.rings, href: "/shop?occasion=engagements" },
  { key: "birthdays", label: "Birthdays", blurb: "Joyful, color-filled bouquets", image: images.celebrationGifts, href: "/shop?occasion=birthdays" },
  { key: "anniversaries", label: "Anniversaries", blurb: "Roses that say it still", image: images.surpriseRoses, href: "/shop?occasion=anniversaries" },
  { key: "corporate", label: "Corporate", blurb: "Lobbies, galas & client gifts", image: images.corporateTable, href: "/events#corporate" },
  { key: "baby-showers", label: "Baby Showers", blurb: "Soft, sweet & keepsake-worthy", image: images.babyShower, href: "/shop?occasion=baby-showers" },
  { key: "graduations", label: "Graduations", blurb: "Bright blooms for big milestones", image: images.graduation, href: "/shop?occasion=graduations" },
  { key: "sympathy", label: "Sympathy", blurb: "Gentle tributes, delivered with care", image: images.whiteLily, href: "/shop?occasion=sympathy" },
  { key: "holidays", label: "Holidays", blurb: "Seasonal centerpieces & gifts", image: images.holiday, href: "/shop?occasion=holidays" },
  { key: "just-because", label: "Just Because", blurb: "The best reason of all", image: images.receivingFlowers, href: "/shop?occasion=just-because" },
];

export const flowerTypes: Option<FlowerType>[] = [
  { key: "roses", label: "Roses" },
  { key: "peonies", label: "Peonies" },
  { key: "tulips", label: "Tulips" },
  { key: "lilies", label: "Lilies" },
  { key: "orchids", label: "Orchids" },
  { key: "hydrangeas", label: "Hydrangeas" },
  { key: "mixed", label: "Mixed seasonal" },
  { key: "dried", label: "Dried & preserved" },
];

export const colors: ColorInfo[] = [
  { key: "red", label: "Red", swatch: "#9B1C2C" },
  { key: "pink", label: "Pink", swatch: "#E48CA4" },
  { key: "blush", label: "Blush", swatch: "#F2CFC6" },
  { key: "peach", label: "Peach", swatch: "#F4B48E" },
  { key: "white", label: "White & ivory", swatch: "#FFFDF8" },
  { key: "purple", label: "Purple", swatch: "#7E5A9B" },
  { key: "yellow", label: "Yellow", swatch: "#F2C94C" },
  { key: "mixed", label: "Mixed", swatch: "conic-gradient(#E48CA4,#F2C94C,#7E5A9B,#F4B48E,#E48CA4)" },
];

export const sizes: Option<SizeKey>[] = [
  { key: "standard", label: "Standard" },
  { key: "deluxe", label: "Deluxe" },
  { key: "premium", label: "Premium" },
];

export const productTypes: Option<ProductType>[] = [
  { key: "bouquet", label: "Bouquets" },
  { key: "arrangement", label: "Arrangements" },
  { key: "gift-box", label: "Gift boxes" },
  { key: "plant", label: "Plants" },
];

export const priceRanges: { key: string; label: string; min: number; max: number }[] = [
  { key: "0-75", label: "Under $75", min: 0, max: 75 },
  { key: "75-100", label: "$75 – $100", min: 75, max: 100 },
  { key: "100-150", label: "$100 – $150", min: 100, max: 150 },
  { key: "150-plus", label: "$150 & up", min: 150, max: Infinity },
];

export const sortOptions = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
] as const;

export const addOns: AddOn[] = [
  { id: "vase", name: "Keepsake ceramic vase", price: 24, description: "Hand-glazed ivory vase, sized to your bouquet", image: images.vase },
  { id: "chocolates", name: "Artisan chocolates", price: 18, description: "Box of 9 handmade truffles", image: images.chocolates },
  { id: "candle", name: "Botanical soy candle", price: 28, description: "Rose & fig, 40-hour burn", image: images.candle },
  { id: "card", name: "Handwritten card", price: 0, description: "Written by our florists on letterpress stock", image: images.thankYouCard },
];
