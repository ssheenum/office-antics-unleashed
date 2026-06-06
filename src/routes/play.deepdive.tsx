import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { DiverMark } from "@/components/art/Marks";
import { recordRound, loadState } from "@/lib/storage";
import { xpFromScore } from "@/lib/scoring";
import { spawnStratum, newBrief, matches, TONE_HEX, type Stratum, type Brief, type StratumIcon } from "@/lib/puzzles/deepdive";

export const Route = createFileRoute("/play/deepdive")({
  head: () => ({
    meta: [
      { title: "Deep Dive — Cubicle Quest" },
      { name: "description", content: "Strata of a report scroll upward. Catch the one that matches the brief before it surfaces." },
    ],
  }),
  component: DeepDive,
});

const DURATION = 90;
const POOL_HEIGHT = 460;
const STRATUM_HEIGHT = 64;
const STRATUM_GAP = 12;

// Difficulty ramps with elapsed seconds (0 → DURATION)
function rampSpeed(elapsed: number) { return 55 + Math.min(95, elapsed * 1.8); } // px/sec
function rampSpawn(elapsed: number) { return Math.max(550, 1400 - elapsed * 12); } // ms
function rampBriefTimeout(elapsed: number) { return Math.max(2800, 6500 - elapsed * 45); } // ms

interface LiveStratum extends Stratum { y: number; }

