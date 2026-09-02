function renderAbilWiki() {
const el = $("itab-abil");
if (el.dataset.done) return;
el.dataset.done = "1";
const detail = {
dash: `Charges from up to 3 body lengths out at double walking speed and bites the instant it arrives, skipping the usual wind-up. It runs until it gets there, not for a set time. Sight range does not limit it.`,
jump: "Leaps clean over the target and lands behind it. Both bugs then spin around \u2014 the target reacts 2s late, so the rear strike usually lands first.",
knockout: "Stuns the target. Duration scales with your STR and with how far it beats the target's STR (up to 3x). Resilient bugs are immune.",
kickback: "Shoves the target away and spins it 0-180 degrees. Distance scales with STR. Resilient bugs take half the shove and no spin.",
flanking: `Tries to circle around to the target's rear for up to ${FLANK_WINDOW_MS / 1e3}s once inside ${FLANK_RANGE} px, then bites. Can flank again after a successful bite.`,
strongbite: "Charges up: the next bite deals double damage.",
swiftbite: `The next bite needs only half the usual wind-up: ${BITE_PREP_MS/2} ms instead of ${BITE_PREP_MS} ms.`,
backflip: `After landing a bite, hops backward and retreats at walking pace for ${ABILITIES.backflip.dur / 1e3}s before re-engaging.`,
grab: `Seizes an enemy approached from its side or rear and drags it backward at half walking speed for up to ${GRAB_HOLD_MS / 1e3}s. The victim cannot act at all.`,
mark: `On a hit, broadcasts the target to every ally within 6 body lengths. They all switch to it for ${ABILITIES.mark.dur / 1e3}s.`,
phoenix: `Once per fight: on death, lies still for ${(ABILITIES.phoenix.dur/1000).toFixed(0)}s, then rises again at 10% HP.`,
fake: `Below 50% HP, drops and plays dead for ${(ABILITIES.fake.dur/1000).toFixed(0)}s. Enemies stop targeting it. Usable twice per fight.`,
loud: `Screams for ${(ABILITIES.loud.dur / 1e3).toFixed(1)}s. Every enemy within 3 body lengths cannot use any ability at all.`,
alarm: "Passive, always on. Every single bite it takes calls in the whole team: allies not already fighting head straight for the spot where it was bitten.",
braced: "Passive, always on. Immune to stun; kickback shoves it only half as far and never spins it.",
focus: "Passive, always on. Targets the weakest visible enemy by current HP instead of the closest one.",
resilient: "Passive, always on. Carries 50% more health than its CON alone would give. Nothing else changes: bites land as hard as ever, there is simply more bug to chew through.",
chitin: "Passive, always on. Every bite this bug takes does half damage \u2014 no duration, no cooldown, nothing to time.",
tank: "Passive, always on. Never stops advancing \u2014 keeps walking at its own full speed even while biting, shoving any bug without Tank out of its path. The glass stops it; nothing else does.",
steadfast: `Passive, always on. Walks and turns at double speed \u2014 ${2 * BASE_WALK} px/s per AGI point instead of ${BASE_WALK}, and half the time for every turn.`,
flee: `Twice per fight \u2014 once below half its health, once below a quarter \u2014 it turns sharply away and runs for ${FLEE_MIN_MS / 1e3}\u2013${FLEE_MAX_MS / 1e3}s before hunting again. A bug that also plays dead does that first and only starts running once it is back on its feet.`
};
el.innerHTML = SK.map(k =>
`<div class="mw-title">${STAT_FULL[k]}</div>` + ABIL_IDS.filter(id => ABILITIES[id].stat === k).map(id => {
const a = ABILITIES[id],
cd = a.cd > 0 ? ` &middot; cd ${(a.cd/1000).toFixed(0)}s` : " &middot; passive";
return `<div class="panel"><b style="color:#c8f;">\u2b22 ${a.name}</b> <span style="color:#556;">\u2014 req ${k.toUpperCase()}&ge;5${cd}</span><br>
        <span style="color:#9ab;">${detail[id]}</span></div>`
}).join("")).join("")
}
const STAT_FULL = { con: "Constitution", str: "Strength", agi: "Agility", int: "Intelligence", per: "Perception" };
function renderInfoWiki() {
const el = $("itab-info");
if (el.dataset.done) return;
el.dataset.done = "1";
el.innerHTML +=
`<p><b class="c-hdr">ABILITIES</b><br>
      Max <b>4</b> per bug, passive or active alike. Gained at birth if the required stat is <b>5 or higher</b> (~15% chance each). Inherited with ~50% chance from one parent, ~85% if both parents share it.</p>
     <p><b class="c-hdr">VISION</b><br>
      A bug sees a cone in front of it and nothing else. PER sets both how far and how wide: <b>${FOV_MIN_DEG}&deg; wide at PER 1</b>, <b>${FOV_MAX_DEG}&deg; at PER 10</b>, reaching <b>body length &times; PER</b> pixels. Nothing behind that cone exists for it &mdash; but a bite in the side or the back makes it turn on whoever bit it. It remembers an enemy it has lost for <b>INT + 2 seconds</b>.</p>
     <p><b class="c-hdr">SPEED</b><br>
      Walking is <b>${BASE_WALK} &times; AGI</b> px/s, and a half turn takes <b>${(PI / turningOf({ agi: 1 })).toFixed(1)}s at AGI 1</b> down to <b>${(PI / turningOf({ agi: 10 })).toFixed(2)}s at AGI 10</b>. Every walk in the game is that speed or a plain multiple of it: <b>&times;2</b> dashing, <b>&times;0.5</b> dragging a grabbed bug.</p>
     <p><b class="c-hdr">BITE WIND-UP</b><br>
      Every bite needs <b>${BITE_PREP_MS} ms</b> of standing in range and facing the target. The wind-up only advances while facing.</p>
     <p><b class="c-hdr">DAMAGE FORMULA</b><br>
      <code>damage = STR &times; variance &times; flank &times; strongBite</code>, then halved if the target has Shield up.<br>
      variance = <b>0.8&ndash;1.2</b> (exactly <b>1.0</b> with the RND toggle off) &middot; strongBite = <b>2</b> on a charged bite, else <b>1</b>.<br>
      Max HP = <code>12 &times; CON</code>. Dodge chance = <b>2.5% &times; AGI</b>, capped at <b>25%</b>.</p>
     <p><b class="c-hdr">FLANK ZONES</b> (angle between the incoming hit and where the target faces \u2014 each zone spans 120&deg;)<br>
      &bull; <b>Front</b> 0&ndash;60&deg; &rarr; <b class="c-money">&times;1</b> &nbsp; &bull; <b>Side</b> 60&ndash;120&deg; &rarr; <b class="c-money">&times;1.5</b> &nbsp; &bull; <b>Rear</b> 120&ndash;180&deg; &rarr; <b class="c-money">&times;2</b></p>
     <p><b class="c-hdr">SCIENCE MODE</b> (Settings)<br>
      Adds a toggle row over the box: <b>VIS ABI NAME HP ZONE BITE DMG RND COL</b> \u2014 vision cones, cooldown readouts, names, HP bars, flank sectors, wind-up bars, damage numbers, randomness and flat team colours.<br>
      With <b>RND</b> off: flat damage, no dodges, stable turn order, deterministic wandering \u2014 the same fight replays identically.</p>`
}
function renderMorphWiki() {
const el = $("itab-morph");
if (el.dataset.done) return;
el.dataset.done = "1";
const baseCfg = { bodySegments: 2, segmentGradient: 3, bodyLength: 22, bodyWidth: 6, headSize: 4, legLen: 14, headGear: "eyes", headGearSize: 0 };
const row = (title, items) =>
`<div class="mw-title">${title}</div><div class="mw-grid">` +
items.map(([lbl], i) => `<div class="mw-item"><canvas class="mw-cv" data-r="${title}-${i}"></canvas><span>${lbl}</span></div>`).join("") + "</div>";
const sections = [
["Head gear", GEAR_KEYS.flatMap(g => [0, 1, 2].map(z => [`${GEAR_LABEL[g]} ${SIZE_LABEL[z]}`, { headGear: g, headGearSize: z }]))],
["Head size (INT)", [2, 3, 4, 5, 6].map(v => [`Size ${v}`, { headSize: v }])],
["Body (CON \u00d7 STR)", [["Short thin", { bodyLength: 10, bodyWidth: 2 }], ["Mid", { bodyLength: 22, bodyWidth: 6 }], ["Long", { bodyLength: 37, bodyWidth: 6 }], ["Long wide", { bodyLength: 37, bodyWidth: 11 }]]],
["Segment gradient", [1, 2, 3, 4, 5].map(v => [`Grad ${v}`, { segmentGradient: v, bodySegments: 3, bodyLength: 30 }])],
["Legs (AGI)", [6, 14, 24].map(v => [`Len ${v}`, { legLen: v }])]
];
el.innerHTML = '<p>Length follows CON, width STR, head INT, legs AGI, head gear size PER. Segments, gradient, gear type and hue are independent.</p>' + sections.map(([t, items]) => row(t, items)).join("");
sections.forEach(([t, items]) => items.forEach(([lbl, mod], i) => {
const cv = el.querySelector(`[data-r="${t}-${i}"]`), ctx = hidpi(cv, 86, 86);
drawMorphCentered(ctx, { hue: 140, morph: { ...baseCfg, ...mod } }, 86, 86)
}))
}
