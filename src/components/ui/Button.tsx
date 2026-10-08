import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowUpRight } from "./Icons";

type Variant = "primary" | "outline" | "light" | "ghost-light" | "sage";

const variants: Record<Variant, { root: string; icon: string }> = {
  primary: { root: "bg-wine text-ivory hover:bg-wine-dark", icon: "bg-ivory/15" },
  sage: { root: "bg-sage-deep text-ivory hover:bg-[#3e4b3a]", icon: "bg-ivory/15" },
  outline: { root: "text-wine ring-1 ring-inset ring-wine/40 hover:bg-wine hover:text-ivory hover:ring-wine", icon: "bg-wine/10 group-hover:bg-ivory/15" },
  light: { root: "bg-ivory text-wine hover:bg-white", icon: "bg-wine/10" },
  "ghost-light": { root: "text-ivory ring-1 ring-inset ring-ivory/60 hover:bg-ivory hover:text-wine", icon: "bg-ivory/15 group-hover:bg-wine/10" },
};

const base =
  "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full py-2 pl-6 text-[0.8125rem] font-medium uppercase tracking-[0.16em] transition-[background-color,color,box-shadow,transform] duration-500 ease-(--ease-petal) active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

function Inner({ children, icon, variant }: { children: ReactNode; icon: boolean; variant: Variant }) {
  return (
    <>
      <span>{children}</span>
      {icon ? (
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full transition-transform duration-500 ease-(--ease-petal) group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
            variants[variant].icon,
          )}
        >
          <ArrowUpRight size={16} />
        </span>
      ) : null}
    </>
  );
}

type Common = { variant?: Variant; icon?: boolean; className?: string; children: ReactNode };

export function ButtonLink({ variant = "primary", icon = true, className, children, ...props }: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, icon ? "pr-2" : "pr-6", variants[variant].root, className)} {...props}>
      <Inner icon={icon} variant={variant}>{children}</Inner>
    </Link>
  );
}

export function Button({ variant = "primary", icon = false, className, children, ...props }: Common & ComponentProps<"button">) {
  return (
    <button className={cn(base, icon ? "pr-2" : "pr-6", variants[variant].root, className)} {...props}>
      <Inner icon={icon} variant={variant}>{children}</Inner>
    </button>
  );
}
