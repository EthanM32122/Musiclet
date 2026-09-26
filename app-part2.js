function confirmInstantSell() {
  if (!actionBlook) return;
  const name = actionBlook;
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const owned = (d.inventory && d.inventory[name]) || 0;
  const qty = Math.min(owned, Math.max(1, parseInt((document.getElementById("baSellQty") || {}).value, 10) || 1));
  if (owned < 1) { closeBlookAction(); return; }
  const b = BLOOKS.find(x => x.name === name);
  const price = sellPrice(name);
  d.tokens = (d.tokens || 0) + price * qty;
  d.inventory[name] = owned - qty;
  if (d.inventory[name] <= 0) delete d.inventory[name];
  saveData(u, d);
  closeBlookAction();
  refreshUI();
}

function confirmListBazaar() {
  const u = currentUser();
  if (!u || !actionBlook) return;
  const name = actionBlook;
  const qty = parseInt((document.getElementById("baListQty") || {}).value, 10) || 1;
  const price = parseInt((document.getElementById("baListPrice") || {}).value, 10);
  const msg = document.getElementById("baListMsg");
  const d = getData(u);
  const owned = (d.inventory && d.inventory[name]) || 0;
  if (qty < 1 || qty > owned) { if (msg) msg.textContent = "Invalid amount"; return; }
  if (!price || price < 1) { if (msg) msg.textContent = "Enter a price"; return; }
  d.inventory[name] = owned - qty;
  if (d.inventory[name] <= 0) delete d.inventory[name];
  saveData(u, d);
  const b = BLOOKS.find(x => x.name === name);
  const list = getListings();
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

function buyListing(id) {
  const u = currentUser();
  if (!u) return;
  const list = getListings();
  const idx = list.findIndex(L => L.id === id);
  if (idx < 0) { alert("Listing gone"); renderBazaar(); return; }
  const L = list[idx];
  if ((L.seller || "").toLowerCase() === u.toLowerCase()) { alert("That's your listing"); return; }
  const buyer = getData(u);
  const price = Number(L.price) || 0;
  const qty = Number(L.qty) || 1;
  if ((buyer.tokens || 0) < price * qty) { alert("Not enough tokens"); return; }
  buyer.tokens -= price * qty;
  if (!buyer.inventory) buyer.inventory = {};
  buyer.inventory[L.blook] = (buyer.inventory[L.blook] || 0) + qty;
  saveData(u, buyer);
  const seller = getData(L.seller);
  seller.tokens = (seller.tokens || 0) + price * qty;
  saveData(L.seller, seller);
  list.splice(idx, 1);
  saveListings(list);
  renderBazaar();
  refreshUI();
  alert("Bought ×" + qty + " " + L.blook + "!");
}

function cancelListing(id) {
  const u = currentUser();
  if (!u) return;
  let list = getListings();
  const L = list.find(x => x.id === id);
  if (!L || (L.seller || "").toLowerCase() !== u.toLowerCase()) return;
  const d = getData(u);
  if (!d.inventory) d.inventory = {};
  d.inventory[L.blook] = (d.inventory[L.blook] || 0) + (L.qty || 1);
  saveData(u, d);
  list = list.filter(x => x.id !== id);
  saveListings(list);
  renderBazaar();
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

function applyPfpTo(imgId, letterId, src, letter) {
  const img = document.getElementById(imgId);
  const letEl = document.getElementById(letterId);
  if (img && src) {
    img.src = src;
    img.style.display = "block";
    if (letEl) letEl.style.display = "none";
  } else {
    if (img) { img.style.display = "none"; img.removeAttribute("src"); }
    if (letEl) { letEl.style.display = ""; letEl.textContent = letter || "?"; }
  }
}

function getPfpSrc(d) {
  if (!d) return null;
  if (d.customPfp) return d.customPfp;
  if (d.equipped) {
    const b = BLOOKS.find(x => x.name === d.equipped);
    if (b) return b.img;
  }
  return null;
}

function updatePfp(username) {
  const u = username || currentUser();
  if (!u) return;
  const d = getData(u);
  const src = getPfpSrc(d);
  const letter = (u.charAt(0) || "?").toUpperCase();
  applyPfpTo("pfpImg", "pfpLetter", src, letter);
  applyPfpTo("statsPfpImg", "statsPfpLetter", src, letter);
}

function openProfile(username) {
  const u = username || currentUser();
  if (!u) return;
  const d = getData(u);
  const nameEl = document.getElementById("profileName");
  if (nameEl) nameEl.textContent = u;
  const sub = document.getElementById("profileSubtitle");
  if (sub) sub.textContent = "Level " + (typeof levelForExp === "function" ? levelForExp(d.exp || 0) : 1);
  const stats = document.getElementById("profileStats");
  if (stats) {
    const rows = [
      ["Tokens", String(d.tokens || 0)],
      ["Packs", String(d.packsOpened || 0)],
      ["Blooks", String(Object.keys(d.inventory || {}).length)],
      ["XP", String(d.exp || 0)]
    ];
    stats.innerHTML = rows.map(r =>
      '<div class="ps-item"><span class="ps-label">' + r[0] + '</span><span class="ps-val">' + r[1] + "</span></div>"
    ).join("");
  }
  const inv = d.inventory || {};
  const pb = document.getElementById("profileBlooks");
  if (pb) {
    const names = Object.keys(inv);
    pb.innerHTML = names.length
      ? names.map(n => {
          const b = BLOOKS.find(x => x.name === n);
          return '<div class="blook-slot"><img src="' + (b ? b.img : "") + '" alt=""><span class="qty">×' + inv[n] + "</span></div>";
        }).join("")
      : '<p class="muted">No blooks yet</p>';
  }
  const listings = getListings().filter(L => (L.seller || "").toLowerCase() === u.toLowerCase());
  const pl = document.getElementById("profileListings");
  if (pl) {
    pl.innerHTML = listings.length
      ? listings.map(L => '<div class="muted">' + L.blook + " ×" + (L.qty || 1) + " @ " + L.price + "</div>").join("")
      : '<p class="muted">No listings</p>';
  }
  const src = getPfpSrc(d);
  applyPfpTo("profileAvatarImg", "profileAvatarLetter", src, (u.charAt(0) || "?").toUpperCase());
  const modal = document.getElementById("profileModal");
  if (modal) modal.classList.add("open");
}

function openEquipModal() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const inv = d.inventory || {};
  const grid = document.getElementById("equipGrid");
  if (!grid) return;
  const names = Object.keys(inv);
  grid.innerHTML = names.length
    ? names.map(n => {
        const b = BLOOKS.find(x => x.name === n);
        return '<button type="button" class="equip-item" onclick="equipBlook(\'' + n.replace(/'/g, "\\'") + '\')">' +
          '<img src="' + (b ? b.img : "") + '" alt=""><span>' + n + "</span></button>";
      }).join("")
    : '<p class="muted">Own blooks to equip them</p>';
  const modal = document.getElementById("equipModal");
  if (modal) modal.classList.add("open");
}

function equipBlook(name) {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  d.equipped = name;
  d.customPfp = null;
  saveData(u, d);
  updatePfp(u);
  closeEquipModal();
  refreshUI();
}

function unequipBlook() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  d.equipped = null;
  saveData(u, d);
  updatePfp(u);
  closeEquipModal();
  refreshUI();
}

function claimDaily() {
  const u = currentUser();
  if (!u) return;
  const d = getData(u);
  const today = new Date().toISOString().slice(0, 10);
  if (d.lastClaim === today) { alert("Already claimed today!"); return; }
  const amt = (typeof CATALOG !== "undefined" && CATALOG.claimAmount) || 4000;
  d.tokens = (d.tokens || 0) + amt;
  d.lastClaim = today;
  saveData(u, d);
  refreshUI();
  alert("Claimed " + amt + " tokens!");
}
