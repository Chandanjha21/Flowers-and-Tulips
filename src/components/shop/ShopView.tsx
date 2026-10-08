"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Product, ShopFilters } from "@/types";
import { colors, flowerTypes, occasions, priceRanges, productTypes, sizes, sortOptions } from "@/data/catalog";
import { activeFilterCount, applyFilters, emptyFilters, parseFilters, serializeFilters } from "@/lib/filters";
import { cn } from "@/lib/cn";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { ChevronDown, Close, Sliders } from "@/components/ui/Icons";
import { Sprig } from "@/components/ui/Botanicals";
import { FilterPanel } from "./FilterPanel";
import { ProductCard } from "./ProductCard";

type ListKey = "occasion" | "flower" | "color" | "size" | "type";

const labelFor = (key: ListKey, value: string) => {
  const source = { occasion: occasions, flower: flowerTypes, color: colors, size: sizes, type: productTypes }[key] as { key: string; label: string }[];
  return source.find((o) => o.key === value)?.label ?? value;
};

export function ShopView({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Local, optimistic copy of the URL filters so rapid clicks don't race router.replace.
  // URL changes we didn't make ourselves (back button, links) re-seed it.
  const urlKey = params.toString();
  const [state, setState] = useState(() => ({ url: urlKey, pending: [] as string[], filters: parseFilters(new URLSearchParams(urlKey)) }));
  if (state.url !== urlKey) {
    const ours = state.pending.includes(urlKey);
    setState({
      url: urlKey,
      pending: ours ? state.pending.slice(state.pending.indexOf(urlKey) + 1) : [],
      filters: ours ? state.filters : parseFilters(new URLSearchParams(urlKey)),
    });
  }
  const filters = state.filters;
  const results = useMemo(() => applyFilters([...products], filters), [products, filters]);
  const active = activeFilterCount(filters);

  // Facet counts against the full catalog for quick scanning
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    const bump = (k: string) => (c[k] = (c[k] ?? 0) + 1);
    for (const p of products) {
      p.occasions.forEach((o) => bump(`occasion:${o}`));
      p.flowers.forEach((f) => bump(`flower:${f}`));
      p.sizes.forEach((s) => bump(`size:${s.size}`));
      bump(`type:${p.type}`);
    }
    return c;
  }, [products]);

  const commit = (next: ShopFilters) => {
    const qs = serializeFilters(next);
    setState((prev) => ({ ...prev, pending: [...prev.pending, qs], filters: next }));
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const toggle = (key: ListKey, value: string) => {
    const list = filters[key] as string[];
    commit({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const chips: { label: string; remove: () => void }[] = [
    ...(["occasion", "type", "flower", "color", "size"] as ListKey[]).flatMap((key) =>
      (filters[key] as string[]).map((v) => ({ label: labelFor(key, v), remove: () => toggle(key, v) })),
    ),
    ...(filters.price ? [{ label: priceRanges.find((r) => r.key === filters.price)?.label ?? filters.price, remove: () => commit({ ...filters, price: null }) }] : []),
  ];

  const panelProps = { filters, counts, onToggle: toggle, onPrice: (price: string | null) => commit({ ...filters, price }) };

  return (
    <div className="container-page grid gap-10 pb-10 lg:grid-cols-[17rem_1fr] lg:gap-14">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-10 pr-2 no-scrollbar">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-h3 text-wine">Refine</h2>
            {active ? (
              <button type="button" className="link-underline text-sm text-muted hover:text-wine" onClick={() => commit({ ...emptyFilters, sort: filters.sort })}>
                Clear all
              </button>
            ) : null}
          </div>
          <FilterPanel {...panelProps} idPrefix="d" />
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-linen pb-5">
          <p className="text-muted" aria-live="polite">
            <span className="font-medium text-ink">{results.length}</span> {results.length === 1 ? "design" : "designs"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex min-h-11 items-center gap-2 rounded-full px-5 text-sm uppercase tracking-[0.14em] ring-1 ring-wine/30 lg:hidden"
            >
              <Sliders size={18} /> Filter{active ? ` (${active})` : ""}
            </button>
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <div className="relative">
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => commit({ ...filters, sort: e.target.value as ShopFilters["sort"] })}
                className="min-h-11 appearance-none rounded-full bg-transparent py-2 pl-5 pr-11 text-sm ring-1 ring-wine/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-wine"
              >
                {sortOptions.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>
        </div>

        {chips.length ? (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.label}>
                <button type="button" onClick={c.remove} className="flex min-h-9 items-center gap-2 rounded-full bg-blush/70 px-4 text-sm text-wine transition-colors hover:bg-blush" aria-label={`Remove filter ${c.label}`}>
                  {c.label} <Close size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {results.length ? (
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16">
            {results.map((p, i) => (
              <li key={p.id} className={cn("animate-rise", i % 3 === 1 && "md:translate-y-10")} style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                <ProductCard product={p} sizes="(min-width:1280px) 22vw, (min-width:768px) 28vw, 46vw" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-20 max-w-md text-center">
            <Sprig className="mx-auto w-16 text-sage" />
            <h2 className="mt-6 text-h3 text-wine">Nothing blooms here… yet</h2>
            <p className="mt-3 text-muted">No designs match every filter you&rsquo;ve chosen. Try removing one, or let our florists create something just for you.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => commit({ ...emptyFilters })}>Clear filters</Button>
              <Button onClick={() => router.push("/custom-orders")} icon>Custom order</Button>
            </div>
          </div>
        )}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filter"
        side="left"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => commit({ ...emptyFilters, sort: filters.sort })}>Clear</Button>
            <Button className="flex-1" onClick={() => setDrawerOpen(false)}>Show {results.length}</Button>
          </div>
        }
      >
        <FilterPanel {...panelProps} idPrefix="m" />
      </Drawer>
    </div>
  );
}
