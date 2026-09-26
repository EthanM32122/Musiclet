/* Musiclet Banners — whole name box becomes the banner (Blooket-style) */
(function () {
  "use strict";

  function strip(bg, fg, iconPath) {
    return (
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">' +
          '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="' + bg[0] + '"/>' +
          '<stop offset="100%" stop-color="' + bg[1] + '"/>' +
          "</linearGradient></defs>" +
          '<rect width="320" height="80" rx="12" fill="url(#g)"/>' +
          '<g transform="translate(12,12)" fill="' + fg + '" stroke="#1a1a2e" stroke-width="1.5" stroke-linejoin="round">' +
          iconPath +
          "</g>" +
          '<rect x="0" y="0" width="320" height="80" rx="12" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="3"/>' +
          "</svg>"
      )
    );
  }

  var BANNERS = [
    { id: "pencil", name: "Pencil", src: strip(["#fde68a", "#f59e0b"], "#fbbf24", '<rect x="8" y="8" width="12" height="48" rx="2" fill="#fcd34d"/><polygon points="14,4 20,10 8,10" fill="#ef4444"/><rect x="8" y="52" width="12" height="8" fill="#1e293b"/>') },
    { id: "glue", name: "Glue", src: strip(["#bbf7d0", "#22c55e"], "#86efac", '<rect x="10" y="18" width="22" height="36" rx="4" fill="#4ade80"/><rect x="14" y="8" width="14" height="12" rx="2" fill="#fff"/><rect x="16" y="4" width="10" height="6" fill="#ef4444"/>') },
    { id: "trumpet", name: "Trumpet", src: strip(["#fde047", "#eab308"], "#facc15", '<ellipse cx="12" cy="28" rx="10" ry="14" fill="#fbbf24"/><rect x="12" y="22" width="36" height="12" rx="3" fill="#f59e0b"/><circle cx="52" cy="28" r="8" fill="#fde047"/>') },
    { id: "piano", name: "Piano", src: strip(["#e2e8f0", "#64748b"], "#f8fafc", '<rect x="4" y="16" width="48" height="32" rx="3" fill="#1e293b"/><rect x="8" y="20" width="6" height="20" fill="#fff"/><rect x="16" y="20" width="6" height="20" fill="#fff"/><rect x="24" y="20" width="6" height="20" fill="#fff"/><rect x="32" y="20" width="6" height="20" fill="#fff"/><rect x="40" y="20" width="6" height="20" fill="#fff"/><rect x="12" y="20" width="5" height="12" fill="#0f172a"/><rect x="20" y="20" width="5" height="12" fill="#0f172a"/><rect x="28" y="20" width="5" height="12" fill="#0f172a"/><rect x="36" y="20" width="5" height="12" fill="#0f172a"/>') },
    { id: "hamburger", name: "Hamburger", src: strip(["#fdba74", "#ea580c"], "#fb923c", '<ellipse cx="28" cy="22" rx="22" ry="10" fill="#f59e0b"/><rect x="6" y="28" width="44" height="8" rx="2" fill="#22c55e"/><rect x="6" y="36" width="44" height="8" rx="2" fill="#78350f"/><ellipse cx="28" cy="50" rx="22" ry="10" fill="#d97706"/>') },
    { id: "hotdog", name: "Hotdog", src: strip(["#fecdd3", "#f43f5e"], "#fb7185", '<ellipse cx="28" cy="36" rx="26" ry="12" fill="#fbbf24"/><ellipse cx="28" cy="36" rx="20" ry="8" fill="#ef4444"/>') },
    { id: "burrito", name: "Burrito", src: strip(["#fde68a", "#ca8a04"], "#facc15", '<ellipse cx="28" cy="36" rx="24" ry="18" fill="#eab308"/><path d="M12 28 Q28 18 44 28" fill="none" stroke="#78350f" stroke-width="3"/><path d="M14 36 Q28 28 42 36" fill="none" stroke="#78350f" stroke-width="2"/>') },
    { id: "taco", name: "Taco", src: strip(["#fef08a", "#eab308"], "#fde047", '<path d="M8 48 Q28 8 48 48 Z" fill="#fbbf24"/><path d="M14 44 Q28 18 42 44" fill="#22c55e"/><circle cx="22" cy="36" r="3" fill="#ef4444"/><circle cx="34" cy="34" r="3" fill="#ef4444"/>') },
    { id: "sushi", name: "Sushi", src: strip(["#fecaca", "#f87171"], "#fca5a5", '<ellipse cx="20" cy="36" rx="14" ry="16" fill="#fff"/><ellipse cx="20" cy="36" rx="8" ry="10" fill="#ef4444"/><ellipse cx="42" cy="36" rx="14" ry="16" fill="#fff"/><ellipse cx="42" cy="36" rx="8" ry="10" fill="#f97316"/>') },
    { id: "gordita", name: "Gordita", src: strip(["#fed7aa", "#c2410c"], "#fdba74", '<ellipse cx="28" cy="36" rx="26" ry="20" fill="#f59e0b"/><ellipse cx="28" cy="36" rx="18" ry="12" fill="#fef3c7"/><circle cx="20" cy="34" r="3" fill="#22c55e"/><circle cx="32" cy="38" r="3" fill="#ef4444"/>') },
    { id: "steak", name: "Steak", src: strip(["#fca5a5", "#b91c1c"], "#f87171", '<ellipse cx="28" cy="36" rx="24" ry="18" fill="#dc2626"/><ellipse cx="22" cy="32" rx="8" ry="6" fill="#fecaca"/><path d="M14 40 Q28 48 42 36" fill="none" stroke="#7f1d1d" stroke-width="2"/>') },
    { id: "sandwich", name: "Sandwich", src: strip(["#fde68a", "#d97706"], "#fbbf24", '<rect x="6" y="18" width="44" height="10" rx="3" fill="#f59e0b"/><rect x="8" y="28" width="40" height="8" fill="#22c55e"/><rect x="8" y="36" width="40" height="8" fill="#ef4444"/><rect x="6" y="44" width="44" height="10" rx="3" fill="#d97706"/>') },
    { id: "fries", name: "Fries", src: strip(["#fef08a", "#eab308"], "#facc15", '<rect x="12" y="36" width="32" height="22" rx="3" fill="#ef4444"/><rect x="16" y="12" width="6" height="28" rx="2" fill="#fbbf24"/><rect x="25" y="8" width="6" height="32" rx="2" fill="#f59e0b"/><rect x="34" y="14" width="6" height="26" rx="2" fill="#fbbf24"/>') },
    { id: "quesadilla", name: "Quesadilla", src: strip(["#fde68a", "#ca8a04"], "#facc15", '<path d="M8 48 L28 12 L48 48 Z" fill="#fbbf24"/><path d="M14 44 L28 20 L42 44 Z" fill="#fef08a"/><circle cx="24" cy="36" r="2.5" fill="#f97316"/><circle cx="32" cy="38" r="2.5" fill="#22c55e"/>') }
  ];

  var byId = {};
  BANNERS.forEach(function (b) { byId[b.id] = b; });

  function ensureCSS() {
    if (document.getElementById("ml-banner-css")) return;
    var s = document.createElement("style");
    s.id = "ml-banner-css";
    s.textContent = [
      ".blacket-name-box, #bannerNameBox, .blacket-name-box.banner-clickable {",
      "  position: relative !important;",
      "  display: inline-flex !important;",
      "  flex-direction: column !important;",
      "  align-items: flex-start !important;",
      "  justify-content: center !important;",
      "  min-width: 168px !important;",
      "  min-height: 58px !important;",
      "  padding: 10px 18px !important;",
      "  border-radius: 14px !important;",
      "  cursor: pointer !important;",
      "  overflow: hidden !important;",
      "  border: 2px solid rgba(255,255,255,0.25) !important;",
      "  color: #fff !important;",
      "  text-align: left !important;",
      "  background-color: rgba(0,0,0,0.28) !important;",
      "  background-size: cover !important;",
      "  background-position: center !important;",
      "  background-repeat: no-repeat !important;",
      "  box-shadow: 0 4px 12px rgba(0,0,0,0.25) !important;",
      "  transition: filter 0.12s, transform 0.12s !important;",
      "  pointer-events: auto !important;",
      "  z-index: 2 !important;",
      "}",
      ".blacket-name-box:hover, #bannerNameBox:hover {",
      "  filter: brightness(1.08) !important;",
      "  transform: translateY(-1px) !important;",
      "  border-color: rgba(251,191,36,0.75) !important;",
      "}",
      ".blacket-name-box.has-banner { border-color: rgba(255,255,255,0.35) !important; }",
      ".blacket-name-box.has-banner::before {",
      "  content: '' !important; position: absolute !important; inset: 0 !important;",
      "  background: linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.15) 100%) !important;",
      "  pointer-events: none !important; z-index: 0 !important;",
      "}",
      ".banner-behind, #statsBannerBehind { display: none !important; }",
      ".blacket-name-box .blacket-username, .blacket-name-box .blacket-sub {",
      "  position: relative !important; z-index: 1 !important;",
      "  text-shadow: 0 2px 4px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.5) !important;",
      "}",
      ".blacket-name-box .blacket-username { font-size: 20px !important; font-weight: 900 !important; color: #fff !important; }",
      ".blacket-name-box .blacket-sub { font-size: 13px !important; font-weight: 700 !important; color: rgba(255,255,255,0.92) !important; }",
      ".banners-modal { max-width: 440px; width: 94%; background: linear-gradient(180deg, #3b1a7a 0%, #2a1060 100%); border: 3px solid #c084fc; border-radius: 20px; box-shadow: 0 0 0 4px #7c3aed, 0 12px 40px rgba(0,0,0,0.45); padding: 16px 18px 18px; }",
      ".banners-title { margin:0; font-size:28px; font-weight:900; font-style:italic; background: linear-gradient(180deg, #fde68a, #f472b6 60%, #c084fc); -webkit-background-clip: text; background-clip: text; color: transparent; }",
      ".banners-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: min(55vh, 380px); overflow-y: auto; padding: 4px 2px 8px; }",
      ".banner-slot { border-radius: 12px; border: 3px solid transparent; cursor: pointer; overflow: hidden; position: relative; height: 56px; padding: 0; background-size: cover; background-position: center; background-repeat: no-repeat; transition: transform 0.12s, border-color 0.12s; }",
      ".banner-slot:hover { transform: translateY(-2px); border-color: rgba(192,132,252,0.7); }",
      ".banner-slot.selected { border-color: #fbbf24; box-shadow: 0 0 0 2px rgba(251,191,36,0.4); }",
      ".banner-slot .banner-label { position: absolute; left: 0; right: 0; bottom: 0; padding: 4px 6px; font-size: 11px; font-weight: 800; color: #fff; text-align: center; background: linear-gradient(transparent, rgba(0,0,0,0.75)); text-shadow: 0 1px 2px #000; }",
      ".banner-slot .eq-tag { position: absolute; top: 4px; right: 4px; background: #fbbf24; color: #1a1a2e; font-size: 10px; font-weight: 800; padding: 2px 5px; border-radius: 6px; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function ensureModal() {
    var m = document.getElementById("bannersModal");
    if (!m) {
      m = document.createElement("div");
      m.id = "bannersModal";
      m.className = "modal-bg";
      m.innerHTML =
        '<div class="modal banners-modal">' +
        '<div class="banners-modal-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">' +
        '<h2 class="banners-title">BANNERS</h2>' +
        '<button type="button" class="banners-close" aria-label="Close" style="background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:24px;width:36px;height:36px;border-radius:10px;cursor:pointer">&times;</button>' +
        "</div>" +
        '<div class="banners-grid" id="bannersGrid"></div>' +
        '<button type="button" class="btn btn-sm btn-ghost full" id="bannerRemoveBtn" style="margin-top:12px">Remove banner</button>' +
        '<button type="button" class="btn btn-sm btn-ghost full" id="bannerCloseBtn" style="margin-top:8px">Close</button>' +
        "</div>";
      document.body.appendChild(m);
    }
    if (m.dataset.bannerBound === "1") return m;
    m.dataset.bannerBound = "1";
    m.addEventListener("click", function (e) { if (e.target === m) closeBannersModal(); });
    var closeBtn = m.querySelector(".banners-close");
    if (closeBtn) closeBtn.onclick = function (e) { e.preventDefault(); closeBannersModal(); };
    var close2 = m.querySelector("#bannerCloseBtn");
    if (close2) close2.onclick = function (e) { e.preventDefault(); closeBannersModal(); };
    var rem = m.querySelector("#bannerRemoveBtn");
    if (rem) rem.onclick = function (e) { e.preventDefault(); unequipBanner(); };
    return m;
  }

  function wireNameBox() {
    var box =
      document.getElementById("bannerNameBox") ||
      document.getElementById("bannerNameBtn") ||
      document.querySelector("#page-stats .blacket-name-box") ||
      document.querySelector(".blacket-name-box");
    if (!box) return null;
    box.classList.add("banner-clickable");
    box.setAttribute("title", "Change banner");
    box.setAttribute("role", "button");
    box.style.cursor = "pointer";
    box.style.pointerEvents = "auto";
    if (box.dataset.bannerWired === "1") return box;
    box.dataset.bannerWired = "1";
    box.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openBannersModal();
    }, true);
    return box;
  }

  function openBannersModal() {
    ensureCSS();
    var m = ensureModal();
    wireNameBox();
    var u = typeof currentUser === "function" ? currentUser() : "";
    var d = u && typeof getData === "function" ? getData(u) : { equippedBanner: null };
    var grid = document.getElementById("bannersGrid");
    if (!grid) return;
    grid.innerHTML = "";
    BANNERS.forEach(function (b) {
      var on = d.equippedBanner === b.id;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "banner-slot" + (on ? " selected" : "");
      btn.setAttribute("data-id", b.id);
      btn.title = b.name;
      btn.style.backgroundImage = "url('" + b.src.replace(/'/g, "%27") + "')";
      var label = document.createElement("span");
      label.className = "banner-label";
      label.textContent = b.name;
      btn.appendChild(label);
      if (on) {
        var tag = document.createElement("span");
        tag.className = "eq-tag";
        tag.textContent = "\u2713";
        btn.appendChild(tag);
      }
      btn.onclick = (function (id) {
        return function () { equipBanner(id); };
      })(b.id);
      grid.appendChild(btn);
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
    ensureCSS();
    var box = wireNameBox();
    if (!box) return;
    var d = typeof getData === "function" ? getData(u) : {};
    var b = d.equippedBanner && byId[d.equippedBanner] ? byId[d.equippedBanner] : null;
    if (b) {
      box.classList.add("has-banner");
      box.style.backgroundImage = "url('" + b.src.replace(/'/g, "%27") + "')";
      box.style.backgroundSize = "cover";
      box.style.backgroundPosition = "center";
    } else {
      box.classList.remove("has-banner");
      box.style.backgroundImage = "none";
      box.style.backgroundColor = "rgba(0,0,0,0.28)";
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
  setTimeout(hookRefresh, 200);
  setTimeout(hookRefresh, 1000);
})();
