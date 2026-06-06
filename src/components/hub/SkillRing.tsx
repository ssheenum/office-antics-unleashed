export function SkillRing({ label, xp }: { label: string; xp: number }) {
  // 100 xp per level, ring fills based on progress within current level
  const level = Math.floor(xp / 100);
  const within = xp % 100;
  const circ = 2 * Math.PI * 28;
  const offset = circ - (within / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r="28" stroke="var(--border)" strokeWidth="6" fill="none" />
        <circle
          cx="36"
          cy="36"
          r="28"
          stroke="var(--toner)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 600ms" }}
        />
        <text x="36" y="40" textAnchor="middle" fontFamily="Archivo Black" fontSize="16" fill="var(--foreground)">
          {level}
        </text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-xs tabular-nums">{xp} xp</div>
    </div>
  );
}
