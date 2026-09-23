// ========== STORAGE HELPERS ==========
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem("musiclet_users") || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem("musiclet_users", JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem("musiclet_currentUser");
}

function setCurrentUser(username) {
  if (username) {
    localStorage.setItem("musiclet_currentUser", username);
  } else {
    localStorage.removeItem("musiclet_currentUser");
  }
}

function getCoins() {
  const user = getCurrentUser();
  if (!user) return 0;
  return parseInt(localStorage.getItem("musiclet_coins_" + user) || "500", 10);
}

function setCoins(amount) {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem("musiclet_coins_" + user, amount);
  const el = document.getElementById("statCoins");
  if (el) el.textContent = amount;
}

// ========== PAGE NAVIGATION ==========
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");

  const regError = document.getElementById("regError");
  const regSuccess = document.getElementById("regSuccess");
  const loginError = document.getElementById("loginError");
  if (regError) regError.textContent = "";
  if (regSuccess) regSuccess.textContent = "";
  if (loginError) loginError.textContent = "";

  if (pageId === "register") document.getElementById("registerForm")?.reset();
  if (pageId === "login") document.getElementById("loginForm")?.reset();
}

// ========== SIDEBAR SECTIONS ==========
function showSection(sectionId) {
  document.querySelectorAll(".content-section").forEach((s) => s.classList.remove("active"));
  const section = document.getElementById("section-" + sectionId);
  if (section) section.classList.add("active");

  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((item) => {
    if (item.getAttribute("onclick")?.includes(sectionId)) {
      item.classList.add("active");
    }
  });

  if (sectionId === "market") renderPacks();
  if (sectionId === "musics") renderInventory();
  if (sectionId === "stats") {
    const coinsEl = document.getElementById("statCoins");
    if (coinsEl) coinsEl.textContent = getCoins();
  }
}

// ========== RENDER PACKS ==========
function renderPacks() {
  const grid = document.getElementById("packGrid");
  if (!grid || !window.CATALOG) return;

  grid.innerHTML = CATALOG.packs.map(pack => `
    <div class="pack-card" style="border-color: ${pack.color1}">
      <img class="pack-img" src="${pack.img}" alt="${pack.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
      <div class="pack-emoji-fallback" style="display:none">📦</div>
      <div class="pack-name">${pack.name}</div>
      <div class="pack-cost">${pack.price} coins</div>
      <button class="btn btn-open" onclick="openPack('${pack.name}')">Open Pack</button>
    </div>
  `).join("");
}

// ========== INVENTORY ==========
function getInventory() {
  const user = getCurrentUser();
  if (!user) return [];
  try {
    return JSON.parse(localStorage.getItem("musiclet_inventory_" + user) || "[]");
  } catch {
    return [];
  }
}

function saveInventory(items) {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem("musiclet_inventory_" + user, JSON.stringify(items));
}

function renderInventory() {
  const grid = document.getElementById("inventoryGrid");
  const empty = document.getElementById("inventoryEmpty");
  const items = getInventory();

  if (!grid || !empty) return;

  if (items.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    grid.innerHTML = items.map(item => `
      <div class="inventory-item">
        <img class="inv-img" src="${item.img || ''}" alt="${item.name}" onerror="this.outerHTML='<div class=\'item-emoji\'>🎁</div>'" />
        <div class="item-name">${item.name}</div>
        <div class="item-pack">${item.pack || ''}</div>
      </div>
    `).join("");
  }
}

// ========== PACK OPENING ==========
function openPack(packName) {
  const pack = CATALOG.packs.find(p => p.name === packName);
  if (!pack) return;

  const coins = getCoins();
  if (coins < pack.price) {
    alert("Not enough coins! You need " + pack.price + " coins.");
    return;
  }

  setCoins(coins - pack.price);

  // Pick random blook from pack
  const blookName = pack.blooks[Math.floor(Math.random() * pack.blooks.length)];
  const img = blookImg(blookName);

  // Add to inventory
  const inv = getInventory();
  inv.push({
    name: blookName,
    pack: packName,
    img: img,
    time: Date.now()
  });
  saveInventory(inv);

  // Show modal
  document.getElementById("modalImg").src = img;
  document.getElementById("modalImg").style.display = "block";
  document.getElementById("modalTitle").textContent = "You opened " + packName + "!";
  document.getElementById("modalItem").textContent = blookName;
  document.getElementById("modalRarity").textContent = "";
  document.getElementById("packModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("packModal").classList.add("hidden");
}

// ========== PASSWORD TOGGLE ==========
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

// ========== REGISTER ==========
function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const errorEl = document.getElementById("regError");
  const successEl = document.getElementById("regSuccess");

  errorEl.textContent = "";
  successEl.textContent = "";

  if (username.length < 3) {
    errorEl.textContent = "Username must be at least 3 characters.";
    return;
  }
  if (password.length < 4) {
    errorEl.textContent = "Password must be at least 4 characters.";
    return;
  }

  const users = getUsers();
  if (users[username.toLowerCase()]) {
    errorEl.textContent = "That username is already taken.";
    return;
  }

  users[username.toLowerCase()] = {
    username: username,
    password: password,
    created: Date.now(),
  };
  saveUsers(users);

  localStorage.setItem("musiclet_coins_" + username, "500");

  successEl.textContent = "Account created! Redirecting to login…";
  setTimeout(() => {
    showPage("login");
    document.getElementById("loginUsername").value = username;
  }, 1200);
}

// ========== LOGIN ==========
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");

  errorEl.textContent = "";

  const users = getUsers();
  const user = users[username.toLowerCase()];

  if (!user || user.password !== password) {
    errorEl.textContent = "Invalid username or password.";
    return;
  }

  setCurrentUser(user.username);
  document.getElementById("sideUsername").textContent = user.username;

  if (!localStorage.getItem("musiclet_coins_" + user.username)) {
    localStorage.setItem("musiclet_coins_" + user.username, "500");
  }

  showPage("dashboard");
  showSection("stats");
}

// ========== LOGOUT ==========
function handleLogout() {
  setCurrentUser(null);
  showPage("landing");
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  const current = getCurrentUser();
  if (current) {
    document.getElementById("sideUsername").textContent = current;
    showPage("dashboard");
    showSection("stats");
  } else {
    showPage("landing");
  }
});
