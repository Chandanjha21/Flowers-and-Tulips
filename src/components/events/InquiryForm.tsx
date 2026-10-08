"use client";

import { useState } from "react";
import { TextArea, TextField, SelectField } from "@/components/forms/Field";
import { SuccessState } from "@/components/forms/SuccessState";
import { Button } from "@/components/ui/Button";
import { isoDateFromToday } from "@/lib/format";

export function InquiryForm() {
  const [sent, setSent] = useState<string | null>(null);

  if (sent) {
    return (
      <SuccessState title="Inquiry received" action={<Button variant="outline" onClick={() => setSent(null)}>Send another</Button>}>
        Thank you, {sent}. Our event designer will be in touch within one business day to schedule your consultation.
      </SuccessState>
    );
  }

  return (
    <form
      className="grid gap-5 rounded-[var(--radius-card)] bg-ivory p-6 shadow-soft ring-1 ring-linen sm:grid-cols-2 md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        const name = String(new FormData(e.currentTarget).get("name") ?? "").split(" ")[0];
        setSent(name || "friend");
      }}
    >
      <TextField id="ev-name" name="name" label="Your name" autoComplete="name" />
      <TextField id="ev-email" name="email" label="Email" type="email" autoComplete="email" />
      <TextField id="ev-phone" name="phone" label="Phone" type="tel" optional autoComplete="tel" />
      <SelectField id="ev-type" name="type" label="Event type" defaultValue="">
        <option value="" disabled>Select…</option>
        <option>Wedding</option>
        <option>Engagement</option>
        <option>Corporate event</option>
        <option>Birthday or celebration</option>
        <option>Baby or bridal shower</option>
        <option>Graduation</option>
        <option>Sympathy / memorial</option>
        <option>Other</option>
      </SelectField>
      <TextField id="ev-date" name="date" label="Event date" type="date" min={isoDateFromToday(1)} />
      <SelectField id="ev-guests" name="guests" label="Guest count" defaultValue="">
        <option value="" disabled>Select…</option>
        <option>Under 50</option>
        <option>50 – 100</option>
        <option>100 – 200</option>
        <option>200+</option>
      </SelectField>
      <TextField id="ev-venue" name="venue" label="Venue" optional className="sm:col-span-2" />
      <SelectField id="ev-budget" name="budget" label="Floral budget" className="sm:col-span-2" defaultValue="">
        <option value="" disabled>Select…</option>
        <option>$1,000 – $2,500</option>
        <option>$2,500 – $5,000</option>
        <option>$5,000 – $10,000</option>
        <option>$10,000+</option>
      </SelectField>
      <TextArea id="ev-notes" name="notes" label="Tell us about your vision" optional placeholder="Colors, mood, must-have flowers, Pinterest links…" className="sm:col-span-2" />
      <div className="sm:col-span-2">
        <Button type="submit" icon className="w-full sm:w-auto">Send inquiry</Button>
      </div>
    </form>
  );
}
