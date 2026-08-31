function renderRecords() {
const liveGen = bugbox.reduce((m, b) => max(m, b.gen || 1), 0);
liveGen > stats.longestDynasty && (stats.longestDynasty = liveGen, saveStats());
const bugs = bugbox.length,
topKiller = bugbox.reduce((m, b) => (b.killsTotal || 0) > (m.killsTotal || 0) ? b : m, { killsTotal: -1 }),
totFights = bugbox.reduce((s, b) => s + (b.fights || 0), 0),
totWins = bugbox.reduce((s, b) => s + (b.wins || 0), 0),
winRate = totFights ? round(totWins / totFights * 100) : 0,
r = (l, v, c) => `<div>${l}: <b style="color:${c};">${v}</b></div>`;
$("itab-rec").innerHTML =
r("Total kills", stats.kills, "#ff5566") +
r("Longest dynasty", "Gen " + stats.longestDynasty, "#a4f") +
r("Live bugs", bugs, "#4cf") +
r("Top killer", topKiller.killsTotal >= 0 ? `${topKiller.name} (${topKiller.killsTotal})` : "—", "#fd4") +
r("Total fights", totFights, "#4f8") +
r("Total wins", totWins, "#4f8") +
r("Win rate", winRate + "%", "#fa4")
}
function resetRecords() {
stats = { kills: 0, longestDynasty: 0 }, saveStats(), renderRecords()
}
