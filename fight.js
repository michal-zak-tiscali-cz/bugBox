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
fightNum++, enemies = buildEnemies(mayhem ? fightTeam.length : fightMode), groundMarks = [], dmgPops = [], fightDone = !1, combatMode = !0, simSpd = 1, tickDebt = 0, syncSpeedLabel();
markEggsReady();
showScreen("s-terr"), resizeBoxCV(), spawnBoxBugs()
}
function endCombatMode() {
resultTimer && (clearTimeout(resultTimer), resultTimer = null);
combatMode = !1, tickDebt = 0, ecsQuery("team").forEach(e => C.team.get(e).team === 1 && ecsKill(e)), restoreTerrWorld(), $("result-ov").classList.remove("open"), syncHud(!0)
}
function showFightResult() {
resultTimer = null;
if (!combatMode) return;
const alive0 = boxBugs.filter(f => 0 === f.team && !f.dead),
dead0 = boxBugs.filter(f => 0 === f.team && f.dead),
alive1 = boxBugs.filter(f => 1 === f.team && !f.dead),
won = alive0.length > 0 && 0 === alive1.length,
allPlayer = boxBugs.filter(f => 0 === f.team),
allEnemy = boxBugs.filter(f => 1 === f.team);
lastSurvivors = won ? alive0.map(f => f.b) : null;
alive0.forEach(f => { const lb = bugbox.find(b => b.id === f.b.id); lb && (lb.curHp = max(1, round(f.curHp))) });
dead0.length && achStep("lost", [1, 10], "lost", dead0.length);
addKills(boxBugs.filter(f => 0 === f.team).reduce((s, f) => s + (f.killsThis || 0), 0));
const rt = $("result-title"),
rb = $("result-body");
rt.textContent = won ? "VICTORY!" : "DEFEAT", rt.style.color = won ? "#44ff88" : "#ff4444", won && SFX.win(), dead0.forEach(f => {
const lb = bugbox.find(b => b.id === f.b.id);
lb && (lb.losses++, lb.fights = (lb.fights || 0) + 1, lb.killsTotal = (lb.killsTotal || 0) + (f.killsThis || 0), bugbox = bugbox.filter(b => b.id !== f.b.id))
});
let html = "";
if (won) {
const prize = TIER_PRIZE[enemyTier];
money += prize, alive0.forEach(f => {
const lb = bugbox.find(b => b.id === f.b.id);
lb && (lb.wins++, lb.fights = (lb.fights || 0) + 1, lb.killsTotal = (lb.killsTotal || 0) + (f.killsThis || 0), achSurvive(lb))
}), updateMoney(), html += `<p style="color:#44ff88;font-size:10px;margin-bottom:8px;">+${prize}</p>`
} else updateMoney();
achFight(won, dead0.length, alive0.length), achOwn(0), bugbox.forEach(b => b.mated = 0);
const playerScale = scaleMaxOf(allPlayer.map(f => f.b)),
enemyScale = scaleMaxOf(allEnemy.map(f => f.b));
const buildCard = (f, isPlayer) => {
const b = f.b,
isDead = f.dead,
lb = isPlayer ? bugbox.find(x => x.id === b.id) : null,
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
const nm = div.querySelector(".uc-name");
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
const btnRow = `<div style="display:flex;gap:8px;">\n    <button class="go-btn btn-std f1" onclick="backToBugBox();goShop();showScreen('s-shop');">Market 🛒</button>\n    <button class="bugbox-nav btn-std f1" onclick="backToBugBox()">BugBox</button>\n    ${bugbox.length?'<button class="warn btn-std f1" onclick="openArena(true,lastSurvivors);showScreen(\'s-arena\');">↺ Fight Again</button>':""}\n  </div>`;
bugbox.length || (html += '<p style="color:#ffdd44;font-size:10px;margin-bottom:8px;">⚠ No bugs left! Visit the shop.</p>'), html += btnRow + `<div style="height:10px;"></div>`;
html += `<div class="grid2">\n    <div>\n      <div class="lbl-yours">YOUR BUGS</div>\n      <div id="rc-player-col" class="col4"></div>\n    </div>\n    <div>\n      <div class="lbl-enemy">ENEMY BUGS</div>\n      <div id="rc-enemy-col" class="col4"></div>\n    </div>\n  </div>` + btnRow
rb.innerHTML = html;
const playerCol = $("rc-player-col"),
enemyCol = $("rc-enemy-col");
allPlayer.forEach(f => playerCol.appendChild(buildCard(f, !0)));
allEnemy.forEach(f => enemyCol.appendChild(buildCard(f, !1)));
$("result-ov").classList.add("open")
}
function backToBugBox() {
endCombatMode(), fightTeam = fightTeam.filter(b => bugbox.find(s => s.id === b.id)), initBugBox(), showScreen("s-terr")
}
