const BLOOKS = CATALOG.blooks;
const PACKS = CATALOG.packs;
const RARITIES = CATALOG.rarities;
const blookByName = Object.fromEntries(BLOOKS.map(b => [b.name, b]));

const SELL_PRICES = {
  Common: 1, Uncommon: 5, Rare: 20, Epic: 75, Legendary: 200, Chroma: 1000, Mystical: 2500
};

let rarityFilter = "all";
let bazaarPackFilter = "all";
let autoRunning = false;
let autoPack = null;
let autoOpened = 0;
let autoTimer = null;
const AUTO_DELAY_MS = 900;
let actionBlook = null;

function tokenIcon(){return "<span class='token-icon' aria-hidden='true'></span>";}
function tokenAmt(n){return tokenIcon()+" "+Number(n).toLocaleString();}

function safeGet(k, f) { try { return localStorage.getItem(k) || f; } catch (e) { return f; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function safeRemove(k) { try { localStorage.removeItem(k); } catch (e) {} }
function getUsers() { try { return JSON.parse(safeGet("ml_users", "{}")); } catch (e) { return {}; } }
function currentUser() { return safeGet("ml_current", ""); }
function defaultData() {
  return { tokens: CATALOG.startTokens || 1500, exp: 0, packsOpened: 0, inventory: {}, lastClaim: "", equipped: null, customPfp: null };
}
function getData(u) {
  try { return Object.assign(defaultData(), JSON.parse(safeGet("ml_data_" + u, "{}"))); }
  catch (e) { return defaultData(); }
}
function saveData(u, d) { safeSet("ml_data_" + u, JSON.stringify(d)); }
function getListings() { try { return JSON.parse(safeGet("ml_bazaar", "[]")); } catch (e) { return []; } }
function saveListings(list) { safeSet("ml_bazaar", JSON.stringify(list)); }
function levelForExp(exp) { return Math.floor(Math.sqrt(exp / 100)) + 1; }
function sellPrice(blookName) {
  const b = blookByName[blookName];
  if (!b) return 1;
  return SELL_PRICES[b.rarity] || 5;
}

function openLogin() {
  closeModals();
  document.getElementById("loginModal").classList.add("open");
  document.getElementById("loginErr").textContent = "";
}
function openRegister() {
  closeModals();
  document.getElementById("regModal").classList.add("open");
  document.getElementById("regErr").textContent = "";
}
function closeModals() {
  document.querySelectorAll(".modal-bg").forEach(m => m.classList.remove("open"));
}
function closeOpen() {
  if (autoRunning) return;
  document.getElementById("openModal").classList.remove("open");
}
function closeBlookAction() {
  document.getElementById("blookActionModal").classList.remove("open");
  actionBlook = null;
}
function closeProfile() {
  document.getElementById("profileModal").classList.remove("open");
}

function doRegister() {
  const u = (document.getElementById("regUser").value || "").trim();
  const p = document.getElementById("regPass").value || "";
  const p2 = document.getElementById("regPass2").value || "";
  const err = document.getElementById("regErr");
  if (u.length < 3 || u.length > 20) { err.textContent = "Username must be 3–20 characters"; return; }
  if (p.length < 4) { err.textContent = "Password must be at least 4 characters"; return; }
  if (p !== p2) { err.textContent = "Passwords do not match"; return; }
  const users = getUsers();
  if (users[u.toLowerCase()]) { err.textContent = "Username taken"; return; }
  users[u.toLowerCase()] = { username: u, password: p };
  safeSet("ml_users", JSON.stringify(users));
  saveData(u, defaultData());
  err.textContent = "Account created! Signing in…";
  setTimeout(() => { closeModals(); safeSet("ml_current", u); afterLogin(u); }, 600);
}

function doLogin() {
  const u = (document.getElementById("loginUser").value || "").trim();
  const p = document.getElementById("loginPass").value || "";
  const err = document.getElementById("loginErr");
  const users = getUsers();
  const user = users[u.toLowerCase()];
  if (!user || user.password !== p) { err.textContent = "Invalid username or password"; return; }
  safeSet("ml_current", user.username);
  afterLogin(user.username);
}

function afterLogin(u) {
  closeModals();
  document.getElementById("landing").classList.remove("active");
  document.getElementById("app").classList.add("active");
  document.getElementById("userDisplay").textContent = u;
  updatePfp(u);
  showPage("stats");
  refreshUI();
}

function logout() {
  stopAuto();
  safeSet("ml_current", "");
  document.getElementById("app").classList.remove("active");
  document.getElementById("landing").classList.add("active");
}

function showPage(page) {
  if (autoRunning && page !== "market") stopAuto();
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  const panel = document.getElementById("page-" + page);
  if (panel) panel.classList.add("active");
  const nav = document.querySelector('.nav-item[data-page="' + page + '"]');
  if (nav) nav.classList.add("active");
  refreshUI();
}

function refreshUI() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  document.getElementById("tokenCount").textContent = d.tokens.toLocaleString();
  document.getElementById("statTokens").textContent = d.tokens.toLocaleString();
  document.getElementById("statLevel").textContent = levelForExp(d.exp);
  document.getElementById("statXP").textContent = d.exp.toLocaleString();
  document.getElementById("statPacks").textContent = d.packsOpened || 0;
  const inv = d.inventory || {};
  const types = Object.keys(inv).filter(k => inv[k] > 0).length;
  const total = Object.values(inv).reduce((a, b) => a + (b || 0), 0);
  document.getElementById("statBlooks").textContent = types;
  document.getElementById("statTotal").textContent = total;
  const day = new Date().toDateString();
  const claimBtn = document.getElementById("claimBtn");
  if (claimBtn) {
    if (d.lastClaim === day) {
      claimBtn.disabled = true;
      claimBtn.textContent = "Claimed today";
      claimBtn.style.opacity = "0.6";
    } else {
      claimBtn.disabled = false;
      claimBtn.innerHTML = "Claim " + (CATALOG.claimAmount || 4000) + " " + tokenIcon();
      claimBtn.style.opacity = "1";
    }
  }
  const settingsUser = document.getElementById("settingsCurrentUser");
  if (settingsUser) settingsUser.textContent = u;
  updatePfp(u);
  renderMarket();
  renderBlooks();
  renderBazaar();
  updateAutoBar();
}

function setMsg(id, text, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = text;
  el.className = "settings-msg " + (ok ? "ok" : "err");
}

function sendTokens() {
  const u = currentUser();
  if (!u) return;
  const toName = (document.getElementById("tradeUser").value || "").trim();
  const amount = Math.floor(Number(document.getElementById("tradeAmount").value) || 0);
  const pass = document.getElementById("tradePass").value || "";
  if (!toName) { setMsg("tradeMsg", "Enter a username", false); return; }
  if (toName.toLowerCase() === u.toLowerCase()) { setMsg("tradeMsg", "You can't send tokens to yourself", false); return; }
  if (amount < 1) { setMsg("tradeMsg", "Amount must be at least 1", false); return; }
  const users = getUsers();
  const me = users[u.toLowerCase()];
  if (!me || me.password !== pass) { setMsg("tradeMsg", "Wrong password", false); return; }
  const them = users[toName.toLowerCase()];
  if (!them) { setMsg("tradeMsg", "User not found", false); return; }
  const myData = getData(u);
  if (myData.tokens < amount) { setMsg("tradeMsg", "Not enough tokens (you have " + myData.tokens + ")", false); return; }
  const theirRealName = them.username;
  const theirData = getData(theirRealName);
  myData.tokens -= amount;
  theirData.tokens += amount;
  saveData(u, myData);
  saveData(theirRealName, theirData);
  document.getElementById("tradeUser").value = "";
  document.getElementById("tradeAmount").value = "";
  document.getElementById("tradePass").value = "";
  setMsg("tradeMsg", "Sent " + amount.toLocaleString() + " " + tokenIcon() + " to " + theirRealName + "!", true);
  refreshUI();
}
