const BASE_WALK = 20;
const agiOf     = b => clamp(b.agi || 5, 1, 10);
const sf        = b => hasAbil(b, "steadfast") ? 2 : 1;
const spdOf     = b => BASE_WALK * agiOf(b) * sf(b) * ("rushing" === b.mood ? 1.25 : 1);
const turningOf = b => TAU / (6.6 - .61 * agiOf(b)) * sf(b);
const STUCK_CHECK_MS = 2000;
const SLIDE_K = .25;
const CORPSE_SLOW = .25;
const COMBAT_STEP_MS = 16, MAX_STEPS_PER_FRAME = 64;
const wallPause = e => random() < (11 - intOf(C.bug.get(e))) / 20 && intPause(e);
const slideEnd = e => (C.wall.get(e).phase = "wall", wallPause(e) || (C.walk.get(e).act = "walk"));
const busy = (b, p) => b.loveBite || p.dropStuck;
function decide(e) {
const b = C.bug.get(e), t = C.walk.get(e), p = C.pos.get(e), r = random();
if ("fighting" === b.mood) return void(t.act = "fighting", t.actT = 1 / 0);
if (C.wall.get(e).phase || combatState || "seeking" === b.mood || r < .7) return void(t.act = "walk", t.actT = rf(WALK_MIN, WALK_MAX), newDir(e));
t.act = IDLE[intOf(b) > 4 ? ri(hasAbil(b, "flanking") ? 4 : 3) : 0], b.mood = "idle", t.actT = IDL_MIN + random() * IDL_SPAN, t.idlA = PI * (1 + .75 * (2 * random() - 1)), t.idlE = null;
const dW = [p.x, boxLW - p.x, p.y, boxLH - p.y];
t.idlS = sign(norm([0, PI, HALF_PI, -HALF_PI][dW.indexOf(min(...dW))] - p.dir)) || 1
}
function sysThinkWander(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => {
const b = C.bug.get(e),
p = C.pos.get(e),
v = C.vel.get(e),
t = C.walk.get(e),
w = C.wall.get(e);
combatState ? "rushing" === b.mood && (b.mood = "seeking") : (b.mood = hpFrac(b) < 1 ? "seeking" : "walk" === t.act || "intPause" === t.act || "slide" === t.act ? "peace" : b.mood);
if ("walk" !== t.act) return;
const px = p.x, py = p.y;
if (busy(b, p)) return void(p.frzMs = 0, p.lastX = px, p.lastY = py);
if (w.phase) {
if (turnToward(p, w.targetAngle, turningOf(b) * dtS)) { const wl = "wall" === w.phase; v.wanderAngle = p.dir, w.phase = null, wl && (wallPause(e) || decide(e)) }
return
}
if ((p.frzMs = (p.frzMs || 0) + dt) >= STUCK_CHECK_MS) {
p.frzMs = 0;
if (hypot(px - (p.lastX == null ? px : p.lastX), py - (p.lastY == null ? py : p.lastY)) < bugLen(b)) {
p.frzSide = p.frzSide || (random() < .5 ? -1 : 1);
v.wanderAngle = norm(p.dir + p.frzSide * (HALF_PI + random() * HALF_PI)), w.targetAngle = v.wanderAngle, w.phase = "rotating", p.hold = 0
} else p.frzSide = 0;
p.lastX = px, p.lastY = py
}
})
}
function sysSteer(dtS, ents) {
const foods = ecsQuery("food", "pos"), obs = ecsQuery("obstacle", "pos");
ents.forEach(e => {
const t = C.walk.get(e),
w = C.wall.get(e),
b = C.bug.get(e),
p = C.pos.get(e),
v = C.vel.get(e);
if ("walk" !== t.act || w.phase || busy(b, p)) return;
p.hold = 0;
v.angVel += .9 * (random() - .5) * dtS, v.angVel *= .95, v.wanderAngle += v.angVel;
let vx = cos(v.wanderAngle),
vy = sin(v.wanderAngle);
let fT = null, fD2 = 1 / 0;
hpFrac(b) < 1 && foods.forEach(fe => {
const fp = C.pos.get(fe), dx = fp.x - p.x, dy = fp.y - p.y, d2 = dx * dx + dy * dy;
d2 < fD2 && seesPoint(b, p, fp.x, fp.y) && (fD2 = d2, fT = fp)
});
if (fT && "seeking" === b.mood) {
b.mood = "rushing";
const want = atan2(fT.y - p.y, fT.x - p.x);
turnToward(p, want, turningOf(b) * dtS) || (p.hold = 1);
v.wanderAngle = p.dir;
return
}
if (fT) { const dx = fT.x - p.x, dy = fT.y - p.y, d = hypot(dx, dy) || .001; vx += dx / d * 2.2, vy += dy / d * 2.2 }
[vx, vy] = rockAvoid(p, vx, vy, obs);
const diff = norm(atan2(vy, vx) - p.dir);
const maxStep = turningOf(b) * dtS;
p.dir += max(-maxStep, min(maxStep, diff))
})
}
function sysFeed() {
const foods = ecsQuery("food", "pos"), bugs = ecsQuery("bug", "pos", "walk");
foods.forEach(fe => {
const fp = C.pos.get(fe);
for (const be of bugs) {
const bp = C.pos.get(be), b = C.bug.get(be);
if (hpFrac(b) < 1 && hypot(bp.x - fp.x, bp.y - fp.y) < 16) {
const mx = maxHpOf(b);
b.curHp = min(mx, b.curHp + mx / 5), ECS.combat.has(be) && (C.combat.get(be).curHp = b.curHp);
intPause(be);
achieve("feed"), achStep("fed", [10, 50], "fed"), ecsKill(fe);
break
}
}
})
}
const ROCK_PAD = 20, ROCK_FORCE = 2.5;
function rockAvoid(p, vx, vy, obs) {
obs.forEach(oe => {
const op = C.pos.get(oe), o = C.obstacle.get(oe),
dx = p.x - op.x, dy = p.y - op.y, d = hypot(dx, dy) || .001, rr = o.r + ROCK_PAD;
if (d < rr) { const f = ROCK_FORCE * (rr - d) / rr; vx += dx / d * f, vy += dy / d * f }
});
return [vx, vy]
}
function sysMove(dtS, ents) {
const lw = boxLW,
lh = boxLH,
corpses = ents.filter(en => { const c = C.combat.get(en); return c && c.dead });
const slowOf = (e, p) => corpses.some(oe => oe !== e && hypot(C.pos.get(oe).x - p.x, C.pos.get(oe).y - p.y) < bugRadius(C.bug.get(oe))) ? CORPSE_SLOW : 1;
ents.forEach(e => {
const t = C.walk.get(e),
w = C.wall.get(e),
b = C.bug.get(e),
p = C.pos.get(e),
cb = C.combat.get(e);
if (cb && cb.dead) return;
const slow = corpses.length ? slowOf(e, p) : 1, m = bugRadius(b);
if (cb && "fighting" === t.act) {
let moved = 0;
if (cb.mvSpd) {
const step = cb.mvSpd * dtS * slow;
let ax = cos(cb.mvA), ay = sin(cb.mvA), wk = cb.backflipT > 0 ? 0 : -1;
(p.x <= m && ax < 0 || p.x >= lw - m && ax > 0) && (ax *= wk);
(p.y <= m && ay < 0 || p.y >= lh - m && ay > 0) && (ay *= wk);
p.x += ax * step, p.y += ay * step, moved = 1
}
if (cb.imX || cb.imY) { const lim = bugLen(b) * 2; p.x += clamp(cb.imX || 0, -lim, lim), p.y += clamp(cb.imY || 0, -lim, lim), cb.imX = 0, cb.imY = 0, moved = 1 }
cb.mvSpd = 0;
cb.mvOn = 0;
if (moved) clampToBox(e);
return
}
if (w.phase || p.hold || busy(b, p) || "walk" !== t.act && "slide" !== t.act) return;
const spd = spdOf(b) * slow;
if ("slide" === t.act) {
if ((abs(sin(w.slideA)) > .5 ? (p.x < lw / 2 ? -1 : 1) * cos(p.dir) : (p.y < lh / 2 ? -1 : 1) * sin(p.dir)) > 0) {
const st = spd * dtS * cos(p.dir - w.slideA);
p.x += cos(w.slideA) * st, p.y += sin(w.slideA) * st, clampToBox(e)
} else slideEnd(e);
return
}
const nx = p.x + cos(p.dir) * spd * dtS,
ny = p.y + sin(p.dir) * spd * dtS,
hitX = nx < m || nx > lw - m,
hitY = ny < m || ny > lh - m;
if (hitX || hitY) {
const sx = hitX && (!hitY || random() < .5), n = sx ? nx < m ? 0 : PI : ny < m ? HALF_PI : -HALF_PI;
w.slideA = sx ? sin(p.dir) >= 0 ? HALF_PI : -HALF_PI : cos(p.dir) >= 0 ? 0 : PI;
t.act = "slide", t.actT *= SLIDE_K, w.targetAngle = w.slideA + sign(norm(n - w.slideA)) * random() * HALF_PI;
return
}
p.x = nx, p.y = ny, clampToBox(e)
});
}
const sepBase = (a, b) => bugRadius(C.bug.get(a)) + bugRadius(C.bug.get(b));
function sepPair(a, b) {
const ca = C.combat.get(a), cb = C.combat.get(b);
if (ca && cb && (ca.grabTarget === b || cb.grabTarget === a)) return 0;
return sepBase(a, b)
}
const RESOLVE_MAX = 60;
const SEP_FIGHT_MULT = 4;
const UNSTICK_ACC = 90;
const STUCK_GIVE_UP = 2000;
function resolveBodies(ents, step) {
for (let i = 0; i < ents.length; i++)
for (let j = i + 1; j < ents.length; j++) {
const ca = C.combat.get(ents[i]),
cbb = C.combat.get(ents[j]);
if ([ca, cbb].some(c => c && (c.dead || c.airT > 0))) continue;
if ("breeding" === C.walk.get(ents[i]).act && "breeding" === C.walk.get(ents[j]).act) continue;
const minD = sepPair(ents[i], ents[j]),
a = C.pos.get(ents[i]),
c = C.pos.get(ents[j]),
dx = c.x - a.x,
dy = c.y - a.y,
dist = hypot(dx, dy) || .001,
ba = C.bug.get(ents[i]),
bb = C.bug.get(ents[j]);
a.v > c.v * 1.2 && dist < morphR(ba) + morphR(bb) && ecsFront(ents[i]);
if (minD <= 0 || dist >= minD) continue;
const ov = minD - dist,
nx = dx / dist,
ny = dy / dist;
const fast = [ba.mood, bb.mood].some(m => "fighting" === m || combatState && "rushing" === m),
h = min(ov / 2, step * (fast ? SEP_FIGHT_MULT : 1));
a.x -= nx * h, a.y -= ny * h, c.x += nx * h, c.y += ny * h
}
}
function resolveObstacles(ents, dtS) {
const obs = ecsQuery("obstacle", "pos");
if (!obs.length) return;
ents.forEach(e => {
if (drag && drag.e === e) return;
const dcb = C.combat.get(e);
if (dcb && dcb.dead) return;
const p = C.pos.get(e);
let ox = 0, oy = 0, deep = 0;
obs.forEach(oe => {
const op = C.pos.get(oe), o = C.obstacle.get(oe),
dx = p.x - op.x, dy = p.y - op.y, d = hypot(dx, dy) || .001, minD = o.r + bugLen(C.bug.get(e)) / 2;
if (d >= minD) return;
ox += dx / d, oy += dy / d, deep = max(deep, minD - d)
});
if (deep <= 0) return void(p.pushV = 0, p.dropStuck = 0, p.stuckMs = 0);
p.dropStuck && (p.stuckMs = (p.stuckMs || 0) + 1e3 * dtS) > STUCK_GIVE_UP && (p.dropStuck = 0);
let len = hypot(ox, oy);
if (len < .001) ox = cos(p.dir), oy = sin(p.dir), len = 1;
p.pushV = min(RESOLVE_MAX, (p.pushV || 0) + UNSTICK_ACC * dtS);
const st = min(deep, p.pushV * dtS);
p.x += ox / len * st, p.y += oy / len * st;
const wx = p.x, wy = p.y;
clampToBox(e);
(p.x !== wx || p.y !== wy) && (p.x -= oy / len * st, p.y += ox / len * st, clampToBox(e))
})
}
function clampToBox(e) {
const p = C.pos.get(e), m = bugRadius(C.bug.get(e));
p.x = clamp(p.x, m, boxLW - m), p.y = clamp(p.y, m, boxLH - m)
}
function sysResolve(ents, dtS) {
const step = RESOLVE_MAX * (dtS || COMBAT_STEP_MS / 1e3);
ents.forEach(e => { const p = C.pos.get(e); p.v = hypot(p.x - (p.lx ?? p.x), p.y - (p.ly ?? p.y)) });
resolveBodies(ents, step);
resolveObstacles(ents, dtS);
ents.forEach(e => { clampToBox(e); const p = C.pos.get(e); p.lx = p.x, p.ly = p.y })
}
const SHADE_FLAT = "rgba(0,0,0,.35)";
let flatCx = null;
function sysRenderObstacles() {
const pass = 3 === bugTheme ? [0] : [1, 0];
eachObstacle((o, p) => {
const d = OBST[o.kind][1];
for (const f of pass) {
boxCx.save(), boxCx.translate(p.x + 2 * f, p.y + 2.5 * f), boxCx.rotate(o.rot);
f ? (flatCx || (flatCx = new Proxy(boxCx, {
get: (t, k) => { const val = t[k]; return "function" == typeof val ? val.bind(t) : val },
set: (t, k, val) => (t[k] = "fillStyle" === k || "strokeStyle" === k ? SHADE_FLAT : val, !0)
})), boxCx.fillStyle = boxCx.strokeStyle = SHADE_FLAT, d(flatCx, o.r, o.v)) : d(boxCx, o.r, o.v);
boxCx.restore()
}
})
}
const IDL_MIN = 3000, IDL_SPAN = 5000, IDL_GAP = 2, IDLE = ["idle", "observing", "stalking", "flankTraining"];
function sysIdle(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => {
const b = C.bug.get(e), p = C.pos.get(e), t = C.walk.get(e);
if (IDLE.indexOf(t.act) < 1 || b.loveBite) return;
if (hpFrac(b) < 1) return void intPause(e);
const fl = "flankTraining" === t.act;
if (t.idlE == null) {
const tg = (fl ? [...ecsQuery("obstacle", "pos"), ...ecsQuery("food", "pos")] : ents.filter(o => o !== e)).find(o => seesPoint(b, p, C.pos.get(o).x, C.pos.get(o).y));
if (tg == null) {
const s = min(t.idlA, turningOf(b) * dtS);
return void(p.dir = norm(p.dir + t.idlS * s), (t.idlA -= s) <= 0 && (t.act = "idle"))
}
const op = C.pos.get(tg);
t.idlE = tg, t.idlX = op.x, t.idlY = op.y, t.idlA = rf(PI / 4, 2.5 * PI), t.idlR = max(hypot(op.x - p.x, op.y - p.y), bugRadius(b) + 10), t.idlD = t.idlS * spdOf(b) * dtS / t.idlR
}
if (!ECS.pos.has(t.idlE)) return void intPause(e);
const op = C.pos.get(t.idlE);
if (fl) {
if (hypot(op.x - t.idlX, op.y - t.idlY) > 2 || (t.idlA -= abs(t.idlD)) <= 0) return void intPause(e);
const th = atan2(p.y - op.y, p.x - op.x) + t.idlD;
p.x = op.x + cos(th) * t.idlR, p.y = op.y + sin(th) * t.idlR, p.dir = norm(th + t.idlS * HALF_PI)
} else {
turnToward(p, atan2(op.y - p.y, op.x - p.x), turningOf(b) * dtS);
if ("stalking" !== t.act || hypot(op.x - p.x, op.y - p.y) <= bugLen(b) * IDL_GAP) return;
const s = min(spdOf(C.bug.get(t.idlE)), spdOf(b)) * dtS;
p.x += cos(p.dir) * s, p.y += sin(p.dir) * s
}
clampToBox(e)
})
}
const SEEK_REACH = 40, SEEK_CROSS = .45;
function seekPick(t, p, lw, lh) {
const far = p.x < lw / 2;
t.seekX = far ? lw * (1 - SEEK_CROSS) + random() * (lw * SEEK_CROSS - 40) : 40 + random() * (lw * SEEK_CROSS - 40);
t.seekY = 40 + random() * (lh - 80)
}
function sysSeek(ents) {
const lw = boxLW, lh = boxLH;
ents.forEach(e => {
const p = C.pos.get(e), v = C.vel.get(e), t = C.walk.get(e);
(t.seekX == null || hypot(t.seekX - p.x, t.seekY - p.y) < SEEK_REACH) && seekPick(t, p, lw, lh);
v.wanderAngle = atan2(t.seekY - p.y, t.seekX - p.x), v.angVel = 0
})
}
