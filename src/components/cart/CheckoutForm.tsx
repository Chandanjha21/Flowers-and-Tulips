"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { site } from "@/config/site";
import { api, ApiError } from "@/lib/api";
import { FRONTEND_ONLY } from "@/lib/mode";
import { checkoutSchema } from "@/lib/validation";
import { DEMO_ORDER_KEY } from "./DemoConfirmation";
import type { ConfirmationView } from "./Confirmation";
import { isoDateFromToday } from "@/lib/format";
import { FormSection, TextArea, TextField } from "@/components/forms/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Shield } from "@/components/ui/Icons";
import { Sprig } from "@/components/ui/Botanicals";
import { useCart } from "./CartProvider";
import { OrderSummary } from "./OrderSummary";

export function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();
  const canceled = useSearchParams().get("canceled") === "1";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; fields?: string[] } | null>(null);
  const firstDate = cart.lines.find((l) => l.deliveryDate)?.deliveryDate ?? isoDateFromToday(1);

  if (!cart.ready) {
    return <p className="py-20 text-center text-muted">Loading your bag…</p>;
  }

  if (cart.lines.length === 0 && !submitting) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <Sprig className="mx-auto w-14 text-sage" />
        <h2 className="mt-6 text-h2 text-wine">Your bag is empty</h2>
        <p className="mt-3 text-muted">Add a bouquet or two, then come back to check out.</p>
        <ButtonLink href="/shop" className="mt-8">Shop flowers</ButtonLink>
      </div>
    );
  }

  return (
    <form
      className="grid gap-10 lg:grid-cols-12 lg:gap-14"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const data = new FormData(e.currentTarget);
        const get = (k: string) => String(data.get(k) ?? "").trim();
        const body = {
          recipient: { name: get("r-name"), phone: get("r-phone"), addressLine1: get("r-address"), addressLine2: get("r-apt"), city: get("r-city"), zip: get("r-zip") },
          delivery: { date: get("d-date"), window: get("d-window"), notes: get("d-notes") },
          giftMessage: get("gift"),
          sender: { name: get("s-name"), email: get("s-email"), phone: get("s-phone") },
        };

        if (FRONTEND_ONLY) {
          // Demo: validate with the same rules as the server, then show a confirmation. No payment.
          const parsed = checkoutSchema.safeParse(body);
          if (!parsed.success) {
            setSubmitting(false);
            setError({ message: "Please check the highlighted details.", fields: parsed.error.issues.map((i) => i.path.join(".")) });
            return;
          }
          const o = parsed.data;
          const view: ConfirmationView = {
            number: `FT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            state: "paid",
            senderName: o.sender.name,
            senderEmail: o.sender.email,
            recipientName: o.recipient.name,
            addressLines: [o.recipient.addressLine1, o.recipient.addressLine2].filter((l): l is string => !!l),
            cityLine: `${o.recipient.city} ${o.recipient.zip}`,
            deliveryDate: o.delivery.date,
            giftMessage: o.giftMessage,
            lines: cart.lines,
            subtotal: cart.subtotal,
            delivery: cart.deliveryFee,
          };
          try {
            window.sessionStorage.setItem(DEMO_ORDER_KEY, JSON.stringify(view));
          } catch {}
          await cart.clear();
          router.push("/checkout/confirmation");
          return;
        }

        try {
          const { url } = await api<{ url: string }>("/api/checkout", { method: "POST", body });
          // Hand off to Stripe's hosted payment page. Card details never touch our site.
          window.location.assign(url);
        } catch (err) {
          setSubmitting(false);
          if (err instanceof ApiError) {
            const fields = Array.isArray(err.details) ? (err.details as { path?: string }[]).map((d) => d.path).filter((p): p is string => !!p) : undefined;
            setError({ message: err.message, fields });
            if (err.status === 409) void cart.refresh();
          } else {
            setError({ message: "We couldn't start checkout. Please try again." });
          }
        }
      }}
    >
      <div className="space-y-6 lg:col-span-7">
        {canceled ? (
          <p role="status" className="rounded-2xl bg-cream px-5 py-4 text-sm text-ink ring-1 ring-linen">
            Payment was cancelled and you have not been charged. Your bag is still here when you&rsquo;re ready.
          </p>
        ) : null}

        <FormSection title="Recipient" step="01">
          <TextField id="r-name" name="r-name" label="Full name" required maxLength={100} autoComplete="shipping name" className="sm:col-span-2" />
          <TextField id="r-address" name="r-address" label="Street address" required maxLength={200} autoComplete="shipping address-line1" className="sm:col-span-2" />
          <TextField id="r-apt" name="r-apt" label="Apartment, suite, floor" optional maxLength={200} autoComplete="shipping address-line2" />
          <TextField id="r-phone" name="r-phone" label="Recipient phone" type="tel" required autoComplete="shipping tel" hint="Only used if our driver can't find the address." />
          <TextField id="r-city" name="r-city" label="City" required maxLength={100} defaultValue={site.address.city} autoComplete="shipping address-level2" />
          <TextField id="r-zip" name="r-zip" label="ZIP code" required inputMode="numeric" pattern="[0-9]{5}" autoComplete="shipping postal-code" />
        </FormSection>

        <FormSection title="Delivery" step="02">
          <TextField id="d-date" name="d-date" label="Delivery date" type="date" required min={isoDateFromToday(0)} max={isoDateFromToday(site.maxDaysAhead)} defaultValue={firstDate} hint={`Same-day orders close at ${site.sameDayCutoff}.`} />
          <TextField id="d-window" name="d-window" label="Preferred window" optional maxLength={100} placeholder="e.g. after 2 pm" />
          <TextArea id="d-notes" name="d-notes" label="Delivery instructions" optional maxLength={500} placeholder="Gate code, leave with concierge…" className="sm:col-span-2" rows={3} />
          <TextArea id="gift" name="gift" label="Gift message" optional defaultValue={cart.giftMessage} maxLength={240} className="sm:col-span-2" rows={3} />
        </FormSection>

        <FormSection title="Your details" step="03">
          <TextField id="s-name" name="s-name" label="Your name" required maxLength={100} autoComplete="name" />
          <TextField id="s-email" name="s-email" label="Email" type="email" required maxLength={254} autoComplete="email" hint="We'll send your confirmation and delivery photo here." />
          <TextField id="s-phone" name="s-phone" label="Phone" type="tel" optional autoComplete="tel" />
        </FormSection>

        <FormSection title="Payment" step="04">
          <p className="flex items-start gap-3 text-sm text-muted sm:col-span-2">
            <Shield size={20} className="mt-0.5 shrink-0 text-sage-deep" />
            {FRONTEND_ONLY
              ? "This is a demonstration store. No payment is taken and no order is sent."
              : "You\u2019ll pay on Stripe\u2019s secure checkout page. We never see or store your card details."}
          </p>
          {!FRONTEND_ONLY && process.env.NEXT_PUBLIC_DEMO_MODE === "1" ? (
            <p role="note" className="rounded-2xl bg-cream px-5 py-4 text-sm text-ink ring-1 ring-linen sm:col-span-2">
              <span className="eyebrow text-rose-deep">Demo store</span>
              <br />
              No real charge is made. Pay with test card <span className="font-medium tabular-nums">4242 4242 4242 4242</span>, any future expiry date and any 3-digit CVC.
            </p>
          ) : null}
        </FormSection>
      </div>

      <aside className="lg:col-span-5">
        <div className="space-y-6 lg:sticky lg:top-28">
          <OrderSummary lines={cart.lines} subtotal={cart.subtotal} delivery={cart.deliveryFee} />
          {error ? (
            <div role="alert" className="rounded-2xl bg-cream px-5 py-4 text-sm text-rose-deep ring-1 ring-linen">
              <p>{error.message}</p>
              {error.fields?.length ? <p className="mt-1 text-muted">Please check: {error.fields.join(", ")}</p> : null}
            </div>
          ) : null}
          <Button type="submit" icon className="w-full" disabled={submitting || cart.hasIssues}>
            {FRONTEND_ONLY ? (submitting ? "Placing order…" : "Place demo order") : submitting ? "Opening secure payment…" : "Continue to payment"}
          </Button>
        </div>
      </aside>
    </form>
  );
}
