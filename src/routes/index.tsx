import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderTile } from "@/components/hub/FolderTile";
import { SkillRing } from "@/components/hub/SkillRing";
import { StreakStamp } from "@/components/hub/StreakStamp";
import { loadState, todayKey, GAME_KEYS, type GameState, type GameKey } from "@/lib/storage";
import { Monogram, DuckMark, DiverMark, BranchMark, CloudPuff, CattailMark } from "@/components/art/Marks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cubicle Quest — A sunny little pond of brain games" },
      { name: "description", content: "Line up rubber ducks on lily pads, catch koi in the pond, and grab fruit with a basket. Three tiny brain games, two-minute rounds." },
      { property: "og:title", content: "Cubicle Quest" },
      { property: "og:description", content: "Ducks in a Row · Deep Dive · Low-Hanging Fruit — three quick, friendly brain games." },
    ],
  }),
  component: Hub,
});

function Hub() {
  const [state, setState] = useState<GameState | null>(null);
  useEffect(() => setState(loadState()), []);

  if (!state) return <div className="min-h-screen" />;

  const today = todayKey();
  const todaysGames = state.dailyDone.day === today ? state.dailyDone.games : [];
  const isDone = (k: GameKey) => todaysGames.includes(k);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* sky gradient wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse at 80% 0%, #fff4c2 0%, transparent 55%), linear-gradient(180deg, #d6f1ff 0%, transparent 70%)",
        }}
      />
      {/* sun */}
      <svg className="pointer-events-none absolute right-[6%] top-10" width="110" height="110" viewBox="0 0 110 110">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1="55" y1="55" x2="55" y2="8" stroke="#f4a93a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 36} 55 55)`} opacity="0.8" />
        ))}
        <circle cx="55" cy="55" r="26" fill="#ffd166" stroke="#1f2933" strokeWidth="2.5" />
        <circle cx="48" cy="50" r="9" fill="#fff4b8" opacity="0.7" />
      </svg>
      {/* decorative clouds + cattails */}
      <CloudPuff className="pointer-events-none absolute left-[6%] top-24 w-36 opacity-80 float-bob" />
      <CloudPuff className="pointer-events-none absolute right-[28%] top-16 w-24 opacity-70 float-bob" style={{ animationDelay: "1.2s" }} />
      <CloudPuff className="pointer-events-none absolute left-[42%] top-44 w-20 opacity-60 float-bob" style={{ animationDelay: "2.4s" }} />
      <CattailMark className="pointer-events-none absolute bottom-0 left-4 h-36 opacity-80" />
      <CattailMark className="pointer-events-none absolute bottom-0 left-20 h-24 opacity-70" />
      <CattailMark className="pointer-events-none absolute bottom-0 right-6 h-32 opacity-80" />
      <CattailMark className="pointer-events-none absolute bottom-0 right-24 h-20 opacity-70" />

      <header className="relative mx-auto max-w-5xl px-4 pt-12 pb-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="chip-gold">Cubicle Quest</span>
              <span className="chip-sky">Daily Pond</span>
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
              A sunny<br/>
              <span style={{ color: "var(--sky-deep)" }}>little pond</span>
              <span> of </span>
              <span style={{ color: "var(--gold-deep)" }}>brain games.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Three quick games dressed in office sayings. <em>Ducks in a Row</em>, <em>Deep Dive</em>, <em>Low-Hanging Fruit</em> — all play in the same friendly pond-and-garden.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StreakStamp count={state.streak.count} />
              <Link to="/stats" className="pill-btn text-xs">View stats</Link>
              <Link to="/about" className="pill-btn text-xs">How to play</Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            {/* Pond scene mini illustration */}
            <svg width="220" height="200" viewBox="0 0 220 200">
              <defs>
                <radialGradient id="pondHero" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#7fd6ec"/>
                  <stop offset="100%" stopColor="#06aed5"/>
                </radialGradient>
              </defs>
              <ellipse cx="110" cy="130" rx="100" ry="60" fill="url(#pondHero)" stroke="#1f2933" strokeWidth="2.5" />
              <ellipse cx="80" cy="120" rx="36" ry="6" fill="white" opacity="0.35" />
              <ellipse cx="140" cy="148" rx="22" ry="3" fill="white" opacity="0.35" />
              {/* lily pads */}
              <ellipse cx="58" cy="142" rx="22" ry="9" fill="#2dd4a8" stroke="#1f2933" strokeWidth="2" />
              <path d="M58 142 L 50 134" stroke="#1f2933" strokeWidth="2" />
              <ellipse cx="165" cy="158" rx="18" ry="7" fill="#1ba884" stroke="#1f2933" strokeWidth="2" />
              {/* duck */}
              <g className="float-bob">
                <ellipse cx="110" cy="100" rx="34" ry="22" fill="#ffd166" stroke="#1f2933" strokeWidth="2.5" />
                <circle cx="138" cy="86" r="16" fill="#ffd166" stroke="#1f2933" strokeWidth="2.5" />
                <path d="M150 86 q 10 -2 12 4 q -10 4 -14 0 z" fill="#ff8c2e" stroke="#1f2933" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="140" cy="82" r="2.4" fill="#1f2933" />
                <ellipse cx="100" cy="100" rx="3" ry="2" fill="white" opacity="0.7" />
                <path d="M88 102 q -10 8 -2 12" stroke="#1f2933" strokeWidth="2" fill="none" />
              </g>
            </svg>
            <Monogram width={70} height={70} className="absolute -bottom-2 -left-4 float-bob" style={{ animationDelay: "0.8s" }} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-20">
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl tracking-tight">Today's games</h2>
            <span className="chip-muted">{todaysGames.length}/{GAME_KEYS.length} done</span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FolderTile
              to="/play/ducks"
              title="Ducks in a Row"
              skill="Memory"
              tone="gold"
              blurb="A row of quirky ducks appears, then scatters across the pond. Rebuild the order from memory, spot patterns, crack hidden rules."
              best={state.bestScores.ducks}
              done={isDone("ducks")}
              Mark={DuckMark}
            />
            <FolderTile
              to="/play/deepdive"
              title="Deep Dive"
              skill="Logic"
              tone="sky"
              blurb="A tiny diver hunts hidden treasure on a 5×5 reef. Read the clues, narrow the tiles, tap the one that fits them all."
              best={state.bestScores.deepdive}
              done={isDone("deepdive")}
              Mark={DiverMark}
            />
            <FolderTile
              to="/play/fruit"
              title="Low-Hanging Fruit"
              skill="Reflex"
              tone="leaf"
              blurb="Slide a basket and catch fruit that fits the rule. Dodge rocks. Watch your hearts."
              best={state.bestScores.fruit}
              done={isDone("fruit")}
              Mark={BranchMark}
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl tracking-tight">Skill rings</h2>
            <span className="chip-muted">100 xp per level</span>
          </div>
          <div className="glass grain flex flex-wrap items-center justify-around gap-6 p-8">
            <SkillRing label="Memory" xp={state.skillXp.memory} />
            <SkillRing label="Logic" xp={state.skillXp.logic} />
            <SkillRing label="Reflex" xp={state.skillXp.spatial} />
          </div>
        </section>

        {state.achievements.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 font-display text-2xl tracking-tight">Stickers</h2>
            <div className="flex flex-wrap gap-2">
              {state.achievements.map((a) => (
                <span key={a} className="chip-gold">★ {a}</span>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 pt-6 text-center text-xs text-muted-foreground">
          <div className="gold-rule mx-auto mb-6 max-w-xs" />
          <Link to="/about" className="hover:text-foreground">About</Link>
          <span className="mx-2">·</span>
          <Link to="/stats" className="hover:text-foreground">Stats</Link>
          <span className="mx-2">·</span>
          Saved on this device.
        </footer>
      </main>
    </div>
  );
}
