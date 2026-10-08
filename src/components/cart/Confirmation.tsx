import type { CartLine } from "@/types";
import { OrderSummary } from "./OrderSummary";
import { ButtonLink } from "@/components/ui/Button";
import { CornerBloom, LeafDivider } from "@/components/ui/Botanicals";
import { Script } from "@/components/ui/SectionHeading";
import { formatDate } from "@/lib/format";
import { RefreshCartOnMount } from "./RefreshCartOnMount";

/** Everything the confirmation page shows, independent of where the order came from. */
export interface ConfirmationView {
  number: string;
  state: "paid" | "pending" | "failed";
  senderName: string;
  senderEmail: string;
  recipientName: string;
  addressLines: string[];
  cityLine: string;
  deliveryDate: string;
  giftMessage?: string | null;
  lines: CartLine[];
  subtotal: number;
  delivery: number;
}

export function Confirmation({ view, limitedNumber }: { view: ConfirmationView | null; limitedNumber?: string }) {
  const paid = view?.state === "paid";
  const eyebrow = view ? `Order ${view.number}` : limitedNumber ? `Order ${limitedNumber}` : "Thank you";
  const lead = view
    ? paid
      ? `Thank you, ${view.senderName.split(" ")[0]}. Our florists will design your order fresh on ${formatDate(view.deliveryDate)} and email a photo to ${view.senderEmail} before it leaves the studio.`
      : view.state === "pending"
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
          {view && !paid ? "Almost there" : <>Your flowers are <Script>blooming</Script></>}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lead text-muted">{lead}</p>
        <LeafDivider className="mx-auto mt-10 text-gold" />
      </div>

      {view ? (
        <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-[var(--radius-card)] bg-cream/60 p-8 ring-1 ring-linen">
            <div>
              <p className="eyebrow text-muted">Delivering to</p>
              <p className="mt-2 font-display text-2xl text-wine">{view.recipientName}</p>
              <p className="text-muted">
                {view.addressLines.join(", ")}
                <br />
                {view.cityLine}
              </p>
            </div>
            <div>
              <p className="eyebrow text-muted">Delivery date</p>
              <p className="mt-2 text-ink">{formatDate(view.deliveryDate)}</p>
            </div>
            {view.giftMessage ? (
              <div>
                <p className="eyebrow text-muted">Gift message</p>
                <p className="mt-2 font-display text-xl italic text-ink">&ldquo;{view.giftMessage}&rdquo;</p>
              </div>
            ) : null}
          </div>
          <OrderSummary lines={view.lines} subtotal={view.subtotal} delivery={view.delivery} title="What we're making" />
        </div>
      ) : null}

      <div className="mt-14 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/shop">Continue shopping</ButtonLink>
        <ButtonLink href="/subscriptions" variant="outline">Make it a habit</ButtonLink>
      </div>
    </div>
  );
}
