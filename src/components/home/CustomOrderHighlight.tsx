import Image from "next/image";
import { images } from "@/data/media";
import { ButtonLink } from "@/components/ui/Button";
import { LeafDivider } from "@/components/ui/Botanicals";
import { Eyebrow, Script } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { n: "01", title: "Tell us the story", text: "The occasion, the person, the colors they love, or a photo for inspiration." },
  { n: "02", title: "We design it", text: "A florist sketches your arrangement and confirms details within a few hours." },
  { n: "03", title: "Hand-delivered", text: "Arranged the morning of delivery and brought to the door with care." },
];

export function CustomOrderHighlight() {
  return (
    <section className="section-y overflow-hidden" aria-labelledby="custom-title">
      <div className="container-page grid items-center gap-20 lg:grid-cols-12 lg:gap-10">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <Reveal>
            <Eyebrow>Custom orders</Eyebrow>
            <h2 id="custom-title" className="mt-6 text-h1 text-wine">
              Have something <Script>special</Script> in mind?
            </h2>
            <p className="mt-6 max-w-xl text-lead text-muted">We&rsquo;ll design it for you. One-of-a-kind florals for proposals, memorials, milestones and moments that deserve more than a catalog.</p>
          </Reveal>
          <ol className="mt-12 space-y-8">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 100} className="grid grid-cols-[3.5rem_1fr] gap-4">
                <span className="font-display text-4xl italic text-rose-deep">{s.n}</span>
                <div>
                  <p className="font-display text-2xl text-wine">{s.title}</p>
                  <p className="mt-1 text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={320} className="mt-12">
            <ButtonLink href="/custom-orders">Start a custom order</ButtonLink>
          </Reveal>
        </div>

        <Reveal className="relative order-1 mx-auto w-full max-w-lg lg:order-2 lg:col-span-5 lg:col-start-8 lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] md:rotate-[1.5deg]">
            <Image src={images.kraftGifts.src} alt={images.kraftGifts.alt} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-10 -left-4 w-40 overflow-hidden rounded-[1.5rem] shadow-soft ring-8 ring-ivory sm:w-52 md:-left-14 md:-rotate-3">
            <div className="relative aspect-[4/5]">
              <Image src={images.thankYouCard.src} alt={images.thankYouCard.alt} fill sizes="208px" className="object-cover" />
            </div>
          </div>
          <LeafDivider className="absolute -bottom-16 right-0 hidden w-48 text-gold md:block" />
        </Reveal>
      </div>
    </section>
  );
}
