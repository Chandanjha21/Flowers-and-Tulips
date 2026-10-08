import Image from "next/image";
import type { GalleryItem } from "@/types";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading, Script } from "@/components/ui/SectionHeading";

export function GalleryStrip({ items }: { items: GalleryItem[] }) {
  const loop = [...items, ...items];
  return (
    <section className="section-y overflow-hidden bg-cream/60" aria-labelledby="gallery-title">
      <div className="container-page flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Weddings & events"
          title={<span id="gallery-title">Real couples, real <Script>moments</Script></span>}
          intro="A few of the days we've been honored to be part of."
        />
        <ButtonLink href="/events" variant="outline" className="shrink-0 self-start md:self-auto">View the portfolio</ButtonLink>
      </div>
      <div className="group mt-14 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused] motion-reduce:animate-none md:gap-6">
          {loop.map((item, i) => (
            <li
              key={`${item.id}-${i}`}
              aria-hidden={i >= items.length ? true : undefined}
              className={cn("relative h-72 shrink-0 overflow-hidden rounded-[var(--radius-card)] md:h-96", item.tall ? "w-56 md:w-72" : "w-80 md:w-[28rem]")}
            >
              <Image src={item.src} alt={i >= items.length ? "" : item.alt} fill sizes="(min-width:768px) 448px, 320px" quality={65} className="object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-ivory/90 px-3 py-1 text-xs tracking-wide text-wine">{item.caption}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
