import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAddOns, getProductBySlug, getProducts, getRelatedProducts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";
import { occasions, flowerTypes } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { basePrice } from "@/lib/filters";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductCard } from "@/components/shop/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { LeafDivider } from "@/components/ui/Botanicals";
import { ChevronDown, Leaf, Shield, Truck } from "@/components/ui/Icons";
import { SectionHeading, Script } from "@/components/ui/SectionHeading";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.name,
    description: `${product.description} From ${formatPrice(basePrice(product))}. Same-day delivery in ${site.address.city}.`,
    path: `/shop/${product.slug}`,
    image: product.images[0]?.src.replace("w=2000", "w=1200&h=630"),
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [related, addOns] = await Promise.all([getRelatedProducts(product, 4), getAddOns()]);

  const occasionLinks = occasions.filter((o) => product.occasions.includes(o.key));
  const flowerLabels = flowerTypes.filter((f) => product.flowers.includes(f.key)).map((f) => f.label);

  return (
    <>
      <div className="container-page pt-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="link-underline hover:text-wine">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/shop" className="link-underline hover:text-wine">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section className="container-page grid gap-12 pb-24 pt-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 xl:col-span-7">
          <div className="lg:sticky lg:top-28">
            <ProductGallery images={product.images} name={product.name} />
          </div>
        </div>

        <div className="lg:col-span-6 xl:col-span-5">
          {product.badge ? <p className="eyebrow text-rose-deep">{product.badge}</p> : null}
          <h1 className="mt-3 text-h1 text-wine">{product.name}</h1>
          <p className="mt-3 font-display text-2xl italic text-muted">{product.tagline}</p>
          <p className="mt-6 text-lead text-ink/85">{product.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Perfect for">
            {occasionLinks.map((o) => (
              <li key={o.key}>
                <Link href={`/shop?occasion=${o.key}`} className="inline-flex min-h-9 items-center rounded-full bg-cream px-4 text-sm text-wine ring-1 ring-linen transition-colors hover:bg-blush">
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>

          <LeafDivider className="my-10 text-gold" />
          <ProductPurchase product={product} addOns={addOns} />

          <div className="mt-12 divide-y divide-linen border-y border-linen">
            <Disclosure title="Details" defaultOpen>
              <ul className="list-disc space-y-1 pl-5 marker:text-rose">
                {product.details.map((d) => <li key={d}>{d}</li>)}
                <li>Featuring: {flowerLabels.join(", ")}</li>
              </ul>
            </Disclosure>
            <Disclosure title="Delivery">
              <p>Hand-delivered by our own drivers across {site.address.city}. Free on orders over {formatPrice(site.freeDeliveryOver)}, otherwise {formatPrice(site.deliveryFee)}. Same-day delivery on orders placed before {site.sameDayCutoff}.</p>
            </Disclosure>
            <Disclosure title="Care">
              <p>Trim stems at an angle, refresh water every two days, and keep away from direct heat and ripening fruit. A care card is included with every order.</p>
            </Disclosure>
          </div>

          <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-muted">
            <li className="flex flex-col items-center gap-2"><Truck size={22} className="text-rose-deep" />Same-day delivery</li>
            <li className="flex flex-col items-center gap-2"><Shield size={22} className="text-rose-deep" />7-day freshness</li>
            <li className="flex flex-col items-center gap-2"><Leaf size={22} className="text-rose-deep" />Designed locally</li>
          </ul>
        </div>
      </section>

      <section className="section-y bg-cream/60" aria-labelledby="related-title">
        <div className="container-page">
          <SectionHeading align="center" eyebrow="You may also love" title={<span id="related-title">More from the <Script>studio</Script></span>} />
          <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {related.map((p) => (
              <li key={p.id}><ProductCard product={p} sizes="(min-width:768px) 22vw, 46vw" /></li>
            ))}
          </ul>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images.map((i) => i.src),
          brand: { "@type": "Brand", name: site.name },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: Math.min(...product.sizes.map((s) => s.price)),
            highPrice: Math.max(...product.sizes.map((s) => s.price)),
            offerCount: product.sizes.length,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Florist", name: site.name },
          },
        }}
      />
    </>
  );
}

function Disclosure({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group py-2" open={defaultOpen}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <span className="eyebrow text-ink">{title}</span>
        <ChevronDown size={18} className="text-muted transition-transform duration-500 group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-muted">{children}</div>
    </details>
  );
}
