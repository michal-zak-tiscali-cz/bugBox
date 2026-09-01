let design = Object.assign({ hue: 120, con: 5, str: 5, agi: 5, int: 5, per: 5, link: 1, abils: ["", "", "", ""] }, randomMorph()),
designAnim = null, designSide = 0;
Object.assign(design, statMorph(design));
const DZ_ROWS = [["hue", "Hue", 0, 359], ["bodySegments", "Segments"], ["segmentGradient", "Gradient"],
["bodyLength", "Length"], ["bodyWidth", "Width"], ["headSize", "Head"], ["legLen", "Legs"],
["headGear", "Gear type", 0, GEAR_KEYS.length - 1], ["headGearSize", "Gear size"]],
DZ_RED = ["hue", "bodySegments", "segmentGradient"],
dzLo = r => r[2] ?? MORPH_RANGE[r[0]][0],
dzHi = r => r[3] ?? MORPH_RANGE[r[0]][1],
dzVal = k => k === "headGear" ? GEAR_KEYS.indexOf(design.headGear) : design[k],
dzTxt = k => k === "headGear" ? GEAR_LABEL[design.headGear] : k === "headGearSize" ? SIZE_LABEL[design.headGearSize] : design[k],
dzLocked = k => design.link && k in MORPH_STAT;
function dzRandStat() {
const m = {};
for (const k in MORPH_STAT) { const [lo, hi] = MORPH_STAT[k]; m[k] = lo + ri(hi - lo + 1) }
return m
}
function dzRefresh() {
DZ_ROWS.forEach(r => {
const k = r[0], el = $("dz-" + k);
if (!el) return;
const lock = dzLocked(k);
el.disabled = lock, el.value = dzVal(k), $("dz-val-" + k).textContent = dzTxt(k);
el.parentNode.className = "dz-row" + (DZ_RED.includes(k) ? " dzr" : "") + (lock ? " dzl" : "")
});
SK.forEach(k => { const e = $("dz-val-" + k); e && (e.textContent = design[k]) })
}
function designDefaults() {
design.abils || (design.abils = ["", "", "", ""]);
SK.forEach(k => design[k] == null && (design[k] = 5))
}
function designAbilOptions(slot) {
designDefaults();
const taken = design.abils.filter((a, i) => a && i !== slot);
return '<option value="">-- none --</option>' + ABIL_IDS.filter(id => !taken.includes(id))
.sort((a, b) => SK.indexOf(ABILITIES[a].stat) - SK.indexOf(ABILITIES[b].stat) || ABILITIES[a].name.localeCompare(ABILITIES[b].name))
.map(id => `<option value="${id}"${design.abils[slot] === id ? " selected" : ""}>(${ABILITIES[id].stat.toUpperCase()}) ${ABILITIES[id].name}</option>`).join("")
}
function designStatRows() {
designDefaults();
return SK.map(k => `<div class="dz-row"><span class="dz-lbl">${k.toUpperCase()} <b id="dz-val-${k}">${design[k]}</b></span>
     <input type="range" id="dz-${k}" min="1" max="10" value="${design[k]}"></div>`).join("")
}
function renderDesignExtras() {
designDefaults();
const el = $("design-extras");
el.innerHTML = designStatRows() +
[0, 1, 2, 3].map(i => `<div class="dz-row"><span class="dz-lbl">Ability ${i+1}</span>
       <select id="dz-abil-${i}">${designAbilOptions(i)}</select></div>`).join("") +
(combatMode ? `<div class="dz-row"><span class="dz-lbl">Add to</span>
       <button class="btn-std" id="dz-side" style="padding:2px 8px;">${designSide === 0 ? "YOUR TEAM" : "ENEMY"}</button></div>` : "");
SK.forEach(bindRange);
[0, 1, 2, 3].forEach(i => {
$("dz-abil-" + i).onchange = ev => {
design.abils[i] = ev.target.value;
const id = ev.target.value;
if (id) { const k = ABILITIES[id].stat; design[k] = max(design[k], 5) }
design.link && Object.assign(design, statMorph(design)), renderDesignExtras(), dzRefresh()
}
});
const sideBtn = $("dz-side");
sideBtn && (sideBtn.onclick = () => { designSide = designSide ? 0 : 1, renderDesignExtras() })
}
function bindRange(k) {
const el = $("dz-" + k);
el.oninput = () => {
const v = parseInt(el.value);
k === "headGear" ? design.headGear = GEAR_KEYS[v] : design[k] = v;
SK.includes(k) && design.link && Object.assign(design, statMorph(design)), dzRefresh()
}
}
function openDesignOverlay() {
overlay("design-ov", 1), achieve("designer");
const ctr = $("design-controls");
if (!ctr.dataset.done) {
ctr.dataset.done = "1";
ctr.innerHTML = `<div class="dz-row"><span class="dz-lbl">Stat-linked</span>
       <input type="checkbox" id="dz-link"${design.link?" checked":""}></div>` +
DZ_ROWS.map(r => `<div class="dz-row"><span class="dz-lbl">${r[1]} <b id="dz-val-${r[0]}">${dzTxt(r[0])}</b></span>
       <input type="range" id="dz-${r[0]}" min="${dzLo(r)}" max="${dzHi(r)}" value="${dzVal(r[0])}"></div>`).join("");
DZ_ROWS.forEach(r => bindRange(r[0]));
$("dz-link").onchange = e => {
design.link = e.target.checked ? 1 : 0;
design.link && Object.assign(design, statMorph(design)), dzRefresh()
};
$("btn-design-random").onclick = () => {
Object.assign(design, { hue: ri(360) }, randomMorph(), design.link ? statMorph(design) : dzRandStat());
dzRefresh(), renderDesignExtras()
};
$("btn-design-spawn").onclick = spawnDesignedBug
}
renderDesignExtras(), dzRefresh();
$("btn-design-spawn").textContent = combatMode ? "DROP INTO FIGHT" : "SPAWN";
const cv = $("design-cv"), ctx = hidpi(cv, 150, 130);
cancelAnimationFrame(designAnim);
! function tick() {
ctx.clearRect(0, 0, 150, 130), ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 150, 130);
drawMorphBug(ctx, design, morphColor(design.hue), 75, 65 + 2 * design.headSize, 0,
{ scale: 2.2, walkL: .006 * performance.now(), walkR: .006 * performance.now() });
designAnim = requestAnimationFrame(tick)
}()
}
function closeDesignOverlay() {
cancelAnimationFrame(designAnim), overlay("design-ov", 0)
}
function spawnDesignedBug() {
designDefaults();
const { hue, con, str, agi, int: intel, per, abils, link, ...m } = design,
picked = abils.filter(a => a),
nb = makeBug({ hue: hue, morph: { ...m }, con: con, str: str, agi: agi, int: intel, per: per, abilities: picked });
if (link || Object.assign(nb.morph, m), !combatMode) return bugbox.push(nb), achOwn(1), void updateMoney();
const mhp = maxHpOf(nb);
nb.mood = "seeking", nb.curHp = mhp;
const lw = boxLW, lh = boxLH,
c = bugEntity(nb, 0 === designSide ? .18 * lw : .82 * lw, 30 + random() * (lh - 60), 0 === designSide ? 0 : PI, designSide);
c.vel.wanderAngle = 0;
c.combat = { ...COMBAT_DEFAULTS, curHp: mhp, maxHp: mhp };
ecsSpawn(c);
}
