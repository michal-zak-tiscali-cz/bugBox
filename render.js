const TEAM_HUE = [210, 30];
const VIS_COL = "rgba(180,255,120,.35)";
const nearVisR = b => max(morphR(b) + 2, hasAbil(b, "v360") ? visRangeOf(b) * .25 : 0);
function drawZoneVisOverlay() {
if (!viz("zone") && !viz("vis") && !viz("vis1") && !viz("vis2")) return;
ecsQuery("bug", "pos").forEach(e => {
const cb = C.combat.get(e);
if (cb && cb.dead) return;
const p = C.pos.get(e),
b = C.bug.get(e);
if (viz("zone")) {
const zoneR = 34;
for (const [a0, a1, col] of [[PI / 3, TAU / 3, "rgba(255,180,60,.10)"], [TAU / 3, PI, "rgba(255,60,60,.14)"]])
for (const sg of [1, -1]) {
boxCx.beginPath(), boxCx.moveTo(p.x, p.y), boxCx.arc(p.x, p.y, zoneR, p.dir + sg * a0, p.dir + sg * a1, sg < 0), boxCx.closePath();
boxCx.fillStyle = col, boxCx.fill()
}
boxCx.beginPath(), boxCx.arc(p.x, p.y, engageDistOf(b), 0, 7), boxCx.strokeStyle = "rgba(120,200,255,.25)", boxCx.lineWidth = 1, boxCx.stroke()
}
if (viz(combatMode ? ((C.team.get(e) || {}).team === 1 ? "vis2" : "vis1") : "vis")) {
const visR = visRangeOf(b);
const fovH = fovHalfOf(b);
boxCx.beginPath(), boxCx.moveTo(p.x, p.y), boxCx.arc(p.x, p.y, visR, p.dir - fovH, p.dir + fovH), boxCx.closePath();
boxCx.strokeStyle = VIS_COL, boxCx.lineWidth = 1, boxCx.stroke(), boxCx.fillStyle = "rgba(180,255,120,.06)", boxCx.fill();
boxCx.beginPath(), boxCx.arc(p.x, p.y, nearVisR(b), 0, 7), boxCx.stroke(), boxCx.fill();
}
})
}
const cdFieldOf = id => ({ strongbite: "cdStrong", swiftbite: "cdSwift" })[id] || "cd" + id[0].toUpperCase() + id.slice(1);
function drawCooldowns() {
if (!viz("abi")) return;
boxCx.font = "8px 'Courier New'", boxCx.textAlign = "left";
ecsQuery("bug", "pos").forEach(e => {
const cb = C.combat.get(e) || {};
if (cb.dead && !(cb.phoenixT > 0) && !(cb.fakeT > 0)) return;
const b = C.bug.get(e),
p = C.pos.get(e),
list = (b.abilities || []).filter(id => id === "phoenix" ? !cb.phoenixUsed : id === "fake" ? cb.fakeUsed < 2 : !0);
const r = morphR(b);
let yy = p.y + 4;
list.forEach(id => {
const f = cdFieldOf(id),
has = ABILITIES[id].cd > 0 && f in cb,
cd = cb[f] || 0;
boxCx.fillStyle = has ? (cd <= 0 ? "#4f8" : "#fa6") : "#c8f";
boxCx.fillText(`${ABILITIES[id].name}${has?" "+(cd<=0?"\u2713":(cd/1000).toFixed(1)):""}`, p.x + r + 4, yy), yy += 9
})
})
}
function sysRender(inCombat) {
sysRenderObstacles(), drawZoneVisOverlay();
if (inCombat) {
groundMarks.forEach(m => {
boxCx.globalAlpha = .4 * m.t, boxCx.fillStyle = `hsl(${m.hue},40%,18%)`, boxCx.fillRect(m.x - 8, m.y - 4, 16, 8), boxCx.globalAlpha = 1
});
} else {
ecsQuery("food", "pos").forEach(e => {
const p = C.pos.get(e);
boxCx.fillStyle = "#c86", boxCx.beginPath(), boxCx.arc(p.x, p.y, 4, 0, 7), boxCx.fill();
boxCx.fillStyle = "#eb9", boxCx.beginPath(), boxCx.arc(p.x - 1, p.y - 1, 1.5, 0, 7), boxCx.fill()
});
boxEggs.forEach(g => {
boxCx.save(), boxCx.translate(g.x, g.y);
boxCx.fillStyle = "#8d8a80", boxCx.beginPath(), boxCx.ellipse(0, 0, g.r, g.r * .74, 0, 0, 7), boxCx.fill();
boxCx.fillStyle = "#a5a298", boxCx.beginPath(), boxCx.ellipse(-g.r * .22, -g.r * .22, g.r * .4, g.r * .28, 0, 0, 7), boxCx.fill();
boxCx.restore()
});
}
const ents = inCombat ? ecsQuery("bug", "pos", "team", "combat") : ecsQuery("bug", "pos", "vel", "think", "wall");
const isGrey = e => { const c = C.combat.get(e); return c.dead || c.phoenixT > 0 || c.fakeT > 0 };
const tops = new Set(mates.map(m => m.top));
const drawOrder = inCombat ? [...ents].sort((a, bb) => (isGrey(a) ? 0 : 1) - (isGrey(bb) ? 0 : 1)) :
[...ents].sort((a, bb) => (tops.has(a) ? 1 : 0) - (tops.has(bb) ? 1 : 0));
drawOrder.forEach(e => {
const b = C.bug.get(e),
p = C.pos.get(e);
if (!inCombat) {
drawBugStyled(boxCx, b, p.x, p.y, p.dir, 1, b === inspected, posPhase(p));
b.hitT > 0 && drawMorphBug(boxCx, ensureMorph(b), "#ff2828", p.x, p.y, p.dir + HALF_PI, { alpha: b.hitT, shadow: !1 });
const r = morphR(b);
(!fow && (b === inspected || scienceOn && viz("hp"))) && drawHpBar(p, hpFrac(b), r);
b.prepT > 0 && viz("bite") && drawPrepBar(p, 1 - b.prepT / BITE_PREP_MS, r);
scienceOn && viz("nam") && (boxCx.fillStyle = "#4cf", boxCx.font = "7px Courier New", boxCx.textAlign = "center", boxCx.fillText(b.name, p.x, p.y - r - 11));
return;
}
const tm = C.team.get(e),
cb = C.combat.get(e);
const cfg = ensureMorph(b), r = morphR(b);
if (isGrey(e)) {
cb.greyAt || (cb.greyAt = performance.now());
const k = min(1, floor((performance.now() - cb.greyAt) / 40) / 10);
drawBugStyled(boxCx, b, p.x, p.y, p.dir, 1, !1, null, viz("col") ? TEAM_HUE[tm.team] : null);
k > 0 && drawMorphBug(boxCx, cfg, "#3a3a42", p.x, p.y, p.dir + HALF_PI, { alpha: k, shadow: !1 });
return;
}
cb.greyAt = 0;
const hitFrac = cb.hitT || 0;
let offX = 7 * hitFrac * (cb.hitDx || 0) + 7 * (cb.dodT || 0) * (cb.dodDx || 0),
offY = 7 * hitFrac * (cb.hitDy || 0) + 7 * (cb.dodT || 0) * (cb.dodDy || 0);
if (cb.loudT > 0) { const amp = (cfg.legLen * 0.5 / 3) * sin(cb.loudT / 20), sa = p.dir + HALF_PI; offX += cos(sa) * amp, offY += sin(sa) * amp }
boxCx.globalAlpha = 1;
drawBugStyled(boxCx, b, p.x + offX, p.y + offY, p.dir, 1, b === inspected, cb.backflipT > 0 ? null : posPhase(p), viz("col") ? TEAM_HUE[tm.team] : null);
if (cb.hitT > 0) { boxCx.save(); boxCx.globalAlpha = cb.hitT; drawMorphBug(boxCx, cfg, "#ff2828", p.x + offX, p.y + offY, p.dir + HALF_PI, { alpha: cb.hitT, shadow: !1 }); boxCx.restore() }
if (cb.stunT > 0) { boxCx.save(), boxCx.fillStyle = "#fd4", boxCx.font = "9px Courier New", boxCx.textAlign = "center", boxCx.fillText("\u2726", p.x, p.y - r - 13), boxCx.restore() }
if (cb.callT > 0 && viz("visr")) { boxCx.save(), boxCx.strokeStyle = cb.callCry ? "#f88" : "#8f8", boxCx.globalAlpha = .4, boxCx.lineWidth = 1, boxCx.beginPath(), boxCx.arc(p.x, p.y, cb.callR, 0, 7), boxCx.stroke(), boxCx.restore() }
if (cb.loudT > 0 && viz("visr")) { boxCx.save(), boxCx.strokeStyle = "#ff8", boxCx.globalAlpha = .4, boxCx.lineWidth = 1, boxCx.beginPath(), boxCx.arc(p.x, p.y, loudRadius(b), 0, 7), boxCx.stroke(), boxCx.restore() }
if (cb.callT > 0 && !cb.callCry && viz("visr")) {
boxCx.save(), boxCx.strokeStyle = "#8f8", boxCx.globalAlpha = .8, boxCx.lineWidth = 1.5, boxCx.beginPath();
boxCx.moveTo(cb.callX - 4, cb.callY - 4), boxCx.lineTo(cb.callX + 4, cb.callY + 4);
boxCx.moveTo(cb.callX + 4, cb.callY - 4), boxCx.lineTo(cb.callX - 4, cb.callY + 4);
boxCx.stroke(), boxCx.restore();
}
if (viz("hp")) {
const f = max(0, cb.curHp / cb.maxHp);
drawHpBar(p, f, r, viz("col") ? `hsl(${TEAM_HUE[tm.team]},85%,55%)` : f >= 1 ? "#00ff66" : null)
}
if (viz("nam")) { boxCx.fillStyle = 0 === tm.team ? "#44ccff" : "#ffaa44", boxCx.font = "7px Courier New", boxCx.textAlign = "center", boxCx.fillText(b.name, p.x, p.y - r - 11) }
if (viz("bite") && cb.prepVisT > 0) {
const prepR = max(0, min(1, 1 - cb.bitePrep / (cb.bitePrepMax || BITE_PREP_MS)));
prepR > 0 && drawPrepBar(p, prepR, r)
}
boxCx.globalAlpha = 1;
});
if (fow && inspected != null) {
const fe = ecsQuery("bug", "pos").find(en => C.bug.get(en) === inspected || C.bug.get(en).id === inspected.id);
if (fe != null) {
const fp = C.pos.get(fe), fb = C.bug.get(fe),
fr = visRangeOf(fb), fh = fovHalfOf(fb), fhr = nearVisR(fb);
boxCx.save();
boxCx.beginPath(), boxCx.rect(0, 0, boxLW, boxLH);
boxCx.moveTo(fp.x, fp.y), boxCx.arc(fp.x, fp.y, fr, fp.dir - fh, fp.dir + fh), boxCx.closePath();
boxCx.clip("evenodd");
boxCx.beginPath(), boxCx.rect(0, 0, boxLW, boxLH);
boxCx.moveTo(fp.x + fhr, fp.y), boxCx.arc(fp.x, fp.y, fhr, 0, 7);
boxCx.fillStyle = "#000", boxCx.fill("evenodd");
boxCx.restore();
boxCx.beginPath(), boxCx.moveTo(fp.x, fp.y), boxCx.arc(fp.x, fp.y, fr, fp.dir - fh, fp.dir + fh), boxCx.closePath();
boxCx.moveTo(fp.x + fhr, fp.y), boxCx.arc(fp.x, fp.y, fhr, 0, 7);
boxCx.strokeStyle = VIS_COL, boxCx.lineWidth = 1, boxCx.stroke()
}
}
if (inCombat && viz("dmg")) {
boxCx.textAlign = "center", boxCx.font = "bold 9px 'Courier New'";
dmgPops.forEach(d => {
boxCx.save(), boxCx.globalAlpha = max(0, min(1, d.t));
boxCx.fillStyle = d.team === 0 ? "#f66" : "#4cf";
boxCx.fillText(d.isMiss ? "miss" : round(d.amount), d.x, d.y);
boxCx.restore()
})
}
drawCooldowns();
const infoEl = $("terr-info");
syncFowBtn();
if (inspected) { infoEl.innerHTML = inspectLine(inspected); return }
if (!inCombat) return void(infoEl.textContent = `${bugbox.length} bug${1!==bugbox.length?"s":""} \u2014 select a bug to inspect`);
const [a0, a1] = teamAlive(ents);
infoEl.textContent = `Fight #${fightNum} \u2014 YOURS: ${a0} alive \u00b7 ${a1} alive :ENEMY`
}
function teamAlive(ents) {
const live = ents.filter(e => { const c = C.combat.get(e); return !c.dead || c.phoenixT > 0 || c.fakeT > 0 });
return [live.filter(e => 0 === C.team.get(e).team).length, live.filter(e => 1 === C.team.get(e).team).length]
}
let stallHp = -1, stallT = 0;
const FIGHT_STALL_MS = 3e4;
function checkFightEnd() {
const ents = ecsQuery("team", "combat");
if (!ents.length) return;
const [a0, a1] = teamAlive(ents);
const hp = ents.reduce((s, e) => s + max(0, C.combat.get(e).curHp), 0), now = performance.now();
hp === stallHp || (stallHp = hp, stallT = now);
if (!fightDone && (0 === a0 || 0 === a1 || now - stallT > FIGHT_STALL_MS)) {
ents.forEach(e => {
const c = C.combat.get(e);
if (c.curHp <= 0) { c.dead = !0, c.curHp = 0, c.phoenixT = 0, c.fakeT = 0, clearActionState(c) }
else if (c.dead) { c.phoenixT = 0, c.fakeT = 0 }
});
fightDone = !0, syncSciHud(), resultTimer = setTimeout(showFightResult, 700)
}
}
