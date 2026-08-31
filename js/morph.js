const GEAR = {
pincers_narrow: { t: "pincers", sizeMult: .85, sweep: .4, baseGap: .4, tip: .4 },
pincers_wide: { t: "pincers", sizeMult: 1.35, sweep: .95, baseGap: .7, tip: 1.1 },
pincers_extrawide: { t: "pincers", sizeMult: 1.8, sweep: 1.6, baseGap: .95, tip: 2 },
antennae_narrow: { t: "ant", spread: 1.1 },
antennae_wide: { t: "ant", spread: 2 },
antennae_extrawide: { t: "ant", spread: 3 },
antennae_back_narrow: { t: "antb", spread: 2.2, len: .28 },
antennae_back_wide: { t: "antb", spread: 3.2, len: .28 },
antennae_back_extrawide: { t: "antb", spread: 3.2, len: .56 },
eyes_narrow: { t: "eyes", spread: .4, fwd: .85, sizeMult: .35 },
eyes_wide: { t: "eyes", spread: .62, fwd: .65, sizeMult: .35 },
eyes_extrawide: { t: "eyes", spread: .9, fwd: .4, sizeMult: .35 }
};
const GEAR_KEYS = Object.keys(GEAR);
const GEAR_LABEL = { pincers: "Pincers", ant: "Antennae", antb: "Antennae Bwd", eyes: "Eyes" };
const MORPH_RANGE = { bodySegments: [1, 3], segmentGradient: [1, 5], bodyLength: [10, 25], bodyWidth: [3, 6], headSize: [2, 6], legSpan: [5, 11] };
function randomMorph() {
const m = {};
for (const k in MORPH_RANGE) { const [lo, hi] = MORPH_RANGE[k]; m[k] = lo + ri(hi - lo + 1) }
return m.headGear = GEAR_KEYS[ri(GEAR_KEYS.length)], m
}
function ensureMorph(b) { return b.morph || (b.morph = randomMorph()) }
function mixMorph(a, b) {
const ma = ensureMorph(a), mb = ensureMorph(b), m = {};
for (const k in MORPH_RANGE) {
let v = (ma[k] + mb[k]) / 2;
random() < .25 && (v += rf(-1.5, 1.5));
const [lo, hi] = MORPH_RANGE[k];
m[k] = round(clamp(v, lo, hi))
}
return m.headGear = random() < .08 ? GEAR_KEYS[ri(GEAR_KEYS.length)] : (random() < .5 ? ma : mb).headGear, m
}
function getSegmentScale(grad, s, segs) {
let i = s, g = grad;
g === 4 && (i = segs - 1 - s, g = 2), g === 5 && (i = segs - 1 - s, g = 1);
let sc = 1;
return g === 1 ? sc = 1 - .24 * i : g === 2 && (sc = 1 - .12 * i), max(sc, .1)
}
function renderMorphParts(t, cfg, wLp, wRp) {
const bl = cfg.bodyLength, legSp = bl / 4, still = wLp === null;
t.lineWidth = .8, t.lineCap = t.lineJoin = "round";
for (let i = 1; i <= 3; i++) {
const ly = -bl / 2 + i * legSp,
wL = still ? 0 : sin(wLp + i) * 5,
wR = still ? 0 : -sin(wRp + i) * 5;
for (const [s, w] of [[-1, wL], [1, wR]]) {
t.beginPath(), t.moveTo(0, ly);
t.lineTo(s * cfg.legSpan * .5, ly + w);
t.lineTo(s * cfg.legSpan * .75, ly + w + cfg.legSpan * .2);
t.lineTo(s * cfg.legSpan * .85, ly + w + cfg.legSpan * .4), t.stroke()
}
}
const grad = cfg.segmentGradient ?? 3, segLen = bl / (1 + .45 * (cfg.bodySegments - 1)),
f0 = getSegmentScale(grad, 0, cfg.bodySegments);
let cy = -bl / 2 + segLen / 2 - segLen * (1 - f0) / 2;
for (let s = 0; s < cfg.bodySegments; s++) {
const sc = getSegmentScale(grad, s, cfg.bodySegments);
t.beginPath(), t.ellipse(0, cy, cfg.bodyWidth * sc, segLen * sc / 2, 0, 0, 7), t.fill();
cy += segLen * .45
}
const hy = -bl / 2, hs = cfg.headSize, g = GEAR[cfg.headGear] || GEAR.eyes_narrow;
if (t.beginPath(), t.arc(0, hy, hs, 0, 7), t.fill(), g.t === "pincers") {
const p = hs * g.sizeMult;
for (const s of [-1, 1]) {
t.beginPath(), t.moveTo(s * hs * g.baseGap, hy - hs * .3);
t.bezierCurveTo(s * (hs + p * g.sweep), hy - hs - p, s * hs * g.tip, hy - hs - p, s * hs * g.tip, hy - hs - p * .95), t.stroke()
}
} else if (g.t === "ant") for (const s of [-1, 1]) {
t.beginPath(), t.moveTo(s * hs * .3, hy - hs * .8);
const ax = s * hs * g.spread, ay = hy - hs * 1.4;
t.lineTo(ax, ay), t.lineTo(ax + s, ay - hs * 1.1), t.stroke()
} else if (g.t === "antb") for (const s of [-1, 1]) {
t.beginPath(), t.moveTo(s * hs * .3, hy - hs * .8);
const ax = s * hs * g.spread, ay = hy - hs * 1.2;
t.lineTo(ax, ay), t.lineTo(ax - s * hs * g.len, ay + hs * g.len * 2), t.stroke()
} else for (const s of [-1, 1]) t.beginPath(), t.arc(s * hs * g.spread, hy - hs * g.fwd, hs * g.sizeMult, 0, 7), t.fill()
}
function drawMorphBug(ctx, cfg, color, x, y, rot, { alpha = 1, scale = 1, walkL = null, walkR = null, shadow = !0, glow = null } = {}) {
ctx.save(), ctx.globalAlpha = alpha;
if (shadow) {
ctx.save(), ctx.translate(x + 2, y + 2.5), ctx.rotate(rot), ctx.scale(scale, scale);
ctx.fillStyle = ctx.strokeStyle = "rgba(0,0,0,.35)", renderMorphParts(ctx, cfg, walkL, walkR), ctx.restore()
}
ctx.save(), ctx.translate(x, y), ctx.rotate(rot), ctx.scale(scale, scale);
glow && (ctx.shadowColor = glow, ctx.shadowBlur = 14);
ctx.fillStyle = ctx.strokeStyle = color, renderMorphParts(ctx, cfg, walkL, walkR), ctx.restore(), ctx.restore()
}
function morphColor(hue) { return `hsl(${hue},70%,45%)` }
function morphFitScale(cfg, w, h) {
const bl = cfg.bodyLength + 3.4 * cfg.headSize,
bw = max(1.8 * cfg.legSpan, 2.2 * cfg.bodyWidth, 4 * cfg.headSize);
return min(w / bw, h / bl) * .9
}
function drawMorphCentered(ctx, b, w, h, scale) {
const cfg = ensureMorph(b), sc = scale == null ? morphFitScale(cfg, w, h) : scale;
drawMorphBug(ctx, cfg, morphColor(b.hue), w / 2, h / 2 + cfg.headSize * sc * .9, 0, { scale: sc, shadow: !1 })
}
