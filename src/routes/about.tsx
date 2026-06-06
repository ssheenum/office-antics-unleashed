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
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-8">
        <h1 className="font-display text-3xl tracking-tight">About</h1>
        <Link to="/" className="pill-btn text-xs">← Hub</Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-2 text-base leading-relaxed">
        <p>
          <strong>Cubicle Quest</strong> is a small arcade of brain games. The names borrow office sayings —
          <em> ducks in a row, deep dive, low-hanging fruit</em> — but each name is also the mechanic. The
          puzzles underneath are real cognitive work. Nothing about your KPIs. Nothing about your inbox.
        </p>
        <div className="gold-rule" />
        <ul className="space-y-4">
          <li>
            <div className="font-display text-xl" style={{ color: "var(--gold)" }}>Ducks in a Row</div>
            <p className="text-muted-foreground">Live deduction. Drag ducks until every clue stays green for three seconds — but watch out for meeting interrupts that knock one out of line.</p>
          </li>
          <li>
            <div className="font-display text-xl" style={{ color: "var(--gold)" }}>Deep Dive</div>
            <p className="text-muted-foreground">Strata of a report scroll upward. Catch the one matching the brief before it surfaces. Combo grows with depth; a miss sends you back up.</p>
          </li>
          <li>
            <div className="font-display text-xl" style={{ color: "var(--gold)" }}>Low-Hanging Fruit</div>
            <p className="text-muted-foreground">Optimize against a target with the least reach. Running totals update live. Every so often a fruit drops — free to pick for a moment.</p>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Two to three minute rounds. Progress saves locally. Finish all three in a day to grow your streak.
        </p>
      </main>
    </div>
  );
}
