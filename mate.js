const INTERACT_CHANCE = .10, MATE_COOLDOWN_MS = 15000, BOX_CAP = 100;
const boxFull = () => bugsOwned.length + boxEggs.length >= BOX_CAP;
const MATE_HOLD_MIN = 3000, MATE_HOLD_MAX = 7000, MATE_TURN_MAX = 1500;
let boxEggs = [], mates = [], scraps = [], mateTouch = new Set();
function eggRadius(a, b) { return max(bodyLenOf(a), bodyLenOf(b)) * .25 }
const SCRAP_REACH = 2.5, SCRAP_CONE = 1;
const mateOdds = () => bugsOwned.length <= 3 ? 1 : bugsOwned.length <= 10 ? .5 : .25;
const nibble = (a, t) => (t.hitT = 1, t.curHp = max(1, (t.curHp == null ? maxHpOf(t) : t.curHp) - a.str * rollVar()));
function interactEligible(b) {
return "peace" === b.mood && !(b.mateCd > 0) && !b.mating && !b.scrap
}
function sysMate(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => { const b = C.bug.get(e); b.mateCd > 0 && (b.mateCd -= dt) });
const seen = new Set();
for (let i = 0; i < ents.length; i++)
for (let j = i + 1; j < ents.length; j++) {
const ea = ents[i], eb = ents[j], key = ea + ":" + eb,
pa = C.pos.get(ea), pb = C.pos.get(eb),
ba = C.bug.get(ea), bbg = C.bug.get(eb);
if (hypot(pb.x - pa.x, pb.y - pa.y) > sepPair(ea, eb) * 1.15) continue;
seen.add(key);
if (mateTouch.has(key)) continue;
if (!interactEligible(ba) || !interactEligible(bbg)) continue;
if (random() >= INTERACT_CHANCE) continue;
if (random() >= mateOdds() || boxFull() || hpFrac(ba) < 1 || hpFrac(bbg) < 1) {
ba.scrap = bbg.scrap = 1;
scraps.push({ a: ea, b: eb, ta: 1, tb: 1 });
continue
}
const subFirst = ba.str < bbg.str || (ba.str === bbg.str && random() < .5),
sub = subFirst ? ea : eb, top = subFirst ? eb : ea;
ba.mating = bbg.mating = 1;
mates.push({ sub, top, phase: "turn", t: 0, hold: 0 })
}
mateTouch = seen

for (let k = scraps.length - 1; k >= 0; k--) {
const s = scraps[k];
if (!combatState && ECS.pos.has(s.a) && ECS.pos.has(s.b)) {
const pa = C.pos.get(s.a), pb = C.pos.get(s.b);
if (hypot(pb.x - pa.x, pb.y - pa.y) <= sepPair(s.a, s.b) * SCRAP_REACH) {
for (const [x, y, k2] of [[s.a, s.b, "ta"], [s.b, s.a, "tb"]]) {
if (!s[k2]) continue;
const px = C.pos.get(x), py = C.pos.get(y), bx = C.bug.get(x), a = atan2(py.y - px.y, py.x - px.x);
C.vel.get(x).wanderAngle = a, turnToward(px, a, turningOf(bx) * dtS);
abs(norm(a - px.dir)) < SCRAP_CONE && (bx.prepT = (bx.prepT || BITE_PREP_MS) - dt) <= 0 && (s[k2] = bx.prepT = 0, nibble(bx, C.bug.get(y)), SFX.bite())
}
if (s.ta || s.tb) continue
}
}
scrapEnd(s), scraps.splice(k, 1)
}
for (let k = mates.length - 1; k >= 0; k--) {
const m = mates[k];
if (combatState || !ECS.pos.has(m.sub) || !ECS.pos.has(m.top)) { mateEnd(m, !1), mates.splice(k, 1); continue }
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
function scrapEnd(s) {
[s.a, s.b].forEach(en => {
if (!ECS.bug.has(en)) return;
const b = C.bug.get(en), t = C.think.get(en), v = C.vel.get(en);
b.scrap = b.prepT = 0;
v && (v.wanderAngle = random() * TAU);
t && random() < .5 && (t.paused = !0, t.pauseTimer = intPause(b.int))
})
}
function mateCancel(e) {
for (let k = scraps.length - 1; k >= 0; k--)
(scraps[k].a === e || scraps[k].b === e) && (scrapEnd(scraps[k]), scraps.splice(k, 1));
for (let k = mates.length - 1; k >= 0; k--)
(mates[k].sub === e || mates[k].top === e) && (mateEnd(mates[k], !1), mates.splice(k, 1))
}
function mateEnd(m, ok) {
[m.sub, m.top].forEach(en => {
if (!ECS.bug.has(en)) return;
const b = C.bug.get(en);
b.mating = 0, b.mateCd = MATE_COOLDOWN_MS, ok && (b.mated = 1)
});
if (ok && ECS.think.has(m.sub)) { const t = C.think.get(m.sub); t.paused = !0, t.pauseTimer = 2 * intPause(C.bug.get(m.sub).int) }
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
bugsOwned.push(nb), achOwn(1), achChild(nb), achStep("hatched", [1, 10], "hatch");
trackDynasty(nb.gen);
SFX.hatch()
});
boxEggs = keep
}
