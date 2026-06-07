import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadState, todayKey, GAME_KEYS, type GameState, type GameKey } from "@/lib/storage";
import { getCurrentUser, clearCurrentUser } from "@/lib/session";
import { DucksIcon, DiveIcon, FruitIcon, GrassIcon, FlameIcon, TrophyIcon } from "@/components/art/MinimalIcons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Touch Grass — three tiny brain games" },
      { name: "description", content: "Three quick brain games. Pick a quirky name, build a streak, touch grass." },
      { property: "og:title", content: "Touch Grass" },
      { property: "og:description", content: "Three quick brain games. Pick a quirky name and play daily." },
    ],
  }),
  component: Hub,
});

type Tile = {
  key: GameKey;
  to: string;
  title: string;
  skill: string;
  blurb: string;
  Icon: typeof DucksIcon;
  color: string;       // primary
  colorDeep: string;   // shadow / border
  tint: string;        // background tint
};

const TILES: Tile[] = [
  {
    key: "ducks",
    to: "/play/ducks",
    title: "Ducks in a Row",
    skill: "Memory",
    blurb: "Memorize the lineup, then rebuild it.",
    Icon: DucksIcon,
    color: "#f5b740",
    colorDeep: "#b07a13",
    tint: "#fff5dc",
  },
  {
    key: "deepdive",
    to: "/play/deepdive",
    title: "Deep Dive",
    skill: "Logic",
    blurb: "Read the clues. Narrow the tiles. Tap the one.",
    Icon: DiveIcon,
    color: "#3aa9d8",
    colorDeep: "#1d6b8e",
    tint: "#e2f3fb",
  },
  {
    key: "fruit",
    to: "/play/fruit",
    title: "Low-Hanging Fruit",
    skill: "Reflex",
    blurb: "Slide the basket. Catch what the rule allows.",
    Icon: FruitIcon,
    color: "#e85b6b",
    colorDeep: "#9a2e3b",
    tint: "#ffe7eb",
  },
];

function Hub() {
  const navigate = useNavigate();
  const [state, setState] = useState<GameState | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    setUser(u);
    setState(loadState());
  }, [navigate]);

  if (!state || !user) return <div className="min-h-screen" />;

  const today = todayKey();
  const todaysGames = state.dailyDone.day === today ? state.dailyDone.games : [];
  const isDone = (k: GameKey) => todaysGames.includes(k);
  const totalBest = state.bestScores.ducks + state.bestScores.deepdive + state.bestScores.fruit;

  function signOut() {
    clearCurrentUser();
    navigate({ to: "/login" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* horizon / grass band */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40vh]" style={{
        background: "linear-gradient(to top, #87c95f 0%, #b7df8a 55%, transparent 100%)",
      }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 opacity-40" style={{
        background: "repeating-linear-gradient(90deg, #3a7026 0 3px, transparent 3px 10px)",
      }} />

      {/* sticky top bar */}
      <header className="sticky top-0 z-20 border-b-[1.5px] backdrop-blur" style={{
        background: "color-mix(in oklab, #fdf6e3 92%, white)",
        borderColor: "color-mix(in oklab, #1f2933 10%, transparent)",
      }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "#5b9e3d", boxShadow: "0 2px 0 #3a7026" }}>
              <GrassIcon width={22} height={22} />
            </span>
            <span className="font-display text-lg tracking-tight">Come Touch Grass</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border-[1.5px] bg-white px-3 py-1 text-sm font-semibold sm:inline-flex" style={{ borderColor: "color-mix(in oklab, #1f2933 12%, transparent)" }}>
              <FlameIcon width={16} height={16} style={{ color: "#e85b3a" }} />
              <span className="tabular-nums">{state.streak.count}</span>
              <span className="text-muted-foreground">day</span>
            </span>
            <button onClick={signOut} className="pill-btn text-xs">Sign out</button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-5 pb-24 pt-10">
        {/* greeting */}
        <section className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Hey there,</div>
          <h1 className="mt-2 font-display text-5xl leading-[1.02] tracking-tight md:text-6xl">
            <span style={{ color: "#3a7026" }}>{user}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Three short games. Five minutes. Then back outside.
          </p>
        </section>

        {/* progress strip */}
        <section className="mt-8">
          <div className="glass mx-auto flex max-w-md items-center justify-between gap-3 px-5 py-4">
            <Stat label="Today" value={`${todaysGames.length}/${GAME_KEYS.length}`} />
            <div className="h-8 w-px" style={{ background: "color-mix(in oklab, #1f2933 12%, transparent)" }} />
            <Stat label="Best" value={totalBest.toString()} accent="#3a7026" />
            <div className="h-8 w-px" style={{ background: "color-mix(in oklab, #1f2933 12%, transparent)" }} />
            <Stat label="Streak" value={`${state.streak.count}d`} accent="#e85b3a" />
          </div>
        </section>

        {/* game tiles */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between px-1">
            <h2 className="font-display text-xl tracking-tight">Today's path</h2>
            <span className="text-xs font-semibold text-muted-foreground">Pick one to start</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TILES.map((t) => (
              <GameCard key={t.key} tile={t} best={state.bestScores[t.key]} done={isDone(t.key)} />
            ))}
          </div>
        </section>

        {/* achievements */}
        {state.achievements.length > 0 && (
          <section className="mt-12">
            <div className="mb-3 flex items-center gap-2 px-1">
              <TrophyIcon width={18} height={18} style={{ color: "#b07a13" }} />
              <h2 className="font-display text-base tracking-tight">Stickers</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.achievements.map((a) => (
                <span key={a} className="rounded-full border-[1.5px] bg-white px-3 py-1 text-xs font-semibold" style={{ borderColor: "color-mix(in oklab, #1f2933 12%, transparent)" }}>
                  ★ {a}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          <Link to="/stats" className="hover:text-foreground">Stats</Link>
          <span className="mx-2">·</span>
          <Link to="/about" className="hover:text-foreground">How to play</Link>
          <span className="mx-2">·</span>
          Saved on this device, under <span className="font-semibold">{user}</span>.
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-2xl tabular-nums" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}

function GameCard({ tile, best, done }: { tile: Tile; best: number; done: boolean }) {
  const { Icon } = tile;
  return (
    <Link
      to={tile.to}
      className="group relative block overflow-hidden rounded-3xl border-[2px] bg-white p-5 transition-transform hover:-translate-y-0.5"
      style={{
        borderColor: "color-mix(in oklab, #1f2933 12%, transparent)",
        boxShadow: `0 5px 0 ${tile.colorDeep}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl"
          style={{ background: tile.tint, color: tile.colorDeep }}
        >
          <Icon width={42} height={42} />
        </div>
        {done && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white" style={{ background: "#5b9e3d" }}>
            ✓ Done
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ background: tile.tint, color: tile.colorDeep }}>
          {tile.skill}
        </span>
      </div>
      <h3 className="mt-1.5 font-display text-xl leading-tight tracking-tight">{tile.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tile.blurb}</p>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Best</div>
          <div className="font-display text-lg tabular-nums">{best}</div>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold text-white transition-transform group-hover:translate-x-0.5"
          style={{ background: tile.color, boxShadow: `0 3px 0 ${tile.colorDeep}` }}
        >
          Play
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </span>
      </div>
    </Link>
  );
}
