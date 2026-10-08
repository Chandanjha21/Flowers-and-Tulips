"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/types";
import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight, Close, Expand } from "@/components/ui/Icons";

export function LightboxGallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (index !== null && !el.open) el.showModal();
    if (index === null && el.open) el.close();
  }, [index]);

  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  const current = index !== null ? items[index] : null;

  return (
    <>
      <ul className="columns-2 gap-3 md:columns-3 md:gap-5 lg:columns-4">
        {items.map((item, i) => (
          <li key={item.id} className="mb-3 break-inside-avoid md:mb-5">
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group img-zoom relative block w-full overflow-hidden rounded-[1.25rem] bg-cream"
              aria-label={`Open photo: ${item.caption}`}
            >
              <span className={cn("relative block w-full", item.tall ? "aspect-[3/4]" : "aspect-[4/3]")}>
                <Image src={item.src} alt={item.alt} fill sizes="(min-width:1024px) 24vw, (min-width:768px) 32vw, 48vw" quality={70} className="object-cover" />
              </span>
              <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink/60 to-transparent p-4 text-left text-ivory opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="text-sm">{item.caption}</span>
                <Expand size={18} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={ref}
        onClose={() => setIndex(null)}
        aria-label="Photo viewer"
        className="on-dark m-0 h-dvh max-h-none w-full max-w-none bg-ink/95 p-0 text-ivory backdrop:bg-transparent"
        onClick={(e) => e.target === e.currentTarget && setIndex(null)}
      >
        {current ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-4 md:px-8">
              <p className="text-sm text-ivory/80" aria-live="polite">{(index ?? 0) + 1} / {items.length} · {current.caption}</p>
              <button type="button" onClick={() => setIndex(null)} className="flex size-11 items-center justify-center rounded-full ring-1 ring-ivory/30 hover:bg-ivory/10" aria-label="Close photo viewer">
                <Close />
              </button>
            </div>
            <div className="relative flex-1">
              <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" quality={85} className="animate-fade-in object-contain px-4 md:px-24" />
              <button type="button" onClick={() => step(-1)} className="absolute left-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 ring-1 ring-ivory/30 hover:bg-ivory/10 md:left-8" aria-label="Previous photo">
                <ChevronLeft />
              </button>
              <button type="button" onClick={() => step(1)} className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 ring-1 ring-ivory/30 hover:bg-ivory/10 md:right-8" aria-label="Next photo">
                <ChevronRight />
              </button>
            </div>
            <div className="h-6" />
          </div>
        ) : null}
      </dialog>
    </>
  );
}
