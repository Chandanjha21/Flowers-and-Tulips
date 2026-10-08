"use client";

import { useState } from "react";
import { SelectField, TextArea, TextField } from "./Field";
import { SuccessState } from "./SuccessState";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <SuccessState title="Message sent" action={<Button variant="outline" onClick={() => setSent(false)}>Send another</Button>}>
        Thank you for writing. We reply to every message within one business day, usually much sooner.
      </SuccessState>
    );
  }
  return (
    <form
      className="grid gap-5 rounded-[var(--radius-card)] bg-ivory p-6 shadow-soft ring-1 ring-linen sm:grid-cols-2 md:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <TextField id="c-name" name="name" label="Name" autoComplete="name" />
      <TextField id="c-email" name="email" label="Email" type="email" autoComplete="email" />
      <TextField id="c-phone" name="phone" label="Phone" type="tel" optional autoComplete="tel" />
      <SelectField id="c-topic" name="topic" label="Topic" defaultValue="General question">
        <option>General question</option>
        <option>An existing order</option>
        <option>Weddings & events</option>
        <option>Subscriptions</option>
        <option>Corporate accounts</option>
        <option>Press & collaborations</option>
      </SelectField>
      <TextArea id="c-message" name="message" label="Message" rows={6} className="sm:col-span-2" />
      <div className="sm:col-span-2">
        <Button type="submit" icon className="w-full sm:w-auto">Send message</Button>
      </div>
    </form>
  );
}
