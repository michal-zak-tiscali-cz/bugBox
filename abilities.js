const bugLen = b => b ? ensureMorph(b).bodyLength : 22;
const callRadius = b => bugLen(b) * 7, loudRadius = b => bugLen(b) * 3, dashRange = b => bugLen(b) * 2, flankRange = b => bugLen(b) * 2;
const FLANK_WINDOW_MS = 1000;
const GRAB_HOLD_MS = 2500;
const FLEE_MIN_MS = 3000, FLEE_MAX_MS = 6000;
const ABILITIES = {};
[
["dash", "Dash", "agi", 5e3, 2000],
["jump", "Jump", "agi", 9e3, 1000],
["knockout", "Knock Out", "str", 8e3, 600],
["kickback", "Kick Back", "str", 5e3, 350],
["flanking", "Flanking", "int", 0, 0],
["strongbite", "Strong Bite", "str", 7e3, 0],
["swiftbite", "Swift Bite", "agi", 7e3, 0],
["backflip", "Backflip", "agi", 6e3, 1000],
["grab", "Grab", "str", 9e3, 0],
["mark", "Mark", "int", 6e3, 3e3],
["phoenix", "Phoenix", "con", 0, 5000],
["fake", "Fake Death", "int", 0, 3000],
["loud", "Loud", "per", 10e3, 4800],
["cry", "Cry", "per", 0, 7e3],
["v360", "360", "per", 0, 0],
["braced", "Braced", "con", 0, 0],
["focus", "Focus", "int", 0, 0],
["tank", "Tank", "str", 0, 0],
["steadfast", "Steadfast", "agi", 0, 0],
["flee", "Flee", "int", 0, 0],
["resilient", "Resilient", "con", 0, 0],
["chitin", "Chitin", "con", 0, 0]
].forEach(([id, name, stat, cd, dur]) => ABILITIES[id] = { name, stat, cd, dur });
const ABIL_IDS = Object.keys(ABILITIES);
const ABIL_MAX = 4, ABIL_INHERIT_ONE = .5, ABIL_INHERIT_BOTH = .75;
const ABIL_ROLL_CHANCE = [.5, .5, .25, .25, 0];
const ABIL_BY_STAT = {};
SK.forEach(k => ABIL_BY_STAT[k] = ABIL_IDS.filter(id => ABILITIES[id].stat === k));
const shuf = a => a.sort(() => random() - .5);
const BITE_PREP_MS = 800;
const FOV_MIN_DEG = 50, FOV_MAX_DEG = 140;
function bodyLenOf(b) { const m = ensureMorph(b); return m.bodyLength }
function engageDistOf(b) { const m = ensureMorph(b); return m.bodyLength / 2 + m.headSize * 2 }
const perOf = b => clamp(b.per || 5, 1, 10);
const intOf = b => clamp(b.int || 5, 1, 10);
const visRangeOf = b => 25 * perOf(b);
const fovHalfOf = b => (FOV_MIN_DEG + (FOV_MAX_DEG - FOV_MIN_DEG) * (perOf(b) - 1) / 9) * PI / 360;
function seesPoint(b, p, x, y) {
const dx = x - p.x, dy = y - p.y, d2 = dx * dx + dy * dy, vr = visRangeOf(b);
if (d2 >= vr * vr) return !1;
if (hasAbil(b, "v360") && d2 < vr * vr * .0625) return !0;
return abs(norm(atan2(dy, dx) - p.dir)) <= fovHalfOf(b)
}
const memMsOf = b => (intOf(b) + 2) * 1000;
const huntTierOf = b => { const i = intOf(b); return i <= 3 ? 1 : i <= 6 ? 2 : i <= 8 ? 3 : 4 };
function rollVar() { return viz("rnd") ? 0.8 + 0.4 * random() : 1.0 }
function rollDodge(chance) { return viz("rnd") && random() < chance }
function biteDodged(tb, tp, atkTeam) {
if (!rollDodge(clamp(.025 * tb.agi, 0, .25))) return !1;
return spawnDmgPop(tp.x, tp.y, 0, !0, atkTeam), !0
}
function wakeToFight(e) {
const t = C.think.get(e), b = C.bug.get(e);
if (!t || "fighting" === b.mood) return;
b.mood = "fighting", t.paused = !1, t.pauseTimer = 0, t.scanRemain = 0, t.seekX = null;
const w = C.wall.get(e);
w && (w.phase = null)
}
function biteNoticed(te) {
wakeToFight(te);
const tp = C.pos.get(te), ttm = C.team.get(te);
if (!tp || !ttm) return;
ecsQuery("bug", "pos", "team", "think").forEach(oe => {
if (oe === te || C.team.get(oe).team !== ttm.team) return;
const ocb = C.combat.get(oe);
if (ocb && ocb.dead) return;
seesPoint(C.bug.get(oe), C.pos.get(oe), tp.x, tp.y) && wakeToFight(oe)
})
}
function applyBite(cb, ab, p, tcb, tb, tp, mult, atkTeam, atkE) {
const fd = abs(norm(atan2(p.y - tp.y, p.x - tp.x) - tp.dir)),
flankMult = fd < PI / 3 ? 1 : fd < TAU / 3 ? 1.5 : 2;
if (fd >= PI / 3 && atkE != null) { tcb.avengeE = atkE, tcb.avengeA = atan2(p.y - tp.y, p.x - tp.x) }
let dmg = ab.str * rollVar() * flankMult * mult;
if (hasAbil(tb, "chitin")) dmg *= .5;
tcb.curHp -= dmg, tcb.hitT = 1;
const ha = atan2(tp.y - p.y, tp.x - p.x);
tcb.hitDx = cos(ha), tcb.hitDy = sin(ha);
spawnDmgPop(tp.x, tp.y, dmg, !1, atkTeam);
hasAbil(tb, "cry") && (tcb.callT = ABILITIES.cry.dur, tcb.callR = callRadius(tb), tcb.callTeam = atkTeam ? 0 : 1, tcb.callCry = 1, tcb.callX = tp.x, tcb.callY = tp.y);
if (tcb.curHp <= 0 && !(hasAbil(tb, "phoenix") && !tcb.phoenixUsed)) {
tcb.dead = !0, tcb.curHp = 0, cb.killsThis = (cb.killsThis || 0) + 1;
groundMarks.push({ x: tp.x, y: tp.y, hue: tb.hue, t: 1 })
}
}
function rnd() { return viz("rnd") ? random() : 0.5 }
const CD_KEYS = ["cdDash", "cdJump", "cdKnockout", "cdKickback", "cdStrong", "cdSwift", "cdBackflip", "cdGrab", "cdMark", "cdLoud"];
const COMBAT_DEFAULTS = {
dead: !1, killsThis: 0,
bitePrep: BITE_PREP_MS, bitePrepMax: BITE_PREP_MS, preppingBite: 0, prepVisT: 0,
kbX: 0, kbY: 0, hitT: 0, hitDx: 0, hitDy: 0,
spinRemain: 0, spinDir: 1, spinRate: 0,
stunT: 0,
jumpT: 0, jumpDur: 1, jumpElapsed: 0, jumpFromX: 0, jumpFromY: 0, jumpToX: 0, jumpToY: 0,
turn180: 0, turn180Delay: 0, dashT: 0, dashHitPend: 0,
strongPend: 0, swiftPend: 0, backflipT: 0,
grabTarget: -1, grabbedBy: -1, grabDragLeft: 0, grabTimeLeft: 0, grabDx: 0, grabDy: 0,
flankReady: !0, flankT: 0, flankArmed: 0,
callT: 0, callR: 0, callTeam: -1, callX: 0, callY: 0, callCry: 0, callDoneX: 0, callDoneY: 0, goOn: 0, goX: 0, goY: 0, loudT: 0, curTarget: -1,
aimTarget: -1, aimLock: 0, avengeE: -1, avengeA: 0, lostSide: 1, wasInRange: 0,
memT: 0, memX: 0, memY: 0, memA: 0, searchPhase: 0, fleeT: 0, fleeA: 0, fledLvl: 0,
mvA: 0, mvSpd: 0, mvOn: 0,
imX: 0, imY: 0,
phoenixUsed: 0, phoenixT: 0, fakeUsed: 0, fakeT: 0
};
CD_KEYS.forEach(k => COMBAT_DEFAULTS[k] = 0);
const abilOrder = b => SK.filter(k => b[k] >= 5).sort((x, y) => b[y] - b[x] || (x < y ? -1 : 1));
function rollAbilities(b, out, used) {
for (const k of abilOrder(b)) {
if (out.length >= ABIL_MAX) break;
if (used.has(k) || !(random() < (ABIL_ROLL_CHANCE[out.length] || 0))) continue;
const pool = ABIL_BY_STAT[k].filter(id => !out.includes(id));
pool.length && (out.push(pool[ri(pool.length)]), used.add(k))
}
return out
}
function assignBirthAbilities(b) {
const out = (b.abilities || []).slice(0, ABIL_MAX);
return rollAbilities(b, out, new Set(out.map(id => ABILITIES[id].stat)))
}
function inheritAbilities(child, a, b) {
const pa = a.abilities || [], pb = b.abilities || [], out = [], used = new Set();
for (const k of abilOrder(child)) {
if (out.length >= ABIL_MAX) break;
for (const c of shuf(ABIL_BY_STAT[k].map(id => ({ id: id, n: pa.includes(id) + pb.includes(id) })).filter(c => c.n)))
if (random() < (2 === c.n ? ABIL_INHERIT_BOTH : ABIL_INHERIT_ONE)) { out.push(c.id), used.add(k); break }
}
rollAbilities(child, out, used);
return child.abilities = out, out
}
function hasAbil(b, id) { return b && b.abilities && b.abilities.includes(id) }
function abilTags(b) {
if (!b || !b.abilities || !b.abilities.length) return "";
return " | " + b.abilities.map(id => `<span style="color:#c8f;font-size:9px;">⬢${ABILITIES[id].name}</span>`).join(" ")
}
