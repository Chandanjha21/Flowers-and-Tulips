import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { basePrice } from "@/lib/filters";

export function ProductCard({
  product,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw",
  className,
  shape = "arch",
}: {
  product: Product;
  sizes?: string;
  className?: string;
  shape?: "arch" | "rounded";
}) {
  const [cover] = product.images;
  const hasRange = product.sizes.length > 1;
  return (
    <article className={cn("group relative", className)}>
      <div className={cn("img-zoom relative aspect-[4/5] overflow-hidden bg-cream", shape === "arch" ? "arch-soft" : "rounded-[var(--radius-card)]")}>
        {cover ? <Image src={cover.src} alt={cover.alt} fill sizes={sizes} quality={75} className="object-cover" /> : null}
        {product.badge ? (
          <span className="eyebrow absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full bg-ivory/90 px-3 py-1.5 text-[0.625rem] text-wine">{product.badge}</span>
        ) : null}
      </div>
      <div className="mt-5 text-center">
        <h3 className="font-display text-2xl leading-tight text-wine">
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{product.tagline}</p>
        <p className="mt-2 text-[0.9375rem] font-medium tracking-wide text-ink">
          {hasRange ? <span className="font-normal text-muted">From </span> : null}
          {formatPrice(basePrice(product))}
        </p>
      </div>
    </article>
  );
}
