let drag = null, suppressClick = !1;
const DRAG_SLOP = 8;
const boxPt = e => { const r = boxCv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] };
function nearest(comps, cx, cy, radius) {
let hit = null, best = 1 / 0;
ecsQuery(...comps).forEach(en => {
const op = C.pos.get(en), d = hypot(op.x - cx, op.y - cy), r = radius(en);
d < r && d < best && (best = d, hit = en)
});
return hit
}
function obstacleAt(cx, cy) { return nearest(["obstacle", "pos"], cx, cy, en => C.obstacle.get(en).r + 8) }
function draggableAt(cx, cy) {
let e = nearest(["bug", "pos"], cx, cy, en => bugLen(C.bug.get(en)));
if (e != null) return { e: e, kind: "bug", pad: 21 };
e = nearest(["food", "pos"], cx, cy, () => 10);
if (e != null) return { e: e, kind: "food", pad: 5 };
e = obstacleAt(cx, cy);
return e == null ? null : { e: e, kind: "obstacle", pad: C.obstacle.get(e).r }
}
