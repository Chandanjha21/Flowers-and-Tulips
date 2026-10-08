import type { ReactNode } from "react";
import { Check } from "@/components/ui/Icons";
import { LeafDivider } from "@/components/ui/Botanicals";

export function SuccessState({ title, children, action }: { title: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div role="status" className="animate-rise rounded-[var(--radius-card)] bg-cream/70 px-6 py-14 text-center ring-1 ring-linen md:px-12">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-sage-deep text-ivory">
        <Check size={28} />
      </span>
      <h3 className="mt-6 text-h2 text-wine">{title}</h3>
      <div className="mx-auto mt-4 max-w-md text-muted">{children}</div>
      <LeafDivider className="mx-auto mt-8 text-gold" />
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  );
}
