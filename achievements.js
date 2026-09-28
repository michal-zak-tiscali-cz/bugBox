const RECORDS0 = { games: 0, kills: 0, fights: 0, wins: 0, maxBugs: 0, bestKill: 0, bestName: "\u2014", bestSum: 0, bestSumName: "\u2014", longestDynasty: 0, fN: 0, fSum: 0, fMin: 0, fMax: 0 };
let records = { ...RECORDS0 };
try { const s = localStorage.getItem("bugbox_records"); s && (records = { ...records, ...JSON.parse(s) }) } catch (e) {}
function saveRecords() { try { localStorage.setItem("bugbox_records", JSON.stringify(records)) } catch (e) {} }
records.games++, saveRecords();
let achSt = { done: {}, own: 0, ownMax: 0, fed: 0, bought: 0, kills: 0, wins: 0, streak: 0, bred: 0, lost: 0, culled: 0, hatched: 0 };
const TUTORIAL = [
["own", "own a bug"],
["feed", "feed a bug"],
["drag", "drag a bug"],
["inspect", "inspect a bug"],
["breed", "breed a bug"],
["mate", "mate a bug"],
["fight", "fight a bug"],
["kill", "kill a bug"]
];
const ACHIEVEMENTS = [
["own10", "own 10 bugs (at the same time)"],
["own50", "own 50 bugs"],
["own75", "own 75 bugs"],
["own100", "own 100 bugs"],
["gen5", "produce 5 generations"],
["gen10", "produce 10 generations"],
["gen15", "produce 15 generations"],
["gen20", "produce 20 generations"],
["gen25", "produce 25 generations"],
["gen30", "produce 30 generations"],
["gen33", "produce 33 generations"],
["heavy", "breed a heavy bug (con 5+)"],
["strong", "breed a strong bug (str 5+)"],
["fast", "breed a fast bug (agi 5+)"],
["clever", "breed a clever bug (int 5+)"],
["aware", "breed an aware bug (per 5+)"],
["weak", "breed a weak bug (stat sum 5)"],
["powerful", "breed a powerful bug (stat sum 20+)"],
["superior", "breed a superior bug (stat sum 30+)"],
["elite", "breed an elite bug (stat sum 40+)"],
["godlike", "breed a godlike bug (stat sum 50)"],
["skilled", "breed a skilled bug (1 ability)"],
["skilful", "breed a skilful bug (2 abilities)"],
["expert", "breed an expert bug (3 abilities)"],
["master", "breed a master bug (4 abilities)"],
...[1, 2, 3, 4, 5].map(t => ["tier" + t, "win at tier " + t]),
["win1", "win 1 v 1"],
["win2", "win 2 v 2"],
["win3", "win 3 v 3"],
["win6", "win 6 v 6"],
["winmayhem", "win mayhem"],
...Object.entries({ mc: "mortal combat", boss: "boss fight", rb: "raid boss", wb: "world boss" }).flatMap(([m, n]) => Array.from({ length: 5 }, (_, i) => [m + (i + 1), `beat ${n} T${i + 1}`])),
["tough", "create a tough bug (survived 5 combats)"],
["rough", "create a rough bug (survived 10 combats)"],
["veteran", "create a veteran bug (survived 15 combats)"],
["hero", "create a hero bug (survived 20 combats)"],
["legendary", "create a legendary bug (survived 30 combats)"],
["fed10", "feed bugs 10 times"],
["fed50", "feed bugs 50 times"],
["hatch1", "hatch an egg in the terrarium"],
["hatch10", "hatch 10 eggs"],
["buy10", "buy 10 bugs on the market"],
["buy25", "buy 25 bugs on the market"],
["rich1k", "hold $1000 at once"],
["rich5k", "hold $5000 at once"],
["kill10", "kill 10 enemy bugs"],
["kill50", "kill 50 enemy bugs"],
["kill100", "kill 100 enemy bugs"],
["win5", "win 5 fights"],
["win25", "win 25 fights"],
["win50", "win 50 fights"],
["streak5", "win 5 fights in a row"],
["flawless", "win a fight without losing a bug"],
["lastStand", "win a fight with one bug left"],
["lost1", "lose a bug in combat"],
["lost5", "lose 5 bugs in combat"],
["lost10", "lose 10 bugs in combat"],
["lost25", "lose 25 bugs in combat"],
["lost50", "lose 50 bugs in combat"],
["lostM3", "lose 3 bugs in one match"],
["lostM6", "lose 6 bugs in one match"],
["lostM9", "lose 9 bugs in one match"],
["lostM15", "lose 15 bugs in one match"],
["lostM20", "lose 20 bugs in one match"],
["bred10", "breed 10 bugs"],
["bred50", "breed 50 bugs"],
["allFive", "breed a bug with every stat 5+"],
["statTen", "breed a bug with a stat at 10"],
["perfect", "breed a perfect bug (all records 10)"],
["cull", "cull a bug in the lab"],
["science", "turn on Science mode"],
["abandon", "abandon a fight"],
["breeder10", "good breeder (10 different abilities in your bugs)"],
["breeder20", "master breeder (every ability in your bugs)"],
["elite4", "own 3 bugs with 4 abilities each"],
["fullBox", "fill the terrarium (100 bugs and eggs)"],
["matedAll", "have every bug mated in one round"],
["playboy", "Playboy (a bug with 5 offspring)"],
["familyMan", "Family Man (a bug with 10 offspring)"],
["rabbit", "Rabbit (a bug with 15 offspring)"],
["genghisKhan", "Genghis Khan (a bug with 20 offspring)"]
];
const TUT_K = new Set(TUTORIAL.map(a => a[0]));
const ACH_TEXT = {};
[...TUTORIAL, ...ACHIEVEMENTS].forEach(([k, t]) => ACH_TEXT[k] = t);
function achieve(k) {
if (!ACH_TEXT[k] || achSt.done[k]) return;
achSt.done[k] = 1, TUT_K.has(k) || toast("Achieved: " + ACH_TEXT[k])
}
function achStep(field, marks, prefix, add) {
achSt[field] += add == null ? 1 : add; marks.forEach(m => achSt[field] >= m && achieve(prefix + m))
}
function achOwn(added) {
added && (achSt.own += added), achSt.ownMax = max(achSt.ownMax, bugsOwned.length);
records.maxBugs = max(records.maxBugs, bugsOwned.length);
bugsOwned.forEach(b => {
(b.killsTotal || 0) > records.bestKill && (records.bestKill = b.killsTotal, records.bestName = b.name);
const s = round(statSum(b));
s > records.bestSum && (records.bestSum = s, records.bestSumName = b.name)
});
saveRecords();
bugsOwned.length && achieve("own"), achSt.ownMax >= 10 && achieve("own10"),
[50, 75, 100].forEach(m => achSt.own >= m && achieve("own" + m));
const kinds = new Set;
bugsOwned.forEach(b => (b.abilities || []).forEach(a => kinds.add(a)));
kinds.size >= 10 && achieve("breeder10"), kinds.size >= ABIL_IDS.length && achieve("breeder20");
bugsOwned.filter(b => (b.abilities || []).length >= 4).length >= 3 && achieve("elite4");
boxFull() && achieve("fullBox");
bugsOwned.length > 1 && bugsOwned.every(b => b.mated) && achieve("matedAll")
}
function achKids(...parents) {
parents.forEach(p => {
if (!p) return;
p.kids = (p.kids || 0) + 1;
[[5, "playboy"], [10, "familyMan"], [15, "rabbit"], [20, "genghisKhan"]].forEach(([v, a]) => p.kids >= v && achieve(a))
})
}
function achChild(b) {
achieve("breed"), achStep("bred", [10, 50], "bred");
const sum = SK.reduce((t, k) => t + b[k], 0),
na = (b.abilities || []).length;
[["con", "heavy"], ["str", "strong"], ["agi", "fast"], ["int", "clever"], ["per", "aware"]].forEach(([k, a]) => b[k] >= 5 && achieve(a));
sum <= 5 && achieve("weak");
[[20, "powerful"], [30, "superior"], [40, "elite"], [50, "godlike"]].forEach(([v, a]) => sum >= v && achieve(a));
[[1, "skilled"], [2, "skilful"], [3, "expert"], [4, "master"]].forEach(([v, a]) => na >= v && achieve(a));
SK.every(k => b[k] >= 5) && achieve("allFive"),
SK.some(k => b[k] >= 10) && achieve("statTen"),
SK.every(k => b[k] >= 10) && achieve("perfect")
}
function achSurvive(b) {
[[5, "tough"], [10, "rough"], [15, "veteran"], [20, "hero"], [30, "legendary"]].forEach(([v, a]) => (b.fights || 0) >= v && achieve(a))
}
function achFight(won, lost, alive) {
achieve("fight");
lost && achStep("lost", [1, 5, 10, 25, 50], "lost", lost);
[3, 6, 9, 15, 20].forEach(m => lost >= m && achieve("lostM" + m));
records.fMin = records.fN++ ? min(records.fMin, fightMs) : fightMs, records.fMax = max(records.fMax, fightMs), records.fSum += fightMs, records.fights++, won && records.wins++, saveRecords();
if (!won) return void (achSt.streak = 0);
achieve("tier" + enemyTier), achieve("win" + fightMode), achieve(fightMode + enemyTier);
achSt.streak++, achStep("wins", [5, 25, 50], "win"),
achSt.streak >= 5 && achieve("streak5"), lost || achieve("flawless"), 1 === alive && achieve("lastStand")
}
function achList(list) {
return list.map(([k, t]) => `<div style="color:${achSt.done[k]?"#44ff88":"#445566"};">${achSt.done[k]?"\u2714":"\u2610"} ${t}</div>`).join("")
}
function renderTutorial() { $("itab-tut").innerHTML = achList(TUTORIAL) }
function renderAchievements() {
$("itab-ach").innerHTML = `<div style="color:#ffdd44;margin-bottom:6px;">${ACHIEVEMENTS.filter(([k])=>achSt.done[k]).length} / ${ACHIEVEMENTS.length}</div>` + achList(ACHIEVEMENTS)
}
function addKills(n) { n > 0 && (records.kills += n, saveRecords(), achStep("kills", [10, 50, 100], "kill", n)) }
function trackDynasty(gen) {
gen > records.longestDynasty && (records.longestDynasty = gen, saveRecords());
[5, 10, 15, 20, 25, 30, 33].forEach(m => gen >= m && achieve("gen" + m))
}
