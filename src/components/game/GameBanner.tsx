import type { ComponentType, SVGProps } from "react";

export function GameBanner({
  Mark,
  image,
  tagline,
  eyebrow,
}: {
  Mark?: ComponentType<SVGProps<SVGSVGElement>>;
  image?: string;
  tagline: string;
  eyebrow?: string;
}) {
  return (
    <div className="glass grain mb-6 flex items-center gap-5 p-5">
      <div
        className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-2xl border-[2px]"
        style={{
          background: "color-mix(in oklab, #ffd166 30%, white)",
          borderColor: "#e9b13d",
        }}
      >
        {image ? (
          <img src={image} alt="" width={80} height={80} className="h-full w-full object-contain p-1" />
        ) : Mark ? (
          <Mark width={64} height={56} />
        ) : null}
      </div>
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--sky-deep)" }}>{eyebrow}</div>
        )}
        <p className="font-display text-lg leading-snug">{tagline}</p>
      </div>
    </div>
  );
}
