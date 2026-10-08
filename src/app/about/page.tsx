import Image from "next/image";
import { getTeam } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { images, videos } from "@/data/media";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { ArchOutline, LeafDivider } from "@/components/ui/Botanicals";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, Script, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Clock, Leaf, Pin, Sparkle } from "@/components/ui/Icons";
import { MapPlaceholder } from "@/components/ui/MapPlaceholder";

export const metadata = pageMetadata({
  title: "Our Story",
  description: `Meet the florists behind ${site.name}, a ${site.address.city} floral studio designing bouquets, weddings and events since ${site.established}.`,
  path: "/about",
});

const values = [
  { Icon: Leaf, title: "Garden-gathered", text: "Loose, natural shapes that look picked, not pressed into foam." },
  { Icon: Sparkle, title: "Made that morning", text: "Every order is designed on the day it leaves the studio." },
  { Icon: Clock, title: "Unhurried care", text: "We condition each stem for 24 hours so it lasts longer at home." },
];

export default async function AboutPage() {
  const team = await getTeam();
  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-8 md:pt-12">
        <div className="container-page">
          <Eyebrow className="animate-rise">Our story</Eyebrow>
          <h1 className="mt-6 max-w-5xl animate-rise text-display font-light text-wine [animation-delay:120ms]">
            A small studio with a <Script>big heart</Script> for flowers
          </h1>
        </div>
        <div className="container-page mt-16 grid gap-6 md:grid-cols-12">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[2rem] md:col-span-8 md:aspect-auto md:min-h-[32rem]">
            <Image src={images.shopInterior.src} alt={images.shopInterior.alt} fill preload sizes="(min-width:768px) 66vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={120} className="relative aspect-[3/4] overflow-hidden arch md:col-span-4">
            <Image src={images.floristOveralls.src} alt={images.floristOveralls.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      <section className="section-y" aria-labelledby="story-title">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={`Since ${site.established}`} title={<span id="story-title">From a market stall to the city&rsquo;s <Script>favorite</Script> studio</span>} />
          </div>
          <Reveal delay={120} className="space-y-6 text-lead text-muted lg:col-span-6 lg:col-start-7">
            <p>
              {site.name} began with a single bucket of garden roses at a Saturday farmers&rsquo; market in {site.address.city}. Our founder wanted flowers to feel the way they do in a garden: generous, a little wild, and full of scent.
            </p>
            <p>
              Today we&rsquo;re a team of designers, growers&rsquo; friends and early risers, creating thousands of bouquets a year, designing hundreds of weddings, and delivering a single perfect rose to doorsteps every morning.
            </p>
            <p>What hasn&rsquo;t changed: every arrangement is still made by hand, by someone who cares how it will make you feel.</p>
          </Reveal>
        </div>
        <ul className="container-page mt-20 grid gap-10 md:grid-cols-3">
          {values.map(({ Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 100} className="rounded-[var(--radius-card)] bg-cream/60 p-8 ring-1 ring-linen">
              <Icon size={28} className="text-rose-deep" />
              <p className="mt-6 font-display text-h3 text-wine">{title}</p>
              <p className="mt-3 text-muted">{text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="section-y bg-cream/60" aria-labelledby="team-title">
        <div className="container-page">
          <SectionHeading align="center" eyebrow="The florists" title={<span id="team-title">The hands behind every <Script>bloom</Script></span>} />
          <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-8 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal as="li" key={m.name} delay={i * 90} className={i % 2 === 1 ? "lg:mt-14" : ""}>
                <div className="img-zoom relative aspect-[4/5] overflow-hidden arch-soft bg-linen">
                  <Image src={m.photo.src} alt={m.photo.alt} fill sizes="(min-width:1024px) 22vw, 46vw" className="object-cover" />
                </div>
                <p className="mt-5 font-display text-2xl text-wine">{m.name}</p>
                <p className="eyebrow mt-1 text-[0.6875rem] text-rose-deep">{m.role}</p>
                <p className="mt-3 text-sm text-muted">{m.bio}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y" aria-labelledby="visit-title">
        <div className="container-page grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <ArchOutline className="absolute -inset-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] text-gold" />
            <div className="relative aspect-[3/4] overflow-hidden arch bg-ink">
              <LazyVideo video={videos.handoff} />
            </div>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <SectionHeading eyebrow="Visit the studio" title={<span id="visit-title">Come smell the <Script>roses</Script></span>} intro="Pop in to choose your own stems, meet our designers, or pick up an order. There's always something just in from the market." />
            <Reveal delay={120} className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="eyebrow text-muted">Address</p>
                <p className="mt-2 flex gap-2 text-ink"><Pin size={18} className="mt-1 shrink-0 text-rose-deep" />{site.address.street}<br />{site.address.city}, {site.address.region} {site.address.postalCode}</p>
              </div>
              <div>
                <p className="eyebrow text-muted">Hours</p>
                <ul className="mt-2 space-y-1 text-ink">
                  {site.hours.map((h) => <li key={h.days}>{h.days}: <span className="text-muted">{h.time}</span></li>)}
                </ul>
              </div>
            </Reveal>
            <MapPlaceholder className="mt-10 aspect-[16/9] w-full" />
            <LeafDivider className="mt-10 text-gold" />
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact">Get in touch</ButtonLink>
              <ButtonLink href="/events" variant="outline">Plan an event</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
