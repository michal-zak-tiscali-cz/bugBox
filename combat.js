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
let abilBlocked = false;
const abilReady = (e, id) => !abilBlocked && hasAbil(C.bug.get(e), id) && C.combat.get(e)[cdFieldOf(id)] <= 0;
const abilFire = (e, id) => C.combat.get(e)[cdFieldOf(id)] = ABILITIES[id].cd;
const ACTION_KEYS = ["jumpT", "jumpElapsed", "turn180", "turn180Delay", "dashT", "dashHitPend",
"spinRemain", "backflipT", "preppingBite", "grabTarget", "grabbedBy", "grabDragLeft",
"grabTimeLeft", "mvSpd", "mvOn", "imX", "imY", "aimLock", "aimTarget"];
const clearActionState = cb => ACTION_KEYS.forEach(k => cb[k] = COMBAT_DEFAULTS[k]);
function tickTimers(cb, p, b, dt) {
const ticks = dt / COMBAT_STEP_MS, dtS = dt / 1e3;
cb.hitT > 0 && (cb.hitT = max(0, cb.hitT - dt / 200));
CD_KEYS.forEach(k => cb[k] > 0 && (cb[k] -= dt));
cb.stunT > 0 && (cb.stunT -= dt);
cb.fakeT > 0 || cb.fleeT > 0 && (cb.fleeT = max(0, cb.fleeT - dt));
cb.loudT > 0 && (cb.loudT -= dt);
cb.callT > 0 && (cb.callT -= dt, cb.callCry && (cb.callX = p.x, cb.callY = p.y));
cb.backflipT > 0 && (cb.backflipT -= dt);
cb.dashT > 0 && (cb.dashT -= dt);
cb.flankT > 0 && (cb.flankT = max(0, cb.flankT - dt));
cb.prepVisT > 0 && (cb.prepVisT = max(0, cb.prepVisT - dt));
cb.grabTimeLeft > 0 && (cb.grabTimeLeft = max(0, cb.grabTimeLeft - dt));
if (cb.kbX || cb.kbY) {
cb.imX += cb.kbX * ticks; cb.imY += cb.kbY * ticks;
const damp = pow(.72, ticks);
cb.kbX *= damp; cb.kbY *= damp;
if (cb.stunT <= 0) { cb.kbX *= 0.5; cb.kbY *= 0.5 }
abs(cb.kbX) < .15 && (cb.kbX = 0);
abs(cb.kbY) < .15 && (cb.kbY = 0);
}
if (cb.spinRemain > 0) {
const step = min(cb.spinRemain, cb.spinRate * dtS);
p.dir += cb.spinDir * step;
cb.spinRemain -= step;
}
if (cb.jumpT > 0) {
const was = cb.jumpT;
cb.jumpElapsed += dtS;
cb.jumpT = max(0, 1 - cb.jumpElapsed / cb.jumpDur);
const frac = was - cb.jumpT;
cb.imX += (cb.jumpToX - cb.jumpFromX) * frac;
cb.imY += (cb.jumpToY - cb.jumpFromY) * frac;
}
if (cb.turn180Delay > 0) {
cb.turn180Delay = max(0, cb.turn180Delay - dt);
} else if (cb.turn180 > 0) {
const step = turningOf(b) * dtS;
p.dir += min(cb.turn180, step);
cb.turn180 = max(0, cb.turn180 - step);
}
}
function sysCombatAI(dt) {
const dtS = dt / 1e3;
const ents = ecsQuery("bug", "pos", "team", "combat");
const snap = new Map();
ents.forEach(e => { const p = C.pos.get(e); snap.set(e, { x: p.x, y: p.y, dir: p.dir }) });
if (viz("rnd")) for (let i = ents.length - 1; i > 0; i--) { const j = floor(random() * (i + 1)); [ents[i], ents[j]] = [ents[j], ents[i]] }
ents.forEach(e => {
const b = C.bug.get(e),
p = C.pos.get(e),
tm = C.team.get(e),
cb = C.combat.get(e),
t = C.think.get(e);
const bodyL = bodyLenOf(b), engageDist = engageDistOf(b), spd = spdOf(b), turn = turningOf(b), tier = huntTierOf(b);
if (cb.dead && !(cb.phoenixT > 0)) { clearActionState(cb); return }
tickTimers(cb, p, b, dt);
if (cb.curHp <= 0 && !cb.dead) {
if (hasAbil(b, "phoenix") && !cb.phoenixUsed) { cb.phoenixUsed = 1; cb.phoenixT = ABILITIES.phoenix.dur; cb.dead = true; cb.curHp = 0; clearActionState(cb); return }
cb.dead = !0, cb.curHp = 0; clearActionState(cb);
groundMarks.push({ x: p.x, y: p.y, hue: b.hue, t: 1 });
return;
}
if (cb.curHp <= 0 && cb.phoenixT <= 0) { cb.dead = true; cb.curHp = 0; cb.fakeT = 0; clearActionState(cb); return }
if (cb.dead && cb.phoenixT > 0) {
cb.phoenixT -= dt;
if (cb.phoenixT > 0) return;
cb.phoenixT = 0, cb.dead = false, cb.curHp = cb.maxHp * 0.1;
}
if (cb.fakeT > 0) {
cb.fakeT -= dt;
if (cb.fakeT > 0) return;
}
if (hasAbil(b, "fake") && cb.fakeUsed < 2 && !cb.fakeT && cb.curHp > 0 && cb.curHp < cb.maxHp * 0.5) {
cb.fakeUsed++; cb.fakeT = ABILITIES.fake.dur; clearActionState(cb); return;
}
if (cb.grabbedBy >= 0) {
const hcb = ECS.combat.has(cb.grabbedBy) ? C.combat.get(cb.grabbedBy) : null;
if (!hcb || hcb.dead || hcb.grabTarget !== e || hcb.grabDragLeft <= 0) { cb.grabbedBy = -1; cb.stunT = 0; if (hcb && hcb.grabTarget === e) hcb.grabTarget = -1 }
else { clearActionState(cb); return }
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
if ("fighting" !== b.mood) {
const spotted = ents.some(oe => {
const ocb = C.combat.get(oe);
if (C.team.get(oe).team === tm.team || ocb.dead || ocb.curHp <= 0 || ocb.fakeT > 0) return !1;
const op = C.pos.get(oe);
return seesPoint(b, p, op.x, op.y)
});
if (!spotted && !callFor(e, p, tm.team, ents, cb)) return;
wakeToFight(e)
}
if (cb.stunT > 0) return;
if (t.paused) { t.pauseTimer -= dt; if (t.pauseTimer > 0) return; t.paused = !1 }
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
const acb = ECS.combat.has(cb.avengeE) ? C.combat.get(cb.avengeE) : null;
if (!acb || acb.dead || acb.curHp <= 0) cb.avengeE = -1;
else {
const dOf = te => { const ts2 = snap.get(te); return ts2 ? hypot(ts2.x - myS.x, ts2.y - myS.y) : 1 / 0 };
if (!(target != null && dOf(target) <= engageDist)) target = cb.avengeE;
if (target === cb.avengeE && dOf(cb.avengeE) <= engageDist) cb.avengeE = -1
}
}
let minD = 1 / 0;
cb.curTarget = target == null ? -1 : target;
if (target) { const ts = snap.get(target); minD = hypot(ts.x - myS.x, ts.y - myS.y) }
if (hasAbil(b, "flee") && cb.fleeT <= 0 && cb.fakeT <= 0) {
const frac = cb.curHp / (cb.maxHp || 1),
lvl = frac < .25 ? 2 : frac < .5 ? 1 : 0;
if (lvl && !(cb.fledLvl >= lvl)) {
cb.fledLvl = cb.fledLvl + 1;
cb.fleeA = norm(p.dir + (30 + random() * 150) * PI / 180 * (random() < .5 ? -1 : 1));
cb.fleeT = FLEE_MIN_MS + random() * (FLEE_MAX_MS - FLEE_MIN_MS), cb.aimLock = 0, cb.aimTarget = -1
}
}
if (cb.fleeT > 0) {
b.mood = "fleeing";
turnToward(p, cb.fleeA, turn * dtS);
cb.mvA = p.dir, cb.mvSpd = spd, cb.mvOn = 1;
return
}
"fleeing" === b.mood && (b.mood = "seeking")
abilBlocked = false;
ents.forEach(oe => { const ocb = C.combat.get(oe), otm = C.team.get(oe); if (ocb.loudT > 0 && otm.team !== tm.team && !ocb.dead) { const op = C.pos.get(oe); if (hypot(op.x - p.x, op.y - p.y) < loudRadius(C.bug.get(oe))) abilBlocked = true } });
if (target) {
const tp = C.pos.get(target),
tcb = C.combat.get(target),
tb = C.bug.get(target);
cb.goOn = 0;
if (abilReady(e, "mark")) {
abilFire(e, "mark");
cb.callT = ABILITIES.mark.dur, cb.callR = callRadius(b), cb.callTeam = tm.team, cb.callCry = 0, cb.callX = tp.x, cb.callY = tp.y;
}
const flank = hasAbil(b, "flanking");
const inJumpSeq = cb.jumpT > 0 || cb.turn180 > 0;
let facingOK = false, frontCone60 = false, aiming = false;
if (!inJumpSeq) {
const aimDiff = norm(atan2(tp.y - p.y, tp.x - p.x) - p.dir);
if (cb.aimTarget !== target) { cb.aimTarget = target; cb.aimLock = 0 }
if (minD <= engageDist) cb.aimLock = 0;
if (tier === 4) cb.aimLock = 0;
if (!cb.aimLock) {
const st = turn * dtS;
const far = minD > engageDist && tier !== 4;
turnToward(p, p.dir + aimDiff, st) ? far && (cb.aimLock = 1) : aiming = far;
}
cb.lostSide = sign(aimDiff) || cb.lostSide || 1;
cb.memT = memMsOf(b), cb.memX = tp.x, cb.memY = tp.y, cb.memA = tp.dir, cb.searchPhase = 0;
facingOK = abs(aimDiff) < 0.6;
frontCone60 = abs(aimDiff) < PI / 3;
}
if (abilReady(e, "dash") && !cb.dashT && !cb.dashHitPend && minD > engageDist && minD <= dashRange(b)) {
cb.dashT = ABILITIES.dash.dur; abilFire(e, "dash"); cb.dashHitPend = 1;
}
if (cb.dashHitPend && minD <= engageDist) {
cb.dashHitPend = 0; cb.dashT = 0;
biteDodged(tb, tp, tm.team) || (applyBite(cb, b, p, tcb, tb, tp, 1, tm.team, e), biteNoticed(target));
cb.bitePrep = cb.bitePrepMax || BITE_PREP_MS;
SFX.bite();
}
let moveSpd = cb.dashT > 0 ? spd * 2 : spd;
if (aiming) moveSpd = 0;
if (abilReady(e, "grab") && cb.grabTarget < 0 && tcb.grabbedBy < 0 && minD <= engageDist && !cb.jumpT && !cb.turn180 && !tcb.jumpT) {
const rel2 = atan2(p.y - tp.y, p.x - tp.x);
const fd2 = abs(((rel2 - tp.dir + PI) % (TAU) + TAU) % (TAU) - PI);
if (fd2 > HALF_PI) {
cb.grabTarget = target; tcb.grabbedBy = e; abilFire(e, "grab"); cb.grabDragLeft = bodyL * 3; cb.grabTimeLeft = GRAB_HOLD_MS;
const ga = atan2(tp.y - p.y, tp.x - p.x);
cb.grabDx = cos(ga); cb.grabDy = sin(ga);
}
}
if (flank && cb.flankReady && !cb.flankArmed && minD > engageDist && minD < flankRange(tb)) { cb.flankT = FLANK_WINDOW_MS; cb.flankArmed = 1 }
if (minD > flankRange(tb)) cb.flankArmed = 0;
if (cb.backflipT > 0) {
cb.mvA = p.dir + PI, cb.mvSpd = spd;
} else if (inJumpSeq) {
} else if (flank && cb.flankReady && cb.flankT > 0 && minD > engageDist && minD < flankRange(tb)) {
const rel = norm(atan2(p.y - tp.y, p.x - tp.x) - tp.dir);
if (abs(rel) > TAU / 3) {
cb.flankReady = false; cb.flankT = 0;
if (minD > engageDist) cb.mvA = p.dir, cb.mvSpd = moveSpd;
} else {
const baseA = atan2(tp.y - p.y, tp.x - p.x);
const predict = (sgn) => {
const ta = baseA + HALF_PI * sgn, st = moveSpd * dtS;
const nx = p.x + cos(ta) * st, ny = p.y + sin(ta) * st;
return abs(norm(atan2(ny - tp.y, nx - tp.x) - tp.dir));
};
const strafeSign = predict(1) >= predict(-1) ? 1 : -1,
tangentA = baseA + HALF_PI * strafeSign;
cb.mvA = tangentA, cb.mvSpd = moveSpd;
if (cb.flankT <= 0) cb.flankReady = false;
}
} else if (minD > engageDist) cb.mvA = p.dir, cb.mvSpd = moveSpd;
if (hasAbil(b, "tank")) {
const stepT = moveSpd * dtS;
if (minD <= engageDist && !cb.mvSpd) cb.mvA = p.dir, cb.mvSpd = moveSpd;
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
if (minD <= engageDist && frontCone60 && abilReady(e, "jump") && !cb.jumpT && !cb.turn180) {
const approachA = atan2(tp.y - p.y, tp.x - p.x), tm2 = ensureMorph(tb);
cb.jumpT = 1; cb.jumpFromX = p.x; cb.jumpFromY = p.y;
cb.jumpToX = tp.x + cos(approachA) * (tm2.bodyLength + tm2.headSize);
cb.jumpToY = tp.y + sin(approachA) * (tm2.bodyLength + tm2.headSize);
abilFire(e, "jump");
cb.turn180 = PI; tcb.turn180 = PI; tcb.turn180Delay = 2000;
cb.jumpDur = PI / (2 * turn); cb.jumpElapsed = 0;
}
const inRange = minD <= engageDist * (cb.wasInRange ? 1.1 : 1);
cb.wasInRange = inRange ? 1 : 0;
if (inRange && facingOK && !inJumpSeq && abs(norm(atan2(p.y - tp.y, p.x - tp.x) - tp.dir)) >= PI / 3) cb.bitePrep = 0;
if (inRange && facingOK && !inJumpSeq) {
if (cb.bitePrep > 0) cb.bitePrep -= dt;
cb.preppingBite = 1;
cb.prepVisT = 20;
} else if (!inRange) {
cb.bitePrep = max(cb.bitePrep, 0);
cb.preppingBite = 0;
} else { cb.preppingBite = 0 }
if (inRange && facingOK && cb.bitePrep <= 0 && !inJumpSeq) {
if (!biteDodged(tb, tp, tm.team)) {
let strongMult = 1;
if (cb.strongPend) { strongMult = 2; cb.strongPend = 0 }
applyBite(cb, b, p, tcb, tb, tp, strongMult, tm.team, e), biteNoticed(target);
cb.flankReady = true; cb.flankT = 0; cb.flankArmed = 0;
const kbA = atan2(tp.y - p.y, tp.x - p.x), kbBase = 1.2;
tcb.kbX = (tcb.kbX || 0) + cos(kbA) * kbBase, tcb.kbY = (tcb.kbY || 0) + sin(kbA) * kbBase;
const braced = hasAbil(tb, "braced");
if (abilReady(e, "kickback")) { const stub = braced; const kbDist = 2.5 * pow(b.str, 0.6826) * (stub ? 0.5 : 1); tcb.kbX += cos(kbA) * kbDist, tcb.kbY += sin(kbA) * kbDist; if (!stub) { tcb.stunT = max(tcb.stunT, ABILITIES.kickback.dur); const spinAmt = rnd() * PI, spinDir = (rnd() < 0.5 ? -1 : 1); tcb.spinRemain = spinAmt; tcb.spinDir = spinDir; tcb.spinRate = 3 * turningOf(tb) } abilFire(e, "kickback") }
if (abilReady(e, "knockout")) {
const base = 600 * pow(b.str, 0.4307), sd = b.str - tb.str;
const mult = sd > 2 ? 3 : sd >= -2 ? 2 : 1;
if (!braced) tcb.stunT = base * mult;
abilFire(e, "knockout");
}
if (abilReady(e, "backflip")) { cb.backflipT = ABILITIES.backflip.dur; abilFire(e, "backflip") }
SFX.bite();
}
let baseCd = BITE_PREP_MS;
if (cb.swiftPend) { baseCd = BITE_PREP_MS / 2; cb.swiftPend = 0 }
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
cb.searchPhase = 2, t.scanRemain = .75 * TAU, cb.lostSide = random() < .5 ? -1 : 1
}
if (cb.memT > 0 && tier < 4 && cb.searchPhase === 0) {
const dxm = cb.memX - p.x, dym = cb.memY - p.y, dm = hypot(dxm, dym);
if (dm > 12) {
turnToward(p, atan2(dym, dxm), stp) && (cb.mvA = p.dir, cb.mvSpd = spd * .5);
cb.mvOn = 1;
return
}
if (tier === 1) { cb.memT = 0, b.mood = "seeking", t.paused = !1, t.pauseTimer = 0, cb.mvOn = 1; return }
cb.searchPhase = tier === 3 ? 1 : 2;
t.scanRemain = TAU;
cb.lostSide = random() < .5 ? -1 : 1
}
if (cb.searchPhase === 1) {
if (!turnToward(p, cb.memA, stp)) { cb.mvOn = 1; return }
cb.searchPhase = 2, t.scanRemain = TAU
}
t.scanRemain > 0 || (t.scanRemain = TAU);
const step = min(t.scanRemain, stp);
p.dir = norm(p.dir + step * (cb.lostSide || 1)), t.scanRemain -= step;
if (t.scanRemain <= 0) b.mood = "seeking", t.paused = !1, t.pauseTimer = 0, t.scanRemain = 0, cb.memT = 0, cb.searchPhase = 0
}
cb.mvOn = 1
});
dmgPops.forEach(d => {
const v = dt / 40,
sgn = d.team === 0 ? 1 : -1;
d.t -= dt / 1600;
d.y -= v * 0.866;
d.x += sgn * v * 0.5 + sin((1 - d.t) * 14) * v * .2
});
dmgPops = dmgPops.filter(d => d.t > 0);
groundMarks.forEach(m => m.t = max(0, m.t - dt / 2800));
groundMarks = groundMarks.filter(m => m.t > 0);
}
