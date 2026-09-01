function tickFight(dt) {
const all = ecsQuery("bug", "pos", "vel", "think", "wall"),
calm = all.filter(e => "fighting" !== C.bug.get(e).mood && !C.combat.get(e).dead);
sysSeek(calm);
sysCombatAI(dt);
sysThinkWander(dt, calm), sysSteer(dt / 1e3, calm);
sysMove(dt / 1e3, all);
sysResolve(all, dt / 1e3)
}
const MATE_CHANCE = .10, MATE_COOLDOWN_MS = 15000, BOX_CAP = 100;
const boxFull = () => bugbox.length + boxEggs.length >= BOX_CAP;
const MATE_HOLD_MIN = 3000, MATE_HOLD_MAX = 7000, MATE_TURN_MAX = 1500;
let boxEggs = [], mates = [], mateTouch = new Set();
function eggRadius(a, b) { return max(bodyLenOf(a), bodyLenOf(b)) * .25 }
function mateEligible(b) {
return !combatMode && "peace" === b.mood && hpFrac(b) >= 1 && !(b.mateCd > 0) && !b.mating
}
function sysMate(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => { const b = C.bug.get(e); b.mateCd > 0 && (b.mateCd -= dt) });
if (!combatMode && !boxFull()) {
const seen = new Set();
for (let i = 0; i < ents.length; i++)
for (let j = i + 1; j < ents.length; j++) {
const ea = ents[i], eb = ents[j], key = ea + ":" + eb,
pa = C.pos.get(ea), pb = C.pos.get(eb),
ba = C.bug.get(ea), bbg = C.bug.get(eb);
if (hypot(pb.x - pa.x, pb.y - pa.y) > sepPair(ea, eb) * 1.15) continue;
seen.add(key);
if (mateTouch.has(key)) continue;
if (!mateEligible(ba) || !mateEligible(bbg)) continue;
if (random() >= MATE_CHANCE) continue;
const subFirst = ba.str < bbg.str || (ba.str === bbg.str && random() < .5),
sub = subFirst ? ea : eb, top = subFirst ? eb : ea;
ba.mating = bbg.mating = 1;
mates.push({ sub, top, phase: "turn", t: 0, hold: 0 })
}
mateTouch = seen
}
for (let k = mates.length - 1; k >= 0; k--) {
const m = mates[k];
if (combatMode || !ECS.pos.has(m.sub) || !ECS.pos.has(m.top)) { mateEnd(m, !1), mates.splice(k, 1); continue }
const sp = C.pos.get(m.sub), tp = C.pos.get(m.top),
sb = C.bug.get(m.sub), tb = C.bug.get(m.top);
if ("turn" === m.phase) {
const away = atan2(sp.y - tp.y, sp.x - tp.x),
ok1 = turnToward(sp, away, turningOf(sb) * dtS),
ok2 = turnToward(tp, away, turningOf(tb) * dtS),
gap = mateGap(m),
dx = tp.x - sp.x, dy = tp.y - sp.y, d = hypot(dx, dy) || .001,
step = min(abs(d - gap), spdOf(tb) * dtS) * (d > gap ? -1 : 1);
tp.x += dx / d * step, tp.y += dy / d * step;
m.t += dt;
(ok1 && ok2 && abs(d - gap) < 1.5 || m.t >= MATE_TURN_MAX) &&
(mateSnap(m, away), m.phase = "hold", m.hold = MATE_HOLD_MIN + random() * (MATE_HOLD_MAX - MATE_HOLD_MIN));
continue
}
mateSnap(m, sp.dir), m.hold -= dt;
if (m.hold <= 0) {
boxFull() || (boxEggs.push({
x: (sp.x + tp.x) / 2, y: (sp.y + tp.y) / 2,
r: eggRadius(sb, tb),
bug: makeBug({ ...computeOffspring(sb, tb) }),
ready: 0
}), achKids(sb, tb), achieve("mate"));
mateEnd(m, !0), mates.splice(k, 1)
}
}
}
function mateGap(m) { return bodyLenOf(C.bug.get(m.sub)) * .55 }
function mateSnap(m, away) {
const sp = C.pos.get(m.sub), tp = C.pos.get(m.top), g = mateGap(m);
sp.dir = away, tp.dir = away, tp.x = sp.x - cos(away) * g, tp.y = sp.y - sin(away) * g
}
function mateCancel(e) {
for (let k = mates.length - 1; k >= 0; k--)
(mates[k].sub === e || mates[k].top === e) && (mateEnd(mates[k], !1), mates.splice(k, 1))
}
function mateEnd(m, ok) {
[m.sub, m.top].forEach(en => {
if (!ECS.bug.has(en)) return;
const b = C.bug.get(en);
b.mating = 0, b.mateCd = MATE_COOLDOWN_MS, ok && (b.mated = 1)
});
if (ok && ECS.pos.has(m.sub) && ECS.pos.has(m.top)) {
const sp = C.pos.get(m.sub), tp = C.pos.get(m.top);
ECS.vel.has(m.sub) && (C.vel.get(m.sub).wanderAngle = sp.dir);
ECS.vel.has(m.top) && (C.vel.get(m.top).wanderAngle = tp.dir)
}
}
function markEggsReady() { boxEggs.forEach(g => g.ready = 1) }
function hatchReadyEggs() {
const keep = [];
boxEggs.forEach(g => {
if (!g.ready) return void keep.push(g);
const nb = g.bug;
nb.curHp = maxHpOf(nb), nb.mood = "peace", nb.mateCd = MATE_COOLDOWN_MS, nb.mating = 0;
bugbox.push(nb), achOwn(1), achChild(nb), achStep("hatched", [1, 10], "hatch");
trackDynasty(nb.gen);
SFX.hatch()
});
boxEggs = keep
}
function tickPeaceful(dt) {
const dtS = dt / 1e3,
ents = ecsQuery("bug", "pos", "vel", "think", "wall");
sysThinkWander(dt, ents), sysSteer(dtS, ents), sysMove(dtS, ents), sysMate(dt, ents), sysFeed(), sysRegen(dtS), sysResolve(ents, dtS)
}
