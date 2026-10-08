function hpColor(frac) {
const p = clamp(frac, 0, 1) * 100;
return p >= 100 ? "#4cf" : p >= 75 ? "#00ff66" : p >= 50 ? "#cccc22" : p >= 20 ? "#cc7722" : "#cc3333"
}
function vHpBar(frac, h) {
h = h || 26;
const pct = clamp(frac, 0, 1) * 100;
return `<div style="width:3px;height:${h}px;border:1px solid #555566;flex-shrink:0;position:relative;background:#0a0a12;"><div style="position:absolute;left:0;bottom:0;width:100%;height:${pct}%;background:${hpColor(frac)};"></div></div>`
}
function abilLine(b, dead) {
const col = dead ? "#555" : "#c8f";
const txt = (b.abilities && b.abilities.length) ? b.abilities.map(id => "\u2b22" + ABILITIES[id].name).join(" ") : "";
return `<div class="card-abils" style="color:${col};">${txt}</div>`
}
function drawHpBar(p, frac, r, col) {
const c = boxCx, w = 20, h = 3, x = p.x - w / 2, y = p.y - r - 8;
c.fillStyle = "#0a0a12", c.fillRect(x, y, w, h);
c.strokeStyle = "#555566", c.lineWidth = 1, c.strokeRect(x, y, w, h);
c.fillStyle = col || hpColor(frac), c.fillRect(x, y, w * clamp(frac, 0, 1), h)
}
function drawPrepBar(p, frac, r) {
const c = boxCx, w = 20, x = p.x - w / 2, y = p.y - r - 4;
c.fillStyle = "#1a1a1a", c.fillRect(x, y, w, 2), c.fillStyle = "#fff", c.fillRect(x, y, w * frac, 2)
}
function bugCardBody(o) {
const hp = o.showHp ? vHpBar(o.dead ? 0 : o.hpFrac, 38) : "",
img = `<div class="card-img" id="${o.imgId}"></div>`,
info = `<div class="card-info"><div class="card-name">${o.name}</div><div class="card-line">${o.line3}</div></div>`;
return `<div class="card-head">${hp}${img}${info}</div>${statBars(o.statsObj, { dead: !!o.dead, scaleMax: o.scaleMax })}${abilLine(o.abilB, o.dead)}`
}
function makeBugCard(o) {
const div = document.createElement("div");
div.className = "card";
o.style && (div.style = o.style);
div.innerHTML = bugCardBody(o);
const ph = div.querySelector("#" + o.imgId);
if (ph) { const cv = bugCardH(o.img, o.imgW, o.imgH); ph.appendChild(cv), cv.style.margin = "0" }
return div
}
function makeKillableCard(bug, opts) {
opts = opts || {};
const imgId = "kc-ph-" + bug.id + "-" + (opts.uid || "");
const div = makeBugCard({
name: bug.name,
line3: opts.line3 || gkfLine(bug),
statsObj: bug,
abilB: bug,
dead: !1,
showHp: !0,
hpFrac: hpFrac(bug),
imgId: imgId,
img: bug,
style: "position:relative;" + (opts.extraStyle || "")
});
const phEl = div.querySelector("#" + imgId);
const infoEl = div.querySelector(".card-info");
infoEl.style.position = "relative";
infoEl.style.minHeight = "30px";
const skullWrap = document.createElement("div");
skullWrap.style = "display:none;align-items:center;justify-content:center;cursor:pointer;position:absolute;inset:0;border:1px solid #2a2a4a;background:#0a0a12;box-sizing:border-box;";
skullWrap.innerHTML = '<span style="font-size:20px;">💀</span>';
infoEl.appendChild(skullWrap);
const infoKids = () => Array.from(infoEl.children).filter(k => k !== skullWrap);
if (phEl) {
phEl.style.cursor = "pointer";
const bc = phEl.firstChild;
bc.onclick = ev => {
if (ev.stopPropagation(), window.killPh === phEl) return closeKill(), void flashBlocked(div);
closeKill(), window.killPh = phEl, flashBlocked(div);
infoKids().forEach(k => k.style.visibility = "hidden"), skullWrap.style.display = "flex";
window.killPhClose = () => { infoKids().forEach(k => k.style.visibility = ""), skullWrap.style.display = "none" };
opts.onImgTap && opts.onImgTap(div)
}
}
skullWrap.onclick = e2 => {
e2.stopPropagation(), flashBlocked(div), achieve("cull"), achieve("kill"), run.end = bug.name + " culled", setTimeout(() => {
window.killPh = null, window.killPhClose = null;
opts.onKill && opts.onKill(div)
}, 150)
};
return div
}
function freezeCardAsGone(div) {
div.classList.remove("card-sel", "card-sel2", "blocked-fill", "blocked-fade");
delete div.dataset.bid;
div.dataset.gone = "1", div.style.cursor = "default";
const fixedW = div.offsetWidth, fixedH = div.offsetHeight;
div.style.width = fixedW + "px", div.style.height = fixedH + "px", div.style.boxSizing = "border-box";
div.innerHTML = '<div style="font-size:9px;color:#445;text-align:center;padding:' + max(0, (fixedH - 20) / 2) + 'px 0;">— gone —</div>'
}
function gkfLine(b) { return `Gen ${b.gen} \u00b7 K${b.killsTotal||0}/F${b.fights||0}${b.mated?'<br><span style="color:#c8f;">mated</span>':""}` }
let fow = 0;
function toggleFow() { fow = fow ? 0 : 1, syncFowBtn(), syncHud(!0) }
function syncFowBtn() {
inspected == null && (fow = 0);
const el = $("bt-fow");
if (!el) return;
const show = inspected != null;
el.style.display = show ? "" : "none";
show && el.classList.toggle("prim", !!fow)
}
const entOf = b => ecsQuery("bug").find(en => C.bug.get(en) === b);
function liveHp(b) {
const cb = C.combat.get(entOf(b));
return cb ? [max(0, round(cb.curHp)), cb.maxHp] : [round(b.curHp == null ? maxHpOf(b) : b.curHp), maxHpOf(b)]
}
function inspectLine(b) {
const [hp, mhp] = liveHp(b);
return `${b.name} | Gen${b.gen} | K${b.killsTotal||0}/F${b.fights||0} | ` +
SK.map((k, i) => `<span style="color:#44ff88;font-size:9px;">${SN[i]}:${round(b[k])}</span>`).join(" ") +
` | <span style="color:${hp>=mhp?"#44ff88":"#ff5555"};">${hp}/${mhp}</span> ${C.walk.get(entOf(b))?.act ?? ""}` +
abilTags(b)
}
let toastQ = [], toastBot = 96;
const toastLbl = (el = $("toast")) => (el.textContent = toastQ[0], el.style.boxShadow = toastQ.slice(1, 4).map((_, i) => (i = 3 * i + 3, `${i}px ${-i}px 0 -1px #0d0d2a,${i}px ${-i}px 0 #3a3aff`)).join() || "none");
function toast(m) { toastQ.push(m) > 1 ? toastLbl() : toastNext() }
function toastNext() {
const el = $("toast"), r = $("terr-canvas").getBoundingClientRect();
r.height && (toastBot = innerHeight - r.bottom + 10), el.style.bottom = toastBot + "px";
toastLbl(), el.classList.add("show"), setTimeout(() => (el.classList.remove("show"), setTimeout(() => (toastQ.shift(), toastQ.length && toastNext()), 300)), 2000)
}
function flashBlocked(div) {
div.classList.remove("blocked-fade"), div.classList.add("card-sel2", "blocked-fill"), requestAnimationFrame(() => requestAnimationFrame(() => {
div.classList.add("blocked-fade"), div.classList.remove("blocked-fill")
})), setTimeout(() => {
div.classList.remove("card-sel2", "blocked-fill", "blocked-fade")
}, 350)
}
