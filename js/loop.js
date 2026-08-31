let simLastT = 0,
tickDebt = 0;
function drawBoxBackdrop() {
const lw = boxLW,
lh = boxLH;
boxCx.fillStyle = "#0a0809", boxCx.fillRect(0, 0, lw, lh), boxCx.fillStyle = "#120f0a";
for (let i = 0; i < lw; i += 8)
for (let j = 0; j < lh; j += 8)(i + j) % 16 == 0 && boxCx.fillRect(i, j, 2, 2);
boxCx.strokeStyle = "#2a2a1a", boxCx.lineWidth = 2, boxCx.strokeRect(2, 2, lw - 4, lh - 4),
boxCx.fillStyle = "rgba(255,220,50,0.06)", boxCx.font = `${min(.09*lw,52)}px 'Courier New'`,
boxCx.textAlign = "center", boxCx.textBaseline = "middle", boxCx.fillText("BUGBOX", lw / 2, lh / 2)
}
function simLoop(ts) {
simFrame = requestAnimationFrame(simLoop);
const real = simLastT ? min(ts - simLastT, 100) : 16.67;
simLastT = ts;
drawBoxBackdrop();
if (!combatMode) ecsQuery("bug").length !== bugbox.length && spawnBoxBugs();
tickDebt += real * simSpd / COMBAT_STEP_MS;
let guard = 0;
while (tickDebt >= 1 && guard++ < MAX_STEPS_PER_FRAME) {
tickDebt -= 1;
if (!combatMode) { tickPeaceful(COMBAT_STEP_MS); continue }
tickFight(COMBAT_STEP_MS), checkFightEnd();
if (fightDone) { tickDebt = 0; break }
}
if (guard >= MAX_STEPS_PER_FRAME) tickDebt = 0;
sysAnimPhase(), syncHud();
sysRender(combatMode)
}
