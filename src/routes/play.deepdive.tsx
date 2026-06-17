import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { ResultCard } from "@/components/game/ResultCard";
import { PropSprite, TreasureSprite } from "@/components/art/PondProps";
import { recordRound, loadState } from "@/lib/storage";
import { xpFromScore } from "@/lib/scoring";
import { Tutorial } from "@/components/game/Tutorial";
import { MapIcon, TapIcon, NoIcon } from "@/components/art/MinimalIcons";
import tileTreasure from "@/assets/tile-treasure.png";

import {
  generateDeepDive, clueDescribe, SIZE, type Puzzle,
} from "@/lib/puzzles/deepdive";

export const Route = createFileRoute("/play/deepdive")({
  head: () => ({
    meta: [
      { title: "Deep Dive — Touch Grass" },
      { name: "description", content: "Help a tiny diver find the buried treasure. Read the clues, narrow the grid, and tap the right tile." },
    ],
  }),
  component: DeepDive,
});

const MAX_STRIKES = 3;

interface RoundState {
  puzzle: Puzzle;
  guesses: number;
  solved: boolean;
  startedAt: number;
  revealedTile: { x: number; y: number } | null;
  wrongTiles: { x: number; y: number }[];
  markedTiles: { x: number; y: number }[];
  splashAt: { x: number; y: number } | null;
}

function freshRound(level: number): RoundState {
  const puzzle = generateDeepDive(level);
  return {
    puzzle,
    guesses: 0,
    solved: false,
    startedAt: typeof performance !== "undefined" ? performance.now() : 0,
    revealedTile: null,
    wrongTiles: [],
    markedTiles: [],
    splashAt: null,
  };
}

