import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "mt-2 w-full rounded-2xl bg-ivory px-4 py-3 text-ink ring-1 ring-linen transition-shadow placeholder:text-muted/70 hover:ring-wine/30 focus:outline-none focus:ring-2 focus:ring-wine/60 aria-[invalid=true]:ring-rose-deep";

type Base = { label: string; hint?: ReactNode; optional?: boolean; className?: string };

function Label({ htmlFor, label, optional }: { htmlFor: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
      {label}
      {optional ? <span className="ml-1 font-normal text-muted">(optional)</span> : null}
    </label>
  );
}

export function TextField({ label, hint, optional, className, id, ...props }: Base & ComponentProps<"input"> & { id: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} optional={optional} />
      <input id={id} required={!optional} className={cn(control, "min-h-12")} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextArea({ label, hint, optional, className, id, ...props }: Base & ComponentProps<"textarea"> & { id: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} optional={optional} />
      <textarea id={id} required={!optional} rows={4} className={cn(control, "resize-none")} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function SelectField({ label, hint, optional, className, id, children, ...props }: Base & ComponentProps<"select"> & { id: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} optional={optional} />
      <select id={id} required={!optional} className={cn(control, "min-h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%236b5f5c%22 stroke-width=%221.25%22><path d=%22m4 6 4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10")} {...props}>
        {children}
      </select>
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function FormSection({ title, step, children }: { title: string; step?: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[var(--radius-card)] bg-cream/60 p-6 ring-1 ring-linen md:p-8">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden="true" className="flex items-baseline gap-3">
        {step ? <span className="font-display text-2xl italic text-rose-deep">{step}</span> : null}
        <span className="font-display text-h3 text-wine">{title}</span>
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
