const pick = (a, v) => a[v % a.length];
// OBST index -> 0 rock, 1 leaf, 2 Twig, 3 Pebbles, 4 Acorn, 5 Bark, 6 Moss, 7 Puddle, 8 Sand, 9 Petal, 10 Brick, 11 Feather, 12 Bone, 13 Cobweb, 14 Egg, 15 Crystal, 16 Carapace, 17 Snail shell, 18 Thorn, 19 Berries, 20 Log slice, 21 Amber, 22 Matchstick, 23 Paper scrap, 24 Oak leaf, 25 Maple leaf, 26 Fern frond, 27 Pine needles, 28 Curled leaf, 29 Ivy leaf, 30 Reed stalk, 31 Clover, 32 Daisy, 33 Bud, 34 Root tangle, 35 Wood chip, 36 Charcoal, 37 Flint shard, 38 Slate slab, 39 Glass bead, 40 Rusty nail, 41 Screw, 42 Button, 43 Coin, 44 Cork, 45 Rubber band, 46 Chalk stub, 47 Sponge, 48 Down puff, 49 Droppings
const OBST = [
[[0], (g, r) => { g.fillStyle = "#4a4640", g.beginPath(), g.ellipse(0, 0, r, r * .8, 0, 0, 7), g.fill(); g.fillStyle = "#5a564e", g.beginPath(), g.ellipse(-r * .25, -r * .25, r * .4, r * .3, 0, 0, 7), g.fill() }],
[[0], (g, r) => { g.fillStyle = "#2f4a1e", g.strokeStyle = "#3a5a26", g.lineWidth = 1, g.beginPath(), g.ellipse(0, 0, r, r * .6, 0, 0, 7), g.fill(), g.beginPath(), g.moveTo(-r, 0), g.lineTo(r, 0), g.stroke() }],
[[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], (g, r, v) => {
const arms = 2 + v % 4, bend = v * .37 % 1.5, w = 2 + v * .61 % 3.4;
g.strokeStyle = "#4a3a20", g.lineWidth = w, g.lineCap = "round";
g.beginPath(), g.moveTo(-r, bend * 4), g.lineTo(r, -bend * 4), g.stroke();
g.lineWidth = w * .55;
for (let i = 1; i < arms; i++) { const x = -r + 2 * r * i / arms; g.beginPath(), g.moveTo(x, 0), g.lineTo(x + r * .3, -r * .45 * (i % 2 ? 1 : -1)), g.stroke() }
}],
[[0,1,4], (g, r, v) => {
const n = [3, 3, 4, 5, 2, 4, 6][v], sp = [.5, .7, .55, .6, .8, .35, .5][v];
for (let i = 0; i < n; i++) { const a = i * 2.4, d = r * sp * (i ? 1 : .2), s = r * (.5 - i * .05);
g.fillStyle = ["#4a4640", "#5a564e", "#3e3a35"][i % 3], g.beginPath(), g.ellipse(cos(a) * d, sin(a) * d * .7, s, s * .78, a, 0, 7), g.fill() }
}],
[[0,1,2,4], (g, r, v) => {
const b = [.75, .9, .65, .8, .7, 1, .6][v], cp = [.45, .3, .6, .45, .35, .5, .7][v], tip = [1, 1, 1, 0, 1, 0, 1][v];
g.fillStyle = "#6a4a20", g.beginPath(), g.ellipse(0, r * .18, r * b * .68, r * b * .82, 0, 0, 7), g.fill();
g.fillStyle = "#3a2a12", g.beginPath(), g.ellipse(0, -r * b * .42, r * b * .78, r * b * cp, 0, PI, 0), g.fill();
tip && (g.strokeStyle = "#3a2a12", g.lineWidth = 2.4, g.lineCap = "round", g.beginPath(), g.moveTo(0, -r * b * .72), g.lineTo(0, -r * b * 1.05), g.stroke());
}],
[[0,2,3,4,6], (g, r, v) => {
const sides = [5, 6, 4, 7, 5, 6, 8][v], grooves = [2, 3, 1, 3, 0, 4, 2][v], rough = [.2, .35, .1, .3, .25, .4, .15][v];
g.fillStyle = "#3a2a1a", g.beginPath();
for (let i = 0; i < sides; i++) { const a = i / sides * 7, d = r * (1 - rough * ((i * 7 % 5) / 5)); i ? g.lineTo(cos(a) * d, sin(a) * d * .8) : g.moveTo(cos(a) * d, sin(a) * d * .8) }
g.closePath(), g.fill();
g.strokeStyle = "#251a10", g.lineWidth = 1.4;
for (let i = 0; i < grooves; i++) { const y = (i + 1) / (grooves + 1) * r * 1.4 - r * .7; g.beginPath(), g.moveTo(-r * .6, y), g.lineTo(r * .6, y + r * .12), g.stroke() }
}],
[[0,1,2,3,4,5,6], (g, r, v) => {
const n = [10, 16, 6, 22, 12, 8, 26][v], sz = [2.2, 1.6, 3.4, 1.3, 2.6, 4, 1.2][v];
for (let i = 0; i < n; i++) { const a = i * 2.399, d = r * Math.sqrt(i / n) * .95;
g.fillStyle = i % 3 ? "#2a4a20" : "#375f28", g.beginPath(), g.arc(cos(a) * d, sin(a) * d * .8, sz, 0, 7), g.fill() }
}],
[[1,3,4,5,6], (g, r, v) => {
const al = [.5, .35, .7, .5, .6, .4, .8][v], sq = [.55, .75, .4, .6, .5, .9, .45][v], rim = [1, 0, 1, 1, 0, 1, 0][v];
g.globalAlpha = al, g.fillStyle = "#1a3a4a", g.beginPath(), g.ellipse(0, 0, r, r * sq, 0, 0, 7), g.fill();
rim && (g.globalAlpha = al * .8, g.strokeStyle = "#4a7a8a", g.lineWidth = 1.2, g.stroke());
g.globalAlpha = 1;
}],
[[0,1,2,3,5,6], (g, r, v) => {
const rings = [3, 2, 4, 3, 5, 2, 4][v], flat = [.55, .4, .7, .5, .6, .8, .35][v];
for (let i = 0; i < rings; i++) { const k = 1 - i / rings;
g.fillStyle = ["#6a5a3a", "#7a6a48", "#8a7a58", "#9a8a68", "#a89876"][i], g.beginPath(), g.ellipse(0, r * flat * .3 * (1 - k), r * k, r * flat * k, 0, 0, 7), g.fill() }
}],
[[0,2,3,4,6], (g, r, v) => {
const n = [5, 3, 6, 4, 8, 5, 7][v], len = [.9, 1, .7, .95, .6, .75, .85][v], core = [1, 0, 1, 1, 0, 1, 0][v];
g.fillStyle = "#7a3a5a";
for (let i = 0; i < n; i++) { const a = i / n * 7; g.beginPath(), g.ellipse(cos(a) * r * len * .5, sin(a) * r * len * .5, r * len * .5, r * len * .26, a, 0, 7), g.fill() }
core && (g.fillStyle = "#c8a84a", g.beginPath(), g.arc(0, 0, r * .22, 0, 7), g.fill());
}],
[[0,1,2,4,5], (g, r, v) => {
const w = [.95, .8, 1, .7, .9, 1, .6][v], h = [.55, .7, .4, .8, .5, .3, .9][v], rot = [.15, 0, .35, .1, .5, .2, 0][v], lines = [2, 1, 3, 0, 2, 1, 3][v];
g.rotate(rot), g.fillStyle = "#6a3a28", g.fillRect(-r * w, -r * h, r * w * 2, r * h * 2);
g.strokeStyle = "#4a2618", g.lineWidth = 1.3;
for (let i = 1; i <= lines; i++) { const y = -r * h + 2 * r * h * i / (lines + 1); g.beginPath(), g.moveTo(-r * w, y), g.lineTo(r * w, y), g.stroke() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const barbs = [7, 5, 9, 6, 11, 4, 8, 12][v], span = [.5, .7, .4, .6, .35, .8, .55, .3][v], curve = [.3, 0, .5, .2, .4, .1, .6, .25][v];
g.strokeStyle = "#8a8478", g.lineWidth = 1.8, g.lineCap = "round";
g.beginPath(), g.moveTo(-r * .1, r * .9), g.quadraticCurveTo(curve * r, 0, 0, -r * .95), g.stroke();
g.lineWidth = 1.1, g.strokeStyle = "#a49c8c";
for (let i = 0; i < barbs; i++) { const t = i / barbs, y = r * .9 - 1.8 * r * t, x = curve * r * 2 * t * (1 - t) - r * .1 * (1 - t), w = r * span * sin(t * 3.1);
g.beginPath(), g.moveTo(x, y), g.lineTo(x - w, y - r * .18), g.moveTo(x, y), g.lineTo(x + w, y - r * .18), g.stroke() }
}],
[[0,1,4], (g, r, v) => {
const len = [.85, 1, .7, .95, .8, .6, 1.05, .75][v], knob = [.28, .22, .35, .3, .18, .4, .25, .32][v], bend = [0, .2, 0, .4, .15, 0, .3, .5][v];
g.strokeStyle = g.fillStyle = "#d8d2c2", g.lineWidth = r * .2, g.lineCap = "round";
g.beginPath(), g.moveTo(-r * len, -bend * r), g.quadraticCurveTo(0, bend * r, r * len, -bend * r), g.stroke();
for (const s of [-1, 1]) for (const o of [-1, 1]) { g.beginPath(), g.arc(s * r * len, -bend * r + o * r * knob * .7, r * knob, 0, 7), g.fill() }
}, 3],
[[0,1,2,3,4,6], (g, r, v) => {
const spokes = [6, 4, 8, 5, 7, 3, 9, 6][v], rings = [3, 2, 4, 3, 2, 5, 3, 1][v], part = [1, 1, .75, 1, .6, 1, .8, 1][v];
g.strokeStyle = "rgba(210,215,225,.45)", g.lineWidth = .8;
for (let i = 0; i < spokes; i++) { const a = i / spokes * 7 * part; g.beginPath(), g.moveTo(0, 0), g.lineTo(cos(a) * r, sin(a) * r), g.stroke() }
for (let k = 1; k <= rings; k++) { const d = r * k / rings; g.beginPath();
for (let i = 0; i <= spokes * part; i++) { const a = i / spokes * 7; i ? g.lineTo(cos(a) * d, sin(a) * d) : g.moveTo(cos(a) * d, sin(a) * d) }
g.stroke() }
}],
[[0,1,6], (g, r, v) => {
const n = [1, 2, 3, 1, 2, 4, 1, 3][v], sz = [.9, .62, .5, .7, .55, .42, 1, .45][v], spot = [0, 1, 0, 1, 0, 1, 1, 0][v];
for (let i = 0; i < n; i++) { const a = i * 2.4, d = n > 1 ? r * .45 : 0, x = cos(a) * d, y = sin(a) * d * .7;
g.fillStyle = "#e8e2d0", g.beginPath(), g.ellipse(x, y, r * sz * .72, r * sz, .2, 0, 7), g.fill();
spot && (g.fillStyle = "#b8a888", g.beginPath(), g.arc(x - r * sz * .2, y - r * sz * .25, r * sz * .16, 0, 7), g.fill()) }
}],
[[0,1], (g, r, v) => {
const shards = [1, 2, 3, 2, 1, 4, 3, 2][v], tall = [1, .8, .7, .95,1.1, .6, .85, .75][v];
for (let i = 0; i < shards; i++) { const x = (i - (shards - 1) / 2) * r * .55, h = r * tall * (1 - i * .12), w = r * .3;
g.fillStyle = i % 2 ? "#5a7a9a" : "#7a9aba", g.beginPath(), g.moveTo(x, -h), g.lineTo(x + w, -h * .2), g.lineTo(x + w * .7, h * .7), g.lineTo(x - w * .7, h * .7), g.lineTo(x - w, -h * .2), g.closePath(), g.fill();
g.fillStyle = "rgba(230,245,255,.35)", g.beginPath(), g.moveTo(x, -h), g.lineTo(x + w * .35, -h * .1), g.lineTo(x, h * .7), g.closePath(), g.fill() }
}],
[[0,1,2,5], (g, r, v) => {
const ribs = [3, 2, 4, 5, 0, 3, 6, 4][v], wide = [.8, .95, .7, .85, .9, .6, 1, .75][v], split = [1, 0, 1, 1, 0, 1, 0, 1][v];
g.fillStyle = "#5a3a2a", g.beginPath(), g.ellipse(0, 0, r * wide, r * .95, 0, 0, 7), g.fill();
g.strokeStyle = "#3a2418", g.lineWidth = 1.4;
split && (g.beginPath(), g.moveTo(0, -r * .9), g.lineTo(0, r * .9), g.stroke());
for (let i = 1; i <= ribs; i++) { const y = -r * .8 + 1.6 * r * i / (ribs + 1);
g.beginPath(), g.moveTo(-r * wide * .85, y), g.quadraticCurveTo(0, y + r * .15, r * wide * .85, y), g.stroke() }
}],
[[0,1,2,3,5,6], (g, r, v) => {
const turns = [2.5, 2, 3.2, 2.8, 1.8, 3.6, 2.2, 3][v], tight = [1, .85, 1.15, .95, .75, 1.2, .9, 1.05][v], band = [1, 0, 1, 0, 1, 1, 0, 1][v];
g.fillStyle = "#9a7a4a", g.beginPath(), g.arc(0, 0, r * .92, 0, 7), g.fill();
g.strokeStyle = band ? "#5a3a18" : "#7a5a30", g.lineWidth = 2.2, g.lineCap = "round";
g.beginPath();
for (let i = 0; i <= 80; i++) { const t = i / 80, a = t * turns * 6.283, d = r * .92 * Math.pow(1 - t, tight);
i ? g.lineTo(cos(a) * d, sin(a) * d) : g.moveTo(cos(a) * d, sin(a) * d) }
g.stroke();
}],
[[2,4,6,7], (g, r, v) => {
const n = [3, 2, 5, 4, 6, 3, 7, 4][v], len = [.9, 1.1, .7, .85, .6, 1, .55, .95][v], base = [.35, .3, .28, .4, .22, .45, .2, .3][v];
g.fillStyle = "#3a2a1a", g.beginPath(), g.ellipse(0, r * .5, r * .55, r * .28, 0, 0, 7), g.fill();
g.fillStyle = "#6a5a3a";
for (let i = 0; i < n; i++) { const a = -1.57 + (i / (n - 1 || 1) - .5) * 2.2;
g.beginPath(), g.moveTo(cos(a - .3) * r * base, r * .5 + sin(a - .3) * r * base),
g.lineTo(cos(a) * r * len, r * .5 + sin(a) * r * len),
g.lineTo(cos(a + .3) * r * base, r * .5 + sin(a + .3) * r * base), g.closePath(), g.fill() }
}],
[[0,1,3,4,5,6], (g, r, v) => {
const n = [3, 2, 4, 5, 3, 6, 2, 7][v], sz = [.38, .48, .34, .3, .42, .26, .55, .24][v], stem = [1, 1, 0, 1, 0, 1, 1, 0][v];
stem && (g.strokeStyle = "#3a5a28", g.lineWidth = 1.6, g.beginPath(), g.moveTo(0, -r), g.lineTo(0, 0), g.stroke());
for (let i = 0; i < n; i++) { const a = i * 2.399, d = n > 1 ? r * .5 : 0, x = cos(a) * d, y = sin(a) * d * .8;
g.fillStyle = "#8a1a3a", g.beginPath(), g.arc(x, y, r * sz, 0, 7), g.fill();
g.fillStyle = "rgba(255,160,190,.4)", g.beginPath(), g.arc(x - r * sz * .3, y - r * sz * .3, r * sz * .3, 0, 7), g.fill() }
}],
[[0,1,2,3,6,7], (g, r, v) => {
const rings = [4, 3, 5, 6, 2, 7, 4, 3][v], off = [0, .12, .2, 0, .3, .1, .25, .35][v], crack = [1, 0, 1, 0, 1, 1, 0, 1][v];
g.fillStyle = "#8a6a44", g.beginPath(), g.arc(0, 0, r * .95, 0, 7), g.fill();
g.strokeStyle = "#5a3a20", g.lineWidth = 2, g.beginPath(), g.arc(0, 0, r * .95, 0, 7), g.stroke();
g.lineWidth = 1.1, g.strokeStyle = "#6a4a2a";
for (let i = 1; i <= rings; i++) { const d = r * .85 * i / (rings + 1); g.beginPath(), g.arc(off * r, 0, d, 0, 7), g.stroke() }
crack && (g.lineWidth = 1.6, g.beginPath(), g.moveTo(off * r, 0), g.lineTo(r * .9, r * .3), g.stroke());
}],
[[0,1,2,3,7], (g, r, v) => {
const al = [.8, .6, .95, .7, .85, .5, 1, .65][v], sq = [.7, .9, .55, .8, .6, 1, .5, .75][v], bub = [2, 0, 4, 1, 3, 0, 5, 2][v];
g.globalAlpha = al, g.fillStyle = "#b87a1a", g.beginPath(), g.ellipse(0, 0, r * .9, r * sq * .9, .3, 0, 7), g.fill();
g.fillStyle = "rgba(255,225,150,.6)";
for (let i = 0; i < bub; i++) { const a = i * 2.4; g.beginPath(), g.arc(cos(a) * r * .4, sin(a) * r * .3, r * .1, 0, 7), g.fill() }
g.globalAlpha = 1;
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const len = [.95, .8, 1.05, .7, .9, 1, .75, .85][v], head = [.22, .28, .16, .32, 0, .24, .3, .18][v], burnt = [0, 0, 0, 0, 1, 1, 0, 1][v];
g.rotate([.3, 0, .8, 1.2, .5, 1.6, .2, 2.2][v]);
g.fillStyle = "#c8b088", g.fillRect(-r * len, -r * .1, r * len * 2, r * .2);
head && (g.fillStyle = burnt ? "#2a2420" : "#c03020", g.beginPath(), g.arc(r * len, 0, r * head, 0, 7), g.fill());
}],
[[2,5,6], (g, r, v) => {
const corners = [4, 5, 4, 6, 5, 4, 7, 5][v], tear = [.25, .15, .4, .2, .3, .1, .35, .45][v], lines = [2, 3, 0, 2, 4, 1, 0, 3][v];
g.fillStyle = "#e0dcd0", g.beginPath();
for (let i = 0; i < corners; i++) { const a = i / corners * 7, d = r * (1 - tear * ((i * 5 % 4) / 4));
i ? g.lineTo(cos(a) * d, sin(a) * d * .85) : g.moveTo(cos(a) * d, sin(a) * d * .85) }
g.closePath(), g.fill();
g.strokeStyle = "#9a968c", g.lineWidth = 1;
for (let i = 1; i <= lines; i++) { const y = -r * .5 + r * i / (lines + 1) * 1.4; g.beginPath(), g.moveTo(-r * .5, y), g.lineTo(r * .5, y), g.stroke() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const lobes = pick([3, 4, 5, 3, 6, 4, 5, 4], v), dep = pick([.3, .22, .38, .45, .18, .5, .28, .35], v), col = pick(["#4a6a28", "#5a7a30", "#6a5a20", "#3a5a20", "#7a6a28", "#4a6a28", "#5a4a18", "#6a7a34"], v);
g.rotate(pick([0, .4, -.3, .8, .2, -.6, 1.1, .5], v));
g.fillStyle = col, g.beginPath();
for (let i = 0; i <= 60; i++) { const t = i / 60, a = -1.57 + t * TAU, w = 1 - dep * abs(sin(lobes * t * 3.14));
const x = sin(a) * r * .62 * w, y = -cos(a) * r * .95 * w; i ? g.lineTo(x, y) : g.moveTo(x, y) }
g.closePath(), g.fill();
g.strokeStyle = "#2a3a14", g.lineWidth = 1.2, g.beginPath(), g.moveTo(0, r * .95), g.lineTo(0, -r * .8), g.stroke();
}],
[[0,1,2,4,5,6,7], (g, r, v) => {
const pts = pick([5, 5, 7, 3, 5, 7, 5, 9], v), sharp = pick([.55, .4, .65, .5, .3, .7, .45, .6], v), col = pick(["#a03a18", "#c05a20", "#8a2a10", "#d07a28", "#6a3a14", "#b04a1a", "#e09030", "#7a4a20"], v);
g.rotate(pick([0, .5, 1, -.4, .3, 1.4, -.8, .7], v));
g.fillStyle = col, g.beginPath();
for (let i = 0; i <= pts * 2; i++) { const a = -1.57 + i / (pts * 2) * TAU, d = r * (i % 2 ? sharp : 1);
i ? g.lineTo(sin(a) * d * .9, -cos(a) * d) : g.moveTo(sin(a) * d * .9, -cos(a) * d) }
g.closePath(), g.fill();
g.strokeStyle = "rgba(0,0,0,.3)", g.lineWidth = 1;
for (let i = 0; i < pts; i++) { const a = -1.57 + i / pts * TAU; g.beginPath(), g.moveTo(0, 0), g.lineTo(sin(a) * r * .8, -cos(a) * r * .85), g.stroke() }
}],
[[0,2,3,4,6], (g, r, v) => {
const pairs = pick([6, 4, 8, 5, 10, 7, 4, 9], v), len = pick([.45, .6, .35, .5, .3, .55, .7, .4], v), curl = pick([.2, 0, .4, .1, .3, .5, .15, .6], v);
g.rotate(pick([0, .6, -.5, 1.2, .3, -1, .9, 1.8], v));
g.strokeStyle = "#3a5a24", g.lineWidth = 1.8, g.lineCap = "round";
g.beginPath(), g.moveTo(0, r), g.quadraticCurveTo(curl * r, 0, curl * r * .5, -r), g.stroke();
g.fillStyle = "#4a7a2c";
for (let i = 0; i < pairs; i++) { const t = i / pairs, y = r - 2 * r * t, x = curl * r * 2 * t * (1 - t), w = r * len * sin(3.14 * (.15 + t * .85));
for (const s of [-1, 1]) { g.beginPath(), g.ellipse(x + s * w * .5, y - r * .06, w * .5, r * .09, s * .4, 0, 7), g.fill() } }
}],
[[0,1,3,5,6], (g, r, v) => {
const n = pick([5, 3, 8, 6, 10, 4, 7, 12], v), spread = pick([.5, .25, .8, .4, 1, .6, .35, 1.3], v), col = pick(["#2a4a24", "#3a5a2c", "#4a5a20", "#2a4a24", "#5a6a30", "#1a3a18", "#3a5a2c", "#4a4a24"], v);
g.rotate(pick([0, .4, .9, 1.5, .2, 2, .7, 1.1], v));
g.strokeStyle = col, g.lineWidth = 1.6, g.lineCap = "round";
for (let i = 0; i < n; i++) { const a = (i / (n - 1 || 1) - .5) * spread;
g.beginPath(), g.moveTo(-r * .9, 0), g.lineTo(r * .9 * cos(a), r * .9 * sin(a) * 1.4), g.stroke() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const curl = pick([.5, .3, .8, .6, 1, .4, .9, .2], v), col = pick(["#8a6a2a", "#6a4a1a", "#a08040", "#7a5a24", "#5a3a14", "#98783a", "#6a5220", "#b09050"], v);
g.rotate(pick([0, .7, -.4, 1.3, .5, -1, 2, .9], v));
g.fillStyle = col, g.beginPath(), g.moveTo(0, -r), g.quadraticCurveTo(r * .9, -r * .2, r * curl * .5, r), g.quadraticCurveTo(-r * .5, r * .3, 0, -r), g.fill();
g.fillStyle = "rgba(0,0,0,.28)", g.beginPath(), g.moveTo(0, -r), g.quadraticCurveTo(r * (.9 - curl * .6), -r * .1, r * curl * .5, r), g.quadraticCurveTo(r * .2, r * .1, 0, -r), g.fill();
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const lob = pick([.5, .35, .7, .55, .25, .8, .45, .65], v), col = pick(["#2a5a2a", "#356a30", "#1e4a22", "#407a38", "#2a5a2a", "#4a8040", "#284a24", "#356a30"], v);
g.rotate(pick([0, .5, -.6, 1, .25, -1.2, .8, 1.6], v));
g.fillStyle = col, g.beginPath(), g.moveTo(0, -r);
g.bezierCurveTo(r * .5, -r * .8, r * .95, -r * .1, r * lob, r * .35);
g.bezierCurveTo(r * .4, r * .55, r * .15, r * .6, 0, r);
g.bezierCurveTo(-r * .15, r * .6, -r * .4, r * .55, -r * lob, r * .35);
g.bezierCurveTo(-r * .95, -r * .1, -r * .5, -r * .8, 0, -r), g.fill();
g.strokeStyle = "#c8e8b0", g.lineWidth = .9, g.globalAlpha = .5;
for (const s of [-1, 0, 1]) { g.beginPath(), g.moveTo(0, r * .5), g.lineTo(s * r * .6, -r * .5), g.stroke() }
g.globalAlpha = 1;
}],
[[0,1,2,3,7], (g, r, v) => {
const seg = pick([3, 2, 5, 4, 6, 3, 2, 7], v), thick = pick([.16, .24, .1, .2, .13, .3, .28, .08], v);
g.rotate(pick([.3, 0, .9, 1.4, .5, 1.9, .2, 2.4], v));
g.fillStyle = "#7a8a4a", g.fillRect(-r * .95, -r * thick, r * 1.9, r * thick * 2);
g.strokeStyle = "#4a5a28", g.lineWidth = 1.4;
for (let i = 1; i <= seg; i++) { const x = -r * .95 + 1.9 * r * i / (seg + 1); g.beginPath(), g.moveTo(x, -r * thick), g.lineTo(x, r * thick), g.stroke() }
}],
[[0,2,3,4,5], (g, r, v) => {
const n = pick([3, 3, 4, 3, 4, 3, 5, 3], v), sz = pick([.5, .62, .45, .38, .55, .7, .4, .5], v), stem = pick([1, 0, 1, 1, 0, 1, 0, 1], v);
stem && (g.strokeStyle = "#3a6a28", g.lineWidth = 1.6, g.beginPath(), g.moveTo(0, 0), g.lineTo(0, r), g.stroke());
g.fillStyle = "#3a7a2a";
for (let i = 0; i < n; i++) { const a = -1.57 + i / n * TAU;
g.beginPath(), g.ellipse(cos(a) * r * sz * .7, sin(a) * r * sz * .7, r * sz * .6, r * sz * .5, a, 0, 7), g.fill() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const n = pick([8, 6, 12, 5, 10, 7, 14, 9], v), pl = pick([.9, 1, .75, .85, .95, .7, .8, 1], v), core = pick(["#d8b820", "#e8c830", "#c8a018", "#f0d040", "#d8b820", "#b89010", "#e8c830", "#d0a828"], v);
g.fillStyle = "#e8e4d8";
for (let i = 0; i < n; i++) { const a = i / n * TAU;
g.beginPath(), g.ellipse(cos(a) * r * pl * .55, sin(a) * r * pl * .55, r * pl * .45, r * pl * .17, a, 0, 7), g.fill() }
g.fillStyle = core, g.beginPath(), g.arc(0, 0, r * .28, 0, 7), g.fill();
}],
[[0,1,2,4,5,6], (g, r, v) => {
const w = pick([.5, .38, .62, .45, .55, .3, .7, .42], v), open = pick([0, 0, 1, 0, 1, 0, 1, 1], v);
g.fillStyle = "#3a6a2a", g.beginPath(), g.ellipse(0, r * .1, r * w, r * .8, 0, 0, 7), g.fill();
open && (g.fillStyle = "#c04a7a", g.beginPath(), g.ellipse(0, -r * .5, r * w * .7, r * .3, 0, 0, 7), g.fill());
g.strokeStyle = "#2a4a1a", g.lineWidth = 1.2, g.beginPath(), g.moveTo(0, r * .9), g.lineTo(0, -r * .3), g.stroke();
}],
[[1,3,6,7], (g, r, v) => {
const n = pick([4, 3, 6, 5, 8, 3, 7, 5], v), kink = pick([.4, .2, .6, .35, .5, .8, .25, .7], v);
g.strokeStyle = "#5a4028", g.lineWidth = pick([2, 2.8, 1.4, 2.2, 1.2, 3.2, 1.8, 2.4], v), g.lineCap = "round";
for (let i = 0; i < n; i++) { const a = i / n * TAU;
g.beginPath(), g.moveTo(-cos(a) * r * .9, -sin(a) * r * .9);
g.quadraticCurveTo(cos(a + kink) * r * .3, sin(a + kink) * r * .3, cos(a) * r * .9, sin(a) * r * .9), g.stroke() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const w = pick([.9, .7, 1, .6, .85, 1, .5, .75], v), h = pick([.4, .55, .3, .7, .35, .25, .8, .45], v), grain = pick([3, 2, 4, 1, 5, 3, 0, 4], v);
g.rotate(pick([.2, .8, -.3, 1.2, .5, 1.7, 0, 2.3], v));
g.fillStyle = "#a08050", g.beginPath(), g.moveTo(-r * w, -r * h * .6), g.lineTo(r * w, -r * h), g.lineTo(r * w * .9, r * h), g.lineTo(-r * w * .8, r * h * .7), g.closePath(), g.fill();
g.strokeStyle = "#7a5c34", g.lineWidth = 1;
for (let i = 1; i <= grain; i++) { const y = -r * h + 2 * r * h * i / (grain + 1); g.beginPath(), g.moveTo(-r * w * .8, y), g.lineTo(r * w * .85, y - r * .05), g.stroke() }
}],
[[0,1,3,5,6], (g, r, v) => {
const sides = pick([5, 6, 4, 7, 5, 8, 6, 4], v), rough = pick([.25, .15, .4, .3, .45, .1, .35, .2], v), glow = pick([0, 0, 1, 0, 1, 0, 0, 1], v);
g.fillStyle = "#1a1816", g.beginPath();
for (let i = 0; i < sides; i++) { const a = i / sides * TAU, d = r * (1 - rough * ((i * 3 % 4) / 4));
i ? g.lineTo(cos(a) * d, sin(a) * d * .8) : g.moveTo(cos(a) * d, sin(a) * d * .8) }
g.closePath(), g.fill();
glow && (g.fillStyle = "#c04010", g.globalAlpha = .5, g.beginPath(), g.arc(r * .15, 0, r * .3, 0, 7), g.fill(), g.globalAlpha = 1);
}],
[[0,3,6], (g, r, v) => {
const facets = pick([3, 4, 5, 3, 6, 4, 3, 5], v), sharp = pick([.5, .35, .65, .8, .4, .55, .9, .3], v);
const pts = [];
for (let i = 0; i < facets + 2; i++) { const a = i / (facets + 2) * TAU, d = r * (i % 2 ? sharp : 1); pts.push([cos(a) * d, sin(a) * d * .85]) }
g.fillStyle = "#6a6a62", g.beginPath(), pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)), g.closePath(), g.fill();
g.fillStyle = "#8a8a80";
for (let i = 0; i < pts.length; i += 2) { g.beginPath(), g.moveTo(0, 0), g.lineTo(...pts[i]), g.lineTo(...pts[(i + 1) % pts.length]), g.closePath(), g.fill() }
}],
[[1,3,6], (g, r, v) => {
const sides = pick([4, 5, 4, 6, 5, 4, 7, 5], v), flat = pick([.5, .65, .4, .55, .7, .35, .6, .45], v), layers = pick([2, 1, 3, 0, 2, 4, 1, 3], v);
g.fillStyle = "#3a4048", g.beginPath();
for (let i = 0; i < sides; i++) { const a = i / sides * TAU; i ? g.lineTo(cos(a) * r, sin(a) * r * flat) : g.moveTo(cos(a) * r, sin(a) * r * flat) }
g.closePath(), g.fill();
g.strokeStyle = "#4a525c", g.lineWidth = 1;
for (let i = 1; i <= layers; i++) { const y = -r * flat + 2 * r * flat * i / (layers + 1); g.beginPath(), g.moveTo(-r * .8, y), g.lineTo(r * .8, y), g.stroke() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const sz = pick([.85, .6, 1, .7, .5, .9, .65, .8], v), hue = pick([200, 160, 280, 40, 340, 100, 200, 20], v), hole = pick([0, 1, 0, 1, 0, 0, 1, 1], v);
g.fillStyle = `hsl(${hue},55%,45%)`, g.beginPath(), g.arc(0, 0, r * sz, 0, 7), g.fill();
g.fillStyle = "rgba(255,255,255,.4)", g.beginPath(), g.arc(-r * sz * .3, -r * sz * .3, r * sz * .3, 0, 7), g.fill();
hole && (g.fillStyle = "#0a0809", g.beginPath(), g.arc(0, 0, r * sz * .2, 0, 7), g.fill());
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const len = pick([.95, .8, 1, .7, .9, 1, .6, .85], v), head = pick([.22, .3, .16, .26, .2, .34, .28, .18], v), bent = pick([0, 0, .3, 0, .5, 0, .2, .7], v);
g.rotate(pick([.3, 1, -.4, 1.6, .7, 2.2, 0, 1.2], v));
g.strokeStyle = "#8a5a3a", g.lineWidth = r * .13, g.lineCap = "round";
g.beginPath(), g.moveTo(-r * len, 0), g.quadraticCurveTo(0, bent * r, r * len, bent * r * 1.5), g.stroke();
g.fillStyle = "#9a6a48", g.beginPath(), g.ellipse(-r * len, 0, r * head * .4, r * head, 0, 0, 7), g.fill();
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const th = pick([6, 4, 9, 5, 11, 7, 3, 8], v), len = pick([.9, .75, 1, .65, .85, .95, .6, .8], v), slot = pick([1, 0, 1, 1, 0, 1, 0, 1], v);
g.rotate(pick([.4, 1.1, 0, 1.7, .8, 2.3, .2, 1.4], v));
g.fillStyle = "#8a8a92", g.fillRect(-r * len, -r * .12, r * len * 1.7, r * .24);
g.strokeStyle = "#5a5a62", g.lineWidth = 1.2;
for (let i = 0; i < th; i++) { const x = -r * len * .3 + r * len * 1.3 * i / th; g.beginPath(), g.moveTo(x, -r * .12), g.lineTo(x + r * .1, r * .12), g.stroke() }
g.fillStyle = "#a8a8b0", g.beginPath(), g.ellipse(-r * len, 0, r * .12, r * .3, 0, 0, 7), g.fill();
slot && (g.strokeStyle = "#3a3a42", g.lineWidth = 1.6, g.beginPath(), g.moveTo(-r * len, -r * .2), g.lineTo(-r * len, r * .2), g.stroke());
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const holes = pick([4, 2, 4, 0, 2, 4, 3, 2], v), sz = pick([.85, .65, 1, .75, .55, .9, .7, .8], v), hue = pick([0, 210, 45, 0, 120, 280, 30, 0], v), sat = pick([0, 35, 40, 0, 25, 30, 45, 0], v);
g.fillStyle = `hsl(${hue},${sat}%,${sat ? 45 : 78}%)`, g.beginPath(), g.arc(0, 0, r * sz, 0, 7), g.fill();
g.strokeStyle = "rgba(0,0,0,.3)", g.lineWidth = 1.2, g.beginPath(), g.arc(0, 0, r * sz * .78, 0, 7), g.stroke();
g.fillStyle = "#0a0809";
for (let i = 0; i < holes; i++) { const a = i / holes * TAU + .78;
g.beginPath(), g.arc(cos(a) * r * sz * .32, sin(a) * r * sz * .32, r * sz * .12, 0, 7), g.fill() }
}],
[[0,2,4,7], (g, r, v) => {
const sz = pick([.9, .7, 1, .8, .6, .95, .75, .85], v), tilt = pick([1, .8, 1, .5, .9, .3, .7, 1], v), gold = pick([1, 0, 1, 1, 0, 0, 1, 0], v);
g.fillStyle = gold ? "#c8a038" : "#a8a8a0", g.beginPath(), g.ellipse(0, 0, r * sz, r * sz * tilt, 0, 0, 7), g.fill();
g.strokeStyle = gold ? "#8a6a18" : "#78786e", g.lineWidth = 1.4, g.beginPath(), g.ellipse(0, 0, r * sz * .78, r * sz * tilt * .78, 0, 0, 7), g.stroke();
}],
[[0,1,3,5,6], (g, r, v) => {
const w = pick([.55, .4, .7, .45, .6, .35, .8, .5], v), h = pick([.9, 1, .7, .8, .95, .6, .75, .85], v), pores = pick([6, 0, 10, 4, 14, 8, 0, 12], v);
g.rotate(pick([0, .5, 1.2, .3, 1.8, .8, 2.4, .2], v));
g.fillStyle = "#b89058", g.fillRect(-r * w, -r * h, r * w * 2, r * h * 2);
g.fillStyle = "#9a7440";
for (let i = 0; i < pores; i++) { const a = i * 2.399; g.beginPath(), g.arc(cos(a) * r * w * .7, sin(a) * r * h * .8, 1.3, 0, 7), g.fill() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const w = pick([.9, .6, 1, .75, .5, .95, .65, .85], v), h = pick([.5, .85, .3, .6, .95, .4, .7, .25], v), th = pick([2.4, 3.2, 1.8, 2.8, 2, 3.6, 2.2, 1.6], v), hue = pick([40, 0, 120, 40, 280, 200, 40, 0], v);
g.rotate(pick([0, .6, 1.1, .3, 1.7, .8, 2.2, .4], v));
g.strokeStyle = `hsl(${hue},60%,50%)`, g.lineWidth = th;
g.beginPath(), g.ellipse(0, 0, r * w, r * h, 0, 0, 7), g.stroke();
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const len = pick([.8, .6, 1, .5, .9, .7, .4, .85], v), th = pick([.28, .35, .2, .4, .24, .3, .45, .26], v), broken = pick([1, 0, 1, 1, 0, 1, 0, 1], v);
g.rotate(pick([.3, 1, -.4, 1.5, .6, 2.1, 0, 1.2], v));
g.fillStyle = "#e0dcd4", g.fillRect(-r * len, -r * th, r * len * 2, r * th * 2);
broken && (g.fillStyle = "#c4c0b6", g.beginPath(), g.moveTo(r * len, -r * th), g.lineTo(r * len * .75, 0), g.lineTo(r * len, r * th), g.closePath(), g.fill());
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const holes = pick([8, 5, 14, 10, 18, 6, 12, 20], v), w = pick([.9, .7, 1, .8, .6, .95, .75, .85], v), hue = pick([50, 190, 20, 50, 330, 100, 50, 190], v);
g.fillStyle = `hsl(${hue},45%,55%)`, g.fillRect(-r * w, -r * w * .7, r * w * 2, r * w * 1.4);
g.fillStyle = "#0a0809";
for (let i = 0; i < holes; i++) { const a = i * 2.399, d = Math.sqrt(i / holes);
g.beginPath(), g.arc(cos(a) * r * w * d * .85, sin(a) * r * w * .6 * d, 1.6 + (i % 3), 0, 7), g.fill() }
}],
[[0,1,2,3,4,5,6,7], (g, r, v) => {
const n = pick([10, 6, 16, 12, 20, 8, 14, 24], v), len = pick([.9, 1, .7, .8, .6, .95, .75, .55], v);
g.strokeStyle = "rgba(230,228,220,.55)", g.lineWidth = 1;
for (let i = 0; i < n; i++) { const a = i / n * TAU;
g.beginPath(), g.moveTo(0, 0), g.quadraticCurveTo(cos(a + .4) * r * len * .5, sin(a + .4) * r * len * .5, cos(a) * r * len, sin(a) * r * len), g.stroke() }
g.fillStyle = "#d8d4c8", g.beginPath(), g.arc(0, 0, r * .16, 0, 7), g.fill();
}],
[[0,1,2,3,5,7], (g, r, v) => {
const n = pick([3, 2, 5, 4, 6, 2, 7, 3], v), sz = pick([.32, .45, .26, .3, .22, .5, .2, .38], v);
for (let i = 0; i < n; i++) { const a = i * 2.399, d = n > 1 ? r * .55 : 0;
g.fillStyle = i % 2 ? "#3a2a1a" : "#4a3624", g.beginPath(), g.ellipse(cos(a) * d, sin(a) * d * .8, r * sz, r * sz * .72, a, 0, 7), g.fill() }
}]
];