function DeepDive() {
  const [roundIdx, setRoundIdx] = useState(0);
  const [round, setRound] = useState<RoundState | null>(null);
  const [score, setScore] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [done, setDone] = useState(false);
  const [diver, setDiver] = useState<{ x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState<null | { ok: boolean; text: string }>(null);

  // Generate the first puzzle on the client only to avoid SSR/CSR hydration mismatch.
  useEffect(() => {
    if (!round) setRound(freshRound(1));
  }, [round]);

  function tapTile(x: number, y: number, e?: React.MouseEvent) {
    if (done || !round || round.solved) return;
    const r0 = round;
    const tile = r0.puzzle.grid[y * SIZE + x];
    if (tile.prop !== null) return;
    // shift / right-click → toggle a "no" mark, don't guess
    if (e && (e.shiftKey || e.metaKey)) {
      setRound((r) => {
        if (!r) return r;
        const exists = r.markedTiles.some((m) => m.x === x && m.y === y);
        return {
          ...r,
          markedTiles: exists
            ? r.markedTiles.filter((m) => !(m.x === x && m.y === y))
            : [...r.markedTiles, { x, y }],
        };
      });
      return;
    }
    setDiver({ x, y });
    const isWin = x === r0.puzzle.treasure.x && y === r0.puzzle.treasure.y;
    if (isWin) {
      const elapsed = (performance.now() - r0.startedAt) / 1000;
      const speedBonus = Math.max(0, 30 - Math.floor(elapsed)) * 6;
      const firstTry = r0.guesses === 0;
      const base = 120 + r0.puzzle.difficulty * 40;
      const gain = base + speedBonus + (firstTry ? 80 : 0);
      setScore((s) => s + gain);
      setRound((r) => (r ? { ...r, solved: true, revealedTile: { x, y }, splashAt: { x, y } } : r));
      setFeedback({ ok: true, text: `Treasure! +${gain}${firstTry ? " (first try)" : ""}` });
      setTimeout(nextRound, 1700);
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setRound((r) => (r ? { ...r, guesses: r.guesses + 1, wrongTiles: [...r.wrongTiles, { x, y }] } : r));
      setFeedback({ ok: false, text: `Nothing here. -1 air bubble.` });
      setTimeout(() => setFeedback(null), 1200);
      if (newStrikes >= MAX_STRIKES) {
        setTimeout(finish, 900);
      }
    }
  }

  function nextRound() {
    const next = roundIdx + 1;
    setRoundIdx(next);
    // endless: ramps up gradually, capped at 5
    setRound(freshRound(Math.min(5, 1 + Math.floor(next / 2))));
    setDiver(null);
    setFeedback(null);
  }

  function finish() {
    if (done) return;
    setDone(true);
    recordRound("deepdive", score, xpFromScore(score));
  }

  function reset() {
    setRoundIdx(0);
    setRound(freshRound(1));
    setScore(0);
    setStrikes(0);
    setDone(false);
    setDiver(null);
    setFeedback(null);
  }

  const details = useMemo(() => {
    return `Cleared ${roundIdx + (round?.solved ? 1 : 0)} round${roundIdx === 0 ? "" : "s"} · ${strikes} wrong tap${strikes === 1 ? "" : "s"}.`;
  }, [roundIdx, strikes, round?.solved]);

  return (
    <GameShell
      title="Deep Dive"
      skill="Logic"
      rightSlot={
        <div className="flex items-center gap-3">
          <span className="chip-sky">Round {roundIdx + 1}</span>
          <span className="font-display tabular-nums" style={{ color: "var(--gold-deep)" }}>{score}</span>
          <AirBubbles n={MAX_STRIKES - strikes} />
        </div>
      }
    >
      <Tutorial
        gameKey="deepdive"
        title="Deep Dive"
        accent="#3aa9d8"
        accentDeep="#1d6b8e"
        onStart={() => {}}
        steps={[
          { icon: <MapIcon width={56} height={56} style={{ color: "#1d6b8e" }} />, title: "Read the clues", body: "Each round hides treasure on a small underwater grid. The clues at the top narrow down where it could be." },
          { icon: <TapIcon width={56} height={56} style={{ color: "#3aa9d8" }} />, title: "Tap to dig", body: "Tap an empty tile to dig there. Find the treasure to score big — bonus points if you nail it first try." },
          { icon: <NoIcon width={56} height={56} style={{ color: "#c2492f" }} />, title: "Mark and survive", body: <>Shift-click (or right-click) to mark a tile as <b>"no"</b> while you think. Three wrong taps and the game ends.</> },
        ]}

      />
      {!done && round && (
        <>
          <GameBanner
            image={tileTreasure}
            eyebrow="Treasure detective"
            tagline="Read the clues, then tap the empty tile that matches them all. Shift-click to mark a tile as 'no'."
          />

          {/* Clue log */}
          <div className="glass grain mb-5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="chip-sky">Clues · {round.puzzle.clues.length}</span>
              <span className="chip-muted">Level {round.puzzle.difficulty}</span>
            </div>
            <ul className="grid gap-1.5 text-sm md:grid-cols-2">
              {round.puzzle.clues.map((c, i) => (
                <li key={i} className="flex items-start gap-2 rounded-xl border-[1.5px] bg-white/60 px-3 py-2"
                    style={{ borderColor: "color-mix(in oklab, #06aed5 40%, transparent)" }}>
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--sky-deep)" }} />
                  <span className="leading-snug">{clueDescribe(c)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Grid */}
          <div
            className="relative mx-auto overflow-hidden rounded-3xl border-[2.5px] p-3"
            style={{
              maxWidth: 520,
              background:
                "linear-gradient(180deg, color-mix(in oklab, #5b9e3d 25%, white) 0%, color-mix(in oklab, #5b9e3d 55%, #2b4d1c) 100%)",
              borderColor: "color-mix(in oklab, #5b9e3d 55%, transparent)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.55)",
            }}
          >
            <div className="relative grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
              {round.puzzle.grid.map((tile) => {
                const isTreasure = round.revealedTile?.x === tile.x && round.revealedTile?.y === tile.y;
                const isWrong = round.wrongTiles.some((w) => w.x === tile.x && w.y === tile.y);
                const isMarked = round.markedTiles.some((m) => m.x === tile.x && m.y === tile.y);
                const hasProp = tile.prop !== null;
                const isDiver = diver?.x === tile.x && diver?.y === tile.y;
                const isSplash = round.splashAt?.x === tile.x && round.splashAt?.y === tile.y;
                return (
                  <button
                    key={`${tile.x}-${tile.y}`}
                    onClick={(e) => tapTile(tile.x, tile.y, e)}
                    onContextMenu={(e) => { e.preventDefault(); tapTile(tile.x, tile.y, { ...e, shiftKey: true } as React.MouseEvent); }}
                    disabled={hasProp || done || round.solved}
                    className="relative aspect-square grid place-items-center rounded-xl border-[2px] transition-transform hover:scale-[1.04]"
                    style={{
                      background: hasProp
                        ? "color-mix(in oklab, #fbeed8 80%, transparent)"
                        : isMarked
                        ? "color-mix(in oklab, #ff7a59 25%, white)"
                        : "color-mix(in oklab, #fbeed8 35%, transparent)",
                      borderColor: hasProp ? "#1f2933" : isMarked ? "#c2492f" : "rgba(255,255,255,0.7)",
                      cursor: hasProp ? "default" : "pointer",
                    }}
                  >
                    {tile.prop && <PropSprite kind={tile.prop} size={44} />}
                    {isTreasure && (
                      <span className="absolute inset-0 grid place-items-center pop-in">
                        <TreasureSprite size={48} />
                      </span>
                    )}
                    {isSplash && (
                      <span className="pointer-events-none absolute inset-0 rounded-xl splash" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent 70%)" }} />
                    )}
                    {isWrong && !isTreasure && (
                      <span className="absolute inset-0 grid place-items-center text-2xl shake-x" style={{ color: "#c2492f" }}>✕</span>
                    )}
                    {isMarked && !isWrong && !isTreasure && (
                      <span className="absolute inset-0 grid place-items-center opacity-60" style={{ color: "#c2492f" }}><NoIcon width={22} height={22} /></span>
                    )}
                    {isDiver && !isTreasure && !isWrong && (
                      <span className="absolute inset-0 grid place-items-center"><TapIcon width={30} height={30} style={{ color: "#1f2933" }} /></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {feedback && (
            <div className="mt-4 flex justify-center pop-in">
              <span
                className="rounded-full border-[2px] px-4 py-1.5 font-display text-sm"
                style={{
                  background: feedback.ok ? "color-mix(in oklab, #2dd4a8 25%, white)" : "color-mix(in oklab, #ff7a59 25%, white)",
                  borderColor: feedback.ok ? "#1ba884" : "#c2492f",
                }}
              >
                {feedback.ok ? "✓ " : "✕ "}{feedback.text}
              </span>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <button onClick={reset} className="pill-btn text-xs">Restart</button>
            <span className="chip-muted">Shift-click to mark a 'no' · right-click also works</span>
          </div>
        </>
      )}

      {done && (
        <ResultCard
          won={score >= 400}
          score={score}
          xp={xpFromScore(score)}
          best={loadState().bestScores.deepdive}
          details={details}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}


function AirBubbles({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: MAX_STRIKES }).map((_, i) => (
        <span
          key={i}
          className="inline-block h-3.5 w-3.5 rounded-full border-[1.5px]"
          style={{
            background: i < n ? "rgba(255,255,255,0.9)" : "rgba(31,41,51,0.12)",
            borderColor: i < n ? "#0a8aaa" : "rgba(31,41,51,0.25)",
          }}
        />
      ))}
    </span>
  );
}
