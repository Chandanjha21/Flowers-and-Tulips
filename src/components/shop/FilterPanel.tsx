"use client";

import type { ShopFilters } from "@/types";
import { colors, flowerTypes, occasions, priceRanges, productTypes, sizes } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { Check, ChevronDown } from "@/components/ui/Icons";

type ListKey = "occasion" | "flower" | "color" | "size" | "type";

export function FilterPanel({
  filters,
  counts,
  onToggle,
  onPrice,
  idPrefix,
}: {
  filters: ShopFilters;
  counts: Record<string, number>;
  onToggle: (key: ListKey, value: string) => void;
  onPrice: (value: string | null) => void;
  idPrefix: string;
}) {
  return (
    <div className="divide-y divide-linen">
      <Group title="Occasion" defaultOpen>
        {occasions.map((o) => (
          <CheckRow key={o.key} id={`${idPrefix}-occ-${o.key}`} label={o.label} count={counts[`occasion:${o.key}`]} checked={filters.occasion.includes(o.key)} onChange={() => onToggle("occasion", o.key)} />
        ))}
      </Group>
      <Group title="Product type" defaultOpen>
        {productTypes.map((o) => (
          <CheckRow key={o.key} id={`${idPrefix}-type-${o.key}`} label={o.label} count={counts[`type:${o.key}`]} checked={filters.type.includes(o.key)} onChange={() => onToggle("type", o.key)} />
        ))}
      </Group>
      <Group title="Flower" defaultOpen>
        {flowerTypes.map((o) => (
          <CheckRow key={o.key} id={`${idPrefix}-fl-${o.key}`} label={o.label} count={counts[`flower:${o.key}`]} checked={filters.flower.includes(o.key)} onChange={() => onToggle("flower", o.key)} />
        ))}
      </Group>
      <Group title="Color" defaultOpen>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {colors.map((c) => {
            const checked = filters.color.includes(c.key);
            return (
              <label key={c.key} htmlFor={`${idPrefix}-col-${c.key}`} className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem]">
                <input id={`${idPrefix}-col-${c.key}`} type="checkbox" className="peer sr-only" checked={checked} onChange={() => onToggle("color", c.key)} />
                <span
                  className={cn(
                    "size-6 shrink-0 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-ivory transition-shadow peer-focus-visible:ring-2 peer-focus-visible:ring-wine",
                    checked && "ring-2 ring-wine",
                  )}
                  style={{ background: c.swatch }}
                  aria-hidden="true"
                />
                <span className={cn(checked ? "text-wine" : "text-ink/85")}>{c.label}</span>
              </label>
            );
          })}
        </div>
      </Group>
      <Group title="Price">
        <div role="radiogroup" aria-label="Price range" className="space-y-1">
          {[{ key: "", label: "Any price" }, ...priceRanges].map((r) => (
            <label key={r.key || "any"} htmlFor={`${idPrefix}-price-${r.key || "any"}`} className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem]">
              <input
                id={`${idPrefix}-price-${r.key || "any"}`}
                type="radio"
                name={`${idPrefix}-price`}
                className="peer sr-only"
                checked={(filters.price ?? "") === r.key}
                onChange={() => onPrice(r.key || null)}
              />
              <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-full ring-1 ring-ink/30 peer-checked:ring-wine peer-checked:[&>span]:scale-100 peer-focus-visible:ring-2 peer-focus-visible:ring-wine">
                <span className="size-2.5 scale-0 rounded-full bg-wine transition-transform duration-300" />
              </span>
              <span className="text-ink/85 peer-checked:text-wine">{r.label}</span>
            </label>
          ))}
        </div>
      </Group>
      <Group title="Size">
        {sizes.map((o) => (
          <CheckRow key={o.key} id={`${idPrefix}-size-${o.key}`} label={o.label} count={counts[`size:${o.key}`]} checked={filters.size.includes(o.key)} onChange={() => onToggle("size", o.key)} />
        ))}
      </Group>
    </div>
  );
}

function Group({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group/filter py-4" open={defaultOpen}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <span className="eyebrow text-ink">{title}</span>
        <ChevronDown size={18} className="text-muted transition-transform duration-500 group-open/filter:rotate-180" />
      </summary>
      <div className="pt-2">{children}</div>
    </details>
  );
}

function CheckRow({ id, label, count, checked, onChange }: { id: string; label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem]">
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-[6px] text-ivory ring-1 ring-ink/30 transition-colors peer-checked:bg-wine peer-checked:ring-wine peer-focus-visible:ring-2 peer-focus-visible:ring-wine peer-focus-visible:ring-offset-2">
        {checked ? <Check size={14} strokeWidth={2} /> : null}
      </span>
      <span className={cn("flex-1", checked ? "text-wine" : "text-ink/85")}>{label}</span>
      {typeof count === "number" ? <span className="text-xs tabular-nums text-muted">{count}</span> : null}
    </label>
  );
}
