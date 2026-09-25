/* Musiclet app part 2 — bazaar, blooks, settings, profile helpers */

function getListings() {
  try { return JSON.parse(localStorage.getItem("ml_bazaar") || "[]"); } catch (e) { return []; }
}
function saveListings(list) {
  localStorage.setItem("ml_bazaar", JSON.stringify(list));
}

var bazaarPackFilter = "all";
var rarityFilter = "all";

function cancelListing(id) {
  var list = getListings().filter(function (L) { return L.id !== id; });
  saveListings(list);
  renderBazaar();
  refreshUI();
}

function buyListing(id) {
  var u = currentUser();
  if (!u) return;
  var list = getListings();
  var idx = list.findIndex(function (L) { return L.id === id; });
  if (idx < 0) { alert("Listing gone"); renderBazaar(); return; }
  var L = list[idx];
  if ((L.seller || "").toLowerCase() === u.toLowerCase()) { alert("That's your listing"); return; }
  var buyer = getData(u);
  var price = Number(L.price) || 0;
  var qty = Number(L.qty) || 1;
  if ((buyer.tokens || 0) < price * qty) { alert("Not enough tokens"); return; }
  buyer.tokens -= price * qty;
  if (!buyer.inventory) buyer.inventory = {};
  buyer.inventory[L.blook] = (buyer.inventory[L.blook] || 0) + qty;
  setData(u, buyer);
  var sellerName = L.seller;
  var seller = getData(sellerName);
  seller.tokens = (seller.tokens || 0) + price * qty;
  setData(sellerName, seller);
  list.splice(idx, 1);
  saveListings(list);
  renderBazaar();
  refreshUI();
  alert("Bought ×" + qty + " " + L.blook + "!");
}

function confirmListBazaar() {
  var u = currentUser();
  if (!u || !window._baBlook) return;
  var name = window._baBlook;
  var qty = parseInt((document.getElementById("baListQty") || {}).value, 10) || 1;
  var price = parseInt((document.getElementById("baListPrice") || {}).value, 10);
  var msg = document.getElementById("baListMsg");
  var d = getData(u);
  var owned = (d.inventory && d.inventory[name]) || 0;
  if (qty < 1 || qty > owned) { if (msg) msg.textContent = "Invalid amount"; return; }
  if (!price || price < 1) { if (msg) msg.textContent = "Enter a price"; return; }
  d.inventory[name] = owned - qty;
  if (d.inventory[name] <= 0) delete d.inventory[name];
  setData(u, d);
  var b = BLOOKS.find(function (x) { return x.name === name; });
  var list = getListings();
  list.push({
    id: "L" + Date.now() + Math.random().toString(36).slice(2, 7),
    seller: u, blook: name, pack: b ? b.pack : "", rarity: b ? b.rarity : "",
    img: b ? b.img : "", price: price, qty: qty, at: Date.now()
  });
  saveListings(list);
  closeBlookAction();
  refreshUI();
  showPage("bazaar");
}

function renderBazaar() {
  const box = document.getElementById("bazaarList");
  if (!box) return;
  const q = ((document.getElementById("bazaarSearch") || {}).value || "").toLowerCase().trim();
  let list = getListings();
  if (bazaarPackFilter && bazaarPackFilter !== "all") {
    list = list.filter(L => (L.pack || "") === bazaarPackFilter);
  }
  if (q) {
    list = list.filter(L =>
      (L.blook || "").toLowerCase().includes(q) ||
      (L.seller || "").toLowerCase().includes(q) ||
      (L.pack || "").toLowerCase().includes(q)
    );
  }
  const bar = document.getElementById("bazaarPackBar");
  if (bar && !bar.dataset.ready) {
    const packs = ["all"].concat(PACKS.map(p => p.name));
    bar.innerHTML = packs.map(p => {
      const meta = p === "all" ? null : PACKS.find(x => x.name === p);
      const img = meta && meta.img
        ? '<img class="pack-filter-img" src="' + meta.img + '" alt="" onerror="this.style.display=\'none\'">'
        : "";
      const label = p === "all" ? "All" : p;
      return '<button type="button" data-pack="' + p + '" class="pack-filter-btn' +
        (bazaarPackFilter === p || (p === "all" && bazaarPackFilter === "all") ? " active" : "") + '">' +
        img + '<span>' + label + '</span></button>';
    }).join("");
    bar.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        bazaarPackFilter = btn.getAttribute("data-pack");
        bar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderBazaar();
      };
    });
    bar.dataset.ready = "1";
  }
  if (!list.length) {
    box.innerHTML = '<p class="muted" style="text-align:center;padding:24px">No listings yet. List a blook from My Blooks.</p>';
    return;
  }
  const me = currentUser() || "";
  box.innerHTML = list.map(L => {
    const mine = (L.seller || "").toLowerCase() === me.toLowerCase();
    const packInfo = (typeof PACKS !== "undefined" && L.pack) ? PACKS.find(p => p.name === L.pack) : null;
    const packImgTag = packInfo && packInfo.img
      ? '<img class="bz-pack-img" src="' + packInfo.img + '" alt="" onerror="this.style.display=\'none\'">'
      : "";
    return '<div class="bazaar-card">' +
      '<img src="' + (L.img || "") + '" alt="">' +
      '<div class="bz-name">' + L.blook + "</div>" +
      '<div class="bz-pack muted">' + packImgTag + '<span>' + (L.pack || "") + "</span></div>" +
      '<div class="bz-rarity">' + (L.rarity || "") + "</div>" +
      '<div class="bz-price">' + L.price + ' each · ×' + (L.qty || 1) + "</div>" +
      '<div class="bz-seller muted">@' + L.seller + "</div>" +
      (mine
        ? '<button class="btn-pack btn-stop" onclick="cancelListing(\'' + L.id + '\')">Cancel</button>'
        : '<button class="btn-pack btn-open-1" onclick="buyListing(\'' + L.id + '\')">Buy</button>') +
      "</div>";
  }).join("");
}

