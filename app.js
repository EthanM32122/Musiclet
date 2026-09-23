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

  if (sectionId === "musics") renderInventory();
  if (sectionId === "stats") {
    const coinsEl = document.getElementById("statCoins");
    if (coinsEl) coinsEl.textContent = getCoins();
  }
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
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-pack">from ${item.pack}</div>
      </div>
    `).join("");
  }
}

// ========== PACK OPENING ==========
const packItems = {
  "Space Pack": ["Astronaut", "Alien", "UFO", "Planet", "Rocket", "Moon", "Star", "Galaxy"],
  "Breakfast Pack": ["Pancake", "Waffle", "Bacon", "Egg", "Toast", "Cereal", "Orange Juice", "Syrup"],
  "Medieval Pack": ["King", "Queen", "Knight", "Dragon", "Wizard", "Castle", "Sword", "Shield"],
  "Wonderland Pack": ["King of Hearts", "Queen of Hearts", "Alice", "Mad Hatter", "Cheshire Cat", "White Rabbit"],
  "Bot Pack": ["Mega Bot", "Basic Bot", "Robot Dog", "Drone", "Cyborg", "AI Core"],
  "Aquatic Pack": ["Shark", "Octopus", "Jellyfish", "Dolphin", "Whale", "Seahorse", "Coral"],
  "Safari Pack": ["Lion", "Tiger", "Giraffe", "Zebra", "Elephant", "Panda", "Monkey"],
  "Dino Pack": ["T-Rex", "Triceratops", "Pterodactyl", "Stegosaurus", "Velociraptor", "Fossil"],
  "Ice Monster Pack": ["Yeti", "Ice Slime", "Frozen Fossil", "Ice Crab", "Snow Beast", "Glacier"],
  "Outback Pack": ["Kangaroo", "Koala", "Platypus", "Sugar Glider", "Dingo", "Emu"],
  "Pirate Pack": ["Captain Blackbeard", "Pirate Ship", "Treasure Chest", "Parrot", "Cannon", "Map"],
  "Bug Pack": ["Butterfly", "Beetle", "Spider", "Dragonfly", "Ladybug", "Ant", "Moth"],
  "Lunch Pack": ["Sandwich", "Pizza", "Burger", "Taco", "Fries", "Soda", "Cookie"],
  "Dog Pack": ["Golden Retriever", "Poodle", "Bulldog", "Husky", "Corgi", "Beagle"],
  "Spooky Pack": ["Ghost", "Vampire", "Pumpkin", "Witch", "Skeleton", "Bat", "Zombie"],
  "Autumn Pack": ["Turkey", "Pumpkin Pie", "Leaf", "Acorn", "Scarecrow", "Corn"],
  "Blizzard Pack": ["Santa", "Snowman", "Reindeer", "Snow Globe", "Gift", "Candy Cane"],
  "Lovely Pack": ["Heart", "Rose", "Cupid", "Love Letter", "Chocolate"],
  "Lucky Pack": ["Clover", "Leprechaun", "Pot of Gold", "Rainbow", "Horseshoe"],
  "Spring Pack": ["Bunny", "Chick", "Flower", "Egg", "Butterfly"]
};

function openPack(packName, cost, emoji) {
  const coins = getCoins();
  if (coins < cost) {
    alert("Not enough coins! You need " + cost + " coins.");
    return;
  }

  setCoins(coins - cost);

  const possible = packItems[packName] || ["Mystery Item"];
  const itemName = possible[Math.floor(Math.random() * possible.length)];

  // Add to inventory
  const inv = getInventory();
  inv.push({
    name: itemName,
    emoji: emoji,
    pack: packName,
    time: Date.now()
  });
  saveInventory(inv);

  // Show modal
  document.getElementById("modalEmoji").textContent = emoji;
  document.getElementById("modalTitle").textContent = "You opened " + packName + "!";
  document.getElementById("modalItem").textContent = itemName;
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

  // Give starting coins
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

  // Ensure coins exist
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
