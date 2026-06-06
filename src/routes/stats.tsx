import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadState, GAME_LABEL, SKILL_LABEL, GAME_KEYS, type GameState } from "@/lib/storage";
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
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-8">
        <h1 className="font-display text-3xl tracking-tight">Stats</h1>
        <Link to="/" className="pill-btn text-xs">← Hub</Link>
      </header>
      <main className="mx-auto max-w-5xl space-y-10 px-4 pb-12">
        <section>
          <h2 className="mb-4 font-display text-xl tracking-tight">Skill rings</h2>
          <div className="glass grain flex flex-wrap items-center justify-around gap-6 rounded-2xl p-8">
            {(["logic", "memory", "spatial"] as const).map((k) => (
              <SkillRing key={k} label={SKILL_LABEL[k]} xp={s.skillXp[k]} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl tracking-tight">Best scores</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {GAME_KEYS.map((k) => (
              <div key={k} className="glass flex items-center justify-between rounded-xl p-5">
                <div>
                  <div className="font-display text-lg">{GAME_LABEL[k]}</div>
                  <div className="text-xs text-muted-foreground">{s.totalPlays[k] ?? 0} plays</div>
                </div>
                <div className="font-display text-3xl tabular-nums" style={{ color: "var(--gold)" }}>{s.bestScores[k]}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl tracking-tight">Streak & achievements</h2>
          <div className="glass rounded-2xl p-6">
            <div className="mb-4">
              Current streak: <span className="font-display text-2xl" style={{ color: "var(--gold)" }}>{s.streak.count}</span> <span className="text-muted-foreground text-sm">day{s.streak.count === 1 ? "" : "s"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {s.achievements.length === 0 && <span className="text-sm text-muted-foreground">No achievements yet — keep playing.</span>}
              {s.achievements.map((a) => <span key={a} className="chip-gold">{a}</span>)}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
