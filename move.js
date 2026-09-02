const BASE_WALK = 20;
const agiOf     = b => clamp(b.agi || 5, 1, 10);
const sf        = b => hasAbil(b, "steadfast") ? 2 : 1;
const spdOf     = b => BASE_WALK * agiOf(b) * sf(b);
const turningOf = b => TAU / (6.6 - .61 * agiOf(b)) * sf(b);
const COMBAT_STEP_MS = 16, MAX_STEPS_PER_FRAME = 64;
const WALL_BOUNCE_PAIRS = [{ right: 3, bottom: 8 }, { bottom: 5, left: 2 }, { left: 7, top: 4 }, { top: 1, right: 6 }];
const wallBounce = (oct, wall) => (WALL_BOUNCE_PAIRS[(oct - 1) >> 1] || {})[wall];
function sysThinkWander(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => {
const b = C.bug.get(e),
p = C.pos.get(e),
v = C.vel.get(e),
t = C.think.get(e),
w = C.wall.get(e);
combatMode || ("fighting" !== b.mood && "fleeing" !== b.mood && (b.mood = hpFrac(b) < 1 ? "seeking" : "peace"));
if ("prePause" === w.phase) return t.pauseTimer -= dt, void(t.pauseTimer <= 0 && (w.phase = "rotating"));
if ("rotating" === w.phase) {
if (!turnToward(p, w.targetAngle, turningOf(b) * dtS)) return;
v.wanderAngle = p.dir;
return void(!w.noPause && random() < intChance(b.int) ? (w.phase = "postPause", t.pauseTimer = intPause(b.int)) : w.phase = null)
}
if ("postPause" === w.phase) return t.pauseTimer -= dt, void(t.pauseTimer <= 0 && (w.phase = null));
if (t.paused) return t.pauseTimer -= dt, void(t.pauseTimer <= 0 && (t.paused = !1, v.wanderAngle = random() * TAU));
t.thinkTimer -= dt, t.thinkTimer <= 0 && (t.thinkTimer = THINK_MIN + THINK_SPAN * random(), t.paused = !0, t.pauseTimer = intPause(b.int));
const px = p.x, py = p.y;
if (hypot(px - (p.lastX == null ? px : p.lastX), py - (p.lastY == null ? py : p.lastY)) > 1.5) p.lastX = px, p.lastY = py, p.frozenMs = 0;
else if ((p.frozenMs = (p.frozenMs || 0) + dt) > 6000) {
p.frozenMs = 0, p.lastX = px, p.lastY = py;
v.wanderAngle = random() * TAU, w.targetAngle = v.wanderAngle, w.phase = "rotating", w.noPause = 1, t.paused = !1, p.hold = 0
}
})
}
function sysSteer(dtS, ents) {
const foods = ecsQuery("food", "pos"), obs = ecsQuery("obstacle", "pos");
ents.forEach(e => {
const t = C.think.get(e),
w = C.wall.get(e),
bm = C.bug.get(e);
if (t.paused || w.phase || bm.mating) return;
const p = C.pos.get(e),
v = C.vel.get(e);
p.hold = 0;
v.angVel += .9 * (random() - .5) * dtS, v.angVel *= .95, v.wanderAngle += v.angVel;
let vx = cos(v.wanderAngle),
vy = sin(v.wanderAngle);
const b = C.bug.get(e);
let fT = null, fD2 = 1 / 0;
foods.forEach(fe => {
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
const foods = ecsQuery("food", "pos"), bugs = ecsQuery("bug", "pos", "think");
foods.forEach(fe => {
const fp = C.pos.get(fe);
for (const be of bugs) {
const bp = C.pos.get(be);
if (hypot(bp.x - fp.x, bp.y - fp.y) < 16) {
const t = C.think.get(be), b = C.bug.get(be);
if (b) {
const mx = maxHpOf(b);
b.curHp == null && (b.curHp = mx), b.curHp = min(mx, b.curHp + mx / 5);
"fighting" !== b.mood && "fleeing" !== b.mood && (b.mood = b.curHp >= mx ? "peace" : "seeking")
}
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
obs = ecsQuery("obstacle", "pos");
ents.forEach(e => {
const t = C.think.get(e),
w = C.wall.get(e),
b = C.bug.get(e),
p = C.pos.get(e),
cb = C.combat.get(e);
if (cb && cb.dead) return;
if (cb && "fighting" === b.mood) {
let moved = 0;
if (cb.mvSpd) {
const step = cb.mvSpd * dtS;
let ax = cos(cb.mvA), ay = sin(cb.mvA);
(p.x <= BOX_MARGIN && ax < 0 || p.x >= lw - BOX_MARGIN && ax > 0) && (ax = -ax);
(p.y <= BOX_MARGIN && ay < 0 || p.y >= lh - BOX_MARGIN && ay > 0) && (ay = -ay);
p.x += ax * step, p.y += ay * step, moved = 1
}
if (cb.imX || cb.imY) p.x += cb.imX, p.y += cb.imY, cb.imX = 0, cb.imY = 0, moved = 1;
cb.mvSpd = 0;
cb.mvOn = 0;
if (moved) clampToBox(p);
return
}
if (t.paused || w.phase || p.hold || b.mating) return;
const spd = spdOf(b);
let nx = p.x + cos(p.dir) * spd * dtS,
ny = p.y + sin(p.dir) * spd * dtS;
const hitX = nx < BOX_MARGIN || nx > lw - BOX_MARGIN,
hitY = ny < BOX_MARGIN || ny > lh - BOX_MARGIN;
if (hitX || hitY) {
let wall;
wall = hitX && hitY ? random() < .5 ? nx < BOX_MARGIN ? "left" : "right" : ny < BOX_MARGIN ? "top" : "bottom" : hitX ? nx < BOX_MARGIN ? "left" : "right" : ny < BOX_MARGIN ? "top" : "bottom";
const targetOct = wallBounce(octantOf(p.dir), wall),
inward = "left" === wall ? 0 : "right" === wall ? PI : "top" === wall ? HALF_PI : -HALF_PI;
w.bounces = (w.bounces || 0) + 1;
const trapped = w.bounces >= 2;
w.targetAngle = trapped ? atan2(boxLH / 2 - p.y, boxLW / 2 - p.x) :
targetOct ? randAngleInOctant(targetOct) : inward;
!trapped && random() < intChance(b.int) ? (w.phase = "prePause", t.pauseTimer = intPause(b.int)) : w.phase = "rotating";
w.noPause = trapped;
nx = p.x, ny = p.y
}
else w.bounces = 0, w.noPause = 0;
p.x = nx, p.y = ny, clampToBox(p)
});
}
const sepBase = (a, b) => (bugLen(C.bug.get(a)) + bugLen(C.bug.get(b))) / 2, SEP_ENGAGE_FRAC = .8;
function sepPair(a, b) {
const ca = C.combat.get(a), cb = C.combat.get(b);
const sd = sepBase(a, b);
if (!ca || !cb) return sd;
if (ca.grabTarget === b || cb.grabTarget === a) return 0;
if (ca.curTarget === b || cb.curTarget === a)
return min(sd, SEP_ENGAGE_FRAC * min(engageDistOf(C.bug.get(a)), engageDistOf(C.bug.get(b))));
return sd
}
const BOX_MARGIN = 21;
const RESOLVE_MAX = 60;
const SEP_FIGHT_MULT = 4;
const UNSTICK_ACC = 90;
const DROP_PAUSE = 400;
const STUCK_GIVE_UP = 2000;
function resolveBodies(ents, step) {
for (let i = 0; i < ents.length; i++)
for (let j = i + 1; j < ents.length; j++) {
const ca = C.combat.get(ents[i]),
cbb = C.combat.get(ents[j]),
da = ca && ca.dead ? 1 : 0, db = cbb && cbb.dead ? 1 : 0;
if (da && db) continue;
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
const wa = da ? 0 : db ? 2 : 1, wb = db ? 0 : da ? 2 : 1;
a.x -= nx * h * wa, a.y -= ny * h * wa, c.x += nx * h * wb, c.y += ny * h * wb
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
else { const t = C.think.get(e); t && (t.paused = !0, t.pauseTimer = DROP_PAUSE) }
}
let len = hypot(ox, oy);
if (len < .001) ox = cos(p.dir), oy = sin(p.dir), len = 1;
p.pushV = min(RESOLVE_MAX, (p.pushV || 0) + UNSTICK_ACC * dtS);
const st = min(deep, p.pushV * dtS);
p.x += ox / len * st, p.y += oy / len * st;
const wx = p.x, wy = p.y;
clampToBox(p);
(p.x !== wx || p.y !== wy) && (p.x -= oy / len * st, p.y += ox / len * st, clampToBox(p))
})
}
function clampToBox(p) {
p.x = clamp(p.x, BOX_MARGIN, boxLW - BOX_MARGIN), p.y = clamp(p.y, BOX_MARGIN, boxLH - BOX_MARGIN)
}
function sysResolve(ents, dtS) {
const step = RESOLVE_MAX * (dtS || COMBAT_STEP_MS / 1e3);
resolveBodies(ents, step);
resolveObstacles(ents, dtS);
ents.forEach(e => clampToBox(C.pos.get(e)))
}
function sysRenderObstacles() {
eachObstacle((o, p) => {
boxCx.save(), boxCx.translate(p.x, p.y), boxCx.rotate(o.rot);
if ("leaf" === o.kind) {
boxCx.fillStyle = "#2f4a1e", boxCx.strokeStyle = "#3a5a26", boxCx.lineWidth = 1;
boxCx.beginPath(), boxCx.ellipse(0, 0, o.r, o.r * .6, 0, 0, 7), boxCx.fill();
boxCx.beginPath(), boxCx.moveTo(-o.r, 0), boxCx.lineTo(o.r, 0), boxCx.stroke()
} else {
boxCx.fillStyle = "#4a4640", boxCx.beginPath(), boxCx.ellipse(0, 0, o.r, o.r * .8, 0, 0, 7), boxCx.fill();
boxCx.fillStyle = "#5a564e", boxCx.beginPath(), boxCx.ellipse(-o.r * .25, -o.r * .25, o.r * .4, o.r * .3, 0, 0, 7), boxCx.fill()
}
boxCx.restore()
})
}
function sysRegen(dtS) {
bugbox.forEach(b => {
const mx = maxHpOf(b);
b.curHp == null && (b.curHp = mx);
b.hitT > 0 && (b.hitT = max(0, b.hitT - 5 * dtS));
b.curHp < mx && (b.curHp = min(mx, b.curHp + mx / 330 * dtS))
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
const p = C.pos.get(e), v = C.vel.get(e), t = C.think.get(e);
(t.seekX == null || hypot(t.seekX - p.x, t.seekY - p.y) < SEEK_REACH) && seekPick(t, p, lw, lh);
v.wanderAngle = atan2(t.seekY - p.y, t.seekX - p.x), v.angVel = 0
})
}
