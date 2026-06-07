
## Scope

Keep Low-Hanging Fruit untouched. Replace the gameplay in `src/routes/play.ducks.tsx` and `src/routes/play.deepdive.tsx` (and their puzzle modules in `src/lib/puzzles/`) with two new mechanics. Reuse the existing Sunny Paper / Pond & Garden visual system (GameShell, GameBanner, ResultCard, glass/pill-btn, koi/duck SVGs already in `Marks.tsx`).

---

## Game 1 — Ducks in a Row (Memory Row)

**Brain exercise:** memory + sequencing + pattern recognition.

**Flow per round:**
1. **Show phase** — a row of N ducks slides onto lily pads at the top of the pond. Each duck has unique traits (color, size, hat, mood, direction, held object). Visible for a short window (e.g. 2.5s for N=3, scaling up).
2. **Scatter phase** — ducks fly to random positions around the pond (absolutely positioned, gently bobbing).
3. **Recall phase** — N empty lily pads at top. Player drags ducks back into the original order. A "Submit" pill button checks the row. Wrong slots shake; correct ones lock with a gold ring.

**Round progression (gradually harder):**
- R1 *Simple memory* — 3 ducks, only color differs.
- R2 *Trait memory* — 4 ducks, mix of hat/mood/object.
- R3 *Pattern completion* — 5 ducks form a visible pattern (small/big/small/big/?), one slot is blank; player picks the duck that continues the pattern from the scattered pool. Patterns: size alternation, color cycle (Y→B→P→Y→B→?), hat-on/off alternation, direction flip.
- R4 *Hidden rule* — Game shows one example row sorted by a hidden rule (e.g. beak size asc, hat height desc, mood spectrum sleepy→angry). Player must arrange a fresh set of ducks by the same rule. After submit, the rule is revealed.

5–6 rounds total, difficulty curve R1→R4→R4-harder. Score: time bonus + accuracy bonus, combo for back-to-back perfect rounds. Lives: 3 strikes ends the run early. Reuse existing `recordRound("ducks", …)` and `xpFromScore`.

**Traits & art:**
- Color: 6 hex set from the existing duck palette.
- Size: small (0.75×) / large (1.15×).
- Hat: none / beret / party / straw.
- Mood: happy / sleepy / angry / surprised (eye + brow tweaks).
- Direction: facing left / right (mirror).
- Object held: none / flower / fish / umbrella.

All drawn inline as SVG variants of a single `<Duckie traits={…} size={…}/>` component (no new image files; reuse line-art style from `Marks.tsx`). Drag uses HTML5 DnD already established in the previous ducks file.

---

## Game 2 — Deep Dive (Treasure Detective)

**Brain exercise:** deduction + spatial reasoning + visual search.

**Flow per round:**
1. A 5×5 underwater grid renders with scattered props: red coral, blue coral, jellyfish, turtle, anchor, seaweed, bubbles, shell. One hidden tile holds the pearl/chest.
2. A small "Clue Log" lists 2–5 clues. Player taps the tile they believe holds the treasure. Correct → splash + reveal; wrong → strike + a brief shake, and the clue most-violated highlights.
3. Diver mascot (existing `DiverMark`) glides toward the tapped tile.

**Clue types (composable):**
- Positional: above / below / left of / right of <prop>.
- Adjacency: next to / not next to <prop>; between A and B (orthogonal line).
- Distance: within 1 tile of <prop>; exactly 2 tiles from <prop>.
- Quantity: near exactly N bubbles (4-neighborhood).
- Negative: not touching seaweed.

**Round progression:**
- R1–R2 *Visual* — 1–2 clues, mostly direct ("below the red coral"); larger props, fewer distractors.
- R3–R4 *Mixed* — 3 clues combining position + adjacency.
- R5+ *Logic* — 4–5 clues, includes between/distance/negative; props arranged so only one tile satisfies all clues (generator verifies uniqueness by brute force over 25 tiles).

**Bonus mechanic — vanishing bubbles:** 1–2 "hint bubbles" appear for ~1.8s at start of harder rounds showing a partial clue (e.g. flashes the row or column). After they pop, the player must recall.

**Scoring:** base per round + speed bonus + (clues_unused) bonus if solved on first tap. Strikes: 3 wrong taps total ends the run.

**Puzzle generator (`src/lib/puzzles/deepdive.ts` rewrite):**
- Place props randomly on a 5×5; pick a candidate treasure tile; derive true clues about it; filter to a clue set that uniquely identifies the tile (re-roll until satisfied or fall back to adding a positional clue). Difficulty controls clue count and allowed clue kinds.

**Art:** all inline SVG tiles in Sunny Paper palette (sand background, sky/lagoon gradient overlay, gold outlines), consistent with current koi style. No new image assets.

---

## Files

- Rewrite `src/lib/puzzles/ducks.ts` — new trait model + round generators (simple, trait, pattern, hidden-rule).
- Rewrite `src/lib/puzzles/deepdive.ts` — grid + clue generator with uniqueness check.
- Rewrite `src/routes/play.ducks.tsx` — show/scatter/recall phases, drag-to-pad, round runner, lives, scoring.
- Rewrite `src/routes/play.deepdive.tsx` — grid, clue log, vanishing-bubble hints, tap-to-guess, diver animation.
- New `src/components/art/Duckie.tsx` — parameterized duck SVG (traits → variants).
- New `src/components/art/PondProps.tsx` — coral/jellyfish/turtle/anchor/seaweed/bubble/shell tiles.
- Touch `src/routes/index.tsx` blurbs for the two games to match new mechanics.
- Touch `src/lib/storage.ts` only if achievement copy needs to match (e.g. "Memory Maestro", "Pearl Hunter").

No changes to Low-Hanging Fruit, GameShell, ResultCard, Timer, styles.css, or the hub layout beyond blurb text.

## Out of scope

- New backend, persistence beyond existing localStorage scores.
- New fonts/colors.
- Sound.

