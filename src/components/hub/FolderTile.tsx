import { Link } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";

type Tone = "sky" | "gold" | "leaf";

const TONE_BG: Record<Tone, string> = {
  sky: "color-mix(in oklab, #06aed5 18%, white)",
  gold: "color-mix(in oklab, #ffd166 30%, white)",
  leaf: "color-mix(in oklab, #2dd4a8 22%, white)",
};

const TONE_RING: Record<Tone, string> = {
  sky: "#06aed5",
  gold: "#e9b13d",
  leaf: "#1ba884",
};

export function FolderTile({
  to,
  title,
  blurb,
  skill,
  best,
  done,
  Mark,
  tone = "sky",
}: {
  to: string;
  title: string;
  blurb: string;
  skill: string;
  best: number;
  done: boolean;
  Mark: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: Tone;
}) {
  return (
    <Link
      to={to}
      className="group relative block overflow-hidden rounded-[1.75rem] border-[2.5px] bg-white p-6 transition-all"
      style={{
        borderColor: "color-mix(in oklab, #1f2933 14%, transparent)",
        boxShadow: `0 6px 0 ${TONE_RING[tone]}`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full"
        style={{ background: TONE_BG[tone], opacity: 0.55 }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip-muted">{skill}</span>
          {done && <span className="chip-leaf">✓ Today</span>}
        </div>
        <div
          className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-2xl border-[2px] transition-transform group-hover:-rotate-6 group-hover:scale-105"
          style={{ background: TONE_BG[tone], borderColor: TONE_RING[tone] }}
        >
          <Mark width={64} height={56} />
        </div>
      </div>

      <h3 className="relative mt-5 font-display text-[1.65rem] leading-tight tracking-tight">{title}</h3>
      <p className="relative mt-2 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">{blurb}</p>

      <div className="relative gold-rule my-5" />

      <div className="relative flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Best</div>
          <div className="font-display text-2xl tabular-nums">{best}</div>
        </div>
        <span className="pill-btn pill-btn-gold">
          Play
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
      </div>
    </Link>
  );
}
