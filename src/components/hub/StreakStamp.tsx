import { FlameIcon } from "@/components/art/MinimalIcons";

export function StreakStamp({ count }: { count: number }) {
  return (
    <div
      className="inline-flex items-center gap-3 rounded-full border-[2px] bg-white px-4 py-2"
      style={{
        borderColor: "var(--gold-deep)",
        boxShadow: "0 3px 0 var(--gold-deep)",
      }}
    >
      <span className="chip-gold inline-flex items-center gap-1.5">
        <FlameIcon width={14} height={14} style={{ color: "#e85b3a" }} /> Streak
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl leading-none tabular-nums">{count}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">day{count === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}

