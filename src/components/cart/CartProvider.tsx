"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AddOn, CartLine } from "@/types";
import { api, ApiError, type ApiCart } from "@/lib/api";

type AddInput = Omit<CartLine, "lineId" | "name" | "image" | "unitPrice">;

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

/** Cart state lives on the server, tied to an anonymous httpOnly session cookie; this mirrors it. */
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
      api<ApiCart>("/api/cart").then(setCart, () => {});
    }
  }, []);

  const refresh = useCallback(() => run(() => api<ApiCart>("/api/cart")), [run]);

  useEffect(() => {
    let alive = true;
    api<ApiCart>("/api/cart").then(
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
      const next = await api<ApiCart>("/api/cart/items", {
        method: "POST",
        body: { slug: line.slug, size: line.size, quantity: line.quantity, addOns: line.addOns, cardMessage: line.cardMessage, deliveryDate: line.deliveryDate },
      });
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
        quantity <= 0
          ? api<ApiCart>(`/api/cart/items/${lineId}`, { method: "DELETE" })
          : api<ApiCart>(`/api/cart/items/${lineId}`, { method: "PATCH", body: { quantity } }),
      ),
    [run],
  );
  const remove = useCallback((lineId: string) => run(() => api<ApiCart>(`/api/cart/items/${lineId}`, { method: "DELETE" })), [run]);
  const clear = useCallback(async () => {
    await run(() => api<ApiCart>("/api/cart", { method: "DELETE" }));
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