function renderBlooks() {
  const root = document.getElementById("blooksByPack");
  const bar = document.getElementById("rarityBar");
  if (!root) return;
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const inv = d.inventory || {};
  if (bar && !bar.dataset.ready) {
    const rarities = ["all"].concat(Object.keys(RARITIES));
    bar.innerHTML = rarities.map(r =>
      '<button type="button" data-r="' + r + '" class="' + (rarityFilter === r ? "active" : "") + '">' +
      (r === "all" ? "All" : r) + "</button>"
    ).join("");
    bar.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        rarityFilter = btn.getAttribute("data-r");
        bar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderBlooks();
      };
    });
    bar.dataset.ready = "1";
  }
  const byPack = {};
  BLOOKS.forEach(b => {
    if (rarityFilter !== "all" && b.rarity !== rarityFilter) return;
    if (!byPack[b.pack]) byPack[b.pack] = [];
    byPack[b.pack].push(b);
  });
  root.innerHTML = Object.keys(byPack).map(pack => {
    const cells = byPack[pack].map(b => {
      const qty = inv[b.name] || 0;
      const locked = qty < 1;
      return '<div class="blook-slot' + (locked ? " locked" : " sellable") + '" data-name="' + b.name.replace(/"/g, "") + '" title="' + b.name + '">' +
        '<img src="' + b.img + '" alt="">' +
        (qty > 0 ? '<span class="qty">×' + qty + "</span>" : "") +
        '<span class="blook-name">' + b.name + "</span></div>";
    }).join("");
    const packMeta = (typeof PACKS !== "undefined" ? PACKS.find(p => p.name === pack) : null) || {};
    const packImgSrc = packMeta.img || "";
    const packImgHtml = packImgSrc
      ? '<img class="pack-section-img" src="' + packImgSrc + '" alt="' + pack + '" onerror="this.style.display=\'none\'">'
      : "";
    return '<div class="pack-section">' +
      '<div class="pack-section-head">' + packImgHtml + '<h3>' + pack + '</h3></div>' +
      '<div class="blook-grid">' + cells + '</div></div>';
  }).join("");
  root.querySelectorAll(".blook-slot.sellable").forEach(el => {
    el.onclick = () => openBlookAction(el.getAttribute("data-name"));
  });
}

function sendTokens() {
  var u = currentUser();
  if (!u) return;
  var target = ((document.getElementById("tradeUser") || {}).value || "").trim();
  var amt = parseInt((document.getElementById("tradeAmount") || {}).value, 10);
  var pass = ((document.getElementById("tradePass") || {}).value || "");
  var msg = document.getElementById("tradeMsg");
  var users = loadUsers();
  var me = users[u.toLowerCase()];
  if (!me || me.password !== pass) { if (msg) msg.textContent = "Wrong password"; return; }
  var key = target.toLowerCase();
  if (!users[key]) { if (msg) msg.textContent = "User not found"; return; }
  if (key === u.toLowerCase()) { if (msg) msg.textContent = "Can't send to yourself"; return; }
  if (!amt || amt < 1) { if (msg) msg.textContent = "Enter amount"; return; }
  var d = getData(u);
  if ((d.tokens || 0) < amt) { if (msg) msg.textContent = "Not enough tokens"; return; }
  d.tokens -= amt;
  setData(u, d);
  var otherName = users[key].username;
  var od = getData(otherName);
  od.tokens = (od.tokens || 0) + amt;
  setData(otherName, od);
  if (msg) msg.textContent = "Sent " + amt + " tokens to " + otherName;
  refreshUI();
}

