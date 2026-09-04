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
if (!combatState) ecsQuery("bug").length !== bugsOwned.length && spawnTerr();
tickDebt += real * simSpd / COMBAT_STEP_MS;
let guard = 0;
while (tickDebt >= 1 && guard++ < MAX_STEPS_PER_FRAME) {
tickDebt -= 1, tick(COMBAT_STEP_MS, combatState);
if (combatState && (checkFightEnd(), fightDone)) { tickDebt = 0; break }
}
if (guard >= MAX_STEPS_PER_FRAME) tickDebt = 0;
sysAnimPhase(), syncHud();
sysRender(combatState)
}
function tick(dt, fight) {
const dtS = dt / 1e3,
all = ecsQuery("bug", "pos", "vel", "think", "wall"),
ents = fight ? all.filter(e => "fighting" !== C.bug.get(e).mood && !C.combat.get(e).dead) : all;
fight && (sysSeek(ents), sysCombatAI(dt));
sysThinkWander(dt, ents), sysSteer(dtS, ents), sysMove(dtS, fight ? all : ents);
fight || (sysMate(dt, ents), sysFeed(), sysRegen(dtS));
sysResolve(fight ? all : ents, dtS)
}
let speedBeforePause = 1;
function syncSpeedLabel() {
const el = $("bt-speed");
el && (el.textContent = "Speed " + (simSpd === 0 ? speedBeforePause : simSpd) + "×");
const st = $("bt-pause");
st && (st.textContent = simSpd === 0 ? "\u25b6 PLAY" : "\u275a\u275a PAUSE")
}
