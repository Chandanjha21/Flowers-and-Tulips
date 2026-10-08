import { site } from "@/config/site";
import type { ApiCart } from "./api";

/*
 * Browser-only cart for frontend-only mode. Same shape as the server cart API so the
 * CartProvider does not care which one it talks to. Persists in localStorage.
 */

export interface LocalAddInput {
  slug: string;
  size: "standard" | "deluxe" | "premium";
  quantity: number;
  addOns: string[];
  cardMessage?: string;
  deliveryDate?: string;
  display: { name: string; image?: { src: string; alt: string }; unitPrice: number; addOns: { id: string; name: string; price: number }[] };
}

type Item = ApiCart["items"][number];
const KEY = "ft_bag_v1";
const cents = (d: number) => Math.round(d * 100);

function load(): Item[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Item[]) : [];
  } catch {
    return [];
  }
}

function save(items: Item[]): ApiCart {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private mode / storage disabled: the bag still works for this page view.
  }
  const subtotalCents = items.reduce((s, i) => s + i.lineTotalCents, 0);
  const deliveryFeeCents = subtotalCents === 0 || subtotalCents >= cents(site.freeDeliveryOver) ? 0 : cents(site.deliveryFee);
  return {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotalCents,
    deliveryFeeCents,
    totalCents: subtotalCents + deliveryFeeCents,
  };
}

const total = (i: Pick<Item, "unitPriceCents" | "addOns" | "quantity">) =>
  (i.unitPriceCents + i.addOns.reduce((s, a) => s + a.priceCents, 0)) * i.quantity;

const keyOf = (i: { slug: string; size: string; addOns: string[]; cardMessage?: string | null; deliveryDate?: string | null }) =>
  [i.slug, i.size, [...i.addOns].sort().join("+"), i.cardMessage ?? "", i.deliveryDate ?? ""].join("|");

export const localCart = {
  get: async () => save(load()),
  add: async (input: LocalAddInput) => {
    const items = load();
    const key = keyOf(input);
    const existing = items.find((i) => keyOf({ ...i, addOns: i.addOns.map((a) => a.id) }) === key);
    if (existing) {
      existing.quantity = Math.min(20, existing.quantity + input.quantity);
      existing.lineTotalCents = total(existing);
    } else {
      const item: Item = {
        id: crypto.randomUUID(),
        slug: input.slug,
        name: input.display.name,
        image: input.display.image ?? null,
        size: input.size,
        quantity: input.quantity,
        unitPriceCents: cents(input.display.unitPrice),
        addOns: input.display.addOns.map((a) => ({ id: a.id, name: a.name, priceCents: cents(a.price) })),
        cardMessage: input.cardMessage ?? null,
        deliveryDate: input.deliveryDate ?? null,
        lineTotalCents: 0,
        available: true,
      };
      item.lineTotalCents = total(item);
      items.push(item);
    }
    return save(items);
  },
  update: async (id: string, quantity: number) => {
    const items = load();
    const item = items.find((i) => i.id === id);
    if (item) {
      item.quantity = Math.max(1, Math.min(20, quantity));
      item.lineTotalCents = total(item);
    }
    return save(items);
  },
  remove: async (id: string) => save(load().filter((i) => i.id !== id)),
  clear: async () => save([]),
};
