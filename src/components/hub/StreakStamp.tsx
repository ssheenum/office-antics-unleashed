export function StreakStamp({ count }: { count: number }) {
  return (
    <div className="glass inline-flex items-center gap-3 rounded-full px-4 py-2">
      <span className="chip-gold">Streak</span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl leading-none tabular-nums" style={{ color: "var(--cream)" }}>{count}</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">day{count === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}
