import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { ResultCard } from "@/components/game/ResultCard";
import { DuckMark } from "@/components/art/Marks";
import { Duckie } from "@/components/art/Duckie";
import { recordRound, loadState } from "@/lib/storage";
import { xpFromScore } from "@/lib/scoring";
import { Tutorial } from "@/components/game/Tutorial";
import {
  genSimple, genTrait, genPattern,
  type BaseRound, type DuckTraits,
} from "@/lib/puzzles/ducks";

export const Route = createFileRoute("/play/ducks")({
  head: () => ({
    meta: [
      { title: "Ducks in a Row — Touch Grass" },
      { name: "description", content: "Memorise a row of ducks, then drag them back into order. Patterns and hidden rules get sneakier each round." },
    ],
  }),
  component: DucksGame,
});

type Phase = "ready" | "show" | "scatter" | "done";

interface Round {
  base: BaseRound;
  example?: DuckTraits[];
  ruleLabel?: string;
  showMs: number;
}

const MAX_LIVES = 3;
const TOTAL_ROUNDS = 5;

function buildRound(idx: number): Round {
  // Friendlier curve: simple → simple+1 → trait → pattern → trait
  if (idx === 0) return { base: genSimple(3), showMs: 3200 };
  if (idx === 1) return { base: genSimple(4), showMs: 3600 };
  if (idx === 2) return { base: genTrait(4), showMs: 4200 };
  if (idx === 3) return { base: genPattern(5), showMs: 0 };
  return { base: genTrait(5), showMs: 4800 };
}

interface Scatter { id: number; x: number; y: number; rot: number; }

