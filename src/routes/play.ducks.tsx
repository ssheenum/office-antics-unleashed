import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { generate, checkConstraint, describe, type Duck, type Puzzle } from "@/lib/puzzles/ducks";
import { recordRound, loadState } from "@/lib/storage";
import { timeBonus, xpFromScore } from "@/lib/scoring";
import { DuckMark } from "@/components/art/Marks";

export const Route = createFileRoute("/play/ducks")({
  head: () => ({
    meta: [
      { title: "Ducks in a Row — Cubicle Quest" },
      { name: "description", content: "Drag rubber ducks across lily pads. Keep every clue green for three seconds and survive the surprise splashes." },
    ],
  }),
  component: Ducks,
});

const DURATION = 180;
const HOLD_TO_WIN_MS = 3000;

function difficulty(level: number) {
  const n = Math.min(7, 4 + Math.floor((level - 1) / 2));
  const splashEvery = Math.max(4500, 11000 - (level - 1) * 1200);
  return { n, splashEvery };
}

// Friendly bright colors for the ducks themselves
const DUCK_BODY: Record<string, string> = {
  yellow: "#ffd166",
  pink: "#ffadc6",
  green: "#7ee3b8",
  blue: "#7fd6ec",
  orange: "#ff9966",
  purple: "#c9a8ff",
  white: "#fff7e0",
};

