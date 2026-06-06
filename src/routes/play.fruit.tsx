import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { BranchMark } from "@/components/art/Marks";
import { recordRound, loadState } from "@/lib/storage";
import { xpFromScore } from "@/lib/scoring";

export const Route = createFileRoute("/play/fruit")({
  head: () => ({
    meta: [
      { title: "Low-Hanging Fruit — Cubicle Quest" },
      { name: "description", content: "Slide a basket across the garden and catch the fruit that fits the rule. Dodge the rocks. Three hearts." },
    ],
  }),
  component: FruitGame,
});

const DURATION = 90;
const FIELD_W = 720;       // logical play width
const FIELD_H = 520;       // logical play height
const BASKET_W = 110;
const BASKET_H = 56;
const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19]);

type FruitKind = "apple" | "orange" | "lime" | "cherry" | "grape" | "golden" | "rock";
interface FallingItem {
  id: number;
  kind: FruitKind;
  value: number;
  x: number;     // px center
  y: number;     // px top
  vy: number;    // px/sec
  spin: number;  // deg/sec
  rot: number;
}

type Rule =
  | { kind: "any"; label: string }
  | { kind: "even"; label: string }
  | { kind: "odd"; label: string }
  | { kind: "prime"; label: string }
  | { kind: "geq"; n: number; label: string }
  | { kind: "leq"; n: number; label: string }
  | { kind: "color"; kinds: FruitKind[]; label: string };

const RULES: Rule[] = [
  { kind: "any", label: "Catch ANY fruit" },
  { kind: "even", label: "Catch EVEN values" },
  { kind: "odd", label: "Catch ODD values" },
  { kind: "prime", label: "Catch PRIMES only" },
  { kind: "geq", n: 5, label: "Catch values ≥ 5" },
  { kind: "leq", n: 4, label: "Catch values ≤ 4" },
  { kind: "color", kinds: ["apple", "cherry"], label: "Catch RED fruit" },
  { kind: "color", kinds: ["orange"], label: "Catch ORANGE fruit" },
  { kind: "color", kinds: ["lime", "grape"], label: "Catch GREEN & PURPLE" },
];

const COLORS: Record<FruitKind, string> = {
  apple: "#ff5c5c",
  orange: "#ff9a3c",
  lime: "#7ee36a",
  cherry: "#e83e8c",
  grape: "#9b6dff",
  golden: "#ffd166",
  rock: "#7a808a",
};

function ruleMatches(rule: Rule, item: FallingItem): boolean {
  if (item.kind === "rock") return false;
  if (item.kind === "golden") return true; // golden always counts
  switch (rule.kind) {
    case "any": return true;
    case "even": return item.value % 2 === 0;
    case "odd": return item.value % 2 === 1;
    case "prime": return PRIMES.has(item.value);
    case "geq": return item.value >= rule.n;
    case "leq": return item.value <= rule.n;
    case "color": return rule.kinds.includes(item.kind);
  }
}

function pickRule(prev?: Rule): Rule {
  let r: Rule;
  do { r = RULES[Math.floor(Math.random() * RULES.length)]; } while (prev && r.label === prev.label);
  return r;
}

function pickKind(): FruitKind {
  const r = Math.random();
  if (r < 0.06) return "rock";
  if (r < 0.10) return "golden";
  const fruits: FruitKind[] = ["apple", "orange", "lime", "cherry", "grape"];
  return fruits[Math.floor(Math.random() * fruits.length)];
}

