const GEAR = {
pincers: [{ sizeMult: .85, sweep: .4, baseGap: .4, tip: .4 }, { sizeMult: 1.35, sweep: .95, baseGap: .7, tip: 1.1 }, { sizeMult: 1.8, sweep: 1.6, baseGap: .95, tip: 2 }],
ant: [{ spread: 1.1 }, { spread: 2 }, { spread: 3 }],
antb: [{ spread: 2.2, len: .28 }, { spread: 3.2, len: .28 }, { spread: 3.2, len: .56 }],
eyes: [{ spread: .4, fwd: .85, sizeMult: .35 }, { spread: .62, fwd: .65, sizeMult: .35 }, { spread: .9, fwd: .4, sizeMult: .35 }]
};
const GEAR_KEYS = Object.keys(GEAR);
const GEAR_LABEL = { pincers: "Pincers", ant: "Antennae", antb: "Antennae Bwd", eyes: "Eyes" };
const SIZE_LABEL = ["N", "W", "XW"];
const MORPH_FREE = { bodySegments: [1, 3], segmentGradient: [1, 5] };
const MORPH_STAT = { bodyLength: [16, 29], bodyWidth: [2, 11], headSize: [2, 6], legLen: [5, 14], headGearSize: [0, 2] };
const MORPH_RANGE = { ...MORPH_FREE, ...MORPH_STAT };
function statMorph(s) {
const g = k => clamp(round(s[k]), 1, 10), i = g("int"), p = g("per");
return { bodyLength: 1.5 * g("con") + 14, bodyWidth: g("str") + 1, headSize: 1 + floor((i + 1) / 2), legLen: g("agi") + 4, headGearSize: p < 4 ? 0 : p < 7 ? 1 : 2 }
}
function randomMorph() {
const m = {};
for (const k in MORPH_RANGE) { const [lo, hi] = MORPH_RANGE[k]; m[k] = lo + ri(hi - lo + 1) }
return m.headGear = GEAR_KEYS[ri(GEAR_KEYS.length)], m
}
function ensureMorph(b) { return b.morph || (b.morph = randomMorph()), b.morph }
function syncMorph(b) { return Object.assign(ensureMorph(b), statMorph(b)) }
function inheritThird(va, vb, pool) {
const r = random();
if (r < 1 / 3) return va;
if (r < 2 / 3) return vb;
const rest = pool.filter(v => v !== va && v !== vb);
return rest.length ? rest[ri(rest.length)] : va
}
function mixMorph(a, b) {
const ma = ensureMorph(a), mb = ensureMorph(b), m = {};
for (const k in MORPH_FREE) {
const [lo, hi] = MORPH_FREE[k], pool = [];
for (let v = lo; v <= hi; v++) pool.push(v);
m[k] = inheritThird(ma[k], mb[k], pool)
}
return m.headGear = inheritThird(ma.headGear, mb.headGear, GEAR_KEYS), m
}
function getSegmentScale(grad, s, segs) {
let i = s, g = grad;
g === 4 && (i = segs - 1 - s, g = 2), g === 5 && (i = segs - 1 - s, g = 1);
let sc = 1;
return g === 1 ? sc = 1 - .24 * i : g === 2 && (sc = 1 - .12 * i), max(sc, .1)
}
const hsl3 = (h, s, l) => `hsl(${h},${s}%,${l}%)`;
const SHADE = [null, { gear: 0, body: 2 }, { gear: 9, body: 9 }, null];
const NEON_BG = "#0a0809";
function bulgeGrad(t, gx, gy, r, hue, vol) {
if (vol < .05) return hsl3(hue, 62, 38);
const sp = vol * 3.6, dk = max(38 - sp, 6), g = t.createRadialGradient(gx, gy, r * .04, gx, gy, r * 1.05);
return g.addColorStop(0, hsl3(hue, 62, min(38 + sp, 72))), g.addColorStop(.45, hsl3(hue, 62, 38)),
g.addColorStop(.8, hsl3(hue, 62, (38 + dk) / 2)), g.addColorStop(1, hsl3(hue, 62, dk)), g
}
function strokeShades(hue, vol) {
return vol < .05 ? { base: hsl3(hue, 62, 38), over: null } :
{ base: hsl3(hue, 62, max(38 - 2 * vol, 8)), over: hsl3(hue, 62, min(38 + 1.6 * vol, 55)) }
}
function hexPath(t, cy, rx, ry) {
t.beginPath();
for (let k = 0; k < 6; k++) { const a = -HALF_PI + k * PI / 3, x = sin(a) * rx, y = cy + cos(a) * ry; k ? t.lineTo(x, y) : t.moveTo(x, y) }
t.closePath()
}
function backPattern(t, gk, cy, rx, ry) {
t.lineWidth = .5;
const seg = (x1, y1, x2, y2, x3, y3) => { t.beginPath(), t.moveTo(x1, y1), t.lineTo(x2, y2), x3 != null && t.lineTo(x3, y3), t.stroke() };
"pincers" === gk ? (seg(-rx * .5, cy - ry * .5, 0, cy - ry, rx * .5, cy - ry * .5), seg(-rx * .5, cy + ry * .5, 0, cy + ry, rx * .5, cy + ry * .5)) :
"ant" === gk ? (seg(-rx * .6, cy, rx * .6, cy), seg(0, cy - ry * .6, 0, cy + ry * .6)) :
"antb" === gk ? (seg(-rx * .5, cy - ry * .5, rx * .5, cy + ry * .5), seg(rx * .5, cy - ry * .5, -rx * .5, cy + ry * .5)) :
(hexPath(t, cy, rx * .45, ry * .45), t.stroke())
}
function renderMorphParts(t, cfg, wLp, wRp, sh) {
const bl = cfg.bodyLength, legSp = bl / 4, still = wLp === null, L = cfg.legLen, hx = cfg.bodyWidth / 2, nl = 3 === bugTheme;
t.lineWidth = nl ? .9 : .8, t.lineCap = t.lineJoin = nl ? "miter" : "round";
sh && (t.strokeStyle = hsl3(sh.hue, 62, 38));
for (let i = 1; i <= 3; i++) {
const ly = -bl / 2 + i * legSp,
ph = gait ? (i % 2 ? 0 : PI) : i,
wL = still ? 0 : sin(wLp + ph) * L * .28,
wR = still ? 0 : -sin(wRp + ph) * L * .28;
for (const [s, w] of [[-1, wL], [1, wR]]) {
const a = s * hx;
t.beginPath(), t.moveTo(a, ly);
t.lineTo(a + s * .4 * L, ly + w);
t.lineTo(a + s * .648 * L, ly + w + .248 * L);
t.lineTo(a + s * .733 * L, ly + w + .483 * L), t.stroke()
}
}
const grad = cfg.segmentGradient ?? 3, segLen = bl / (1 + .45 * (cfg.bodySegments - 1)),
f0 = getSegmentScale(grad, 0, cfg.bodySegments),
hy = -bl / 2, hs = cfg.headSize, gk = GEAR[cfg.headGear] ? cfg.headGear : "eyes",
g = GEAR[gk][clamp(cfg.headGearSize ?? 0, 0, 2)];
const shape = (cy, rx, ry) => {
nl ? hexPath(t, cy, rx, ry) : (t.beginPath(), t.ellipse(0, cy, rx, ry, 0, 0, 7));
if (!nl) return sh && (t.fillStyle = bulgeGrad(t, 0, cy, max(rx, ry), sh.hue, sh.body)), void t.fill();
const sb = t.shadowBlur, sf = t.fillStyle;
t.shadowBlur = 0, t.fillStyle = NEON_BG, t.fill(), t.shadowBlur = sb, t.fillStyle = sf, t.lineWidth = .9, t.stroke()
};
let cy = hy + segLen / 2 - segLen * (1 - f0) / 2;
for (let s = 0; s < cfg.bodySegments; s++) {
const sc = getSegmentScale(grad, s, cfg.bodySegments), rw = cfg.bodyWidth * sc, rh = segLen * sc / 2;
shape(cy, rw, rh), nl && (backPattern(t, gk, cy, rw, rh), t.lineWidth = .9), cy += segLen * .45
}
shape(hy, hs, hs);
const gs = sh ? strokeShades(sh.hue, sh.gear) : null,
dual = (path, w1, w2) => { gs && (t.lineWidth = w1, t.strokeStyle = gs.base), path(), gs && gs.over && (t.lineWidth = w2, t.strokeStyle = gs.over, path()) };
if (gk === "pincers") {
const p = hs * g.sizeMult;
for (const s of [-1, 1]) dual(() => {
t.beginPath(), t.moveTo(s * hs * g.baseGap, hy - hs * .3);
nl ? (t.lineTo(s * (hs + p * g.sweep) * .6, hy - hs - p * .5), t.lineTo(s * hs * g.tip, hy - hs - p * .95)) :
t.bezierCurveTo(s * (hs + p * g.sweep), hy - hs - p, s * hs * g.tip, hy - hs - p, s * hs * g.tip, hy - hs - p * .95);
t.stroke()
}, 2, .9)
} else if (gk === "ant") for (const s of [-1, 1]) dual(() => {
t.beginPath(), t.moveTo(s * hs * .3, hy - hs * .8);
const ax = s * hs * g.spread, ay = hy - hs * 1.4;
t.lineTo(ax, ay), t.lineTo(ax + s, ay - hs * 1.1), t.stroke()
}, 1.6, .7);
else if (gk === "antb") for (const s of [-1, 1]) dual(() => {
t.beginPath(), t.moveTo(s * hs * .3, hy - hs * .8);
const ax = s * hs * g.spread, ay = hy - hs * 1.2;
t.lineTo(ax, ay), t.lineTo(ax - s * hs * g.len, ay + hs * g.len * 2), t.stroke()
}, 1.6, .7);
else for (const s of [-1, 1]) {
const ex = s * hs * g.spread, ey = hy - hs * g.fwd, er = hs * g.sizeMult;
if (nl) { t.beginPath(), t.moveTo(ex - er, ey), t.lineTo(ex, ey - er), t.lineTo(ex + er, ey), t.lineTo(ex, ey + er), t.closePath(), t.stroke() }
else sh && (t.fillStyle = bulgeGrad(t, ex, ey, er, sh.hue, sh.gear)), t.beginPath(), t.arc(ex, ey, er, 0, 7), t.fill()
}
}
function drawMorphBug(ctx, cfg, color, x, y, rot, { alpha = 1, scale = 1, walkL = null, walkR = null, shadow = !0, glow = null, hue = null } = {}) {
const nl = 3 === bugTheme, sh = hue != null && SHADE[bugTheme] ? { hue, ...SHADE[bugTheme] } : null;
ctx.save(), ctx.globalAlpha = alpha;
if (shadow && !nl) {
ctx.save(), ctx.translate(x + 2, y + 2.5), ctx.rotate(rot), ctx.scale(scale, scale);
ctx.fillStyle = ctx.strokeStyle = "rgba(0,0,0,.35)", renderMorphParts(ctx, cfg, walkL, walkR, null), ctx.restore()
}
ctx.save(), ctx.translate(x, y), ctx.rotate(rot), ctx.scale(scale, scale);
glow ? (ctx.shadowColor = glow, ctx.shadowBlur = 14) : nl && (ctx.shadowColor = color, ctx.shadowBlur = 15);
ctx.fillStyle = ctx.strokeStyle = color, renderMorphParts(ctx, cfg, walkL, walkR, sh), ctx.restore(), ctx.restore()
}
let palette = 0, gait = 0, bugTheme = 0;
function setBugTheme(v) { bugTheme = +v }
function setPalette(v) { palette = +v }
function setGait(v) { gait = +v }
function morphColor(hue) { return 3 === bugTheme ? `hsl(${hue},95%,62%)` : 1 === palette ? `hsl(${15+hue%60},${15+hue%40}%,${8+hue*7%28}%)` : 2 === palette ? `hsl(${20+hue%40},30%,${18+hue%12}%)` : `hsl(${hue},70%,45%)` }
function morphR(b) { const m = ensureMorph(b); return max(m.bodyWidth / 2 + .733 * m.legLen, m.bodyLength / 2 + 3.4 * m.headSize) }
function morphFitScale(cfg, w, h) {
const bl = cfg.bodyLength + 3.4 * cfg.headSize,
bw = max(cfg.bodyWidth + 1.47 * cfg.legLen, 2.2 * cfg.bodyWidth, 4 * cfg.headSize);
return min(w / bw, h / bl) * .9
}
function drawMorphCentered(ctx, b, w, h, rot) {
const cfg = ensureMorph(b), top = cfg.bodyLength / 2 + 3.4 * cfg.headSize, tot = cfg.bodyLength + 3.4 * cfg.headSize;
if (rot) { const d = 1.7 * cfg.headSize; return void drawMorphBug(ctx, cfg, morphColor(b.hue), w / 2 - d * sin(rot), h / 2 + d * cos(rot), rot, { shadow: !1, hue: b.hue }) }
drawMorphBug(ctx, cfg, morphColor(b.hue), w / 2, max(2, (h - tot) / 2) + top, 0, { shadow: !1, hue: b.hue })
}
