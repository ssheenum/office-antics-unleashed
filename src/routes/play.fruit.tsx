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
      { title: "Low-Hanging Fruit — Touch Grass" },
      { name: "description", content: "Slide a basket across the garden and catch the fruit that fits the rule. Dodge the rocks. Three hearts." },
    ],
  }),
  component: FruitGame,
});

const DURATION = 90;
const FIELD_W = 720;
const FIELD_H = 520;
const BASKET_W = 120;
const BASKET_H = 64;
const RULE_INTERVAL_MS = 22000;

type FruitKind = "apple" | "orange" | "lemon" | "strawberry" | "grape" | "pear" | "blueberry" | "golden" | "rock";

interface FallingItem {
  id: number;
  kind: FruitKind;
  x: number;
  y: number;
  vy: number;
  spin: number;
  rot: number;
  sway: number;
}

// Categorical traits per fruit — used by rules.
const TRAITS: Record<Exclude<FruitKind, "golden" | "rock">, { color: "red" | "orange" | "yellow" | "green" | "purple" | "blue"; family: "tree" | "vine" | "berry"; round: boolean; name: string }> = {
  apple:      { color: "red",    family: "tree",  round: true,  name: "Apple" },
  orange:     { color: "orange", family: "tree",  round: true,  name: "Orange" },
  lemon:      { color: "yellow", family: "tree",  round: false, name: "Lemon" },
  strawberry: { color: "red",    family: "berry", round: false, name: "Strawberry" },
  grape:      { color: "purple", family: "vine",  round: true,  name: "Grape" },
  pear:       { color: "green",  family: "tree",  round: false, name: "Pear" },
  blueberry:  { color: "blue",   family: "berry", round: true,  name: "Blueberry" },
};

type Rule = {
  label: string;
  icons: FruitKind[]; // illustrative icons for the rule chip
  match: (k: FruitKind) => boolean;
};

const RULES: Rule[] = [
  { label: "Catch only Apples",      icons: ["apple"],                       match: (k) => k === "apple" },
  { label: "Catch only Oranges",     icons: ["orange"],                      match: (k) => k === "orange" },
  { label: "Catch only Strawberries",icons: ["strawberry"],                  match: (k) => k === "strawberry" },
  { label: "Catch only Grapes",      icons: ["grape"],                       match: (k) => k === "grape" },
  { label: "Catch RED fruit",        icons: ["apple", "strawberry"],         match: (k) => k !== "golden" && k !== "rock" && TRAITS[k].color === "red" },
  { label: "Catch CITRUS",           icons: ["orange", "lemon"],             match: (k) => k === "orange" || k === "lemon" },
  { label: "Catch BERRIES",          icons: ["strawberry", "blueberry"],     match: (k) => k !== "golden" && k !== "rock" && TRAITS[k].family === "berry" },
  { label: "Catch TREE fruit",       icons: ["apple", "pear", "lemon"],      match: (k) => k !== "golden" && k !== "rock" && TRAITS[k].family === "tree" },
  { label: "Catch ROUND fruit",      icons: ["apple", "blueberry", "orange"],match: (k) => k !== "golden" && k !== "rock" && TRAITS[k].round },
  { label: "Catch COOL colors",      icons: ["grape", "blueberry", "pear"],  match: (k) => k !== "golden" && k !== "rock" && ["green","blue","purple"].includes(TRAITS[k].color) },
  { label: "Catch WARM colors",      icons: ["apple", "orange", "lemon"],    match: (k) => k !== "golden" && k !== "rock" && ["red","orange","yellow"].includes(TRAITS[k].color) },
  { label: "Avoid Pears — catch the rest", icons: ["apple","orange","grape"], match: (k) => k !== "golden" && k !== "rock" && k !== "pear" },
];

function ruleMatches(rule: Rule, kind: FruitKind): boolean {
  if (kind === "rock") return false;
  if (kind === "golden") return true;
  return rule.match(kind);
}

function pickRule(prev?: Rule): Rule {
  let r: Rule;
  do { r = RULES[Math.floor(Math.random() * RULES.length)]; } while (prev && r.label === prev.label);
  return r;
}

function pickKind(): FruitKind {
  const r = Math.random();
  if (r < 0.055) return "rock";
  if (r < 0.085) return "golden";
  const fruits: FruitKind[] = ["apple", "orange", "lemon", "strawberry", "grape", "pear", "blueberry"];
  return fruits[Math.floor(Math.random() * fruits.length)];
}

