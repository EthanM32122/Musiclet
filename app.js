const BLOOKS = CATALOG.blooks;
const PACKS = CATALOG.packs;
const RARITIES = CATALOG.rarities;
const blookByName = Object.fromEntries(BLOOKS.map(b => [b.name, b]));

const SELL_PRICES = {
  Common: 1,
  Uncommon: 5,
  Rare: 20,
  Epic: 75,
  Legendary: 200,
  Chroma: 1000,
  Mystical: 2500
};

let rarityFilter = "all";
let bazaarPackFilter = "all";
let autoRunning = false;
let autoPack = null;
let autoOpened = 0;
let autoTimer = null;
const AUTO_DELAY_MS = 900;
let actionBlook = null;

function safeGet(k, f) {
  try { return localStorage.getItem(k) || f; } catch (e) { return f; }
}
function safeSet(k, v) {
  try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
}
function safeRemove(k) {
  try { localStorage.removeItem(k); } catch (e) {}
}
function getUsers() {
  try { return JSON.parse(safeGet("ml_users", "{}")); } catch (e) { return {}; }
}
function currentUser() { return safeGet("ml_current", ""); }
function defaultData() {
  return { tokens: CATALOG.startTokens || 1500, exp: 0, packsOpened: 0, inventory: {}, lastClaim: "", equipped: null };
}
function getData(u) {
  try { return Object.assign(defaultData(), JSON.parse(safeGet("ml_data_" + u, "{}"))); }
  catch (e) { return defaultData(); }
}
function saveData(u, d) { safeSet("ml_data_" + u, JSON.stringify(d)); }
function getListings() {
  try { return JSON.parse(safeGet("ml_bazaar", "[]")); } catch (e) { return []; }
}
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
      claimBtn.textContent = "Claim " + (CATALOG.claimAmount || 4000) + " 🪙";
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
  el.textContent = text;
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
  setMsg("tradeMsg", "Sent " + amount.toLocaleString() + " 🪙 to " + theirRealName + "!", true);
  refreshUI();
}

function changeUsername() {
  const u = currentUser();
  if (!u) return;
  const newName = (document.getElementById("newUsername").value || "").trim();
  const pass = document.getElementById("usernamePass").value || "";
  if (newName.length < 3 || newName.length > 20) { setMsg("usernameMsg", "Username must be 3–20 characters", false); return; }
  if (newName.toLowerCase() === u.toLowerCase()) { setMsg("usernameMsg", "That's already your username", false); return; }
  const users = getUsers();
  const key = u.toLowerCase();
  const user = users[key];
  if (!user || user.password !== pass) { setMsg("usernameMsg", "Wrong password", false); return; }
  if (users[newName.toLowerCase()]) { setMsg("usernameMsg", "That username is taken", false); return; }
  const data = getData(u);
  delete users[key];
  users[newName.toLowerCase()] = { username: newName, password: pass };
  safeSet("ml_users", JSON.stringify(users));
  safeRemove("ml_data_" + u);
  saveData(newName, data);
  safeSet("ml_current", newName);
  const listings = getListings();
  listings.forEach(L => { if (L.seller.toLowerCase() === u.toLowerCase()) L.seller = newName; });
  saveListings(listings);
  document.getElementById("userDisplay").textContent = newName;
  updatePfp(newName);
  document.getElementById("newUsername").value = "";
  document.getElementById("usernamePass").value = "";
  setMsg("usernameMsg", "Username updated to " + newName + "!", true);
  refreshUI();
}

