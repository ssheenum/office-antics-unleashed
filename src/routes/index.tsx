import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderTile } from "@/components/hub/FolderTile";
import { SkillRing } from "@/components/hub/SkillRing";
import { StreakStamp } from "@/components/hub/StreakStamp";
import { loadState, todayKey, type GameState } from "@/lib/storage";
import hubHero from "@/assets/m-hub.png";
import ducksHero from "@/assets/m-ducks.png";
import connectHero from "@/assets/m-connect.png";
import circleHero from "@/assets/m-circle.png";
import fruitHero from "@/assets/m-fruit.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cubicle Quest — Brain games with office flavor" },
      { name: "description", content: "Four brain puzzles dressed up in corporate jargon. 2-3 minutes, real cognitive work, zero PowerPoint." },
      { property: "og:title", content: "Cubicle Quest" },
      { property: "og:description", content: "Logic, pattern, memory, spatial-math. Quirky office wrapper, real brain workout." },
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
  const isDone = (k: "ducks" | "connect" | "circle" | "fruit") => todaysGames.includes(k);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-6">
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Cubicle Quest</div>
            <h1 className="font-display text-4xl leading-none md:text-5xl">The Daily Standup</h1>
            <p className="mt-3 max-w-lg text-sm text-foreground/80">
              Four brain puzzles wrapped in office-speak. Mechanics are real cognitive work — the jargon's just decoration.
            </p>
            <div className="mt-4">
              <StreakStamp count={state.streak.count} />
            </div>
          </div>
          <img
            src={hubHero}
            alt="Cubicle Quest mascot — a smiling manila folder character"
            className="wiggle hidden h-48 w-48 object-contain md:block"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-xl uppercase tracking-wider">Pick a folder</h2>
            <Link to="/stats" className="text-sm text-toner hover:underline" style={{ color: "var(--toner)" }}>
              Full stats →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FolderTile
              to="/play/ducks"
              title="Ducks in a Row"
              skill="Logic / deduction"
              blurb="Arrange a row of ducks to satisfy a tangle of clues."
              best={state.bestScores.ducks}
              done={isDone("ducks")}
              image={ducksHero}
              accent="ducks"
            />
            <FolderTile
              to="/play/connect"
              title="Connect the Dots"
              skill="Pattern recognition"
              blurb="Sixteen tiles, four hidden groups of four. Decoys are mean."
              best={state.bestScores.connect}
              done={isDone("connect")}
              image={connectHero}
              accent="connect"
            />
            <FolderTile
              to="/play/circle"
              title="Circle Back"
              skill="Memory / sequence"
              blurb="Memorize the sticky-note sequence. Forward, backward, or swapped."
              best={state.bestScores.circle}
              done={isDone("circle")}
              image={circleHero}
              accent="circle"
            />
            <FolderTile
              to="/play/fruit"
              title="Low-Hanging Fruit"
              skill="Spatial-math / optimization"
              blurb="Pick low-reach fruits to hit the target. Reach costs points."
              best={state.bestScores.fruit}
              done={isDone("fruit")}
              image={fruitHero}
              accent="fruit"
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl uppercase tracking-wider">Skill rings</h2>
          <div className="paper-card flex flex-wrap items-center justify-around gap-4 rounded-lg p-6">
            <SkillRing label="Logic" xp={state.skillXp.logic} />
            <SkillRing label="Pattern" xp={state.skillXp.pattern} />
            <SkillRing label="Memory" xp={state.skillXp.memory} />
            <SkillRing label="Spatial-Math" xp={state.skillXp.spatial} />
          </div>
        </section>

        <section className="mt-10">
          <div className="paper-card rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg uppercase tracking-wider">Daily Standup</h3>
                <p className="text-sm text-muted-foreground">
                  Finish all four games today to grow your streak. {todaysGames.length}/4 done.
                </p>
              </div>
              <div className="flex gap-1">
                {(["ducks", "connect", "circle", "fruit"] as const).map((k) => (
                  <div
                    key={k}
                    className="h-3 w-8 rounded-sm"
                    style={{ background: isDone(k) ? "var(--toner)" : "var(--muted)" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {state.achievements.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-display text-xl uppercase tracking-wider">Achievements</h2>
            <div className="flex flex-wrap gap-2">
              {state.achievements.map((a) => (
                <span key={a} className="stamp text-xs">{a}</span>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
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
