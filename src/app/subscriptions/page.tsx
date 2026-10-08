import Image from "next/image";
import { getSubscriptionComparison, getSubscriptionFaqs, getSubscriptionPlans } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { images } from "@/data/media";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { SubscribeButton, SubscribeProvider } from "@/components/subscriptions/SubscribeFlow";
import { CornerBloom, CurveEdge, Sprig } from "@/components/ui/Botanicals";
import { Check, ChevronDown, Minus } from "@/components/ui/Icons";
import { Eyebrow, Script, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = pageMetadata({
  title: "Flower Subscriptions & Daily Roses",
  description: `Daily roses, weekly fresh bouquets and monthly signature arrangements, delivered across ${site.address.city}. Pause or skip anytime.`,
  path: "/subscriptions",
});

export default async function SubscriptionsPage() {
  const [plans, rows, faqs] = await Promise.all([getSubscriptionPlans(), getSubscriptionComparison(), getSubscriptionFaqs()]);

  return (
    <SubscribeProvider>
      <section className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-12">
        <CornerBloom className="pointer-events-none absolute -right-10 top-0 w-72 text-rose/30" />
        <div className="container-page grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Eyebrow className="animate-rise">Subscriptions</Eyebrow>
            <h1 className="mt-6 animate-rise text-display font-light text-wine [animation-delay:120ms]">
              Fresh flowers, <Script>on repeat</Script>
            </h1>
            <p className="mt-8 max-w-lg animate-rise text-lead text-muted [animation-delay:240ms]">
              A rose every morning, a bouquet every week, or a showpiece every month. Delivered by our own team, and easy to pause, skip or gift.
            </p>
            <div className="mt-10 flex animate-rise flex-wrap gap-4 [animation-delay:360ms]">
              <ButtonLink href="#plans">Choose a plan</ButtonLink>
              <ButtonLink href="#faq" variant="outline" icon={false}>Questions</ButtonLink>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-4 lg:col-span-5 lg:col-start-8">
            <div className="relative aspect-[3/4] overflow-hidden arch">
              <Image src={images.redRose.src} alt={images.redRose.alt} fill preload sizes="(min-width:1024px) 20vw, 45vw" className="object-cover" />
            </div>
            <div className="relative mt-16 aspect-[3/4] overflow-hidden arch">
              <Image src={images.receivingFlowers.src} alt={images.receivingFlowers.alt} fill sizes="(min-width:1024px) 20vw, 45vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="section-y bg-cream/60" aria-labelledby="plans-title">
        <div className="container-page">
          <SectionHeading align="center" eyebrow="Plans" title={<span id="plans-title">Choose your <Script>ritual</Script></span>} />
          <ul className="mt-16 grid items-start gap-6 lg:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 100} className={cn(p.highlighted && "lg:-mt-6")}>
                <article
                  className={cn(
                    "flex h-full flex-col overflow-hidden rounded-[2rem] ring-1",
                    p.highlighted ? "on-dark bg-wine text-ivory ring-wine shadow-soft" : "bg-ivory ring-linen",
                  )}
                >
                  <div className="relative aspect-[16/10]">
                    <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover" />
                    {p.highlighted ? <span className="eyebrow absolute left-5 top-5 rounded-full bg-ivory px-3 py-1.5 text-[0.625rem] text-wine">Most loved</span> : null}
                  </div>
                  <div className="flex flex-1 flex-col p-7 md:p-8">
                    <h3 className={cn("text-h3", p.highlighted ? "text-ivory" : "text-wine")}>{p.name}</h3>
                    <p className={cn("mt-1 text-sm", p.highlighted ? "text-ivory/75" : "text-muted")}>{p.frequency}</p>
                    <p className="mt-6">
                      <span className="font-display text-5xl">{formatPrice(p.price)}</span>{" "}
                      <span className={cn("text-sm", p.highlighted ? "text-ivory/75" : "text-muted")}>{p.priceUnit}</span>
                    </p>
                    <p className={cn("mt-4", p.highlighted ? "text-ivory/85" : "text-muted")}>{p.summary}</p>
                    <ul className="mt-6 flex-1 space-y-3 text-[0.9375rem]">
                      {p.includes.map((inc) => (
                        <li key={inc} className="flex gap-3">
                          <Check size={18} className={cn("mt-0.5 shrink-0", p.highlighted ? "text-blush" : "text-sage-deep")} />
                          {inc}
                        </li>
                      ))}
                    </ul>
                    <SubscribeButton plan={p} variant={p.highlighted ? "light" : "outline"} className="mt-8 w-full" />
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y" aria-labelledby="compare-title">
        <div className="container-page">
          <SectionHeading eyebrow="Compare" title={<span id="compare-title">Side by side</span>} />
          <div className="mt-12 overflow-x-auto rounded-[var(--radius-card)] ring-1 ring-linen">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">Subscription plan comparison</caption>
              <thead>
                <tr className="bg-cream/70">
                  <th scope="col" className="p-5 eyebrow font-medium text-muted">Feature</th>
                  {plans.map((p) => (
                    <th key={p.id} scope="col" className={cn("p-5 font-display text-2xl font-normal", p.highlighted ? "text-rose-deep" : "text-wine")}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-linen">
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="p-5 font-normal text-ink">{r.label}</th>
                    {plans.map((p) => {
                      const v = r.values[p.id];
                      return (
                        <td key={p.id} className="p-5 text-muted">
                          {v === true ? <Check size={20} className="text-sage-deep" aria-label="Included" /> : v === false ? <Minus size={20} className="text-muted/60" aria-label="Not included" /> : v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="p-5 font-normal text-ink">Price</th>
                  {plans.map((p) => (
                    <td key={p.id} className="p-5">
                      <span className="font-display text-2xl text-wine">{formatPrice(p.price)}</span> <span className="text-sm text-muted">{p.priceUnit}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="on-dark relative text-ivory" aria-labelledby="how-title">
        <CurveEdge className="text-wine" />
        <div className="relative overflow-hidden bg-wine">
          <Sprig className="pointer-events-none absolute -left-6 bottom-0 w-36 text-ivory/10" />
          <div className="container-page section-y">
            <SectionHeading tone="light" align="center" eyebrow="How it works" title={<span id="how-title">Simple, <span className="font-script font-normal text-blush">beautiful</span>, flexible</span>} />
            <ol className="mt-16 grid gap-10 md:grid-cols-3">
              {[
                ["Choose your plan", "Pick Daily Roses, Weekly Fresh or Monthly Signature, and your start date."],
                ["We design & deliver", "Our florists create each delivery fresh that morning and hand-deliver it."],
                ["Pause anytime", "Traveling? Skip a week or pause with 48 hours' notice. No fees."],
              ].map(([t, d], i) => (
                <Reveal as="li" key={t} delay={i * 120} className="text-center">
                  <span className="font-display text-6xl italic text-blush/80">0{i + 1}</span>
                  <p className="mt-4 font-display text-h3">{t}</p>
                  <p className="mx-auto mt-3 max-w-xs text-ivory/75">{d}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
        <CurveEdge flip className="text-wine" />
      </section>

      <section id="faq" className="section-y" aria-labelledby="faq-title">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="FAQ" title={<span id="faq-title">Good to <Script>know</Script></span>} />
          </div>
          <div className="divide-y divide-linen border-y border-linen lg:col-span-7 lg:col-start-6">
            {faqs.map((f) => (
              <details key={f.q} className="group py-2">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-2xl text-wine">{f.q}</span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full ring-1 ring-linen transition-transform duration-500 group-open:rotate-180">
                    <ChevronDown size={18} />
                  </span>
                </summary>
                <p className="pb-6 pr-12 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </SubscribeProvider>
  );
}
