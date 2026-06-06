export function SkillRing({ label, xp }: { label: string; xp: number }) {
  const level = Math.floor(xp / 100);
  const within = xp % 100;
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (within / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} stroke="color-mix(in oklab, white 10%, transparent)" strokeWidth="4" fill="none" />
        <circle
          cx="40" cy="40" r={r}
          stroke="var(--gold)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 600ms", filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--gold) 40%, transparent))" }}
        />
        <text x="40" y="46" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="22" fill="var(--cream)">{level}</text>
      </svg>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="font-display text-xs tabular-nums" style={{ color: "var(--gold-soft)" }}>{xp} xp</div>
    </div>
  );
}
