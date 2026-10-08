"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { colors, flowerTypes, occasions } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatDate, isoDateFromToday } from "@/lib/format";
import { TextArea, TextField } from "@/components/forms/Field";
import { SuccessState } from "@/components/forms/SuccessState";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowLeft, Check, Close, Upload } from "@/components/ui/Icons";

const budgets = ["$75 – $150", "$150 – $300", "$300 – $500", "$500+"];
const steps = ["Occasion", "Flowers & colors", "Budget & date", "Recipient", "Final touches"] as const;

interface State {
  occasion: string;
  flowers: string[];
  colors: string[];
  budget: string;
  date: string;
  delivery: "delivery" | "pickup";
  recipientName: string;
  recipientAddress: string;
  yourName: string;
  yourEmail: string;
  yourPhone: string;
  notes: string;
}

const initial: State = {
  occasion: "",
  flowers: [],
  colors: [],
  budget: "",
  date: isoDateFromToday(3),
  delivery: "delivery",
  recipientName: "",
  recipientAddress: "",
  yourName: "",
  yourEmail: "",
  yourPhone: "",
  notes: "",
};

export function CustomOrderWizard() {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>(initial);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const toggle = (k: "flowers" | "colors", v: string) => set(k, s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v]);

  const validate = (): string | null => {
    if (step === 0 && !s.occasion) return "Please choose an occasion.";
    if (step === 1 && !s.flowers.length && !s.colors.length) return "Pick at least one flower or color, or choose “Florist's choice”.";
    if (step === 2 && !s.budget) return "Please choose a budget range.";
    return null;
  };

  const next = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    setError(err);
    if (err) return;
    if (step < steps.length - 1) setStep(step + 1);
    else setDone(true);
  };

  if (done) {
    return (
      <SuccessState
        title="Our florist will contact you"
        action={<ButtonLink href="/shop" variant="outline">Browse the shop</ButtonLink>}
      >
        <p>
          Thank you, {s.yourName.split(" ")[0] || "friend"}. We&rsquo;ve received your custom request for {occasions.find((o) => o.key === s.occasion)?.label.toLowerCase()} on{" "}
          {formatDate(s.date)}. A designer will reach out to {s.yourEmail || "you"} within a few hours with a sketch and quote.
        </p>
      </SuccessState>
    );
  }

  return (
    <form onSubmit={next} noValidate={step < 3} className="rounded-[var(--radius-card)] bg-ivory p-6 shadow-soft ring-1 ring-linen md:p-10">
      {/* Progress */}
      <ol className="flex items-center gap-2" aria-label="Progress">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-2">
            <span className={cn("h-1 rounded-full transition-colors duration-700", i <= step ? "bg-wine" : "bg-linen")} />
            <span className={cn("hidden text-xs md:block", i === step ? "text-wine" : "text-muted")} aria-current={i === step ? "step" : undefined}>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className="mt-10 text-h3 text-wine focus:outline-none">
        <span className="mr-3 font-display italic text-rose-deep">0{step + 1}</span>
        {["What's the occasion?", "Which flowers & colors do they love?", "Budget and timing", "Who is it for?", "Anything else we should know?"][step]}
      </h2>

      <div key={step} className="mt-8 animate-rise">
        {step === 0 ? (
          <fieldset>
            <legend className="sr-only">Occasion</legend>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {occasions.map((o) => (
                <label key={o.key} className="group cursor-pointer">
                  <input type="radio" name="occasion" className="peer sr-only" checked={s.occasion === o.key} onChange={() => set("occasion", o.key)} />
                  <span className="block overflow-hidden rounded-2xl ring-1 ring-linen transition-all duration-500 peer-checked:ring-2 peer-checked:ring-wine peer-focus-visible:ring-2 peer-focus-visible:ring-wine peer-focus-visible:ring-offset-2">
                    <span className="relative block aspect-[4/3] bg-cream">
                      <Image src={o.image.src} alt="" fill sizes="(min-width:768px) 16vw, 45vw" quality={60} className="object-cover" />
                    </span>
                    <span className="block px-3 py-2.5 text-center text-sm">{o.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <div className="space-y-10">
            <fieldset>
              <legend className="eyebrow text-ink">Flowers</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...flowerTypes, { key: "florist", label: "Florist's choice" }].map((f) => (
                  <Chip key={f.key} label={f.label} checked={s.flowers.includes(f.key)} onChange={() => toggle("flowers", f.key)} />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow text-ink">Color palette</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {colors.map((c) => (
                  <label key={c.key} className="flex cursor-pointer flex-col items-center gap-2 text-xs">
                    <input type="checkbox" className="peer sr-only" checked={s.colors.includes(c.key)} onChange={() => toggle("colors", c.key)} />
                    <span className="size-12 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-ivory transition-shadow peer-checked:ring-2 peer-checked:ring-wine peer-focus-visible:ring-2 peer-focus-visible:ring-wine" style={{ background: c.swatch }} aria-hidden="true" />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-10">
            <fieldset>
              <legend className="eyebrow text-ink">Budget</legend>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {budgets.map((b) => (
                  <label key={b} className="cursor-pointer">
                    <input type="radio" name="budget" className="peer sr-only" checked={s.budget === b} onChange={() => set("budget", b)} />
                    <span className="flex min-h-16 items-center justify-center rounded-2xl px-3 text-center font-display text-xl text-wine ring-1 ring-linen transition-all peer-checked:bg-cream peer-checked:ring-2 peer-checked:ring-wine peer-focus-visible:ring-2 peer-focus-visible:ring-wine peer-focus-visible:ring-offset-2">{b}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField id="co-date" label="Date needed" type="date" min={isoDateFromToday(1)} value={s.date} onChange={(e) => set("date", e.target.value)} />
              <fieldset>
                <legend className="text-sm font-medium text-ink">Delivery or pickup</legend>
                <div className="mt-2 flex rounded-full p-1 ring-1 ring-linen">
                  {(["delivery", "pickup"] as const).map((d) => (
                    <label key={d} className="flex-1 cursor-pointer">
                      <input type="radio" name="delivery" className="peer sr-only" checked={s.delivery === d} onChange={() => set("delivery", d)} />
                      <span className="flex min-h-10 items-center justify-center rounded-full text-sm capitalize transition-colors peer-checked:bg-wine peer-checked:text-ivory peer-focus-visible:ring-2 peer-focus-visible:ring-wine">{d}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="co-rname" label="Recipient name" value={s.recipientName} onChange={(e) => set("recipientName", e.target.value)} />
            <TextField id="co-raddr" label={s.delivery === "pickup" ? "Pickup by (name)" : "Delivery address"} optional={s.delivery === "pickup"} value={s.recipientAddress} onChange={(e) => set("recipientAddress", e.target.value)} />
            <TextField id="co-yname" label="Your name" autoComplete="name" value={s.yourName} onChange={(e) => set("yourName", e.target.value)} />
            <TextField id="co-yemail" label="Your email" type="email" autoComplete="email" value={s.yourEmail} onChange={(e) => set("yourEmail", e.target.value)} />
            <TextField id="co-yphone" label="Your phone" type="tel" optional autoComplete="tel" value={s.yourPhone} onChange={(e) => set("yourPhone", e.target.value)} />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-8 md:grid-cols-2">
            <TextArea id="co-notes" label="Notes for our florist" optional rows={7} placeholder="The story behind it, their favorite flower, a vase you'd like us to use…" value={s.notes} onChange={(e) => set("notes", e.target.value)} />
            <div>
              <p className="text-sm font-medium text-ink">Reference image <span className="font-normal text-muted">(optional)</span></p>
              {preview ? (
                <div className="relative mt-2 overflow-hidden rounded-2xl ring-1 ring-linen">
                  {/* Local blob preview only; nothing is uploaded */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.url} alt={`Preview of ${preview.name}`} className="aspect-[4/3] w-full object-cover" />
                  <button type="button" onClick={() => setPreview(null)} className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-ivory/90 text-ink" aria-label="Remove image">
                    <Close size={18} />
                  </button>
                </div>
              ) : (
                <label htmlFor="co-file" className="mt-2 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose/60 bg-cream/50 text-center text-sm text-muted transition-colors hover:bg-cream has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-wine">
                  <Upload size={28} className="text-rose-deep" />
                  <span><span className="text-wine underline underline-offset-4">Choose an image</span> or drag it here</span>
                  <span className="text-xs">JPG or PNG, up to 10 MB. Previewed locally only.</span>
                  <input
                    id="co-file"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPreview({ url: URL.createObjectURL(file), name: file.name });
                    }}
                  />
                </label>
              )}
            </div>
            <div className="rounded-2xl bg-cream/60 p-5 text-sm md:col-span-2">
              <p className="eyebrow text-muted">Your request</p>
              <p className="mt-2 text-ink">
                {occasions.find((o) => o.key === s.occasion)?.label} · {s.budget} · {formatDate(s.date)} · {s.delivery}
                {s.flowers.length ? ` · ${s.flowers.map((f) => flowerTypes.find((x) => x.key === f)?.label ?? "Florist's choice").join(", ")}` : ""}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p role="alert" className="mt-6 text-sm text-rose-deep">{error}</p> : null}

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-linen pt-6">
        {step > 0 ? (
          <button type="button" onClick={() => { setError(null); setStep(step - 1); }} className="flex min-h-11 items-center gap-2 text-sm uppercase tracking-[0.14em] text-muted hover:text-wine">
            <ArrowLeft size={16} /> Back
          </button>
        ) : <span />}
        <Button type="submit" icon>{step === steps.length - 1 ? "Send request" : "Continue"}</Button>
      </div>
    </form>
  );
}

function Chip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm ring-1 ring-linen transition-colors peer-checked:bg-wine peer-checked:text-ivory peer-checked:ring-wine peer-focus-visible:ring-2 peer-focus-visible:ring-wine peer-focus-visible:ring-offset-2">
        {checked ? <Check size={14} strokeWidth={2} /> : null}
        {label}
      </span>
    </label>
  );
}
