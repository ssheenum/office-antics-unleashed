import { Link } from "@tanstack/react-router";

export function FolderTile({
  to,
  title,
  blurb,
  skill,
  best,
  done,
}: {
  to: string;
  title: string;
  blurb: string;
  skill: string;
  best: number;
  done: boolean;
}) {
  return (
    <Link
      to={to}
      className="group relative block rounded-md bg-secondary p-5 transition-transform hover:-translate-y-1"
      style={{
        boxShadow: "3px 4px 0 var(--ink)",
        borderTop: "6px solid var(--manila)",
      }}
    >
      {done && (
        <div className="absolute right-3 top-3">
          <span className="stamp text-xs">Done</span>
        </div>
      )}
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{skill}</div>
      <h3 className="mt-1 font-display text-2xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm text-foreground/80">{blurb}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Best</div>
          <div className="font-display text-xl tabular-nums">{best}</div>
        </div>
        <div className="rounded-full bg-ink px-3 py-1 font-display text-xs uppercase tracking-wider text-paper" style={{ background: "var(--ink)", color: "var(--paper)" }}>
          Play →
        </div>
      </div>
    </Link>
  );
}
