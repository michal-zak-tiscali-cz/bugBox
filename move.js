const BASE_WALK = 20;
const agiOf     = b => clamp(b.agi || 5, 1, 10);
const sf        = b => hasAbil(b, "steadfast") ? 2 : 1;
const spdOf     = b => BASE_WALK * agiOf(b) * sf(b);
const turningOf = b => TAU / (6.6 - .61 * agiOf(b)) * sf(b);
const STUCK_CHECK_MS = 2000;
const SLIDE_K = .25;
const CORPSE_SLOW = .25;
const COMBAT_STEP_MS = 16, MAX_STEPS_PER_FRAME = 64;
function sysThinkWander(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => {
const b = C.bug.get(e),
p = C.pos.get(e),
v = C.vel.get(e),
t = C.walk.get(e),
w = C.wall.get(e);
combatState || ("fighting" !== b.mood && "fleeing" !== b.mood && (b.mood = hpFrac(b) < 1 ? "seeking" : b.idlT > 0 ? b.mood : "peace"));
if ("prePause" === w.phase) return t.pauseTimer -= dt, void(t.pauseTimer <= 0 && (w.phase = "rotating"));
if ("rotating" === w.phase) {
if (!turnToward(p, w.targetAngle, turningOf(b) * dtS)) return;
v.wanderAngle = p.dir;
return void(!w.noPause && random() < intChance(b.int) ? (w.phase = "postPause", t.pauseTimer = intPause(b.int)) : w.phase = null)
}
if ("postPause" === w.phase) return t.pauseTimer -= dt, void(t.pauseTimer <= 0 && (w.phase = null));
if (t.paused) return t.pauseTimer -= dt, void(t.pauseTimer <= 0 && (t.paused = !1, v.wanderAngle = random() * TAU));
t.walkTimer -= dt, t.walkTimer <= 0 && (t.walkTimer = rf(WALK_MIN, WALK_MAX), t.paused = !0, t.pauseTimer = intPause(b.int));
const px = p.x, py = p.y;
if (b.mating || b.scrap) return void(p.frzMs = 0, p.lastX = px, p.lastY = py);
if ((p.frzMs = (p.frzMs || 0) + dt) >= STUCK_CHECK_MS) {
p.frzMs = 0;
if (hypot(px - (p.lastX == null ? px : p.lastX), py - (p.lastY == null ? py : p.lastY)) < bugLen(b)) {
p.frzSide = p.frzSide || (random() < .5 ? -1 : 1);
v.wanderAngle = norm(p.dir + p.frzSide * (HALF_PI + random() * HALF_PI)), w.targetAngle = v.wanderAngle, w.phase = "rotating", w.noPause = 1, t.paused = !1, p.hold = 0
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
bm = C.bug.get(e);
if (t.paused || w.phase || w.slideT > 0 || bm.mating || bm.scrap) return;
const p = C.pos.get(e),
v = C.vel.get(e);
p.hold = 0;
v.angVel += .9 * (random() - .5) * dtS, v.angVel *= .95, v.wanderAngle += v.angVel;
let vx = cos(v.wanderAngle),
vy = sin(v.wanderAngle);
const b = C.bug.get(e);
let fT = null, fD2 = 1 / 0;
hpFrac(b) < 1 && foods.forEach(fe => {
const fp = C.pos.get(fe), dx = fp.x - p.x, dy = fp.y - p.y, d2 = dx * dx + dy * dy;
d2 < fD2 && seesPoint(b, p, fp.x, fp.y) && (fD2 = d2, fT = fp)
});
if (fT && "seeking" === b.mood) {
const want = atan2(fT.y - p.y, fT.x - p.x);
turnToward(p, want, turningOf(b) * dtS) || (p.hold = 1);
v.wanderAngle = p.dir;
return
}
if (fT) { const dx = fT.x - p.x, dy = fT.y - p.y, d = hypot(dx, dy) || .001; vx += dx / d * 2.2, vy += dy / d * 2.2 }
[vx, vy] = rockAvoid(p, vx, vy, obs);
const diff = norm(atan2(vy, vx) - p.dir);
const maxStep = turningOf(C.bug.get(e)) * dtS;
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
const mx = maxHpOf(b), t = C.walk.get(be);
b.curHp = min(mx, b.curHp + mx / 5);
"fighting" !== b.mood && "fleeing" !== b.mood && (b.mood = b.curHp >= mx ? "peace" : "seeking");
t.paused = !0, t.pauseTimer = FEED_PAUSE;
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
dt = dtS * 1e3,
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
if (cb && "fighting" === b.mood) {
let moved = 0;
if (cb.mvSpd) {
const step = cb.mvSpd * dtS * slow;
let ax = cos(cb.mvA), ay = sin(cb.mvA);
(p.x <= m && ax < 0 || p.x >= lw - m && ax > 0) && (ax = -ax);
(p.y <= m && ay < 0 || p.y >= lh - m && ay > 0) && (ay = -ay);
p.x += ax * step, p.y += ay * step, moved = 1
}
if (cb.imX || cb.imY) { const lim = bugLen(b) * 2; p.x += clamp(cb.imX || 0, -lim, lim), p.y += clamp(cb.imY || 0, -lim, lim), cb.imX = 0, cb.imY = 0, moved = 1 }
cb.mvSpd = 0;
cb.mvOn = 0;
if (moved) clampToBox(e);
return
}
if (t.paused || w.phase || p.hold || b.mating || b.scrap) return;
const spd = spdOf(b) * slow;
if (w.slideT > 0 && (abs(sin(w.slideA)) > .5 ? (p.x < lw / 2 ? -1 : 1) * cos(p.dir) : (p.y < lh / 2 ? -1 : 1) * sin(p.dir)) > 0) {
w.slideT -= dt;
const st = spd * dtS * cos(p.dir - w.slideA);
p.x += cos(w.slideA) * st, p.y += sin(w.slideA) * st, clampToBox(e);
w.slideT <= 0 && (w.phase = random() < intChance(b.int) ? (t.pauseTimer = intPause(b.int), "prePause") : "rotating", w.noPause = 0);
return
}
w.slideT = 0;
const nx = p.x + cos(p.dir) * spd * dtS,
ny = p.y + sin(p.dir) * spd * dtS,
hitX = nx < m || nx > lw - m,
hitY = ny < m || ny > lh - m;
if (hitX || hitY) {
const sx = hitX && (!hitY || random() < .5), n = sx ? nx < m ? 0 : PI : ny < m ? HALF_PI : -HALF_PI;
w.slideA = sx ? sin(p.dir) >= 0 ? HALF_PI : -HALF_PI : cos(p.dir) >= 0 ? 0 : PI;
w.slideT = t.walkTimer * SLIDE_K, w.targetAngle = w.slideA + sign(norm(n - w.slideA)) * random() * HALF_PI;
return
}
w.noPause = 0;
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
const DROP_PAUSE = 400;
const STUCK_GIVE_UP = 2000;
function resolveBodies(ents, step) {
for (let i = 0; i < ents.length; i++)
for (let j = i + 1; j < ents.length; j++) {
const ca = C.combat.get(ents[i]),
cbb = C.combat.get(ents[j]);
if (ca && ca.dead || cbb && cbb.dead) continue;
if (C.bug.get(ents[i]).mating && C.bug.get(ents[j]).mating) continue;
const minD = sepPair(ents[i], ents[j]);
if (minD <= 0) continue;
const a = C.pos.get(ents[i]),
c = C.pos.get(ents[j]),
dx = c.x - a.x,
dy = c.y - a.y,
dist = hypot(dx, dy) || .001;
if (dist >= minD) continue;
const ov = minD - dist,
nx = dx / dist,
ny = dy / dist,
ba = C.bug.get(ents[i]),
bb = C.bug.get(ents[j]);
const fast = "fighting" === ba.mood || "fighting" === bb.mood,
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
if (p.dropStuck) {
p.stuckMs = (p.stuckMs || 0) + 1e3 * dtS;
if (p.stuckMs > STUCK_GIVE_UP) p.dropStuck = 0;
else { const t = C.walk.get(e); t && (t.paused = !0, t.pauseTimer = DROP_PAUSE) }
}
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
resolveBodies(ents, step);
resolveObstacles(ents, dtS);
ents.forEach(clampToBox)
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
function sysRegen(dtS) {
bugsOwned.forEach(b => {
const mx = maxHpOf(b);
b.curHp == null && (b.curHp = mx);
b.hitT > 0 && (b.hitT = max(0, b.hitT - 5 * dtS));
b.curHp < mx && (b.curHp = min(mx, b.curHp + mx / 330 * dtS))
})
}
const IDL_CH = .0008, IDL_MIN = 3000, IDL_SPAN = 5000, IDL_GAP = 2;
function idlStop(b, e, p) { b.idlT = 0, b.mood = "peace", C.walk.get(e).paused = !1, C.vel.get(e).wanderAngle = p.dir }
function sysIdle(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => {
const b = C.bug.get(e), p = C.pos.get(e), t = C.walk.get(e);
if (b.idlT > 0) {
if (!ECS.pos.has(b.idlE) || hpFrac(b) < 1) return idlStop(b, e, p);
const op = C.pos.get(b.idlE), d = hypot(op.x - p.x, op.y - p.y);
b.idlT -= dt, t.paused = !0, t.pauseTimer = 100;
if ("circling" === b.mood) {
if (ECS.bug.has(b.idlE) && hypot(op.x - b.idlX, op.y - b.idlY) > 2 || (b.idlA -= abs(b.idlD)) <= 0) return idlStop(b, e, p);
const th = atan2(p.y - op.y, p.x - op.x) + b.idlD;
p.x = op.x + cos(th) * b.idlR, p.y = op.y + sin(th) * b.idlR, p.dir = norm(th + b.idlS * HALF_PI), clampToBox(e)
} else {
turnToward(p, atan2(op.y - p.y, op.x - p.x), turningOf(b) * dtS);
if ("stalking" === b.mood && d > bodyLenOf(b) * IDL_GAP) {
const s = min(spdOf(C.bug.get(b.idlE)), spdOf(b)) * dtS;
p.x += cos(p.dir) * s, p.y += sin(p.dir) * s, clampToBox(e)
}
}
return void(b.idlT <= 0 && idlStop(b, e, p))
}
if ("peace" !== b.mood || b.mating || b.scrap || random() >= IDL_CH) return;
const flank = hasAbil(b, "flanking") && hpFrac(b) >= 1, smart = intOf(b) >= 5;
if (!flank && !smart) return;
const pool = flank ? ecsQuery("pos").filter(o => o !== e && (ECS.bug.has(o) || ECS.obstacle.has(o) || ECS.food.has(o))) : ents.filter(o => o !== e),
tg = pool.find(o => seesPoint(b, p, C.pos.get(o).x, C.pos.get(o).y));
if (tg == null) return;
const op = C.pos.get(tg);
b.idlE = tg, b.idlT = IDL_MIN + random() * IDL_SPAN;
if (flank && (!smart || random() < .5)) {
b.idlR = max(hypot(op.x - p.x, op.y - p.y), bugRadius(b) + 10), b.idlS = random() < .5 ? -1 : 1,
b.idlD = b.idlS * spdOf(b) * dtS / b.idlR, b.idlA = random() * TAU, b.idlX = op.x, b.idlY = op.y, b.mood = "circling"
} else if (ECS.bug.has(tg)) b.mood = spdOf(C.bug.get(tg)) < spdOf(b) ? "stalking" : "observing";
else b.idlT = 0
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
