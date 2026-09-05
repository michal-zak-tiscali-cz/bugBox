function statColor(v) {
const n = round(v);
return n <= 2 ? "#cc3333" : n <= 4 ? "#cc7722" : n <= 6 ? "#cccc22" : n <= 8 ? "#00ff66" : "#22dddd"
}
const statSum = o => SK.reduce((s, k) => s + o[k], 0);
const scaleMaxOf = list => list.some(b => SK.some(k => b[k] >= 6)) ? 10 : 5;
function statBars(statsObj, opts) {
const fs = (opts = opts || {}).fontSize || 8,
dead = opts.dead || !1,
scale = 100 / (opts.scaleMax || scaleMaxOf(bugsOwned)),
total = statSum(statsObj);
return `<div class="sr" style="justify-content:flex-end;"><span class="sv" style="font-size:${fs}px;color:${dead?"#555":"#888"}">(${round(total)})</span></div>` + SK.map((k, i) => {
const sv = statsObj[k],
bc = dead ? "#444" : statColor(sv);
return `<div class="sr"><span class="sl" style="font-size:${fs}px;">${SN[i]}</span><div class="st"${opts.barW?` style="width:${opts.barW}px;flex:none;"`:""}><div class="sf" style="width:${clamp(scale*sv,0,100)}%;background:${bc}"></div></div><span class="sv" style="font-size:${fs}px;color:${dead?"#555":"#888"}">${round(sv)}</span></div>`
}).join("")
}
const SYL1 = ["Kr", "Veth", "Dor", "Br", "Zeph", "Th", "Ol", "Nex", "Grix", "Vael", "Mir", "Jex", "Wyr", "Sk", "Ph"],
SYL2 = ["ax", "eth", "oru", "rix", "ael", "rax", "ion", "elm", "yx", "ath", "oz", "im"];
function genName() {
return SYL1[ri(SYL1.length)] + SYL2[ri(SYL2.length)]
}
const sylSplit = n => { const p = SYL1.find(s => n.startsWith(s)) || SYL1[0]; return [p, n.slice(p.length) || SYL2[0]] };
function childName(a, b) {
const [a1, a2] = sylSplit(a.name), [b1, b2] = sylSplit(b.name),
used = n => bugsOwned.some(x => x.name === n) || boxEggs.some(g => g.bug.name === n);
for (const n of [a1 + b2, b1 + a2]) if (!used(n)) return n;
for (let i = 0; i < 40; i++) { const n = a1 + SYL2[ri(SYL2.length)]; if (!used(n)) return n }
return genName()
}
function makeBug(o = {}) {
const b = {
id: bid++,
name: genName(),
gen: 1,
hue: 20 * ri(18),
morph: randomMorph(),
wins: 0,
losses: 0,
killsTotal: 0,
fights: 0,
con: 4,
str: 3,
agi: 3,
per: 5,
int: 3,
abilities: [],
...o
};
return o.abilities || b.abilities.length || (b.abilities = assignBirthAbilities(b)), b.curHp == null && (b.curHp = maxHpOf(b)), b.mood == null && (b.mood = "peace"), syncMorph(b), b
}
function maxHpOf(b) { return round(12 * b.con * (hasAbil(b, "resilient") ? 1.5 : 1)) }
function hpFrac(b) { const m = maxHpOf(b); return clamp((b.curHp == null ? m : b.curHp) / m, 0, 1) }
