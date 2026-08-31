# BUGBOX v61.5 — file map

**FLAT LAYOUT — every file sits in ONE folder next to `index.html`.**
There is no `` subfolder any more (removed in v61.5). Never re-introduce it
and never write `src="js/..."`. The user is on a phone; one folder means every
delivered file is dropped in the same place with no sorting.

Plain `<script src>` files, no modules. Everything shares one global scope.
Load order = the order in `index.html`. `main.js` is last and holds every
DOM event binding, so definition files never run DOM code at load time.

## Routing table — "I want to change X" → open these files

| Area of the game | File(s) |
|---|---|
| Layout, screens, buttons, overlays (markup) | `index.html` |
| Colours, fonts, sizes, spacing | `style.css` |
| Version number, math helpers, sound effects | `core.js` |
| Tutorial list, achievement list, unlock rules, toasts on unlock | `achievements.js` |
| Starting money, tunables (think timers, tier prizes), global variables | `state.js` |
| Bug object, names, stat bars, max HP | `bug.js` |
| Ability list, ability rules, bite damage, inheritance | `abilities.js` |
| Bug cards (shop/lab/arena/result), HP bars, kill button, focus line | `cards.js` |
| Screen switching, info overlay tabs, money display | `screens.js` |
| Bug body shapes, drawing a bug | `morph.js`, `drawbug.js` |
| Market screen | `shop.js` |
| Entity system (rarely touched) | `ecs.js` |
| Terrarium canvas, Science HUD, obstacles, spawning | `terrarium.js` |
| Walking, wandering, feeding, collisions, wall bounce | `move.js` |
| Mating, eggs, hatching, terrarium capacity | `mate.js` |
| Breeding lab (sorting, selection, offspring) | `breed.js` |
| Arena screen (modes, tiers, team picking) | `arena.js` |
| Fight AI, targeting, ability firing | `combat.js` |
| What is drawn each frame, bottom info line | `render.js` |
| Tapping and dragging in the terrarium | `input.js`, `main.js` |
| Simulation loop, speed | `loop.js`, `speed.js` |
| Enemy generation, fight start, result screen | `fight.js` |
| Bug designer overlay | `designer.js` |
| Info / Morphology / Abilities texts | `wiki.js` |
| Records screen | `records.js` |

## Naming rules
- `SCREAMING_SNAKE_CASE` — constants that never change.
- `camelCase` — variables and functions.
- ECS components: `bug pos vel think wall team combat food obstacle`,
  read with `C.pos.get(entity)`, listed with `ecsQuery("bug","pos")`.

## Running it
Open `index.html`. All paths are relative, so it works from a local folder
or from GitHub Pages with no build step.

## Working agreement — read this first, every session

**How the user works (do not assume otherwise):**
1. Downloads the changed files to a folder on his Android phone.
2. Tests the game there, offline, from that folder.
3. Only when it works does he push it to GitHub.
So the GitHub repo is usually **one or more versions behind** what he is testing.
A clean repo does NOT mean the user did nothing wrong — it means he has not
pushed yet. Never tell him to "check the repo" to debug his local copy.

**Debugging his local copy:** `index.html` contains an on-screen crash reporter
(red bar at the bottom). It prints missing files and JS errors. Ask him to read
that bar instead of asking for a console log — Android has no console.

**Repo (Claude pulls the code itself, user never uploads it):**
`https://github.com/michal-zak-tiscali-cz/bugBox`
Live: `https://michal-zak-tiscali-cz.github.io/bugBox/`
User uploads only this `ARCHITECTURE.md`. Claude clones the repo.

**Delivery rules:**
- NEVER deliver a `.zip`. The user is on an **Android phone** and cannot open archives.
- Deliver **individual files**, one download link each, ready to drop into the repo.
- Deliver **only the files that changed** — not the whole project.
- Always bump the version by +1 minor: `GAME_VERSION` in `core.js`, line 1.

**About the user:**
- Android phone only. No desktop, no build tools, no terminal.
- **Not a programmer.** Never asks to read or edit code. Claude is the only one
  who looks at the code. Do not explain code, do not paste snippets in chat.
- Has Asperger syndrome: answers must be terse, literal, bullet-pointed, exact.
  No vague qualifiers. "I don't know" is a valid and preferred answer.

**Token budget:**
Context is expensive and sessions run all day. Therefore:
- Keep the codebase **small**. Prefer editing existing functions over adding new
  files. Delete dead code when spotted.
- Never print code, diffs, reasoning, or intermediate steps into the chat.
- Chat output per code task = 2 short summary sentences + 1 improvement idea.
- Read only the files the routing table points at, not the whole repo.

## Quick lookups
| Thing | Where |
|---|---|
| Version number | `core.js` line 1, `GAME_VERSION` |
| Bottom bar buttons (terrarium) | `index.html`, `<div id="terr-bar-row">` |
| Bottom info line text (focus) | `cards.js` → `inspectLine()` |
| All DOM `onclick` bindings | `main.js` |
