/* === Banners (behind username, Blooket-style) === */
const BANNERS = [
  { id: "pencil", name: "Pencil", svg: '<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="12" width="78" height="16" rx="2" fill="#f5c518" stroke="#1a1a1a" stroke-width="2.5"/><path d="M8 12h14v16H8c-3 0-5-2-5-5v-6c0-3 2-5 5-5z" fill="#2d2d2d"/><path d="M2 20l6-5v10z" fill="#1a1a1a"/><rect x="22" y="12" width="3" height="16" fill="#e8b010"/><rect x="32" y="12" width="3" height="16" fill="#e8b010"/><rect x="42" y="12" width="3" height="16" fill="#e8b010"/><rect x="52" y="12" width="3" height="16" fill="#e8b010"/><rect x="86" y="10" width="12" height="20" rx="2" fill="#f5c518" stroke="#1a1a1a" stroke-width="2"/><rect x="96" y="8" width="16" height="24" rx="4" fill="#ff8fab" stroke="#1a1a1a" stroke-width="2"/><rect x="86" y="14" width="4" height="12" fill="#c4d4e8" stroke="#1a1a1a" stroke-width="1"/></svg>' },
  { id: "glue", name: "Glue", svg: '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="30" rx="8" ry="6" fill="#f5a623" stroke="#1a1a1a" stroke-width="2"/><rect x="16" y="24" width="14" height="12" rx="2" fill="#fff" stroke="#1a1a1a" stroke-width="2"/><rect x="18" y="26" width="10" height="3" fill="#ddd"/><rect x="28" y="14" width="42" height="32" rx="8" fill="#fff" stroke="#1a1a1a" stroke-width="2.5"/><rect x="36" y="22" width="26" height="16" rx="3" fill="#4fc3f7" stroke="#1a1a1a" stroke-width="1.5"/></svg>' },
  { id: "trumpet", name: "Trumpet", svg: '<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M8 28c0-4 4-8 12-8h8v16H20c-8 0-12-4-12-8z" fill="#f5c518" stroke="#1a1a1a" stroke-width="2"/><rect x="28" y="18" width="48" height="14" rx="3" fill="#f5c518" stroke="#1a1a1a" stroke-width="2"/><circle cx="40" cy="18" r="3" fill="#4fc3f7" stroke="#1a1a1a" stroke-width="1.5"/><circle cx="52" cy="18" r="3" fill="#4fc3f7" stroke="#1a1a1a" stroke-width="1.5"/><circle cx="64" cy="18" r="3" fill="#4fc3f7" stroke="#1a1a1a" stroke-width="1.5"/><path d="M76 16c12 0 18 8 18 14s-6 10-14 8c-4-1-6-4-6-8V16z" fill="#f5c518" stroke="#1a1a1a" stroke-width="2"/><ellipse cx="90" cy="30" rx="6" ry="8" fill="#7dd3fc" stroke="#1a1a1a" stroke-width="1.5"/></svg>' },
  { id: "piano", name: "Piano", svg: '<svg viewBox="0 0 90 50" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="78" height="32" rx="3" fill="#f5e6c8" stroke="#1a1a1a" stroke-width="2.5"/><rect x="10" y="14" width="10" height="24" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><rect x="20" y="14" width="10" height="24" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><rect x="30" y="14" width="10" height="24" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><rect x="40" y="14" width="10" height="24" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><rect x="50" y="14" width="10" height="24" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><rect x="60" y="14" width="10" height="24" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><rect x="70" y="14" width="10" height="24" fill="#fff" stroke="#1a1a1a" stroke-width="1"/><rect x="16" y="14" width="7" height="14" fill="#1a1a1a" rx="1"/><rect x="26" y="14" width="7" height="14" fill="#1a1a1a" rx="1"/><rect x="46" y="14" width="7" height="14" fill="#1a1a1a" rx="1"/><rect x="56" y="14" width="7" height="14" fill="#1a1a1a" rx="1"/><rect x="66" y="14" width="7" height="14" fill="#1a1a1a" rx="1"/></svg>' },
  { id: "hamburger", name: "Hamburger", svg: '<svg viewBox="0 0 70 60" xmlns="http://www.w3.org/2000/svg"><ellipse cx="35" cy="18" rx="28" ry="12" fill="#e8a045" stroke="#1a1a1a" stroke-width="2"/><circle cx="48" cy="14" r="3" fill="#d4893a"/><path d="M8 28h54c0 4-4 8-8 8H16c-4 0-8-4-8-8z" fill="#7cb342" stroke="#1a1a1a" stroke-width="1.5"/><rect x="10" y="34" width="50" height="8" rx="3" fill="#c45c3e" stroke="#1a1a1a" stroke-width="1.5"/><rect x="12" y="40" width="46" height="6" rx="2" fill="#8d6e63" stroke="#1a1a1a" stroke-width="1.5"/><ellipse cx="35" cy="48" rx="26" ry="8" fill="#e8a045" stroke="#1a1a1a" stroke-width="2"/></svg>' },
  { id: "hotdog", name: "Hotdog", svg: '<svg viewBox="0 0 90 50" xmlns="http://www.w3.org/2000/svg"><ellipse cx="45" cy="28" rx="40" ry="16" fill="#f0c78a" stroke="#1a1a1a" stroke-width="2.5"/><ellipse cx="45" cy="26" rx="34" ry="10" fill="#c45c3e" stroke="#1a1a1a" stroke-width="1.5"/><path d="M18 24c8 4 16 2 22 0s14-2 22 2 12 2 18-1" fill="none" stroke="#f5c518" stroke-width="3" stroke-linecap="round"/></svg>' },
  { id: "burrito", name: "Burrito", svg: '<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="26" rx="34" ry="18" fill="#e8c47a" stroke="#1a1a1a" stroke-width="2.5"/><path d="M12 26c8-10 20-14 28-8s16 10 28 6" fill="none" stroke="#d4a85c" stroke-width="3"/><circle cx="30" cy="24" r="3" fill="#7cb342"/><circle cx="42" cy="28" r="2.5" fill="#c45c3e"/><circle cx="52" cy="22" r="2" fill="#f5c518"/></svg>' },
  { id: "taco", name: "Taco", svg: '<svg viewBox="0 0 80 55" xmlns="http://www.w3.org/2000/svg"><path d="M8 40c0-18 14-32 32-32s32 14 32 32" fill="#e8c47a" stroke="#1a1a1a" stroke-width="2.5"/><path d="M14 38c4-12 14-22 26-22s22 10 26 22" fill="#7cb342"/><ellipse cx="28" cy="32" rx="4" ry="3" fill="#c45c3e"/><ellipse cx="40" cy="30" rx="5" ry="3" fill="#f5c518"/><ellipse cx="52" cy="32" rx="4" ry="3" fill="#c45c3e"/><circle cx="34" cy="36" r="2" fill="#fff"/><circle cx="46" cy="35" r="2" fill="#fff"/></svg>' },
  { id: "sushi", name: "Sushi", svg: '<svg viewBox="0 0 80 55" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="38" rx="32" ry="14" fill="#f5efe0" stroke="#1a1a1a" stroke-width="2"/><ellipse cx="40" cy="36" rx="28" ry="10" fill="#faf6ee"/><circle cx="28" cy="36" r="2" fill="#d4c4a8"/><circle cx="40" cy="34" r="1.5" fill="#d4c4a8"/><circle cx="50" cy="37" r="2" fill="#d4c4a8"/><ellipse cx="40" cy="22" rx="30" ry="12" fill="#e85d3a" stroke="#1a1a1a" stroke-width="2"/><path d="M20 22c8 4 16 2 20 0s14-2 20 2" fill="none" stroke="#f5a08a" stroke-width="2"/><ellipse cx="68" cy="24" rx="6" ry="4" fill="#e85d3a" stroke="#1a1a1a" stroke-width="1.5"/></svg>' },
  { id: "gordita", name: "Gordita", svg: '<svg viewBox="0 0 90 55" xmlns="http://www.w3.org/2000/svg"><path d="M10 40c0-16 12-28 35-28s35 12 35 28c0 4-8 8-35 8s-35-4-35-8z" fill="#e8c47a" stroke="#1a1a1a" stroke-width="2.5"/><path d="M18 36c6-8 16-12 27-10s20 6 26 12" fill="#f5efe0"/><circle cx="32" cy="34" r="3" fill="#c45c3e"/><circle cx="44" cy="32" r="4" fill="#f5e6c8"/><circle cx="56" cy="34" r="3" fill="#7cb342"/><rect x="38" y="30" width="8" height="6" rx="1" fill="#f5c518"/></svg>' },
  { id: "steak", name: "Steak", svg: '<svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg"><ellipse cx="45" cy="32" rx="38" ry="24" fill="#2d2d2d" stroke="#1a1a1a" stroke-width="2"/><ellipse cx="48" cy="28" rx="22" ry="16" fill="#a0452c" stroke="#1a1a1a" stroke-width="1.5"/><path d="M36 20h20M34 28h24M38 36h16" stroke="#6b2d1a" stroke-width="1.5"/><ellipse cx="22" cy="40" rx="6" ry="4" fill="#f5c518"/><ellipse cx="18" cy="48" rx="5" ry="3" fill="#f5c518"/><circle cx="70" cy="42" r="5" fill="#f5efe0" stroke="#1a1a1a" stroke-width="1"/><circle cx="70" cy="42" r="3" fill="#c45c3e"/><path d="M12 22c4-6 8-8 10-4s-2 10-6 12-8 0-4-8z" fill="#7cb342"/></svg>' },
  { id: "sandwich", name: "Sandwich", svg: '<svg viewBox="0 0 80 55" xmlns="http://www.w3.org/2000/svg"><path d="M8 20c0-6 8-12 32-12s32 6 32 12v6H8v-6z" fill="#e8c47a" stroke="#1a1a1a" stroke-width="2"/><rect x="10" y="24" width="60" height="6" fill="#7cb342"/><rect x="12" y="30" width="56" height="5" fill="#c45c3e"/><rect x="10" y="35" width="60" height="5" fill="#f5e6c8"/><path d="M8 40h64v8c0 4-8 8-32 8s-32-4-32-8v-8z" fill="#e8c47a" stroke="#1a1a1a" stroke-width="2"/></svg>' },
  { id: "fries", name: "Fries", svg: '<svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg"><path d="M12 28h46l-4 36H16z" fill="#f5efe0" stroke="#1a1a1a" stroke-width="2"/><rect x="18" y="8" width="7" height="28" rx="2" fill="#f5c518" stroke="#1a1a1a" stroke-width="1.2" transform="rotate(-8 21 22)"/><rect x="28" y="4" width="7" height="32" rx="2" fill="#f5c518" stroke="#1a1a1a" stroke-width="1.2"/><rect x="38" y="6" width="7" height="30" rx="2" fill="#e8b010" stroke="#1a1a1a" stroke-width="1.2" transform="rotate(5 41 21)"/><rect x="46" y="10" width="7" height="26" rx="2" fill="#f5c518" stroke="#1a1a1a" stroke-width="1.2" transform="rotate(10 49 23)"/><ellipse cx="35" cy="42" rx="14" ry="8" fill="#f5efe0" opacity="0.9"/><circle cx="30" cy="40" r="2" fill="#c45c3e"/><circle cx="40" cy="42" r="2" fill="#7cb342"/><circle cx="35" cy="46" r="1.5" fill="#8d6e63"/></svg>' },
  { id: "quesadilla", name: "Quesadilla", svg: '<svg viewBox="0 0 90 55" xmlns="http://www.w3.org/2000/svg"><path d="M8 42c0-18 16-34 37-34s37 16 37 34c0 2-8 6-37 6s-37-4-37-6z" fill="#e8c47a" stroke="#1a1a1a" stroke-width="2.5"/><path d="M14 40c6-14 18-24 31-24s25 10 31 24" fill="#f5efe0"/><circle cx="30" cy="34" r="4" fill="#f5e6c8"/><circle cx="45" cy="30" r="5" fill="#c45c3e"/><circle cx="58" cy="34" r="3" fill="#7cb342"/><rect x="36" y="32" width="10" height="6" rx="1" fill="#f5c518"/><path d="M20 28h8M50 26h10" stroke="#d4a85c" stroke-width="1.5" stroke-linecap="round"/></svg>' }
];
const bannerById = Object.fromEntries(BANNERS.map(b => [b.id, b]));

