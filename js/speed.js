let speedBeforePause = 1;
function syncSpeedLabel() {
const el = $("btn-speed");
el && (el.textContent = "Speed " + (simSpd === 0 ? speedBeforePause : simSpd) + "×");
const st = $("btn-step");
st && (st.textContent = simSpd === 0 ? "\u25b6 PLAY" : "\u275a\u275a PAUSE")
}
