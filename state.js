const THINK_MIN = 500, THINK_SPAN = 9500, FEED_PAUSE = 600;
function intPause(iv) {
return 5500 - 500 * clamp(iv, 1, 10)
}
function intChance(iv) {
return (11 - clamp(iv, 1, 10)) / 10 * .5
}
const SN = ["CON", "STR", "AGI", "INT", "PER"];
let dzAnim = 0,
money = 500,
bugsOwned = [],
bid = 1,
fightTeam = [],
fightMode = 1,
mayhem = !1,
enemyTier = 0,
lastSurvivors = null,
labSt = {
phase: "pick",
pA: null,
pB: null,
fA: 0,
fB: 0,
fL: 0,
larva: null
};
const TIER_PRIZE = [80, 180, 350],
TIER_LABEL = ["WEAK", "EVEN", "STRONG"],
ri = n => floor(random() * n),
rf = (a, b) => a + random() * (b - a),
clamp = (v, a, b) => max(a, min(b, v));
function turnToward(p, want, step) {
const d = norm(want - p.dir);
return abs(d) <= step ? (p.dir = norm(want), !0) : (p.dir = norm(p.dir + sign(d) * step), !1)
}
function norm(a) { a %= TAU; return a > PI ? a - TAU : a < -PI ? a + TAU : a }
function hidpi(canvas, w, h) {
const dpr = window.devicePixelRatio || 1;
canvas.width = round(w * dpr), canvas.height = round(h * dpr), canvas.style.width = w + "px", canvas.style.height = h + "px";
const ctx = canvas.getContext("2d");
return ctx.setTransform(dpr, 0, 0, dpr, 0, 0), ctx
}