function changePassword() {
  const u = currentUser();
  if (!u) return;
  const oldP = document.getElementById("oldPassword").value || "";
  const newP = document.getElementById("newPassword").value || "";
  const newP2 = document.getElementById("newPassword2").value || "";
  if (newP.length < 4) { setMsg("passwordMsg", "New password must be at least 4 characters", false); return; }
  if (newP !== newP2) { setMsg("passwordMsg", "New passwords do not match", false); return; }
  const users = getUsers();
  const key = u.toLowerCase();
  const user = users[key];
  if (!user || user.password !== oldP) { setMsg("passwordMsg", "Current password is wrong", false); return; }
  users[key].password = newP;
  safeSet("ml_users", JSON.stringify(users));
  document.getElementById("oldPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("newPassword2").value = "";
  setMsg("passwordMsg", "Password updated!", true);
}

function deleteAccount() {
  const u = currentUser();
  if (!u) return;
  const confirmName = (document.getElementById("deleteConfirm").value || "").trim();
  const pass = document.getElementById("deletePass").value || "";
  if (confirmName !== u) { setMsg("deleteMsg", "Username does not match", false); return; }
  const users = getUsers();
  const key = u.toLowerCase();
  const user = users[key];
  if (!user || user.password !== pass) { setMsg("deleteMsg", "Wrong password", false); return; }
  if (!confirm("Really delete your account forever? All tokens and Blooks will be lost.")) return;
  saveListings(getListings().filter(L => L.seller.toLowerCase() !== u.toLowerCase()));
  delete users[key];
  safeSet("ml_users", JSON.stringify(users));
  safeRemove("ml_data_" + u);
  stopAuto();
  safeSet("ml_current", "");
  document.getElementById("app").classList.remove("active");
  document.getElementById("landing").classList.add("active");
  alert("Account deleted.");
}

function renderMarket() {
  const grid = document.getElementById("packGrid");
  if (!grid) return;
  grid.innerHTML = "";
  PACKS.forEach(p => {
    const card = document.createElement("div");
    card.className = "pack-card" + (autoRunning && autoPack === p.name ? " auto-active" : "");
    card.innerHTML =
      '<img src="' + p.img + '" alt="' + p.name + '" onerror="this.style.background=\'' + p.color1 + '\'">' +
      "<h3>" + p.name + "</h3>" +
      '<div class="pack-price">' + p.price + " 🪙</div>" +
      '<div class="pack-actions">' +
        '<button class="btn-pack btn-open-1">Open</button>' +
        '<button class="btn-pack btn-auto">⚡ Auto</button></div>';
    card.querySelector(".btn-open-1").onclick = (e) => { e.stopPropagation(); if (autoRunning) return; openPack(p.name, false); };
    card.querySelector(".btn-auto").onclick = (e) => {
      e.stopPropagation();
      if (autoRunning && autoPack === p.name) stopAuto(); else startAuto(p.name);
    };
    grid.appendChild(card);
  });
}

function rollPack(packName) {
  const entries = BLOOKS.filter(b => b.pack === packName);
  if (!entries.length) return null;
  const weights = entries.map(b => b.chance || 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < entries.length; i++) {
    r -= weights[i];
    if (r <= 0) return entries[i];
  }
  return entries[entries.length - 1];
}

function openPack(name, isAuto) {
  const u = currentUser();
  if (!u) return false;
  const d = getData(u);
  const pack = PACKS.find(p => p.name === name);
  if (!pack) return false;
  if (d.tokens < pack.price) {
    if (!isAuto) alert("Not enough tokens! Need " + pack.price + " 🪙");
    return false;
  }
  d.tokens -= pack.price;
  d.packsOpened = (d.packsOpened || 0) + 1;
  const blook = rollPack(name);
  if (!blook) return false;
  d.inventory[blook.name] = (d.inventory[blook.name] || 0) + 1;
  const rar = RARITIES[blook.rarity] || {};
  d.exp += rar.exp || 5;
  saveData(u, d);
  document.getElementById("tokenCount").textContent = d.tokens.toLocaleString();
  document.getElementById("openImg").src = blook.img;
  document.getElementById("openName").textContent = blook.name;
  const col = rar.color || "#fff";
  document.getElementById("openRarity").innerHTML = '<span style="color:' + col + '">' + blook.rarity + " · " + (blook.chance || "?") + "%</span>";
  const title = document.getElementById("openTitle");
  const countEl = document.getElementById("openAutoCount");
  const okBtn = document.getElementById("openOkBtn");
  if (isAuto) {
    autoOpened++;
    title.textContent = "Auto Open";
    countEl.style.display = "block";
    countEl.textContent = "Opened " + autoOpened + " · " + d.tokens.toLocaleString() + " 🪙 left";
    okBtn.style.display = "none";
  } else {
    title.textContent = "You got…";
    countEl.style.display = "none";
    okBtn.style.display = "block";
  }
  document.getElementById("openModal").classList.add("open");
  if (!isAuto) refreshUI();
  return true;
}

function startAuto(packName) {
  if (autoRunning) stopAuto();
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const pack = PACKS.find(p => p.name === packName);
  if (!pack) return;
  if (d.tokens < pack.price) { alert("Not enough tokens! Need " + pack.price + " 🪙"); return; }
  autoRunning = true;
  autoPack = packName;
  autoOpened = 0;
  updateAutoBar();
  renderMarket();
  function tick() {
    if (!autoRunning) return;
    const ok = openPack(autoPack, true);
    if (!ok) { stopAuto(); return; }
    updateAutoBar();
    autoTimer = setTimeout(tick, AUTO_DELAY_MS);
  }
  tick();
}

function stopAuto() {
  autoRunning = false;
  autoPack = null;
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  const okBtn = document.getElementById("openOkBtn");
  if (okBtn) okBtn.style.display = "block";
  const title = document.getElementById("openTitle");
  if (title && autoOpened > 0) title.textContent = "Auto done — " + autoOpened + " packs";
  updateAutoBar();
  refreshUI();
}

function updateAutoBar() {
  const status = document.getElementById("autoStatus");
  const stopBtn = document.getElementById("autoStopBtn");
  if (!status || !stopBtn) return;
  if (autoRunning) {
    status.textContent = "Opening " + autoPack + "… (" + autoOpened + " opened)";
    stopBtn.style.display = "inline-block";
  } else {
    status.textContent = "Click Auto on a pack to open continuously";
    stopBtn.style.display = "none";
  }
}

function openBlookAction(name) {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  if ((d.inventory[name] || 0) < 1) return;
  const b = blookByName[name];
  if (!b) return;
  actionBlook = name;
  document.getElementById("baTitle").textContent = "Manage Blook";
  document.getElementById("baImg").src = b.img;
  document.getElementById("baName").textContent = b.name;
  document.getElementById("baInfo").textContent = b.rarity + " · " + b.pack + " · You own ×" + d.inventory[name];
  document.getElementById("baSellBtn").textContent = "Sell for " + sellPrice(name) + " 🪙";
  document.getElementById("baListPrice").value = "";
  document.getElementById("baListMsg").textContent = "";
  document.getElementById("blookActionModal").classList.add("open");
}

function confirmInstantSell() {
  if (!actionBlook) return;
  const name = actionBlook;
  const u = currentUser();
  const d = getData(u);
  if ((d.inventory[name] || 0) < 1) { closeBlookAction(); return; }
  const price = sellPrice(name);
  d.inventory[name] -= 1;
  if (d.inventory[name] <= 0) delete d.inventory[name];
  if (d.equipped === name && (d.inventory[name] || 0) < 1) d.equipped = null;
  d.tokens += price;
  saveData(u, d);
  closeBlookAction();
  refreshUI();
}

function confirmListBazaar() {
  if (!actionBlook) return;
  const name = actionBlook;
  const u = currentUser();
  const d = getData(u);
  if ((d.inventory[name] || 0) < 1) { setMsg("baListMsg", "You don't own this blook", false); return; }
  const price = Math.floor(Number(document.getElementById("baListPrice").value) || 0);
  if (price < 1) { setMsg("baListMsg", "Price must be at least 1", false); return; }
  d.inventory[name] -= 1;
  if (d.inventory[name] <= 0) delete d.inventory[name];
  if (d.equipped === name && (d.inventory[name] || 0) < 1) d.equipped = null;
  saveData(u, d);
  const b = blookByName[name];
  const listings = getListings();
  listings.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    seller: u, blook: name, pack: b ? b.pack : "", rarity: b ? b.rarity : "",
    img: b ? b.img : "", price: price, at: Date.now()
  });
  saveListings(listings);
  closeBlookAction();
  refreshUI();
  alert("Listed " + name + " on the Bazaar for " + price + " 🪙");
}

