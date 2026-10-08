import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { Tulip } from "@/components/ui/Botanicals";

export function Logo({ className, tone = "dark", compact = false }: { className?: string; tone?: "dark" | "light"; compact?: boolean }) {
  // "Flowers and Tulips" -> Flowers [tulip icon] Tulips
  const [first, second] = site.name.split(/\s+(?:&|and)\s+/);
  return (
    <Link href="/" className={cn("group inline-flex flex-col items-center leading-none", tone === "light" ? "text-ivory" : "text-wine", className)} aria-label={`${site.name}, home`}>
      <span className={cn("flex items-center gap-2 font-display uppercase tracking-[0.28em]", compact ? "text-lg tracking-[0.22em] sm:text-xl sm:tracking-[0.28em]" : "text-2xl md:text-[1.75rem]")}>
        {second ? (
          <>
            {first}
            <Tulip className={cn("origin-bottom text-rose transition-transform duration-1000 ease-(--ease-bloom) group-hover:rotate-[10deg]", compact ? "size-5" : "size-7")} />
            {second}
          </>
        ) : (
          site.name
        )}
      </span>
      {!compact ? <span className={cn("mt-1.5 eyebrow text-[0.625rem] tracking-[0.36em]", tone === "light" ? "text-ivory/70" : "text-muted")}>{site.tagline}</span> : null}
    </Link>
  );
}
