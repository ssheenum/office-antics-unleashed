import { Link } from "@tanstack/react-router";

export function FolderTile({
  to,
  title,
  blurb,
  skill,
  best,
  done,
  image,
  theme,
}: {
  to: string;
  title: string;
  blurb: string;
  skill: string;
  best: number;
  done: boolean;
  image?: string;
  theme?: "ducks" | "connect" | "circle" | "fruit";
}) {
  return (
    <Link
      to={to}
      className={`group relative block overflow-hidden rounded-lg p-5 transition-transform hover:-translate-y-1 ${theme ? `theme-${theme}` : "bg-secondary"}`}
      style={{
        boxShadow: "3px 4px 0 var(--ink)",
        border: "2px solid var(--ink)",
      }}
    >
      {done && (
        <div className="absolute right-3 top-3 z-10">
          <span className="stamp text-xs">Done</span>
        </div>
      )}
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="pointer-events-none absolute -right-4 -bottom-4 h-32 w-32 object-contain opacity-90 transition-transform group-hover:scale-110 group-hover:-rotate-3"
        />
      )}
      <div className="relative z-[1] max-w-[60%]">
        <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--ink)", opacity: 0.7 }}>{skill}</div>
        <h3 className="mt-1 font-display text-2xl leading-tight" style={{ color: "var(--ink)" }}>{title}</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--ink)", opacity: 0.85 }}>{blurb}</p>
        <div className="mt-4 flex items-end gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: "var(--ink)", opacity: 0.7 }}>Best</div>
            <div className="font-display text-xl tabular-nums" style={{ color: "var(--ink)" }}>{best}</div>
          </div>
          <div
            className="rounded-full px-3 py-1 font-display text-xs uppercase tracking-wider"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            Play →
          </div>
        </div>
      </div>
    </Link>
  );
}
