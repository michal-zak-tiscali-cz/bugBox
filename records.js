function renderRecords() {
const liveGen = bugbox.reduce((m, b) => max(m, b.gen || 1), 0);
liveGen > records.longestDynasty && (records.longestDynasty = liveGen, saveRecords());
const winRate = records.fights ? round(records.wins / records.fights * 100) : 0,
r = (l, v, c) => `<div>${l}: <b style="color:${c};">${v}</b></div>`;
$("itab-rec").innerHTML =
'<div style="color:#556;font-size:9px;margin-bottom:4px;">all games</div>' +
r("Games played", records.games, "#4cf") +
r("Total kills", records.kills, "#ff5566") +
r("Total fights", records.fights, "#4f8") +
r("Total wins", records.wins, "#4f8") +
r("Win rate", winRate + "%", "#fa4") +
r("Longest dynasty", "Gen " + records.longestDynasty, "#a4f") +
r("Most bugs at once", records.maxBugs, "#4cf") +
r("Top killer", records.bestKill > 0 ? `${records.bestName} (${records.bestKill})` : "\u2014", "#fd4")
}
function resetRecords() {
records = { ...RECORDS0, games: 1 }, saveRecords(), renderRecords()
}
