import { videos } from "@/data/media";
import { site } from "@/config/site";
import { LazyVideo } from "@/components/ui/LazyVideo";
import { ButtonLink } from "@/components/ui/Button";
import { CurveEdge } from "@/components/ui/Botanicals";

export function Hero() {
  return (
    <section className="on-dark relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-ink text-ivory" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-10">
        <LazyVideo video={videos.heroFlorist} eager controlsClassName="bottom-16 md:bottom-24 right-4 md:right-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(43_34_36/0.45)_100%)]" />
      </div>

      <div className="container-page flex flex-1 flex-col items-center justify-center pb-28 pt-36 text-center">
        <p className="eyebrow animate-rise text-ivory/85 [animation-delay:150ms]">
          {site.tagline} &middot; {site.address.city}
        </p>
        <h1 id="hero-title" className="mt-8 max-w-5xl animate-rise font-display text-display font-light [animation-delay:300ms]">
          Flowers, composed
          <br />
          with <span className="font-script font-normal text-blush">feeling</span>
        </h1>
        <p className="mt-8 max-w-xl animate-rise text-lead text-ivory/85 [animation-delay:450ms]">
          Hand-gathered bouquets, unforgettable weddings and a fresh rose at your door every morning, all designed in our studio.
        </p>
        <div className="mt-11 flex animate-rise flex-col gap-4 [animation-delay:600ms] sm:flex-row">
          <ButtonLink href="/shop" variant="light">Shop Flowers</ButtonLink>
          <ButtonLink href="/events" variant="ghost-light">Plan Your Event</ButtonLink>
        </div>
      </div>

      <CurveEdge className="absolute inset-x-0 bottom-[-1px] text-ivory" />
    </section>
  );
}
