## Cubicle Quest — brain games wrapped in office-jargon flavor

The mechanics are real cognitive puzzles. The office sayings are just the *names, art, and copy* — never the subject of the puzzle itself.

### Visual direction
- Paper-cream background, ink-black type, highlighter-yellow accent, toner-cyan secondary, stamp-red for streaks.
- Display font: Archivo Black. Body: Hanken Grotesk. All tokens as `oklch` in `src/styles.css`.
- Micro-interactions: sticky-note flips, rubber-stamp thuds. Restrained.

### The four games (2–3 min rounds)

1. **Ducks in a Row** — *Logic / deduction*
   A row of 5–7 rubber ducks must satisfy written constraints ("the striped duck is not adjacent to the one wearing a tie", "the manager sits left of the intern"). Einstein-puzzle style. Drag ducks; live constraint checker; solve before the timer runs out. Difficulty scales by duck count and constraint density.

2. **Connect the Dots** — *Pattern recognition*
   16-tile grid of words/icons. Find 4 hidden groups of 4, Connections-style. Decoys deliberately overlap categories. 4 mistakes = round ends. Solve all four groups for a perfect.

3. **Circle Back** — *Memory / sequence*
   A 3×3 grid of sticky notes lights up in sequence with symbols. Round 1: replay forward. Round 2: replay reversed. Round 3: replay with one item swapped. Length grows each round, Simon-style with twists.

4. **Low-Hanging Fruit** — *Spatial-math / optimization*
   A tree fills with numbered fruits at different heights. Target shown ("sum to 17", "product divisible by 6", "three primes"). Pick the *lowest-reachable* valid subset before the timer ends. Higher fruits cost more "reach points" — optimization, not just math.

Each game: 2–3 minute round, results screen with score breakdown + XP awarded to its skill ring.

### Hub & meta-layer
- Landing page: 4 manila-folder tiles on a desk, each shows best score + skill it trains.
- Skill rings: Logic, Pattern, Memory, Spatial-Math.
- **Daily Standup**: one curated round of each → streak +1 (sticky-note stamp).
- Quirky achievement names ("Synergy Slayer", "Inbox Zero", "Touched Grass") — flavor only, no office-content puzzles.

### Routes (TanStack Start)
```
src/routes/
  __root.tsx
  index.tsx              # hub
  play.ducks.tsx
  play.connect.tsx
  play.circle.tsx
  play.fruit.tsx
  stats.tsx
  about.tsx
```
Each route has its own `head()` meta.

### Modules
- `src/lib/puzzles/ducks.ts` — constraint generator + verifier
- `src/lib/puzzles/connect.ts` — curated 16-tile boards with 4 groups (generic categories: animals, weather, music, sports, etc. — not office)
- `src/lib/puzzles/circle.ts` — sequence generator + transform rules
- `src/lib/puzzles/fruit.ts` — tree generator + target/feasibility checker
- `src/lib/storage.ts` — typed localStorage (`cubicle-quest:v1`) for bestScores, skillXp, streak, achievements
- `src/lib/scoring.ts` — shared scoring + XP

### Components
`GameShell`, `Timer`, `ScoreBadge`, `ResultCard`, `FolderTile`, `StreakStamp`, `SkillRing` + shadcn primitives.

### Out of scope (v1)
Accounts, cloud sync, leaderboards, multiplayer, audio, PWA. All layerable later.

### Success check
All 4 games playable end-to-end with results + XP. Hub reflects real localStorage. Puzzle *content* is neutral — only names/art/copy reference office life.