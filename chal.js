function openChal(keepMode, keepTeam) {
fightTeam = keepTeam ? keepTeam.filter(f => bugsOwned.find(b => b.id === f.id)).map(f => bugsOwned.find(b => b.id === f.id)) : [], keepMode || (fightMode = 1, mayhem = !1, enemyTier = 0), renderChalGrid(), updateChalUI()
}
function setMode(n) {
mayhem = !1, fightMode = n, fightTeam = fightTeam.slice(0, n), updateChalUI(), renderChalGrid()
}
function setMayhem() {
mayhem = !0, fightMode = 999, updateChalUI(), renderChalGrid()
}
function setTier(n) {
const empty = !bugsOwned.length;
enemyTier = n, ["bt-t0", "bt-t1", "bt-t2"].forEach((id, i) => {
$(id).className = "bt-tier" + (!empty && i === n ? " prim" : "")
});
$("chal-info").textContent = empty ? "" : `${fightTeam.length}/${mayhem?"∞":fightMode} selected — ${TIER_LABEL[n]} enemies`
}
function updateChalUI() {
const empty = !bugsOwned.length;
$("bt-chal-shop").style.display = empty ? "" : "none";
$("bt-chal-terr").style.marginLeft = empty ? "0" : "auto";
["bt-1v1", "bt-2v2", "bt-3v3", "bt-6v6"].forEach((id, i) => {
$(id).className = "bt-mode " + (!empty && !mayhem && fightMode === [1, 2, 3, 6][i] ? "prim" : "")
});
const mb = $("bt-mayhem");
mb.className = "bt-mode" + (!empty && mayhem ? " prim" : "");
setTier(enemyTier);
const ready = mayhem ? fightTeam.length >= 1 : fightTeam.length >= 1 && fightTeam.length === fightMode,
goBtn = $("bt-combat");
goBtn.disabled = !ready
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
return idx >= 0 ? (fightTeam.splice(idx, 1), chalApplyCard(div, btn, b), void updateChalUI()) : !mayhem && fightTeam.length >= fightMode ? (flashBlocked(div), void toast(`Max ${fightMode} fighters!`)) : (fightTeam.push(b), chalApplyCard(div, btn, b), void updateChalUI())
}, div.dataset.bid = b.id, g.appendChild(div)
})
}
