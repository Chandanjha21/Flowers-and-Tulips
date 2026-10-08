import Image from "next/image";
import { images } from "@/data/media";
import { site } from "@/config/site";
import { ArchOutline, Sprig } from "@/components/ui/Botanicals";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Script } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function StudioIntro() {
  return (
    <section className="section-y relative overflow-hidden" aria-labelledby="studio-title">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <Reveal className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          <ArchOutline className="absolute -inset-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] text-gold" />
          <div className="relative aspect-[3/4] overflow-hidden arch">
            <Image src={images.floristWindow.src} alt={images.floristWindow.alt} fill sizes="(min-width:1024px) 38vw, 90vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-10 -right-4 hidden w-44 overflow-hidden rounded-[1.25rem] shadow-soft ring-8 ring-ivory sm:block md:-right-10 md:w-52">
            <div className="relative aspect-square">
              <Image src={images.floristHands.src} alt={images.floristHands.alt} fill sizes="208px" className="object-cover" />
            </div>
          </div>
        </Reveal>

        <div className="relative lg:col-span-6 lg:col-start-7">
          <Sprig className="pointer-events-none absolute -right-4 -top-16 hidden w-24 text-sage lg:block" />
          <Reveal>
            <Eyebrow>Our studio, since {site.established}</Eyebrow>
            <h2 id="studio-title" className="mt-6 text-h1 text-wine">
              Gathered by hand,
              <br />
              given with <Script>love</Script>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-lead text-muted">
              We are a small team of florists in {site.address.city} who believe flowers should feel like a garden, never a template.
              Each arrangement is designed the morning it leaves the studio, using blooms from local growers and the best markets.
            </p>
          </Reveal>
          <Reveal delay={200} className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-y border-linen py-8">
            {[
              ["12k+", "Bouquets a year"],
              ["350+", "Weddings designed"],
              ["4.9★", "Average review"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-4xl text-wine">{n}</p>
                <p className="mt-1 text-sm text-muted">{l}</p>
              </div>
            ))}
          </Reveal>
          <Reveal delay={260} className="mt-10">
            <ButtonLink href="/about" variant="outline">Meet the florists</ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
