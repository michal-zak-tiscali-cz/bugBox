const INFO_TABS = ["info", "tut", "ach", "morph", "abil", "rec"];
function openInfoTab(t) { overlay("settings-ov", 1), infoTab(t) }
function openSettingsOverlay() { openInfoTab("info") }
function infoTab(t) {
document.querySelectorAll(".info-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === t));
INFO_TABS.forEach(k => $("itab-" + k).style.display = k === t ? "" : "none");
t === "tut" && renderTutorial();
t === "ach" && renderAchievements();
t === "info" && renderInfoWiki();
t === "morph" && renderMorphWiki();
t === "abil" && renderAbilWiki();
t === "rec" && renderRecords();
$("info-foot").innerHTML = (t === "rec" ? '<button class="danger btn-std" onclick="resetRecords()">Reset</button>' : "") +
'<button class="ok btn-std" onclick="closeSettingsOverlay()">OK</button>'
}
function closeSettingsOverlay() {
overlay("settings-ov", 0)
}
function overlay(id, on) { $(id).style.display = on ? "flex" : "none" }
function showScreen(id) {
"s-shop" === id || cancelOverWatch();
"s-terr" === id || markEggsReady();
("s-terr" !== id || !combatMode) && $("result-ov").classList.remove("open");
"s-terr" !== id || combatMode || (simSpd = 1, tickDebt = 0, syncSpeedLabel());
document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")), $(id).classList.add("active"), syncSimLoop();
if ("s-terr" === id) {
combatMode || hatchReadyEggs();
const wantCombat = combatMode;
requestAnimationFrame(() => {
requestAnimationFrame(() => {
combatMode === wantCombat && (resizeBoxCV(), combatMode && ecsQuery("bug").length || spawnBoxBugs())
})
})
}
}
function updateMoney() {
$("shop-money").textContent = "$" + money, $("terr-money").textContent = "$" + money, $("breed-money").textContent = "$" + money;
money >= 1000 && achieve("rich1k"), money >= 5000 && achieve("rich5k")
}
