"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";
import { useCart } from "@/components/cart/CartProvider";
import { Bag, Close, Instagram, Menu, Phone } from "@/components/ui/Icons";
import { Sprig } from "@/components/ui/Botanicals";
import { Logo } from "./Logo";
import { primaryNav } from "./nav";

export function Header() {
  const pathname = usePathname();
  const cart = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const overlay = pathname === "/";
  const light = overlay && !scrolled;

  // IntersectionObserver on a sentinel instead of a scroll listener
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const left = primaryNav.slice(0, 3);
  const right = primaryNav.slice(3);

  const linkClass = (href: string) =>
    cn(
      "link-underline py-1 text-[0.8125rem] uppercase tracking-[0.16em] transition-colors duration-500",
      light ? "text-ivory/90 hover:text-ivory" : "text-ink/80 hover:text-wine",
      isActive(href) && (light ? "text-ivory" : "text-wine"),
    );

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="absolute inset-x-0 top-0 h-16" />
      <header className="fixed inset-x-0 top-0 z-40">
        <div className={cn("transition-[padding] duration-700 ease-(--ease-petal)", scrolled ? "px-3 pt-3" : "px-0 pt-0")}>
          <div
            className={cn(
              "mx-auto flex items-center transition-all duration-700 ease-(--ease-petal)",
              scrolled
                ? "h-16 max-w-6xl rounded-full bg-ivory/85 px-4 shadow-float ring-1 ring-wine/10 backdrop-blur-xl lg:px-8"
                : "h-24 max-w-[88rem] px-4 sm:px-6 lg:h-28 lg:px-12",
            )}
          >
            {/* Mobile */}
            <div className="flex w-full items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className={cn("flex size-11 items-center justify-center rounded-full", light ? "text-ivory" : "text-ink")}
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <Menu size={24} />
              </button>
              <Logo compact tone={light ? "light" : "dark"} />
              <CartButton light={light} count={cart.count} onClick={cart.open} />
            </div>

            {/* Desktop */}
            <nav aria-label="Primary" className="hidden w-full grid-cols-[1fr_auto_1fr] items-center lg:grid">
              <ul className="flex items-center gap-8">
                {left.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkClass(l.href)} aria-current={isActive(l.href) ? "page" : undefined}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Logo compact={scrolled} tone={light ? "light" : "dark"} className="px-10" />
              <div className="flex items-center justify-end gap-8">
                <ul className="flex items-center gap-8">
                  {right.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkClass(l.href)} aria-current={isActive(l.href) ? "page" : undefined}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <CartButton light={light} count={cart.count} onClick={cart.open} />
              </div>
            </nav>
          </div>
        </div>
      </header>
      {!overlay ? <div aria-hidden="true" className="h-24 lg:h-28" /> : null}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </>
  );
}

function CartButton({ light, count, onClick }: { light: boolean; count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex size-11 items-center justify-center rounded-full transition-colors duration-500",
        light ? "text-ivory hover:bg-ivory/15" : "text-ink hover:bg-cream",
      )}
      aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
    >
      <Bag size={22} />
      {count > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-wine text-[0.6875rem] font-medium text-ivory">{count}</span>
      ) : null}
    </button>
  );
}

function MobileMenu({ open, onClose, isActive }: { open: boolean; onClose: () => void; isActive: (h: string) => boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Menu"
      className="group/menu m-0 h-dvh max-h-none w-full max-w-none bg-ivory/95 p-0 backdrop-blur-2xl"
    >
      <div className="relative flex h-full flex-col overflow-y-auto px-6 pb-10 pt-5">
        <Sprig className="pointer-events-none absolute -right-6 bottom-24 w-40 text-sage/60" />
        <div className="flex items-center justify-between">
          <Logo compact />
          <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-full hover:bg-cream" aria-label="Close menu">
            <Close size={24} />
          </button>
        </div>
        <nav aria-label="Mobile" className="mt-14 flex-1">
          <ul className="space-y-2">
            {[{ href: "/", label: "Home" }, ...primaryNav].map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <Link
                  href={l.href}
                  onClick={onClose}
                  aria-current={isActive(l.href) && l.href !== "/" ? "page" : undefined}
                  className="block translate-y-12 py-1 font-display text-[2.5rem] leading-tight text-wine opacity-0 transition-all duration-700 ease-(--ease-bloom) group-open/menu:translate-y-0 group-open/menu:opacity-100 aria-[current=page]:italic"
                  style={{ transitionDelay: `${120 + i * 60}ms` }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-10 space-y-3 text-muted">
          <a href={site.phoneHref} className="flex items-center gap-3"><Phone size={18} /> {site.phone}</a>
          <a href={site.social.instagram} className="flex items-center gap-3" target="_blank" rel="noreferrer"><Instagram size={18} /> Instagram</a>
        </div>
      </div>
    </dialog>
  );
}
