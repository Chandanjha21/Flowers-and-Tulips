import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { Pin } from "./Icons";

/** Stylised map placeholder. Swap for an embedded map provider later. */
export function MapPlaceholder({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const stroke = tone === "dark" ? "rgba(251,247,242,0.18)" : "rgba(91,31,46,0.14)";
  return (
    <a
      href={site.mapsUrl}
      target="_blank"
      rel="noreferrer"
      className={cn("group relative block overflow-hidden rounded-[var(--radius-card)]", tone === "dark" ? "bg-wine-dark" : "bg-cream", className)}
      aria-label={`Open ${site.name} location in Google Maps (opens in a new tab)`}
    >
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke={stroke} strokeWidth="1">
          <path d="M-10 60C80 50 160 90 260 70s120 10 160 0" strokeWidth="6" />
          <path d="M-10 170c90-20 170 10 250-10s130-30 170-20" strokeWidth="4" />
          <path d="M120-10c-10 80 20 160 0 260M280-10c10 70-20 170 10 260" strokeWidth="5" />
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={i} d={`M${i * 30} -10 L${i * 30 + 40} 250`} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`h${i}`} d={`M-10 ${i * 32} L410 ${i * 32 + 18}`} />
          ))}
        </g>
        <circle cx="200" cy="118" r="46" fill={tone === "dark" ? "rgba(201,143,140,0.18)" : "rgba(201,143,140,0.22)"} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span className="flex size-12 items-center justify-center rounded-full bg-wine text-ivory shadow-soft transition-transform duration-700 ease-(--ease-bloom) group-hover:-translate-y-1">
          <Pin size={22} />
        </span>
        <span className={cn("eyebrow rounded-full px-3 py-1.5", tone === "dark" ? "bg-ivory/10 text-ivory" : "bg-ivory/80 text-wine")}>Open in Maps</span>
      </div>
    </a>
  );
}
