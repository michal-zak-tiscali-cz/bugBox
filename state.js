const WALK_MIN = 500, WALK_MAX = 1e4;
function setAct(e, act, ms = 1 / 0) {
const t = C.walk.get(e);
return t.slide = null, t.act = act, t.actT = ms
}
const think = (e, k = 1) => setAct(e, "thinking", k * (5500 - 500 * intOf(C.bug.get(e))) + rf(-250, 250));
const aiAct = t => "fighting" === t.act || "fleeing" === t.act;
const newDir = e => C.vel.get(e).wanderAngle = random() * TAU;
const SN = ["CON", "STR", "AGI", "INT", "PER"];
let dzAnim = 0,
money = 500,
bugsOwned = [],
bid = 1,
fightTeam = [],
fightMode = 1,
enemyTier = 1,
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
const MODES = [1, 2, 3, 6, "mayhem", "mc", "boss", "rb", "wb"],
ri = n => floor(random() * n),
rf = (a, b) => a + random() * (b - a),
clamp = (v, a, b) => max(a, min(b, v)),
fmtT = ms => { const d = floor(ms / 100), p = n => String(n).padStart(2, "0"); return p(floor(d / 600)) + ":" + p(floor(d / 10) % 60) + "." + d % 10 };
function turnToward(p, want, step) {
const d = norm(want - p.dir);
step *= p.tk ||= rf(.9, 1.1);
return abs(d) <= step ? (p.dir = norm(want), p.tk = 0, !0) : (p.dir = norm(p.dir + sign(d) * step), !1)
}
function norm(a) { a %= TAU; return a > PI ? a - TAU : a < -PI ? a + TAU : a }
function hidpi(canvas, w, h) {
const dpr = window.devicePixelRatio || 1;
canvas.width = round(w * dpr), canvas.height = round(h * dpr), canvas.style.width = w + "px", canvas.style.height = h + "px";
const ctx = canvas.getContext("2d");
return ctx.setTransform(dpr, 0, 0, dpr, 0, 0), ctx
}
