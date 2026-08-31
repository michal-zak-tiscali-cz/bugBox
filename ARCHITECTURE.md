# BUGBOX v61.2 — file map

Plain `<script src>` files, no modules. Everything shares one global scope.
Load order = the order in `index.html`. `main.js` is last and holds every
DOM event binding, so definition files never run DOM code at load time.

## Routing table — "I want to change X" → open these files

| Area of the game | File(s) |
|---|---|
| Layout, screens, buttons, overlays (markup) | `index.html` |
| Colours, fonts, sizes, spacing | `style.css` |
| Version number, math helpers, sound effects | `js/core.js` |
| Tutorial list, achievement list, unlock rules, toasts on unlock | `js/achievements.js` |
| Starting money, tunables (think timers, tier prizes), global variables | `js/state.js` |
| Bug object, names, stat bars, max HP | `js/bug.js` |
| Ability list, ability rules, bite damage, inheritance | `js/abilities.js` |
| Bug cards (shop/lab/arena/result), HP bars, kill button, focus line | `js/cards.js` |
| Screen switching, info overlay tabs, money display | `js/screens.js` |
| Bug body shapes, drawing a bug | `js/morph.js`, `js/drawbug.js` |
| Market screen | `js/shop.js` |
| Entity system (rarely touched) | `js/ecs.js` |
| Terrarium canvas, Science HUD, obstacles, spawning | `js/terrarium.js` |
| Walking, wandering, feeding, collisions, wall bounce | `js/move.js` |
| Mating, eggs, hatching, terrarium capacity | `js/mate.js` |
| Breeding lab (sorting, selection, offspring) | `js/breed.js` |
| Arena screen (modes, tiers, team picking) | `js/arena.js` |
| Fight AI, targeting, ability firing | `js/combat.js` |
| What is drawn each frame, bottom info line | `js/render.js` |
| Tapping and dragging in the terrarium | `js/input.js`, `js/main.js` |
| Simulation loop, speed | `js/loop.js`, `js/speed.js` |
| Enemy generation, fight start, result screen | `js/fight.js` |
| Bug designer overlay | `js/designer.js` |
| Info / Morphology / Abilities texts | `js/wiki.js` |
| Records screen | `js/records.js` |

## Naming rules
- `SCREAMING_SNAKE_CASE` — constants that never change.
- `camelCase` — variables and functions.
- ECS components: `bug pos vel think wall team combat food obstacle`,
  read with `C.pos.get(entity)`, listed with `ecsQuery("bug","pos")`.

## Running it
Open `index.html`. All paths are relative, so it works from a local folder
or from GitHub Pages with no build step.