function renderBazaar() {
  const root = document.getElementById("bazaarList");
  if (!root) return;
  const bar = document.getElementById("bazaarPackBar");
  if (bar && !bar.dataset.ready) {
    bar.innerHTML = "";
    ["all", ...PACKS.map(p => p.name)].forEach(p => {
      const btn = document.createElement("button");
      btn.textContent = p === "all" ? "All Packs" : p;
      if (bazaarPackFilter === p) btn.classList.add("active");
      btn.onclick = () => { bazaarPackFilter = p; bar.dataset.ready = ""; renderBazaar(); };
      bar.appendChild(btn);
    });
    bar.dataset.ready = "1";
  } else if (bar) {
    bar.querySelectorAll("button").forEach(btn => {
      const label = btn.textContent === "All Packs" ? "all" : btn.textContent;
      btn.classList.toggle("active", label === bazaarPackFilter);
    });
  }
  const search = ((document.getElementById("bazaarSearch") || {}).value || "").trim().toLowerCase();
  const u = currentUser();
  let listings = getListings();
  if (bazaarPackFilter !== "all") listings = listings.filter(L => L.pack === bazaarPackFilter);
  if (search) {
    listings = listings.filter(L =>
      L.blook.toLowerCase().includes(search) ||
      (L.seller || "").toLowerCase().includes(search) ||
      (L.rarity || "").toLowerCase().includes(search)
    );
  }
  listings.sort((a, b) => a.price - b.price || b.at - a.at);
  root.innerHTML = "";
  if (!listings.length) {
    root.innerHTML = '<p class="muted" style="padding:20px 0">No listings yet. List a Blook from My Blooks!</p>';
    return;
  }
  const byPack = {};
  listings.forEach(L => {
    const pk = L.pack || "Other";
    if (!byPack[pk]) byPack[pk] = [];
    byPack[pk].push(L);
  });
  Object.keys(byPack).forEach(packName => {
    const sec = document.createElement("div");
    sec.className = "pack-section";
    sec.innerHTML = "<h3>" + packName + "</h3>";
    const grid = document.createElement("div");
    grid.className = "bazaar-grid";
    byPack[packName].forEach(L => {
      const card = document.createElement("div");
      card.className = "bazaar-card";
      const isMine = u && L.seller.toLowerCase() === u.toLowerCase();
      card.innerHTML =
        '<img src="' + (L.img || "") + '" alt="" onerror="this.style.opacity=0.3">' +
        '<div class="bz-name">' + L.blook + "</div>" +
        '<div class="bz-rarity">' + (L.rarity || "") + "</div>" +
        '<div class="bz-price">' + L.price.toLocaleString() + " 🪙</div>" +
        '<div class="bz-seller muted">by <a href="#" class="profile-link">' + L.seller + "</a></div>" +
        (isMine
          ? '<button class="btn-pack btn-stop">Cancel</button>'
          : '<button class="btn-pack btn-open-1">Buy</button>');
      const btn = card.querySelector("button");
      if (isMine) btn.onclick = () => cancelListing(L.id);
      else btn.onclick = () => buyListing(L.id);
      const plink = card.querySelector(".profile-link");
      if (plink) plink.onclick = (e) => { e.preventDefault(); e.stopPropagation(); openProfile(L.seller); };
      grid.appendChild(card);
    });
    sec.appendChild(grid);
    root.appendChild(sec);
  });
}

