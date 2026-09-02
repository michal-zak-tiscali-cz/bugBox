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
$("btn-shop-done").onclick = shopDone;
$("btn-buy-more").onclick = () => { openShop(), showScreen("s-shop") };
$("btn-arena-market").onclick = () => { openShop(), showScreen("s-shop") };
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
boxCv.onclick = e => {
const r = boxCv.getBoundingClientRect(),
cx = e.clientX - r.left,
cy = e.clientY - r.top;
if (suppressClick) { suppressClick = !1; return }
let hit = null, best = 999;
ecsQuery("bug", "pos").forEach(en => {
const cb = C.combat.get(en);
if (cb && cb.dead) return;
const p = C.pos.get(en), d = hypot(p.x - cx, p.y - cy);
d < bugLen(C.bug.get(en)) && d < best && (best = d, hit = C.bug.get(en))
});
if (hit) { inspected = hit === inspected ? null : hit, inspected && achieve("inspect"); return }
if (inspected) return void(inspected = null);
if (!canPlaceFood()) return;
const fHit = ecsQuery("food", "pos").find(en => {
const fp = C.pos.get(en);
return hypot(fp.x - cx, fp.y - cy) < 8
});
if (fHit != null) return void ecsKill(fHit);
if (obstacleAt(cx, cy) != null) return;
ecsSpawn({ food: {}, pos: { x: cx, y: cy, dir: 0 } }), SFX.feed()
}, window.addEventListener("resize", () => {
resizeBoxCV(), $("s-terr").classList.contains("active") && !combatMode && spawnBoxBugs()
}), $("btn-go-breed").onclick = () => openBreedScreen(), $("btn-go-combatMode").onclick = () => {
openArena(), showScreen("s-arena")
}, $("btn-breed-back").onclick = () => {
if ("result" === breedSt.phase && breedSt.larva) {
const l = breedSt.larva;
bugbox.some(x => x.id === l.id) || bugbox.push(l), breedSt.larva = null
}
showScreen("s-terr"), initBugBox()
}, $("btn-breed-market").onclick = () => {
goShop(), showScreen("s-shop")
}, document.addEventListener("click", closeKillOverlay), $("btn-arena-go").onclick = startFight, $("btn-arena-back").onclick = () => {
backToBugBox()
};
$("btn-speed").onclick = () => {
const seq = [.5, 1, 2, 4, 16],
cur = simSpd === 0 ? speedBeforePause : simSpd,
next = seq[(seq.indexOf(cur) + 1) % seq.length];
speedBeforePause = next, simSpd === 0 || (simSpd = next), tickDebt = 0, syncSpeedLabel()
}, $("btn-step").onclick = () => {
simSpd === 0 ? simSpd = speedBeforePause : (speedBeforePause = simSpd, simSpd = 0);
tickDebt = 0, syncSpeedLabel()
}, $("btn-leave").onclick = () => {
achieve("abandon");
const survivors = boxBugs.filter(f => 0 === f.team && !f.dead).map(f => f.b);
endCombatMode(), spawnBoxBugs(), openArena(!0, survivors), showScreen("s-arena"), toast("Fight abandoned. Your bugs are safe.")
}, updateMoney();
$("btn-open-design").onclick = openDesignOverlay;
$("btn-game-settings").onclick = () => {
$("gset-snd").checked = sound.on;
$("gset-sci").checked = scienceOn;
overlay("gsettings-ov", 1)
};
$("gset-snd").onchange = e => { sound.on = e.target.checked };
$("btn-fow") && ($("btn-fow").onclick = () => toggleFow());
