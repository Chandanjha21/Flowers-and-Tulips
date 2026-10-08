/** Tiny browser client for our JSON API (`{ data }` / `{ error }` envelope). */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const payload = (await res.json().catch(() => null)) as { data?: T; error?: { code: string; message: string; details?: unknown } } | null;
  if (!res.ok || !payload || payload.error) {
    const e = payload?.error;
    throw new ApiError(res.status, e?.code ?? "network_error", e?.message ?? "Something went wrong. Please try again.", e?.details);
  }
  return payload.data as T;
}

/** Server cart shape (cents). Mirrors CartView in src/server/services/cart.ts. */
export interface ApiCart {
  items: {
    id: string;
    slug: string;
    name: string;
    image: { src: string; alt: string } | null;
    size: "standard" | "deluxe" | "premium";
    quantity: number;
    unitPriceCents: number;
    addOns: { id: string; name: string; priceCents: number }[];
    cardMessage: string | null;
    deliveryDate: string | null;
    lineTotalCents: number;
    available: boolean;
    issue?: string;
  }[];
  count: number;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}
