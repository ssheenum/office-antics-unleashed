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
    <div className="mx-auto mt-8 max-w-md paper-card rounded-lg p-6 text-center">
      <div className="mb-3 flex justify-center">
        <span className="stamp">{won ? "Approved" : "Filed"}</span>
      </div>
      <h2 className="font-display text-3xl">{won ? "Nailed it." : "Time's up."}</h2>
      {details && <p className="mt-2 text-sm text-muted-foreground">{details}</p>}
      <div className="my-5 grid grid-cols-3 gap-3 text-center">
        <Stat label="Score" value={score} />
        <Stat label="XP" value={`+${xp}`} />
        <Stat label="Best" value={best} />
      </div>
      <div className="flex justify-center gap-2">
        <button
          onClick={onPlayAgain}
          className="rounded-md bg-primary px-4 py-2 font-display uppercase text-sm tracking-wider text-primary-foreground hover:opacity-90"
        >
          Play again
        </button>
        <Link
          to="/"
          className="rounded-md border border-border bg-card px-4 py-2 font-display uppercase text-sm tracking-wider hover:bg-accent"
        >
          Hub
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
