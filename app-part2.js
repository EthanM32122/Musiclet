function confirmInstantSell() {
  if (!actionBlook) return;
  const name = actionBlook;
  const u = currentUser();
  const d = getData(u);
  const owned = d.inventory[name] || 0;
  if (owned < 1) { closeBlookAction(); return; }
  let qty = Math.floor(Number((document.getElementById("baSellQty") || {}).value) || 1);
  if (qty < 1) qty = 1;
  if (qty > owned) qty = owned;
  const unit = sellPrice(name);
  const total = unit * qty;
  d.inventory[name] = owned - qty;
  if (d.inventory[name] <= 0) delete d.inventory[name];
  if (d.equipped === name && (d.inventory[name] || 0) < 1) d.equipped = null;
  d.tokens += total;
  saveData(u, d);
  closeBlookAction();
  refreshUI();
}

function confirmListBazaar() {
  if (!actionBlook) return;
  const name = actionBlook;
  const u = currentUser();
  const d = getData(u);
  const owned = d.inventory[name] || 0;
  if (owned < 1) { setMsg("baListMsg", "You don't own this blook", false); return; }
  let qty = Math.floor(Number((document.getElementById("baListQty") || {}).value) || 1);
  if (qty < 1) qty = 1;
  if (qty > owned) qty = owned;
  const price = Math.floor(Number(document.getElementById("baListPrice").value) || 0);
  if (price < 1) { setMsg("baListMsg", "Price must be at least 1", false); return; }
  d.inventory[name] = owned - qty;
  if (d.inventory[name] <= 0) delete d.inventory[name];
  if (d.equipped === name && (d.inventory[name] || 0) < 1) d.equipped = null;
  saveData(u, d);
  const b = blookByName[name];
  const listings = getListings();
  for (let i = 0; i < qty; i++) {
    listings.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7) + i,
      seller: u, blook: name, pack: b ? b.pack : "", rarity: b ? b.rarity : "",
      img: b ? b.img : "", price: price, at: Date.now()
    });
  }
  saveListings(listings);
  closeBlookAction();
  refreshUI();
  alert("Listed ×" + qty + " " + name + " on the Bazaar for " + price + " each");
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
    bar.innerHTML = packs.map(p =>
      '<button type="button" data-pack="' + p + '" class="' + (bazaarPackFilter === p || (p === "all" && bazaarPackFilter === "all") ? "active" : "") + '">' +
      (p === "all" ? "All" : p) + "</button>"
    ).join("");
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
    box.innerHTML = '<p class="muted">No listings yet. List a Blook from My Blooks!</p>';
    return;
  }
  const me = currentUser();
  box.innerHTML = '<div class="bazaar-grid">' + list.map(L => {
    const mine = me && L.seller && L.seller.toLowerCase() === me.toLowerCase();
    return '<div class="bazaar-card">' +
      '<img src="' + (L.img || "") + '" alt="">' +
      '<div class="bz-name">' + L.blook + "</div>" +
      '<div class="bz-pack muted">' + (L.pack || "") + "</div>" +
      '<div class="bz-rarity">' + (L.rarity || "") + "</div>" +
      '<div class="bz-price">' + L.price.toLocaleString() + " " + tokenIcon() + "</div>" +
      '<div class="bz-seller muted">by ' +
        '<a href="#" class="profile-link" onclick="openProfile(\'' + (L.seller || "").replace(/'/g, "") + '\');return false;">' +
        L.seller + "</a></div>" +
      (mine
        ? '<button class="btn-pack btn-stop" onclick="cancelListing(\'' + L.id + '\')">Cancel</button>'
        : '<button class="btn-pack btn-open-1" onclick="buyListing(\'' + L.id + '\')">Buy</button>') +
      "</div>";
  }).join("") + "</div>";
}

function buyListing(id) {
  const u = currentUser();
  if (!u) return;
  const listings = getListings();
  const L = listings.find(x => x.id === id);
  if (!L) { alert("Listing gone"); renderBazaar(); return; }
  if (L.seller.toLowerCase() === u.toLowerCase()) { alert("That's your listing"); return; }
  const buyer = getData(u);
  if (buyer.tokens < L.price) { alert("Not enough tokens! Need " + L.price); return; }
  if (!confirm("Buy " + L.blook + " from " + L.seller + " for " + L.price + "?")) return;
  buyer.tokens -= L.price;
  buyer.inventory[L.blook] = (buyer.inventory[L.blook] || 0) + 1;
  saveData(u, buyer);
  const sellerData = getData(L.seller);
  sellerData.tokens += L.price;
  saveData(L.seller, sellerData);
  saveListings(listings.filter(x => x.id !== id));
  refreshUI();
}

