import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { Eyebrow } from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-page pb-24 pt-8 md:pt-12">
      <Eyebrow>Secure checkout</Eyebrow>
      <h1 className="mb-12 mt-4 text-h2 text-wine">Almost there</h1>
      <Suspense>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
