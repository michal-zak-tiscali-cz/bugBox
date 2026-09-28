const teamMax = () => ({ mayhem: 1 / 0, rb: 10, wb: 10 })[fightMode] || +fightMode || 1,
bossFit = b => { const d = 10 * enemyTier - round(statSum(b)); return d >= 0 && d < 10 };
function openChal(keepMode, keepTeam) {
fightTeam = keepTeam ? keepTeam.filter(f => bugsOwned.find(b => b.id === f.id)).map(f => bugsOwned.find(b => b.id === f.id)) : [], keepMode || (fightMode = 1, enemyTier = 1), renderChalGrid(), updateChalUI()
}
function setMode(n) {
fightMode = n, fightTeam = "boss" === n ? [] : fightTeam.slice(0, teamMax()), updateChalUI(), renderChalGrid()
}
function setTier(n) {
enemyTier = n, "boss" === fightMode && (fightTeam = fightTeam.filter(bossFit)), updateChalUI(), renderChalGrid()
}
function updateChalUI() {
const empty = !bugsOwned.length;
$("bt-chal-shop").style.display = empty ? "" : "none";
$("bt-chal-terr").style.marginLeft = empty ? "0" : "auto";
document.querySelectorAll("#s-chal .bt-mode").forEach((el, i) => el.className = "bt-mode" + (!empty && fightMode === MODES[i] ? " prim" : ""));
$("tier-row").innerHTML = Array.from({ length: 5 }, (_, i) => `<button class="bt-tier${!empty && i + 1 === enemyTier ? " prim" : ""}" onclick="setTier(${i + 1})">${String(i + 1).padStart(2, "0")}</button>`).join("");
$("chal-info").textContent = empty ? "" : `${fightTeam.length}/${isFinite(teamMax()) ? teamMax() : "∞"} selected — ${"mc" === fightMode ? "T1→T10" : `T${enemyTier} +$${80 * enemyTier}`}`;
$("bt-combat").disabled = !(fightTeam.length && ("string" == typeof fightMode || fightTeam.length === fightMode))
}
function chalApplyCard(div, btn, b) {
const sel = fightTeam.find(x => x.id === b.id);
btn.className = "bt-sel", btn.textContent = sel ? "✓ Selected — remove" : "+ Send to fight", div.classList.toggle("card-sel", !!sel)
}
function renderChalGrid() {
const g = $("chal-grid");
g.innerHTML = "";
if (!bugsOwned.length) {
g.innerHTML = '<div class="empty-cell">Buy some bug first</div>';
return
}
bugsOwned.forEach(b => {
const div = makeBugCard({
name: b.name,
line3: gkfLine(b),
statsObj: b,
abilB: b,
dead: !1,
showHp: !0,
hpFrac: hpFrac(b),
imgId: "fs-ph-" + b.id,
img: b
});
const btn = document.createElement("button");
btn.style = "width:100%;margin-top:7px;font-size:10px;", div.appendChild(btn), chalApplyCard(div, btn, b), div.onclick = e => {
e.stopPropagation();
const idx = fightTeam.findIndex(x => x.id === b.id);
return idx >= 0 ? (fightTeam.splice(idx, 1), chalApplyCard(div, btn, b), void updateChalUI()) : "boss" === fightMode && !bossFit(b) ? void flashBlocked(div) : fightTeam.length >= teamMax() ? (flashBlocked(div), void toast(`Max ${teamMax()} fighters!`)) : (fightTeam.push(b), chalApplyCard(div, btn, b), void updateChalUI())
}, div.dataset.bid = b.id, g.appendChild(div)
})
}