function buyListing(id) {
  const u = currentUser();
  if (!u) return;
  const listings = getListings();
  const idx = listings.findIndex(L => L.id === id);
  if (idx < 0) { alert("Listing gone"); renderBazaar(); return; }
  const L = listings[idx];
  if (L.seller.toLowerCase() === u.toLowerCase()) { alert("That's your listing"); return; }
  const buyer = getData(u);
  if (buyer.tokens < L.price) { alert("Not enough tokens! Need " + L.price + " 🪙"); return; }
  if (!confirm("Buy " + L.blook + " from " + L.seller + " for " + L.price + " 🪙?")) return;
  buyer.tokens -= L.price;
  buyer.inventory[L.blook] = (buyer.inventory[L.blook] || 0) + 1;
  saveData(u, buyer);
  const sellerData = getData(L.seller);
  sellerData.tokens += L.price;
  saveData(L.seller, sellerData);
  listings.splice(idx, 1);
  saveListings(listings);
  refreshUI();
  alert("Bought " + L.blook + "!");
}

function cancelListing(id) {
  const u = currentUser();
  if (!u) return;
  const listings = getListings();
  const idx = listings.findIndex(L => L.id === id);
  if (idx < 0) return;
  const L = listings[idx];
  if (L.seller.toLowerCase() !== u.toLowerCase()) return;
  if (!confirm("Cancel listing and return " + L.blook + " to your inventory?")) return;
  const d = getData(u);
  d.inventory[L.blook] = (d.inventory[L.blook] || 0) + 1;
  saveData(u, d);
  listings.splice(idx, 1);
  saveListings(listings);
  refreshUI();
}

