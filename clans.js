/* Musiclet Clans — list / create / view; level = floor(total packs / 100) + 1 */
(function () {
  "use strict";

  var BANNER_COLORS = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#ef4444", "#06b6d4", "#a855f7", "#f97316", "#14b8a6"
  ];

  function getClans() {
    try { return JSON.parse(localStorage.getItem("ml_clans") || "{}"); } catch (e) { return {}; }
  }
  function saveClans(obj) {
    try { localStorage.setItem("ml_clans", JSON.stringify(obj)); } catch (e) {}
  }
  function clanLevelFromPacks(packs) {
    return Math.floor(Math.max(0, Number(packs) || 0) / 100) + 1;
  }
  function totalPacksForClan(clan) {
    if (!clan || !clan.members) return 0;
    var total = 0;
    (clan.members || []).forEach(function (name) {
      try {
        var d = typeof getData === "function" ? getData(name) : {};
        total += Number(d.packsOpened || 0);
      } catch (e) {}
    });
    return total;
  }
  function uid() {
    return "c_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function ensureCSS() {
    if (document.getElementById("ml-clans-css")) return;
    var s = document.createElement("style");
    s.id = "ml-clans-css";
    s.textContent = [
      ".clans-page-head { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:22px; }",
      ".clans-title {",
      "  margin:0; font-size:42px; font-weight:900; font-style:italic; letter-spacing:0.02em;",
      "  color:#7dd3fc; text-shadow: 0 0 2px #1e3a8a, 3px 3px 0 #1e3a8a, -1px -1px 0 #0c4a6e;",
      "  -webkit-text-stroke: 1px #0c4a6e;",
      "}",
      ".btn-create-clan {",
      "  border:none; cursor:pointer; padding:10px 18px; border-radius:12px;",
      "  font-size:22px; font-weight:900; font-style:italic;",
      "  background: linear-gradient(180deg, #fde68a 0%, #f97316 45%, #3b82f6 100%);",
      "  color:#fff; text-shadow: 0 2px 0 #1e3a8a; box-shadow: 0 4px 0 #1e40af, 0 8px 20px rgba(0,0,0,0.25);",
      "  transition: transform 0.12s, filter 0.12s;",
      "}",
      ".btn-create-clan:hover { transform: translateY(-2px); filter: brightness(1.05); }",
      ".clans-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:18px; }",
      ".clan-slot {",
      "  aspect-ratio: 1.15; border-radius: 8px; background: linear-gradient(180deg, #3b82f6, #1d4ed8);",
      "  border: 5px dashed #0a0a0a;",
      "  outline: 4px solid #0a0a0a; outline-offset: 2px;",
      "  box-shadow: 0 8px 24px rgba(0,0,0,0.3);",
      "  position: relative; overflow: hidden; cursor: pointer;",
      "  display:flex; flex-direction:column; align-items:center; justify-content:center;",
      "  color:#fff; text-align:center; padding:12px;",
      "}",
      ".clan-slot.empty { opacity: 0.85; cursor: default; }",
      ".clan-slot .clan-slot-photo {",
      "  width: 72px; height: 72px; border-radius: 12px; object-fit: cover;",
      "  background: rgba(0,0,0,0.25); margin-bottom: 8px; border: 3px solid rgba(255,255,255,0.35);",
      "}",
      ".clan-slot .clan-slot-name { font-weight: 900; font-size: 15px; text-shadow: 0 2px 4px #000; }",
      ".clan-slot .clan-slot-lvl { font-size: 12px; font-weight: 700; opacity: 0.9; margin-top: 4px; }",
      ".clan-create-wrap { max-width: 560px; margin: 0 auto; }",
      ".clan-create-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }",
      "@media (max-width: 640px) { .clan-create-grid { grid-template-columns: 1fr; } }",
      ".clan-field {",
      "  background: rgba(88, 28, 135, 0.55); border-radius: 14px; padding: 16px 18px;",
      "  border: 2px solid rgba(192,132,252,0.35);",
      "}",
      ".clan-field label {",
      "  display:block; margin-bottom: 10px; font-size: 20px; font-weight: 900; font-style: italic;",
      "  letter-spacing: 0.04em; color: #86efac;",
      "  text-shadow: 0 2px 0 #14532d, 2px 2px 0 #052e16;",
      "}",
      ".clan-field input, .clan-field textarea, .clan-field select {",
      "  width: 100%; box-sizing: border-box; border: none; border-radius: 10px;",
      "  padding: 12px 14px; font-size: 15px; font-weight: 600;",
      "  background: rgba(255,255,255,0.12); color: #fff; outline: none;",
      "}",
      ".clan-field textarea { min-height: 100px; resize: vertical; }",
      ".clan-field-banner { grid-column: 1; }",
      ".clan-banner-swatches { display:flex; flex-wrap:wrap; gap: 8px; margin-top: 8px; }",
      ".clan-swatch {",
      "  width: 36px; height: 36px; border-radius: 10px; border: 3px solid transparent; cursor: pointer;",
      "}",
      ".clan-swatch.selected { border-color: #fde68a; box-shadow: 0 0 0 2px #7c3aed; }",
      ".clan-create-actions { display:flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; }",
      ".clan-view-card {",
      "  max-width: 520px; margin: 0 auto; border-radius: 20px; padding: 28px 24px;",
      "  background: linear-gradient(160deg, #3b82f6 0%, #1d4ed8 55%, #1e3a8a 100%);",
      "  box-shadow: 0 12px 40px rgba(0,0,0,0.35); color: #fff; position: relative;",
      "}",
      ".clan-view-top { display:flex; gap: 18px; align-items: flex-start; flex-wrap: wrap; }",
      ".clan-view-photo {",
      "  width: 110px; height: 110px; border-radius: 16px; object-fit: cover;",
      "  background: rgba(0,0,0,0.2); border: 4px solid rgba(255,255,255,0.35);",
      "  box-shadow: 0 4px 16px rgba(0,0,0,0.3);",
      "}",
      ".clan-view-photo.placeholder {",
      "  display:grid; place-items:center; font-size: 28px; font-weight: 900;",
      "  color: #86efac; text-shadow: 0 2px 0 #14532d;",
      "}",
      ".clan-view-meta { flex: 1; min-width: 160px; }",
      ".clan-view-name {",
      "  margin: 0 0 8px; font-size: 28px; font-weight: 900; font-style: italic;",
      "  color: #86efac; text-shadow: 0 2px 0 #14532d, 2px 2px 0 #052e16;",
      "}",
      ".clan-view-level {",
      "  font-size: 22px; font-weight: 900; font-style: italic; color: #bbf7d0;",
      "  text-shadow: 0 2px 0 #14532d;",
      "}",
      ".clan-view-desc {",
      "  margin-top: 18px; font-size: 16px; font-weight: 700; color: #bbf7d0;",
      "  text-shadow: 0 1px 2px rgba(0,0,0,0.35); line-height: 1.45;",
      "}",
      ".clan-view-members { margin-top: 16px; font-size: 13px; opacity: 0.9; }",
      ".clan-back { margin-bottom: 14px; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function ensurePages() {
    var main = document.querySelector("main.content");
    if (!main) return;

    if (!document.getElementById("page-clans")) {
      var sec = document.createElement("section");
      sec.id = "page-clans";
      sec.className = "page";
      sec.innerHTML =
        '<div class="clans-page-head">' +
        '<h1 class="clans-title">Clans</h1>' +
        '<button type="button" class="btn-create-clan" id="btnCreateClan">Create Clans+</button>' +
        "</div>" +
        '<div class="clans-grid" id="clansGrid"></div>';
      main.appendChild(sec);
      var btn = sec.querySelector("#btnCreateClan");
      if (btn) btn.onclick = function () { showCreateClan(); };
    }

    if (!document.getElementById("page-clan-create")) {
      var create = document.createElement("section");
      create.id = "page-clan-create";
      create.className = "page";
      create.innerHTML =
        '<button type="button" class="btn btn-sm btn-ghost clan-back" id="clanCreateBack">← Back to Clans</button>' +
        '<div class="clan-create-wrap">' +
        '<div class="clan-create-grid">' +
        '<div class="clan-field"><label>CLAN-NAME</label><input type="text" id="clanNameInput" maxlength="24" placeholder="Enter clan name" /></div>' +
        '<div class="clan-field"><label>CLAN-DESCRIPTION</label><textarea id="clanDescInput" maxlength="160" placeholder="Describe your clan"></textarea></div>' +
        '<div class="clan-field clan-field-banner"><label>CLAN-BANNER</label>' +
        '<div class="clan-banner-swatches" id="clanBannerSwatches"></div>' +
        '<input type="hidden" id="clanBannerInput" value="#3b82f6" />' +
        "</div>" +
        '<div class="clan-field"><label>PHOTO (optional URL)</label><input type="url" id="clanPhotoInput" placeholder="https://… image link" /></div>' +
        "</div>" +
        '<div class="clan-create-actions">' +
        '<button type="button" class="btn btn-green" id="clanCreateSubmit">Create Clan</button>' +
        '<button type="button" class="btn btn-ghost" id="clanCreateCancel">Cancel</button>' +
        "</div>" +
        '<p class="settings-msg" id="clanCreateMsg" style="margin-top:12px"></p>' +
        "</div>";
      main.appendChild(create);
      create.querySelector("#clanCreateBack").onclick = function () { showPage("clans"); };
      create.querySelector("#clanCreateCancel").onclick = function () { showPage("clans"); };
      create.querySelector("#clanCreateSubmit").onclick = submitCreateClan;
      var sw = create.querySelector("#clanBannerSwatches");
      BANNER_COLORS.forEach(function (c, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "clan-swatch" + (i === 0 ? " selected" : "");
        b.style.background = c;
        b.title = c;
        b.onclick = function () {
          sw.querySelectorAll(".clan-swatch").forEach(function (x) { x.classList.remove("selected"); });
          b.classList.add("selected");
          document.getElementById("clanBannerInput").value = c;
        };
        sw.appendChild(b);
      });
    }

    if (!document.getElementById("page-clan-view")) {
      var view = document.createElement("section");
      view.id = "page-clan-view";
      view.className = "page";
      view.innerHTML =
        '<button type="button" class="btn btn-sm btn-ghost clan-back" id="clanViewBack">← Back to Clans</button>' +
        '<div class="clan-view-card" id="clanViewCard"></div>';
      main.appendChild(view);
      view.querySelector("#clanViewBack").onclick = function () { showPage("clans"); };
    }
  }

  function ensureNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    if (nav.querySelector('[data-page="clans"]')) return;
    var btn = document.createElement("button");
    btn.className = "nav-item";
    btn.setAttribute("data-page", "clans");
    btn.onclick = function () { showPage("clans"); };
    btn.innerHTML = '<span class="nav-ico" aria-hidden="true">🛡️</span><span class="nav-label">Clans</span>';
    var settings = nav.querySelector('[data-page="settings"]');
    if (settings) nav.insertBefore(btn, settings);
    else nav.appendChild(btn);
  }

  function renderClansGrid() {
    ensureCSS();
    ensurePages();
    var grid = document.getElementById("clansGrid");
    if (!grid) return;
    var clans = getClans();
    var list = Object.keys(clans).map(function (k) { return clans[k]; });
    list.sort(function (a, b) {
      return totalPacksForClan(b) - totalPacksForClan(a);
    });

    var html = "";
    if (!list.length) {
      for (var i = 0; i < 3; i++) {
        html += '<div class="clan-slot empty" aria-hidden="true"></div>';
      }
    } else {
      list.forEach(function (c) {
        var packs = totalPacksForClan(c);
        var lvl = clanLevelFromPacks(packs);
        var photo = c.photo
          ? '<img class="clan-slot-photo" src="' + escapeAttr(c.photo) + '" alt="" onerror="this.style.display=\'none\'" />'
          : '<div class="clan-slot-photo" style="display:grid;place-items:center;font-size:28px">🛡️</div>';
        var bg = escapeAttr(c.banner || "#3b82f6");
        html +=
          '<button type="button" class="clan-slot" data-id="' +
          escapeAttr(c.id) +
          '" style="background:linear-gradient(180deg,' + bg + ',#1e3a8a)">' +
          photo +
          '<div class="clan-slot-name">' +
          escapeHtml(c.name) +
          "</div>" +
          '<div class="clan-slot-lvl">Level ' +
          lvl +
          "</div>" +
          "</button>";
      });
      var filled = list.length;
      for (var pi = filled; pi < 3; pi++) {
        html += '<div class="clan-slot empty" aria-hidden="true"></div>';
      }
    }
    grid.innerHTML = html;
    grid.querySelectorAll(".clan-slot[data-id]").forEach(function (el) {
      el.onclick = function () {
        openClanView(el.getAttribute("data-id"));
      };
    });
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function showCreateClan() {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) {
      alert("Log in to create a clan");
      return;
    }
    var d = getData(u);
    if (d.clanId && getClans()[d.clanId]) {
      alert("You are already in a clan. Leave it first to create a new one.");
      openClanView(d.clanId);
      return;
    }
    ensurePages();
    document.getElementById("clanNameInput").value = "";
    document.getElementById("clanDescInput").value = "";
    document.getElementById("clanPhotoInput").value = "";
    document.getElementById("clanBannerInput").value = BANNER_COLORS[0];
    document.getElementById("clanCreateMsg").textContent = "";
    var sw = document.getElementById("clanBannerSwatches");
    if (sw) {
      sw.querySelectorAll(".clan-swatch").forEach(function (x, i) {
        x.classList.toggle("selected", i === 0);
      });
    }
    if (typeof showPage === "function") showPage("clan-create");
    else {
      document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
      document.getElementById("page-clan-create").classList.add("active");
    }
  }

  function submitCreateClan() {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) return;
    var name = (document.getElementById("clanNameInput").value || "").trim();
    var desc = (document.getElementById("clanDescInput").value || "").trim();
    var banner = document.getElementById("clanBannerInput").value || "#3b82f6";
    var photo = (document.getElementById("clanPhotoInput").value || "").trim();
    var msg = document.getElementById("clanCreateMsg");
    if (name.length < 2 || name.length > 24) {
      msg.textContent = "Name must be 2–24 characters";
      msg.className = "settings-msg err";
      return;
    }
    var clans = getClans();
    for (var k in clans) {
      if (clans[k].name.toLowerCase() === name.toLowerCase()) {
        msg.textContent = "That clan name is taken";
        msg.className = "settings-msg err";
        return;
      }
    }
    var d = getData(u);
    if (d.clanId && clans[d.clanId]) {
      msg.textContent = "You already belong to a clan";
      msg.className = "settings-msg err";
      return;
    }
    var id = uid();
    clans[id] = {
      id: id,
      name: name,
      description: desc || "No description",
      banner: banner,
      photo: photo || "",
      owner: u,
      members: [u],
      created: Date.now()
    };
    saveClans(clans);
    d.clanId = id;
    saveData(u, d);
    msg.textContent = "Clan created!";
    msg.className = "settings-msg ok";
    openClanView(id);
  }

  function openClanView(id) {
    ensureCSS();
    ensurePages();
    var clans = getClans();
    var c = clans[id];
    if (!c) {
      alert("Clan not found");
      showPage("clans");
      return;
    }
    var packs = totalPacksForClan(c);
    var lvl = clanLevelFromPacks(packs);
    var card = document.getElementById("clanViewCard");
    var photoHtml = c.photo
      ? '<img class="clan-view-photo" src="' + escapeAttr(c.photo) + '" alt="" onerror="this.outerHTML=\'<div class=clan-view-photo placeholder>PHOTO</div>\'" />'
      : '<div class="clan-view-photo placeholder">PHOTO</div>';
    var u = typeof currentUser === "function" ? currentUser() : "";
    var isMember = (c.members || []).some(function (m) { return m.toLowerCase() === (u || "").toLowerCase(); });
    var isOwner = c.owner && u && c.owner.toLowerCase() === u.toLowerCase();
    var actions = "";
    if (u && !isMember) {
      actions = '<button type="button" class="btn btn-green btn-sm" style="margin-top:14px" id="clanJoinBtn">Join Clan</button>';
    } else if (u && isMember && !isOwner) {
      actions = '<button type="button" class="btn btn-sm btn-danger" style="margin-top:14px" id="clanLeaveBtn">Leave Clan</button>';
    } else if (u && isOwner) {
      actions =
        '<button type="button" class="btn btn-sm btn-danger" style="margin-top:14px" id="clanDisbandBtn">Disband Clan</button>';
    }
    card.style.background =
      "linear-gradient(160deg, " + (c.banner || "#3b82f6") + " 0%, #1d4ed8 55%, #1e3a8a 100%)";
    card.innerHTML =
      '<div class="clan-view-top">' +
      photoHtml +
      '<div class="clan-view-meta">' +
      '<h2 class="clan-view-name">' +
      escapeHtml(c.name) +
      "</h2>" +
      '<div class="clan-view-level">LEVEL ' +
      lvl +
      "</div>" +
      '<div class="clan-view-members">Members: ' +
      (c.members || []).length +
      " · Packs: " +
      packs.toLocaleString() +
      " · Owner: " +
      escapeHtml(c.owner) +
      "</div>" +
      "</div></div>" +
      '<div class="clan-view-desc">' +
      escapeHtml(c.description || "") +
      "</div>" +
      actions;

    if (typeof showPage === "function") showPage("clan-view");
    else {
      document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
      document.getElementById("page-clan-view").classList.add("active");
    }

    var join = document.getElementById("clanJoinBtn");
    if (join) {
      join.onclick = function () {
        var me = currentUser();
        if (!me) return;
        var data = getData(me);
        if (data.clanId && getClans()[data.clanId]) {
          alert("Leave your current clan first");
          return;
        }
        var all = getClans();
        if (!all[id]) return;
        if (all[id].members.indexOf(me) < 0) all[id].members.push(me);
        saveClans(all);
        data.clanId = id;
        saveData(me, data);
        openClanView(id);
      };
    }
    var leave = document.getElementById("clanLeaveBtn");
    if (leave) {
      leave.onclick = function () {
        var me = currentUser();
        if (!me) return;
        var all = getClans();
        if (!all[id]) return;
        all[id].members = (all[id].members || []).filter(function (m) {
          return m.toLowerCase() !== me.toLowerCase();
        });
        saveClans(all);
        var data = getData(me);
        data.clanId = null;
        saveData(me, data);
        showPage("clans");
        renderClansGrid();
      };
    }
    var disband = document.getElementById("clanDisbandBtn");
    if (disband) {
      disband.onclick = function () {
        if (!confirm("Disband this clan? All members will leave.")) return;
        var all = getClans();
        var members = (all[id] && all[id].members) || [];
        members.forEach(function (m) {
          try {
            var data = getData(m);
            if (data.clanId === id) {
              data.clanId = null;
              saveData(m, data);
            }
          } catch (e) {}
        });
        delete all[id];
        saveClans(all);
        showPage("clans");
        renderClansGrid();
      };
    }
  }

  function hookShowPage() {
    var orig = window.showPage;
    if (typeof orig !== "function" || orig._clansHooked) return;
    window.showPage = function (page) {
      ensureCSS();
      ensureNav();
      ensurePages();
      orig.apply(this, arguments);
      if (page === "clans") renderClansGrid();
      if (page === "clan-create" || page === "clan-view") {
        document.querySelectorAll(".nav-item").forEach(function (n) {
          n.classList.toggle("active", n.getAttribute("data-page") === "clans");
        });
      }
    };
    window.showPage._clansHooked = true;
  }

  function patchDefaultData() {
    if (typeof window.defaultData === "function" && !window.defaultData._clanPatched) {
      var prev = window.defaultData;
      window.defaultData = function () {
        var d = prev();
        if (d.clanId === undefined) d.clanId = null;
        return d;
      };
      window.defaultData._clanPatched = true;
    }
  }

  window.openClanView = openClanView;
  window.showCreateClan = showCreateClan;
  window.renderClansGrid = renderClansGrid;

  function boot() {
    ensureCSS();
    ensureNav();
    ensurePages();
    hookShowPage();
    patchDefaultData();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(boot, 30);
      setTimeout(boot, 400);
    });
  } else {
    setTimeout(boot, 30);
    setTimeout(boot, 400);
  }
  setTimeout(hookShowPage, 800);
})();
