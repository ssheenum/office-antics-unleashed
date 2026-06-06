import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { generate, check, describeTarget, isPrime, type Puzzle, type Fruit } from "@/lib/puzzles/fruit";
import { recordRound, loadState } from "@/lib/storage";
import { timeBonus, xpFromScore } from "@/lib/scoring";
import { BranchMark } from "@/components/art/Marks";

export const Route = createFileRoute("/play/fruit")({
  head: () => ({
    meta: [
      { title: "Low-Hanging Fruit — Cubicle Quest" },
      { name: "description", content: "Pick fruits that hit the target with the least reach. Live totals, swaying branches, occasional free drops." },
    ],
  }),
  component: FruitGame,
});

const DURATION = 150;
const DROP_INTERVAL = 7000;
const DROP_DURATION = 2200;

function FruitGame() {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(1));
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [done, setDone] = useState<null | { secondsLeft: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [droppedId, setDroppedId] = useState<number | null>(null);
  const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pickedFruits = useMemo(() => puzzle.fruits.filter((f) => picked.includes(f.id)), [puzzle, picked]);
  const reach = useMemo(
    () => pickedFruits.reduce((s, f) => s + (f.id === droppedId ? 0 : f.row + 1), 0),
    [pickedFruits, droppedId],
  );
  const sum = pickedFruits.reduce((s, f) => s + f.value, 0);
  const ok = check(puzzle.target, pickedFruits);
  const previewScore = ok ? Math.max(20, 80 + level * 10 - (reach - puzzle.target.size) * 6) : 0;

  // Free-drop event — gets rarer as level rises
  useEffect(() => {
    if (done) return;
    const interval = Math.max(4500, DROP_INTERVAL + (level - 1) * 600);
    const t = setInterval(() => {
      const f = puzzle.fruits[Math.floor(Math.random() * puzzle.fruits.length)];
      setDroppedId(f.id);
      if (dropTimer.current) clearTimeout(dropTimer.current);
      dropTimer.current = setTimeout(() => setDroppedId(null), DROP_DURATION);
    }, interval);
    return () => {
      clearInterval(t);
      if (dropTimer.current) clearTimeout(dropTimer.current);
    };
  }, [puzzle, done, level]);

  function toggle(f: Fruit) {
    if (done) return;
    setPicked((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id]));
  }

  function submit() {
    if (done) return;
    if (pickedFruits.length !== puzzle.target.size) return;
    if (ok) {
      setScore((s) => s + previewScore);
      setRounds((r) => r + 1);
      setFlash("good");
      setTimeout(() => setFlash(null), 350);
      const next = level + 1;
      setLevel(next);
      setPuzzle(generate(next));
      setPicked([]);
      setDroppedId(null);
    } else {
      setScore((s) => Math.max(0, s - 15));
      setFlash("bad");
      setTimeout(() => setFlash(null), 350);
      setPicked([]);
    }
  }

  function finish() {
    const bonus = timeBonus(secondsLeft, 1);
    const final = score + bonus;
    recordRound("fruit", final, xpFromScore(final));
    setDone({ secondsLeft });
  }

  function reset() {
    setLevel(1);
    setPuzzle(generate(1));
    setPicked([]);
    setScore(0);
    setRounds(0);
    setDone(null);
    setDroppedId(null);
  }

  const finalScore = done ? score + timeBonus(done.secondsLeft, 1) : 0;
  const rows = [3, 2, 1, 0];

  return (
    <GameShell
      title="Low-Hanging Fruit"
      skill="Spatial-Math"
      rightSlot={
        <div className="flex items-center gap-4">
          <div className="font-display tabular-nums" style={{ color: "var(--gold)" }}>Score {score}</div>
          <Timer seconds={DURATION} running={!done} onExpire={() => !done && finish()} onTick={setSecondsLeft} />
        </div>
      }
    >
      <GameBanner
        Mark={BranchMark}
        eyebrow="Live optimization"
        tagline="Low fruit pays best. Reach the target with the smallest reach cost — and grab the free drops."
      />
      {!done && (
        <div className="glass grain rounded-2xl p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Round {rounds + 1}</div>
              <div className="font-display text-2xl tracking-tight">{describeTarget(puzzle.target)}</div>
            </div>
            <div className="flex gap-3 text-right text-xs">
              <Live label="Sum" value={sum} />
              <Live label="Reach" value={reach} accent={reach <= puzzle.target.size + 1 ? "ok" : reach >= puzzle.target.size + 4 ? "warn" : undefined} />
              <Live label="Worth" value={previewScore} accent={ok ? "gold" : undefined} />
            </div>
          </div>

          <div
            className="rounded-2xl p-5 transition-colors"
            style={{
              background:
                flash === "good" ? "color-mix(in oklab, var(--ok) 18%, transparent)" :
                flash === "bad" ? "color-mix(in oklab, var(--warn) 18%, transparent)" :
                "color-mix(in oklab, white 3%, transparent)",
            }}
          >
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row} className="flex items-center justify-center gap-2">
                  {puzzle.fruits.filter((f) => f.row === row).sort((a, b) => a.col - b.col).map((f) => {
                    const sel = picked.includes(f.id);
                    const dropped = droppedId === f.id;
                    const isP = isPrime(f.value);
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggle(f)}
                        className="relative grid h-14 w-14 place-items-center rounded-full font-display text-lg transition-all sway-slow"
                        style={{
                          animationDelay: `${(f.col * 0.3 + row * 0.2).toFixed(2)}s`,
                          color: sel ? "#0f1115" : "var(--cream)",
                          background: sel
                            ? "linear-gradient(180deg, var(--gold-soft), var(--gold))"
                            : `color-mix(in oklab, var(--gold) ${4 + row * 4}%, color-mix(in oklab, white 4%, transparent))`,
                          border: `1px solid ${sel ? "color-mix(in oklab, var(--gold) 90%, black)" : "color-mix(in oklab, white 12%, transparent)"}`,
                          boxShadow: sel
                            ? "0 0 0 4px color-mix(in oklab, var(--gold) 25%, transparent), 0 8px 18px -8px rgba(0,0,0,0.5)"
                            : dropped
                            ? "0 0 0 3px color-mix(in oklab, var(--ok) 35%, transparent)"
                            : undefined,
                          transform: sel ? "translateY(2px) scale(1.05)" : dropped ? "translateY(8px)" : undefined,
                        }}
                        title={`${f.value}${isP ? " · prime" : ""}${dropped ? " · free!" : ""}`}
                      >
                        {f.value}
                        {dropped && <span className="absolute -top-1 -right-1 chip-gold !px-1.5 !py-0 !text-[8px]">Free</span>}
                      </button>
                    );
                  })}
                  <span className="ml-2 w-16 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {row === 0 ? "easy reach" : row === 3 ? "top shelf" : `row ${row + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => setPicked([])} className="pill-btn text-xs">Clear</button>
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={pickedFruits.length !== puzzle.target.size}
                className="pill-btn pill-btn-gold text-sm"
              >
                Submit · {pickedFruits.length}/{puzzle.target.size}
              </button>
              <button onClick={finish} className="pill-btn text-sm">Bank &amp; finish</button>
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

function Live({ label, value, accent }: { label: string; value: number; accent?: "ok" | "warn" | "gold" }) {
  const color =
    accent === "ok" ? "var(--ok)" :
    accent === "warn" ? "var(--warn)" :
    accent === "gold" ? "var(--gold)" :
    "var(--cream)";
  return (
    <div className="rounded-lg border px-3 py-1.5" style={{ borderColor: "color-mix(in oklab, white 8%, transparent)", background: "color-mix(in oklab, white 3%, transparent)" }}>
      <div className="font-display text-lg tabular-nums leading-none" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    </div>
  );
}
