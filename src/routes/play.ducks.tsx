import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { generate, checkConstraint, describe, DUCK_COLOR_HEX, type Duck, type Puzzle } from "@/lib/puzzles/ducks";
import { recordRound, loadState } from "@/lib/storage";
import { timeBonus, xpFromScore } from "@/lib/scoring";
import { DuckMark } from "@/components/art/Marks";

export const Route = createFileRoute("/play/ducks")({
  head: () => ({
    meta: [
      { title: "Ducks in a Row — Cubicle Quest" },
      { name: "description", content: "Live Einstein-style deduction. Keep every clue green for three seconds — and survive the interrupts." },
    ],
  }),
  component: Ducks,
});

const DURATION = 180;
const HOLD_TO_WIN_MS = 3000;

function difficulty(level: number) {
  // Scale: ducks 4→7, interrupts speed up
  const n = Math.min(7, 4 + Math.floor((level - 1) / 2));
  const interruptEvery = Math.max(4500, 11000 - (level - 1) * 1200);
  return { n, interruptEvery };
}

function Ducks() {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(difficulty(1).n));
  const [order, setOrder] = useState<(Duck | null)[]>(() => puzzle.ducks.slice());
  const [picked, setPicked] = useState<Duck | null>(null);
  const [done, setDone] = useState<null | { secondsLeft: number; cleared: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [interrupts, setInterrupts] = useState(0);
  const [totalInterrupts, setTotalInterrupts] = useState(0);
  const [holdMs, setHoldMs] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [runScore, setRunScore] = useState(0);
  const [cleared, setCleared] = useState(0);

  const { interruptEvery } = difficulty(level);

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

  // Advance level when held long enough
  useEffect(() => {
    if (done) return;
    if (holdMs >= HOLD_TO_WIN_MS) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdMs, done]);

  // Meeting interrupts — randomly swap two adjacent ducks
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
      setInterrupts((n) => n + 1);
      setTotalInterrupts((n) => n + 1);
      setFlash(Date.now());
      setTimeout(() => setFlash(null), 600);
    }, interruptEvery);
    return () => clearInterval(t);
  }, [done, interruptEvery]);

  function place(slot: number) {
    if (done) return;
    if (picked) {
      const fromSlot = order.findIndex((d) => d?.id === picked.id);
      const existing = order[slot];
      const n = [...order];
      n[slot] = picked;
      if (fromSlot >= 0 && fromSlot !== slot) n[fromSlot] = existing;
      setOrder(n);
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
    setInterrupts(0);
    setTotalInterrupts(0);
    setHoldMs(0);
    setRunScore(0);
    setCleared(0);
  }

  function advance() {
    const gain = 400 + puzzle.constraints.length * 35 + level * 50 - interrupts * 8;
    setRunScore((s) => s + Math.max(50, gain));
    setCleared((c) => c + 1);
    const next = level + 1;
    setLevel(next);
    const p = generate(difficulty(next).n);
    setPuzzle(p);
    setOrder(p.ducks.slice());
    setPicked(null);
    setHoldMs(0);
    setInterrupts(0);
  }

  function finish(_won: boolean) {
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
        <Timer seconds={DURATION} running={!done} onExpire={() => finish(false)} onTick={setSecondsLeft} />
      }
    >
      {!done && (
        <>
          <GameBanner
            Mark={DuckMark}
            eyebrow="Live deduction"
            tagline="Get every duck in line. Keep every clue green for three seconds straight."
          />

          <div className="glass grain mb-5 rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="chip-muted">{metCount}/{puzzle.constraints.length} clues green</span>
              <span className="chip-muted">{interrupts} interrupt{interrupts === 1 ? "" : "s"}</span>
            </div>
            <ul className="grid gap-1.5 text-sm md:grid-cols-2">
              {puzzle.constraints.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg px-3 py-2 transition-colors"
                  style={{
                    background: constraintsMet[i]
                      ? "color-mix(in oklab, var(--ok) 18%, transparent)"
                      : "color-mix(in oklab, white 4%, transparent)",
                    border: `1px solid ${constraintsMet[i] ? "color-mix(in oklab, var(--ok) 40%, transparent)" : "color-mix(in oklab, white 6%, transparent)"}`,
                  }}
                >
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full" style={{ background: constraintsMet[i] ? "var(--ok)" : "color-mix(in oklab, white 25%, transparent)" }} />
                  <span style={{ color: constraintsMet[i] ? "var(--cream)" : "var(--cream-muted)" }}>{describe(c)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass grain rounded-2xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="chip-gold">The row · 1 → {puzzle.n}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">All green</span>
                <div className="h-1.5 w-24 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, white 8%, transparent)" }}>
                  <div className="h-full transition-all" style={{ width: `${(holdMs / HOLD_TO_WIN_MS) * 100}%`, background: "var(--ok)" }} />
                </div>
              </div>
            </div>

            <div
              className="flex flex-wrap justify-center gap-3 rounded-xl p-3 transition-colors"
              style={{ background: flash ? "color-mix(in oklab, var(--warn) 14%, transparent)" : "transparent" }}
            >
              {order.map((d, i) => (
                <DuckSlot key={i} pos={i} duck={d} selected={picked?.id === d?.id} onClick={() => place(i)} />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button onClick={reset} className="pill-btn text-xs">New puzzle</button>
              <p className="text-xs text-muted-foreground">Tap a duck, then tap where it should sit.</p>
            </div>
          </div>
        </>
      )}

      {done && (
        <ResultCard
          won={done.won}
          score={score}
          xp={xpFromScore(score)}
          best={loadState().bestScores.ducks}
          details={
            done.won
              ? `Held the line with ${done.secondsLeft}s left. ${interrupts} interrupt${interrupts === 1 ? "" : "s"} survived.`
              : `Got ${metCount}/${puzzle.constraints.length} clues green when time ran out.`
          }
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}

function DuckSlot({ pos, duck, selected, onClick }: { pos: number; duck: Duck | null; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-24 flex-col items-center gap-1 rounded-xl border p-2 transition-all"
      style={{
        borderColor: selected ? "var(--gold)" : "color-mix(in oklab, white 10%, transparent)",
        background: "color-mix(in oklab, white 4%, transparent)",
        boxShadow: selected ? "0 0 0 4px color-mix(in oklab, var(--gold) 20%, transparent)" : undefined,
        transform: selected ? "translateY(-3px)" : undefined,
        minHeight: 130,
      }}
    >
      <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">#{pos + 1}</div>
      {duck ? (
        <>
          <DuckGlyph color={duck.color} />
          <div className="text-[10px] capitalize text-muted-foreground">{duck.color}</div>
          <div className="text-[10px] capitalize" style={{ color: "var(--cream)" }}>{duck.accessory}</div>
          <div className="text-[10px] capitalize font-display" style={{ color: "var(--gold-soft)" }}>{duck.role}</div>
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
    <svg width="42" height="34" viewBox="0 0 40 34">
      <ellipse cx="16" cy="22" rx="14" ry="9" fill={hex} stroke="rgba(15,17,21,0.6)" strokeWidth="1.2" />
      <circle cx="28" cy="14" r="7" fill={hex} stroke="rgba(15,17,21,0.6)" strokeWidth="1.2" />
      <circle cx="30" cy="12" r="1.3" fill="#0f1115" />
      <path d="M34 14 L38 14 L36 17 Z" fill="#c9a84c" stroke="rgba(15,17,21,0.6)" strokeWidth="0.8" />
    </svg>
  );
}
