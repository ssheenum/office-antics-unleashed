import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How to play — Cubicle Quest" },
      { name: "description", content: "Three quick, friendly brain games — ducks on lily pads, koi rising in lanes, fruit falling into a basket." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-8">
        <h1 className="font-display text-3xl tracking-tight">How to play</h1>
        <Link to="/" className="pill-btn text-xs">← Pond</Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-12 text-base leading-relaxed">
        <div className="glass grain p-6">
          <p>
            <strong>Cubicle Quest</strong> is a tiny pond-and-garden arcade. The names are office sayings —
            <em> ducks in a row, deep dive, low-hanging fruit</em> — but inside, every game is a small, fun reflex
            or thinking puzzle. Two-minute rounds. Friendly stakes. Nothing about your inbox.
          </p>
        </div>

        <div className="glass grain p-6">
          <div className="font-display text-xl" style={{ color: "var(--gold-deep)" }}>🦆 Ducks in a Row</div>
          <p className="mt-2 text-muted-foreground">
            Drag rubber ducks between lily pads until every clue at the top lights green. Keep them all green for three
            seconds to advance — but watch out for the surprise splash that swaps two ducks at random.
          </p>
        </div>

        <div className="glass grain p-6">
          <div className="font-display text-xl" style={{ color: "var(--sky-deep)" }}>🐟 Deep Dive</div>
          <p className="mt-2 text-muted-foreground">
            Koi rise through the pond in five lanes. A call tells you which koi to catch — by color, by lane, or by
            the shape on its back. Tap fast, build a combo, miss and the combo resets.
          </p>
        </div>

        <div className="glass grain p-6">
          <div className="font-display text-xl" style={{ color: "color-mix(in oklab, #1ba884 80%, #1f2933)" }}>🍎 Low-Hanging Fruit</div>
          <p className="mt-2 text-muted-foreground">
            Slide a basket left and right (or with arrow keys). Fruit falls from the branches above — catch the ones
            that match the current rule, dodge rocks, and watch your three hearts. Speed picks up over time.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          All progress saves on this device. Finish all three in a day to grow your streak.
        </p>
      </main>
    </div>
  );
}
