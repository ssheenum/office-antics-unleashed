export function StreakStamp({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2">
      <span className="stamp text-sm">Streak</span>
      <div>
        <div className="font-display text-2xl leading-none tabular-nums">{count}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">day{count === 1 ? "" : "s"}</div>
      </div>
    </div>
  );
}
