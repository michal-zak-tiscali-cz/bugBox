let drag = null, suppressClick = !1, holdT = 0;
const DRAG_SLOP = 8, HOLD_MS = 250, hold = (ms, fn) => holdT = setTimeout(fn, ms);
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
function dragStart(e) {
const [cx, cy] = boxPt(e), t = draggableAt(cx, cy);
suppressClick = !1, t || hold(HOLD_MS, () => canPlaceFood() && (ecsSpawn({ food: {}, pos: { x: cx, y: cy, dir: 0 } }), SFX.feed(), combatState && foodLeft--, suppressClick = !0));
if (!t || !canDrag(t.kind)) return;
const op = C.pos.get(t.e);
"bug" === t.kind && mateCancel(t.e);
drag = { ...t, ox: op.x - cx, oy: op.y - cy, sx: cx, sy: cy, moved: !1 }, ecsFront(t.e);
boxCv.setPointerCapture && boxCv.setPointerCapture(e.pointerId)
}
function dragMove(e) {
if (!drag) return;
const [cx, cy] = boxPt(e), p = C.pos.get(drag.e);
if (!p) return void(drag = null);
if (!drag.moved && hypot(cx - drag.sx, cy - drag.sy) < DRAG_SLOP) return;
drag.moved || achieve({ bug: "drag", obstacle: "dragObst" }[drag.kind]), drag.moved = !0;
p.x = clamp(cx + drag.ox, drag.pad, boxLW - drag.pad);
p.y = clamp(cy + drag.oy, drag.pad, boxLH - drag.pad);
"bug" === drag.kind && (think(drag.e), p.dropStuck = p.top = 1);
if ("obstacle" === drag.kind && hypot(cx - drag.sx, cy - drag.sy) > 6) {
const a = atan2(cy - drag.sy, cx - drag.sx), d = drag.ha == null ? 0 : norm(a - drag.ha);
drag.ha = a, drag.sx = cx, drag.sy = cy, abs(d) < 2 && (drag.turn = (drag.turn || 0) + d);
abs(drag.turn) > 5.6 && (achieve("rotObst"), C.obstacle.get(drag.e).rot += sign(drag.turn) * PI / 4, drag.turn -= sign(drag.turn) * TAU)
}
e.preventDefault()
}
function endDrag() { drag && (suppressClick = drag.moved, drag = null) }
