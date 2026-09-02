const GAME_VERSION = "63.9";
const {PI,random,max,min,hypot,sin,cos,atan2,round,abs,sign,pow,floor}=Math;
const TAU=2*PI, HALF_PI=PI/2;
const $ = id => document.getElementById(id);
document.addEventListener("DOMContentLoaded", () => {
const vt = $("game-version-tag");
vt && (vt.textContent = "v" + GAME_VERSION)
});
const SK = ["con", "str", "agi", "int", "per"];
const sound = { on: !0, ctx: null };
function actx() { return sound.ctx || (sound.ctx = new(window.AudioContext || window.webkitAudioContext)) }
function beep(freq, dur, type, vol, slide) {
if (!sound.on) return;
const c = actx(), t = c.currentTime, o = c.createOscillator(), g = c.createGain();
o.type = type || "square", o.frequency.setValueAtTime(freq, t);
slide && o.frequency.exponentialRampToValueAtTime(max(20, slide), t + dur);
g.gain.setValueAtTime(vol || .15, t), g.gain.exponentialRampToValueAtTime(.001, t + dur);
o.connect(g), g.connect(c.destination), o.start(t), o.stop(t + dur)
}
const SFX = {
bite() { beep(220, .09, "square", .12, 90) },
hatch() { beep(300, .12, "sine", .14, 620); setTimeout(() => beep(500, .16, "sine", .14, 880), 110) },
win() {[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .18, "triangle", .16), 120 * i)) },
feed() { beep(660, .07, "sine", .1, 990) }
};
