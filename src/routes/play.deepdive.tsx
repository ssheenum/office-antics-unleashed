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
      { name: "description", content: "Koi rise through a sunlit pond. Tap the one matching the call before it slips past the surface." },
    ],
  }),
  component: DeepDive,
});

const DURATION = 90;
const POOL_HEIGHT = 480;
const KOI_HEIGHT = 60;

function rampSpeed(elapsed: number) { return 55 + Math.min(95, elapsed * 1.8); }
function rampSpawn(elapsed: number) { return Math.max(550, 1400 - elapsed * 12); }
function rampBriefTimeout(elapsed: number) { return Math.max(2800, 6500 - elapsed * 45); }

interface LiveKoi extends Stratum { y: number; }

function DeepDive() {
  const [done, setDone] = useState<null | { secondsLeft: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [koi, setKoi] = useState<LiveKoi[]>([]);
  const [brief, setBrief] = useState<Brief>(() => newBrief());
  const briefSetAtRef = useRef<number>(performance.now());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const elapsed = DURATION - secondsLeft;

  const lastTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    if (done) return;
    let raf = 0;
    const loop = (t: number) => {
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      const curSpeed = rampSpeed(DURATION - secondsLeft);
      setKoi((list) => {
        let autoMiss = 0;
        const next: LiveKoi[] = [];
        for (const k of list) {
          const ny = k.y - curSpeed * dt;
          if (ny + KOI_HEIGHT < 0) {
            if (matches(k, brief)) autoMiss++;
          } else {
            next.push({ ...k, y: ny });
          }
        }
        if (autoMiss > 0) {
          setCombo(0);
          setScore((sc) => Math.max(0, sc - 8 * autoMiss));
          setMisses((m) => m + autoMiss);
        }
        return next;
      });
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

  const spawnBucket = Math.floor(elapsed / 5);
  useEffect(() => {
    if (done) return;
    const interval = rampSpawn(DURATION - secondsLeft);
    const spawn = () => {
      const s = spawnStratum(performance.now());
      setKoi((list) => [...list, { ...s, y: POOL_HEIGHT }]);
    };
    spawn();
    const t = setInterval(spawn, interval);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, spawnBucket]);

  function tapKoi(k: LiveKoi) {
    if (done) return;
    if (matches(k, brief)) {
      const newCombo = combo + 1;
      const gain = 12 + newCombo * 3;
      setScore((sc) => sc + gain);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setHits((h) => h + 1);
      setKoi((list) => list.filter((x) => x.id !== k.id));
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
    setKoi([]);
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
      skill="Reaction"
      rightSlot={
        <div className="flex items-center gap-3">
          <span className="font-display tabular-nums" style={{ color: "var(--gold-deep)" }}>{score}</span>
          <Timer seconds={DURATION} running={!done} onExpire={finish} onTick={setSecondsLeft} />
        </div>
      }
    >
      <GameBanner
        Mark={DiverMark}
        eyebrow="Tap the matching koi"
        tagline="Koi rise through the sunny pond. Tap the one matching the call before it breaks the surface."
      />

      {!done && (
        <>
          <CallCard brief={brief} combo={combo} hits={hits} misses={misses} flash={flash} />

          <div
            className="relative mt-5 overflow-hidden rounded-3xl border-[2.5px]"
            style={{
              height: POOL_HEIGHT,
              background:
                "linear-gradient(180deg, color-mix(in oklab, #06aed5 22%, white) 0%, color-mix(in oklab, #06aed5 50%, white) 60%, color-mix(in oklab, #06aed5 75%, #1f2933) 100%)",
              borderColor: "color-mix(in oklab, #06aed5 55%, transparent)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6)",
            }}
          >
            {/* sunbeams */}
            <div className="pointer-events-none absolute inset-0" style={{
              background: "radial-gradient(ellipse 35% 25% at 25% -5%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(ellipse 30% 20% at 75% -5%, rgba(255,255,255,0.4), transparent 60%)",
            }} />

            {/* surface band */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12" style={{
              background: "linear-gradient(to bottom, color-mix(in oklab, #fdf6e3 92%, white), transparent)",
            }} />
            <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center">
              <span className="chip-gold">surface</span>
            </div>

            {/* lily pads on surface */}
            <svg className="pointer-events-none absolute left-4 top-3 z-10" width="60" height="24" viewBox="0 0 60 24">
              <path d="M2 18 A 20 12 0 1 0 42 18 L 2 18 Z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" />
            </svg>
            <svg className="pointer-events-none absolute right-6 top-4 z-10" width="50" height="20" viewBox="0 0 50 20">
              <path d="M2 14 A 16 10 0 1 0 36 14 L 2 14 Z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" />
            </svg>

            {/* bubbles drifting */}
            <Bubbles />

            {koi.map((k) => (
              <Koi key={k.id} koi={k} highlight={matches(k, brief)} onClick={() => tapKoi(k)} />
            ))}

            <div className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.7)" }}>
              deeper ↓
            </div>
          </div>
        </>
      )}

      {done && (
        <ResultCard
          won={score >= 200}
          score={score}
          xp={xpFromScore(score)}
          best={loadState().bestScores.deepdive}
          details={`${hits} catches · ${misses} miss${misses === 1 ? "" : "es"} · best combo ×${maxCombo}.`}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}

function CallCard({ brief, combo, hits, misses, flash }: { brief: Brief; combo: number; hits: number; misses: number; flash: "good" | "bad" | null }) {
  return (
    <div
      className="glass grain flex items-center justify-between p-5 transition-colors"
      style={{
        background:
          flash === "good" ? "color-mix(in oklab, #2dd4a8 25%, white)" :
          flash === "bad" ? "color-mix(in oklab, #ff7a59 25%, white)" :
          undefined,
      }}
    >
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--sky-deep)" }}>Catch</div>
        <div className="mt-1 flex items-center gap-3">
          <span className="font-display text-2xl tracking-tight">{brief.label}</span>
          {brief.kind === "tone" && (
            <span className="inline-block h-7 w-7 rounded-full border-[2px]" style={{ background: TONE_HEX[brief.tone], borderColor: "#1f2933" }} />
          )}
          {brief.kind === "icon" && (
            <span className="grid h-8 w-8 place-items-center rounded-full border-[2px] bg-white" style={{ borderColor: "#1f2933" }}>
              <IconGlyph icon={brief.icon} size={20} />
            </span>
          )}
          {brief.kind === "tag" && (
            <span className="grid h-8 px-2 place-items-center rounded-full border-[2px] bg-white font-display text-sm" style={{ borderColor: "#1f2933" }}>{brief.tag}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <Stat color="var(--gold-deep)" v={`×${combo}`} l="combo" />
        <Stat color="var(--leaf)" v={hits} l="hits" />
        <Stat color="var(--coral)" v={misses} l="miss" />
      </div>
    </div>
  );
}

function Stat({ color, v, l }: { color: string; v: number | string; l: string }) {
  return (
    <div>
      <div className="font-display text-xl tabular-nums" style={{ color }}>{v}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{l}</div>
    </div>
  );
}

function Koi({ koi, highlight, onClick }: { koi: LiveKoi & { y: number }; highlight: boolean; onClick: () => void }) {
  const hex = TONE_HEX[koi.tone];
  // pseudo-stable horizontal lane based on id
  const lane = koi.id % 5;
  const xPct = 12 + lane * 18;
  return (
    <button
      onClick={onClick}
      className="absolute -translate-x-1/2 transition-shadow"
      style={{
        left: `${xPct}%`,
        top: koi.y,
        height: KOI_HEIGHT,
        width: 110,
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        filter: highlight ? "drop-shadow(0 0 12px rgba(255,209,102,0.85))" : undefined,
      }}
      title={`${koi.tag}`}
    >
      <svg viewBox="0 0 110 60" width="110" height={KOI_HEIGHT}>
        {/* tail */}
        <path d="M2 30 L 18 12 L 22 30 L 18 48 Z" fill={hex} stroke="#1f2933" strokeWidth="2.5" strokeLinejoin="round" />
        {/* body */}
        <ellipse cx="62" cy="30" rx="40" ry="16" fill={hex} stroke="#1f2933" strokeWidth="2.5" />
        {/* belly highlight */}
        <ellipse cx="62" cy="38" rx="34" ry="6" fill="rgba(255,255,255,0.45)" />
        {/* eye */}
        <circle cx="92" cy="26" r="3.5" fill="#fdf6e3" stroke="#1f2933" strokeWidth="2" />
        <circle cx="92" cy="26" r="1.4" fill="#1f2933" />
        {/* mouth */}
        <path d="M101 30 q 4 0 6 -2 M101 32 q 4 0 6 2" stroke="#1f2933" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        {/* mark on back */}
        <g transform="translate(50 18) scale(0.9)" stroke="#1f2933" strokeWidth="1.8" fill="#fdf6e3">
          <IconShape icon={koi.icon} />
        </g>
        {/* tag tab */}
        <g transform="translate(40 42)">
          <rect x="0" y="0" width="22" height="14" rx="7" fill="#fdf6e3" stroke="#1f2933" strokeWidth="1.6" />
          <text x="11" y="11" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="10" fill="#1f2933">{koi.tag}</text>
        </g>
      </svg>
    </button>
  );
}

function IconShape({ icon }: { icon: StratumIcon }) {
  switch (icon) {
    case "chart": return <path d="M0 8 L 4 4 L 8 6 L 12 0 L 12 12 L 0 12 Z" />;
    case "doc":   return <path d="M1 0 H 8 L 12 4 V 12 H 1 Z" />;
    case "bug":   return <g><circle cx="6" cy="6" r="5" /><path d="M6 1 L6 0 M6 12 L6 11 M1 6 L0 6 M12 6 L11 6" stroke="#1f2933" strokeWidth="1.4" fill="none" /></g>;
    case "star":  return <path d="M6 0 L 7.5 4 L 12 4.4 L 8.6 7.3 L 9.7 12 L 6 9.4 L 2.3 12 L 3.4 7.3 L 0 4.4 L 4.5 4 Z" />;
    case "flag":  return <path d="M1 0 V 12 M1 1 H 10 L 8 4 L 10 7 H 1 Z" />;
  }
}

function IconGlyph({ icon, size = 18 }: { icon: StratumIcon; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="#1f2933" stroke="#1f2933" strokeWidth="1.4">
      <IconShape icon={icon} />
    </svg>
  );
}

function Bubbles() {
  // a few looping bubbles at fixed positions for ambience
  const bubbles = [
    { left: "8%", delay: "0s", size: 8 },
    { left: "22%", delay: "1.2s", size: 6 },
    { left: "42%", delay: "0.6s", size: 10 },
    { left: "61%", delay: "2.1s", size: 5 },
    { left: "82%", delay: "1.6s", size: 7 },
  ];
  return (
    <>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: b.left,
            bottom: -16,
            width: b.size, height: b.size,
            background: "rgba(255,255,255,0.55)",
            border: "1.5px solid rgba(255,255,255,0.85)",
            animation: `rise 8s linear ${b.delay} infinite`,
          }}
        />
      ))}
      <style>{`@keyframes rise { 0% { transform: translateY(0); opacity: 0.9 } 100% { transform: translateY(-${POOL_HEIGHT + 30}px); opacity: 0 } }`}</style>
    </>
  );
}
