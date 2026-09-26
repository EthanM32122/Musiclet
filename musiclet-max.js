/* Musiclet MAX — achievements, daily wheel, friends, news, streaks */
(function () {
  "use strict";

  var NEWS = [
    { t: "Musiclet MAX", d: "Daily Wheel, Achievements, Friends & News are live." },
    { t: "Clans", d: "Create clans — level up from pack opens (100 packs = 1 level)." },
    { t: "Banners", d: "Click your name on Stats to equip a banner strip." },
    { t: "Bazaar", d: "List and buy blooks from other players on this device." }
  ];

  var ACHIEVEMENTS = [
    { id: "first_pack", name: "First Open", desc: "Open 1 pack", check: function (d) { return (d.packsOpened || 0) >= 1; }, reward: 50 },
    { id: "packs_10", name: "Opener", desc: "Open 10 packs", check: function (d) { return (d.packsOpened || 0) >= 10; }, reward: 100 },
    { id: "packs_100", name: "Pack Addict", desc: "Open 100 packs", check: function (d) { return (d.packsOpened || 0) >= 100; }, reward: 500 },
    { id: "packs_500", name: "Machine", desc: "Open 500 packs", check: function (d) { return (d.packsOpened || 0) >= 500; }, reward: 2000 },
    { id: "tokens_5k", name: "Saver", desc: "Hold 5,000 tokens", check: function (d) { return (d.tokens || 0) >= 5000; }, reward: 200 },
    { id: "tokens_25k", name: "Rich", desc: "Hold 25,000 tokens", check: function (d) { return (d.tokens || 0) >= 25000; }, reward: 1000 },
    { id: "blooks_25", name: "Collector", desc: "Own 25 unique blooks", check: function (d) { return Object.keys(d.inventory || {}).length >= 25; }, reward: 300 },
    { id: "blooks_75", name: "Hoarder", desc: "Own 75 unique blooks", check: function (d) { return Object.keys(d.inventory || {}).length >= 75; }, reward: 1500 },
    { id: "streak_3", name: "On Fire", desc: "3-day claim streak", check: function (d) { return (d.claimStreak || 0) >= 3; }, reward: 150 },
    { id: "streak_7", name: "Dedicated", desc: "7-day claim streak", check: function (d) { return (d.claimStreak || 0) >= 7; }, reward: 700 },
    { id: "clan_join", name: "Team Player", desc: "Join or create a clan", check: function (d) { return !!d.clanId; }, reward: 100 },
    { id: "banner_eq", name: "Stylish", desc: "Equip a banner", check: function (d) { return !!d.equippedBanner; }, reward: 75 }
  ];

  function todayKey() {
    var n = new Date();
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
  }
  function yesterdayKey() {
    var n = new Date();
    n.setDate(n.getDate() - 1);
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
  }

  function ensureCSS() {
    if (document.getElementById("ml-max-css")) return;
    var s = document.createElement("style");
    s.id = "ml-max-css";
    s.textContent = [
      ".max-page-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:16px}",
      ".max-title{margin:0;font-size:34px;font-weight:900;font-style:italic;color:#f9a8d4;text-shadow:2px 2px 0 rgba(0,0,0,.35)}",
      ".ach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}",
      ".ach-card{background:rgba(0,0,0,.3);border:2px solid rgba(255,255,255,.12);border-radius:14px;padding:14px;box-shadow:inset 0 -5px rgba(0,0,0,.2)}",
      ".ach-card.done{border-color:#34d399;background:rgba(52,211,153,.12)}",
      ".ach-name{font-weight:900;font-size:15px;color:#fff}",
      ".ach-desc{font-size:12px;color:rgba(255,255,255,.7);margin-top:4px}",
      ".ach-reward{font-size:12px;font-weight:800;color:#fde68a;margin-top:8px}",
      ".ach-badge{display:inline-block;margin-top:8px;font-size:11px;font-weight:800;padding:3px 8px;border-radius:8px;background:#34d399;color:#064e3b}",
      ".friends-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}",
      ".friends-list{display:flex;flex-direction:column;gap:8px;max-width:480px}",
      ".friend-item{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(0,0,0,.28);border-radius:12px;border:2px solid rgba(255,255,255,.1)}",
      ".friend-name{font-weight:800;color:#fff}",
      ".news-list{display:flex;flex-direction:column;gap:12px;max-width:560px}",
      ".news-card{background:rgba(0,0,0,.3);border-radius:14px;padding:16px;border:2px solid rgba(255,255,255,.1);box-shadow:inset 0 -5px rgba(0,0,0,.2)}",
      ".news-card h3{margin:0 0 6px;color:#fde68a;font-size:18px}",
      ".news-card p{margin:0;color:rgba(255,255,255,.85);font-size:14px;line-height:1.45}",
      ".wheel-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px}",
      ".wheel-disc{width:220px;height:220px;border-radius:50%;border:6px solid #fbbf24;background:conic-gradient(#7c3aed 0 25%,#ec4899 0 50%,#22c55e 0 75%,#f59e0b 0 100%);box-shadow:0 0 0 6px rgba(0,0,0,.35),0 12px 40px rgba(0,0,0,.4);position:relative;transition:transform 3s cubic-bezier(.15,.85,.25,1)}",
      ".wheel-disc::after{content:'\25BC';position:absolute;top:-28px;left:50%;transform:translateX(-50%);font-size:22px;color:#fbbf24;text-shadow:0 2px 0 #000}",
      ".wheel-result{font-size:20px;font-weight:900;color:#fde68a;min-height:28px}",
      ".streak-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(251,146,60,.25);border:2px solid #fb923c;color:#ffedd5;font-weight:800;font-size:13px}",
      ".max-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(180deg,#7c3aed,#5b21b6);color:#fff;padding:12px 20px;border-radius:14px;font-weight:800;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.45);animation:maxToastIn .25s ease}",
      "@keyframes maxToastIn{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function toast(msg) {
    var el = document.createElement("div");
    el.className = "max-toast";
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2800);
  }

  function ensurePages() {
    var main = document.querySelector("main.content");
    if (!main) return;

    if (!document.getElementById("page-achievements")) {
      var a = document.createElement("section");
      a.id = "page-achievements";
      a.className = "page";
      a.innerHTML = '<div class="max-page-head"><h1 class="max-title">Achievements</h1></div><div class="ach-grid" id="achGrid"></div>';
      main.appendChild(a);
    }
    if (!document.getElementById("page-friends")) {
      var f = document.createElement("section");
      f.id = "page-friends";
      f.className = "page";
      f.innerHTML =
        '<div class="max-page-head"><h1 class="max-title">Friends</h1></div>' +
        '<div class="friends-row">' +
        '<input type="text" id="friendInput" class="settings-input" placeholder="Username" style="max-width:200px" />' +
        '<button type="button" class="btn btn-green btn-sm" id="friendAddBtn">Add Friend</button>' +
        "</div>" +
        '<div class="friends-list" id="friendsList"></div>';
      main.appendChild(f);
      f.querySelector("#friendAddBtn").onclick = addFriend;
    }
    if (!document.getElementById("page-news")) {
      var n = document.createElement("section");
      n.id = "page-news";
      n.className = "page";
      n.innerHTML = '<div class="max-page-head"><h1 class="max-title">News</h1></div><div class="news-list" id="newsList"></div>';
      main.appendChild(n);
    }
    if (!document.getElementById("page-wheel")) {
      var w = document.createElement("section");
      w.id = "page-wheel";
      w.className = "page";
      w.innerHTML =
        '<div class="max-page-head"><h1 class="max-title">Daily Wheel</h1><span class="streak-pill" id="streakPill">Streak 0</span></div>' +
        '<div class="wheel-wrap">' +
        '<div class="wheel-disc" id="wheelDisc"></div>' +
        '<div class="wheel-result" id="wheelResult">Spin once per day</div>' +
        '<button type="button" class="btn btn-green" id="wheelSpinBtn">SPIN</button>' +
        "</div>";
      main.appendChild(w);
      w.querySelector("#wheelSpinBtn").onclick = spinWheel;
    }
  }

  function ensureNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    function add(page, label, ico, beforePage) {
      if (nav.querySelector('[data-page="' + page + '"]')) return;
      var btn = document.createElement("button");
      btn.className = "nav-item";
      btn.setAttribute("data-page", page);
      btn.onclick = function () { showPage(page); };
      btn.innerHTML = '<span class="nav-ico" aria-hidden="true">' + ico + '</span><span class="nav-label">' + label + "</span>";
      var before = beforePage ? nav.querySelector('[data-page="' + beforePage + '"]') : null;
      if (before) nav.insertBefore(btn, before);
      else nav.appendChild(btn);
    }
    add("wheel", "Daily Wheel", "W", "market");
    add("achievements", "Achievements", "*", "credits");
    add("friends", "Friends", "F", "credits");
    add("news", "News", "N", "settings");
  }

  function renderAchievements() {
    ensureCSS();
    ensurePages();
    var grid = document.getElementById("achGrid");
    if (!grid) return;
    var u = typeof currentUser === "function" ? currentUser() : "";
    var d = u && typeof getData === "function" ? getData(u) : {};
    var unlocked = d.achievements || {};
    grid.innerHTML = "";
    ACHIEVEMENTS.forEach(function (a) {
      var done = !!unlocked[a.id] || a.check(d);
      var card = document.createElement("div");
      card.className = "ach-card" + (done ? " done" : "");
      var name = document.createElement("div");
      name.className = "ach-name";
      name.textContent = a.name;
      var desc = document.createElement("div");
      desc.className = "ach-desc";
      desc.textContent = a.desc;
      var reward = document.createElement("div");
      reward.className = "ach-reward";
      reward.textContent = "+" + a.reward + " tokens";
      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(reward);
      if (done) {
        var badge = document.createElement("span");
        badge.className = "ach-badge";
        badge.textContent = unlocked[a.id] ? "CLAIMED" : "COMPLETE";
        card.appendChild(badge);
      }
      grid.appendChild(card);
    });
  }

  function checkAchievements(silent) {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u || typeof getData !== "function") return;
    var d = getData(u);
    if (!d.achievements) d.achievements = {};
    var gained = 0;
    ACHIEVEMENTS.forEach(function (a) {
      if (d.achievements[a.id]) return;
      if (a.check(d)) {
        d.achievements[a.id] = Date.now();
        d.tokens = (d.tokens || 0) + a.reward;
        gained += a.reward;
        if (!silent) toast("Achievement: " + a.name + " (+" + a.reward + ")");
      }
    });
    if (gained) {
      saveData(u, d);
      if (typeof refreshUI === "function") refreshUI();
    }
  }

  function renderFriends() {
    ensureCSS();
    ensurePages();
    var list = document.getElementById("friendsList");
    if (!list) return;
    var u = typeof currentUser === "function" ? currentUser() : "";
    var d = u && typeof getData === "function" ? getData(u) : {};
    var friends = d.friends || [];
    list.innerHTML = "";
    if (!friends.length) {
      var empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "No friends yet. Add someone by username.";
      list.appendChild(empty);
      return;
    }
    friends.forEach(function (name) {
      var row = document.createElement("div");
      row.className = "friend-item";
      var nm = document.createElement("span");
      nm.className = "friend-name";
      nm.textContent = name;
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "btn btn-sm btn-ghost";
      rm.textContent = "Remove";
      rm.onclick = function () {
        var data = getData(u);
        data.friends = (data.friends || []).filter(function (f) { return f !== name; });
        saveData(u, data);
        renderFriends();
      };
      row.appendChild(nm);
      row.appendChild(rm);
      list.appendChild(row);
    });
  }

  function addFriend() {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) { alert("Log in first"); return; }
    var input = document.getElementById("friendInput");
    var name = (input && input.value || "").trim();
    if (!name) return;
    if (name.toLowerCase() === u.toLowerCase()) { alert("That's you"); return; }
    var users = typeof getUsers === "function" ? getUsers() : {};
    var found = null;
    Object.keys(users).forEach(function (k) {
      var un = users[k].username || k;
      if (un.toLowerCase() === name.toLowerCase()) found = un;
    });
    if (!found) { alert("User not found on this device"); return; }
    var d = getData(u);
    if (!d.friends) d.friends = [];
    if (d.friends.some(function (f) { return f.toLowerCase() === found.toLowerCase(); })) {
      alert("Already friends");
      return;
    }
    d.friends.push(found);
    saveData(u, d);
    if (input) input.value = "";
    renderFriends();
    toast("Added " + found);
  }

  function renderNews() {
    ensureCSS();
    ensurePages();
    var list = document.getElementById("newsList");
    if (!list) return;
    list.innerHTML = "";
    NEWS.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "news-card";
      var h = document.createElement("h3");
      h.textContent = item.t;
      var p = document.createElement("p");
      p.textContent = item.d;
      card.appendChild(h);
      card.appendChild(p);
      list.appendChild(card);
    });
  }

  var WHEEL_PRIZES = [100, 250, 500, 750, 1000, 1500, 200, 400];

  function updateStreakPill() {
    var pill = document.getElementById("streakPill");
    if (!pill) return;
    var u = typeof currentUser === "function" ? currentUser() : "";
    var d = u && typeof getData === "function" ? getData(u) : {};
    pill.textContent = "Streak " + (d.claimStreak || 0);
  }

  function spinWheel() {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) { alert("Log in to spin"); return; }
    var d = getData(u);
    var day = todayKey();
    if (d.lastClaim === day || d.lastWheel === day) {
      document.getElementById("wheelResult").textContent = "Already claimed today — come back tomorrow!";
      return;
    }
    var btn = document.getElementById("wheelSpinBtn");
    var disc = document.getElementById("wheelDisc");
    if (btn) btn.disabled = true;
    var prize = WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
    var turns = 4 + Math.floor(Math.random() * 3);
    var angle = turns * 360 + Math.floor(Math.random() * 360);
    if (disc) disc.style.transform = "rotate(" + angle + "deg)";
    setTimeout(function () {
      if (d.lastClaim === yesterdayKey() || d.lastWheel === yesterdayKey()) {
        d.claimStreak = (d.claimStreak || 0) + 1;
      } else {
        d.claimStreak = 1;
      }
      d.lastClaim = day;
      d.lastWheel = day;
      d.tokens = (d.tokens || 0) + prize;
      var bonus = Math.min(200, (d.claimStreak - 1) * 25);
      if (bonus > 0) d.tokens += bonus;
      saveData(u, d);
      var msg = "+" + prize + " tokens!";
      if (bonus) msg += " (+" + bonus + " streak bonus)";
      document.getElementById("wheelResult").textContent = msg;
      toast(msg);
      if (typeof refreshUI === "function") refreshUI();
      checkAchievements(false);
      updateStreakPill();
      if (btn) btn.disabled = false;
    }, 3200);
  }

  function enhanceClaimButton() {
    var claim = document.getElementById("claimBtn");
    if (!claim || claim.dataset.maxHooked === "1") return;
    claim.dataset.maxHooked = "1";
    claim.textContent = "Daily Wheel";
    claim.onclick = function () {
      if (typeof showPage === "function") showPage("wheel");
    };
  }

  function hookShowPage() {
    var orig = window.showPage;
    if (typeof orig !== "function" || orig._maxHooked) return;
    window.showPage = function (page) {
      ensurePages();
      ensureNav();
      if (page === "achievements") renderAchievements();
      if (page === "friends") renderFriends();
      if (page === "news") renderNews();
      if (page === "wheel") {
        updateStreakPill();
        var u = typeof currentUser === "function" ? currentUser() : "";
        var d = u && getData(u);
        var day = todayKey();
        var res = document.getElementById("wheelResult");
        if (res && d && (d.lastWheel === day || d.lastClaim === day)) {
          res.textContent = "Already spun today. Streak: " + (d.claimStreak || 0);
        }
      }
      orig.apply(this, arguments);
      var extra = ["achievements", "friends", "news", "wheel"];
      if (extra.indexOf(page) >= 0) {
        document.querySelectorAll(".page").forEach(function (p) { p.classList.remove("active"); });
        var el = document.getElementById("page-" + page);
        if (el) el.classList.add("active");
        document.querySelectorAll(".nav-item").forEach(function (n) {
          n.classList.toggle("active", n.getAttribute("data-page") === page);
        });
      }
    };
    window.showPage._maxHooked = true;
  }

  function hookRefresh() {
    var orig = window.refreshUI;
    if (typeof orig !== "function" || orig._maxAchHooked) return;
    var wrapped = function () {
      orig.apply(this, arguments);
      try {
        checkAchievements(true);
        enhanceClaimButton();
      } catch (e) {}
    };
    wrapped._maxAchHooked = true;
    window.refreshUI = wrapped;
  }

  function boot() {
    ensureCSS();
    ensurePages();
    ensureNav();
    hookShowPage();
    hookRefresh();
    enhanceClaimButton();
    setTimeout(function () { checkAchievements(true); }, 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(boot, 50);
      setTimeout(boot, 600);
    });
  } else {
    setTimeout(boot, 50);
    setTimeout(boot, 600);
  }
})();
