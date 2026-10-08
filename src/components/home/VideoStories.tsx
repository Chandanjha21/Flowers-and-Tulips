import { videos } from "@/data/media";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { Eyebrow, Script } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export function VideoStories() {
  return (
    <section className="section-y" aria-labelledby="stories-title">
      <div className="container-page grid gap-6 lg:grid-cols-12 lg:gap-8">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-ink lg:col-span-5 lg:row-span-2 lg:aspect-auto">
          <LazyVideo video={videos.behindTheScenes} />
          <p className="on-dark pointer-events-none absolute left-5 top-5 eyebrow rounded-full bg-ink/35 px-3 py-1.5 text-ivory backdrop-blur-sm">Behind the stems</p>
        </Reveal>

        <Reveal delay={100} className="flex flex-col justify-center py-6 lg:col-span-6 lg:col-start-7 lg:py-10">
          <Eyebrow>Inside the studio</Eyebrow>
          <h2 id="stories-title" className="mt-6 text-h1 text-wine">
            Every stem, <Script>chosen</Script>
          </h2>
          <p className="mt-6 max-w-lg text-lead text-muted">
            Before sunrise we&rsquo;re at the market choosing what&rsquo;s at its peak. By mid-morning it&rsquo;s conditioned, designed and on its way to someone&rsquo;s door, or down someone&rsquo;s aisle.
          </p>
          <div className="mt-10">
            <ButtonLink href="/about" variant="outline">Our story</ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={180} className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-ink lg:col-span-7">
          <LazyVideo video={videos.weddingTable} />
          <p className="on-dark pointer-events-none absolute left-5 top-5 eyebrow rounded-full bg-ink/35 px-3 py-1.5 text-ivory backdrop-blur-sm">Event highlights</p>
        </Reveal>
      </div>
    </section>
  );
}
