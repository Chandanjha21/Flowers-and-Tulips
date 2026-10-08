import Image from "next/image";
import type { CartLine } from "@/types";
import { formatDate, formatPrice } from "@/lib/format";
import { lineTotal } from "./CartProvider";

export function OrderSummary({ lines, subtotal, delivery, title = "Order summary" }: { lines: CartLine[]; subtotal: number; delivery: number; title?: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-ivory p-6 shadow-soft ring-1 ring-linen md:p-8">
      <h2 className="font-display text-h3 text-wine">{title}</h2>
      <ul className="mt-6 divide-y divide-linen">
        {lines.map((l) => (
          <li key={l.lineId} className="flex gap-4 py-4">
            <span className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-t-full rounded-b-lg bg-cream">
              <Image src={l.image.src} alt="" fill sizes="64px" quality={60} className="object-cover" />
              <span className="absolute -right-0 top-0 flex size-5 items-center justify-center rounded-full bg-wine text-[0.6875rem] text-ivory">{l.quantity}</span>
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-display text-lg leading-tight text-wine">{l.name}</p>
              <p className="capitalize text-muted">{l.size}</p>
              {l.addOnNames?.length ? <p className="text-muted">+ {l.addOnNames.join(", ")}</p> : null}
              {l.issue ? <p className="font-medium text-rose-deep">{l.issue}</p> : null}
              {l.deliveryDate ? <p className="text-muted">{formatDate(l.deliveryDate)}</p> : null}
            </div>
            <p className="text-sm font-medium">{formatPrice(lineTotal(l))}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-linen pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Local delivery</dt><dd>{delivery ? formatPrice(delivery) : "Free"}</dd></div>
        <div className="flex items-baseline justify-between border-t border-linen pt-4">
          <dt className="eyebrow text-ink">Total</dt>
          <dd className="font-display text-h3 text-wine">{formatPrice(subtotal + delivery)}</dd>
        </div>
      </dl>
    </div>
  );
}
