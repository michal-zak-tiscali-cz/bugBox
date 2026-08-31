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
return `<div class="uc-abils" style="color:${col};">${txt}</div>`
}
function drawHpBar(p, frac) {
const c = boxCx, w = 3, h = 24, x = p.x - 15 - w / 2, y = p.y - h / 2;
c.strokeStyle = "#555566", c.lineWidth = 1, c.strokeRect(x, y, w, h);
c.fillStyle = "#0a0a12", c.fillRect(x, y, w, h);
c.fillStyle = hpColor(frac), c.fillRect(x, y + h * (1 - frac), w, h * frac)
}
function bugCardBody(o) {
const hp = o.showHp ? vHpBar(o.dead ? 0 : o.hpFrac, 38) : "",
img = `<div class="uc-img" id="${o.imgId}"></div>`,
info = `<div class="uc-info"><div class="uc-name">${o.name}</div><div class="uc-line3">${o.line3}</div></div>`;
return `<div class="uc-head">${hp}${img}${info}</div>${statBars(o.statsObj, { dead: !!o.dead, scaleMax: o.scaleMax })}${abilLine(o.abilB, o.dead)}`
}
function makeBugCard(o) {
const div = document.createElement("div");
div.className = "bcard";
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
const infoEl = div.querySelector(".uc-info");
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
if (ev.stopPropagation(), window.killPh === phEl) return closeKillOverlay(), void flashBlocked(div);
closeKillOverlay(), window.killPh = phEl, flashBlocked(div);
infoKids().forEach(k => k.style.visibility = "hidden"), skullWrap.style.display = "flex";
window.killPhClose = () => { infoKids().forEach(k => k.style.visibility = ""), skullWrap.style.display = "none" };
opts.onImgTap && opts.onImgTap(div)
}
}
skullWrap.onclick = e2 => {
e2.stopPropagation(), flashBlocked(div), achieve("cull"), setTimeout(() => {
window.killPh = null, window.killPhClose = null;
opts.onKill && opts.onKill(div)
}, 150)
};
return div
}
function freezeCardAsGone(div) {
div.classList.remove("card-sel", "card-sel-blue", "blocked-fill", "blocked-fade");
delete div.dataset.bid;
div.dataset.gone = "1", div.style.cursor = "default";
const fixedW = div.offsetWidth, fixedH = div.offsetHeight;
div.style.width = fixedW + "px", div.style.height = fixedH + "px", div.style.boxSizing = "border-box";
div.innerHTML = '<div style="font-size:9px;color:#445;text-align:center;padding:' + max(0, (fixedH - 20) / 2) + 'px 0;">— gone —</div>'
}
function gkfLine(b) { return `Gen ${b.gen} \u00b7 K${b.killsTotal||0}/F${b.fights||0}${b.mated?' \u00b7 <span style="color:#c8f;">mated</span>':""}` }
let fow = 0;
function toggleFow() { fow = fow ? 0 : 1, syncHud(!0) }
function liveHp(b) {
const e = ecsQuery("bug", "combat").find(en => C.bug.get(en) === b),
cb = e == null ? null : C.combat.get(e);
return cb ? [max(0, round(cb.curHp)), cb.maxHp] : [round(b.curHp == null ? maxHpOf(b) : b.curHp), maxHpOf(b)]
}
function inspectLine(b) {
const [hp, mhp] = liveHp(b);
return `${b.name} | Gen${b.gen} | K${b.killsTotal||0}/F${b.fights||0} | ` +
SK.map((k, i) => `<span style="color:#44ff88;font-size:9px;">${SN[i]}:${round(b[k])}</span>`).join(" ") +
` | <span style="color:${hp>=mhp?"#44ff88":"#ff5555"};">${hp}/${mhp}</span>` +
abilTags(b) +
` <button onclick="toggleFow()" style="font-size:8px;padding:1px 6px;margin-left:6px;${fow?"background:#0d0d2a;border-color:#5a5aff;color:#aaf;":""}">FOW</button>`
}
let toastTimer = null;
function toast(m) {
const el = $("toast");
el.textContent = m, el.classList.add("show"), toastTimer && clearTimeout(toastTimer), toastTimer = setTimeout(() => el.classList.remove("show"), 2800)
}
