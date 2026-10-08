import Image from "next/image";
import Link from "next/link";
import type { OccasionInfo } from "@/types";
import { cn } from "@/lib/cn";
import { ArrowUpRight } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, Script } from "@/components/ui/SectionHeading";

const layout: Partial<Record<OccasionInfo["key"], string>> = {
  weddings: "col-span-2 lg:col-span-6 lg:row-span-2",
  sympathy: "lg:row-span-2 lg:col-start-1",
  "just-because": "col-span-2 lg:col-span-9 lg:col-start-4",
};

export function Occasions({ occasions }: { occasions: OccasionInfo[] }) {
  return (
    <section className="section-y bg-cream/60" aria-labelledby="occasions-title">
      <div className="container-page">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Occasions we cover"
            title={<span id="occasions-title">For every moment, <Script>big</Script> or small</span>}
            intro="From vows to new arrivals, milestones to quiet condolences. Choose an occasion to see what we'd send."
          />
        </div>

        <ul className="mt-14 grid grid-flow-dense auto-rows-[13rem] grid-cols-2 gap-3 sm:auto-rows-[16rem] md:gap-4 lg:grid-cols-12 lg:auto-rows-[15rem]">
          {occasions.map((o, i) => (
            <Reveal as="li" key={o.key} delay={(i % 4) * 80} className={cn("lg:col-span-3", layout[o.key])}>
              <Link
                href={o.href}
                className="group img-zoom relative flex h-full overflow-hidden rounded-[var(--radius-card)] bg-linen"
              >
                <Image
                  src={o.image.src}
                  alt=""
                  fill
                  sizes={o.key === "weddings" ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
                  quality={70}
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                <span className="on-dark relative mt-auto flex w-full items-end justify-between gap-3 p-5 text-ivory md:p-6">
                  <span>
                    <span className={cn("block font-display leading-none", o.key === "weddings" ? "text-h2" : "text-[1.75rem]")}>{o.label}</span>
                    <span className="mt-2 block text-sm text-ivory/85">{o.blurb}</span>
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ivory/15 ring-1 ring-ivory/40 backdrop-blur-[2px] transition-transform duration-700 ease-(--ease-petal) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-ivory group-hover:text-wine">
                    <ArrowUpRight size={16} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