function FruitGame() {
  const [done, setDone] = useState<null | { secondsLeft: number; score: number }>(null);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [rule, setRule] = useState<Rule>(() => pickRule());
  const [ruleAge, setRuleAge] = useState(0); // 0..1 progress towards next change
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

  function pointerMove(clientX: number) {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = ((clientX - rect.left) / rect.width) * FIELD_W;
    setBasketX(Math.max(BASKET_W / 2, Math.min(FIELD_W - BASKET_W / 2, localX)));
  }

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

  useEffect(() => {
    if (done) return;
    let raf = 0;
    startedRef.current = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - lastFrameRef.current) / 1000);
      lastFrameRef.current = t;
      const elapsed = (t - startedRef.current) / 1000;

      const keys = heldKeysRef.current;
      let dx = 0;
      if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1;
      if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;
      if (dx !== 0) {
        setBasketX((x) => Math.max(BASKET_W / 2, Math.min(FIELD_W - BASKET_W / 2, x + dx * 540 * dt)));
      }

      const spawnInterval = Math.max(0.34, 0.95 - elapsed * 0.006);
      if (t - lastSpawnRef.current > spawnInterval * 1000) {
        lastSpawnRef.current = t;
        const kind = pickKind();
        const baseSpeed = 120 + elapsed * 2.0;
        itemsRef.current.push({
          id: nextIdRef.current++,
          kind,
          x: 36 + Math.random() * (FIELD_W - 72),
          y: -42,
          vy: baseSpeed + Math.random() * 50,
          spin: (Math.random() - 0.5) * 50,
          rot: Math.random() * 30 - 15,
          sway: Math.random() * Math.PI * 2,
        });
      }

      // Rule rotation
      const ruleElapsed = t - lastRuleRef.current;
      setRuleAge(Math.min(1, ruleElapsed / RULE_INTERVAL_MS));
      if (ruleElapsed > RULE_INTERVAL_MS) {
        lastRuleRef.current = t;
        setRule((r) => pickRule(r));
      }

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
        it.x += Math.sin((t * 0.001 + it.sway) * 1.6) * 12 * dt;

        if (
          it.y + 28 >= basketTop &&
          it.y + 28 <= basketTop + 28 &&
          it.x >= basketLeft + 10 &&
          it.x <= basketRight - 10
        ) {
          if (it.kind === "rock") {
            heartDelta -= 1;
            scoreDelta -= 5;
            popAt(it.x, basketTop, "−heart", "bad");
            comboReset = true;
          } else if (it.kind === "golden") {
            scoreDelta += 30;
            popAt(it.x, basketTop, "+30 ✨", "gold");
          } else if (ruleMatches(ruleRef.current, it.kind)) {
            const bonus = Math.floor(comboRef.current / 3);
            const gain = 5 + bonus;
            scoreDelta += gain;
            popAt(it.x, basketTop, `+${gain}`, "good");
          } else {
            scoreDelta -= 3;
            popAt(it.x, basketTop, "−3", "bad");
            comboReset = true;
          }
          continue;
        }
        if (it.y > FIELD_H + 30) continue;
        survivors.push(it);
      }
      itemsRef.current = survivors;

      if (scoreDelta !== 0) {
        setScore((s) => Math.max(0, s + scoreDelta));
      }
      if (heartDelta !== 0) {
        setHearts((h) => {
          const nh = Math.max(0, h + heartDelta);
          if (nh <= 0) {
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
  }, [done]);

  const basketRef = useRef(basketX);
  useEffect(() => { basketRef.current = basketX; }, [basketX]);
  const comboRef = useRef(combo);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  const ruleRef = useRef(rule);
  useEffect(() => { ruleRef.current = rule; }, [rule]);

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
    setRuleAge(0);
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
          <div className="glass grain mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="chip-gold">Rule</span>
              <div className="flex items-center gap-1.5">
                {rule.icons.map((k, i) => (
                  <span key={i} className="grid h-9 w-9 place-items-center rounded-xl border-[2px] bg-white" style={{ borderColor: "color-mix(in oklab, #1f2933 14%, transparent)" }}>
                    <Fruit kind={k} size={26} />
                  </span>
                ))}
              </div>
              <span className="font-display text-lg md:text-xl">{rule.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-display text-xl tabular-nums" style={{ color: "var(--gold-deep)" }}>×{combo}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">combo</div>
              </div>
              {/* Rule timer ring */}
              <div className="relative h-10 w-10">
                <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="color-mix(in oklab, #1f2933 12%, transparent)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="var(--sky-deep)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(1 - ruleAge) * 94.25} 94.25`} />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-[10px] font-bold text-muted-foreground">
                  {Math.max(0, Math.ceil((1 - ruleAge) * (RULE_INTERVAL_MS / 1000)))}
                </div>
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
                "radial-gradient(ellipse at 70% 0%, #fff4c2 0%, transparent 50%), linear-gradient(180deg, #b8e7ff 0%, #d6f1ff 30%, #e9f5d4 65%, #c6e69f 100%)",
              borderColor: "color-mix(in oklab, #1ba884 50%, transparent)",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.7), 0 8px 0 color-mix(in oklab, #1ba884 28%, transparent)",
              cursor: "none",
            }}
          >
            {/* Sky decoration */}
            <Cloud x={12} y={8} scale={1} />
            <Cloud x={62} y={4} scale={0.8} />
            <Cloud x={42} y={14} scale={0.6} />

            {/* Sun with rays */}
            <div className="pointer-events-none absolute right-6 top-5">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <defs>
                  <radialGradient id="sunG" cx="40%" cy="40%">
                    <stop offset="0%" stopColor="#fff4b8"/>
                    <stop offset="60%" stopColor="#ffd166"/>
                    <stop offset="100%" stopColor="#f4a93a"/>
                  </radialGradient>
                </defs>
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={i} x1="36" y1="36" x2="36" y2="6" stroke="#f4a93a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 45} 36 36)`} />
                ))}
                <circle cx="36" cy="36" r="18" fill="url(#sunG)" stroke="#1f2933" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Tree branch with hanging leaves */}
            <svg className="pointer-events-none absolute inset-x-0 top-0" viewBox="0 0 720 100" preserveAspectRatio="none" style={{ width: "100%", height: "16%" }}>
              <defs>
                <linearGradient id="bark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7a4d28"/>
                  <stop offset="100%" stopColor="#4a2f18"/>
                </linearGradient>
                <linearGradient id="leafG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5fe0b3"/>
                  <stop offset="100%" stopColor="#1ba884"/>
                </linearGradient>
              </defs>
              <path d="M-10 50 Q 180 18 360 44 T 730 36" stroke="url(#bark)" strokeWidth="14" strokeLinecap="round" fill="none" />
              <path d="M-10 50 Q 180 18 360 44 T 730 36" stroke="#1f2933" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
              {[80, 200, 320, 440, 560, 660].map((x, i) => (
                <g key={i} transform={`translate(${x} ${36 + (i % 2) * 6})`}>
                  <path d="M0 0 q -12 22 -2 38 q 18 -4 22 -28 z" fill="url(#leafG)" stroke="#1f2933" strokeWidth="2" />
                  <path d="M2 6 q 4 14 12 22" stroke="#1f2933" strokeWidth="1.2" fill="none" opacity="0.5" />
                </g>
              ))}
            </svg>

            {/* Grass strip + flowers */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{
              background: "linear-gradient(to top, #69b46a 0%, #8ccf6e 60%, transparent 100%)",
            }} />
            <svg className="pointer-events-none absolute inset-x-0 bottom-0" viewBox="0 0 720 40" preserveAspectRatio="none" style={{ width: "100%", height: "8%" }}>
              {[40, 130, 250, 360, 470, 580, 690].map((x, i) => (
                <g key={i} transform={`translate(${x} 24)`}>
                  <circle r="4" fill={i % 2 ? "#ffb3c1" : "#fff7c2"} stroke="#1f2933" strokeWidth="1.5" />
                  <circle r="1.4" fill="#e9b13d" />
                </g>
              ))}
            </svg>

            {/* Falling items */}
            {itemsRef.current.map((it) => (
              <FallingChip key={it.id} item={it} field={{ w: FIELD_W, h: FIELD_H }} highlight={ruleMatches(rule, it.kind) && it.kind !== "golden"} />
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
                  textShadow: "0 1px 0 white, 0 0 4px white",
                  animation: "popUp 700ms ease-out forwards",
                }}
              >{popup.text}</div>
            )}

            <Basket xPct={(basketX / FIELD_W) * 100} yPct={((FIELD_H - BASKET_H - 12) / FIELD_H) * 100} />

            <style>{`@keyframes popUp { 0%{ opacity:0; transform: translate(-50%, -80%) } 30%{ opacity:1; transform: translate(-50%, -110%) } 100%{ opacity:0; transform: translate(-50%, -150%) } }`}</style>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Move with mouse or ← →. Rule changes every ~22s.</span>
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

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <div className="pointer-events-none absolute" style={{ left: `${x}%`, top: `${y}%`, transform: `scale(${scale})` }}>
      <svg width="80" height="36" viewBox="0 0 80 36">
        <ellipse cx="20" cy="22" rx="16" ry="12" fill="white" stroke="#1f2933" strokeWidth="2" opacity="0.9" />
        <ellipse cx="40" cy="18" rx="20" ry="14" fill="white" stroke="#1f2933" strokeWidth="2" opacity="0.9" />
        <ellipse cx="60" cy="22" rx="14" ry="11" fill="white" stroke="#1f2933" strokeWidth="2" opacity="0.9" />
      </svg>
    </div>
  );
}

