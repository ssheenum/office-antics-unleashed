import { Link } from "@tanstack/react-router";
import type { ComponentType, SVGProps } from "react";

export function FolderTile({
  to,
  title,
  blurb,
  skill,
  best,
  done,
  Mark,
}: {
  to: string;
  title: string;
  blurb: string;
  skill: string;
  best: number;
  done: boolean;
  Mark: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <Link to={to} className="group glass grain relative block overflow-hidden rounded-2xl p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="chip-muted">{skill}</span>
          {done && <span className="chip-gold">Done today</span>}
        </div>
        <div className="text-gold transition-transform group-hover:rotate-3" style={{ color: "var(--gold)" }}>
          <Mark width={56} height={48} />
        </div>
      </div>

      <h3 className="mt-5 font-display text-3xl leading-tight tracking-tight">{title}</h3>
      <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">{blurb}</p>

      <div className="gold-rule my-5" />

      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Best</div>
          <div className="font-display text-2xl tabular-nums" style={{ color: "var(--cream)" }}>{best}</div>
        </div>
        <span className="pill-btn pill-btn-gold">
          Play
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
      </div>
    </Link>
  );
}
