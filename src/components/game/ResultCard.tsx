import { Link } from "@tanstack/react-router";

export function ResultCard({
  won,
  score,
  xp,
  best,
  details,
  onPlayAgain,
}: {
  won: boolean;
  score: number;
  xp: number;
  best: number;
  details?: string;
  onPlayAgain: () => void;
}) {
  return (
    <div className="glass grain mx-auto mt-10 max-w-md rounded-2xl p-8 text-center">
      <div className="mb-3 flex justify-center">
        <span className={won ? "chip-gold" : "chip-muted"}>{won ? "Approved" : "Filed away"}</span>
      </div>
      <h2 className="font-display text-4xl tracking-tight">{won ? "Nailed it." : "Time's up."}</h2>
      {details && <p className="mt-3 text-sm text-muted-foreground">{details}</p>}
      <div className="gold-rule my-6" />
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Score" value={score} />
        <Stat label="XP" value={`+${xp}`} accent />
        <Stat label="Best" value={best} />
      </div>
      <div className="mt-7 flex justify-center gap-2">
        <button onClick={onPlayAgain} className="pill-btn pill-btn-gold">Play again</button>
        <Link to="/" className="pill-btn">Hub</Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "color-mix(in oklab, white 8%, transparent)", background: "color-mix(in oklab, white 3%, transparent)" }}>
      <div className="font-display text-2xl tabular-nums" style={{ color: accent ? "var(--gold)" : "var(--cream)" }}>{value}</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    </div>
  );
}
