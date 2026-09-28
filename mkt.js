let mktPool = [],
mktCart = [];
function openMkt() {
mktCart = [];
mktPool = Array.from({ length: 6 }, () => {
const st = {};
let sum;
do { sum = 0, SK.forEach(k => sum += st[k] = 1 + ri(3)) } while (sum < 7 || sum > 9);
const b = makeBug(st);
return b.cost = 60 + ri(66), b
}), renderMkt(), showScreen("s-mkt")
}
function mktApplyCard(div, btn, item, i) {
const inCart = mktCart.includes(i);
btn.className = "card-bt bt-sel", btn.textContent = inCart ? "✓ In cart — remove" : "Buy $" + item.cost, div.classList.toggle("card-sel", inCart)
}
function updateMktFooter() {
const n = mktCart.length;
$("mkt-cart-info").textContent = `${n} bug${1!==n?"s":""} selected`;
const doneBtn = $("bt-buy");
doneBtn.textContent = n > 0 ? "Buy →" : "BugBox →", doneBtn.disabled = !1
}
function renderMkt() {
const g = $("mkt-grid");
g.innerHTML = "", mktPool.forEach((item, i) => {
const div = makeBugCard({
name: item.name,
line3: `<span class="c-money">$${item.cost}</span>`,
statsObj: item,
abilB: item,
dead: !1,
showHp: !1,
imgId: "sh-ph-" + i,
img: item,
imgW: 52,
imgH: 52
});
const btn = document.createElement("button");
btn.style = "width:100%;margin-top:8px;", div.appendChild(btn), mktApplyCard(div, btn, item, i), div.onclick = e => {
e.stopPropagation(), toggleCart(i, div, btn)
}, g.appendChild(div)
}), updateMktFooter(), armOverWatch()
}
function toggleCart(i, div, btn) {
const item = mktPool[i];
if (mktCart.includes(i)) mktCart = mktCart.filter(x => x !== i), money += item.cost;
else {
if (money < item.cost) return flashBlocked(div), void toast("Not enough money!");
money -= item.cost, mktCart.push(i)
}
mktApplyCard(div, btn, item, i), updateMktFooter(), updateMoney()
}
const OVER_DELAY = 3000;
let overTimer = null;
function cheapestOnShelf() { return mktPool.reduce((m, it) => min(m, it.cost), 1 / 0) }
function runIsOver() { return !bugsOwned.length && !mktCart.length && money < cheapestOnShelf() }
function cancelOverWatch() { overTimer && (clearTimeout(overTimer), overTimer = null) }
function armOverWatch() {
cancelOverWatch();
if (!runIsOver()) return;
overTimer = setTimeout(() => {
overTimer = null;
if (!runIsOver()) return;
if (boxEggs.length) return void(openTerr());
ov("ov-over", 1)
}, OVER_DELAY)
}
function mktDone() {
if (!mktCart.length && !bugsOwned.length) return void toast("Buy at least 1 bug to start!");
mktCart.forEach(i => bugsOwned.push(mktPool[i]));
achStep("bought", [10, 25], "buy", mktCart.length), achOwn(mktCart.length), mktCart = [], updateMoney(), openTerr()
}