function Ducks() {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(difficulty(1).n));
  const [order, setOrder] = useState<(Duck | null)[]>(() => puzzle.ducks.slice());
  const [picked, setPicked] = useState<Duck | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [done, setDone] = useState<null | { secondsLeft: number; cleared: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [splashes, setSplashes] = useState(0);
  const [totalSplashes, setTotalSplashes] = useState(0);
  const [holdMs, setHoldMs] = useState(0);
  const [flashAt, setFlashAt] = useState<number | null>(null);
  const [runScore, setRunScore] = useState(0);
  const [cleared, setCleared] = useState(0);

  const { splashEvery } = difficulty(level);

  const constraintsMet = useMemo(
    () => puzzle.constraints.map((c) => checkConstraint(order, c)),
    [order, puzzle.constraints],
  );
  const metCount = constraintsMet.filter(Boolean).length;
  const allMet = constraintsMet.length > 0 && constraintsMet.every(Boolean);

  // Hold-to-win tracker
  const lastTickRef = useRef<number>(performance.now());
  useEffect(() => {
    if (done) return;
    let raf = 0;
    const tick = (t: number) => {
      const dt = t - lastTickRef.current;
      lastTickRef.current = t;
      setHoldMs((h) => (allMet ? Math.min(HOLD_TO_WIN_MS, h + dt) : 0));
      raf = requestAnimationFrame(tick);
    };
    lastTickRef.current = performance.now();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [allMet, done]);

  useEffect(() => {
    if (done) return;
    if (holdMs >= HOLD_TO_WIN_MS) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdMs, done]);

  // Splash event — swap two adjacent ducks
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setOrder((o) => {
        const idx = Math.floor(Math.random() * (o.length - 1));
        const a = o[idx];
        const b = o[idx + 1];
        if (!a || !b) return o;
        const n = [...o];
        n[idx] = b;
        n[idx + 1] = a;
        return n;
      });
      setSplashes((n) => n + 1);
      setTotalSplashes((n) => n + 1);
      setFlashAt(Date.now());
      setTimeout(() => setFlashAt(null), 700);
    }, splashEvery);
    return () => clearInterval(t);
  }, [done, splashEvery]);

  function swapAt(from: number, to: number) {
    if (from === to) return;
    setOrder((o) => {
      const n = [...o];
      const tmp = n[from];
      n[from] = n[to];
      n[to] = tmp;
      return n;
    });
  }

  function tapPad(slot: number) {
    if (done) return;
    if (picked) {
      const fromSlot = order.findIndex((d) => d?.id === picked.id);
      if (fromSlot >= 0) swapAt(fromSlot, slot);
      setPicked(null);
    } else if (order[slot]) {
      setPicked(order[slot]);
    }
  }

  function reset() {
    setLevel(1);
    const p = generate(difficulty(1).n);
    setPuzzle(p);
    setOrder(p.ducks.slice());
    setPicked(null);
    setDone(null);
    setSecondsLeft(DURATION);
    setSplashes(0);
    setTotalSplashes(0);
    setHoldMs(0);
    setRunScore(0);
    setCleared(0);
  }

  function advance() {
    const gain = 400 + puzzle.constraints.length * 35 + level * 50 - splashes * 8;
    setRunScore((s) => s + Math.max(50, gain));
    setCleared((c) => c + 1);
    const next = level + 1;
    setLevel(next);
    const p = generate(difficulty(next).n);
    setPuzzle(p);
    setOrder(p.ducks.slice());
    setPicked(null);
    setHoldMs(0);
    setSplashes(0);
  }

  function finish() {
    if (done) return;
    const partial = metCount * 25;
    const final = Math.max(0, runScore + partial + timeBonus(secondsLeft, 2));
    recordRound("ducks", final, xpFromScore(final));
    setDone({ secondsLeft, cleared });
  }

  const liveScore = runScore + (allMet ? 0 : metCount * 25);
  const finalScore = done
    ? Math.max(0, runScore + metCount * 25 + timeBonus(done.secondsLeft, 2))
    : 0;

  return (
    <GameShell
      title="Ducks in a Row"
      skill="Logic"
      rightSlot={
        <div className="flex items-center gap-3">
          <span className="chip-gold">L{level}</span>
          <span className="font-display tabular-nums" style={{ color: "var(--gold-deep)" }}>{liveScore}</span>
          <Timer seconds={DURATION} running={!done} onExpire={finish} onTick={setSecondsLeft} />
        </div>
      }
    >
      {!done && (
        <>
          <GameBanner
            Mark={DuckMark}
            eyebrow="Drag · drop · hold"
            tagline="Slide ducks across the lily pads until every clue glows green for 3 seconds straight."
          />

          {/* Clues */}
          <div className="glass grain mb-5 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="chip-sky">{puzzle.n} ducks</span>
                <span className="chip-muted">{cleared} cleared</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip-leaf">{metCount}/{puzzle.constraints.length} green</span>
                <span className="chip-muted">{splashes} splash{splashes === 1 ? "" : "es"}</span>
              </div>
            </div>
            <ul className="grid gap-1.5 text-sm md:grid-cols-2">
              {puzzle.constraints.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-xl border-[1.5px] px-3 py-2 transition-colors"
                  style={{
                    background: constraintsMet[i] ? "var(--leaf-soft)" : "var(--paper-2)",
                    borderColor: constraintsMet[i]
                      ? "color-mix(in oklab, var(--leaf) 60%, transparent)"
                      : "color-mix(in oklab, var(--ink) 10%, transparent)",
                  }}
                >
                  <span
                    className="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: constraintsMet[i] ? "var(--leaf-deep, #1ba884)" : "color-mix(in oklab, var(--ink) 25%, transparent)" }}
                  />
                  <span className="leading-snug">{describe(c)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pond */}
          <div
            className="relative overflow-hidden rounded-3xl border-[2.5px] p-6"
            style={{
              background:
                "radial-gradient(ellipse at 20% 30%, #b6e6f3, transparent 55%), radial-gradient(ellipse at 75% 70%, #9ddef0, transparent 60%), #cdebf6",
              borderColor: "color-mix(in oklab, #06aed5 50%, transparent)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6)",
            }}
          >
            {/* surface ripples */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <defs>
                <pattern id="ripple" width="60" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 q 15 -6 30 0 t 30 0" stroke="#0a8aaa" strokeOpacity="0.18" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ripple)" />
            </svg>

            <div className="relative mb-3 flex items-center justify-between">
              <span className="chip-sky">Lily pads · 1 → {puzzle.n}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Hold all green</span>
                <div
                  className="h-2.5 w-32 overflow-hidden rounded-full border-[1.5px]"
                  style={{ background: "white", borderColor: "color-mix(in oklab, #1f2933 12%, transparent)" }}
                >
                  <div className="h-full transition-all" style={{ width: `${(holdMs / HOLD_TO_WIN_MS) * 100}%`, background: "var(--leaf)" }} />
                </div>
              </div>
            </div>

            <div
              className="relative flex flex-wrap items-center justify-center gap-4 py-2"
              style={{ filter: flashAt ? "brightness(1.05)" : undefined }}
            >
              {order.map((d, i) => (
                <LilyPad
                  key={i}
                  index={i}
                  duck={d}
                  picked={picked?.id === d?.id}
                  dragging={dragId !== null && d?.id === dragId}
                  splash={!!flashAt}
                  onTap={() => tapPad(i)}
                  onDragStart={() => d && setDragId(d.id)}
                  onDragEnd={() => setDragId(null)}
                  onDrop={() => {
                    if (dragId == null) return;
                    const from = order.findIndex((x) => x?.id === dragId);
                    if (from >= 0) swapAt(from, i);
                    setDragId(null);
                  }}
                />
              ))}
            </div>

            <div className="relative mt-4 flex items-center justify-between">
              <button onClick={reset} className="pill-btn text-xs">Restart run</button>
              <p className="text-xs text-muted-foreground">Drag a duck onto another pad — or tap two pads to swap.</p>
            </div>
          </div>
        </>
      )}

      {done && (
        <ResultCard
          won={done.cleared > 0}
          score={finalScore}
          xp={xpFromScore(finalScore)}
          best={loadState().bestScores.ducks}
          details={`Cleared ${done.cleared} level${done.cleared === 1 ? "" : "s"} · weathered ${totalSplashes} splash${totalSplashes === 1 ? "" : "es"}.`}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}

function LilyPad({
  index,
  duck,
  picked,
  dragging,
  splash,
  onTap,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  index: number;
  duck: Duck | null;
  picked: boolean;
  dragging: boolean;
  splash: boolean;
  onTap: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  const body = duck ? DUCK_BODY[duck.color] ?? "#ffd166" : "#ffffff";
  return (
    <div
      onClick={onTap}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      className="relative grid h-44 w-28 cursor-pointer select-none place-items-center rounded-[40%_60%_40%_60%/45%_55%_45%_55%] border-[2px] transition-transform"
      style={{
        background: "radial-gradient(ellipse at 30% 30%, #b9e8c8, #6cca97 70%)",
        borderColor: "#1ba884",
        transform: picked ? "translateY(-6px) scale(1.02)" : undefined,
        boxShadow: picked ? "0 0 0 5px color-mix(in oklab, #ffd166 40%, transparent)" : "0 4px 0 #1ba884",
      }}
    >
      <span className="absolute top-2 left-3 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "color-mix(in oklab, #1ba884 50%, #1f2933)" }}>#{index + 1}</span>

      {duck ? (
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className={`relative flex cursor-grab flex-col items-center gap-1 active:cursor-grabbing ${splash ? "wiggle" : ""}`}
          style={{ opacity: dragging ? 0.35 : 1 }}
        >
          <DuckGlyph color={body} />
          <div className="mt-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold capitalize" style={{ color: "#1f2933" }}>
            {duck.accessory}
          </div>
          <div className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ background: "#ffd166", color: "#1f2933" }}>
            {duck.role}
          </div>
        </div>
      ) : (
        <span className="text-xs font-semibold text-muted-foreground">empty</span>
      )}
    </div>
  );
}

function DuckGlyph({ color }: { color: string }) {
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
      <ellipse cx="26" cy="32" rx="22" ry="11" fill={color} stroke="#1f2933" strokeWidth="2.5" />
      <circle cx="48" cy="18" r="11" fill={color} stroke="#1f2933" strokeWidth="2.5" />
      <circle cx="51" cy="16" r="1.6" fill="#1f2933" />
      <circle cx="51.6" cy="15.5" r="0.45" fill="#fdf6e3" />
      <path d="M58 19 L66 17 L60 24 Z" fill="#ff7a59" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 26 q 8 -6 18 0" stroke="#1f2933" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}
