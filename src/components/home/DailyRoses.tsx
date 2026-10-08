import Image from "next/image";
import type { SubscriptionPlan } from "@/types";
import { images } from "@/data/media";
import { formatPrice } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { CornerBloom, CurveEdge } from "@/components/ui/Botanicals";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function DailyRoses({ plans }: { plans: SubscriptionPlan[] }) {
  return (
    <section className="on-dark relative text-ivory" aria-labelledby="daily-title">
      <CurveEdge className="text-wine" />
      <div className="relative overflow-hidden bg-wine">
        <CornerBloom className="pointer-events-none absolute -right-10 -top-6 w-72 text-ivory/10 md:w-96" />
        <div className="container-page section-y grid items-center gap-16 lg:grid-cols-12">
          <Reveal className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <div className="relative aspect-[3/4] overflow-hidden arch ring-1 ring-ivory/20 ring-offset-8 ring-offset-wine">
              <Image src={images.singleRose.src} alt={images.singleRose.alt} fill sizes="(min-width:1024px) 38vw, 90vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl bg-ivory px-5 py-4 text-ink shadow-float sm:left-auto sm:right-[-1.5rem] sm:w-64 sm:translate-x-0">
              <p className="eyebrow text-rose-deep">Tomorrow, 8:00 am</p>
              <p className="mt-1 font-display text-xl text-wine">One blush rose, hand-delivered</p>
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <Eyebrow tone="light">Flower subscriptions</Eyebrow>
              <h2 id="daily-title" className="mt-6 text-h1">
                <span className="font-script text-[1.3em] font-normal text-blush">Daily</span> Roses
              </h2>
              <p className="mt-6 max-w-lg text-lead text-ivory/80">
                A single, perfect long-stem rose at the door every morning. The most romantic habit in the city, and the easiest gift to keep giving.
              </p>
            </Reveal>
            <Reveal delay={150}>
              <ul className="mt-10 divide-y divide-ivory/15 border-y border-ivory/15">
                {plans.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-6 py-5">
                    <div>
                      <p className="font-display text-2xl">{p.name}</p>
                      <p className="text-sm text-ivory/70">{p.frequency}</p>
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="font-display text-2xl">{formatPrice(p.price)}</span>
                      <span className="block text-xs uppercase tracking-[0.16em] text-ivory/70">{p.priceUnit}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={220} className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/subscriptions" variant="light">Explore subscriptions</ButtonLink>
              <ButtonLink href="/subscriptions#plans" variant="ghost-light" icon={false}>Compare plans</ButtonLink>
            </Reveal>
          </div>
        </div>
      </div>
      <CurveEdge flip className="text-wine" />
    </section>
  );
}
