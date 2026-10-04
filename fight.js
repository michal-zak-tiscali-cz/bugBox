const statsOf = S => { const s = {}; SK.forEach(k => s[k] = 1); while (S-- > 5) { const k = SK[ri(5)]; s[k] < 10 ? s[k]++ : S++ } return s };
const BOSS = { boss: [2, 1], rb: [3, 10], wb: [3, 50] }, weekOf = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7).toDateString() };
let bosses = {}, wbWeek = "";
try { const s = JSON.parse(localStorage.getItem("bugbox_wb")); s && (wbWeek = s.week, Object.entries(s.bugs).forEach(([k, b]) => bosses[k] = { ...b, id: bid++ })) } catch (e) {}
function wbKeep() {
if ("wb" !== fightMode || !combatState) return;
ecsQuery("team", "combat").forEach(e => { const c = C.combat.get(e); C.team.get(e).team && (c.dead ? delete bosses["wb" + enemyTier] : C.bug.get(e).curHp = c.curHp) });
try { localStorage.setItem("bugbox_wb", JSON.stringify({ week: wbWeek, bugs: Object.fromEntries(Object.entries(bosses).filter(([k]) => "w" === k[0])) })) } catch (e) {}
}
function buildEnemies() {
const m = BOSS[fightMode], k = fightMode + enemyTier, w = weekOf();
if (!m) return fightTeam.map(() => makeBug({ ...statsOf(10 * enemyTier - ri(enemyTier > 1 ? 10 : 6)), hue: rf(0, 45) }));
wbWeek !== w && (Object.keys(bosses).forEach(x => "w" === x[0] && delete bosses[x]), wbWeek = w);
if (!bosses[k]) {
const b = bosses[k] = makeBug({ ...statsOf(10 * enemyTier), hue: rf(0, 45), hpMul: m[1], abilities: shuf(ABIL_IDS.slice()).slice(0, enemyTier - 1) });
["bodyLength", "bodyWidth", "headSize", "legLen"].forEach(x => b.morph[x] *= m[0])
}
return [bosses[k]]
}
function startFight() {
bgPick(), fightNum++, enemies = buildEnemies(), groundMarks = [], dmgPops = [], fightDone = !1, fightMs = 0, foodLeft = 3, combatState = !0, simSpd = 1, tickDebt = 0, syncSpeedLabel();
markEggsReady();
showScreen("s-terr"), resizeBoxCV(), spawnTerr(), toast("Morituri te salutant")
}
function endFight() {
resultTimer && (clearTimeout(resultTimer), resultTimer = null);
combatState = !1, tickDebt = 0, simSpd = speedBeforePause, ecsQuery("team").forEach(ecsKill), restoreTerrWorld(), ov("ov-res", 0), syncHud(!0)
}
function showFightResult() {
resultTimer = null;
if (!combatState) return;
wbKeep();
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
lb && (lb.losses++, lb.fights = (lb.fights || 0) + 1, lb.killsTotal = (lb.killsTotal || 0) + (f.killsThis || 0), bugsOwned = bugsOwned.filter(b => b.id !== f.b.id), run.end = `${lb.name} died in fight T${enemyTier}`)
});
let html = "";
if (won) {
const prize = 80 * enemyTier * (BOSS[fightMode] || [0, 1])[1];
money += prize, alive0.forEach(f => {
const lb = bugsOwned.find(b => b.id === f.b.id);
lb && (lb.wins++, lb.fights = (lb.fights || 0) + 1, lb.killsTotal = (lb.killsTotal || 0) + (f.killsThis || 0), achSurvive(lb))
}), updateMoney(), html += `<p style="color:#44ff88;font-size:10px;margin-bottom:8px;">+${prize}</p>`
} else updateMoney();
scienceOn && (html += `<p style="color:#888;font-size:10px;margin-bottom:8px;">Time ${fmtT(fightMs)}</p>`);
achFight(won, dead0.length, alive0.length), achOwn(0), bugsOwned.forEach(b => b.mated = 0);
if (won && "mc" === fightMode && enemyTier < 5) {
for (let n = 1 + ri(3); n--;) ecsSpawn({ food: {}, pos: { x: 30 + random() * (boxLW - 60), y: 30 + random() * (boxLH - 60), dir: 0 } });
return void($("bt-next").style.display = "")
}
simSpd = 0;
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
const btnRow = `<div style="display:flex;gap:8px;">\n    <button class="nav-mkt bt bt-mkt f1">Market 🛒</button>\n    <button class="nav-terr bt bt-terr f1">BugBox</button>\n    ${bugsOwned.length?'<button class="warn bt f1" id="bt-again" onclick="openBoo(true,lastSurvivors);showScreen(\'s-boo\');">↺ Fight Again</button>':""}\n  </div>`;
bugsOwned.length || (html += '<p style="color:#ffdd44;font-size:10px;margin-bottom:8px;">⚠ No bugs left! Visit the Market.</p>'), html += btnRow + `<div style="height:10px;"></div>`;
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
wbKeep(), endFight(), fightTeam = fightTeam.filter(b => bugsOwned.find(s => s.id === b.id)), openTerr()
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
