function callFor(e, p, team, ents, cb) {
let best = null, bd = 1 / 0;
ents.forEach(ce => {
if (ce === e) return;
const ccb = C.combat.get(ce);
if (!(ccb.callT > 0) || ccb.callTeam !== team || ccb.dead) return;
if (ccb.callX === cb.callDoneX && ccb.callY === cb.callDoneY) return;
const cp = C.pos.get(ce), d = hypot(cp.x - p.x, cp.y - p.y);
d <= ccb.callR && d < bd && (bd = d, best = ccb)
});
return best
}
function panicAll() {
boxCv.classList.remove("shake"), void boxCv.offsetWidth, boxCv.classList.add("shake");
setTimeout(() => boxCv.classList.remove("shake"), 500);
ecsQuery("bug", "pos", "combat").forEach(e => {
const cb = C.combat.get(e), t = C.walk.get(e), p = C.pos.get(e);
if (cb.dead) return;
combatState && (achieve("scare"), achStep("scared", [5], "scared"), achieve({ 5: "scare5x", 10: "terrify", 15: "ptsd" }[cb.scares = (cb.scares || 0) + 1]));
flee(e, (floor(atan2(p.y - boxLH / 2, p.x - boxLW / 2) / HALF_PI) + rf(-.5, 1.5)) * HALF_PI), cb.stunT = 0, t.seekX = boxLW / 2 + rf(-30, 30), t.seekY = boxLH / 2 + rf(-30, 30)
})
}
const abilReady = (e, id) => { const cb = C.combat.get(e); return !cb.muted && hasAbil(C.bug.get(e), id) && !(cb.cd[id] > 0) };
const abilFire = (e, id) => { const cb = C.combat.get(e); cb.cd[id] = ABILITIES[id].cd, cb.abTxt = ABILITIES[id].name, cb.abT = 2000 };
const ACTION_KEYS = ["flyT", "airT", "dashT", "spinRemain", "dashHitPend",
"backflipT", "preppingBite", "grabTarget", "grabbedBy", "grabDragLeft",
"grabTimeLeft", "mvSpd", "mvOn", "imX", "imY", "aimLock", "aimTarget"];
const clearActionState = cb => ACTION_KEYS.forEach(k => cb[k] = COMBAT_DEFAULTS[k]);
function tickTimers(cb, p, dt) {
const ticks = dt / COMBAT_STEP_MS;
if (cb.kbX || cb.kbY) {
cb.imX += cb.kbX * ticks; cb.imY += cb.kbY * ticks;
const damp = pow(KB_DAMP, ticks);
cb.kbX *= damp; cb.kbY *= damp;
abs(cb.kbX) < .15 && (cb.kbX = 0);
abs(cb.kbY) < .15 && (cb.kbY = 0);
const st = cb.kbX || cb.kbY ? cb.spinRemain * (1 - damp) : cb.spinRemain;
p.dir += cb.spinDir * st, cb.spinRemain -= st;
}
cb.dodT > 0 && (cb.dodT = max(0, cb.dodT - dt / 200));
for (const k in cb.cd) cb.cd[k] -= dt;
cb.stunT > 0 && (cb.stunT -= dt);
cb.loudT > 0 && (cb.loudT -= dt);
cb.abT > 0 && (cb.abT -= dt);
cb.callT > 0 && (cb.callT -= dt, cb.callCry && (cb.callX = p.x, cb.callY = p.y));
cb.backflipT > 0 && (cb.backflipT -= dt);
cb.dashT > 0 && (cb.dashT -= dt);
cb.airT > 0 && (cb.airT -= dt);
cb.prepVisT > 0 && (cb.prepVisT = max(0, cb.prepVisT - dt));
cb.grabTimeLeft > 0 && (cb.grabTimeLeft = max(0, cb.grabTimeLeft - dt));
if (cb.flyT > 0) {
const f = min(cb.flyT, dt / cb.airMs);
cb.flyT -= f, cb.imX += cb.flyDx * f, cb.imY += cb.flyDy * f, p.dir += cb.flySp * f;
}
}
function sysCombatAI(dt) {
const dtS = dt / 1e3;
const ents = ecsQuery("bug", "pos", "team", "combat");
const snap = new Map();
ents.forEach(e => { const p = C.pos.get(e); snap.set(e, { x: p.x, y: p.y, dir: p.dir }) });
for (let i = ents.length - 1; i > 0; i--) { const j = floor(random() * (i + 1)); [ents[i], ents[j]] = [ents[j], ents[i]] }
ents.forEach(e => {
const b = C.bug.get(e),
p = C.pos.get(e),
tm = C.team.get(e),
cb = C.combat.get(e),
t = C.walk.get(e);
const bodyL = bugLen(b), engageDist = engageDistOf(b), spd = spdOf(b), turn = turningOf(b), tier = huntTierOf(b), go = a => (turnToward(p, a, turn * dtS), cb.mvA = p.dir, cb.mvSpd = spd, cb.mvOn = 1);
if (cb.dead && !(cb.phoenixT > 0)) { clearActionState(cb); return }
tickTimers(cb, p, dt);
cb.muted = ents.some(oe => { const ocb = C.combat.get(oe), op = C.pos.get(oe); return ocb.loudT > 0 && !ocb.dead && C.team.get(oe).team !== tm.team && hypot(op.x - p.x, op.y - p.y) < loudRadius(C.bug.get(oe)) });
if (cb.curHp <= 0 && !cb.dead) { cb.phoenixUsed = 1; cb.phoenixT = ABILITIES.phoenix.dur; cb.dead = true; cb.curHp = 0; clearActionState(cb); return }
if (cb.dead && cb.phoenixT > 0) {
cb.phoenixT -= dt;
if (cb.phoenixT > 0) return;
cb.phoenixT = 0, cb.dead = false, cb.curHp = cb.maxHp * 0.1, abilFire(e, "phoenix");
}
if (cb.fakeT > 0 && (cb.fakeT = max(0, cb.fakeT - dt))) return;
if (abilReady(e, "fake") && cb.fakeUsed < 2 && !cb.fakeT && cb.curHp < cb.maxHp * (cb.fakeUsed ? .25 : .5)) {
cb.fakeUsed++; cb.fakeT = ABILITIES.fake.dur; clearActionState(cb); abilFire(e, "fake"); return;
}
if (cb.grabbedBy >= 0) {
const hcb = ECS.combat.has(cb.grabbedBy) ? C.combat.get(cb.grabbedBy) : null;
if (!hcb || hcb.dead || hcb.grabTarget !== e || hcb.grabDragLeft <= 0) { cb.grabbedBy = -1; cb.stunT = 0; if (hcb && hcb.grabTarget === e) hcb.grabTarget = -1 }
else { cb.mvSpd = cb.mvOn = cb.preppingBite = 0; return }
}
if (cb.grabTarget >= 0) {
const gcb = ECS.combat.has(cb.grabTarget) ? C.combat.get(cb.grabTarget) : null;
if (!gcb || gcb.dead || gcb.grabbedBy !== e || cb.grabDragLeft <= 0 || (cb.grabTimeLeft || 0) <= 0) {
if (gcb && gcb.grabbedBy === e) { gcb.grabbedBy = -1; gcb.stunT = 0 }
cb.grabTarget = -1; cb.grabDragLeft = 0; cb.grabTimeLeft = 0;
} else {
const step = spd * .5 * dt / 1e3;
cb.imX -= cb.grabDx * step, cb.imY -= cb.grabDy * step;
gcb.imX -= cb.grabDx * step, gcb.imY -= cb.grabDy * step;
cb.grabDragLeft -= step;
gcb.stunT = max(gcb.stunT, 60);
if (cb.grabDragLeft <= 0) { gcb.grabbedBy = -1; gcb.stunT = 0; cb.grabTarget = -1 }
}
}
const melee = () => ents.some(oe => {
const ob = C.bug.get(oe), op = C.pos.get(oe);
return !C.combat.get(oe).dead && C.team.get(oe).team !== tm.team && hypot(op.x - p.x, op.y - p.y) <= max(engageDist + bugRadius(ob), engageDistOf(ob) + bugRadius(b))
});
if (!aiAct(t)) {
const spotted = "rushing" === t.act ? melee() : ents.some(oe => {
const ocb = C.combat.get(oe);
if (C.team.get(oe).team === tm.team || ocb.dead || ocb.curHp <= 0 || ocb.fakeT > 0) return !1;
const op = C.pos.get(oe);
return seesPoint(b, p, op.x, op.y)
});
if (!spotted && ("rushing" === t.act || !callFor(e, p, tm.team, ents, cb))) return;
wakeToFight(e)
}
if (cb.stunT > 0) return;
let target = null,
minD2 = 1 / 0;
const focusOn = hasAbil(b, "focus");
let focusHp = 1 / 0;
const visR = visRangeOf(b),
visR2 = visR * visR,
fovHalf = fovHalfOf(b);
const myS = snap.get(e);
const consider = (oe, d2) => {
if (focusOn) { const hp = C.combat.get(oe).curHp; if (hp < focusHp) { focusHp = hp; target = oe; minD2 = d2 } }
else if (d2 < minD2) { minD2 = d2; target = oe }
};
ents.forEach(oe => {
const otm = C.team.get(oe), ocb = C.combat.get(oe);
if (ocb.dead || ocb.curHp <= 0 || ocb.fakeT > 0 || otm.team === tm.team) return;
const os = snap.get(oe),
dx = os.x - myS.x,
dy = os.y - myS.y,
d2 = dx * dx + dy * dy;
if (d2 >= visR2) return;
if (!focusOn && d2 >= minD2) return;
const va = norm(atan2(dy, dx) - myS.dir);
if (abs(va) <= fovHalf) consider(oe, d2);
});
if (cb.avengeE >= 0) {
if (!liveE(cb.avengeE)) cb.avengeE = -1;
else {
const dOf = te => { const ts2 = snap.get(te); return ts2 ? hypot(ts2.x - myS.x, ts2.y - myS.y) : 1 / 0 };
if (!(target != null && dOf(target) <= engageDist)) target = cb.avengeE;
if (target === cb.avengeE && dOf(cb.avengeE) <= engageDist) cb.avengeE = -1
}
}
if (intOf(b) >= 5) {
if ((cb.swT -= dt) <= 0) {
cb.swT = 3000;
let pick = -1, pickHp = 1 / 0, n = 0;
const near = bugLen(b) * 3;
ents.forEach(oe => {
const ocb = C.combat.get(oe);
if (ocb.dead || ocb.curTarget !== e || C.team.get(oe).team === tm.team) return;
const os = snap.get(oe);
hypot(os.x - myS.x, os.y - myS.y) < near && (n++, ocb.curHp < pickHp && (pickHp = ocb.curHp, pick = oe))
});
cb.pickE = n > 1 ? pick : -1
}
if (cb.pickE >= 0) {
liveE(cb.pickE) ? target = cb.pickE : cb.pickE = -1
}
}
cb.flyE >= 0 && (liveE(cb.flyE) ? target = cb.flyE : cb.flyE = -1);
let minD = 1 / 0;
cb.curTarget = target == null ? -1 : target;
if (target) { const ts = snap.get(target); minD = hypot(ts.x - myS.x, ts.y - myS.y) }
if (abilReady(e, "flee") && "fleeing" !== t.act) {
const frac = cb.curHp / (cb.maxHp || 1),
lvl = frac < .25 ? 2 : frac < .5 ? 1 : 0;
if (lvl && !(cb.fledLvl >= lvl)) {
cb.fledLvl = cb.fledLvl + 1;
flee(e, p.dir + rf(45, 110) * PI / 180 * (random() < .5 ? -1 : 1)), cb.aimLock = 0, cb.aimTarget = -1, abilFire(e, "flee")
}
}
if ("fleeing" === t.act) return go(cb.fleeA), void(cb.mvSpd *= RUSH);
if (hungry(e) && !melee() && seenFood(b, p)) return cb.aimLock = 0, cb.aimTarget = -1, void setAct(e, "rushing");
if (target) {
const tp = C.pos.get(target),
tcb = C.combat.get(target),
tb = C.bug.get(target);
cb.goOn = 0;
const attackReach = engageDist + bugRadius(tb), sepAB = bugRadius(b) + bugRadius(tb);
if (abilReady(e, "mark")) {
abilFire(e, "mark");
cb.callT = ABILITIES.mark.dur, cb.callR = callRadius(b), cb.callTeam = tm.team, cb.callCry = 0, cb.callX = tp.x, cb.callY = tp.y;
}
const air = cb.flyT > 0;
let airT = cb.airT > 0 || tcb.airT > 0;
let facingOK = false, aiming = false;
if (!air) {
const aimDiff = norm(atan2(tp.y - p.y, tp.x - p.x) - p.dir);
if (cb.aimTarget !== target) { cb.aimTarget = target; cb.aimLock = 0 }
if (minD <= attackReach) cb.aimLock = 0;
if (tier === 4) cb.aimLock = 0;
if (!cb.aimLock) {
const st = turn * dtS;
const far = minD > attackReach && tier !== 4;
turnToward(p, p.dir + aimDiff, st) ? far && (cb.aimLock = 1) : aiming = far;
}
cb.lostSide = sign(aimDiff) || cb.lostSide || 1;
cb.memT = memMsOf(b), cb.memX = tp.x, cb.memY = tp.y, cb.memA = tp.dir, cb.searchPhase = 0;
facingOK = abs(aimDiff) < FRONT_CONE;
facingOK && (cb.flyE = -1);
if (cb.regather) { if (facingOK) cb.regather = 0; else aiming = true }
}
if (abilReady(e, "dash") && !cb.dashT && !cb.dashHitPend && minD > attackReach && minD <= dashRange(b)) {
cb.dashT = ABILITIES.dash.dur; abilFire(e, "dash"); cb.dashHitPend = 1; cb.airT = cb.airMs = min(cb.dashT, (minD - attackReach) / (spd * 8) * 1e3);
}
if (cb.dashHitPend && minD <= attackReach) {
cb.dashHitPend = 0; cb.dashT = 0; cb.airT = 0;
biteDodged(b, p, tb, tp, tm.team, tcb) || (applyBite(cb, b, p, tcb, tb, tp, 1, tm.team, e), biteNoticed(target));
cb.bitePrep = cb.bitePrepMax || bitePrepOf(b);
SFX.bite();
}
let moveSpd = cb.dashT > 0 ? spd * 8 : minD > attackReach && seesPoint(b, p, tp.x, tp.y) ? spd * RUSH * facing(p, atan2(tp.y - p.y, tp.x - p.x)) : spd;
if (aiming) moveSpd = 0;
if (abilReady(e, "grab") && cb.grabTarget < 0 && tcb.grabbedBy < 0 && minD <= attackReach && !airT) {
const rel2 = atan2(p.y - tp.y, p.x - tp.x);
const fd2 = abs(((rel2 - tp.dir + PI) % (TAU) + TAU) % (TAU) - PI);
if (fd2 > HALF_PI) {
cb.grabTarget = target; tcb.grabbedBy = e; wakeToFight(target); abilFire(e, "grab"); cb.grabDragLeft = bodyL; cb.grabTimeLeft = GRAB_HOLD_MS;
const ga = atan2(tp.y - p.y, tp.x - p.x);
cb.grabDx = cos(ga); cb.grabDy = sin(ga);
}
}
const fr = flankRange(b), gap = minD - bugRadius(tb);
abilReady(e, "flanking") && !cb.flankA && gap < fr && (cb.flankA = 1.5 * PI);
if (cb.backflipT > 0) {
cb.mvA = p.dir + PI, cb.mvSpd = spd;
} else if (air) {
} else if (cb.flankA > 0 && !cb.muted && gap < 1.5 * fr && abs(norm(atan2(p.y - tp.y, p.x - tp.x) - tp.dir)) <= TAU / 3) {
const baseA = atan2(tp.y - p.y, tp.x - p.x);
const predict = (sgn) => {
const ta = baseA + HALF_PI * sgn, st = spd * dtS;
const nx = p.x + cos(ta) * st, ny = p.y + sin(ta) * st;
return abs(norm(atan2(ny - tp.y, nx - tp.x) - tp.dir));
};
const strafeSign = predict(1) >= predict(-1) ? 1 : -1,
tangentA = baseA + strafeSign * (HALF_PI - (gap > fr ? .2 : 0));
cb.aimLock = 0, cb.mvA = tangentA, cb.mvSpd = spd, airT = 1, (cb.flankA -= spd * dtS / minD) > 0 || flankEnd(cb);
} else if (cb.flankA > 0 && flankEnd(cb), minD > attackReach) cb.mvA = p.dir, cb.mvSpd = moveSpd;
if (hasAbil(b, "tank")) {
const stepT = moveSpd * dtS;
if (minD <= attackReach && !cb.mvSpd) cb.mvA = p.dir, cb.mvSpd = moveSpd;
const pushR = bodyL;
ents.forEach(oe => {
if (oe === e) return;
const ocb = C.combat.get(oe); if (ocb.dead) return;
const ob = C.bug.get(oe); if (hasAbil(ob, "tank")) return;
const op = C.pos.get(oe);
let dx = op.x - p.x, dy = op.y - p.y, d = hypot(dx, dy);
if (d >= pushR) return;
if (d < 0.001) { dx = cos(p.dir); dy = sin(p.dir); d = 1 }
const ux = dx / d, uy = dy / d;
ocb.imX += ux * stepT, ocb.imY += uy * stepT;
});
}
if (minD <= attackReach && facingOK && abilReady(e, "jump") && !airT) {
const a = atan2(tp.y - p.y, tp.x - p.x), tm2 = ensureMorph(tb), L = tm2.bodyLength + tm2.headSize;
cb.flyT = 1, cb.flyDx = tp.x + cos(a) * L - p.x, cb.flyDy = tp.y + sin(a) * L - p.y, cb.flySp = PI * (5 / 6 + random() / 3), cb.flyE = target, cb.airT = cb.airMs = ABILITIES.jump.dur, airT = 1;
abilFire(e, "jump");
}
const inRange = minD <= attackReach * (cb.wasInRange ? 1.1 : 1);
cb.wasInRange = inRange ? 1 : 0;
if (inRange && facingOK && !airT) {
if (cb.bitePrep > 0) cb.bitePrep -= dt;
cb.preppingBite = 1;
cb.prepVisT = 20;
} else if (!inRange) {
cb.bitePrep = max(cb.bitePrep, 0);
cb.preppingBite = 0;
} else { cb.preppingBite = 0 }
if (inRange && facingOK && cb.bitePrep <= 0 && !airT) {
if (!biteDodged(b, p, tb, tp, tm.team, tcb)) {
let strongMult = 1;
if (cb.strongPend) { strongMult = 2; cb.strongPend = 0 }
applyBite(cb, b, p, tcb, tb, tp, strongMult, tm.team, e), biteNoticed(target);
const kbA = atan2(tp.y - p.y, tp.x - p.x);
const braced = hasAbil(tb, "braced");
if (abilReady(e, "kickback")) { const d = max(.25, 1.5 + .28 * (b.str - tb.con)) * (braced ? .5 : 1), kbDist = bugLen(tb) * d * (1 - KB_DAMP); tcb.kbX += cos(kbA) * kbDist, tcb.kbY += sin(kbA) * kbDist; if (!braced) { tcb.stunT = max(tcb.stunT, ABILITIES.kickback.dur); const sa = (min(PI, d * PI / 3) + (floor(random() * 5) - 2) * PI / 18) * (random() < .5 ? -1 : 1); tcb.spinRemain = abs(sa); tcb.spinDir = sign(sa); tcb.regather = 1 } abilFire(e, "kickback") }
if (abilReady(e, "knockout")) {
if (!braced) { tcb.stunT = max(200, ABILITIES.knockout.dur + 200 * (b.str - tb.con)); tcb.regather = 1 }
abilFire(e, "knockout");
}
cb.biteE === target || (cb.biteE = target, cb.biteN = 0), cb.biteN++;
if (cb.biteN >= 3 && tcb.stunT <= 0 && abilReady(e, "backflip")) { cb.backflipT = ABILITIES.backflip.dur, cb.airT = cb.airMs = cb.backflipT / 2; abilFire(e, "backflip") }
SFX.bite();
}
let baseCd = bitePrepOf(b);
if (cb.swiftPend) { baseCd /= 2; cb.swiftPend = 0 }
cb.bitePrep = baseCd, cb.bitePrepMax = baseCd;
if (abilReady(e, "strongbite") && !cb.strongPend) { cb.strongPend = 1; abilFire(e, "strongbite") }
if (abilReady(e, "swiftbite") && !cb.swiftPend) { cb.swiftPend = 1; abilFire(e, "swiftbite") }
if (abilReady(e, "loud")) { cb.loudT = ABILITIES.loud.dur; abilFire(e, "loud") }
}
} else {
cb.aimLock = 0, cb.aimTarget = -1;
cb.dashT = 0, cb.dashHitPend = 0;
const stp = turn * dtS;
cb.memT > 0 && (cb.memT -= dt);
if (cb.avengeE >= 0) {
turnToward(p, cb.avengeA, stp) && (cb.avengeE = -1);
cb.mvOn = 1;
return
}
if (!cb.goOn) {
const call = callFor(e, p, tm.team, ents, cb);
call && (cb.goOn = 1, cb.goX = call.callX, cb.goY = call.callY)
}
if (cb.goOn) {
const dxc = cb.goX - p.x, dyc = cb.goY - p.y;
if (hypot(dxc, dyc) > bugLen(b)) {
turnToward(p, atan2(dyc, dxc), stp) && (cb.mvA = p.dir, cb.mvSpd = spd);
cb.mvOn = 1;
return
}
cb.goOn = 0, cb.callDoneX = cb.goX, cb.callDoneY = cb.goY, cb.memT = 0;
cb.searchPhase = 2, t.scanRemain = scanOf(b), cb.lostSide = random() < .5 ? -1 : 1
}
if (cb.memT > 0 && tier < 4 && cb.searchPhase === 0) {
const dxm = cb.memX - p.x, dym = cb.memY - p.y, dm = hypot(dxm, dym);
if (dm > 12) {
turnToward(p, atan2(dym, dxm), stp) && (cb.mvA = p.dir, cb.mvSpd = spd * .5);
cb.mvOn = 1;
return
}
if (tier === 1) { cb.memT = 0, decide(e), cb.mvOn = 1; return }
cb.searchPhase = tier === 3 ? 1 : 2;
t.scanRemain = scanOf(b);
cb.lostSide = random() < .5 ? -1 : 1
}
if (cb.searchPhase === 1) {
if (!turnToward(p, cb.memA, stp)) { cb.mvOn = 1; return }
cb.searchPhase = 2
}
cb.searchPhase || (cb.searchPhase = 2, t.scanRemain = TAU);
const step = min(t.scanRemain, stp);
p.dir = norm(p.dir + step * (cb.lostSide || 1)), t.scanRemain -= step;
if (t.scanRemain <= 0) decide(e), t.scanRemain = 0, cb.memT = 0, cb.searchPhase = 0
}
cb.mvOn = 1
});
dmgPops.forEach(d => (d.t -= dt / 1600, d.x += cos(d.a) * dt / 40, d.y += sin(d.a) * dt / 40));
dmgPops = dmgPops.filter(d => d.t > 0);
groundMarks.forEach(m => m.t = max(0, m.t - dt / 2800));
groundMarks = groundMarks.filter(m => m.t > 0);
}
