import type { Metadata } from "next";
import { Confirmation, type ConfirmationView } from "@/components/cart/Confirmation";
import { DemoConfirmation } from "@/components/cart/DemoConfirmation";
import { FRONTEND_ONLY } from "@/lib/mode";
import { getConfirmation } from "@/server/services/confirmation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false }, referrer: "no-referrer" };

const FALLBACK_IMAGE = { src: "/videos/handoff.jpg", alt: "" };

export default async function ConfirmationPage({ searchParams }: PageProps<"/checkout/confirmation">) {
  if (FRONTEND_ONLY) {
    return (
      <div className="container-page pb-24 pt-10 md:pt-16">
        <DemoConfirmation />
      </div>
    );
  }

  const { session_id } = await searchParams;
  const result = await getConfirmation(typeof session_id === "string" ? session_id : undefined);

  let view: ConfirmationView | null = null;
  if (result?.kind === "full") {
    const { order, items } = result;
    view = {
      number: order.number,
      state: order.status === "pending_payment" ? "pending" : ["expired", "cancelled"].includes(order.status) ? "failed" : "paid",
      senderName: order.senderName,
      senderEmail: order.senderEmail,
      recipientName: order.recipientName,
      addressLines: [order.addressLine1, order.addressLine2].filter((l): l is string => !!l),
      cityLine: `${order.city} ${order.zip}`,
      deliveryDate: order.deliveryDate,
      giftMessage: order.giftMessage,
      subtotal: order.subtotalCents / 100,
      delivery: order.deliveryFeeCents / 100,
      lines: items.map((i) => ({
        lineId: i.id,
        slug: i.productSlug,
        name: i.productName,
        image: i.imageUrl ? { src: i.imageUrl, alt: "" } : FALLBACK_IMAGE,
        size: i.size,
        unitPrice: i.unitPriceCents / 100,
        addOns: [],
        addOnNames: i.addOns.map((a) => a.name),
        cardMessage: i.cardMessage ?? undefined,
        quantity: i.quantity,
        lineTotal: i.lineTotalCents / 100,
      })),
    };
  }

  return (
    <div className="container-page pb-24 pt-10 md:pt-16">
      <Confirmation view={view} limitedNumber={result?.kind === "limited" ? result.number : undefined} />
    </div>
  );
}
