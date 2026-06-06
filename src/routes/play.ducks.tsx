import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { generate, checkConstraint, describe, DUCK_COLOR_HEX, type Duck, type Puzzle } from "@/lib/puzzles/ducks";
import { recordRound } from "@/lib/storage";
import { timeBonus, xpFromScore } from "@/lib/scoring";

export const Route = createFileRoute("/play/ducks")({
  head: () => ({
    meta: [
      { title: "Ducks in a Row — Cubicle Quest" },
      { name: "description", content: "An Einstein-style deduction puzzle. Arrange the ducks to satisfy every clue." },
    ],
  }),
  component: Ducks,
});

const DURATION = 180;

function Ducks() {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(5));
  const [order, setOrder] = useState<(Duck | null)[]>(() => Array(puzzle.n).fill(null));
  const [pool, setPool] = useState<Duck[]>(() => puzzle.ducks);
  const [picked, setPicked] = useState<Duck | null>(null);
  const [done, setDone] = useState<null | { won: boolean; secondsLeft: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);

  // Use timer's onExpire by tracking ticks; simpler: poll left via Timer? We render Timer for visual; track our own.
  // We'll re-use Timer purely visual + separate state tick via setInterval inside Timer's effect callback. Simpler: timer drives expiration; we track elapsed via a derived approach.

  const constraintsMet = useMemo(() => puzzle.constraints.map((c) => checkConstraint(order, c)), [order, puzzle.constraints]);
  const allMet = constraintsMet.length > 0 && constraintsMet.every(Boolean);

  function place(slot: number) {
    if (done) return;
    if (picked) {
      const existing = order[slot];
      const fromPool = pool.includes(picked);
      const newOrder = [...order];
      newOrder[slot] = picked;
      let newPool = pool.filter((d) => d.id !== picked.id);
      if (existing) {
        if (fromPool) newPool = [...newPool, existing];
        else {
          // came from another slot — find that slot and clear it (or swap)
          const fromSlot = order.findIndex((d) => d?.id === picked.id);
          if (fromSlot >= 0) newOrder[fromSlot] = existing;
        }
      } else if (!fromPool) {
        const fromSlot = order.findIndex((d) => d?.id === picked.id);
        if (fromSlot >= 0 && fromSlot !== slot) newOrder[fromSlot] = null;
      }
      setOrder(newOrder);
      setPool(newPool);
      setPicked(null);
    } else if (order[slot]) {
      setPicked(order[slot]);
    }
  }

  function pickFromPool(d: Duck) {
    if (done) return;
    setPicked(picked?.id === d.id ? null : d);
  }

  function reset() {
    const p = generate(5);
    setPuzzle(p);
    setOrder(Array(p.n).fill(null));
    setPool(p.ducks);
    setPicked(null);
    setDone(null);
    setSecondsLeft(DURATION);
  }

  function submit() {
    if (done) return;
    if (allMet) {
      const bonus = timeBonus(secondsLeft, 4);
      const score = 500 + puzzle.constraints.length * 40 + bonus;
      const xp = xpFromScore(score);
      recordRound("ducks", score, xp);
      setDone({ won: true, secondsLeft });
    }
  }

  function timeUp() {
    if (done) return;
    setDone({ won: false, secondsLeft: 0 });
    recordRound("ducks", 0, 0);
  }

  const score = done?.won
    ? 500 + puzzle.constraints.length * 40 + timeBonus(done.secondsLeft, 4)
    : 0;
  const xp = xpFromScore(score);

  return (
    <GameShell
      title="Ducks in a Row"
      skill="Logic"
      rightSlot={
        <Timer
          seconds={DURATION}
          running={!done}
          onExpire={timeUp}
        />
      }
    >
      {!done && (
        <>
          <div className="paper-card mb-5 rounded-lg p-4">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Clues</div>
            <ul className="grid gap-1.5 text-sm md:grid-cols-2">
              {puzzle.constraints.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded px-2 py-1"
                  style={{ background: constraintsMet[i] ? "color-mix(in oklab, var(--toner) 18%, transparent)" : "transparent" }}
                >
                  <span className="mt-0.5 font-display text-xs">{constraintsMet[i] ? "✓" : "·"}</span>
                  <span>{describe(c)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="paper-card rounded-lg p-5">
            <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">The row (position 1 → {puzzle.n})</div>
            <div className="flex flex-wrap justify-center gap-3">
              {order.map((d, i) => (
                <DuckSlot key={i} pos={i} duck={d} selected={picked?.id === d?.id} onClick={() => place(i)} />
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <div className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">Pool — tap a duck, then tap a slot</div>
              <div className="flex flex-wrap justify-center gap-3">
                {pool.map((d) => (
                  <DuckCard key={d.id} duck={d} selected={picked?.id === d.id} onClick={() => pickFromPool(d)} />
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={reset}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent"
              >
                New puzzle
              </button>
              <button
                onClick={submit}
                disabled={!allMet}
                className="rounded-md bg-primary px-4 py-2 font-display uppercase text-sm tracking-wider text-primary-foreground disabled:opacity-40"
              >
                Submit ({constraintsMet.filter(Boolean).length}/{puzzle.constraints.length})
              </button>
            </div>
          </div>
        </>
      )}

      {done && (
        <ResultCard
          won={done.won}
          score={score}
          xp={xp}
          best={Math.max(score, recordRoundReadonly("ducks"))}
          details={done.won ? `Solved with ${done.secondsLeft}s left.` : "Couldn't satisfy every clue in time."}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );

  // helper read-only — uses storage already updated by recordRound
}

function recordRoundReadonly(_g: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const s = JSON.parse(localStorage.getItem("cubicle-quest:v1") || "{}");
    return s.bestScores?.[_g] ?? 0;
  } catch { return 0; }
}

function DuckCard({ duck, selected, onClick }: { duck: Duck; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-24 flex-col items-center gap-1 rounded-md border-2 p-2 transition-all"
      style={{
        borderColor: selected ? "var(--toner)" : "var(--border)",
        background: "var(--card)",
        transform: selected ? "translateY(-3px)" : undefined,
      }}
    >
      <DuckGlyph color={duck.color} />
      <div className="text-[10px] capitalize text-muted-foreground">{duck.color}</div>
      <div className="text-[10px] capitalize">{duck.accessory}</div>
      <div className="text-[10px] capitalize font-display">{duck.role}</div>
    </button>
  );
}

function DuckSlot({ pos, duck, selected, onClick }: { pos: number; duck: Duck | null; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-24 flex-col items-center gap-1 rounded-md border-2 border-dashed p-2"
      style={{
        borderColor: selected ? "var(--toner)" : "var(--border)",
        background: duck ? "var(--card)" : "transparent",
        minHeight: 130,
      }}
    >
      <div className="text-[10px] font-display text-muted-foreground">#{pos + 1}</div>
      {duck ? (
        <>
          <DuckGlyph color={duck.color} />
          <div className="text-[10px] capitalize text-muted-foreground">{duck.color}</div>
          <div className="text-[10px] capitalize">{duck.accessory}</div>
          <div className="text-[10px] capitalize font-display">{duck.role}</div>
        </>
      ) : (
        <div className="grid h-full place-items-center text-xs text-muted-foreground">empty</div>
      )}
    </button>
  );
}

function DuckGlyph({ color }: { color: keyof typeof DUCK_COLOR_HEX }) {
  const hex = DUCK_COLOR_HEX[color];
  return (
    <svg width="40" height="34" viewBox="0 0 40 34">
      <ellipse cx="16" cy="22" rx="14" ry="9" fill={hex} stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="28" cy="14" r="7" fill={hex} stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="30" cy="12" r="1.3" fill="var(--ink)" />
      <path d="M34 14 L38 14 L36 17 Z" fill="#f0a05a" stroke="var(--ink)" strokeWidth="1" />
    </svg>
  );
}
