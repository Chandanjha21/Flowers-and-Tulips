import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Hand-drawn fine-line botanical ornaments. Purely decorative: hidden from assistive tech.
 * Stroke uses currentColor so they can be tinted with text-* utilities.
 */
type P = SVGProps<SVGSVGElement>;
const deco = { "aria-hidden": true, focusable: false, fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** A single trailing stem with leaves and a bud */
export const Sprig = ({ className, ...p }: P) => (
  <svg viewBox="0 0 120 240" strokeWidth={0.9} className={cn("h-auto", className)} {...deco} {...p}>
    <path d="M60 236C58 190 52 150 62 110 70 78 64 44 56 14" />
    <path d="M60 200c-14-6-26-20-28-36 14 2 26 14 28 36Z" />
    <path d="M59 178c14-4 28-16 32-32-16 0-28 12-32 32Z" />
    <path d="M60 140c-12-8-20-22-20-38 12 4 20 18 20 38Z" />
    <path d="M63 118c12-6 22-18 24-34-14 2-22 14-24 34Z" />
    <path d="M60 78c-10-6-16-16-16-28 10 4 16 14 16 28Z" />
    <path d="M57 26c-6-6-6-14-1-20 5 6 6 14 1 20Z" />
    <path d="M56 14c4-4 10-5 14-2" />
    <path d="M56 14c-4-3-10-3-13 0" />
  </svg>
);

/** Small blossom: five-petal flower in line */
export const Blossom = ({ className, ...p }: P) => (
  <svg viewBox="0 0 48 48" strokeWidth={0.9} className={className} {...deco} {...p}>
    {[0, 72, 144, 216, 288].map((r) => (
      <path key={r} transform={`rotate(${r} 24 24)`} d="M24 22c-4-4-5-10-0-15 5 5 4 11 0 15Z" />
    ))}
    <circle cx="24" cy="24" r="2.4" />
  </svg>
);

/** Small tulip: cupped head with three petal tips, stem and one leaf. Used in the logo. */
export const Tulip = ({ className, ...p }: P) => (
  <svg viewBox="0 0 48 48" strokeWidth={2.2} className={className} {...deco} {...p}>
    <path d="M15 12.5c0 9.5 3.6 14.5 9 14.5s9-5 9-14.5l-4.5 4L24 10l-4.5 6.5Z" />
    <path d="M19.5 16.5c.8 4.5 2.3 8 4.5 10.5 2.2-2.5 3.7-6 4.5-10.5" />
    <path d="M24 27v18" />
    <path d="M24 41.5c-5.5-1.3-8.5-5.8-8.2-11.5 4.6 1.6 7.5 5.6 8.2 11.5Z" />
  </svg>
);

/** Horizontal leaf divider with a center blossom */
export const LeafDivider = ({ className, ...p }: P) => (
  <svg viewBox="0 0 240 24" strokeWidth={0.8} className={cn("h-6 w-60", className)} {...deco} {...p}>
    <path d="M4 12h86M150 12h86" />
    <path d="M90 12c-8-6-16-6-22-2 6 4 14 6 22 2ZM78 12c-6 5-14 6-20 3M150 12c8-6 16-6 22-2-6 4-14 6-22 2ZM162 12c6 5 14 6 20 3" />
    {[0, 72, 144, 216, 288].map((r) => (
      <path key={r} transform={`rotate(${r} 120 12)`} d="M120 10.5c-2.6-2.6-3.2-6.4 0-9.6 3.2 3.2 2.6 7 0 9.6Z" />
    ))}
    <circle cx="120" cy="12" r="1.3" />
  </svg>
);

/** Corner flourish: rose with curling stems, for section corners and cards */
export const CornerBloom = ({ className, ...p }: P) => (
  <svg viewBox="0 0 220 220" strokeWidth={0.8} className={className} {...deco} {...p}>
    <path d="M10 210C40 150 80 120 140 100" />
    <path d="M60 160c-8-18-4-36 12-46 4 18-2 34-12 46Z" />
    <path d="M86 132c18-6 34 0 42 14-18 4-32-2-42-14Z" />
    <path d="M36 186c-20-2-32-14-34-30 18 0 30 12 34 30Z" />
    <path d="M140 100c10-24 34-36 56-30-4 22-26 36-56 30Z" />
    <circle cx="160" cy="70" r="20" />
    <path d="M160 58c8 0 12 6 10 12s-10 8-14 4-2-10 4-10M150 68c-6 6-2 16 8 18 10 2 18-6 16-16" />
    <path d="M141 62c-4-10 2-22 14-24M178 54c8 6 10 18 4 26M168 89c-6 8-18 8-26 2" />
  </svg>
);

/** Organic curved section edge. Place at top or bottom of a section. */
export const CurveEdge = ({ className, flip, ...p }: P & { flip?: boolean }) => (
  <svg
    viewBox="0 0 1440 80"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
    className={cn("block h-10 w-full md:h-16", flip && "rotate-180", className)}
    {...p}
  >
    <path fill="currentColor" d="M0 80V40C240 0 480 0 720 28s480 52 720 12v40H0Z" />
  </svg>
);

/** Thin arch outline, used to frame images */
export const ArchOutline = ({ className, ...p }: P) => (
  <svg viewBox="0 0 200 300" preserveAspectRatio="none" strokeWidth={0.6} className={className} {...deco} {...p}>
    <path vectorEffect="non-scaling-stroke" d="M2 298V100A98 98 0 0 1 198 100v198" />
  </svg>
);