function FallingChip({ item, field, highlight }: { item: FallingItem; field: { w: number; h: number }; highlight: boolean }) {
  const left = (item.x / field.w) * 100;
  const top = (item.y / field.h) * 100;
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
        filter: highlight ? "drop-shadow(0 0 6px #ffd166)" : "drop-shadow(0 3px 2px rgba(0,0,0,0.15))",
      }}
    >
      <Fruit kind={item.kind} size={54} />
    </div>
  );
}

function Fruit({ kind, size = 50 }: { kind: FruitKind; size?: number }) {
  const w = size;
  const h = size;
  switch (kind) {
    case "apple":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="appleG" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ff9090"/>
              <stop offset="60%" stopColor="#ef3a3a"/>
              <stop offset="100%" stopColor="#a81e1e"/>
            </radialGradient>
          </defs>
          <path d="M25 10 C 12 10 6 22 8 32 C 10 44 20 46 25 42 C 30 46 40 44 42 32 C 44 22 38 10 25 10 Z" fill="url(#appleG)" stroke="#1f2933" strokeWidth="2.2" />
          <path d="M25 12 q -1 -5 -6 -7" stroke="#5a3b1f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M25 12 q 5 -4 12 -2 q -3 6 -10 6 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="18" cy="22" rx="4" ry="3" fill="rgba(255,255,255,0.6)" />
        </svg>
      );
    case "orange":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="orG" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ffd09a"/>
              <stop offset="60%" stopColor="#ff8c2e"/>
              <stop offset="100%" stopColor="#c95a0d"/>
            </radialGradient>
          </defs>
          <circle cx="25" cy="27" r="18" fill="url(#orG)" stroke="#1f2933" strokeWidth="2.2" />
          <circle cx="18" cy="22" r="2.5" fill="#ffdfb0" opacity="0.7" />
          <circle cx="30" cy="20" r="1.4" fill="#1f2933" opacity="0.25" />
          <circle cx="22" cy="32" r="1.4" fill="#1f2933" opacity="0.25" />
          <circle cx="33" cy="30" r="1.4" fill="#1f2933" opacity="0.25" />
          <path d="M22 10 q 4 -5 9 -3 q -2 5 -7 6 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "lemon":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="lemG" cx="35%" cy="40%">
              <stop offset="0%" stopColor="#fffacc"/>
              <stop offset="60%" stopColor="#ffe24d"/>
              <stop offset="100%" stopColor="#c9a012"/>
            </radialGradient>
          </defs>
          <ellipse cx="25" cy="27" rx="18" ry="14" fill="url(#lemG)" stroke="#1f2933" strokeWidth="2.2" transform="rotate(-15 25 27)" />
          <ellipse cx="18" cy="22" rx="4" ry="2.5" fill="rgba(255,255,255,0.7)" transform="rotate(-15 18 22)" />
          <path d="M40 16 l 5 -4" stroke="#5a3b1f" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M42 14 q 6 -2 7 4 q -6 1 -8 -2 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "strawberry":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="strG" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#ff8d8d"/>
              <stop offset="60%" stopColor="#e83e5c"/>
              <stop offset="100%" stopColor="#931e36"/>
            </radialGradient>
          </defs>
          <path d="M12 18 Q 25 14 38 18 Q 36 38 25 46 Q 14 38 12 18 Z" fill="url(#strG)" stroke="#1f2933" strokeWidth="2.2" strokeLinejoin="round" />
          {[[20,24],[28,22],[24,30],[18,32],[30,32],[24,38]].map(([cx,cy], i) => (
            <g key={i}><ellipse cx={cx} cy={cy} rx="1.2" ry="2" fill="#fff4c2" stroke="#1f2933" strokeWidth="0.8" /></g>
          ))}
          <path d="M14 18 q 4 -6 11 -5 q 7 -1 11 5 q -3 -3 -8 -2 q -3 -1 -3 4 q 0 -5 -3 -4 q -5 -1 -8 2 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case "grape":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="grG" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#c9a4ff"/>
              <stop offset="100%" stopColor="#6b3fbf"/>
            </radialGradient>
          </defs>
          <path d="M22 10 q 4 -4 8 -2" stroke="#5a3b1f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M28 10 q 6 -4 10 0 q -4 4 -10 2 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
          {[[19,18],[28,18],[15,25],[24,25],[33,25],[19,32],[28,32],[24,39]].map(([cx,cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="5" fill="url(#grG)" stroke="#1f2933" strokeWidth="1.8" />
          ))}
        </svg>
      );
    case "pear":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="peG" cx="35%" cy="50%">
              <stop offset="0%" stopColor="#e8f8a8"/>
              <stop offset="60%" stopColor="#9ed14a"/>
              <stop offset="100%" stopColor="#5b8a1f"/>
            </radialGradient>
          </defs>
          <path d="M25 14 C 18 14 16 22 18 28 C 12 32 12 44 25 46 C 38 44 38 32 32 28 C 34 22 32 14 25 14 Z" fill="url(#peG)" stroke="#1f2933" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M25 14 q 0 -4 -3 -6" stroke="#5a3b1f" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M25 14 q 5 -3 10 0 q -4 4 -10 2 z" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="20" cy="26" rx="3" ry="2" fill="rgba(255,255,255,0.6)" />
        </svg>
      );
    case "blueberry":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="blG" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#86b6ff"/>
              <stop offset="100%" stopColor="#2e4ea8"/>
            </radialGradient>
          </defs>
          <circle cx="18" cy="28" r="10" fill="url(#blG)" stroke="#1f2933" strokeWidth="2" />
          <circle cx="32" cy="30" r="11" fill="url(#blG)" stroke="#1f2933" strokeWidth="2" />
          <circle cx="25" cy="22" r="9" fill="url(#blG)" stroke="#1f2933" strokeWidth="2" />
          <path d="M25 13 q 0 -2 2 -3 m -2 3 q -2 -1 -2 -3 m 2 3 q 2 -2 0 -4" stroke="#1f2933" strokeWidth="1.5" fill="none" />
          <circle cx="22" cy="20" r="2" fill="rgba(255,255,255,0.6)" />
        </svg>
      );
    case "golden":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <radialGradient id="gldG" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#fff6c2"/>
              <stop offset="60%" stopColor="#ffd166"/>
              <stop offset="100%" stopColor="#b87f10"/>
            </radialGradient>
          </defs>
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="25" y1="25" x2="25" y2="3" stroke="#ffd166" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45} 25 25)`} />
          ))}
          <circle cx="25" cy="26" r="16" fill="url(#gldG)" stroke="#1f2933" strokeWidth="2.5" />
          <text x="25" y="32" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="18" fill="#1f2933">★</text>
        </svg>
      );
    case "rock":
      return (
        <svg width={w} height={h} viewBox="0 0 50 50">
          <defs>
            <linearGradient id="rkG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#aab1bb"/>
              <stop offset="100%" stopColor="#5a626d"/>
            </linearGradient>
          </defs>
          <path d="M6 32 Q 10 12 24 10 Q 42 8 46 26 Q 46 42 26 42 Q 8 42 6 32 Z" fill="url(#rkG)" stroke="#1f2933" strokeWidth="2.5" />
          <path d="M16 22 q 4 -4 10 -2 M28 30 q 6 -2 12 -1" stroke="#1f2933" strokeWidth="1.4" fill="none" opacity="0.6" />
        </svg>
      );
  }
}

function Basket({ xPct, yPct }: { xPct: number; yPct: number }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, 0)", filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.25))" }}
    >
      <svg width={BASKET_W} height={BASKET_H + 18} viewBox="0 0 120 82">
        <defs>
          <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2a96c"/>
            <stop offset="100%" stopColor="#a06a3a"/>
          </linearGradient>
          <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8b478"/>
            <stop offset="100%" stopColor="#a06a3a"/>
          </linearGradient>
        </defs>
        {/* handle */}
        <path d="M22 10 q 38 -24 76 0" stroke="#7a4d28" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M22 10 q 38 -24 76 0" stroke="#1f2933" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        {/* rim */}
        <rect x="2" y="10" width="116" height="12" rx="6" fill="url(#rim)" stroke="#1f2933" strokeWidth="2.5" />
        {/* body */}
        <path d="M10 22 L 20 70 H 100 L 110 22 Z" fill="url(#body)" stroke="#1f2933" strokeWidth="2.5" strokeLinejoin="round" />
        {/* weave */}
        <path d="M20 32 H 100 M24 44 H 96 M28 56 H 92" stroke="#5a3b1f" strokeWidth="1.4" opacity="0.55" fill="none" />
        <path d="M34 22 L 40 70 M58 22 L 60 70 M82 22 L 78 70 M104 22 L 98 70" stroke="#5a3b1f" strokeWidth="1.4" opacity="0.55" fill="none" />
      </svg>
    </div>
  );
}
