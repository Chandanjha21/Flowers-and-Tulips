"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AddOn, CartLine } from "@/types";
import { api, ApiError, type ApiCart } from "@/lib/api";
import { localCart, type LocalAddInput } from "@/lib/local-cart";
import { FRONTEND_ONLY } from "@/lib/mode";

type AddInput = Omit<CartLine, "lineId" | "name" | "image" | "unitPrice"> & {
  /** Display data; only used in frontend-only mode (the server prices the real cart). */
  display: LocalAddInput["display"];
};

/** Where the bag lives: the server API, or the browser in frontend-only (demo) mode. */
const remote = {
  get: () => api<ApiCart>("/api/cart"),
  add: (l: AddInput) =>
    api<ApiCart>("/api/cart/items", {
      method: "POST",
      body: { slug: l.slug, size: l.size, quantity: l.quantity, addOns: l.addOns, cardMessage: l.cardMessage, deliveryDate: l.deliveryDate },
    }),
  update: (id: string, quantity: number) => api<ApiCart>(`/api/cart/items/${id}`, { method: "PATCH", body: { quantity } }),
  remove: (id: string) => api<ApiCart>(`/api/cart/items/${id}`, { method: "DELETE" }),
  clear: () => api<ApiCart>("/api/cart", { method: "DELETE" }),
};
const store = FRONTEND_ONLY ? localCart : remote;

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  /** True when some lines can no longer be bought (sold out, archived); checkout is blocked until removed. */
  hasIssues: boolean;
  ready: boolean;
  giftMessage: string;
  setGiftMessage: (v: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: AddInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  error: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const FALLBACK_IMAGE = { src: "/videos/handoff.jpg", alt: "" };

/** Display-only add-on total for the product page; the server prices the real cart. */
export const addOnTotal = (ids: AddOn["id"][], catalog: AddOn[]) =>
  ids.reduce((sum, id) => sum + (catalog.find((a) => a.id === id)?.price ?? 0), 0);

export const lineTotal = (l: CartLine) => l.lineTotal ?? l.unitPrice * l.quantity;

function toLines(cart: ApiCart): CartLine[] {
  return cart.items.map((i) => ({
    lineId: i.id,
    slug: i.slug,
    name: i.name,
    image: i.image ?? FALLBACK_IMAGE,
    size: i.size,
    unitPrice: i.unitPriceCents / 100,
    addOns: i.addOns.map((a) => a.id as AddOn["id"]),
    addOnNames: i.addOns.map((a) => a.name),
    cardMessage: i.cardMessage ?? undefined,
    deliveryDate: i.deliveryDate ?? undefined,
    quantity: i.quantity,
    lineTotal: i.lineTotalCents / 100,
    issue: i.available ? undefined : (i.issue ?? "Unavailable"),
  }));
}

/** Cart state lives on the server (anonymous httpOnly session cookie), or in the browser in frontend-only mode. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (fn: () => Promise<ApiCart>) => {
    try {
      setError(null);
      setCart(await fn());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not update your bag. Please try again.");
      // Resync so the UI reflects what the server actually has.
      store.get().then(setCart, () => {});
    }
  }, []);

  const refresh = useCallback(() => run(() => store.get()), [run]);

  useEffect(() => {
    let alive = true;
    store.get().then(
      (c) => alive && setCart(c),
      () => alive && setCart({ items: [], count: 0, subtotalCents: 0, deliveryFeeCents: 0, totalCents: 0 }),
    );
    return () => {
      alive = false;
    };
  }, []);

  const add = useCallback(async (line: AddInput) => {
    try {
      setError(null);
      const next = await store.add(line);
      setCart(next);
      setOpen(true);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, message: e instanceof ApiError ? e.message : "Could not add to your bag. Please try again." };
    }
  }, []);

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) =>
      run(() =>
        quantity <= 0 ? store.remove(lineId) : store.update(lineId, quantity),
      ),
    [run],
  );
  const remove = useCallback((lineId: string) => run(() => store.remove(lineId)), [run]);
  const clear = useCallback(async () => {
    await run(() => store.clear());
    setGiftMessage("");
  }, [run]);

  const value = useMemo<CartContextValue>(() => {
    const lines = cart ? toLines(cart) : [];
    return {
      lines,
      count: cart?.count ?? 0,
      subtotal: (cart?.subtotalCents ?? 0) / 100,
      deliveryFee: (cart?.deliveryFeeCents ?? 0) / 100,
      hasIssues: lines.some((l) => l.issue),
      ready: cart !== null,
      giftMessage,
      setGiftMessage,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      updateQuantity,
      remove,
      clear,
      refresh,
      error,
    };
  }, [cart, giftMessage, isOpen, add, updateQuantity, remove, clear, refresh, error]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
