"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Minus, Plus } from "@/components/ui/Icons";
import { Sprig } from "@/components/ui/Botanicals";
import { formatDate, formatPrice } from "@/lib/format";
import { site } from "@/config/site";
import { lineTotal, useCart } from "./CartProvider";

export function CartDrawer() {
  const cart = useCart();
  const router = useRouter();
  const remaining = site.freeDeliveryOver - cart.subtotal;

  return (
    <Drawer
      open={cart.isOpen}
      onClose={cart.close}
      title={`Your bag${cart.count ? ` (${cart.count})` : ""}`}
      footer={
        cart.lines.length ? (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow text-muted">Subtotal</span>
              <span className="font-display text-h3 text-wine">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="text-sm text-muted">
              {remaining > 0 ? `Add ${formatPrice(remaining)} more for free local delivery.` : "You've unlocked free local delivery."}
            </p>
            {cart.error ? <p role="alert" className="text-sm text-rose-deep">{cart.error}</p> : null}
            {cart.hasIssues ? <p className="text-sm text-rose-deep">Remove unavailable items to continue.</p> : null}
            <Button
              className="w-full"
              icon
              disabled={cart.hasIssues}
              onClick={() => {
                cart.close();
                router.push("/checkout");
              }}
            >
              Checkout
            </Button>
          </div>
        ) : null
      }
    >
      {cart.lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Sprig className="w-14 text-sage" />
          <p className="mt-6 font-display text-h3 text-wine">Your bag is empty</p>
          <p className="mt-2 text-muted">Let&rsquo;s find something beautiful.</p>
          <ButtonLink href="/shop" className="mt-8" onClick={cart.close}>
            Shop flowers
          </ButtonLink>
        </div>
      ) : (
        <div className="space-y-8">
          <ul className="divide-y divide-linen">
            {cart.lines.map((line) => (
              <li key={line.lineId} className="flex gap-4 py-5 first:pt-0">
                <Link href={`/shop/${line.slug}`} onClick={cart.close} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-t-full rounded-b-xl bg-cream">
                  <Image src={line.image.src} alt={line.image.alt} fill sizes="96px" className="object-cover" quality={60} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <p className="font-display text-xl leading-tight text-wine">{line.name}</p>
                    <p className="shrink-0 font-medium">{formatPrice(lineTotal(line))}</p>
                  </div>
                  <p className="mt-1 text-sm capitalize text-muted">{line.size}</p>
                  {line.addOnNames?.length ? <p className="text-sm text-muted">+ {line.addOnNames.join(", ")}</p> : null}
                  {line.issue ? <p role="alert" className="text-sm font-medium text-rose-deep">{line.issue}</p> : null}
                  {line.deliveryDate ? <p className="text-sm text-muted">Delivery: {formatDate(line.deliveryDate)}</p> : null}
                  {line.cardMessage ? <p className="mt-1 line-clamp-2 text-sm italic text-muted">&ldquo;{line.cardMessage}&rdquo;</p> : null}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full ring-1 ring-linen">
                      <button type="button" className="flex size-9 items-center justify-center rounded-full hover:bg-cream" aria-label={`Decrease quantity of ${line.name}`} onClick={() => cart.updateQuantity(line.lineId, line.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{line.quantity}</span>
                      <button type="button" className="flex size-9 items-center justify-center rounded-full hover:bg-cream" aria-label={`Increase quantity of ${line.name}`} onClick={() => cart.updateQuantity(line.lineId, line.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button type="button" onClick={() => cart.remove(line.lineId)} className="link-underline text-sm text-muted hover:text-wine">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div>
            <label htmlFor="gift-message" className="eyebrow text-muted">Gift message (optional)</label>
            <textarea
              id="gift-message"
              rows={3}
              maxLength={240}
              value={cart.giftMessage}
              onChange={(e) => cart.setGiftMessage(e.target.value)}
              placeholder="Write a note for the recipient…"
              className="mt-3 w-full resize-none rounded-2xl bg-cream/70 px-4 py-3 ring-1 ring-linen placeholder:text-muted/80 focus:outline-none focus:ring-wine/50"
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}
