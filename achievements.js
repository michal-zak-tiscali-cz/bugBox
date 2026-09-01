const RECORDS0 = { games: 0, kills: 0, fights: 0, wins: 0, maxBugs: 0, bestKill: 0, bestName: "\u2014", longestDynasty: 0 };
let records = { ...RECORDS0 };
try { const s = localStorage.getItem("bugbox_records"); s && (records = { ...records, ...JSON.parse(s) }) } catch (e) {}
function saveRecords() { try { localStorage.setItem("bugbox_records", JSON.stringify(records)) } catch (e) {} }
records.games++, saveRecords();
let prog = { done: {}, own: 0, ownMax: 0, fed: 0, bought: 0, kills: 0, wins: 0, streak: 0, bred: 0, lost: 0, culled: 0, hatched: 0 };
const TUTORIAL = [
["own", "own a bug"],
["feed", "feed a bug"],
["drag", "drag a bug"],
["breed", "breed a bug"],
["fight", "fight a bug"]
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
["smart", "breed a smart bug (int 5+)"],
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
["beatWeak", "beat a weak bug"],
["beatEven", "beat an even bug"],
["beatStrong", "beat a strong bug"],
["win1", "win 1on1"],
["win3", "win 3on3"],
["win6", "win 6on6"],
["winMayhem", "win mayhem"],
["tough", "create a tough bug (survived 5 combats)"],
["rough", "create a rough bug (survived 10 combats)"],
["veteran", "create a veteran bug (survived 15 combats)"],
["hero", "create a hero bug (survived 20 combats)"],
["legendary", "create a legendary bug (survived 30 combats)"],
["fed10", "feed bugs 10 times"],
["fed50", "feed bugs 50 times"],
["hatch1", "hatch an egg in the terrarium"],
["hatch10", "hatch 10 eggs"],
["mate", "witness a mating"],
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
["lost10", "lose 10 bugs in combat"],
["bred10", "breed 10 bugs"],
["bred50", "breed 50 bugs"],
["allFive", "breed a bug with every stat 5+"],
["statTen", "breed a bug with a stat at 10"],
["perfect", "breed a perfect bug (all records 10)"],
["cull", "cull a bug in the lab"],
["designer", "use the bug designer"],
["science", "turn on Science mode"],
["inspect", "inspect a bug"],
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
const ACH_TEXT = {};
[...TUTORIAL, ...ACHIEVEMENTS].forEach(([k, t]) => ACH_TEXT[k] = t);
function achieve(k) {
if (!ACH_TEXT[k] || prog.done[k]) return;
prog.done[k] = 1, toast("Achieved: " + ACH_TEXT[k])
}
function achStep(field, marks, prefix, add) {
prog[field] += add == null ? 1 : add; marks.forEach(m => prog[field] >= m && achieve(prefix + m))
}
function achOwn(added) {
added && (prog.own += added), prog.ownMax = max(prog.ownMax, bugbox.length);
records.maxBugs = max(records.maxBugs, bugbox.length);
bugbox.forEach(b => (b.killsTotal || 0) > records.bestKill && (records.bestKill = b.killsTotal, records.bestName = b.name));
saveRecords();
bugbox.length && achieve("own"), prog.ownMax >= 10 && achieve("own10"),
[50, 75, 100].forEach(m => prog.own >= m && achieve("own" + m));
const kinds = new Set;
bugbox.forEach(b => (b.abilities || []).forEach(a => kinds.add(a)));
kinds.size >= 10 && achieve("breeder10"), kinds.size >= ABIL_IDS.length && achieve("breeder20");
bugbox.filter(b => (b.abilities || []).length >= 4).length >= 3 && achieve("elite4");
boxFull() && achieve("fullBox");
bugbox.length > 1 && bugbox.every(b => b.mated) && achieve("matedAll")
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
[["con", "heavy"], ["str", "strong"], ["agi", "fast"], ["int", "smart"], ["per", "aware"]].forEach(([k, a]) => b[k] >= 5 && achieve(a));
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
function achFight(won, lostAny, alive) {
achieve("fight");
records.fights++, won && records.wins++, saveRecords();
if (!won) return void (prog.streak = 0);
achieve(["beatWeak", "beatEven", "beatStrong"][enemyTier]), achieve(mayhem ? "winMayhem" : "win" + fightMode);
prog.streak++, achStep("wins", [5, 25, 50], "win"),
prog.streak >= 5 && achieve("streak5"), lostAny || achieve("flawless"), 1 === alive && achieve("lastStand")
}
function achList(list) {
return list.map(([k, t]) => `<div style="color:${prog.done[k]?"#44ff88":"#445566"};">${prog.done[k]?"\u2714":"\u2610"} ${t}</div>`).join("")
}
function renderTutorial() { $("itab-tut").innerHTML = achList(TUTORIAL) }
function renderAchievements() {
$("itab-ach").innerHTML = `<div style="color:#ffdd44;margin-bottom:6px;">${ACHIEVEMENTS.filter(([k])=>prog.done[k]).length} / ${ACHIEVEMENTS.length}</div>` + achList(ACHIEVEMENTS)
}
function addKills(n) { n > 0 && (records.kills += n, saveRecords(), achStep("kills", [10, 50, 100], "kill", n)) }
function trackDynasty(gen) {
gen > records.longestDynasty && (records.longestDynasty = gen, saveRecords());
[5, 10, 15, 20, 25, 30, 33].forEach(m => gen >= m && achieve("gen" + m))
}
