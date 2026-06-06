import { Link } from "@tanstack/react-router";

export function FolderTile({
  to,
  title,
  blurb,
  skill,
  best,
  done,
  image,
  accent = "ducks",
}: {
  to: string;
  title: string;
  blurb: string;
  skill: string;
  best: number;
  done: boolean;
  image?: string;
  accent?: "ducks" | "connect" | "circle" | "fruit";
}) {
  return (
    <Link
      to={to}
      className={`tile-card accent-${accent} group relative block overflow-hidden p-5`}
    >
      <div className="flex items-start gap-4">
        <div
          className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-2xl transition-transform group-hover:-rotate-3"
          style={{ background: "var(--accent-bg)" }}
        >
          {image && (
            <img
              src={image}
              alt=""
              loading="lazy"
              className="h-16 w-16 object-contain"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="chip">{skill}</span>
            {done && <span className="stamp">Done today</span>}
          </div>
          <h3 className="mt-1.5 font-display text-xl leading-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Best</div>
          <div className="font-display text-lg tabular-nums">{best}</div>
        </div>
        <span className="duo-btn text-xs">Play</span>
      </div>
    </Link>
  );
}
