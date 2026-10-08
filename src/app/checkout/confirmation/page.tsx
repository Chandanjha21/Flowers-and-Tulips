import type { Metadata } from "next";
import { Confirmation } from "@/components/cart/Confirmation";
import { getConfirmation } from "@/server/services/confirmation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false }, referrer: "no-referrer" };

export default async function ConfirmationPage({ searchParams }: PageProps<"/checkout/confirmation">) {
  const { session_id } = await searchParams;
  const result = await getConfirmation(typeof session_id === "string" ? session_id : undefined);
  return (
    <div className="container-page pb-24 pt-10 md:pt-16">
      <Confirmation result={result} />
    </div>
  );
}