function FruitGame() {
  const [done, setDone] = useState<null | { secondsLeft: number; score: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [rule, setRule] = useState<Rule>(() => pickRule());
  const [popup, setPopup] = useState<{ id: number; x: number; y: number; text: string; tone: "good" | "bad" | "gold" } | null>(null);
  const [basketX, setBasketX] = useState(FIELD_W / 2);
  const fieldRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<FallingItem[]>([]);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);
  const nextIdRef = useRef(1);
  const lastSpawnRef = useRef(0);
  const lastRuleRef = useRef(performance.now());
  const lastFrameRef = useRef(performance.now());
  const startedRef = useRef(performance.now());
  const heldKeysRef = useRef<Set<string>>(new Set());

  // Mouse / touch tracking inside the field
  function pointerMove(clientX: number) {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = ((clientX - rect.left) / rect.width) * FIELD_W;
    setBasketX(Math.max(BASKET_W / 2, Math.min(FIELD_W - BASKET_W / 2, localX)));
  }

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) heldKeysRef.current.add(e.key);
    };
    const up = (e: KeyboardEvent) => heldKeysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function finish(currentScore?: number) {
    if (done) return;
    const finalScore = currentScore ?? score;
    recordRound("fruit", finalScore, xpFromScore(finalScore));
    setDone({ secondsLeft, score: finalScore });
  }

  // Main loop
  useEffect(() => {
    if (done) return;
    let raf = 0;
    startedRef.current = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - lastFrameRef.current) / 1000);
      lastFrameRef.current = t;
      const elapsed = (t - startedRef.current) / 1000;

      // Move basket with keys
      const keys = heldKeysRef.current;
      let dx = 0;
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;
      if (dx !== 0) {
        setBasketX((x) => Math.max(BASKET_W / 2, Math.min(FIELD_W - BASKET_W / 2, x + dx * 520 * dt)));
      }

      // Spawn — interval shrinks over time
      const spawnInterval = Math.max(0.32, 0.95 - elapsed * 0.008);
      if (t - lastSpawnRef.current > spawnInterval * 1000) {
        lastSpawnRef.current = t;
        const kind = pickKind();
        const value = kind === "rock" || kind === "golden" ? 0 : 1 + Math.floor(Math.random() * 9);
        const baseSpeed = 130 + elapsed * 2.4;
        const item: FallingItem = {
          id: nextIdRef.current++,
          kind,
          value,
          x: 30 + Math.random() * (FIELD_W - 60),
          y: -40,
          vy: baseSpeed + Math.random() * 60,
          spin: (Math.random() - 0.5) * 60,
          rot: 0,
        };
        itemsRef.current.push(item);
      }

      // Rule rotation — every ~10s
      if (t - lastRuleRef.current > 10000) {
        lastRuleRef.current = t;
        setRule((r) => pickRule(r));
      }

      // Move items + collision
      const basketLeft = basketRef.current - BASKET_W / 2;
      const basketRight = basketRef.current + BASKET_W / 2;
      const basketTop = FIELD_H - BASKET_H - 12;
      const survivors: FallingItem[] = [];
      let scoreDelta = 0;
      let heartDelta = 0;
      let comboReset = false;

      for (const it of itemsRef.current) {
        it.y += it.vy * dt;
        it.rot += it.spin * dt;
        // collide with basket rim (top 14px band)
        if (
          it.y + 28 >= basketTop &&
          it.y + 28 <= basketTop + 28 &&
          it.x >= basketLeft + 6 &&
          it.x <= basketRight - 6
        ) {
          // caught
          if (it.kind === "rock") {
            heartDelta -= 1;
            scoreDelta -= 5;
            popAt(it.x, basketTop, "−heart", "bad");
            comboReset = true;
          } else if (it.kind === "golden") {
            scoreDelta += 30;
            popAt(it.x, basketTop, "+30 ✨", "gold");
          } else if (ruleMatches(rule, it)) {
            const bonus = Math.floor(comboRef.current / 3);
            const gain = it.value + bonus;
            scoreDelta += gain;
            popAt(it.x, basketTop, `+${gain}`, "good");
          } else {
            scoreDelta -= 3;
            popAt(it.x, basketTop, "−3", "bad");
            comboReset = true;
          }
          // consumed
          continue;
        }
        if (it.y > FIELD_H + 30) {
          continue; // missed (no penalty)
        }
        survivors.push(it);
      }
      itemsRef.current = survivors;

      if (scoreDelta !== 0) {
        setScore((s) => {
          const next = Math.max(0, s + scoreDelta);
          return next;
        });
      }
      if (heartDelta !== 0) {
        setHearts((h) => {
          const nh = Math.max(0, h + heartDelta);
          if (nh <= 0) {
            // schedule finish on next tick to grab latest score
            setTimeout(() => {
              setScore((s) => { finish(s); return s; });
            }, 0);
          }
          return nh;
        });
      }
      if (comboReset) setCombo(0);
      else if (scoreDelta > 0) setCombo((c) => c + 1);

      rerender();
      raf = requestAnimationFrame(loop);
    };
    lastFrameRef.current = performance.now();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, rule]);

  // refs for values used inside the loop (avoid stale closures)
  const basketRef = useRef(basketX);
  useEffect(() => { basketRef.current = basketX; }, [basketX]);
  const comboRef = useRef(combo);
  useEffect(() => { comboRef.current = combo; }, [combo]);

  function popAt(x: number, y: number, text: string, tone: "good" | "bad" | "gold") {
    const id = Date.now() + Math.random();
    setPopup({ id, x, y, text, tone });
    setTimeout(() => setPopup((p) => (p && p.id === id ? null : p)), 700);
  }

  function reset() {
    itemsRef.current = [];
    nextIdRef.current = 1;
    lastSpawnRef.current = 0;
    lastRuleRef.current = performance.now();
    startedRef.current = performance.now();
    setBasketX(FIELD_W / 2);
    setScore(0);
    setHearts(3);
    setCombo(0);
    setRule(pickRule());
    setDone(null);
    setSecondsLeft(DURATION);
  }

  return (
    <GameShell
      title="Low-Hanging Fruit"
      skill="Reflex"
      rightSlot={
        <div className="flex items-center gap-3">
          <Hearts count={hearts} />
          <span className="font-display tabular-nums" style={{ color: "var(--gold-deep)" }}>{score}</span>
          <Timer seconds={DURATION} running={!done} onExpire={() => finish()} onTick={setSecondsLeft} />
        </div>
      }
    >
      <GameBanner
        Mark={BranchMark}
        eyebrow="Slide · catch · dodge"
        tagline="Move the basket with your mouse or arrow keys. Catch fruit that fits the rule. Avoid the rocks."
      />

      {!done && (
        <>
          {/* Rule banner */}
          <div className="glass grain mb-4 flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="chip-gold">Rule</span>
              <span className="font-display text-xl">{rule.label}</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="font-display text-xl tabular-nums" style={{ color: "var(--gold-deep)" }}>×{combo}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">combo</div>
              </div>
            </div>
          </div>

          {/* Garden play field */}
          <div
            ref={fieldRef}
            onMouseMove={(e) => pointerMove(e.clientX)}
            onTouchMove={(e) => pointerMove(e.touches[0].clientX)}
            className="relative w-full overflow-hidden rounded-3xl border-[2.5px] select-none"
            style={{
              aspectRatio: `${FIELD_W} / ${FIELD_H}`,
              background:
                "linear-gradient(180deg, #cfeaff 0%, #e3f3d8 65%, #cfe8b2 100%)",
              borderColor: "color-mix(in oklab, #1ba884 50%, transparent)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.6)",
              cursor: "none",
            }}
          >
            {/* Branch silhouette across top */}
            <svg className="pointer-events-none absolute inset-x-0 top-0" viewBox="0 0 720 80" preserveAspectRatio="none" style={{ width: "100%", height: "12%" }}>
              <path d="M0 40 Q 180 12 360 36 T 720 28" stroke="#5a3b1f" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* hanging leaves */}
              <path d="M120 38 q -10 18 -2 30 q 14 -4 18 -22 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" />
              <path d="M460 32 q -10 18 -2 30 q 14 -4 18 -22 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" />
              <path d="M620 26 q -10 18 -2 30 q 14 -4 18 -22 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" />
            </svg>

            {/* Sun */}
            <div className="pointer-events-none absolute right-6 top-4 grid h-14 w-14 place-items-center rounded-full border-[2.5px] bg-[#ffd166]" style={{ borderColor: "#1f2933" }}>
              <span className="text-2xl">☀</span>
            </div>

            {/* Grass strip */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8" style={{
              background: "linear-gradient(to top, #69b46a, transparent)",
            }} />

            {/* Falling items */}
            {itemsRef.current.map((it) => (
              <FallingChip key={it.id} item={it} field={{ w: FIELD_W, h: FIELD_H }} />
            ))}

            {/* Popup */}
            {popup && (
              <div
                className="pointer-events-none absolute font-display text-lg"
                style={{
                  left: `${(popup.x / FIELD_W) * 100}%`,
                  top: `${(popup.y / FIELD_H) * 100}%`,
                  transform: "translate(-50%, -100%)",
                  color: popup.tone === "good" ? "#1ba884" : popup.tone === "gold" ? "#e9b13d" : "#d63a3a",
                  textShadow: "0 1px 0 white",
                  animation: "popUp 700ms ease-out forwards",
                }}
              >{popup.text}</div>
            )}

            {/* Basket */}
            <Basket xPct={(basketX / FIELD_W) * 100} yPct={((FIELD_H - BASKET_H - 12) / FIELD_H) * 100} />

            <style>{`@keyframes popUp { 0%{ opacity:0; transform: translate(-50%, -80%) } 30%{ opacity:1; transform: translate(-50%, -110%) } 100%{ opacity:0; transform: translate(-50%, -150%) } }`}</style>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Move with mouse or ← →. Rule changes every ~10s.</span>
            <button onClick={reset} className="pill-btn text-xs">Restart</button>
          </div>
        </>
      )}

      {done && (
        <ResultCard
          won={done.score >= 80}
          score={done.score}
          xp={xpFromScore(done.score)}
          best={loadState().bestScores.fruit}
          details={hearts <= 0 ? "Basket gave out — too many rocks." : "Time's up. Nice baskets!"}
          onPlayAgain={reset}
        />
      )}
    </GameShell>
  );
}

