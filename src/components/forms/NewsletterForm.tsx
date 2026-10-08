"use client";

import { useState } from "react";
import { ArrowRight, Check } from "@/components/ui/Icons";

export function NewsletterForm() {
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <p className="mt-4 flex items-center gap-2 text-ivory/90" role="status">
        <Check size={18} /> Thank you. Look out for our next letter.
      </p>
    );
  }
  return (
    <form
      className="mt-4 flex max-w-sm items-center rounded-full bg-ivory/10 p-1.5 ring-1 ring-ivory/25 focus-within:ring-ivory/60"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <input id="newsletter-email" type="email" required placeholder="Your email" autoComplete="email" className="min-w-0 flex-1 bg-transparent px-4 py-2 text-ivory placeholder:text-ivory/60 focus:outline-none" />
      <button type="submit" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ivory text-wine transition-transform duration-500 hover:scale-105" aria-label="Subscribe to newsletter">
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
