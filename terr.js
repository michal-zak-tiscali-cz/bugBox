const boxCv = $("terr-canvas"),
boxCx = boxCv.getContext("2d");
let simFrame = null,
inspected = null,
simSpd = 1,
combatState = !1,
groundMarks = [],
fightNum = 0,
fightDone = !1,
resultTimer = null,
dmgPops = [],
enemies = [],
savedWorld = null;
const SCI_KEYS = [
["vis", "VIS", "vision cone + peripheral circle", 1, 0],
["vis1", "VIS 1", "vision range of your bugs", 0, 1],
["vis2", "VIS 2", "vision range of enemy bugs", 0, 1],
["visr", "VIS R", "ability range rings (mark, cry, loud)", 0, 1],
["abi", "ABI", "ability cooldown readout", 1],
["nam", "NAME", "bug names", 1],
["hp", "HP", "HP bars", 1],
["zone", "ZONE", "flank sectors + engage ring", 0],
["bite", "BITE", "bite wind-up bar", 1],
["dmg", "DMG", "floating damage numbers", 0],
["rnd", "RND", "combat randomness (off = repeatable fight)", 0],
["col", "COL", "team colours instead of bug hue", 0]
];
const sciShown = () => SCI_KEYS.filter(([, , , a, c]) => combatState ? c !== 0 : a);
const VIZ_OFF = { zone: 0, vis: 0, vis1: 0, vis2: 0, visr: 1, bite: 1, dmg: 1, abi: 0, rnd: 1, nam: 1, hp: 1, col: 0 };
let scienceOn = !1;
const sciNew = () => SCI_KEYS.reduce((o, [k]) => (o[k] = 0, o), {}),
sciSt = [sciNew(), sciNew()],
sciCur = () => sciSt[combatState ? 1 : 0];
const FOW_HIDE = "zone visr bite dmg abi nam hp col vis vis1 vis2".split(" ");
const sci = k => fow && FOW_HIDE.includes(k) ? 0 : scienceOn ? sciCur()[k] : VIZ_OFF[k];
function setScience(on) {
scienceOn = !!on, on && achieve("science"), syncSciHud()
}
function toggleSci(k) { sciCur()[k] = sciCur()[k] ? 0 : 1, syncSciHud() }
const allSci = () => sciShown().every(([k]) => sciCur()[k]);
function toggleSciAll() {
const v = allSci() ? 0 : 1;
sciShown().forEach(([k]) => sciCur()[k] = v), syncSciHud()
}
const sciBtn = (k, lbl, tip, on) =>
`<button title="${tip}" onclick="${k?`toggleSci('${k}')`:"toggleSciAll()"}" style="font:8px 'Courier New';padding:2px 4px;cursor:pointer;border:1px solid #2a2a4a;background:${on?"#2b4":"#0a0a12"};color:${on?"#031":"#9ab"};">${lbl}</button>`;
function syncSciHud() {
const el = $("hud-sci");
if (!el) return;
const show = scienceOn && !(combatState && fightDone);
el.style.display = show ? "flex" : "none";
if (!show) return;
el.innerHTML = sciBtn(null, "ALL", "turn every toggle below on or off", allSci()) +
sciShown().map(([k, lbl, tip]) => sciBtn(k, lbl, tip, sciCur()[k])).join("")
}
let hudWas = null;
const HUD_FIGHT_ONLY = ["bt-leave", "bt-pause"],
HUD_BOX_ONLY = ["bt-lab", "bt-chal", "bt-terr-shop"];
function hudCombat() { return combatState }
function syncHud(force) {
const c = hudCombat();
if (c === hudWas && !force) return;
hudWas = c;
HUD_FIGHT_ONLY.forEach(id => $(id).style.display = c ? "" : "none");
HUD_BOX_ONLY.forEach(id => $(id).style.display = c ? "none" : "");
$("terr-title").style.color = c ? "#fa4" : "#4f8";
boxCv.style.borderColor = c ? "#fa4" : "#4cf";
syncSciHud()
}
function canDrag(kind) { return !hudCombat() }
const MAX_FOOD = 30;
function canPlaceFood() { return !hudCombat() && ecsQuery("food").length < MAX_FOOD }
function spawnDmgPop(x, y, amount, isMiss, team) { dmgPops.push({ x, y, amount, isMiss, team: team || 0, t: 1 }) }
function openTerr() {
simLastT = 0, updateMoney(), achOwn(0), resizeBoxCV(), showScreen("s-terr")
}
function startSimLoop() {
simFrame && cancelAnimationFrame(simFrame), simLastT = 0, tickDebt = 0, simFrame = requestAnimationFrame(simLoop)
}
function syncSimLoop() {
$("s-terr").classList.contains("active") ? simFrame || startSimLoop() : stopSimLoop()
}
function stopSimLoop() {
simFrame && cancelAnimationFrame(simFrame), simFrame = null
}
let boxLW = 360,
boxLH = 300;
function resizeBoxCV() {
const dpr = window.devicePixelRatio || 1,
rect = boxCv.getBoundingClientRect();
boxLW = rect.width > 0 ? rect.width : boxCv.offsetWidth || 360, boxLH = rect.height > 0 ? rect.height : boxCv.offsetHeight || 300, boxCv.width = floor(boxLW * dpr), boxCv.height = floor(boxLH * dpr), boxCx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
function bugsInTerrView() {
return ecsQuery("bug", "pos").map(e => {
const b = C.bug.get(e),
p = C.pos.get(e),
tm = C.team.get(e) || {
team: -1
},
cb = C.combat.get(e) || {};
return {
eid: e,
b: b,
x: p.x,
y: p.y,
dir: p.dir,
team: tm.team,
dead: cb.dead || !1,
curHp: cb.curHp,
maxHp: cb.maxHp,
killsThis: cb.killsThis || 0
}
})
}
function genObstacles(inCombat) {
const lw = boxLW, lh = boxLH, kinds = ["rock", "rock", "leaf"], n = 3 + ri(3), placed = [];
for (let i = 0; i < n; i++) {
const r = 12 + ri(10);
for (let a = 0; a < 30; a++) {
const x = 40 + random() * (lw - 80), y = 40 + random() * (lh - 80);
if (placed.some(o => hypot(o.x - x, o.y - y) < o.r + r + 26)) continue;
if (inCombat && (abs(x - .18 * lw) < r + 26 || abs(x - .82 * lw) < r + 26)) continue;
placed.push({ x, y, r });
ecsSpawn({ obstacle: { r, kind: kinds[ri(kinds.length)], rot: random() * 6.28 }, pos: { x, y, dir: 0 } });
break
}
}
}
function bugEntity(b, x, y, dir, tm) {
combatState && (b.mood = "seeking");
return {
bug: b,
pos: { x: x, y: y, dir: dir },
vel: { wanderAngle: dir, angVel: 0 },
think: { paused: !1, pauseTimer: 0, thinkTimer: THINK_MIN + THINK_SPAN * random(), scanRemain: 0, seekX: null, seekY: null },
wall: { phase: null, targetAngle: 0 },
team: { team: tm }
}
}
const eachObstacle = fn => ecsQuery("obstacle", "pos").map(e => fn(C.obstacle.get(e), C.pos.get(e), e));
function snapObstacles() {
return eachObstacle((o, p) => ({ r: o.r, kind: o.kind, rot: o.rot, x: p.x, y: p.y }))
}
function snapFood() {
return ecsQuery("food", "pos").map(e => { const p = C.pos.get(e); return { x: p.x, y: p.y } })
}
function restoreTerrWorld() {
if (!savedWorld) return;
ecsQuery("obstacle").forEach(e => ecsKill(e));
ecsQuery("food").forEach(e => ecsKill(e));
savedWorld.obs.forEach(o => ecsSpawn({ obstacle: { r: o.r, kind: o.kind, rot: o.rot }, pos: { x: o.x, y: o.y, dir: 0 } }));
savedWorld.food.forEach(f => ecsSpawn({ food: {}, pos: { x: f.x, y: f.y, dir: 0 } }));
savedWorld = null
}
function spawnTerr() {
if (combatState) {
savedWorld = savedWorld || { obs: snapObstacles(), food: snapFood() };
ecsClear(), inspected = null, mates = [], scraps = [], mateTouch = new Set();
genObstacles(!0)
} else {
restoreTerrWorld();
ecsQuery("obstacle").length || genObstacles(!1)
}
const lw = boxLW,
lh = boxLH;
if (!combatState) {
const have = new Map();
ecsQuery("bug").forEach(e => {
const b = C.bug.get(e);
bugsOwned.includes(b) ? have.set(b, e) : ecsKill(e)
});
bugsOwned.forEach(b => {
if (have.has(b)) return;
const dir = random() * TAU;
ecsSpawn(bugEntity(b, 30 + random() * (lw - 60), 30 + random() * (lh - 60), dir, -1))
});
return void syncHud(!0)
}
const side = (arr, tm) => {
const gap = lh / (arr.length + 1);
arr.forEach((b, i) => {
const c = bugEntity(b, 0 === tm ? .18 * lw : .82 * lw, gap * (i + 1), 0 === tm ? 0 : PI, tm);
c.think.paused = !0, c.think.pauseTimer = intPause(b.int);
const mhp = maxHpOf(b);
c.combat = {
...COMBAT_DEFAULTS,
curHp: 0 === tm && b.curHp != null ? max(1, min(b.curHp, mhp)) : mhp,
maxHp: mhp
};
ecsSpawn(c)
})
};
side(fightTeam, 0), side(enemies, 1), syncHud(!0)
}
function octantOf(dir) {
let deg = (180 * dir / PI % 360 + 360) % 360;
return floor(deg / 45) + 1
}
function randAngleInOctant(n) {
return rf(45 * (n - 1), 45 * n) * PI / 180
}
Object.defineProperty(window, "bugsInTerr", {
get: bugsInTerrView,
configurable: !0
});
