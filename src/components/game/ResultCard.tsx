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
    <div className="glass-strong grain mx-auto mt-10 max-w-md p-8 text-center fall-in">
      <div className="mb-3 flex justify-center">
        <span className={won ? "chip-leaf" : "chip-muted"}>{won ? "✓ Nice round" : "Round over"}</span>
      </div>
      <h2 className="font-display text-4xl tracking-tight">
        {won ? "Nicely done!" : "That's a wrap."}
      </h2>
      {details && <p className="mt-3 text-sm text-muted-foreground">{details}</p>}
      <div className="gold-rule mx-auto my-6 max-w-[60%]" />
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Score" value={score} />
        <Stat label="XP" value={`+${xp}`} accent />
        <Stat label="Best" value={best} />
      </div>
      <div className="mt-7 flex justify-center gap-2">
        <button onClick={onPlayAgain} className="pill-btn pill-btn-gold">Play again</button>
        <Link to="/" className="pill-btn">Home</Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl border-[2px] p-3"
      style={{
        borderColor: accent ? "var(--gold-deep)" : "color-mix(in oklab, #1f2933 12%, transparent)",
        background: accent ? "color-mix(in oklab, #ffd166 25%, white)" : "var(--paper-2)",
      }}
    >
      <div className="font-display text-2xl tabular-nums" style={{ color: accent ? "var(--gold-deep)" : "var(--ink)" }}>{value}</div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
    </div>
  );
}
