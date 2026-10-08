"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaAsset } from "@/types";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, name }: { images: MediaAsset[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {images.length > 1 ? (
        <ul className="flex gap-3 md:flex-col" aria-label={`${name} photos`}>
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-current={i === index}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-2xl bg-cream ring-offset-2 ring-offset-ivory transition md:size-24",
                  i === index ? "ring-2 ring-wine" : "opacity-70 ring-1 ring-linen hover:opacity-100",
                )}
              >
                <Image src={img.src} alt="" fill sizes="96px" quality={60} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden arch-soft bg-cream">
        {current ? (
          <Image key={current.src} src={current.src} alt={current.alt} fill preload sizes="(min-width:1024px) 45vw, 100vw" quality={85} className="animate-fade-in object-cover" />
        ) : null}
      </div>
    </div>
  );
}
