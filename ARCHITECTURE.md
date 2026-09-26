# BUGBOX — file map

Simple bug life simulator. Plain `<script src>` files, no modules. Everything shares one global scope.
Load order = the order in `index.html`. `main.js` is last and holds every
DOM event binding, so definition files never run DOM code at load time.

## Terms
- One room, one box, one canvas. The global `combatState` decides everything:
  **0** = peaceful box (feeding, mating, dragging), **1** = fight.
  Never say "terrarium" or "arena" for these two states.
- **box** = the canvas and its bugs, in both combat states.
- **barracks** = the screen where the player picks bugs, mode and tier. File `chal.js`, id `s-chal`.

## Routing table — "I want to change X" → open this file, look for this symbol

| Area of the game | File | Symbol |
|---|---|---|
| Layout, screens, buttons, overlays (markup), crash reporter | `index.html` | `#s-terr` `#s-chal` `#s-lab` `#s-shop`, `#terr-bar-row`, `#ov-set` |
| Colours, fonts, sizes, spacing, screen shake | `style.css` | `#toast`, `.shake` |
| Version number, math helpers, sound effects | `core.js` | `GAME_VERSION` (line 1) |
| Tutorial list, achievement list, unlock rules, toasts on unlock | `achievements.js` | `achSt` |
| Starting money, tunables (walk timers, tier prizes), global variables | `state.js` | `bugsOwned`, `combatState`, `WALK_MIN`, `WALK_MAX` |
| Bug object, names, stat bars, max HP | `bug.js` | |
| Ability list, ability rules, bite damage, bite shove, bite prep by agi, inheritance | `abilities.js` | |
| Bug cards (shop/lab/barracks/result), HP bars, kill button, focus line, blocked-flash, toast text | `cards.js` | `makeBugCard`, `drawHpBar`, `inspectLine`, `toast`, `flashBlocked` |
| Screen switching, info overlay tabs, money display | `screens.js` | |
| Bug body shapes, colour palette, walk style (gait) | `morph.js` | `randomMorph`, `setPalette`, `setGait` |
| Drawing one bug, card thumbnails | `drawbug.js` | `drawBugStyled` |
| Box background art | `bg.js` | `drawBg` |
| Obstacle types, shapes and variants (index = kind, `v` = variant) | `obst.js` | `OBST` |
| Box canvas, Science HUD toggles (kept per combat state), obstacle and bug spawning | `terr.js` | `bugsInTerrView`, `sciSt`, `genObstacles`, `spawnTerr` |
| Market screen | `shop.js` | `openShop`, `renderShop` |
| Entity system (rarely touched) | `ecs.js` | `ecsQuery`, `C` |
| Walking, wandering, feeding, collisions, wall hit (slide → pause → turn → pause), stuck manoeuvre, corpse slow-down | `move.js` | `SLIDE_K`, `walkTimer` |
| Mating, eggs, hatching, box capacity | `mate.js` | |
| Breeding lab (sorting, selection, offspring) | `lab.js` | |
| Barracks screen (modes, tiers, team picking) | `chal.js` | |
| Fight AI, targeting, ability firing, target switch to weakest attacker, panic burst | `combatai.js` | `panicAll` |
| What is drawn each frame, bottom info line | `render.js` | |
| Hit-testing under the finger, dragging, obstacle rotation by circling | `input.js` | `nearest`, `obstacleAt`, `draggableAt`, `dragStart`, `dragMove`, `endDrag` |
| All DOM `onclick` bindings, triple-tap panic, focus on corpses | `main.js` | `tapT` |
| Simulation loop, speed | `loop.js` | `tick(dt, fight)` = one simulation step |
| Enemy generation, fight start (salute toast + freeze), result screen, fight-end and stalemate check | `fight.js` | `checkFightEnd` |
| Bug designer overlay | `dz.js` | |
| Info / Morphology / Abilities texts | `wiki.js` | |
| Records screen | `records.js` | `bugbox_records` |

## Naming rules
- `SCREAMING_SNAKE_CASE` — constants that never change.
- `camelCase` — variables and functions.
- **stats** = a single bug's `con str agi int per` and HP. Nothing else.
  Cross-game totals are **records**. One game's unlocks are **achievements**.