function cancelListing(id) {
  const u = currentUser();
  if (!u) return;
  const listings = getListings();
  const L = listings.find(x => x.id === id);
  if (!L || L.seller.toLowerCase() !== u.toLowerCase()) return;
  const d = getData(u);
  d.inventory[L.blook] = (d.inventory[L.blook] || 0) + 1;
  saveData(u, d);
  saveListings(listings.filter(x => x.id !== id));
  refreshUI();
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
        "</div>";
    }).join("");
    return '<div class="pack-section"><h3>' + pack + '</h3><div class="blook-grid">' + cells + '</div></div>';
  }).join("");
  root.querySelectorAll(".blook-slot.sellable").forEach(el => {
    el.onclick = () => openBlookAction(el.getAttribute("data-name"));
  });
}

function applyPfpTo(imgId, letterId, src, letter) {
  const img = document.getElementById(imgId);
  const letEl = document.getElementById(letterId);
  if (!img || !letEl) return;
  if (src) {
    img.src = src;
    img.style.display = "block";
    letEl.style.display = "none";
  } else {
    img.style.display = "none";
    letEl.style.display = "grid";
    letEl.textContent = letter || "?";
  }
}

function getPfpSrc(d) {
  if (d.customPfp) return d.customPfp;
  if (d.equipped && blookByName[d.equipped]) return blookByName[d.equipped].img;
  return null;
}

function updatePfp(username) {
  const d = getData(username);
  const src = getPfpSrc(d);
  const letter = (username || "?").charAt(0).toUpperCase();
  applyPfpTo("pfpImg", "pfpLetter", src, letter);
  applyPfpTo("statsPfpImg", "statsPfpLetter", src, letter);
}

function openProfile(username) {
  const u = username || currentUser();
  if (!u) return;
  const d = getData(u);
  const isMe = currentUser() && currentUser().toLowerCase() === u.toLowerCase();
  document.getElementById("profileName").textContent = u;
  document.getElementById("profileSubtitle").textContent = "Level " + levelForExp(d.exp);
  const src = getPfpSrc(d);
  const letter = u.charAt(0).toUpperCase();
  applyPfpTo("profileAvatarImg", "profileAvatarLetter", src, letter);
  const stats = [];
  if (isMe) stats.push(["Tokens", d.tokens.toLocaleString() + " " + tokenIcon()]);
  stats.push(["Level", String(levelForExp(d.exp))]);
  stats.push(["XP", d.exp.toLocaleString()]);
  stats.push(["Packs", String(d.packsOpened || 0)]);
  const inv = d.inventory || {};
  const types = Object.keys(inv).filter(k => inv[k] > 0);
  stats.push(["Blooks", String(types.length)]);
  document.getElementById("profileStats").innerHTML = stats.map(s =>
    '<div class="profile-stat"><span class="ps-label">' + s[0] + '</span><span class="ps-value">' + s[1] + "</span></div>"
  ).join("");
  document.getElementById("profileBlooks").innerHTML = types.slice(0, 48).map(n => {
    const b = blookByName[n];
    return '<div class="profile-blook" title="' + n + '"><img src="' + (b ? b.img : "") + '"></div>';
  }).join("") || '<p class="muted">No blooks</p>';
  const mine = getListings().filter(L => L.seller && L.seller.toLowerCase() === u.toLowerCase());
  document.getElementById("profileListings").innerHTML = mine.length
    ? mine.map(L => "<div><strong>" + L.blook + '</strong><br><span class="muted">' + L.price.toLocaleString() + " " + tokenIcon() + "</span></div>").join("")
    : '<p class="muted">None</p>';
  if (typeof renderProfileBadges === "function") renderProfileBadges(u);
  document.getElementById("profileModal").classList.add("open");
}

function openEquipModal() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const inv = d.inventory || {};
  const types = Object.keys(inv).filter(k => inv[k] > 0);
  const grid = document.getElementById("equipGrid");
  const order = ["Mystical", "Chroma", "Legendary", "Epic", "Rare", "Uncommon", "Common"];
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
  d.customPfp = null;
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
