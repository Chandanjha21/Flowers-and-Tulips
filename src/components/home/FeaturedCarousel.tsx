"use client";

import { useRef } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 320) + 24), behavior: "smooth" });
  };

  return (
    <div>
      <div className="container-page flex justify-end gap-2">
        <button type="button" onClick={() => scroll(-1)} className="flex size-12 items-center justify-center rounded-full ring-1 ring-wine/25 text-wine transition-colors hover:bg-wine hover:text-ivory" aria-label="Previous bouquets">
          <ArrowLeft size={18} />
        </button>
        <button type="button" onClick={() => scroll(1)} className="flex size-12 items-center justify-center rounded-full ring-1 ring-wine/25 text-wine transition-colors hover:bg-wine hover:text-ivory" aria-label="Next bouquets">
          <ArrowRight size={18} />
        </button>
      </div>
      <ul
        ref={track}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 track-inset"
        aria-label="Featured bouquets"
      >
        {products.map((p) => (
          <li key={p.id} className="w-[72vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[21rem]">
            <ProductCard product={p} sizes="(min-width:1024px) 336px, (min-width:640px) 42vw, 72vw" />
          </li>
        ))}
      </ul>
    </div>
  );
}
