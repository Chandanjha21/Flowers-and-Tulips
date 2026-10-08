import type { CartLine } from "@/types";
import type { Confirmation as Result } from "@/server/services/confirmation";
import { OrderSummary } from "./OrderSummary";
import { ButtonLink } from "@/components/ui/Button";
import { CornerBloom, LeafDivider } from "@/components/ui/Botanicals";
import { Script } from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/format";
import { RefreshCartOnMount } from "./RefreshCartOnMount";

const FALLBACK_IMAGE = { src: "/videos/handoff.jpg", alt: "" };

export function Confirmation({ result }: { result: Result }) {
  const order = result?.kind === "full" ? result.order : null;
  const paid = order ? order.status !== "pending_payment" && order.status !== "expired" && order.status !== "cancelled" : false;

  const lines: CartLine[] =
    result?.kind === "full"
      ? result.items.map((i) => ({
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
        }))
      : [];

  const eyebrow = order ? `Order ${order.number}` : result?.kind === "limited" ? `Order ${result.number}` : "Thank you";
  const lead = order
    ? paid
      ? `Thank you, ${order.senderName.split(" ")[0]}. Our florists will design your order fresh on ${formatDate(order.deliveryDate)} and email a photo to ${order.senderEmail} before it leaves the studio.`
      : order.status === "pending_payment"
        ? "We're waiting for your payment to be confirmed. This usually takes a few seconds; refresh this page shortly."
        : "This checkout was not completed and you have not been charged."
    : "Your order has been received. A confirmation is on its way to your inbox.";

  return (
    <div className="relative">
      {paid ? <RefreshCartOnMount /> : null}
      <CornerBloom className="pointer-events-none absolute -top-6 right-0 hidden w-64 text-rose/40 md:block" />
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-rose-deep">{eyebrow}</p>
        <h1 className="mt-5 text-h1 text-wine">
          {order && !paid ? "Almost there" : <>Your flowers are <Script>blooming</Script></>}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lead text-muted">{lead}</p>
        <LeafDivider className="mx-auto mt-10 text-gold" />
      </div>

      {order ? (
        <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-[var(--radius-card)] bg-cream/60 p-8 ring-1 ring-linen">
            <div>
              <p className="eyebrow text-muted">Delivering to</p>
              <p className="mt-2 font-display text-2xl text-wine">{order.recipientName}</p>
              <p className="text-muted">
                {[order.addressLine1, order.addressLine2].filter(Boolean).join(", ")}
                <br />
                {order.city} {order.zip}
              </p>
            </div>
            <div>
              <p className="eyebrow text-muted">Delivery date</p>
              <p className="mt-2 text-ink">{formatDate(order.deliveryDate)}</p>
            </div>
            {order.giftMessage ? (
              <div>
                <p className="eyebrow text-muted">Gift message</p>
                <p className="mt-2 font-display text-xl italic text-ink">&ldquo;{order.giftMessage}&rdquo;</p>
              </div>
            ) : null}
          </div>
          <OrderSummary lines={lines} subtotal={order.subtotalCents / 100} delivery={order.deliveryFeeCents / 100} title="What we're making" />
        </div>
      ) : null}

      <div className="mt-14 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/shop">Continue shopping</ButtonLink>
        <ButtonLink href="/subscriptions" variant="outline">Make it a habit</ButtonLink>
      </div>
    </div>
  );
}
