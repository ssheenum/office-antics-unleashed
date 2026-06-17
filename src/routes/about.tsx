import { createFileRoute, Link } from "@tanstack/react-router";
import { resetTutorialDismissals } from "@/components/game/Tutorial";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How to play — Come Touch Grass" },
      { name: "description", content: "Three quick, friendly brain games — duck lineups, hidden treasure hunts, fruit falling into a basket." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-8">
        <h1 className="font-display text-3xl tracking-tight">How to play</h1>
        <Link to="/" className="pill-btn text-xs">← Home</Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-12 text-base leading-relaxed">
        <div className="glass grain p-6">
          <p>
            <strong>Come Touch Grass</strong> is a tiny arcade for the office afternoon slump. The game names are
            office sayings — <em>ducks in a row, deep dive, low-hanging fruit</em> — but inside, every game is a
            small reflex or thinking puzzle. Five minutes, then close the laptop and actually go outside.
          </p>
        </div>

        <div className="glass grain p-6">
          <div className="font-display text-xl" style={{ color: "var(--gold-deep)" }}>Ducks in a Row</div>
          <p className="mt-2 text-muted-foreground">
            Memorise a short row of ducks, then rebuild it from a pile. Each round adds a twist — colour patterns,
            trait rules, or a hidden ordering you have to figure out.
          </p>
        </div>

        <div className="glass grain p-6">
          <div className="font-display text-xl" style={{ color: "var(--sky-deep)" }}>Deep Dive</div>
          <p className="mt-2 text-muted-foreground">
            Read the clues, narrow down the grid, and tap the tile hiding the treasure. Shift-click to mark a tile
            as "no". Three wrong taps and the round ends.
          </p>
        </div>

        <div className="glass grain p-6">
          <div className="font-display text-xl" style={{ color: "color-mix(in oklab, #1ba884 80%, #1f2933)" }}>Low-Hanging Fruit</div>

          <p className="mt-2 text-muted-foreground">
            Slide a basket left and right (or with arrow keys). Fruit falls from above — catch the ones that match
            the current rule, dodge rocks, and watch your three hearts. The rule changes every so often.
          </p>
        </div>

        <div className="glass grain p-6 text-center">
          <p className="text-sm text-muted-foreground">Want the tutorials back?</p>
          <button
            onClick={() => { resetTutorialDismissals(); alert("Tutorials will show up again next time you open a game."); }}
            className="pill-btn pill-btn-gold mt-3"
          >
            Re-enable tutorials
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          All progress saves on this device. Finish all three in a day to grow your streak.
        </p>
      </main>
    </div>
  );
}
