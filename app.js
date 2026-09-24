const BLOOKS = CATALOG.blooks;
const PACKS = CATALOG.packs;
const RARITIES = CATALOG.rarities;
const blookByName = Object.fromEntries(BLOOKS.map(b => [b.name, b]));

let rarityFilter = "all";
let autoRunning = false;
let autoPack = null;
let autoOpened = 0;
let autoTimer = null;
const AUTO_DELAY_MS = 2000; // 2 seconds between each open

// ===== STORAGE =====
function safeGet(k, f) {
  try { return localStorage.getItem(k) || f; } catch (e) { return f; }
}
function safeSet(k, v) {
  try { localStorage.setItem(k, v); return true; } catch (e) { return false; }
}
function getUsers() {
  try { return JSON.parse(safeGet("ml_users", "{}")); } catch (e) { return {}; }
}
function currentUser() { return safeGet("ml_current", ""); }
function defaultData() {
  return {
    tokens: CATALOG.startTokens || 1500,
    exp: 0,
    packsOpened: 0,
    inventory: {},
    lastClaim: ""
  };
}
function getData(u) {
  try {
    return Object.assign(defaultData(), JSON.parse(safeGet("ml_data_" + u, "{}")));
  } catch (e) {
    return defaultData();
  }
}
function saveData(u, d) {
  safeSet("ml_data_" + u, JSON.stringify(d));
}

function levelForExp(exp) {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
}

// ===== AUTH =====
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

function doRegister() {
  const u = (document.getElementById("regUser").value || "").trim();
  const p = document.getElementById("regPass").value || "";
  const p2 = document.getElementById("regPass2").value || "";
  const err = document.getElementById("regErr");

  if (u.length < 3 || u.length > 20) {
    err.textContent = "Username must be 3–20 characters";
    return;
  }
  if (p.length < 4) {
    err.textContent = "Password must be at least 4 characters";
    return;
  }
  if (p !== p2) {
    err.textContent = "Passwords do not match";
    return;
  }
  const users = getUsers();
  if (users[u.toLowerCase()]) {
    err.textContent = "Username taken";
    return;
  }
  users[u.toLowerCase()] = { username: u, password: p };
  safeSet("ml_users", JSON.stringify(users));
  saveData(u, defaultData());
  err.textContent = "Account created! Signing in…";
  setTimeout(() => {
    closeModals();
    safeSet("ml_current", u);
    afterLogin(u);
  }, 600);
}

function doLogin() {
  const u = (document.getElementById("loginUser").value || "").trim();
  const p = document.getElementById("loginPass").value || "";
  const err = document.getElementById("loginErr");
  const users = getUsers();
  const key = u.toLowerCase();
  const user = users[key];
  if (!user || user.password !== p) {
    err.textContent = "Invalid username or password";
    return;
  }
  safeSet("ml_current", user.username);
  afterLogin(user.username);
}

function afterLogin(u) {
  closeModals();
  document.getElementById("landing").classList.remove("active");
  document.getElementById("app").classList.add("active");
  document.getElementById("userDisplay").textContent = u;
  showPage("stats");
  refreshUI();
}

function logout() {
  stopAuto();
  safeSet("ml_current", "");
  document.getElementById("app").classList.remove("active");
  document.getElementById("landing").classList.add("active");
}

// ===== PAGES =====
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

  renderMarket();
  renderBlooks();
  updateAutoBar();
}

// ===== MARKET =====
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
        '<button class="btn-pack btn-open-1" data-pack="' + p.name + '">Open</button>' +
        '<button class="btn-pack btn-auto" data-pack="' + p.name + '">⚡ Auto</button>' +
      "</div>";
    card.querySelector(".btn-open-1").onclick = (e) => {
      e.stopPropagation();
      if (autoRunning) return;
      openPack(p.name, false);
    };
    card.querySelector(".btn-auto").onclick = (e) => {
      e.stopPropagation();
      if (autoRunning && autoPack === p.name) {
        stopAuto();
      } else {
        startAuto(p.name);
      }
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
  document.getElementById("openRarity").innerHTML =
    '<span style="color:' + col + '">' + blook.rarity + " · " + (blook.chance || "?") + "%</span>";

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

// ===== AUTO OPEN =====
function startAuto(packName) {
  if (autoRunning) stopAuto();
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const pack = PACKS.find(p => p.name === packName);
  if (!pack) return;
  if (d.tokens < pack.price) {
    alert("Not enough tokens! Need " + pack.price + " 🪙");
    return;
  }

  autoRunning = true;
  autoPack = packName;
  autoOpened = 0;
  updateAutoBar();
  renderMarket();

  function tick() {
    if (!autoRunning) return;
    const ok = openPack(autoPack, true);
    if (!ok) {
      stopAuto();
      return;
    }
    updateAutoBar();
    autoTimer = setTimeout(tick, AUTO_DELAY_MS);
  }
  tick();
}

function stopAuto() {
  autoRunning = false;
  autoPack = null;
  if (autoTimer) {
    clearTimeout(autoTimer);
    autoTimer = null;
  }
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

// ===== BLOOKS =====
function renderBlooks() {
  const bar = document.getElementById("rarityBar");
  if (bar && !bar.dataset.ready) {
    bar.innerHTML = "";
    ["all", ...Object.keys(RARITIES)].forEach(r => {
      const b = document.createElement("button");
      b.textContent = r === "all" ? "All" : r;
      if (rarityFilter === r) b.classList.add("active");
      b.onclick = () => {
        rarityFilter = r;
        bar.dataset.ready = "";
        renderBlooks();
      };
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
      const slot = document.createElement("div");
      slot.className = "blook-slot " + (qty > 0 ? "owned" : "locked");
      slot.title = b.name + (qty ? " ×" + qty : " (locked)");
      if (qty > 0) {
        slot.innerHTML =
          '<img src="' + b.img + '" alt="' + b.name + '" loading="lazy" onerror="this.remove()">' +
          '<span class="qty">' + qty + "</span>";
      }
      grid.appendChild(slot);
    });
    sec.appendChild(grid);
    root.appendChild(sec);
  });
}

// ===== DAILY CLAIM =====
function claimDaily() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const day = new Date().toDateString();
  if (d.lastClaim === day) {
    alert("Already claimed today!");
    return;
  }
  const amount = CATALOG.claimAmount || 4000;
  d.tokens += amount;
  d.lastClaim = day;
  saveData(u, d);
  refreshUI();
  alert("Claimed " + amount + " tokens!");
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  const u = currentUser();
  if (u) {
    afterLogin(u);
  } else {
    document.getElementById("landing").classList.add("active");
  }

  document.querySelectorAll(".modal-bg").forEach(bg => {
    bg.addEventListener("click", e => {
      if (e.target === bg) {
        if (bg.id === "openModal" && autoRunning) return;
        closeModals();
      }
    });
  });
});
