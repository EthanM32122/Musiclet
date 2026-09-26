/* Musiclet Leaderboard — Tokens / Packs / Level rankings */
(function () {
  "use strict";

  var mode = "tokens";

  function ensureCSS() {
    if (document.getElementById("ml-lb-css")) return;
    var s = document.createElement("style");
    s.id = "ml-lb-css";
    s.textContent = [
      ".lb-page-head { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:18px; }",
      ".lb-title { margin:0; font-size:36px; font-weight:900; font-style:italic; color:#fde68a;",
      "  text-shadow: 0 2px 0 #78350f, 3px 3px 0 rgba(0,0,0,0.35); }",
      ".lb-tabs { display:flex; gap:8px; flex-wrap:wrap; }",
      ".lb-tab { border:none; cursor:pointer; padding:8px 16px; border-radius:10px; font-weight:800; font-size:14px;",
      "  background:rgba(255,255,255,0.12); color:#fff; transition: background 0.12s, transform 0.12s; }",
      ".lb-tab:hover { background:rgba(255,255,255,0.2); }",
      ".lb-tab.active { background:linear-gradient(180deg,#fbbf24,#f59e0b); color:#1a1a2e; }",
      ".lb-list { display:flex; flex-direction:column; gap:10px; max-width:640px; }",
      ".lb-row { display:flex; align-items:center; gap:14px; padding:12px 16px; border-radius:14px;",
      "  background:rgba(0,0,0,0.28); border:2px solid rgba(255,255,255,0.12); }",
      ".lb-row.me { border-color:#fbbf24; background:rgba(251,191,36,0.15); }",
      ".lb-rank { width:36px; height:36px; border-radius:10px; display:grid; place-items:center;",
      "  font-weight:900; font-size:15px; background:rgba(255,255,255,0.12); color:#fff; flex-shrink:0; }",
      ".lb-rank.gold { background:linear-gradient(180deg,#fde68a,#f59e0b); color:#1a1a2e; }",
      ".lb-rank.silver { background:linear-gradient(180deg,#e2e8f0,#94a3b8); color:#1a1a2e; }",
      ".lb-rank.bronze { background:linear-gradient(180deg,#fdba74,#c2410c); color:#fff; }",
      ".lb-name { flex:1; font-weight:800; font-size:16px; color:#fff; }",
      ".lb-value { font-weight:900; font-size:15px; color:#fde68a; }",
      ".lb-empty { color:rgba(255,255,255,0.7); padding:24px; text-align:center; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function ensurePage() {
    var main = document.querySelector("main.content");
    if (!main || document.getElementById("page-leaderboard")) return;
    var sec = document.createElement("section");
    sec.id = "page-leaderboard";
    sec.className = "page";
    sec.innerHTML =
      '<div class="lb-page-head">' +
      '<h1 class="lb-title">Leaderboard</h1>' +
      '<div class="lb-tabs">' +
      '<button type="button" class="lb-tab active" data-mode="tokens">Tokens</button>' +
      '<button type="button" class="lb-tab" data-mode="packs">Packs</button>' +
      '<button type="button" class="lb-tab" data-mode="level">Level</button>' +
      "</div></div>" +
      '<div class="lb-list" id="lbList"></div>';
    main.appendChild(sec);
    sec.querySelectorAll(".lb-tab").forEach(function (btn) {
      btn.onclick = function () {
        mode = btn.getAttribute("data-mode");
        sec.querySelectorAll(".lb-tab").forEach(function (t) {
          t.classList.toggle("active", t === btn);
        });
        renderLeaderboard();
      };
    });
  }

  function allPlayers() {
    var users = typeof getUsers === "function" ? getUsers() : {};
    var list = [];
    Object.keys(users).forEach(function (key) {
      var name = users[key].username || key;
      var d = typeof getData === "function" ? getData(name) : {};
      var exp = Number(d.exp || 0);
      var lvl = typeof levelForExp === "function" ? levelForExp(exp) : Math.floor(Math.sqrt(exp / 100)) + 1;
      list.push({
        name: name,
        tokens: Number(d.tokens || 0),
        packs: Number(d.packsOpened || 0),
        level: lvl,
        exp: exp
      });
    });
    return list;
  }

  function renderLeaderboard() {
    ensureCSS();
    ensurePage();
    var listEl = document.getElementById("lbList");
    if (!listEl) return;
    var players = allPlayers();
    var sortKey = mode === "packs" ? "packs" : mode === "level" ? "level" : "tokens";
    players.sort(function (a, b) {
      if (b[sortKey] !== a[sortKey]) return b[sortKey] - a[sortKey];
      return b.exp - a.exp;
    });
    var me = typeof currentUser === "function" ? currentUser() : "";
    if (!players.length) {
      listEl.innerHTML = '<div class="lb-empty">No players yet. Register and play!</div>';
      return;
    }
    listEl.innerHTML = "";
    players.slice(0, 50).forEach(function (p, i) {
      var row = document.createElement("div");
      row.className = "lb-row" + (me && p.name.toLowerCase() === me.toLowerCase() ? " me" : "");
      var rank = document.createElement("div");
      rank.className = "lb-rank" + (i === 0 ? " gold" : i === 1 ? " silver" : i === 2 ? " bronze" : "");
      rank.textContent = String(i + 1);
      var name = document.createElement("div");
      name.className = "lb-name";
      name.textContent = p.name;
      var val = document.createElement("div");
      val.className = "lb-value";
      if (mode === "tokens") val.textContent = p.tokens.toLocaleString() + " tokens";
      else if (mode === "packs") val.textContent = p.packs.toLocaleString() + " packs";
      else val.textContent = "Lvl " + p.level;
      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(val);
      listEl.appendChild(row);
    });
  }

  function hookShowPage() {
    var orig = window.showPage;
    if (typeof orig !== "function" || orig._lbHooked) return;
    window.showPage = function (page) {
      ensurePage();
      if (page === "leaderboard") renderLeaderboard();
      orig.apply(this, arguments);
    };
    window.showPage._lbHooked = true;
  }

  function boot() {
    ensureCSS();
    ensurePage();
    hookShowPage();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(boot, 40);
      setTimeout(boot, 500);
    });
  } else {
    setTimeout(boot, 40);
    setTimeout(boot, 500);
  }
  window.renderLeaderboard = renderLeaderboard;
})();
