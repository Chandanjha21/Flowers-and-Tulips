import type { Product, ShopFilters } from "@/types";
import { priceRanges } from "@/data/catalog";

const list = <T extends string>(value: string | null): T[] => (value ? (value.split(",").filter(Boolean) as T[]) : []);

export const emptyFilters: ShopFilters = { occasion: [], flower: [], color: [], size: [], type: [], price: null, sort: "featured" };

export function parseFilters(params: URLSearchParams): ShopFilters {
  const sort = params.get("sort");
  return {
    occasion: list(params.get("occasion")),
    flower: list(params.get("flower")),
    color: list(params.get("color")),
    size: list(params.get("size")),
    type: list(params.get("type")),
    price: params.get("price"),
    sort: sort === "price-asc" || sort === "price-desc" || sort === "newest" ? sort : "featured",
  };
}

export function serializeFilters(filters: ShopFilters): string {
  const params = new URLSearchParams();
  (["occasion", "flower", "color", "size", "type"] as const).forEach((key) => {
    if (filters[key].length) params.set(key, filters[key].join(","));
  });
  if (filters.price) params.set("price", filters.price);
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params.toString();
}

export const basePrice = (p: Product) => Math.min(...p.sizes.map((s) => s.price));

const overlaps = <T,>(selected: T[], values: T[]) => selected.length === 0 || selected.some((s) => values.includes(s));

export function applyFilters(all: Product[], f: ShopFilters): Product[] {
  const range = priceRanges.find((r) => r.key === f.price);
  const result = all.filter(
    (p) =>
      overlaps(f.occasion, p.occasions) &&
      overlaps(f.flower, p.flowers) &&
      overlaps(f.color, p.colors) &&
      overlaps(f.size, p.sizes.map((s) => s.size)) &&
      overlaps(f.type, [p.type]) &&
      (!range || (basePrice(p) >= range.min && basePrice(p) < range.max)),
  );
  switch (f.sort) {
    case "price-asc":
      return result.sort((a, b) => basePrice(a) - basePrice(b));
    case "price-desc":
      return result.sort((a, b) => basePrice(b) - basePrice(a));
    case "newest":
      return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    default:
      return result.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}

export const activeFilterCount = (f: ShopFilters) =>
  f.occasion.length + f.flower.length + f.color.length + f.size.length + f.type.length + (f.price ? 1 : 0);
