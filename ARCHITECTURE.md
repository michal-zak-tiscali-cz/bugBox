# BUGBOX — file map

Simple bug life simulator. Plain `<script src>` files, no modules. Everything shares one global scope.
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
| Toast text and its position | `cards.js` -> `toast()`; style `style.css` `#toast` |
| Morph-from-stats sandbox (standalone page, not loaded by the game) | `designer-lab.html` |

## Naming rules
- `SCREAMING_SNAKE_CASE` — constants that never change.
- `camelCase` — variables and functions.
- **stats** = a single bug's `con str agi int per` and HP. Nothing else.
  Cross-game totals are **records**. One game's unlocks are **achievements**.
- ECS components: `bug pos vel think wall team combat food obstacle`,
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
- Committing to the repo is optional and the user's choice. Never assume the
  repo is current. He commits straight to `main`, no branches.
- Every delivered file must be **cumulative**: original + all edits made earlier
  in this session. He overwrites files, so a lost earlier edit is destroyed.
- On request, build a single-file test build `bugbox-vXX.X.html` (all `.js` and
  `.css` inlined into `index.html`) so he can run the game offline. Build it with
  a script, never print it. ~600 tokens. Test copy, not for the repo.

**Mode A session state**
- The working copy lives in the container and can be wiped without warning.
- **Before starting any task**, check the working copy exists (`ls` the clone).
- If it is gone, say so at once and stop. Ask him to commit his phone files
  (Chrome, github.com -> Add file -> Upload files -> Commit changes; the GitHub
  Android app cannot upload). He replies when done, then clone again.
- Fallback if he cannot commit: he uploads files into the chat, ~35k tokens.

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
- Files here are minified — one long line each. Never `grep -n` them, it dumps
  the whole line. Use `grep -o`, `sed -n` with a line range, or a python script.

## Quick lookups
| Thing | Where |
|---|---|
| Version number | `core.js` line 1, `GAME_VERSION` |
| Bottom bar buttons (terrarium) | `index.html`, `<div id="terr-bar-row">` |
| Bottom info line text (focus) | `cards.js` → `inspectLine()` |
| All DOM `onclick` bindings | `main.js` |
