import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderTile } from "@/components/hub/FolderTile";
import { SkillRing } from "@/components/hub/SkillRing";
import { StreakStamp } from "@/components/hub/StreakStamp";
import { loadState, todayKey, GAME_KEYS, type GameState, type GameKey } from "@/lib/storage";
import { Monogram, DuckMark, DiverMark, BranchMark } from "@/components/art/Marks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cubicle Quest — Brain games with office flavor" },
      { name: "description", content: "Three interactive brain puzzles wrapped in office jargon. Two-minute rounds, real cognitive work, zero PowerPoint." },
      { property: "og:title", content: "Cubicle Quest" },
      { property: "og:description", content: "Logic, memory, spatial-math. Quirky office wrapper, real brain workout." },
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
    <div className="min-h-screen">
      <header className="mx-auto max-w-5xl px-4 pt-12 pb-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="chip-gold">Cubicle Quest</span>
              <span className="chip-muted">Daily Standup</span>
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl" style={{ color: "var(--cream)" }}>
              A quiet, sharp<br/>
              <em className="not-italic" style={{ color: "var(--gold)" }}>brain warm-up.</em>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Three live puzzles, dressed in office-speak. <em>Ducks in a Row, Deep Dive, Low-Hanging Fruit</em> —
              each one a real cognitive workout in under three minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StreakStamp count={state.streak.count} />
              <Link to="/stats" className="pill-btn text-xs">View stats</Link>
            </div>
          </div>
          <div className="hidden md:block" style={{ color: "var(--gold)" }}>
            <Monogram width={128} height={128} className="float-bob" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl tracking-tight">Today's puzzles</h2>
            <span className="chip-muted">{todaysGames.length}/{GAME_KEYS.length} done</span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <FolderTile
              to="/play/ducks"
              title="Ducks in a Row"
              skill="Logic"
              blurb="Arrange the ducks so every clue lights green — and survive the meeting interrupts."
              best={state.bestScores.ducks}
              done={isDone("ducks")}
              Mark={DuckMark}
            />
            <FolderTile
              to="/play/deepdive"
              title="Deep Dive"
              skill="Memory · Reaction"
              blurb="Strata of a report scroll upward. Catch the one that matches the brief before it surfaces."
              best={state.bestScores.deepdive}
              done={isDone("deepdive")}
              Mark={DiverMark}
            />
            <FolderTile
              to="/play/fruit"
              title="Low-Hanging Fruit"
              skill="Spatial-Math"
              blurb="Pick fruits that hit the target. Reach costs points — and yes, fruit sometimes drops."
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
          <div className="glass grain flex flex-wrap items-center justify-around gap-6 rounded-2xl p-8">
            <SkillRing label="Logic" xp={state.skillXp.logic} />
            <SkillRing label="Memory" xp={state.skillXp.memory} />
            <SkillRing label="Spatial-Math" xp={state.skillXp.spatial} />
          </div>
        </section>

        {state.achievements.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 font-display text-2xl tracking-tight">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {state.achievements.map((a) => (
                <span key={a} className="chip-gold">{a}</span>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 pt-6 text-center text-xs text-muted-foreground">
          <div className="gold-rule mb-6" />
          <Link to="/about" className="hover:text-foreground">About</Link>
          <span className="mx-2">·</span>
          <Link to="/stats" className="hover:text-foreground">Stats</Link>
          <span className="mx-2">·</span>
          Saved locally on this device.
        </footer>
      </main>
    </div>
  );
}
