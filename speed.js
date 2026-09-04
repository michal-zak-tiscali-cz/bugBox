let speedBeforePause = 1;
function syncSpeedLabel() {
const el = $("bt-speed");
el && (el.textContent = "Speed " + (simSpd === 0 ? speedBeforePause : simSpd) + "×");
const st = $("bt-pause");
st && (st.textContent = simSpd === 0 ? "\u25b6 PLAY" : "\u275a\u275a PAUSE")
}
