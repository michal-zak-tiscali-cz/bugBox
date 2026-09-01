function openBreedScreen(scrollToBottom) {
breedSt = {
phase: "pick",
pA: null,
pB: null,
fA: 0,
fB: 0,
fL: 0,
larva: null
}, showScreen("s-breed"), renderBreed();
const lay = $("breed-layout");
lay && (lay.scrollTop = scrollToBottom ? lay.scrollHeight : 0)
}
function renderBreed() {
updateMoney();
const lay = $("breed-layout"),
st = breedSt;
if ("pick" === st.phase) {
lay.innerHTML = "";
const tip = document.createElement("div");
tip.style = "font-size:8px;color:#888;width:100%;max-width:700px;text-align:center;margin-bottom:2px;";
tip.textContent = "Tip: click the bug picture for the option to kill it";
lay.appendChild(tip);
const sortRow = document.createElement("div");
sortRow.style = "display:flex;gap:4px;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;max-width:700px;margin-bottom:4px;";
sortRow.innerHTML = '<span style="font-size:9px;color:#888;">Sort by</span>' +
BREED_SORT.map(([k, l]) => `<button class="btn-std${breedSort===k?" card-sel":""}" style="min-width:0;height:auto;padding:2px 7px;font-size:9px;" onclick="setBreedSort('${k}')">${l}</button>`).join("");
lay.appendChild(sortRow);
const bar = document.createElement("div");
lay.style.cursor = "", lay.onclick = null, bar.id = "breed-topbar", bar.style = "width:100%;max-width:700px;", lay.appendChild(bar);
const grid = document.createElement("div");
return grid.className = "pick-grid", lay.appendChild(grid), renderBreedPickGrid(grid), void updateBreedSlots()
}
if ("result" === st.phase) {
const l = st.larva, pA = st.pA, pB = st.pB;
lay.innerHTML = `
      <div class="phase-box" style="max-width:520px;">
        <h3 class="tc">🥚 NEW BUG!</h3>
        <div id="hatch-parents-row" style="display:flex;gap:8px;justify-content:center;align-items:flex-start;margin:10px 0;"></div>
        <div id="hatch-child-row" style="display:flex;justify-content:center;margin:10px 0;"></div>
        <div class="tc"><button class="breed-nav btn-std" style="width:160px;padding:6px 28px;height:auto;" onclick="hatchBug()">← Breeding Lab 🧬</button></div>
      </div>`;
lay.style.cursor = "pointer", lay.onclick = e => { window.killPh || hatchBug() };
const parentsRow = $("hatch-parents-row"),
childRow = $("hatch-child-row");
const mkCard = (bug, dead, isChild, lbl) => {
if (dead || !bug) {
const div = document.createElement("div");
div.className = "bcard", div.style = "position:relative;flex:1;min-width:0;max-width:170px;box-sizing:border-box;";
div.innerHTML = '<div class="empty-note">— gone —</div>';
return div
}
const card = makeKillableCard(bug, {
uid: "hatch",
extraStyle: "flex:1;min-width:0;max-width:170px;",
onKill: cardDiv => {
bugbox = bugbox.filter(x => x.id !== bug.id);
isChild ? (l.dead = !0) : (pA === bug ? st.pAdead = !0 : st.pBdead = !0);
freezeCardAsGone(cardDiv)
}
});
if (lbl) {
const bn = card.querySelector(".uc-name");
bn && (bn.innerHTML = `<span style="color:${lbl==="A"?"#ffdd44":"#44ff88"}">(${lbl}) </span>${bug.name}`)
}
return card
};
if (pA || st.pAdead) parentsRow.appendChild(mkCard(pA, st.pAdead, !1, "A"));
if (pB || st.pBdead) parentsRow.appendChild(mkCard(pB, st.pBdead, !1, "B"));
childRow.appendChild(mkCard(l.dead ? null : l, l.dead, !0));
return
}
}
function breedApplyCard(div, b) {
const isA = breedSt.pA?.id === b.id,
isB = breedSt.pB?.id === b.id,
bn = div.querySelector(".uc-name");
bn && (bn.innerHTML = `${isA?'<span style="color:#ffdd44">(A) </span>':isB?'<span style="color:#44ff88">(B) </span>':""}${b.name}`);
const old = div.querySelector(".breed-go");
old && old.remove();
if (breedSt.pA && breedSt.pB && (isA || isB)) {
const info = div.querySelector(".uc-info"),
gb = document.createElement("button");
gb.className = "breed-nav breed-go", gb.style = "font-size:10px;padding:3px 8px;margin-top:3px;", gb.textContent = "🧬 Breed", gb.onclick = e => { e.stopPropagation(), doBreedNow() };
info && info.appendChild(gb)
}
const btn = div.querySelector(".card-sel-btn");
btn && (btn.textContent = isA || isB ? "Deselect" : "Select"), div.classList.toggle("card-sel", isA || isB)
}
function doBreedNow() {
if (boxFull()) return void toast("Terrarium full");
breedSt.pA && breedSt.pB ? (breedSt.larva = makeBug({
...computeOffspring(breedSt.pA, breedSt.pB),
wins: 0,
losses: 0
}), breedSt.pA.mated = breedSt.pB.mated = 1, achKids(breedSt.pA, breedSt.pB), bugbox.push(breedSt.larva), achOwn(1), achChild(breedSt.larva), trackDynasty(breedSt.larva.gen), SFX.hatch(), breedSt.phase = "result", renderBreed()) : toast("Select two bugs!")
}
function breedApplyAll(grid) {
grid.querySelectorAll(".bcard").forEach(div => {
const b = bugbox.find(x => String(x.id) === div.dataset.bid);
b && breedApplyCard(div, b)
}), updateBreedSlots()
}
function labPick(b, div, grid, addOnly) {
const selected = breedSt.pA?.id === b.id || breedSt.pB?.id === b.id;
if (selected && addOnly) return;
if (!selected && (hpFrac(b) < 1 || b.mated)) return void flashBlocked(div);
if (!selected && boxFull()) return flashBlocked(div), void toast("Terrarium full");
breedSt.pA?.id === b.id ? (breedSt.pA = breedSt.pB, breedSt.pB = null) : breedSt.pB?.id === b.id ? breedSt.pB = null : breedSt.pA ? breedSt.pB ? (breedSt.pA = breedSt.pB, breedSt.pB = b) : breedSt.pB = b : breedSt.pA = b, breedApplyAll(grid)
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
let breedSort = null;
function setBreedSort(k) { breedSort = breedSort === k ? null : k, renderBreed() }
function renderBreedPickGrid(grid) {
const sorter = BREED_SORT.find(r => r[0] === breedSort),
list = [...bugbox].sort((x, y) => sorter ? sorter[2](y) - sorter[2](x) : x.name.localeCompare(y.name));
grid.innerHTML = "", list.forEach(b => {
const div = makeKillableCard(b, {
uid: "lab",
onImgTap: cardDiv => { cardDiv.dataset.gone || labPick(b, cardDiv, grid, !0) },
onKill: cardDiv => {
bugbox = bugbox.filter(x => x.id !== b.id), breedSt.pA?.id === b.id && (breedSt.pA = null), breedSt.pB?.id === b.id && (breedSt.pB = null), updateBreedSlots();
freezeCardAsGone(cardDiv), breedApplyAll(grid)
}
});
const btn = document.createElement("button");
btn.className = "breed-btn card-sel-btn", btn.style = "width:100%;margin-top:4px;font-size:10px;", div.appendChild(btn), div.dataset.bid = b.id, breedApplyCard(div, b), div.onclick = e => {
if (e.stopPropagation(), div.dataset.gone) return;
closeKillOverlay(), labPick(b, div, grid, !1)
}, grid.appendChild(div)
}), updateBreedSlots()
}
function updateBreedSlots() {
const bar = $("breed-topbar");
if (!bar) return;
const st = breedSt;
if (st.pA && st.pB) {
bar.innerHTML = `<button class="breed-nav btn-wide">🧬 Breed ${st.pA.name} and ${st.pB.name}</button>`;
bar.querySelector("button").onclick = e => { e.stopPropagation(), doBreedNow() }
} else {
bar.innerHTML = '<button class="prim btn-wide" disabled>Select Parent A and Parent B</button>'
}
}
function closeKillOverlay() {
if (!window.killPh) return;
window.killPhClose && window.killPhClose();
window.killPhClose = null, window.killPh = null
}
function computeOffspring(a, b) {
const child = {
gen: max(a.gen, b.gen) + 1
};
child.hue = random() < .5 ? a.hue : b.hue, child.morph = mixMorph(a, b), child.name = genName(), SK.forEach(k => {
const hi = max(a[k], b[k]), lo = min(a[k], b[k]);
let v = (hi + lo) / 2 + STAT_ELITE_BIAS * (hi - lo) / 2;
const head = clamp((10 - v) / 9, 0, 1),
up = STAT_UP_BASE + STAT_UP_HEAD * head,
r = random();
r < up ? v += 1 + (random() < STAT_UP_BIG ? 1 : 0) : r < up + STAT_DOWN && (v -= 1);
child[k] = round(clamp(v, 1, 10))
});
return inheritAbilities(child, a, b), child
}
function hatchBug() {
const newId = breedSt.larva.id;
breedSt.larva = null, openBreedScreen(!0), setTimeout(() => {
const div = document.querySelector(`.pick-grid .bcard[data-bid="${newId}"]`);
div && (div.scrollIntoView({
block: "center"
}), flashBlocked(div))
}, 250)
}
