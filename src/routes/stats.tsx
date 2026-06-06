import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadState, GAME_LABEL, SKILL_LABEL, type GameState } from "@/lib/storage";
import { SkillRing } from "@/components/hub/SkillRing";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Stats — Cubicle Quest" },
      { name: "description", content: "Your best scores, skill XP, streak, and unlocked achievements." },
    ],
  }),
  component: Stats,
});

function Stats() {
  const [s, setS] = useState<GameState | null>(null);
  useEffect(() => setS(loadState()), []);
  if (!s) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <h1 className="font-display text-3xl">Stats</h1>
          <Link to="/" className="text-sm hover:underline">← Hub</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <section>
          <h2 className="mb-3 font-display text-lg uppercase tracking-wider">Skill rings</h2>
          <div className="paper-card flex flex-wrap items-center justify-around gap-4 rounded-lg p-6">
            {(["logic", "pattern", "memory", "spatial"] as const).map((k) => (
              <SkillRing key={k} label={SKILL_LABEL[k]} xp={s.skillXp[k]} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg uppercase tracking-wider">Best scores</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["ducks", "connect", "circle", "fruit"] as const).map((k) => (
              <div key={k} className="paper-card flex items-center justify-between rounded-md p-4">
                <div>
                  <div className="font-display text-lg">{GAME_LABEL[k]}</div>
                  <div className="text-xs text-muted-foreground">{s.totalPlays[k] ?? 0} plays</div>
                </div>
                <div className="font-display text-2xl tabular-nums">{s.bestScores[k]}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg uppercase tracking-wider">Streak & achievements</h2>
          <div className="paper-card rounded-lg p-5">
            <div className="mb-3">
              Current streak: <span className="font-display text-xl">{s.streak.count}</span> day{s.streak.count === 1 ? "" : "s"}
            </div>
            <div className="flex flex-wrap gap-2">
              {s.achievements.length === 0 && <span className="text-sm text-muted-foreground">No achievements yet — keep grinding.</span>}
              {s.achievements.map((a) => (
                <span key={a} className="stamp text-xs">{a}</span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