function Hearts({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="text-xl leading-none" style={{ filter: i < count ? "none" : "grayscale(1) opacity(0.4)" }}>
          ❤
        </span>
      ))}
    </div>
  );
}

function FallingChip({ item, field }: { item: FallingItem; field: { w: number; h: number } }) {
  const left = (item.x / field.w) * 100;
  const top = (item.y / field.h) * 100;
  const color = COLORS[item.kind];
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
      }}
    >
      {item.kind === "rock" ? (
        <svg width="46" height="38" viewBox="0 0 46 38">
          <path d="M4 28 Q 8 8 22 6 Q 38 4 42 22 Q 44 36 26 36 Q 8 36 4 28 Z" fill={color} stroke="#1f2933" strokeWidth="2.5" />
          <path d="M14 18 q 4 -4 10 -2" stroke="#1f2933" strokeWidth="1.4" fill="none" />
        </svg>
      ) : item.kind === "golden" ? (
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="26" r="20" fill={color} stroke="#1f2933" strokeWidth="2.5" />
          <path d="M22 8 q 4 -4 8 0 q -1 4 -5 5 z" fill="#1ba884" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
          <text x="25" y="32" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="16" fill="#1f2933">★</text>
        </svg>
      ) : (
        <svg width="46" height="50" viewBox="0 0 46 50">
          <ellipse cx="23" cy="28" rx="18" ry="18" fill={color} stroke="#1f2933" strokeWidth="2.5" />
          <ellipse cx="17" cy="22" rx="4" ry="3" fill="rgba(255,255,255,0.7)" />
          <path d="M22 10 q 3 -6 8 -4 q -1 5 -6 7 z" fill="#1ba884" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
          <text x="23" y="34" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="14" fill="#1f2933">{item.value}</text>
        </svg>
      )}
    </div>
  );
}

function Basket({ xPct, yPct }: { xPct: number; yPct: number }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, 0)",
      }}
    >
      <svg width={BASKET_W} height={BASKET_H + 14} viewBox="0 0 110 70">
        {/* rim */}
        <rect x="2" y="6" width="106" height="10" rx="5" fill="#c98a4c" stroke="#1f2933" strokeWidth="2.5" />
        {/* body */}
        <path d="M8 16 L 18 60 H 92 L 102 16 Z" fill="#dba26a" stroke="#1f2933" strokeWidth="2.5" strokeLinejoin="round" />
        {/* weave lines */}
        <path d="M18 24 H 92 M22 36 H 88 M26 48 H 84" stroke="#1f2933" strokeWidth="1.4" opacity="0.5" fill="none" />
        <path d="M30 16 L 36 60 M50 16 L 54 60 M70 16 L 72 60 M90 16 L 88 60" stroke="#1f2933" strokeWidth="1.4" opacity="0.5" fill="none" />
      </svg>
    </div>
  );
}
