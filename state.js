const WALK_MIN = 500, WALK_MAX = 1e4;
function intPause(e, k = 1) {
const t = C.walk.get(e);
return t.act = "intPause", t.actT = k * (5500 - 500 * intOf(C.bug.get(e)))
}
const newDir = e => C.vel.get(e).wanderAngle = random() * TAU;
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