function bannerHtml(id) {
  const b = bannerById[id];
  if (!b) return "";
  return b.svg;
}

function openBannersModal() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const grid = document.getElementById("bannersGrid");
  if (!grid) return;
  grid.innerHTML = BANNERS.map(b => {
    const on = d.equippedBanner === b.id;
    return '<button type="button" class="banner-slot' + (on ? " selected" : "") + '" data-id="' + b.id + '" title="' + b.name + '">' +
      b.svg +
      (on ? '<span class="eq-tag">✓</span>' : "") +
      "</button>";
  }).join("");
  grid.querySelectorAll(".banner-slot").forEach(btn => {
    btn.onclick = () => equipBanner(btn.getAttribute("data-id"));
  });
  document.getElementById("bannersModal").classList.add("open");
}

function closeBannersModal() {
  const m = document.getElementById("bannersModal");
  if (m) m.classList.remove("open");
}

function equipBanner(id) {
  const u = currentUser();
  if (!u) return;
  if (!bannerById[id]) return;
  const d = getData(u);
  d.equippedBanner = id;
  saveData(u, d);
  updateBannerDisplay(u);
  closeBannersModal();
}

function unequipBanner() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  d.equippedBanner = null;
  saveData(u, d);
  updateBannerDisplay(u);
  closeBannersModal();
}

function updateBannerDisplay(username) {
  const u = username || currentUser();
  if (!u) return;
  const d = getData(u);
  const el = document.getElementById("statsBannerBehind");
  if (!el) return;
  if (d.equippedBanner && bannerById[d.equippedBanner]) {
    el.innerHTML = bannerById[d.equippedBanner].svg;
  } else {
    el.innerHTML = "";
  }
}

// Hook into refresh if available
(function() {
  const _orig = window.refreshUI;
  if (typeof _orig === 'function') {
    window.refreshUI = function() {
      _orig.apply(this, arguments);
      try { updateBannerDisplay(); } catch (e) {}
    };
  }
  document.addEventListener('DOMContentLoaded', function() {
    try { updateBannerDisplay(); } catch (e) {}
  });
})();
