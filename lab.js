function openLab(scrollToBottom) {
labSt = {
phase: "pick",
pA: null,
pB: null,
fA: 0,
fB: 0,
fL: 0,
larva: null
}, showScreen("s-lab"), renderLab();
const lay = $("lab-layout");
lay && (lay.scrollTop = scrollToBottom ? lay.scrollHeight : 0)
}
function renderLab() {
updateMoney();
const lay = $("lab-layout"),
st = labSt;
if ("pick" === st.phase) {
lay.innerHTML = "";
const tip = document.createElement("div");
tip.style = "font-size:8px;color:#888;width:100%;max-width:700px;text-align:center;margin-bottom:2px;";
tip.textContent = "Tip: click the bug picture for the option to kill it";
lay.appendChild(tip);
const sortRow = document.createElement("div");
sortRow.style = "display:flex;gap:4px;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;max-width:700px;margin-bottom:4px;";
sortRow.innerHTML = '<span style="font-size:9px;color:#888;">Sort by</span>' +
BREED_SORT.map(([k, l]) => `<button class="bt${labSort===k?" card-sel":""}" style="min-width:0;height:auto;padding:2px 7px;font-size:9px;" onclick="setLabSort('${k}')">${l}</button>`).join("");
lay.appendChild(sortRow);
const bar = document.createElement("div");
lay.style.cursor = "", lay.onclick = null, bar.id = "lab-topbar", bar.style = "width:100%;max-width:700px;", lay.appendChild(bar);
const grid = document.createElement("div");
return grid.className = "pick-grid", lay.appendChild(grid), renderLabGrid(grid), void labBar()
}
if ("result" === st.phase) {
const l = st.larva, pA = st.pA, pB = st.pB;
lay.innerHTML = `
      <div class="phase-box" style="max-width:520px;">
        <h3 class="tc">🥚 NEW BUG!</h3>
        <div id="lab-parents-row" style="display:flex;gap:8px;justify-content:center;align-items:flex-start;margin:10px 0;"></div>
        <div id="lab-child-row" style="display:flex;justify-content:center;margin:10px 0;"></div>
        <div class="tc"><button class="nav-lab bt" style="width:160px;padding:6px 28px;height:auto;" onclick="labBack()">← Breeding Lab 🧬</button></div>
      </div>`;
lay.style.cursor = "pointer", lay.onclick = e => { window.killPh || labBack() };
const parentsRow = $("lab-parents-row"),
childRow = $("lab-child-row");
const mkCard = (bug, dead, isChild, lbl) => {
if (dead || !bug) {
const div = document.createElement("div");
div.className = "card", div.style = "position:relative;flex:1;min-width:0;max-width:170px;box-sizing:border-box;";
div.innerHTML = '<div class="empty-note">— gone —</div>';
return div
}
const card = makeKillableCard(bug, {
uid: "hatch",
extraStyle: "flex:1;min-width:0;max-width:170px;",
onKill: cardDiv => {
bugsOwned = bugsOwned.filter(x => x.id !== bug.id);
isChild ? (l.dead = !0) : (pA === bug ? st.pAdead = !0 : st.pBdead = !0);
freezeCardAsGone(cardDiv)
}
});
if (lbl) {
const bn = card.querySelector(".card-name");
bn && (bn.innerHTML = `<span style="color:${lbl==="A"?"#ffdd44":"#44ff88"}">(${lbl}) </span>${bug.name}`)
}
return card
};
if (pA || st.pAdead) parentsRow.appendChild(mkCard(pA, st.pAdead, !1, "A"));
if (pB || st.pBdead) parentsRow.appendChild(mkCard(pB, st.pBdead, !1, "B"));
const cc = mkCard(l.dead ? null : l, l.dead, !0);
childRow.appendChild(cc), markMeta(cc, l);
return
}
}
function labApplyCard(div, b) {
const isA = labSt.pA?.id === b.id,
isB = labSt.pB?.id === b.id,
bn = div.querySelector(".card-name");
bn && (bn.innerHTML = `${isA?'<span style="color:#ffdd44">(A) </span>':isB?'<span style="color:#44ff88">(B) </span>':""}${b.name}`);
const old = div.querySelector(".bt-breed");
old && old.remove();
if (labSt.pA && labSt.pB && (isA || isB)) {
const info = div.querySelector(".card-info"),
gb = document.createElement("button");
gb.className = "nav-lab bt-breed", gb.style = "font-size:10px;padding:3px 8px;margin-top:3px;", gb.textContent = "🧬 Breed", gb.onclick = e => { e.stopPropagation(), breedNow() };
info && info.appendChild(gb)
}
const btn = div.querySelector(".bt-sel");
btn && (btn.textContent = isA || isB ? "Deselect" : "Select"), div.classList.toggle("card-sel", isA || isB)
}
function breedNow() {
if (boxFull()) return void toast("Terrarium full");
labSt.pA && labSt.pB ? (labSt.larva = makeBug({
...computeOffspring(labSt.pA, labSt.pB),
wins: 0,
losses: 0
}), labSt.pA.mated = labSt.pB.mated = 1, achKids(labSt.pA, labSt.pB), bugsOwned.push(labSt.larva), achOwn(1), achChild(labSt.larva), trackDynasty(labSt.larva.gen), SFX.hatch(), labSt.phase = "result", renderLab()) : toast("Select two bugs!")
}
function labApplyAll(grid) {
grid.querySelectorAll(".card").forEach(div => {
const b = bugsOwned.find(x => String(x.id) === div.dataset.bid);
b && labApplyCard(div, b)
}), labBar()
}
function labPick(b, div, grid, addOnly) {
const selected = labSt.pA?.id === b.id || labSt.pB?.id === b.id;
if (selected && addOnly) return;
if (!selected && (hpFrac(b) < 1 || b.mated)) return void flashBlocked(div);
if (!selected && boxFull()) return flashBlocked(div), void toast("Terrarium full");
labSt.pA?.id === b.id ? (labSt.pA = labSt.pB, labSt.pB = null) : labSt.pB?.id === b.id ? labSt.pB = null : labSt.pA ? labSt.pB ? (labSt.pA = labSt.pB, labSt.pB = b) : labSt.pB = b : labSt.pA = b, labApplyAll(grid)
}
const BREED_SORT = [
["gen", "Gen", b => b.gen],
["con", "Con", b => b.con],
["str", "Str", b => b.str],
["agi", "Agi", b => b.agi],
["int", "Int", b => b.int],
["per", "Per", b => b.per],
["abi", "Abi", b => (b.abilities || []).length],
["pwr", "Pwr", b => SK.reduce((t, k) => t + b[k], 0)]
];
let labSort = null;
function setLabSort(k) { labSort = labSort === k ? null : k, renderLab() }
function renderLabGrid(grid) {
const sorter = BREED_SORT.find(r => r[0] === labSort),
list = [...bugsOwned].sort((x, y) => sorter ? sorter[2](y) - sorter[2](x) : x.name.localeCompare(y.name));
grid.innerHTML = "", list.forEach(b => {
const div = makeKillableCard(b, {
uid: "lab",
onImgTap: cardDiv => { cardDiv.dataset.gone || labPick(b, cardDiv, grid, !0) },
onKill: cardDiv => {
bugsOwned = bugsOwned.filter(x => x.id !== b.id), labSt.pA?.id === b.id && (labSt.pA = null), labSt.pB?.id === b.id && (labSt.pB = null), labBar();
freezeCardAsGone(cardDiv), labApplyAll(grid)
}
});
const btn = document.createElement("button");
btn.className = "bt-sel", btn.style = "width:100%;margin-top:4px;font-size:10px;", div.appendChild(btn), div.dataset.bid = b.id, labApplyCard(div, b), div.onclick = e => {
if (e.stopPropagation(), div.dataset.gone) return;
closeKill(), labPick(b, div, grid, !1)
}, grid.appendChild(div)
}), labBar()
}
function labBar() {
const bar = $("lab-topbar");
if (!bar) return;
const st = labSt;
if (st.pA && st.pB) {
bar.innerHTML = `<button class="nav-lab wide">🧬 Breed ${st.pA.name} and ${st.pB.name}</button>`;
bar.querySelector("button").onclick = e => { e.stopPropagation(), breedNow() }
} else {
bar.innerHTML = '<button class="prim wide" disabled>Select Parent A and Parent B</button>'
}
}
function closeKill() {
if (!window.killPh) return;
window.killPhClose && window.killPhClose();
window.killPhClose = null, window.killPh = null
}
const HUE_OFF = [-40, -20, 20, 40];
const mutQ4 = () => { const r = random(); return r < .25 ? -1 : r < .5 ? 0 : r < .75 ? 1 : 2 };
function markMeta(card, b) {
if (!b.meta) return;
const rows = card.querySelectorAll(".sr");
SK.forEach((k, i) => {
const row = rows[i + 1], m = b.meta[k];
if (!row || !m) return;
const sp = document.createElement("span");
sp.className = "sv", sp.style = "font-size:8px;width:24px;text-align:left;color:" + (m.d > 0 ? "#4f8" : m.d < 0 ? "#e44" : "#888");
sp.textContent = m.src + (m.d ? (m.d > 0 ? " +" : " ") + m.d : ""), row.appendChild(sp)
})
}
function computeOffspring(a, b) {
const child = { gen: max(a.gen, b.gen) + 1, name: genName(), meta: {} };
const hr = random();
child.hue = hr < 1 / 3 ? a.hue : hr < 2 / 3 ? b.hue : ((random() < .5 ? a.hue : b.hue) + HUE_OFF[ri(4)] + 360) % 360, child.morph = mixMorph(a, b);
SK.forEach(k => {
const fromA = random() < .5;
child[k] = fromA ? a[k] : b[k], child.meta[k] = { src: fromA ? "A" : "B", d: 0 }
});
shuf(SK.slice()).slice(0, 2).forEach(k => {
const was = child[k];
child[k] = clamp(was + mutQ4(), 1, 10), child.meta[k].d = child[k] - was
});
return inheritAbilities(child, a, b), child
}
function labBack() {
const newId = labSt.larva.id;
labSt.larva = null, openLab(!0), setTimeout(() => {
const div = document.querySelector(`.pick-grid .card[data-bid="${newId}"]`);
div && (div.scrollIntoView({
block: "center"
}), flashBlocked(div))
}, 250)
}
