/* Musiclet Banners — click username rectangle on Stats to equip */
(function () {
  "use strict";

  var BANNERS = [
    { id: "pencil", name: "Pencil", emoji: "✏️" },
    { id: "glue", name: "Glue", emoji: "🧴" },
    { id: "trumpet", name: "Trumpet", emoji: "🎺" },
    { id: "piano", name: "Piano", emoji: "🎹" },
    { id: "hamburger", name: "Hamburger", emoji: "🍔" },
    { id: "hotdog", name: "Hotdog", emoji: "🌭" },
    { id: "burrito", name: "Burrito", emoji: "🌯" },
    { id: "taco", name: "Taco", emoji: "🌮" },
    { id: "sushi", name: "Sushi", emoji: "🍣" },
    { id: "gordita", name: "Gordita", emoji: "🫓" },
    { id: "steak", name: "Steak", emoji: "🥩" },
    { id: "sandwich", name: "Sandwich", emoji: "🥪" },
    { id: "fries", name: "Fries", emoji: "🍟" },
    { id: "quesadilla", name: "Quesadilla", emoji: "🧀" }
  ];
  var byId = {};
  BANNERS.forEach(function (b) { byId[b.id] = b; });

  function ensureCSS() {
    if (document.getElementById("ml-banner-css")) return;
    var s = document.createElement("style");
    s.id = "ml-banner-css";
    s.textContent = [
      ".blacket-name-box, #bannerNameBox {",
      "  position: relative !important;",
      "  display: inline-flex !important;",
      "  flex-direction: column !important;",
      "  align-items: flex-start !important;",
      "  justify-content: center !important;",
      "  min-width: 150px !important;",
      "  min-height: 56px !important;",
      "  padding: 10px 16px 10px 52px !important;",
      "  background: rgba(0,0,0,0.28) !important;",
      "  border-radius: 12px !important;",
      "  cursor: pointer !important;",
      "  overflow: hidden !important;",
      "  border: 2px solid transparent !important;",
      "  color: #fff !important;",
      "  text-align: left !important;",
      "  transition: border-color 0.15s, background 0.15s !important;",
      "  pointer-events: auto !important;",
      "  z-index: 2 !important;",
      "}",
      ".blacket-name-box:hover, #bannerNameBox:hover {",
      "  border-color: rgba(251,191,36,0.7) !important;",
      "  background: rgba(0,0,0,0.38) !important;",
      "}",
      ".blacket-name-box .banner-behind, #statsBannerBehind {",
      "  position: absolute !important;",
      "  left: 8px !important;",
      "  top: 50% !important;",
      "  transform: translateY(-50%) !important;",
      "  width: 36px !important;",
      "  height: 36px !important;",
      "  display: grid !important;",
      "  place-items: center !important;",
      "  font-size: 28px !important;",
      "  line-height: 1 !important;",
      "  pointer-events: none !important;",
      "  z-index: 0 !important;",
      "}",
      ".blacket-name-box .blacket-username,",
      ".blacket-name-box .blacket-sub {",
      "  position: relative !important;",
      "  z-index: 1 !important;",
      "  pointer-events: none !important;",
      "}",
      "#bannersModal.modal-bg.open { display: flex !important; z-index: 1200 !important; }",
      ".banners-modal {",
      "  max-width: 420px; width: 94%;",
      "  background: linear-gradient(180deg, #3b1a7a 0%, #2a1060 100%);",
      "  border: 3px solid #c084fc; border-radius: 20px;",
      "  box-shadow: 0 0 0 4px #7c3aed, 0 16px 48px rgba(0,0,0,0.5);",
      "  padding: 18px 18px 16px; color: #fff;",
      "}",
      ".banners-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }",
      ".banners-title { margin:0; font-size:26px; font-weight:900; font-style:italic; letter-spacing:0.04em;",
      "  background:linear-gradient(180deg,#fde68a,#f472b6 55%,#c084fc);",
      "  -webkit-background-clip:text; background-clip:text; color:transparent; }",
      ".banners-close { background:rgba(255,255,255,0.15); border:none; color:#fff; font-size:26px;",
      "  width:36px; height:36px; border-radius:10px; cursor:pointer; line-height:1; }",
      ".banners-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px;",
      "  max-height:min(55vh,380px); overflow-y:auto; padding:4px 2px 8px; }",
      ".banner-slot { aspect-ratio:1; border-radius:14px; border:3px solid transparent;",
      "  background:rgba(255,255,255,0.1); cursor:pointer; display:flex; flex-direction:column;",
      "  align-items:center; justify-content:center; gap:4px; padding:8px; position:relative;",
      "  color:#fff; font-size:11px; font-weight:700; }",
      ".banner-slot .banner-emoji { font-size:36px; line-height:1; }",
      ".banner-slot:hover { background:rgba(255,255,255,0.18); border-color:rgba(192,132,252,0.6); }",
      ".banner-slot.selected { border-color:#fbbf24; background:rgba(251,191,36,0.2); }",
      ".banner-slot .eq-tag { position:absolute; bottom:4px; right:4px; background:#fbbf24; color:#1a1a2e;",
      "  font-size:10px; font-weight:800; padding:2px 5px; border-radius:6px; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function ensureModal() {
    var m = document.getElementById("bannersModal");
    if (!m) {
      m = document.createElement("div");
      m.className = "modal-bg";
      m.id = "bannersModal";
      m.innerHTML =
        '<div class="modal banners-modal">' +
        '<div class="banners-modal-header">' +
        '<h2 class="banners-title">BANNERS</h2>' +
        '<button type="button" class="banners-close" aria-label="Close">&times;</button>' +
        "</div>" +
        '<div class="banners-grid" id="bannersGrid"></div>' +
        '<button type="button" class="btn btn-sm btn-ghost full" id="bannerRemoveBtn" style="margin-top:12px">Remove banner</button>' +
        '<button type="button" class="btn btn-sm btn-ghost full" id="bannerCloseBtn" style="margin-top:8px">Close</button>' +
        "</div>";
      document.body.appendChild(m);
    }
    if (m.dataset.bannerBound === "1") return m;
    m.dataset.bannerBound = "1";
    m.addEventListener("click", function (e) {
      if (e.target === m) closeBannersModal();
    });
    var closeBtn = m.querySelector(".banners-close");
    if (closeBtn) closeBtn.onclick = function (e) { e.preventDefault(); closeBannersModal(); };
    var close2 = m.querySelector("#bannerCloseBtn");
    if (close2) close2.onclick = function (e) { e.preventDefault(); closeBannersModal(); };
    var rem = m.querySelector("#bannerRemoveBtn");
    if (rem) rem.onclick = function (e) { e.preventDefault(); unequipBanner(); };
    return m;
  }

  function getNameBox() {
    return (
      document.getElementById("bannerNameBox") ||
      document.getElementById("bannerNameBtn") ||
      document.querySelector("#page-stats .blacket-name-box") ||
      document.querySelector(".blacket-name-box")
    );
  }

  function wireNameBox() {
    var box = getNameBox();
    if (!box) return null;
    if (!document.getElementById("statsBannerBehind")) {
      var behind = document.createElement("div");
      behind.className = "banner-behind";
      behind.id = "statsBannerBehind";
      box.insertBefore(behind, box.firstChild);
    }
    box.setAttribute("title", "Change banner");
    box.setAttribute("role", "button");
    box.style.cursor = "pointer";
    box.style.pointerEvents = "auto";
    if (box.dataset.bannerWired === "1") return box;
    box.dataset.bannerWired = "1";
    box.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        openBannersModal();
      },
      true
    );
    return box;
  }

  function openBannersModal() {
    ensureCSS();
    var m = ensureModal();
    wireNameBox();
    var u = typeof currentUser === "function" ? currentUser() : "";
    var d = u && typeof getData === "function" ? getData(u) : { equippedBanner: null };
    var grid = document.getElementById("bannersGrid");
    if (!grid) {
      console.warn("[banners] grid missing");
      return;
    }
    grid.innerHTML = BANNERS.map(function (b) {
      var on = d.equippedBanner === b.id;
      return (
        '<button type="button" class="banner-slot' +
        (on ? " selected" : "") +
        '" data-id="' +
        b.id +
        '" title="' +
        b.name +
        '">' +
        '<span class="banner-emoji">' +
        b.emoji +
        "</span>" +
        "<span>" +
        b.name +
        "</span>" +
        (on ? '<span class="eq-tag">✓</span>' : "") +
        "</button>"
      );
    }).join("");
    grid.querySelectorAll(".banner-slot").forEach(function (btn) {
      btn.onclick = function () {
        equipBanner(btn.getAttribute("data-id"));
      };
    });
    m.classList.add("open");
  }

  function closeBannersModal() {
    var m = document.getElementById("bannersModal");
    if (m) m.classList.remove("open");
  }

  function equipBanner(id) {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u || !byId[id]) return;
    var d = getData(u);
    d.equippedBanner = id;
    saveData(u, d);
    updateBannerDisplay(u);
    closeBannersModal();
  }

  function unequipBanner() {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) return;
    var d = getData(u);
    d.equippedBanner = null;
    saveData(u, d);
    updateBannerDisplay(u);
    closeBannersModal();
  }

  function updateBannerDisplay(username) {
    var u = username || (typeof currentUser === "function" ? currentUser() : "");
    if (!u) return;
    wireNameBox();
    var d = typeof getData === "function" ? getData(u) : {};
    var el = document.getElementById("statsBannerBehind");
    if (!el) return;
    if (d.equippedBanner && byId[d.equippedBanner]) {
      el.textContent = byId[d.equippedBanner].emoji;
    } else {
      el.textContent = "";
    }
  }

  window.openBannersModal = openBannersModal;
  window.closeBannersModal = closeBannersModal;
  window.equipBanner = equipBanner;
  window.unequipBanner = unequipBanner;
  window.updateBannerDisplay = updateBannerDisplay;

  function init() {
    ensureCSS();
    ensureModal();
    wireNameBox();
    try { updateBannerDisplay(); } catch (e) {}
  }

  function boot() {
    init();
    setTimeout(init, 100);
    setTimeout(init, 500);
    setTimeout(init, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function hookRefresh() {
    var orig = window.refreshUI;
    if (typeof orig === "function" && !orig._bannerHooked) {
      var wrapped = function () {
        orig.apply(this, arguments);
        try { init(); } catch (e) {}
      };
      wrapped._bannerHooked = true;
      window.refreshUI = wrapped;
    }
  }
  setTimeout(hookRefresh, 50);
  setTimeout(hookRefresh, 300);
  setTimeout(hookRefresh, 1200);
})();
