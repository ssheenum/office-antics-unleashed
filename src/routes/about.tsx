import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Cubicle Quest" },
      { name: "description", content: "Why Cubicle Quest exists: real brain puzzles, office-jargon wrapper, two-minute rounds." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
          <h1 className="font-display text-3xl">About</h1>
          <Link to="/" className="text-sm hover:underline">← Hub</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-base leading-relaxed">
        <p>
          <strong>Cubicle Quest</strong> is a quirky brain-game arcade. The names and art riff on office sayings —
          <em> ducks in a row, low-hanging fruit, circle back</em> — but the puzzles underneath are real
          cognitive work. Nothing about your KPIs. Nothing about your inbox.
        </p>
        <ul className="space-y-3">
          <li><strong>Ducks in a Row</strong> — Einstein-style deduction. Constraints, contradictions, satisfying clicks.</li>
          <li><strong>Connect the Dots</strong> — find four hidden groups of four in a 16-tile grid. Decoys are sneaky.</li>
          <li><strong>Circle Back</strong> — sticky-note sequence memory. Forward, reversed, then with a swap.</li>
          <li><strong>Low-Hanging Fruit</strong> — pick the lowest-reachable numbered fruits that satisfy the target.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Rounds are 2–3 minutes. Progress saves locally. Finish all four games in a day to grow your streak.
        </p>
      </main>
    </div>
  );
}
