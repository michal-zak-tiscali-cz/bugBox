const INFO_TABS = ["info", "tut", "ach", "morph", "abil", "rec"];
function openInfoTab(t) { ov("ov-inf", 1), infoTab(t) }
function infoTab(t) {
document.querySelectorAll(".info-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === t));
INFO_TABS.forEach(k => $("itab-" + k).style.display = k === t ? "" : "none");
t === "tut" && renderTutorial();
t === "ach" && renderAchievements();
t === "info" && renderInfoWiki();
t === "morph" && renderMorphWiki();
t === "abil" && renderAbilWiki();
t === "rec" && renderRecords();
$("info-foot").innerHTML = (t === "rec" ? '<button class="danger bt" id="bt-rec-rst" onclick="resetRecords()">Reset</button>' : "") +
'<button class="ok bt" id="bt-inf-close" onclick="ov(&quot;ov-inf&quot;,0)">OK</button>'
}
function ov(id, on) { on || cancelAnimationFrame(dzAnim), $(id).style.display = on ? "flex" : "none" }
function showScreen(id) {
"s-shop" === id || cancelOverWatch();
"s-terr" === id || markEggsReady();
("s-terr" !== id || !combatMode) && ov("ov-res", 0);
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
$("shop-money").textContent = "$" + money, $("terr-money").textContent = "$" + money, $("lab-money").textContent = "$" + money;
money >= 1000 && achieve("rich1k"), money >= 5000 && achieve("rich5k")
}