function renderBlooks() {
  const bar = document.getElementById("rarityBar");
  if (bar && !bar.dataset.ready) {
    bar.innerHTML = "";
    ["all", ...Object.keys(RARITIES)].forEach(r => {
      const b = document.createElement("button");
      b.textContent = r === "all" ? "All" : r;
      if (rarityFilter === r) b.classList.add("active");
      b.onclick = () => { rarityFilter = r; bar.dataset.ready = ""; renderBlooks(); };
      bar.appendChild(b);
    });
    bar.dataset.ready = "1";
  }
  const root = document.getElementById("blooksByPack");
  if (!root) return;
  root.innerHTML = "";
  const d = getData(currentUser());
  PACKS.forEach(pack => {
    let blooks = BLOOKS.filter(b => b.pack === pack.name);
    if (rarityFilter !== "all") blooks = blooks.filter(b => b.rarity === rarityFilter);
    if (!blooks.length) return;
    const sec = document.createElement("div");
    sec.className = "pack-section";
    sec.innerHTML = "<h3>" + pack.name + " Pack</h3>";
    const grid = document.createElement("div");
    grid.className = "blook-grid";
    blooks.forEach(b => {
      const qty = d.inventory[b.name] || 0;
      const price = sellPrice(b.name);
      const slot = document.createElement("div");
      slot.className = "blook-slot " + (qty > 0 ? "owned sellable" : "locked");
      slot.title = qty > 0 ? b.name + " ×" + qty + " — click to sell or list" : b.name + " (locked)";
      if (qty > 0) {
        slot.innerHTML =
          '<img src="' + b.img + '" alt="' + b.name + '" loading="lazy" onerror="this.remove()">' +
          '<span class="qty">' + qty + "</span>" +
          '<span class="sell-tag">' + price + "+</span>";
        slot.onclick = () => openBlookAction(b.name);
      }
      grid.appendChild(slot);
    });
    sec.appendChild(grid);
    root.appendChild(sec);
  });
}

function updatePfp(username) {
  const u = username || currentUser();
  if (!u) return;
  const d = getData(u);
  const letter = (u.charAt(0) || "?").toUpperCase();
  const eq = d.equipped;
  const b = eq ? blookByName[eq] : null;
  const pfpImg = document.getElementById("pfpImg");
  const pfpLetter = document.getElementById("pfpLetter");
  if (pfpImg && pfpLetter) {
    if (b) {
      pfpImg.src = b.img;
      pfpImg.style.display = "block";
      pfpLetter.style.display = "none";
    } else {
      pfpImg.style.display = "none";
      pfpLetter.style.display = "block";
      pfpLetter.textContent = letter;
    }
  }
}

function setProfileAvatar(username, d, isMe) {
  const letter = (username.charAt(0) || "?").toUpperCase();
  const eq = d.equipped;
  const b = eq ? blookByName[eq] : null;
  const img = document.getElementById("profileAvatarImg");
  const letEl = document.getElementById("profileAvatarLetter");
  const btn = document.getElementById("profileAvatarBtn");
  if (img && letEl) {
    if (b) {
      img.src = b.img;
      img.style.display = "block";
      letEl.style.display = "none";
    } else {
      img.style.display = "none";
      letEl.style.display = "block";
      letEl.textContent = letter;
    }
  }
  if (btn) {
    btn.onclick = isMe ? () => openEquipModal() : null;
    btn.style.cursor = isMe ? "pointer" : "default";
    btn.title = isMe ? "Change avatar" : "";
  }
}