- ECS components: `bug pos vel walk wall team combat food obstacle`,
  read with `C.pos.get(entity)`, listed with `ecsQuery("bug","pos")`.

## Running it
Open `index.html`. All paths are relative, so it works from a local folder or from GitHub Pages with no build step. The `index.html` contains an on-screen crash reporter (red bar at the bottom). It prints missing files and JS errors (Android has no console).

## Workflow

**Repo**
`https://github.com/michal-zak-tiscali-cz/bugBox`
Live: `https://michal-zak-tiscali-cz.github.io/bugBox/`

The user works in one of two modes. Detect which one you are in, then follow only that mode's delivery rules. Everything below `Work rules` applies to both.

### Mode A — Claude chat
You are in mode A when you have no write access to the repo.
1. User analyzes and tests the live game, errors, goals.
2. User instructs Claude to change or implement stuff.
3. Claude clones the repo itself.
4. Claude delivers the changed files as downloads.
5. User saves them on his phone over his old set. Repeat.

**Mode A delivery rules**
- Never deliver a `.zip`.
- Deliver **individual files**, one download link each.
- Deliver **only the files that changed** — not the whole project.
- Committing is the user's choice. He commits straight to `main`, no branches.
- Every delivered file must be **cumulative**: original + all edits made earlier
  in this session. He overwrites files, so a lost earlier edit is destroyed.
- On request, build a single-file test build `bugbox-vXX.X.html` (all `.js` and
  `.css` inlined into `index.html`) so he can run the game offline. Build it with
  a script, never print it. ~600 tokens. Test copy, not for the repo.

**Mode A session state**
- Every new chat starts with an empty container. Clone `main` at once, without asking, and treat it as current.
- If `GAME_VERSION` in the clone differs from the version the user names, say so in one line, then work on the clone.
- If the clone vanishes mid-session, say so, clone again and redo this session's edits.
- If cloning fails, ask him to upload only the files the task needs.

### Mode B — Claude Code
You are in mode B when the repo is checked out and you can commit.
1. User analyzes and tests the live game, errors, goals.
2. User submits a task from the Code tab. `CLAUDE.md` points here.
3. Claude edits the files in place and pushes a branch. No download links, no file contents in chat.
4. User opens the diff, creates the PR, merges it. GitHub Pages redeploys from `main`.
5. Repeat.

**Mode B delivery rules**
- Commit **only the files that changed**.
- One branch per task. Do not commit to `main` directly.
- Commit message = one line, what changed, no version number.

### Work rules
- no dead code, no redundant code, no redundant names, less characters, smaller file size
- saving tokens! reading only parts that are necessary, not the whole repo
- Never deliver or edit `ARCHITECTURE.md` on your own. Keep a running list of
  needed routing-table changes in chat instead. Touch the file only when the user
  asks for it, then deliver it alone.
- Always bump the version by +1 minor: `GAME_VERSION` in `core.js`, line 1.
  Code changes only; editing this file alone does not bump it.

### Saved data
- `bugbox_records` in localStorage = cross-game **records** (games, kills, fights,
  wins, best bug count, best stat sum, top killer, longest dynasty). Persists. Reset button only.
- Tutorial and achievements (`prog`) are **one game each**. Never persist them.
- Bugs, money and eggs are never saved. Reloading the page starts a new game.

### User info
- Android phone only. No desktop, no build tools, no terminal.
- **Not a programmer.** Never ask to read or edit code. LLM is the only one who looks at the code. Do not explain code, do not paste snippets in chat.
- Has Asperger syndrome: answers must be terse, literal, bullet-pointed, exact. No vague qualifiers. "I don't know" is a valid and preferred answer.

### Token budget
Context is expensive and sessions run all day. Therefore:
- Keep the codebase **small**. Prefer editing existing functions over adding new
  files. Delete dead code when spotted.
- Never print code, diffs, reasoning, or intermediate steps into the chat.
- Chat output per code task = 2 short summary sentences + 1 improvement idea.
- `style.css` is one long minified line — never `grep -n` it. The `.js` files are
  normal multi-line files; `grep -n` is safe there.
