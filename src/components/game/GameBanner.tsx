import type { ComponentType, SVGProps } from "react";

export function GameBanner({
  Mark,
  tagline,
  eyebrow,
}: {
  Mark: ComponentType<SVGProps<SVGSVGElement>>;
  tagline: string;
  eyebrow?: string;
}) {
  return (
    <div className="glass grain mb-8 flex items-center gap-5 rounded-2xl p-5">
      <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-xl" style={{ background: "color-mix(in oklab, var(--gold) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--gold) 25%, transparent)", color: "var(--gold)" }}>
        <Mark width={42} height={36} />
      </div>
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--gold-soft)" }}>{eyebrow}</div>}
        <p className="font-display text-lg leading-snug" style={{ color: "var(--cream)" }}>{tagline}</p>
      </div>
    </div>
  );
}
