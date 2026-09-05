function drawBugStyled(ctx, b, x, y, dir, alpha = 1, highlighted = !1, phase = null, hueOv = null) {
const cfg = ensureMorph(b),
hue = hueOv == null ? b.hue : hueOv;
drawMorphBug(ctx, cfg, morphColor(hue), x, y, dir + HALF_PI, {
alpha: alpha, hue: hue,
walkL: phase ? phase.wL : null, walkR: phase ? phase.wR : null,
glow: highlighted ? `hsl(${hue},80%,60%)` : null
})
}
function posPhase(p) { return { wL: (p.walk || 0) + 2.2 * (p.turnAcc || 0), wR: (p.walk || 0) - 2.2 * (p.turnAcc || 0) } }
function sysAnimPhase() {
ecsQuery("bug", "pos").forEach(e => {
const p = C.pos.get(e), dx = p.x - (p._px ?? p.x), dy = p.y - (p._py ?? p.y);
const dd = norm(p.dir - (p._pd ?? p.dir));
p.walk = (p.walk || 0) + .32 * hypot(dx, dy), p.turnAcc = (p.turnAcc || 0) + dd;
p._px = p.x, p._py = p.y, p._pd = p.dir
})
}
function bugCardH(b, w = 54, h = 54) {
const c = document.createElement("canvas");
return drawMorphCentered(hidpi(c, w, h), b, w, h, PI / 4), c
}