function openProfile(username) {
  const me = currentUser();
  const name = (username || me || "").trim();
  if (!name) return;
  const users = getUsers();
  const user = users[name.toLowerCase()];
  if (!user) { alert("User not found"); return; }
  const realName = user.username;
  const d = getData(realName);
  const isMe = me && me.toLowerCase() === realName.toLowerCase();
  const inv = d.inventory || {};
  const types = Object.keys(inv).filter(k => inv[k] > 0);
  const total = Object.values(inv).reduce((a, b) => a + (b || 0), 0);
  const lvl = levelForExp(d.exp);

  document.getElementById("profileName").textContent = realName;
  document.getElementById("profileSubtitle").textContent =
    "Level " + lvl + (isMe ? " · You" : "");
  setProfileAvatar(realName, d, isMe);

  const stats = [];
  if (isMe) stats.push(["Tokens", d.tokens.toLocaleString() + " 🪙"]);
  stats.push(
    ["Level", lvl],
    ["XP", d.exp.toLocaleString()],
    ["Packs Opened", d.packsOpened || 0],
    ["Blook Types", types.length],
    ["Total Blooks", total]
  );
  document.getElementById("profileStats").innerHTML = stats.map(s =>
    '<div class="profile-stat"><span class="ps-label">' + s[0] + '</span><span class="ps-value">' + s[1] + "</span></div>"
  ).join("");

  const blooksEl = document.getElementById("profileBlooks");
  if (!types.length) {
    blooksEl.innerHTML = '<p class="muted">No Blooks yet</p>';
  } else {
    const order = Object.keys(RARITIES);
    types.sort((a, b) => {
      const ba = blookByName[a], bb = blookByName[b];
      const ra = ba ? order.indexOf(ba.rarity) : 0;
      const rb = bb ? order.indexOf(bb.rarity) : 0;
      return rb - ra || a.localeCompare(b);
    });
    blooksEl.innerHTML = types.map(n => {
      const b = blookByName[n];
      const qty = inv[n];
      const equipped = d.equipped === n;
      return '<div class="profile-blook' + (equipped ? " equipped" : "") + '" title="' + n + " ×" + qty + (equipped ? " (equipped)" : "") + '">' +
        '<img src="' + (b ? b.img : "") + '" alt="" onerror="this.style.display=\'none\'">' +
        (qty > 1 ? '<span class="qty">' + qty + "</span>" : "") +
        (equipped ? '<span class="eq-tag">✓</span>' : "") +
        "</div>";
    }).join("");
  }

  const listEl = document.getElementById("profileListings");
  const mine = getListings().filter(L => L.seller.toLowerCase() === realName.toLowerCase());
  if (!mine.length) {
    listEl.innerHTML = '<p class="muted">No active listings</p>';
  } else {
    listEl.innerHTML = mine.map(L =>
      '<div class="profile-listing"><img src="' + (L.img || "") + '" alt="">' +
      "<div><strong>" + L.blook + '</strong><br><span class="muted">' + L.price.toLocaleString() + " 🪙</span></div></div>"
    ).join("");
  }
  document.getElementById("profileModal").classList.add("open");
}

function openEquipModal() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const inv = d.inventory || {};
  const types = Object.keys(inv).filter(k => inv[k] > 0);
  const grid = document.getElementById("equipGrid");
  if (!types.length) {
    grid.innerHTML = '<p class="muted" style="grid-column:1/-1;text-align:center">You have no Blooks yet. Open packs first!</p>';
  } else {
    const order = Object.keys(RARITIES);
    types.sort((a, b) => {
      const ba = blookByName[a], bb = blookByName[b];
      const ra = ba ? order.indexOf(ba.rarity) : 0;
      const rb = bb ? order.indexOf(bb.rarity) : 0;
      return rb - ra || a.localeCompare(b);
    });
    grid.innerHTML = types.map(n => {
      const b = blookByName[n];
      const on = d.equipped === n;
      return '<button type="button" class="equip-slot' + (on ? " selected" : "") + '" data-name="' + n.replace(/"/g, "") + '" title="' + n + '">' +
        '<img src="' + (b ? b.img : "") + '" alt="">' +
        '<span class="equip-name">' + n + "</span>" +
        (on ? '<span class="eq-tag">Equipped</span>' : "") +
        "</button>";
    }).join("");
    grid.querySelectorAll(".equip-slot").forEach(btn => {
      btn.onclick = () => equipBlook(btn.getAttribute("data-name"));
    });
  }
  document.getElementById("equipModal").classList.add("open");
}

function closeEquipModal() {
  document.getElementById("equipModal").classList.remove("open");
}

function equipBlook(name) {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  if ((d.inventory[name] || 0) < 1) return;
  d.equipped = name;
  saveData(u, d);
  updatePfp(u);
  closeEquipModal();
  const pm = document.getElementById("profileModal");
  if (pm && pm.classList.contains("open")) openProfile(u);
}

function unequipBlook() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  d.equipped = null;
  saveData(u, d);
  updatePfp(u);
  closeEquipModal();
  const pm = document.getElementById("profileModal");
  if (pm && pm.classList.contains("open")) openProfile(u);
}

function claimDaily() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const day = new Date().toDateString();
  if (d.lastClaim === day) { alert("Already claimed today!"); return; }
  const amount = CATALOG.claimAmount || 4000;
  d.tokens += amount;
  d.lastClaim = day;
  saveData(u, d);
  refreshUI();
  alert("Claimed " + amount + " tokens!");
}

document.addEventListener("DOMContentLoaded", () => {
  const u = currentUser();
  if (u) afterLogin(u);
  else document.getElementById("landing").classList.add("active");
  document.querySelectorAll(".modal-bg").forEach(bg => {
    bg.addEventListener("click", e => {
      if (e.target === bg) {
        if (bg.id === "openModal" && autoRunning) return;
        closeModals();
      }
    });
  });
});