function changeUsername() {
  var u = currentUser();
  if (!u) return;
  var neu = ((document.getElementById("newUsername") || {}).value || "").trim();
  var pass = ((document.getElementById("usernamePass") || {}).value || "");
  var msg = document.getElementById("usernameMsg");
  var users = loadUsers();
  var me = users[u.toLowerCase()];
  if (!me || me.password !== pass) { if (msg) msg.textContent = "Wrong password"; return; }
  if (neu.length < 3) { if (msg) msg.textContent = "Username too short"; return; }
  if (users[neu.toLowerCase()] && neu.toLowerCase() !== u.toLowerCase()) {
    if (msg) msg.textContent = "Username taken"; return;
  }
  var data = getData(u);
  delete users[u.toLowerCase()];
  users[neu.toLowerCase()] = { username: neu, password: me.password };
  saveUsers(users);
  setData(neu, data);
  try { localStorage.removeItem("ml_data_" + u); } catch (e) {}
  localStorage.setItem("ml_session", neu);
  if (msg) msg.textContent = "Username updated";
  refreshUI();
}

function changePassword() {
  var u = currentUser();
  if (!u) return;
  var oldP = ((document.getElementById("oldPassword") || {}).value || "");
  var n1 = ((document.getElementById("newPassword") || {}).value || "");
  var n2 = ((document.getElementById("newPassword2") || {}).value || "");
  var msg = document.getElementById("passwordMsg");
  var users = loadUsers();
  var me = users[u.toLowerCase()];
  if (!me || me.password !== oldP) { if (msg) msg.textContent = "Wrong current password"; return; }
  if (n1.length < 3) { if (msg) msg.textContent = "New password too short"; return; }
  if (n1 !== n2) { if (msg) msg.textContent = "Passwords don't match"; return; }
  me.password = n1;
  saveUsers(users);
  if (msg) msg.textContent = "Password updated";
}

function deleteAccount() {
  var u = currentUser();
  if (!u) return;
  var conf = ((document.getElementById("deleteConfirm") || {}).value || "").trim();
  var pass = ((document.getElementById("deletePass") || {}).value || "");
  var msg = document.getElementById("deleteMsg");
  var users = loadUsers();
  var me = users[u.toLowerCase()];
  if (conf !== u) { if (msg) msg.textContent = "Type your username to confirm"; return; }
  if (!me || me.password !== pass) { if (msg) msg.textContent = "Wrong password"; return; }
  delete users[u.toLowerCase()];
  saveUsers(users);
  try { localStorage.removeItem("ml_data_" + u); } catch (e) {}
  localStorage.removeItem("ml_session");
  location.reload();
}

function openProfile() {
  var u = currentUser();
  if (!u) return;
  var d = getData(u);
  document.getElementById("profileName").textContent = u;
  document.getElementById("profileSubtitle").textContent = "Level " + levelFromExp(d.exp || 0);
  var stats = document.getElementById("profileStats");
  var rows = [
    ["Tokens", String(d.tokens || 0)],
    ["Packs", String(d.packsOpened || 0)],
    ["Blooks", String(Object.keys(d.inventory || {}).length)],
    ["XP", String(d.exp || 0)]
  ];
  stats.innerHTML = rows.map(function (r) {
    return '<div class="ps-item"><span class="ps-label">' + r[0] + '</span><span class="ps-val">' + r[1] + "</span></div>";
  }).join("");
  var inv = d.inventory || {};
  var pb = document.getElementById("profileBlooks");
  var names = Object.keys(inv);
  pb.innerHTML = names.length
    ? names.map(function (n) {
        var b = BLOOKS.find(function (x) { return x.name === n; });
        return '<div class="blook-slot"><img src="' + (b ? b.img : "") + '" alt=""><span class="qty">×' + inv[n] + "</span></div>";
      }).join("")
    : '<p class="muted">No blooks yet</p>';
  var listings = getListings().filter(function (L) { return (L.seller || "").toLowerCase() === u.toLowerCase(); });
  var pl = document.getElementById("profileListings");
  pl.innerHTML = listings.length
    ? listings.map(function (L) {
        return '<div class="muted">' + L.blook + " ×" + (L.qty || 1) + " @ " + L.price + "</div>";
      }).join("")
    : '<p class="muted">No listings</p>';
  if (typeof renderProfileBadges === "function") renderProfileBadges(d);
  if (typeof applyPfpToProfile === "function") applyPfpToProfile(d, u);
  document.getElementById("profileModal").classList.add("open");
}

function closeProfile() {
  document.getElementById("profileModal").classList.remove("open");
}

function levelFromExp(exp) {
  return Math.max(1, Math.floor(Math.sqrt((exp || 0) / 50)) + 1);
}
