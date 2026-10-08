import Image from "next/image";
import { getEventServices, getWeddingGallery } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { videos } from "@/data/media";
import { cn } from "@/lib/cn";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { ButtonLink } from "@/components/ui/Button";
import { ArchOutline, LeafDivider, Sprig } from "@/components/ui/Botanicals";
import { Check } from "@/components/ui/Icons";
import { Eyebrow, Script, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { LightboxGallery } from "@/components/events/Lightbox";
import { InquiryForm } from "@/components/events/InquiryForm";

export const metadata = pageMetadata({
  title: "Weddings & Events",
  description: `Wedding, corporate, celebration and sympathy florals designed by ${site.name} in ${site.address.city}. Book a consultation with our event designers.`,
  path: "/events",
});

export default async function EventsPage() {
  const [services, gallery] = await Promise.all([getEventServices(), getWeddingGallery()]);

  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-8 md:pb-28 md:pt-12">
        <div className="container-page grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Eyebrow className="animate-rise">Weddings &amp; events</Eyebrow>
            <h1 className="mt-6 animate-rise text-display font-light text-wine [animation-delay:120ms]">
              Moments, in <Script>full bloom</Script>
            </h1>
            <p className="mt-8 max-w-lg animate-rise text-lead text-muted [animation-delay:240ms]">
              From intimate elopements to five-hundred-guest galas, we design florals that feel personal, considered and completely unforgettable.
            </p>
            <div className="mt-10 flex animate-rise flex-wrap gap-4 [animation-delay:360ms]">
              <ButtonLink href="#inquire">Book a consultation</ButtonLink>
              <ButtonLink href="#gallery" variant="outline" icon={false}>View portfolio</ButtonLink>
            </div>
            <nav aria-label="Event types" className="mt-14 flex flex-wrap gap-x-8 gap-y-3">
              {services.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="link-underline eyebrow text-ink/80 hover:text-wine">{s.eyebrow.split(" &")[0]}</a>
              ))}
            </nav>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:col-start-8 lg:max-w-none">
            <ArchOutline className="absolute -inset-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] text-gold" />
            <div className="relative aspect-[3/4] overflow-hidden arch bg-ink">
              <LazyVideo video={videos.bridePortrait} eager />
            </div>
            <Sprig className="pointer-events-none absolute -bottom-10 -left-14 w-28 text-sage" />
          </div>
        </div>
      </section>

      {services.map((s, i) => (
        <section key={s.id} id={s.id} className={cn("section-y", i % 2 === 0 ? "bg-cream/60" : "")} aria-labelledby={`${s.id}-title`}>
          <div className="container-page grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <Reveal className={cn("lg:col-span-5", i % 2 === 1 && "lg:order-2 lg:col-start-8")}>
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h2 id={`${s.id}-title`} className="mt-6 text-h2 text-wine">{s.title}</h2>
              <p className="mt-6 text-lead text-muted">{s.description}</p>
              <ul className="mt-8 space-y-3">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-sage/40 text-sage-deep"><Check size={12} strokeWidth={2} /></span>
                    {b}
                  </li>
                ))}
              </ul>
              <ButtonLink href="#inquire" variant="outline" className="mt-10">Start planning</ButtonLink>
            </Reveal>
            <div className={cn("grid grid-cols-5 grid-rows-2 gap-3 md:gap-4 lg:col-span-7", i % 2 === 1 ? "lg:order-1" : "lg:col-start-6")}>
              {s.images.map((img, k) => (
                <Reveal
                  key={img.src}
                  delay={k * 100}
                  className={cn(
                    "img-zoom relative overflow-hidden bg-linen",
                    k === 0 ? "col-span-3 row-span-2 aspect-[3/4] rounded-[2rem] md:rounded-t-full md:rounded-b-[2rem]" : "col-span-2 rounded-[1.5rem]",
                  )}
                >
                  <Image src={img.src} alt={img.alt} fill sizes={k === 0 ? "(min-width:1024px) 34vw, 60vw" : "(min-width:1024px) 22vw, 40vw"} quality={75} className="object-cover" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section id="gallery" className="section-y" aria-labelledby="gallery-title">
        <div className="container-page">
          <SectionHeading align="center" eyebrow="Wedding portfolio" title={<span id="gallery-title">Love stories, <Script>in flowers</Script></span>} intro="Tap any photo to view it larger." />
          <div className="mt-14">
            <LightboxGallery items={gallery} />
          </div>
        </div>
      </section>

      <section id="inquire" className="section-y bg-cream/60" aria-labelledby="inquire-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Inquire" title={<span id="inquire-title">Let&rsquo;s plan something <Script>beautiful</Script></span>} intro="Share a few details and we'll set up a complimentary consultation, in the studio or by video." />
            <LeafDivider className="mt-10 text-gold" />
            <dl className="mt-8 space-y-4 text-sm">
              <div><dt className="eyebrow text-muted">Booking</dt><dd className="mt-1 text-ink">Weddings 6–12 months ahead, events 4+ weeks</dd></div>
              <div><dt className="eyebrow text-muted">Minimums</dt><dd className="mt-1 text-ink">Full-service weddings from $3,500</dd></div>
              <div><dt className="eyebrow text-muted">Call</dt><dd className="mt-1"><a href={site.phoneHref} className="link-underline text-wine">{site.phone}</a></dd></div>
            </dl>
          </div>
          <div className="lg:col-span-8">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
