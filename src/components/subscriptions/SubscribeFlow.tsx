"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { SubscriptionPlan } from "@/types";
import { formatDate, formatPrice, isoDateFromToday } from "@/lib/format";
import { SelectField, TextField } from "@/components/forms/Field";
import { Button } from "@/components/ui/Button";
import { Check, Close } from "@/components/ui/Icons";
import { LeafDivider } from "@/components/ui/Botanicals";
import { cn } from "@/lib/cn";

const Ctx = createContext<(plan: SubscriptionPlan) => void>(() => {});

/** Provides a single subscribe dialog for every "Subscribe" button on the page. */
export function SubscribeProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  return (
    <Ctx.Provider value={setPlan}>
      {children}
      <SubscribeDialog plan={plan} onClose={() => setPlan(null)} />
    </Ctx.Provider>
  );
}

export function SubscribeButton({ plan, variant = "primary", className }: { plan: SubscriptionPlan; variant?: "primary" | "outline" | "light"; className?: string }) {
  const open = useContext(Ctx);
  return (
    <Button type="button" variant={variant} icon className={className} onClick={() => open(plan)}>
      Subscribe
    </Button>
  );
}

function SubscribeDialog({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [opts, setOpts] = useState({ start: isoDateFromToday(2), term: "ongoing", color: "Blush", gift: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (plan && !el.open) {
      setStep(0);
      el.showModal();
    }
    if (!plan && el.open) el.close();
  }, [plan]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label={plan ? `Subscribe to ${plan.name}` : "Subscribe"}
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-[var(--radius-card)] bg-ivory p-0 shadow-float open:animate-rise"
    >
      {plan ? (
        <div>
          <div className="relative h-40 overflow-hidden sm:h-48">
            <Image src={plan.image.src} alt="" fill sizes="672px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
            <div className="on-dark absolute bottom-5 left-6 text-ivory">
              <p className="eyebrow text-blush">{plan.frequency}</p>
              <p className="font-display text-h3">{plan.name}</p>
            </div>
            <button type="button" onClick={onClose} className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-ivory/90 text-ink" aria-label="Close">
              <Close />
            </button>
          </div>

          <div className="p-6 md:p-8">
            <ol className="flex gap-2" aria-label="Progress">
              {["Options", "Details", "Confirmed"].map((l, i) => (
                <li key={l} className="flex-1">
                  <span className={cn("block h-1 rounded-full", i <= step ? "bg-wine" : "bg-linen")} />
                  <span className={cn("mt-2 block text-xs", i === step ? "text-wine" : "text-muted")} aria-current={i === step ? "step" : undefined}>{l}</span>
                </li>
              ))}
            </ol>

            {step === 0 ? (
              <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setStep(1); }}>
                <TextField id="sub-start" label="First delivery" type="date" min={isoDateFromToday(1)} value={opts.start} onChange={(e) => setOpts({ ...opts, start: e.target.value })} />
                <SelectField id="sub-term" label="Term" value={opts.term} onChange={(e) => setOpts({ ...opts, term: e.target.value })}>
                  <option value="ongoing">Ongoing (pause anytime)</option>
                  <option value="1">1 month</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </SelectField>
                {plan.id === "daily-roses" ? (
                  <SelectField id="sub-color" label="Rose color" value={opts.color} onChange={(e) => setOpts({ ...opts, color: e.target.value })} className="sm:col-span-2">
                    {["Blush", "Classic red", "Ivory", "Florist's pick (changes weekly)"].map((c) => <option key={c}>{c}</option>)}
                  </SelectField>
                ) : null}
                <label className="flex cursor-pointer items-center gap-3 text-sm sm:col-span-2">
                  <input type="checkbox" checked={opts.gift} onChange={(e) => setOpts({ ...opts, gift: e.target.checked })} className="size-5 accent-[var(--color-wine)]" />
                  This subscription is a gift
                </label>
                <div className="flex items-center justify-between gap-4 border-t border-linen pt-6 sm:col-span-2">
                  <p><span className="font-display text-h3 text-wine">{formatPrice(plan.price)}</span> <span className="text-sm text-muted">{plan.priceUnit}</span></p>
                  <Button type="submit" icon>Continue</Button>
                </div>
              </form>
            ) : null}

            {step === 1 ? (
              <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <TextField id="sub-name" label={opts.gift ? "Recipient name" : "Full name"} autoComplete={opts.gift ? "off" : "name"} />
                <TextField id="sub-email" label="Your email" type="email" autoComplete="email" />
                <TextField id="sub-address" label="Delivery address" autoComplete="street-address" className="sm:col-span-2" />
                <TextField id="sub-zip" label="ZIP code" inputMode="numeric" pattern="[0-9]{5}" autoComplete="postal-code" />
                <TextField id="sub-phone" label="Phone" type="tel" optional autoComplete="tel" />
                <p className="text-xs text-muted sm:col-span-2">Demonstration only. No payment is taken.</p>
                <div className="flex items-center justify-between gap-4 border-t border-linen pt-6 sm:col-span-2">
                  <button type="button" onClick={() => setStep(0)} className="min-h-11 text-sm uppercase tracking-[0.14em] text-muted hover:text-wine">Back</button>
                  <Button type="submit" icon>Start subscription</Button>
                </div>
              </form>
            ) : null}

            {step === 2 ? (
              <div role="status" className="mt-8 animate-rise text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-sage-deep text-ivory"><Check size={24} /></span>
                <p className="mt-5 font-display text-h3 text-wine">Welcome to {plan.name}</p>
                <p className="mx-auto mt-3 max-w-sm text-muted">
                  Your first delivery arrives {formatDate(opts.start)}.{plan.id === "daily-roses" ? ` ${opts.color} roses, every morning.` : ""} A confirmation is on its way.
                </p>
                <LeafDivider className="mx-auto mt-6 text-gold" />
                <Button type="button" variant="outline" className="mt-6" onClick={onClose}>Done</Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
