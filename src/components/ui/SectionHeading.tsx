import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function Eyebrow({ children, className, tone = "dark" }: { children: ReactNode; className?: string; tone?: "dark" | "light" }) {
  return (
    <p className={cn("eyebrow inline-flex items-center gap-3", tone === "light" ? "text-blush" : "text-rose-deep", className)}>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}

/** Script accent word: used once per heading at most */
export function Script({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-script text-[1.15em] leading-none font-normal tracking-normal text-rose-deep", className)}>{children}</span>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  as: Tag = "h2",
  className,
  tone = "dark",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow tone={tone} className={cn(align === "center" && "justify-center")}>{eyebrow}</Eyebrow> : null}
      <Tag className={cn(Tag === "h1" ? "text-h1" : "text-h2", "mt-5", tone === "light" ? "text-ivory" : "text-wine")}>{title}</Tag>
      {intro ? <p className={cn("mt-6 text-lead", tone === "light" ? "text-ivory/80" : "text-muted", align === "center" && "mx-auto max-w-2xl")}>{intro}</p> : null}
    </Reveal>
  );
}
