import type { Metadata } from "next";
import { site } from "@/config/site";
import { getFeaturedProducts, getOccasions, getSubscriptionPlans, getTestimonials, getWeddingGallery } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { StudioIntro } from "@/components/home/StudioIntro";
import { Occasions } from "@/components/home/Occasions";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { DailyRoses } from "@/components/home/DailyRoses";
import { CustomOrderHighlight } from "@/components/home/CustomOrderHighlight";
import { GalleryStrip } from "@/components/home/GalleryStrip";
import { VideoStories } from "@/components/home/VideoStories";
import { Testimonials } from "@/components/home/Testimonials";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading, Script } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  ...pageMetadata({ title: `Luxury Florist in ${site.address.city}`, description: site.description, path: "/" }),
  title: { absolute: `${site.name} | Luxury Florist in ${site.address.city}` },
};

export default async function HomePage() {
  const [featured, occasions, plans, testimonials, gallery] = await Promise.all([
    getFeaturedProducts(8),
    getOccasions(),
    getSubscriptionPlans(),
    getTestimonials(),
    getWeddingGallery(),
  ]);

  return (
    <>
      <Hero />
      <TrustStrip className="pt-14 md:pt-20" />
      <StudioIntro />
      <Occasions occasions={occasions} />

      <section className="section-y" aria-labelledby="featured-title">
        <div className="container-page flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Featured bouquets"
            title={<span id="featured-title">This week&rsquo;s <Script>favorites</Script></span>}
            intro="Designed fresh each morning. Order by early afternoon for same-day delivery."
          />
          <ButtonLink href="/shop" variant="outline" className="shrink-0 self-start md:self-auto">Shop all flowers</ButtonLink>
        </div>
        <div className="mt-10">
          <FeaturedCarousel products={featured} />
        </div>
      </section>

      <DailyRoses plans={plans} />
      <CustomOrderHighlight />
      <GalleryStrip items={gallery} />
      <VideoStories />
      <Testimonials items={testimonials} />
    </>
  );
}
