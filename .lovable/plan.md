## Cubicle Quest v2 — Editorial Glass, 3 interactive games

Trim to three games, each with a corporate-jargon name that *is* the mechanic. Replace the flat cartoon look with a refined dark editorial aesthetic (Editorial Glass), slightly playful (vibe 4/5).

### 1. The three games — jargon as mechanic

**Ducks in a Row** — *Logic, live arrangement*
A row of 5–8 ducks. Drag to swap; constraints (chips above the row) light **green when satisfied, red when violated** in real time. Twist: every ~8s, a "meeting interrupt" nudges one duck out of order — you have to keep recovering. Rounds end when all constraints stay green for 3s straight, or timer expires. Score = constraints solved + time bonus − interrupts suffered.

**Deep Dive** — *Reaction + working memory*
A vertical "stack of strata" scrolls slowly upward (think drilling through layers of a report). A clue panel at top updates every ~2s ("the layer tagged Q3", "the one with a chart icon", "the third blue one from the top"). Click the matching stratum before it scrolls off. Combo multiplier grows with depth; misclicks rocket you back to the surface. Live, continuous, not turn-based.

**Low-Hanging Fruit** — *Spatial-math optimization, live*
A tree with numbered fruits at varying heights. Target shown ("sum to 23", "three primes", "product divisible by 12"). Each fruit has a **reach cost** = height. Tap to pick/unpick — running sum + total reach + a "you'd score X" preview update live. Fruits gently sway; every ~6s a random fruit drops (free pick, height cost = 0 for 2s). Hit "Lock in" to submit, or auto-submit on timeout.

Each round: 90–150s. Result card shows score, time, XP awarded to its skill ring (Logic / Memory / Spatial-Math). Remove Pattern from skill rings.

### 2. Aesthetic — Editorial Glass

- **Palette** (oklch tokens in `src/styles.css`):
  - `--bg` near-black `#0f1115`, `--surface` `#1b1f27`, `--text` cream `#e6e1d6`, `--muted` warm gray, `--accent` gold `#c9a84c`, `--danger` muted coral, `--ok` muted teal.
- **Type**: Display = **Fraunces** (or Instrument Serif) for headings and numerals; Body = **Inter** for UI. Loaded via `<link>` in `__root.tsx`, declared in `@theme` (no CSS `@import` of URLs — see Tailwind v4 gotchas).
- **Surfaces**: glass cards — `bg-white/5 backdrop-blur-xl border-white/10`, soft inner highlight, subtle SVG grain overlay at ~4% opacity. Gold hairline dividers. Generous whitespace.
- **Motion**: restrained — ducks ease into slots, strata scroll with parallax, fruit sway via CSS keyframes. No bouncy cartoon wiggles.
- **Illustration**: replace the 5 PNG cartoons with **gold line-art SVGs** drawn inline (single duck silhouette, diver helmet, branch with fruit, plus a small monogram mascot for the hub). Vector, themable, sharp at any size.
- **Components**: chunky "duo-btn" → refined pill button with gold border + soft glow on hover. Tiles become glass panels with serif title + thin gold rule.

### 3. Scope of file changes

Frontend / presentation only.

**Edit**
- `src/styles.css` — new palette, fonts, glass + grain utilities; drop pastel `.accent-*` and `.duo-btn` styling; rewrite `.tile-card` for glass.
- `src/routes/__root.tsx` — Fraunces + Inter `<link>` tags.
- `src/routes/index.tsx` — 3 tiles (drop Circle Back), refined hero, glass treatment.
- `src/components/hub/FolderTile.tsx` — glass variant, inline SVG slot instead of `<img>`.
- `src/components/hub/SkillRing.tsx` — drop Pattern; restyle.
- `src/components/game/GameBanner.tsx` — glass header with serif tagline + inline SVG.
- `src/components/game/GameShell.tsx`, `Timer.tsx`, `ResultCard.tsx` — restyle to new tokens.
- `src/routes/play.ducks.tsx` — add live constraint chips + "interrupt" timer + continuous-solve win condition.
- `src/routes/play.fruit.tsx` — add live running totals, sway, occasional free-drop event.
- `src/routes/stats.tsx`, `about.tsx` — restyle, remove Circle Back / Pattern references.
- `src/lib/storage.ts` — remove `circle` from bestScores/dailyDone, remove `pattern` xp (or keep field hidden for back-compat — TBD; simplest: migrate on load).

**Create**
- `src/routes/play.deepdive.tsx` — new Deep Dive game.
- `src/lib/puzzles/deepdive.ts` — strata + clue generator.
- `src/components/art/` — inline SVG components: `DuckMark`, `DiverMark`, `BranchMark`, `Monogram`, `Grain`.

**Delete**
- `src/routes/play.circle.tsx`, `src/routes/play.connect.tsx`
- `src/lib/puzzles/circle.ts`, `src/lib/puzzles/connect.ts`
- `src/assets/m-*.png` (all 5 cartoon mascots), `src/assets/*-hero.png` if still present.

### 4. Technical notes

- Tailwind v4: tokens in `@theme` inside `src/styles.css`; load Google Fonts via `<link>` in `__root.tsx`, never `@import` a URL.
- Keep all state in `localStorage` via existing `src/lib/storage.ts` (with a small migration to drop `circle`/`connect` and `pattern`).
- No backend, no new deps — Fraunces/Inter from Google Fonts CDN.

### 5. Out of scope

New games beyond the three above; sound; accounts; multiplayer; rewriting routing.

### 6. Success check

Hub shows 3 glass tiles + monogram, gold-on-dark editorial feel, serif headings. Each game is continuously interactive (live feedback, not a single submit). Old Circle Back / Connect routes and PNG mascots are gone. Build is clean.
