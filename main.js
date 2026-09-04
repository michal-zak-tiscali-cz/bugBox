! function() {
const ctx = hidpi($("intro-art"), 200, 60);
ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 200, 60), [40, 100, 160].forEach((cx, i) => {
const m = randomMorph();
drawMorphBug(ctx, m, morphColor([120, 30, 275][i]), cx, 32, 0, { scale: morphFitScale(m, 52, 48), shadow: !1 })
}), ctx.fillStyle = "#ffdd44", [
[10, 6],
[190, 6],
[10, 52],
[190, 52]
].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2))
}();
$("bt-buy").onclick = shopDone;
boxCv.addEventListener("pointerdown", e => {
const [cx, cy] = boxPt(e), t = draggableAt(cx, cy);
if (!t || !canDrag(t.kind)) return;
const op = C.pos.get(t.e);
"bug" === t.kind && mateCancel(t.e);
drag = { ...t, ox: op.x - cx, oy: op.y - cy, sx: cx, sy: cy, moved: !1 };
boxCv.setPointerCapture && boxCv.setPointerCapture(e.pointerId)
});
boxCv.addEventListener("pointermove", e => {
if (!drag) return;
const [cx, cy] = boxPt(e), p = C.pos.get(drag.e);
if (!p) return void(drag = null);
if (!drag.moved && hypot(cx - drag.sx, cy - drag.sy) < DRAG_SLOP) return;
drag.moved || achieve("drag"), drag.moved = !0;
p.x = clamp(cx + drag.ox, drag.pad, boxLW - drag.pad);
p.y = clamp(cy + drag.oy, drag.pad, boxLH - drag.pad);
if ("bug" === drag.kind) { const t = C.think.get(drag.e); t && (t.paused = !0, t.pauseTimer = DROP_PAUSE), p.dropStuck = 1 }
e.preventDefault()
});
function endDrag() { drag && (suppressClick = drag.moved, drag = null) }
boxCv.addEventListener("pointerup", endDrag);
boxCv.addEventListener("pointercancel", endDrag);
let tapT = [];
const TAP_R = 29, TAP_MS = 1000;
boxCv.onclick = e => {
const r = boxCv.getBoundingClientRect(),
cx = e.clientX - r.left,
cy = e.clientY - r.top;
if (suppressClick) { suppressClick = !1; return }
let hit = null, best = 999;
ecsQuery("bug", "pos").forEach(en => {
const p = C.pos.get(en), d = hypot(p.x - cx, p.y - cy);
d < bugLen(C.bug.get(en)) && d < best && (best = d, hit = C.bug.get(en))
});
if (hit) { inspected = hit === inspected ? null : hit, inspected && achieve("inspect"); return }
if (combatMode) {
const now = performance.now();
tapT = tapT.filter(o => now - o.t < TAP_MS && hypot(o.x - cx, o.y - cy) < TAP_R), tapT.push({ x: cx, y: cy, t: now });
if (tapT.length >= 3) return tapT = [], void panicAll()
}
if (inspected) return void(inspected = null);
if (!canPlaceFood()) return;
const fHit = ecsQuery("food", "pos").find(en => {
const fp = C.pos.get(en);
return hypot(fp.x - cx, fp.y - cy) < 8
});
if (fHit != null) return;
if (obstacleAt(cx, cy) != null) return;
ecsSpawn({ food: {}, pos: { x: cx, y: cy, dir: 0 } }), SFX.feed()
}, window.addEventListener("resize", () => {
resizeBoxCV(), $("s-terr").classList.contains("active") && !combatMode && spawnBoxBugs()
}), $("bt-lab").onclick = () => openLab(), $("bt-chal").onclick = () => {
openChal(), showScreen("s-chal")
}, document.addEventListener("click", e => {
if (e.target.closest(".bt-shop")) return combatMode && goTerr(), goShop();
e.target.closest(".bt-terr") && goTerr()
}), document.addEventListener("click", closeKill), $("bt-combat").onclick = startFight;
$("bt-speed").onclick = () => {
const seq = [.5, 1, 2, 4, 16],
cur = simSpd === 0 ? speedBeforePause : simSpd,
next = seq[(seq.indexOf(cur) + 1) % seq.length];
speedBeforePause = next, simSpd === 0 || (simSpd = next), tickDebt = 0, syncSpeedLabel()
}, $("bt-pause").onclick = () => {
simSpd === 0 ? simSpd = speedBeforePause : (speedBeforePause = simSpd, simSpd = 0);
tickDebt = 0, syncSpeedLabel()
}, $("bt-leave").onclick = () => {
achieve("abandon");
const survivors = boxBugs.filter(f => 0 === f.team && !f.dead).map(f => f.b);
endCombatMode(), spawnBoxBugs(), openChal(!0, survivors), showScreen("s-chal"), toast("Fight abandoned. Your bugs are safe.")
}, updateMoney();
$("bt-des").onclick = openDz;
$("bt-set").onclick = () => {
$("gset-snd").checked = sound.on;
$("gset-sci").checked = scienceOn;
ov("ov-set", 1)
};
$("gset-snd").onchange = e => { sound.on = e.target.checked };
$("bt-fow") && ($("bt-fow").onclick = () => toggleFow());
