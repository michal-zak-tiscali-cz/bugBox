let dz = Object.assign({ hue: 120, con: 5, str: 5, agi: 5, int: 5, per: 5, link: 1, abils: ["", "", "", ""] }, randomMorph()),
dzSide = 0, dzZoom = 1;
Object.assign(dz, statMorph(dz));
const DZ_ROWS = [["hue", "Hue", 0, 340, 20], ["bodySegments", "Segments"], ["segmentGradient", "Gradient"],
["headGear", "Gear type", 0, GEAR_KEYS.length - 1], ["bodyLength", "Length"], ["bodyWidth", "Width"],
["legLen", "Legs"], ["headSize", "Head"], ["headGearSize", "Gear size"]],
DZ_RED = ["hue", "bodySegments", "segmentGradient", "headGear"],
dzLo = r => r[2] ?? MORPH_RANGE[r[0]][0],
dzStep = r => r[4] ?? 1,
dzHi = r => r[3] ?? MORPH_RANGE[r[0]][1],
dzVal = k => k === "headGear" ? GEAR_KEYS.indexOf(dz.headGear) : dz[k],
dzTxt = k => k === "headGear" ? GEAR_LABEL[dz.headGear] : k === "headGearSize" ? SIZE_LABEL[dz.headGearSize] : dz[k],
dzLocked = k => dz.link && k in MORPH_STAT;
function dzRefresh() {
DZ_ROWS.forEach(r => {
const k = r[0], el = $("dz-" + k);
if (!el) return;
const lock = dzLocked(k);
el.disabled = lock, el.value = dzVal(k), $("dz-val-" + k).textContent = dzTxt(k);
el.parentNode.className = "dz-row" + (DZ_RED.includes(k) ? " dzr" : "") + (lock ? " dzl" : "")
});
SK.forEach(k => { const e = $("dz-val-" + k); e && (e.textContent = dz[k]) })
}
function dzDefaults() {
dz.abils || (dz.abils = ["", "", "", ""]);
SK.forEach(k => dz[k] == null && (dz[k] = 5))
}
function dzAbils(slot) {
dzDefaults();
const taken = dz.abils.filter((a, i) => a && i !== slot);
return `<option value="">Ability ${slot + 1}</option>` + ABIL_IDS.filter(id => !taken.includes(id))
.sort((a, b) => SK.indexOf(ABILITIES[a].stat) - SK.indexOf(ABILITIES[b].stat) || ABILITIES[a].name.localeCompare(ABILITIES[b].name))
.map(id => `<option value="${id}"${dz.abils[slot] === id ? " selected" : ""}>(${ABILITIES[id].stat.toUpperCase()}) ${ABILITIES[id].name}</option>`).join("")
}
function dzStatRows() {
dzDefaults();
return SK.map(k => `<div class="dz-row"><span class="dz-lbl">${k.toUpperCase()} <b id="dz-val-${k}">${dz[k]}</b></span>
     <input type="range" id="dz-${k}" min="1" max="10" value="${dz[k]}"></div>`).join("")
}
function dzExtras() {
dzDefaults();
$("dz-extras").innerHTML = dzStatRows();
$("dz-abils").innerHTML =
[0, 1, 2, 3].map(i => `<div class="dz-row"><select id="dz-abil-${i}">${dzAbils(i)}</select></div>`).join("") +
(combatState ? `<div class="dz-row"><span class="dz-lbl">Add to</span>
       <button class="bt" id="bt-des-side" style="padding:2px 8px;">${dzSide === 0 ? "YOUR TEAM" : "ENEMY"}</button></div>` : "");
SK.forEach(bindRange);
[0, 1, 2, 3].forEach(i => {
$("dz-abil-" + i).onchange = ev => {
dz.abils[i] = ev.target.value;
const id = ev.target.value;
if (id) { const k = ABILITIES[id].stat; dz[k] = max(dz[k], 5) }
dz.link && Object.assign(dz, statMorph(dz)), dzExtras(), dzRefresh()
}
});
const sideBtn = $("bt-des-side");
sideBtn && (sideBtn.onclick = () => { dzSide = dzSide ? 0 : 1, dzExtras() })
}
function bindRange(k) {
const el = $("dz-" + k);
el.oninput = () => {
const v = parseInt(el.value);
k === "headGear" ? dz.headGear = GEAR_KEYS[v] : dz[k] = v;
SK.includes(k) && dz.link && Object.assign(dz, statMorph(dz)), dzRefresh()
}
}
function openDz() {
ov("ov-design", 1);
const ctr = $("dz-ctr");
if (!ctr.dataset.done) {
ctr.dataset.done = "1";
ctr.innerHTML = `<div class="dz-row"><span class="dz-lbl">Stat-linked</span>
       <input type="checkbox" id="dz-link"${dz.link?" checked":""}></div>` +
DZ_ROWS.map(r => `<div class="dz-row"><span class="dz-lbl">${r[1]} <b id="dz-val-${r[0]}">${dzTxt(r[0])}</b></span>
       <input type="range" id="dz-${r[0]}" min="${dzLo(r)}" max="${dzHi(r)}" step="${dzStep(r)}" value="${dzVal(r[0])}"></div>`).join("");
DZ_ROWS.forEach(r => bindRange(r[0]));
$("dz-link").onchange = e => {
dz.link = e.target.checked ? 1 : 0;
dz.link && Object.assign(dz, statMorph(dz)), dzRefresh()
};
$("bt-des-rnd-m").onclick = () => {
const m = randomMorph();
dz.link && Object.keys(MORPH_STAT).forEach(k => delete m[k]);
Object.assign(dz, { hue: 20 * ri(18) }, m), dzRefresh(), dzExtras()
};
$("bt-des-rnd-s").onclick = () => {
dzDefaults(), SK.forEach(k => dz[k] = 1 + ri(10));
dz.link && Object.assign(dz, statMorph(dz)), dzRefresh(), dzExtras()
};
$("dz-zoom").oninput = ev => dzZoom = (500 - ev.target.value) / 100;
$("bt-des-spawn").onclick = dzSpawn
}
dzExtras(), dzRefresh();
dzFit();
$("bt-des-spawn").textContent = "Spawn";
const cv = $("dz-cv"), ctx = hidpi(cv, 150, 130);
cancelAnimationFrame(dzAnim);
! function tick() {
ctx.clearRect(0, 0, 150, 130), ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 150, 130);
drawMorphBug(ctx, dz, morphColor(dz.hue), 75, 65 + 2 * dz.headSize * dzZoom, 0,
{ scale: dzZoom, walkL: .006 * performance.now(), walkR: .006 * performance.now() });
dzAnim = requestAnimationFrame(tick)
}()
}
function dzFit() {
const r = boxCv.getBoundingClientRect(), fr = $("dz-box");
if (!r.height) return;
fr.style.maxHeight = (r.height - 8) + "px";
fr.style.marginTop = max(4, r.top + (r.height - fr.offsetHeight) / 2) + "px"
}
function dzSpawn() {
dzDefaults();
const { hue, con, str, agi, int: intel, per, abils, link, ...m } = dz,
picked = abils.filter(a => a),
nb = makeBug({ hue: hue, morph: { ...m }, con: con, str: str, agi: agi, int: intel, per: per, abilities: picked });
if (link || Object.assign(nb.morph, m), !combatState) return bugsOwned.push(nb), achOwn(1), void updateMoney();
const mhp = maxHpOf(nb);
nb.mood = "seeking", nb.curHp = mhp;
const lw = boxLW, lh = boxLH,
c = bugEntity(nb, 0 === dzSide ? .18 * lw : .82 * lw, 30 + random() * (lh - 60), 0 === dzSide ? 0 : PI, dzSide);
c.vel.wanderAngle = 0;
c.combat = { ...COMBAT_DEFAULTS, curHp: mhp, maxHp: mhp };
ecsSpawn(c);
}
