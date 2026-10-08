import { Suspense } from "react";
import { getProducts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { ShopView } from "@/components/shop/ShopView";
import { Eyebrow, Script } from "@/components/ui/SectionHeading";
import { Sprig } from "@/components/ui/Botanicals";
import { TrustStrip } from "@/components/home/TrustStrip";

export const metadata = pageMetadata({
  title: "Shop Flowers",
  description: `Order bouquets, arrangements, gift boxes and plants online for same-day delivery in ${site.address.city}. Filter by occasion, flower, color and price.`,
  path: "/shop",
});

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <>
      <section className="relative overflow-hidden pb-14 pt-10 md:pb-20 md:pt-16">
        <Sprig className="pointer-events-none absolute -right-4 top-0 w-28 text-sage/70 md:right-16 md:w-36" />
        <div className="container-page">
          <Eyebrow>The shop</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-h1 text-wine">
            Fresh flowers, <Script>delivered</Script>
          </h1>
          <p className="mt-6 max-w-xl text-lead text-muted">
            Every design is made to order in our studio. Order by {site.sameDayCutoff} for same-day delivery across {site.address.city}.
          </p>
        </div>
      </section>
      <Suspense fallback={<div className="container-page min-h-[60vh]" />}>
        <ShopView products={products} />
      </Suspense>
      <div className="section-y">
        <TrustStrip />
      </div>
    </>
  );
}
