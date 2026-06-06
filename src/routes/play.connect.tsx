import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { randomBoard, tilesFromBoard, findGroup, DIFFICULTY_COLOR, type Board, type Group } from "@/lib/puzzles/connect";
import { recordRound, loadState } from "@/lib/storage";
import { timeBonus, xpFromScore } from "@/lib/scoring";
import connectHero from "@/assets/connect-hero.png";

export const Route = createFileRoute("/play/connect")({
  head: () => ({
    meta: [
      { title: "Connect the Dots — Cubicle Quest" },
      { name: "description", content: "Find four hidden groups of four. Decoys overlap — pattern recognition under pressure." },
    ],
  }),
  component: Connect,
});

const DURATION = 180;
const MAX_MISTAKES = 4;

function Connect() {
  const [board, setBoard] = useState<Board>(() => randomBoard());
  const [tiles, setTiles] = useState<string[]>(() => tilesFromBoard(board));
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<Group[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState<null | { won: boolean; secondsLeft: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [shake, setShake] = useState(false);

  const remaining = useMemo(() => tiles.filter((t) => !solved.some((g) => g.words.includes(t))), [tiles, solved]);

  function toggle(w: string) {
    if (done) return;
    if (solved.some((g) => g.words.includes(w))) return;
    setSelected((s) => (s.includes(w) ? s.filter((x) => x !== w) : s.length < 4 ? [...s, w] : s));
  }

  function submit() {
    if (selected.length !== 4) return;
    const g = findGroup(board, selected);
    if (g) {
      const newSolved = [...solved, g];
      setSolved(newSolved);
      setSelected([]);
      if (newSolved.length === 4) finish(true);
    } else {
      setMistakes((m) => {
        const nm = m + 1;
        if (nm >= MAX_MISTAKES) finish(false);
        return nm;
      });
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setSelected([]);
    }
  }

  function finish(won: boolean) {
    const score = won
      ? 200 + (MAX_MISTAKES - mistakes) * 50 + timeBonus(secondsLeft, 3)
      : solved.length * 60;
    const xp = xpFromScore(score);
    recordRound("connect", score, xp);
    setDone({ won, secondsLeft });
  }

  function reset() {
    const b = randomBoard();
    setBoard(b);
    setTiles(tilesFromBoard(b));
    setSelected([]);
    setSolved([]);
    setMistakes(0);
    setDone(null);
  }

  function timeUp() {
    if (done) return;
    finish(false);
  }

  const finalScore = done
    ? done.won
      ? 200 + (MAX_MISTAKES - mistakes) * 50 + timeBonus(done.secondsLeft, 3)
      : solved.length * 60
    : 0;

  return (
    <GameShell
      title="Connect the Dots"
      skill="Pattern"
      rightSlot={<Timer seconds={DURATION} running={!done} onExpire={timeUp} onTick={setSecondsLeft} />}
    >
      {!done && (
        <>
        <GameBanner image={connectHero} theme="connect" tagline="Connect the dots — four hidden groups of four. Trust the pattern, dodge the decoys." />
        <div className="paper-card rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Find 4 groups of 4. {MAX_MISTAKES - mistakes} mistakes left.</div>
            <div className="flex gap-1">
              {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full"
                  style={{ background: i < MAX_MISTAKES - mistakes ? "var(--ink)" : "var(--border)" }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {solved.map((g) => (
              <div
                key={g.category}
                className="rounded-md p-3 text-center"
                style={{ background: DIFFICULTY_COLOR[g.difficulty], color: "var(--ink)" }}
              >
                <div className="font-display text-sm uppercase tracking-wider">{g.category}</div>
                <div className="text-sm">{g.words.join(" · ")}</div>
              </div>
            ))}
          </div>

          <div className={`mt-4 grid grid-cols-4 gap-2 ${shake ? "animate-pulse" : ""}`}>
            {remaining.map((w) => (
              <button
                key={w}
                onClick={() => toggle(w)}
                className="rounded-md border-2 px-2 py-4 text-center font-display text-sm uppercase tracking-wider transition-all"
                style={{
                  borderColor: selected.includes(w) ? "var(--ink)" : "var(--border)",
                  background: selected.includes(w) ? "var(--ink)" : "var(--card)",
                  color: selected.includes(w) ? "var(--paper)" : "var(--foreground)",
                  transform: selected.includes(w) ? "translateY(-2px)" : undefined,
                }}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setSelected([])} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent">
              Clear
            </button>
            <button
              onClick={submit}
              disabled={selected.length !== 4}
              className="rounded-md bg-primary px-4 py-2 font-display uppercase text-sm tracking-wider text-primary-foreground disabled:opacity-40"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {done && (
        <ResultCard
          won={done.won}
          score={finalScore}
          xp={xpFromScore(finalScore)}
          best={loadState().bestScores.connect}
          details={done.won ? `All four groups, ${mistakes} mistakes.` : `${solved.length}/4 groups found.`}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}
