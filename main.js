! function() {
const ctx = hidpi($("intro-art"), 200, 60);
ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 200, 60), [40, 100, 160].forEach((cx, i) => {
const m = randomMorph();
drawMorphBug(ctx, m, morphColor([120, 30, 275][i]), cx, 32, 0, { scale: morphFitScale(m, 52, 48), shadow: !1, hue: [120, 30, 275][i] })
}), ctx.fillStyle = "#ffdd44", [
[10, 6],
[190, 6],
[10, 52],
[190, 52]
].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2))
}();
$("bt-buy").onclick = mktDone;
boxCv.addEventListener("pointerdown", dragStart);
boxCv.addEventListener("pointermove", dragMove);
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
if (combatState) {
const now = performance.now();
tapT = tapT.filter(o => now - o.t < TAP_MS && hypot(o.x - cx, o.y - cy) < TAP_R), tapT.push({ x: cx, y: cy, t: now });
if (tapT.length >= 3) return tapT = [], void panicAll()
}
inspected = null
}, window.addEventListener("resize", () => {
$("s-terr").classList.contains("active") && !combatState ? spawnTerr() : resizeBoxCV()
}), $("bt-lab").onclick = () => openLab(), $("bt-boo").onclick = () => {
openBoo(), showScreen("s-boo")
}, document.addEventListener("click", e => {
if (e.target.closest(".bt-mkt")) return combatState && leaveFight(), openMkt();
e.target.closest(".bt-terr") && leaveFight()
}), document.addEventListener("click", closeKill), $("bt-combat").onclick = () => ("mc" === fightMode && (enemyTier = 1), startFight()), $("bt-next").onclick = () => (enemyTier++, startFight());
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
const survivors = bugsInTerr.filter(f => 0 === f.team && !f.dead).map(f => f.b);
endFight(), spawnTerr(), openBoo(!0, survivors), showScreen("s-boo"), toast("Fight abandoned. Your bugs are safe.")
}, updateMoney();
$("bt-des").onclick = openDz, $("bt-bg").onclick = bgPick;
$("bt-set").onclick = () => {
$("gset-snd").checked = sound.on;
$("gset-sci").checked = scienceOn;
$("gset-bg").checked = !!bgOn;
$("gset-thm").value = bugTheme;
ov("ov-set", 1)
};
$("gset-snd").onchange = e => { sound.on = e.target.checked };
$("bt-fow") && ($("bt-fow").onclick = () => toggleFow());