function DeepDive() {
  const [done, setDone] = useState<null | { secondsLeft: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [strata, setStrata] = useState<LiveStratum[]>([]);
  const [brief, setBrief] = useState<Brief>(() => newBrief());
  const briefSetAtRef = useRef<number>(performance.now());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const elapsed = DURATION - secondsLeft;
  const speed = rampSpeed(elapsed);

  // RAF: integrate stratum positions, cull off-screen, auto-miss matches, refresh stale brief
  const lastTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    if (done) return;
    let raf = 0;
    const loop = (t: number) => {
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      const curSpeed = rampSpeed(DURATION - secondsLeft);
      setStrata((list) => {
        let autoMiss = 0;
        const next: LiveStratum[] = [];
        for (const s of list) {
          const ny = s.y - curSpeed * dt;
          if (ny + STRATUM_HEIGHT < 0) {
            if (matches(s, brief)) autoMiss++;
          } else {
            next.push({ ...s, y: ny });
          }
        }
        if (autoMiss > 0) {
          setCombo(0);
          setScore((sc) => Math.max(0, sc - 8 * autoMiss));
          setMisses((m) => m + autoMiss);
        }
        return next;
      });
      // brief stale check
      const briefTimeout = rampBriefTimeout(DURATION - secondsLeft);
      if (t - briefSetAtRef.current > briefTimeout) {
        setBrief(newBrief());
        briefSetAtRef.current = t;
      }
      raf = requestAnimationFrame(loop);
    };
    lastTimeRef.current = performance.now();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [done, brief, secondsLeft]);

  // Spawn strata — interval scales with elapsed; re-arm whenever cadence changes meaningfully
  const spawnBucket = Math.floor(elapsed / 5); // re-arm every 5s of elapsed time
  useEffect(() => {
    if (done) return;
    const interval = rampSpawn(DURATION - secondsLeft);
    const spawn = () => {
      const s = spawnStratum(performance.now());
      setStrata((list) => [...list, { ...s, y: POOL_HEIGHT }]);
    };
    spawn();
    const t = setInterval(spawn, interval);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, spawnBucket]);

  function clickStratum(s: Stratum) {
    if (done) return;
    if (matches(s, brief)) {
      const newCombo = combo + 1;
      const gain = 12 + newCombo * 3;
      setScore((sc) => sc + gain);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setHits((h) => h + 1);
      setStrata((list) => list.filter((x) => x.id !== s.id));
      setFlash("good");
      setTimeout(() => setFlash(null), 200);
      setBrief(newBrief());
      briefSetAtRef.current = performance.now();
    } else {
      setScore((sc) => Math.max(0, sc - 12));
      setCombo(0);
      setMisses((m) => m + 1);
      setFlash("bad");
      setTimeout(() => setFlash(null), 200);
    }
  }

  function finish() {
    if (done) return;
    recordRound("deepdive", score, xpFromScore(score));
    setDone({ secondsLeft });
  }

  function reset() {
    setDone(null);
    setSecondsLeft(DURATION);
    setStrata([]);
    setBrief(newBrief());
    briefSetAtRef.current = performance.now();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
  }

  return (
    <GameShell
      title="Deep Dive"
      skill="Memory · Reaction"
      rightSlot={
        <div className="flex items-center gap-4">
          <span className="chip-gold">{Math.round(speed)} px/s</span>
          <div className="font-display tabular-nums" style={{ color: "var(--gold)" }}>Score {score}</div>
          <Timer seconds={DURATION} running={!done} onExpire={finish} onTick={setSecondsLeft} />
        </div>
      }
    >
      <GameBanner
        Mark={DiverMark}
        eyebrow="Live reaction"
        tagline="Strata of the report surface from below. Catch the one matching the brief before it floats off the top."
      />

      {!done && (
        <>
          <BriefCard brief={brief} combo={combo} hits={hits} misses={misses} flash={flash} />

          <div
            className="glass relative mt-5 overflow-hidden rounded-2xl"
            style={{ height: POOL_HEIGHT }}
          >
            {/* Surface indicator at top */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10" style={{
              background: "linear-gradient(to bottom, color-mix(in oklab, var(--ink) 90%, transparent), transparent)",
            }} />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
              <span className="chip-muted">surface</span>
            </div>

            {strata.map((s) => (
              <Strat key={s.id} stratum={s} y={s.y} onClick={() => clickStratum(s)} highlight={matches(s, brief)} />
            ))}

            {/* Depth gauge on right */}
            <div className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">depth ↓</div>
          </div>
        </>
      )}

      {done && (
        <ResultCard
          won={score >= 200}
          score={score}
          xp={xpFromScore(score)}
          best={loadState().bestScores.deepdive}
          details={`${hits} catches · ${misses} misses · best combo ×${maxCombo}.`}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}

function BriefCard({ brief, combo, hits, misses, flash }: { brief: Brief; combo: number; hits: number; misses: number; flash: "good" | "bad" | null }) {
  return (
    <div
      className="glass grain flex items-center justify-between rounded-2xl px-5 py-4 transition-colors"
      style={{
        background:
          flash === "good" ? "color-mix(in oklab, var(--ok) 14%, transparent)" :
          flash === "bad" ? "color-mix(in oklab, var(--warn) 14%, transparent)" :
          undefined,
      }}
    >
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Find the</div>
        <div className="mt-1 flex items-center gap-3">
          <span className="font-display text-2xl tracking-tight" style={{ color: "var(--cream)" }}>{brief.label}</span>
          {brief.kind === "tone" && (
            <span className="inline-block h-5 w-5 rounded-full" style={{ background: TONE_HEX[brief.tone], boxShadow: `0 0 0 3px color-mix(in oklab, ${TONE_HEX[brief.tone]} 25%, transparent)` }} />
          )}
          {brief.kind === "icon" && <IconGlyph icon={brief.icon} size={22} />}
        </div>
      </div>
      <div className="flex items-center gap-3 text-right text-xs">
        <div>
          <div className="font-display text-lg tabular-nums" style={{ color: "var(--gold)" }}>×{combo}</div>
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">combo</div>
        </div>
        <div>
          <div className="font-display text-lg tabular-nums" style={{ color: "var(--ok)" }}>{hits}</div>
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">hits</div>
        </div>
        <div>
          <div className="font-display text-lg tabular-nums" style={{ color: "var(--warn)" }}>{misses}</div>
          <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">miss</div>
        </div>
      </div>
    </div>
  );
}

function Strat({ stratum, y, onClick, highlight }: { stratum: Stratum; y: number; onClick: () => void; highlight: boolean }) {
  const hex = TONE_HEX[stratum.tone];
  return (
    <button
      onClick={onClick}
      className="absolute left-1/2 flex w-[88%] -translate-x-1/2 items-center justify-between rounded-xl border px-4 transition-shadow"
      style={{
        top: y,
        height: STRATUM_HEIGHT,
        marginBottom: STRATUM_GAP,
        background: `linear-gradient(90deg, color-mix(in oklab, ${hex} 22%, var(--ink-2)), color-mix(in oklab, ${hex} 10%, var(--ink-2)))`,
        borderColor: highlight ? "color-mix(in oklab, var(--gold) 60%, transparent)" : `color-mix(in oklab, ${hex} 30%, transparent)`,
        boxShadow: highlight ? "0 0 0 3px color-mix(in oklab, var(--gold) 20%, transparent), 0 8px 24px -10px rgba(0,0,0,0.5)" : "0 8px 24px -16px rgba(0,0,0,0.6)",
        willChange: "top",
      }}
    >
      <div className="flex items-center gap-3">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: hex }} />
        <IconGlyph icon={stratum.icon} />
        <span className="font-display text-xl tracking-tight" style={{ color: "var(--cream)" }}>{stratum.tag}</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: "color-mix(in oklab, var(--cream) 70%, transparent)" }}>
        layer #{stratum.id}
      </span>
    </button>
  );
}

function IconGlyph({ icon, size = 18 }: { icon: StratumIcon; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, style: { color: "var(--cream)" } };
  switch (icon) {
    case "chart":
      return <svg {...props}><path d="M4 20V8M10 20v-6M16 20V4M22 20H2"/></svg>;
    case "doc":
      return <svg {...props}><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v6h5"/></svg>;
    case "bug":
      return <svg {...props}><rect x="7" y="8" width="10" height="12" rx="5"/><path d="M9 6l-2-2M15 6l2-2M3 14h4M17 14h4M5 19l3-2M19 19l-3-2"/></svg>;
    case "star":
      return <svg {...props}><path d="M12 3l3 6 6 .9-4.5 4.3 1 6.3L12 17.8 6.5 20.5l1-6.3L3 9.9 9 9z"/></svg>;
    case "flag":
      return <svg {...props}><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>;
  }
}
