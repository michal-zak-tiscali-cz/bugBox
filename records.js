function renderRecords() {
trackDynasty(bugsOwned.reduce((m, b) => max(m, b.gen || 1), 0));
const r = (l, f, c) => `<div>${l}: ${[run, records].map(R => `<b style="color:${c};">${f(R)}</b>`).join(" / ")}</div>`,
best = (v, n) => v > 0 ? `${n} (${v})` : "\u2014";
$("itab-rec").innerHTML =
'<div style="color:#556;font-size:9px;margin-bottom:4px;">this run / all games</div>' +
(run.end ? `<div>Last loss: <b style="color:#f44;">${run.end}</b></div>` : "") +
r("Games played", R => R.games, "#4cf") +
r("Kills", R => R.kills, "#ff5566") +
r("Fights", R => R.fights, "#4f8") +
r("Wins", R => R.wins, "#4f8") +
r("Win rate", R => (R.fights ? round(R.wins / R.fights * 100) : 0) + "%", "#fa4") +
r("Fight time min-avg-max", R => R.fN ? [R.fMin, R.fSum / R.fN, R.fMax].map(fmtT).join("-") : "\u2014", "#fff") +
r("Longest dynasty", R => "Gen " + R.longestDynasty, "#a4f") +
r("Most bugs at once", R => R.maxBugs, "#4cf") +
r("Best bug", R => best(R.bestSum, R.bestSumName), "#4f8") +
r("Top killer", R => best(R.bestKill, R.bestName), "#fd4")
}
function resetRecords() {
Object.assign(records, RECORDS0, { games: 1 }), saveRecords(), renderRecords()
}
