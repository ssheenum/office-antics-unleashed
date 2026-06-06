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
      {/* decorative clouds + cattails */}
      <CloudPuff className="pointer-events-none absolute left-[6%] top-24 w-32 opacity-70 float-bob" />
      <CloudPuff className="pointer-events-none absolute right-[10%] top-44 w-24 opacity-60 float-bob" style={{ animationDelay: "1.2s" }} />
      <CattailMark className="pointer-events-none absolute bottom-0 left-4 h-32 opacity-80" />
      <CattailMark className="pointer-events-none absolute bottom-0 left-16 h-24 opacity-70" />
      <CattailMark className="pointer-events-none absolute bottom-0 right-6 h-28 opacity-80" />

      <header className="relative mx-auto max-w-5xl px-4 pt-12 pb-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="chip-gold">Cubicle Quest</span>
              <span className="chip-sky">Daily Pond</span>
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight md:text-6xl">
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
          <div className="hidden md:block">
            <Monogram width={150} height={150} className="float-bob" />
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
              skill="Logic"
              tone="gold"
              blurb="Drag rubber ducks onto lily pads so every clue lights up — before a splash shuffles them."
              best={state.bestScores.ducks}
              done={isDone("ducks")}
              Mark={DuckMark}
            />
            <FolderTile
              to="/play/deepdive"
              title="Deep Dive"
              skill="Reaction"
              tone="sky"
              blurb="Koi rise in lanes from the deep. Tap the one matching the call — keep your combo alive."
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
            <SkillRing label="Logic" xp={state.skillXp.logic} />
            <SkillRing label="Reaction" xp={state.skillXp.memory} />
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
