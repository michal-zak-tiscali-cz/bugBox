let design = Object.assign({ hue: 120, con: 5, str: 5, agi: 5, int: 5, per: 5, abils: ["", "", "", ""] }, randomMorph()),
designAnim = null, designSide = 0;
function designSliderRows() {
const rows = [["hue", "Hue", 0, 359]];
for (const k in MORPH_RANGE) rows.push([k, {
bodySegments: "Segments", segmentGradient: "Gradient", bodyLength: "Length",
bodyWidth: "Width", headSize: "Head", legSpan: "Legs"
}[k], MORPH_RANGE[k][0], MORPH_RANGE[k][1]]);
return rows
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
renderDesignExtras()
}
});
const sideBtn = $("dz-side");
sideBtn && (sideBtn.onclick = () => { designSide = designSide ? 0 : 1, renderDesignExtras() })
}
function bindRange(k) {
const el = $("dz-" + k);
el.oninput = () => { design[k] = parseInt(el.value), $("dz-val-" + k).textContent = el.value }
}
function openDesignOverlay() {
overlay("design-ov", 1), achieve("designer");
const ctr = $("design-controls");
if (!ctr.dataset.done) {
ctr.dataset.done = "1";
ctr.innerHTML = designSliderRows().map(([k, lbl, lo, hi]) =>
`<div class="dz-row"><span class="dz-lbl">${lbl} <b id="dz-val-${k}">${design[k]}</b></span>
       <input type="range" id="dz-${k}" min="${lo}" max="${hi}" value="${design[k]}"></div>`).join("") +
`<div class="dz-row"><span class="dz-lbl">Head gear</span>
       <select id="dz-headGear">${GEAR_KEYS.map(g=>`<option value="${g}"${g===design.headGear?" selected":""}>${GEAR_LABEL[GEAR[g].t]} ${g.endsWith("extrawide")?"XW":g.endsWith("_wide")?"W":"N"}</option>`).join("")}</select></div>`;
designSliderRows().forEach(([k]) => bindRange(k));
$("dz-headGear").onchange = e => design.headGear = e.target.value;
$("btn-design-random").onclick = () => {
design = Object.assign({}, design, { hue: ri(360) }, randomMorph());
designSliderRows().forEach(([k]) => {
$("dz-" + k).value = design[k];
$("dz-val-" + k).textContent = design[k]
});
$("dz-headGear").value = design.headGear;
renderDesignExtras()
};
$("btn-design-spawn").onclick = spawnDesignedBug
}
renderDesignExtras();
$("btn-design-spawn").textContent = combatMode ? "DROP INTO FIGHT" : "SPAWN";
const cv = $("design-cv"), ctx = hidpi(cv, 150, 130);
cancelAnimationFrame(designAnim);
! function tick() {
ctx.clearRect(0, 0, 150, 130), ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 150, 130);
const cfg = design;
drawMorphBug(ctx, cfg, morphColor(design.hue), 75, 65 + 2 * cfg.headSize, 0,
{ scale: 3.06, walkL: .006 * performance.now(), walkR: .006 * performance.now() });
designAnim = requestAnimationFrame(tick)
}()
}
function closeDesignOverlay() {
cancelAnimationFrame(designAnim), overlay("design-ov", 0)
}
function spawnDesignedBug() {
designDefaults();
const { hue, con, str, agi, int: intel, per, abils, ...m } = design,
statSet = { con: con, str: str, agi: agi, int: intel, per: per },
picked = abils.filter(a => a),
nb = makeBug({ hue: hue, morph: { ...m }, ...statSet, abilities: picked });
if (!combatMode) return bugbox.push(nb), achOwn(1), void updateMoney();
const mhp = maxHpOf(nb);
nb.mood = "seeking", nb.curHp = mhp;
const lw = boxLW, lh = boxLH,
c = bugEntity(nb, 0 === designSide ? .18 * lw : .82 * lw, 30 + random() * (lh - 60), 0 === designSide ? 0 : PI, designSide);
c.vel.wanderAngle = 0;
c.combat = { ...COMBAT_DEFAULTS, curHp: mhp, maxHp: mhp };
ecsSpawn(c);
}
