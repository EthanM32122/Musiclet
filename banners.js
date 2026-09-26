/* Musiclet Banners — click username box on Stats to equip */
(function () {
  const BANNERS = [
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
  const byId = Object.fromEntries(BANNERS.map(b => [b.id, b]));

  function ensureCSS() {
    if (document.getElementById("ml-banner-css")) return;
    const s = document.createElement("style");
    s.id = "ml-banner-css";
    s.textContent = `
.blacket-name-box {
  position: relative !important;
  display: inline-flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  min-width: 150px !important;
  min-height: 56px !important;
  padding: 10px 16px 10px 52px !important;
  background: rgba(0,0,0,0.28) !important;
  border-radius: 12px !important;
  cursor: pointer !important;
  overflow: hidden !important;
  border: 2px solid transparent !important;
  transition: border-color 0.15s, background 0.15s !important;
}
.blacket-name-box:hover {
  border-color: rgba(251,191,36,0.7) !important;
  background: rgba(0,0,0,0.38) !important;
}
.blacket-name-box .banner-behind {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  font-size: 28px;
  line-height: 1;
  pointer-events: none;
  z-index: 0;
}
.blacket-name-box .blacket-username,
.blacket-name-box .blacket-sub {
  position: relative;
  z-index: 1;
}
#bannersModal.modal-bg { z-index: 1100; }
.banners-modal {
  max-width: 420px;
  width: 94%;
  background: linear-gradient(180deg, #3b1a7a 0%, #2a1060 100%);
  border: 3px solid #c084fc;
  border-radius: 20px;
  box-shadow: 0 0 0 4px #7c3aed, 0 16px 48px rgba(0,0,0,0.5);
  padding: 18px 18px 16px;
  color: #fff;
}
.banners-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.banners-title {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, #fde68a, #f472b6 55%, #c084fc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.banners-close {
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 26px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  line-height: 1;
}
.banners-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-height: min(55vh, 380px);
  overflow-y: auto;
  padding: 4px 2px 8px;
}
.banner-slot {
  aspect-ratio: 1;
  border-radius: 14px;
  border: 3px solid transparent;
  background: rgba(255,255,255,0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  position: relative;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.banner-slot .banner-emoji { font-size: 36px; line-height: 1; }
.banner-slot:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(192,132,252,0.6);
}
.banner-slot.selected {
  border-color: #fbbf24;
  background: rgba(251,191,36,0.2);
}
.banner-slot .eq-tag {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: #fbbf24;
  color: #1a1a2e;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 6px;
}
`;
    document.head.appendChild(s);
  }

  function ensureModal() {
    if (document.getElementById("bannersModal")) return;
    const m = document.createElement("div");
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
      '<button type="button" class="btn btn-sm btn-ghost full" style="margin-top:8px" id="bannerCloseBtn">Close</button>' +
      "</div>";
    document.body.appendChild(m);
    m.addEventListener("click", function (e) {
      if (e.target === m) closeBannersModal();
    });
    m.querySelector(".banners-close").onclick = closeBannersModal;
    m.querySelector("#bannerCloseBtn").onclick = closeBannersModal;
    m.querySelector("#bannerRemoveBtn").onclick = unequipBanner;
  }

  function wireNameBox() {
    const box = document.querySelector("#page-stats .blacket-name-box") || document.getElementById("bannerNameBox");
    if (!box) return;
    if (!document.getElementById("statsBannerBehind")) {
      const behind = document.createElement("div");
      behind.className = "banner-behind";
      behind.id = "statsBannerBehind";
      box.insertBefore(behind, box.firstChild);
    }
    if (box.dataset.bannerWired === "1") return;
    box.dataset.bannerWired = "1";
    box.setAttribute("title", "Change banner");
    box.setAttribute("role", "button");
    box.style.cursor = "pointer";
    box.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openBannersModal();
    });
  }

  window.openBannersModal = function openBannersModal() {
    ensureCSS();
    ensureModal();
    wireNameBox();
    const u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) return;
    const d = typeof getData === "function" ? getData(u) : {};
    const grid = document.getElementById("bannersGrid");
    if (!grid) return;
    grid.innerHTML = BANNERS.map(function (b) {
      const on = d.equippedBanner === b.id;
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
    document.getElementById("bannersModal").classList.add("open");
  };

  window.closeBannersModal = function closeBannersModal() {
    const m = document.getElementById("bannersModal");
    if (m) m.classList.remove("open");
  };

  window.equipBanner = function equipBanner(id) {
    const u = typeof currentUser === "function" ? currentUser() : "";
    if (!u || !byId[id]) return;
    const d = getData(u);
    d.equippedBanner = id;
    saveData(u, d);
    updateBannerDisplay(u);
    closeBannersModal();
  };

  window.unequipBanner = function unequipBanner() {
    const u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) return;
    const d = getData(u);
    d.equippedBanner = null;
    saveData(u, d);
    updateBannerDisplay(u);
    closeBannersModal();
  };

  window.updateBannerDisplay = function updateBannerDisplay(username) {
    const u = username || (typeof currentUser === "function" ? currentUser() : "");
    if (!u) return;
    wireNameBox();
    const d = typeof getData === "function" ? getData(u) : {};
    const el = document.getElementById("statsBannerBehind");
    if (!el) return;
    if (d.equippedBanner && byId[d.equippedBanner]) {
      el.textContent = byId[d.equippedBanner].emoji;
    } else {
      el.textContent = "";
    }
  };

  function init() {
    ensureCSS();
    ensureModal();
    wireNameBox();
    try { updateBannerDisplay(); } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(init, 50);
      setTimeout(init, 400);
      setTimeout(init, 1000);
    });
  } else {
    setTimeout(init, 50);
    setTimeout(init, 400);
  }

  const hook = function () {
    const orig = window.refreshUI;
    if (typeof orig === "function" && !orig._bannerHooked) {
      window.refreshUI = function () {
        orig.apply(this, arguments);
        try { init(); } catch (e) {}
      };
      window.refreshUI._bannerHooked = true;
    }
  };
  setTimeout(hook, 100);
  setTimeout(hook, 800);
})();
