import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/game/GameShell";
import { GameBanner } from "@/components/game/GameBanner";
import { Timer } from "@/components/game/Timer";
import { ResultCard } from "@/components/game/ResultCard";
import { recordRound, loadState } from "@/lib/storage";
import { xpFromScore } from "@/lib/scoring";
import { Tutorial } from "@/components/game/Tutorial";
import { HeartIcon } from "@/components/art/MinimalIcons";
import tileFruit from "@/assets/tile-fruit.png";
import frApple from "@/assets/fr-apple.png";
import frOrange from "@/assets/fr-orange.png";
import frLemon from "@/assets/fr-lemon.png";
import frStrawberry from "@/assets/fr-strawberry.png";
import frGrape from "@/assets/fr-grape.png";
import frPear from "@/assets/fr-pear.png";
import frBlueberry from "@/assets/fr-blueberry.png";
import frGolden from "@/assets/fr-golden.png";
import frRock from "@/assets/fr-rock.png";
import frBasket from "@/assets/fr-basket.png";

const FRUIT_SRC: Record<FruitKind, string> = {
  apple: frApple,
  orange: frOrange,
  lemon: frLemon,
  strawberry: frStrawberry,
  grape: frGrape,
  pear: frPear,
  blueberry: frBlueberry,
  golden: frGolden,
  rock: frRock,
};


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
            popAt(it.x, basketTop, "+30", "gold");
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
      <Tutorial
        gameKey="fruit"
        title="Low-Hanging Fruit"
        accent="#e85b6b"
        accentDeep="#9a2e3b"
        onStart={() => {}}
        steps={[
          { icon: <img src={frBasket} alt="" width={56} height={56} style={{ objectFit: "contain" }} />, title: "Move the basket", body: "Slide your mouse, drag on touch, or use ← → arrow keys to glide the basket left and right." },
          { icon: <img src={frApple} alt="" width={56} height={56} style={{ objectFit: "contain" }} />, title: "Follow the rule", body: <>The chip up top tells you what to catch — like <b>only apples</b> or <b>only red fruit</b>. Catch the right ones, skip the rest.</> },
          { icon: <img src={frRock} alt="" width={56} height={56} style={{ objectFit: "contain" }} />, title: "Dodge rocks, watch hearts", body: "Rocks and wrong fruit cost a heart. Three hearts and the round ends. The rule changes every so often — keep an eye on it!" },
        ]}
      />

      <GameBanner
        image={tileFruit}
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
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <HeartIcon
          key={i}
          width={18}
          height={18}
          style={{ color: i < count ? "#e85b6b" : "#cbd1d8" }}
        />
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
  return (
    <img
      src={FRUIT_SRC[kind]}
      alt=""
      width={size}
      height={size}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}

function Basket({ xPct, yPct }: { xPct: number; yPct: number }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: "translate(-50%, -10%)",
        filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.28))",
      }}
    >
      <img
        src={frBasket}
        alt=""
        draggable={false}
        style={{ width: BASKET_W + 10, height: "auto", objectFit: "contain", display: "block" }}
      />
    </div>
  );
}
