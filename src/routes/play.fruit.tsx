import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { generate, check, reachCost, describeTarget, type Puzzle, type Fruit } from "@/lib/puzzles/fruit";
import { recordRound, loadState } from "@/lib/storage";
import { timeBonus, xpFromScore } from "@/lib/scoring";
import fruitHero from "@/assets/fruit-hero.png";

export const Route = createFileRoute("/play/fruit")({
  head: () => ({
    meta: [
      { title: "Low-Hanging Fruit — Cubicle Quest" },
      { name: "description", content: "Pick the lowest-reachable fruits that satisfy the target. Higher fruits cost reach." },
    ],
  }),
  component: FruitGame,
});

const DURATION = 180;

function FruitGame() {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate());
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [done, setDone] = useState<null | { secondsLeft: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const pickedFruits = useMemo(() => puzzle.fruits.filter((f) => picked.includes(f.id)), [puzzle, picked]);
  const reach = reachCost(pickedFruits);

  function toggle(f: Fruit) {
    if (done) return;
    setPicked((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id]));
  }

  function submit() {
    if (done) return;
    if (pickedFruits.length !== puzzle.target.size) return;
    const ok = check(puzzle.target, pickedFruits);
    if (ok) {
      const base = 80;
      const reachPenalty = reach - puzzle.target.size; // best case: all from row 0 → 0
      const earned = Math.max(20, base - reachPenalty * 6);
      setScore((s) => s + earned);
      setRounds((r) => r + 1);
      setFlash("good");
      setTimeout(() => setFlash(null), 300);
      setPuzzle(generate());
      setPicked([]);
    } else {
      setScore((s) => Math.max(0, s - 15));
      setFlash("bad");
      setTimeout(() => setFlash(null), 300);
      setPicked([]);
    }
  }

  function finish() {
    const bonus = timeBonus(secondsLeft, 1);
    const final = score + bonus;
    recordRound("fruit", final, xpFromScore(final));
    setDone({ secondsLeft });
  }

  function timeUp() {
    if (done) return;
    finish();
  }

  function reset() {
    setPuzzle(generate());
    setPicked([]);
    setScore(0);
    setRounds(0);
    setDone(null);
  }

  const finalScore = done ? score + timeBonus(done.secondsLeft, 1) : 0;

  // build grid; row 0 = bottom visually
  const rows = [3, 2, 1, 0];

  return (
    <GameShell
      title="Low-Hanging Fruit"
      skill="Spatial-Math"
      rightSlot={
        <div className="flex items-center gap-4">
          <div className="font-display tabular-nums">Score {score}</div>
          <Timer seconds={DURATION} running={!done} onExpire={timeUp} onTick={setSecondsLeft} />
        </div>
      }
    >
      <GameBanner image={fruitHero} theme="fruit" tagline="Low-hanging fruit pays best — hit the target with the least reach." />
      {!done && (
        <div className="paper-card rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Round {rounds + 1}</div>
              <div className="font-display text-lg">{describeTarget(puzzle.target)}</div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Reach cost: <span className="font-display text-foreground">{reach}</span> · lower is better
            </div>
          </div>

          <div
            className="rounded-md p-4 transition-colors"
            style={{
              background:
                flash === "good" ? "color-mix(in oklab, var(--toner) 25%, var(--card))" :
                flash === "bad" ? "color-mix(in oklab, var(--stamp) 25%, var(--card))" :
                "var(--card)",
            }}
          >
            <div className="space-y-2">
              {rows.map((row) => (
                <div key={row} className="flex justify-center gap-2">
                  {puzzle.fruits.filter((f) => f.row === row).sort((a, b) => a.col - b.col).map((f) => {
                    const sel = picked.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggle(f)}
                        className="grid h-14 w-14 place-items-center rounded-full border-2 font-display text-lg transition-all"
                        style={{
                          borderColor: sel ? "var(--ink)" : "var(--border)",
                          background: sel ? "var(--highlighter)" : `color-mix(in oklab, var(--toner) ${10 + row * 6}%, var(--card))`,
                          transform: sel ? "scale(1.08)" : undefined,
                        }}
                      >
                        {f.value}
                      </button>
                    );
                  })}
                  <span className="ml-2 self-center text-[10px] uppercase tracking-widest text-muted-foreground">
                    {row === 0 ? "easy reach" : row === 3 ? "top shelf" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex justify-between">
            <button onClick={() => setPicked([])} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent">
              Clear
            </button>
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={pickedFruits.length !== puzzle.target.size}
                className="rounded-md bg-primary px-4 py-2 font-display uppercase text-sm tracking-wider text-primary-foreground disabled:opacity-40"
              >
                Submit ({pickedFruits.length}/{puzzle.target.size})
              </button>
              <button
                onClick={finish}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent"
              >
                Bank score
              </button>
            </div>
          </div>
        </div>
      )}

      {done && (
        <ResultCard
          won={finalScore > 100}
          score={finalScore}
          xp={xpFromScore(finalScore)}
          best={loadState().bestScores.fruit}
          details={`${rounds} round${rounds === 1 ? "" : "s"} cleared.`}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}
