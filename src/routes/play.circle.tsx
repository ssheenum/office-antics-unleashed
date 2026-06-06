import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { ResultCard } from "@/components/game/ResultCard";
import { generateRound, getSymbol, type Round } from "@/lib/puzzles/circle";
import { recordRound, loadState } from "@/lib/storage";
import { xpFromScore } from "@/lib/scoring";
import circleHero from "@/assets/circle-hero.png";

export const Route = createFileRoute("/play/circle")({
  head: () => ({
    meta: [
      { title: "Circle Back — Cubicle Quest" },
      { name: "description", content: "Sticky-note sequence memory with twists: forward, reversed, or with a swap." },
    ],
  }),
  component: Circle,
});

type Phase = "show" | "input" | "done";

function Circle() {
  const [roundIdx, setRoundIdx] = useState(0);
  const [round, setRound] = useState<Round>(() => generateRound(0));
  const [phase, setPhase] = useState<Phase>("show");
  const [showIdx, setShowIdx] = useState(0);
  const [input, setInput] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<null | { reason: string }>(null);

  useEffect(() => {
    if (phase !== "show") return;
    setShowIdx(0);
    let i = 0;
    const tick = () => {
      setShowIdx(i);
      i++;
      if (i > round.sequence.length) {
        setPhase("input");
        return;
      }
      setTimeout(tick, 650);
    };
    setTimeout(tick, 400);
  }, [phase, round]);

  function press(c: number) {
    if (phase !== "input") return;
    const next = [...input, c];
    setInput(next);
    if (next[next.length - 1] !== round.expected[next.length - 1]) {
      // wrong
      finish(`Wrong tap at step ${next.length}.`);
      return;
    }
    if (next.length === round.expected.length) {
      // round won
      const earned = round.expected.length * (round.mode === "swap" ? 40 : round.mode === "reverse" ? 30 : 20);
      const newScore = score + earned;
      setScore(newScore);
      const nextIdx = roundIdx + 1;
      setRoundIdx(nextIdx);
      setRound(generateRound(nextIdx));
      setInput([]);
      setPhase("show");
    }
  }

  function finish(reason: string) {
    setPhase("done");
    recordRound("circle", score, xpFromScore(score));
    setDone({ reason });
  }

  function reset() {
    setRoundIdx(0);
    setRound(generateRound(0));
    setInput([]);
    setScore(0);
    setPhase("show");
    setDone(null);
  }

  const activeCell = phase === "show" && showIdx < round.sequence.length ? round.sequence[showIdx] : -1;
  const modeLabel =
    round.mode === "forward" ? "Replay in order" :
    round.mode === "reverse" ? "Replay BACKWARDS" :
    "Replay with one swap";

  return (
    <GameShell
      title="Circle Back"
      skill="Memory"
      rightSlot={<div className="font-display tabular-nums">Score {score}</div>}
    >
      <div className="paper-card rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Round {roundIdx + 1} · length {round.sequence.length}</div>
            <div className="font-display text-xl uppercase tracking-wider">{modeLabel}</div>
            {round.mode === "swap" && phase !== "show" && (
              <div className="mt-1 text-sm" style={{ color: "var(--stamp)" }}>{round.swapNote}</div>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {phase === "show" ? "Watch carefully…" : `Step ${input.length + 1} / ${round.expected.length}`}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3">
          {Array.from({ length: 9 }, (_, i) => i).map((i) => {
            const lit = activeCell === i;
            return (
              <button
                key={i}
                onClick={() => press(i)}
                disabled={phase !== "input"}
                className="aspect-square rounded-md border-2 text-3xl transition-all"
                style={{
                  borderColor: "var(--border)",
                  background: lit ? "var(--highlighter)" : "var(--card)",
                  transform: lit ? "scale(1.06)" : undefined,
                  boxShadow: lit ? "0 6px 16px -4px oklch(0 0 0 / 0.25)" : undefined,
                  cursor: phase === "input" ? "pointer" : "default",
                }}
              >
                {getSymbol(i as any)}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-between">
          <button onClick={reset} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent">
            Restart
          </button>
          <button
            onClick={() => finish("Stopped early.")}
            disabled={phase === "done"}
            className="rounded-md bg-primary px-4 py-2 font-display uppercase text-sm tracking-wider text-primary-foreground disabled:opacity-40"
          >
            Bank score
          </button>
        </div>
      </div>

      {done && (
        <ResultCard
          won={score > 100}
          score={score}
          xp={xpFromScore(score)}
          best={loadState().bestScores.circle}
          details={`Made it through ${roundIdx} round${roundIdx === 1 ? "" : "s"}. ${done.reason}`}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}
