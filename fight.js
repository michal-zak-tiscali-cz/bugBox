function buildEnemies(count) {
const R = [
[1, 3.5],
[2.5, 6.5],
[5, 9.5]
][enemyTier],
[lo, hi] = R,
pavg = {};
return SK.forEach(k => pavg[k] = fightTeam.reduce((s, b) => s + b[k], 0) / fightTeam.length), Array.from({
length: count
}, () => {
const s = {};
SK.forEach(k => {
let v = rf(lo, hi);
1 === enemyTier && (v = .5 * v + .5 * pavg[k]), s[k] = round(clamp(v, 1, 10))
});
const hue = rf(0, 45),
eb = makeBug({
...s,
name: genName(),
gen: 1,
hue: hue
});
return eb
})
}
function startFight() {
bgPick(), fightNum++, enemies = buildEnemies(mayhem ? fightTeam.length : fightMode), groundMarks = [], dmgPops = [], fightDone = !1, combatState = !0, simSpd = 0, tickDebt = 0, syncSpeedLabel();
markEggsReady();
showScreen("s-terr"), resizeBoxCV(), spawnTerr(), toast("Morituri te salutant");
setTimeout(() => { combatState && (simSpd = 1, syncSpeedLabel()) }, 1000)
}
function endFight() {
resultTimer && (clearTimeout(resultTimer), resultTimer = null);
combatState = !1, tickDebt = 0, simSpd = speedBeforePause, ecsQuery("team").forEach(e => C.team.get(e).team === 1 && ecsKill(e)), restoreTerrWorld(), ov("ov-res", 0), syncHud(!0)
}
function showFightResult() {
resultTimer = null;
if (!combatState) return;
simSpd = 0;
const alive0 = bugsInTerr.filter(f => 0 === f.team && !f.dead),
dead0 = bugsInTerr.filter(f => 0 === f.team && f.dead),
alive1 = bugsInTerr.filter(f => 1 === f.team && !f.dead),
won = alive0.length > 0 && 0 === alive1.length,
allPlayer = bugsInTerr.filter(f => 0 === f.team),
allEnemy = bugsInTerr.filter(f => 1 === f.team);
lastSurvivors = alive0.length ? alive0.map(f => f.b) : null;
alive0.forEach(f => { const lb = bugsOwned.find(b => b.id === f.b.id); lb && (lb.curHp = max(1, round(f.curHp))) });
dead0.length && achStep("lost", [1, 10], "lost", dead0.length);
addKills(bugsInTerr.filter(f => 0 === f.team).reduce((s, f) => s + (f.killsThis || 0), 0));
const rt = $("res-title"),
rb = $("res-body");
rt.textContent = won ? "VICTORY!" : "DEFEAT", rt.style.color = won ? "#44ff88" : "#ff4444", won && SFX.win(), dead0.forEach(f => {
const lb = bugsOwned.find(b => b.id === f.b.id);
lb && (lb.losses++, lb.fights = (lb.fights || 0) + 1, lb.killsTotal = (lb.killsTotal || 0) + (f.killsThis || 0), bugsOwned = bugsOwned.filter(b => b.id !== f.b.id))
});
let html = "";
if (won) {
const prize = TIER_PRIZE[enemyTier];
money += prize, alive0.forEach(f => {
const lb = bugsOwned.find(b => b.id === f.b.id);
lb && (lb.wins++, lb.fights = (lb.fights || 0) + 1, lb.killsTotal = (lb.killsTotal || 0) + (f.killsThis || 0), achSurvive(lb))
}), updateMoney(), html += `<p style="color:#44ff88;font-size:10px;margin-bottom:8px;">+${prize}</p>`
} else updateMoney();
achFight(won, dead0.length, alive0.length), achOwn(0), bugsOwned.forEach(b => b.mated = 0);
const playerScale = scaleMaxOf(allPlayer.map(f => f.b)),
enemyScale = scaleMaxOf(allEnemy.map(f => f.b));
const buildCard = (f, isPlayer) => {
const b = f.b,
isDead = f.dead,
lb = isPlayer ? bugsOwned.find(x => x.id === b.id) : null,
killsThis = f.killsThis || 0,
killsTot = isPlayer && lb ? lb.killsTotal || 0 : killsThis,
fightCount = isPlayer && lb ? lb.fights || 0 : 1,
imgId = `rc-ph-${isPlayer?"p":"e"}-${b.id}`;
const div = makeBugCard({
name: b.name,
line3: `Gen ${b.gen||1} \u00b7 K${killsThis}(${killsTot}/${fightCount})`,
statsObj: b,
abilB: b,
dead: isDead,
showHp: !0,
scaleMax: isPlayer ? playerScale : enemyScale,
hpFrac: isDead ? 0 : f.curHp / f.maxHp,
imgId: imgId,
img: b
});
if (isDead) {
div.style.borderColor = "#442222";
const nm = div.querySelector(".card-name");
nm && (nm.style.color = "#555");
const cv = div.querySelector("#" + imgId).firstChild;
if (cv) {
const ctx = cv.getContext("2d"),
id = ctx.getImageData(0, 0, cv.width, cv.height), d = id.data;
for (let i = 0; i < d.length; i += 4) d[i + 3] > 0 && (d[i] = d[i + 1] = d[i + 2] = 90);
ctx.putImageData(id, 0, 0)
}
}
return div
};
const btnRow = `<div style="display:flex;gap:8px;">\n    <button class="nav-shop bt bt-shop f1">Market 🛒</button>\n    <button class="nav-terr bt bt-terr f1">BugBox</button>\n    ${bugsOwned.length?'<button class="warn bt f1" id="bt-again" onclick="openChal(true,lastSurvivors);showScreen(\'s-chal\');">↺ Fight Again</button>':""}\n  </div>`;
bugsOwned.length || (html += '<p style="color:#ffdd44;font-size:10px;margin-bottom:8px;">⚠ No bugs left! Visit the shop.</p>'), html += btnRow + `<div style="height:10px;"></div>`;
html += `<div class="grid2">\n    <div>\n      <div class="lbl-yours">YOUR BUGS</div>\n      <div id="rc-player-col" class="col4"></div>\n    </div>\n    <div>\n      <div class="lbl-enemy">ENEMY BUGS</div>\n      <div id="rc-enemy-col" class="col4"></div>\n    </div>\n  </div>` + btnRow
rb.innerHTML = html;
const playerCol = $("rc-player-col"),
enemyCol = $("rc-enemy-col");
allPlayer.forEach(f => playerCol.appendChild(buildCard(f, !0)));
allEnemy.forEach(f => enemyCol.appendChild(buildCard(f, !1)));
ov("ov-res", 1)
}
function leaveFight() {
if (labSt.larva) { const l = labSt.larva; bugsOwned.some(x => x.id === l.id) || bugsOwned.push(l), labSt.larva = null }
endFight(), fightTeam = fightTeam.filter(b => bugsOwned.find(s => s.id === b.id)), openTerr()
}
function checkFightEnd() {
const ents = ecsQuery("team", "combat");
if (!ents.length) return;
const [a0, a1] = teamAlive(ents);
if (!fightDone && (0 === a0 || 0 === a1)) {
ents.forEach(e => {
const c = C.combat.get(e);
if (c.curHp <= 0) { c.dead = !0, c.curHp = 0, c.phoenixT = 0, c.fakeT = 0, clearActionState(c) }
else if (c.dead) { c.phoenixT = 0, c.fakeT = 0 }
});
fightDone = !0, syncSciHud(), resultTimer = setTimeout(showFightResult, 1000)
}
}
