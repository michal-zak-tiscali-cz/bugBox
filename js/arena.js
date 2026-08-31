function openArena(keepMode, keepTeam) {
fightTeam = keepTeam ? keepTeam.filter(f => bugbox.find(b => b.id === f.id)).map(f => bugbox.find(b => b.id === f.id)) : [], keepMode || (fightMode = 1, mayhem = !1, enemyTier = 0), renderArenaGrid(), updateArenaUI()
}
function setMode(n) {
mayhem = !1, fightMode = n, fightTeam = fightTeam.slice(0, n), updateArenaUI(), renderArenaGrid()
}
function setMayhem() {
mayhem = !0, fightMode = 999, updateArenaUI(), renderArenaGrid()
}
function setTier(n) {
const empty = !bugbox.length;
enemyTier = n, ["btn-t0", "btn-t1", "btn-t2"].forEach((id, i) => {
$(id).className = !empty && i === n ? "prim" : ""
});
$("arena-info").textContent = empty ? "" : `${fightTeam.length}/${mayhem?"∞":fightMode} selected — ${TIER_LABEL[n]} enemies`
}
function updateArenaUI() {
const empty = !bugbox.length;
$("btn-arena-market").style.display = empty ? "" : "none";
$("btn-arena-back").style.marginLeft = empty ? "0" : "auto";
["btn-mode-1v1", "btn-mode-3v3", "btn-mode-6v6"].forEach((id, i) => {
$(id).className = "mode-btn " + (!empty && !mayhem && fightMode === [1, 3, 6][i] ? "prim" : "")
});
const mb = $("btn-mode-mayhem");
mb.className = "mode-btn" + (!empty && mayhem ? " prim" : "");
setTier(enemyTier);
const ready = mayhem ? fightTeam.length >= 1 : fightTeam.length >= 1 && fightTeam.length === fightMode,
goBtn = $("btn-arena-go");
goBtn.disabled = !ready
}
function arenaApplyCard(div, btn, b) {
const sel = fightTeam.find(x => x.id === b.id);
btn.className = "card-sel-btn", btn.textContent = sel ? "✓ Selected — remove" : "+ Send to fight", div.classList.toggle("card-sel", !!sel)
}
function renderArenaGrid() {
const g = $("arena-grid");
g.innerHTML = "";
if (!bugbox.length) {
g.innerHTML = '<div class="empty-cell">Buy some bug first</div>';
return
}
bugbox.forEach(b => {
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
btn.style = "width:100%;margin-top:7px;font-size:10px;", div.appendChild(btn), arenaApplyCard(div, btn, b), div.onclick = e => {
e.stopPropagation();
const idx = fightTeam.findIndex(x => x.id === b.id);
return idx >= 0 ? (fightTeam.splice(idx, 1), arenaApplyCard(div, btn, b), void updateArenaUI()) : !mayhem && fightTeam.length >= fightMode ? (flashBlocked(div), void toast(`Max ${fightMode} fighters!`)) : (fightTeam.push(b), arenaApplyCard(div, btn, b), void updateArenaUI())
}, div.dataset.bid = b.id, g.appendChild(div)
})
}