function DucksGame() {
  const [roundIdx, setRoundIdx] = useState(0);
  const [round, setRound] = useState<Round>(() => buildRound(0));
  const [phase, setPhase] = useState<Phase>("ready");
  const [slots, setSlots] = useState<(DuckTraits | null)[]>(() => round.base.target.map(() => null));
  const [scatter, setScatter] = useState<Scatter[]>([]);
  const [available, setAvailable] = useState<DuckTraits[]>([]);
  const [picked, setPicked] = useState<DuckTraits | null>(null);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [feedback, setFeedback] = useState<null | { ok: boolean; text: string }>(null);
  const [shakeSlot, setShakeSlot] = useState<number | null>(null);
  const startedAtRef = useRef<number>(performance.now());

  // initialise scatter when entering scatter phase
  function enterScatter(r: Round) {
    const pool = r.base.pool;
    const placed = r.base.target.map((_, i) => (r.base.blanks.includes(i) ? null : r.base.target[i]));
    setSlots(placed);
    const ids = pool.map((d) => d.id);
    const filledIds = new Set(placed.filter(Boolean).map((d) => d!.id));
    const avail = pool.filter((d) => !filledIds.has(d.id));
    setAvailable(avail);
    setScatter(avail.map((d) => ({
      id: d.id,
      x: 8 + Math.random() * 78,
      y: 18 + Math.random() * 68,
      rot: -14 + Math.random() * 28,
    })));
    setPicked(null);
    setPhase("scatter");
    startedAtRef.current = performance.now();
    void ids;
  }

  // when round changes, run the show → scatter sequence
  useEffect(() => {
    setSlots(round.base.target.map(() => null));
    setPicked(null);
    setFeedback(null);
    if (round.base.kind === "pattern" || round.base.kind === "rule") {
      // skip "show" preview — board explains itself
      enterScatter(round);
    } else {
      setPhase("show");
      const t = setTimeout(() => enterScatter(round), round.showMs);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  function place(slotIdx: number, duck: DuckTraits) {
    if (!round.base.blanks.includes(slotIdx)) return;
    setSlots((s) => {
      const next = [...s];
      // return current occupant (if any) to the pool
      const existing = next[slotIdx];
      next[slotIdx] = duck;
      setAvailable((av) => {
        const filtered = av.filter((d) => d.id !== duck.id);
        return existing ? [...filtered, existing] : filtered;
      });
      return next;
    });
    setPicked(null);
  }

  function returnToPool(slotIdx: number) {
    setSlots((s) => {
      const next = [...s];
      const d = next[slotIdx];
      if (d && round.base.blanks.includes(slotIdx)) {
        next[slotIdx] = null;
        setAvailable((av) => [...av, d]);
      }
      return next;
    });
  }

  function tapPool(d: DuckTraits) {
    setPicked((p) => (p?.id === d.id ? null : d));
  }

  function tapSlot(i: number) {
    if (phase !== "scatter") return;
    const occupant = slots[i];
    if (picked) {
      place(i, picked);
    } else if (occupant && round.base.blanks.includes(i)) {
      returnToPool(i);
    }
  }

  function submit() {
    if (phase !== "scatter") return;
    if (slots.some((s, i) => round.base.blanks.includes(i) && !s)) return;

    // accuracy: count correct slots out of blanks
    let correct = 0;
    const wrongSlots: number[] = [];
    for (const i of round.base.blanks) {
      if (slots[i]?.id === round.base.target[i].id) correct++;
      else wrongSlots.push(i);
    }
    const total = round.base.blanks.length;
    const elapsedMs = performance.now() - startedAtRef.current;
    const speedBonus = Math.max(0, 60 - Math.floor(elapsedMs / 500)) * 4;

    if (correct === total) {
      const newCombo = combo + 1;
      const gain = 100 + total * 25 + speedBonus + newCombo * 15;
      setScore((s) => s + gain);
      setCombo(newCombo);
      setPerfectStreak((p) => p + 1);
      const msg = round.ruleLabel
        ? `Rule was: ${round.ruleLabel}. +${gain}`
        : `+${gain}${newCombo > 1 ? ` · ×${newCombo} combo` : ""}`;
      setFeedback({ ok: true, text: msg });
      setTimeout(nextRound, 1400);
    } else {
      setLives((l) => l - 1);
      setCombo(0);
      setShakeSlot(wrongSlots[0] ?? null);
      setTimeout(() => setShakeSlot(null), 600);
      const partial = correct * 20;
      setScore((s) => s + partial);
      setFeedback({
        ok: false,
        text: round.ruleLabel
          ? `Not quite. Rule was: ${round.ruleLabel}.`
          : `${correct}/${total} in place. -1 life.`,
      });
      setTimeout(() => {
        if (lives - 1 <= 0) {
          finish();
        } else {
          nextRound();
        }
      }, 1600);
    }
  }

  function nextRound() {
    const next = roundIdx + 1;
    if (next >= TOTAL_ROUNDS) {
      finish();
      return;
    }
    setRoundIdx(next);
    setRound(buildRound(next));
  }

  function finish() {
    if (phase === "done") return;
    setPhase("done");
    const streakBonus = perfectStreak * 30;
    const final = Math.max(0, score + streakBonus);
    recordRound("ducks", final, xpFromScore(final));
  }

  function reset() {
    setRoundIdx(0);
    setRound(buildRound(0));
    setPhase("ready");
    setLives(MAX_LIVES);
    setScore(0);
    setCombo(0);
    setPerfectStreak(0);
    setFeedback(null);
  }

  const finalDetails = useMemo(() => {
    return `Cleared ${roundIdx + (phase === "done" && lives > 0 ? 1 : 0)}/${TOTAL_ROUNDS} rounds · best combo ×${combo} · ${perfectStreak} perfect.`;
  }, [roundIdx, lives, combo, perfectStreak, phase]);

  return (
    <GameShell
      title="Ducks in a Row"
      skill="Memory"
      rightSlot={
        <div className="flex items-center gap-3">
          <span className="chip-gold">R{roundIdx + 1}/{TOTAL_ROUNDS}</span>
          <span className="font-display tabular-nums" style={{ color: "var(--gold-deep)" }}>{score}</span>
          <Hearts n={lives} />
        </div>
      }
    >
      <Tutorial
        gameKey="ducks"
        title="Ducks in a Row"
        accent="#f5b740"
        accentDeep="#b07a13"
        onStart={() => {}}
        steps={[
          { icon: "👀", title: "Watch the lineup", body: "A row of ducks flashes for a few seconds. Memorise their order and details." },
          { icon: "🦆", title: "Rebuild the row", body: "Tap a duck from the pile, then tap an empty pad — or just drag them across. Tap a placed duck to send it back." },
          { icon: "🎯", title: "Check the row", body: "Hit Check row when you're happy. Get them all right for combo points. Three wrong rounds and you're done." },
        ]}
      />
      {phase !== "done" && (
        <>
          <GameBanner
            Mark={DuckMark}
            eyebrow={
              round.base.kind === "simple" ? "Memory row" :
              round.base.kind === "trait" ? "Trait memory" :
              round.base.kind === "pattern" ? "Complete the pattern" :
              "Hidden rule"
            }
            tagline={round.base.hint}
          />

          {round.example && (
            <div className="glass grain mb-5 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--sky-deep)" }}>
                Example arranged by the secret rule
              </div>
              <div className="flex flex-wrap gap-2">
                {round.example.map((d) => (
                  <span key={d.id} className="rounded-2xl border-[2px] bg-white p-1" style={{ borderColor: "#1f2933" }}>
                    <Duckie traits={d} scale={0.55} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Target row (lily pads) */}
          <div className="mb-5 flex flex-wrap items-end justify-center gap-3">
            {slots.map((d, i) => (
              <LilyPad
                key={i}
                index={i}
                duck={d}
                editable={round.base.blanks.includes(i)}
                shake={shakeSlot === i}
                phase={phase}
                showingPreview={phase === "show"}
                previewDuck={round.base.target[i]}
                onTap={() => tapSlot(i)}
                onDropDuck={(id) => {
                  const inAvail = available.find((x) => x.id === id);
                  if (inAvail) place(i, inAvail);
                  else {
                    // moving between slots: find owning slot
                    const fromSlot = slots.findIndex((x) => x?.id === id);
                    if (fromSlot >= 0 && fromSlot !== i && round.base.blanks.includes(fromSlot)) {
                      const moved = slots[fromSlot]!;
                      setSlots((s) => {
                        const n = [...s];
                        n[fromSlot] = null;
                        const existing = n[i];
                        n[i] = moved;
                        if (existing) setAvailable((av) => [...av, existing]);
                        return n;
                      });
                    }
                  }
                }}
              />
            ))}
          </div>

          {/* Pond with scattered ducks */}
          <div
            className="relative overflow-hidden rounded-3xl border-[2.5px]"
            style={{
              height: 360,
              background:
                "radial-gradient(ellipse at 20% 30%, #b6e6f3, transparent 55%), radial-gradient(ellipse at 75% 70%, #9ddef0, transparent 60%), #cdebf6",
              borderColor: "color-mix(in oklab, #06aed5 50%, transparent)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6)",
            }}
          >
            <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <defs>
                <pattern id="ripple-d" width="60" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 q 15 -6 30 0 t 30 0" stroke="#0a8aaa" strokeOpacity="0.18" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#ripple-d)" />
            </svg>

            {phase === "show" && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="chip-gold pop-in">👀 Memorise the order…</div>
                  <div className="h-2 w-48 overflow-hidden rounded-full border-[1.5px] bg-white/70" style={{ borderColor: "#e9b13d" }}>
                    <div
                      className="h-full"
                      style={{
                        background: "linear-gradient(90deg, #ffd166, #ff7a59)",
                        animation: `shrinkBar ${round.showMs}ms linear forwards`,
                      }}
                    />
                  </div>
                </div>
                <style>{`@keyframes shrinkBar { from { width: 100%; } to { width: 0%; } }`}</style>
              </div>
            )}

            {phase === "scatter" && scatter.map((s) => {
              const d = available.find((x) => x.id === s.id);
              if (!d) return null;
              const isPicked = picked?.id === d.id;
              return (
                <button
                  key={s.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", String(d.id))}
                  onClick={() => tapPool(d)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl p-1 transition-transform active:cursor-grabbing"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    transform: `translate(-50%,-50%) rotate(${s.rot}deg) scale(${isPicked ? 1.15 : 1})`,
                    background: isPicked ? "color-mix(in oklab, #ffd166 60%, white)" : "rgba(255,255,255,0.7)",
                    border: `2px solid ${isPicked ? "#e9b13d" : "#1f2933"}`,
                    cursor: "grab",
                    boxShadow: isPicked ? "0 0 0 5px color-mix(in oklab, #ffd166 35%, transparent)" : "0 3px 0 rgba(31,41,51,0.15)",
                  }}
                >
                  <Duckie traits={d} scale={0.55} />
                </button>
              );
            })}

            {feedback && (
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center pop-in">
                <span
                  className="rounded-full border-[2px] px-4 py-1.5 font-display text-sm shadow"
                  style={{
                    background: feedback.ok ? "color-mix(in oklab, #2dd4a8 25%, white)" : "color-mix(in oklab, #ff7a59 25%, white)",
                    borderColor: feedback.ok ? "#1ba884" : "#c2492f",
                    color: "#1f2933",
                  }}
                >
                  {feedback.ok ? "✓ " : "✕ "}{feedback.text}
                </span>
              </div>
            )}
            {feedback?.ok && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                {["✨", "🎉", "⭐", "✨", "🌟", "💫"].map((s, i) => (
                  <span
                    key={i}
                    className="absolute text-3xl sparkle"
                    style={{
                      left: `${20 + i * 12}%`,
                      top: `${30 + (i % 2) * 30}%`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  >{s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button onClick={reset} className="pill-btn text-xs">Restart</button>
            <div className="flex items-center gap-2">
              <span className="chip-muted">Tap a duck, then a pad — or drag.</span>
              <button
                onClick={submit}
                disabled={phase !== "scatter" || slots.some((s, i) => round.base.blanks.includes(i) && !s)}
                className="pill-btn pill-btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check row
              </button>
            </div>
          </div>
        </>
      )}

      {phase === "done" && (
        <ResultCard
          won={score >= 400 && lives > 0}
          score={score}
          xp={xpFromScore(score)}
          best={loadState().bestScores.ducks}
          details={finalDetails}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}

function Hearts({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: MAX_LIVES }).map((_, i) => (
        <span key={i} style={{ color: i < n ? "#ff7a59" : "rgba(31,41,51,0.18)", fontSize: 18, lineHeight: 1 }}>♥</span>
      ))}
    </span>
  );
}

function LilyPad({
  index, duck, editable, shake, phase, showingPreview, previewDuck, onTap, onDropDuck,
}: {
  index: number;
  duck: DuckTraits | null;
  editable: boolean;
  shake: boolean;
  phase: Phase;
  showingPreview: boolean;
  previewDuck: DuckTraits;
  onTap: () => void;
  onDropDuck: (id: number) => void;
}) {
  const displayDuck = showingPreview ? previewDuck : duck;
  return (
    <div
      onClick={onTap}
      onDragOver={(e) => editable && e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const id = Number(e.dataTransfer.getData("text/plain")); if (!Number.isNaN(id)) onDropDuck(id); }}
      className={`relative grid h-32 w-28 cursor-pointer select-none place-items-center rounded-[40%_60%_40%_60%/45%_55%_45%_55%] border-[2px] transition-transform ${shake ? "wiggle" : ""}`}
      style={{
        background: editable
          ? "radial-gradient(ellipse at 30% 30%, #b9e8c8, #6cca97 70%)"
          : "radial-gradient(ellipse at 30% 30%, #e9d8a8, #c9aa6a 70%)",
        borderColor: editable ? "#1ba884" : "#8e6a26",
        boxShadow: "0 4px 0 rgba(31,41,51,0.15)",
        opacity: phase === "show" ? 0.95 : 1,
      }}
    >
      <span className="absolute top-1 left-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(31,41,51,0.55)" }}>#{index + 1}</span>
      {displayDuck ? (
        <Duckie traits={displayDuck} scale={0.55} />
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{editable ? "drop here" : "—"}</span>
      )}
    </div>
  );
}
