"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { AddOn, Product, SizeKey } from "@/types";
import { useCart, addOnTotal } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Calendar, Check, Minus, Plus, Truck } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { formatPrice, isoDateFromToday } from "@/lib/format";
import { site } from "@/config/site";

export function ProductPurchase({ product, addOns }: { product: Product; addOns: AddOn[] }) {
  const cart = useCart();
  const uid = useId();
  const [size, setSize] = useState<SizeKey>(product.sizes[Math.min(1, product.sizes.length - 1)].size);
  const [selected, setSelected] = useState<AddOn["id"][]>([]);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(isoDateFromToday(1));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const sizeInfo = product.sizes.find((s) => s.size === size)!;
  const total = (sizeInfo.price + addOnTotal(selected, addOns)) * qty;
  const wantsCard = selected.includes("card");

  const toggleAddOn = (id: AddOn["id"]) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <form
      className="space-y-9"
      onSubmit={async (e) => {
        e.preventDefault();
        setAdding(true);
        setAddError(null);
        const res = await cart.add({
          slug: product.slug,
          size,
          addOns: selected,
          cardMessage: wantsCard && message.trim() ? message.trim() : undefined,
          deliveryDate: date,
          quantity: qty,
        });
        setAdding(false);
        if (!res.ok) {
          setAddError(res.message);
          return;
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
      }}
    >
      {/* Size */}
      <fieldset>
        <legend className="eyebrow text-ink">Choose a size</legend>
        <div className={cn("mt-4 grid gap-3", product.sizes.length === 3 ? "grid-cols-3" : product.sizes.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
          {product.sizes.map((s) => (
            <label key={s.size} className="cursor-pointer">
              <input type="radio" name={`${uid}-size`} value={s.size} checked={size === s.size} onChange={() => setSize(s.size)} className="peer sr-only" />
              <span className="flex h-full flex-col rounded-2xl px-4 py-4 ring-1 ring-linen transition-all duration-500 ease-(--ease-petal) hover:ring-wine/40 peer-checked:bg-cream peer-checked:ring-2 peer-checked:ring-wine peer-focus-visible:ring-2 peer-focus-visible:ring-wine peer-focus-visible:ring-offset-2">
                <span className="eyebrow text-[0.6875rem] text-muted capitalize">{s.size}</span>
                <span className="mt-1 font-display text-2xl text-wine">{formatPrice(s.price)}</span>
                <span className="mt-1 text-xs text-muted">{s.note}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Add-ons */}
      <fieldset>
        <legend className="eyebrow text-ink">Make it extra special</legend>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {addOns.map((a) => {
            const on = selected.includes(a.id);
            return (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-4 rounded-2xl p-3 ring-1 ring-linen transition-colors has-[:checked]:bg-cream has-[:checked]:ring-wine has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-wine">
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleAddOn(a.id)} />
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-cream">
                    <Image src={a.image.src} alt="" fill sizes="56px" quality={60} className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] leading-snug text-ink">{a.name}</span>
                    <span className="block text-sm text-muted">{a.price ? `+ ${formatPrice(a.price)}` : "Complimentary"}</span>
                  </span>
                  <span aria-hidden="true" className={cn("flex size-6 shrink-0 items-center justify-center rounded-full ring-1 transition-colors", on ? "bg-wine text-ivory ring-wine" : "ring-ink/25")}>
                    {on ? <Check size={14} strokeWidth={2} /> : <Plus size={14} />}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {wantsCard ? (
          <div className="mt-4 animate-rise">
            <label htmlFor={`${uid}-msg`} className="text-sm text-muted">Card message</label>
            <textarea
              id={`${uid}-msg`}
              rows={3}
              maxLength={200}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Happy birthday, my love…"
              className="mt-2 w-full resize-none rounded-2xl bg-cream/60 px-4 py-3 ring-1 ring-linen placeholder:text-muted/80 focus:outline-none focus:ring-2 focus:ring-wine/60"
            />
            <p className="mt-1 text-right text-xs text-muted">{message.length}/200</p>
          </div>
        ) : null}
      </fieldset>

      {/* Delivery date */}
      <div>
        <label htmlFor={`${uid}-date`} className="eyebrow text-ink">Delivery date</label>
        <div className="relative mt-4">
          <Calendar size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id={`${uid}-date`}
            type="date"
            required
            min={isoDateFromToday(0)}
            max={isoDateFromToday(90)}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-12 w-full rounded-full bg-transparent pl-11 pr-5 ring-1 ring-linen focus:outline-none focus:ring-2 focus:ring-wine/60"
          />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Truck size={16} /> Same-day delivery available on orders placed before {site.sameDayCutoff}.
        </p>
      </div>

      {/* Quantity + CTA */}
      <div className="flex flex-col gap-4 border-t border-linen pt-8 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between rounded-full ring-1 ring-linen sm:justify-start">
          <button type="button" className="flex size-12 items-center justify-center rounded-full hover:bg-cream" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center tabular-nums" aria-live="polite" aria-label={`Quantity ${qty}`}>{qty}</span>
          <button type="button" className="flex size-12 items-center justify-center rounded-full hover:bg-cream" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">
            <Plus size={16} />
          </button>
        </div>
        <Button type="submit" icon className="flex-1" disabled={adding}>
          {adding ? "Adding…" : added ? "Added to bag" : `Add to bag · ${formatPrice(total)}`}
        </Button>
      </div>
      {addError ? (
        <p role="alert" className="-mt-4 text-sm text-rose-deep">
          {addError}
        </p>
      ) : null}
    </form>
  );
}
