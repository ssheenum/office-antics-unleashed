export function SkillRing({ label, xp }: { label: string; xp: number }) {
  const level = Math.floor(xp / 100);
  const within = xp % 100;
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (within / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} stroke="color-mix(in oklab, #1f2933 12%, transparent)" strokeWidth="6" fill="none" />
        <circle
          cx="42" cy="42" r={r}
          stroke="#06aed5"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          style={{ transition: "stroke-dashoffset 600ms" }}
        />
        <text x="42" y="48" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="22" fill="#1f2933">{level}</text>
      </svg>
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="font-display text-xs tabular-nums" style={{ color: "var(--sky-deep)" }}>{xp} xp</div>
    </div>
  );
}
