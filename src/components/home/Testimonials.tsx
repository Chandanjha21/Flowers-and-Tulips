import Image from "next/image";
import type { Testimonial } from "@/types";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, Script } from "@/components/ui/SectionHeading";

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="section-y" aria-labelledby="testimonials-title">
      <div className="container-page grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading eyebrow="Kind words" title={<span id="testimonials-title">Loved across the <Script>city</Script></span>} />
            <Reveal delay={120} className="mt-8 flex items-center gap-4">
              <p className="font-display text-6xl text-wine">4.9</p>
              <div>
                <p className="tracking-[0.3em] text-gold" aria-hidden="true">★★★★★</p>
                <p className="text-sm text-muted">From 1,200+ verified reviews</p>
              </div>
            </Reveal>
          </div>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
          {items.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 2) * 120} className={cn(i % 2 === 1 && "sm:mt-16")}>
              <figure className="flex h-full flex-col rounded-[var(--radius-card)] bg-cream/70 p-8 ring-1 ring-linen md:p-10">
                <span aria-hidden="true" className="font-display text-7xl leading-[0.5] text-rose">&ldquo;</span>
                <blockquote className="mt-4 flex-1 font-display text-[1.5rem] leading-snug text-ink">{t.quote}</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="relative size-12 overflow-hidden rounded-full">
                    <Image src={t.avatar.src} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-medium text-wine">{t.name}</span>
                    <span className="block text-sm text-muted">{t.context}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
