/* Stats page Blacket data binding — overrides refreshUI after app-part1 */
(function () {
  if (typeof refreshUI !== "function") return;
  window.refreshUI = function () {
    const u = currentUser();
    if (!u) return;
    const d = getData(u);
    document.getElementById("tokenCount").textContent = d.tokens.toLocaleString();
    const stTok = document.getElementById("statTokens");
    if (stTok) stTok.textContent = d.tokens.toLocaleString();
    const lvl = levelForExp(d.exp);
    const stLvl = document.getElementById("statLevel");
    if (stLvl) stLvl.textContent = lvl;
    const stXP = document.getElementById("statXP");
    if (stXP) stXP.textContent = d.exp.toLocaleString();
    const stPacks = document.getElementById("statPacks");
    if (stPacks) stPacks.textContent = (d.packsOpened || 0).toLocaleString();
    const inv = d.inventory || {};
    const types = Object.keys(inv).filter(k => inv[k] > 0).length;
    const total = Object.values(inv).reduce((a, b) => a + (b || 0), 0);
    const catalogCount = (typeof BLOOKS !== "undefined" && BLOOKS.length) ? BLOOKS.length : types;
    const stBlooks = document.getElementById("statBlooks");
    if (stBlooks) stBlooks.textContent = types + " / " + catalogCount;
    const stTotal = document.getElementById("statTotal");
    if (stTotal) stTotal.textContent = total.toLocaleString();
    const su = document.getElementById("statsUsername");
    if (su) su.textContent = u;
    const sub = document.getElementById("statsSub");
    if (sub) sub.textContent = "Level " + lvl;
    const lvlBadge = document.getElementById("statLevelBadge");
    if (lvlBadge) lvlBadge.textContent = String(lvl);
    const xpFill = document.getElementById("statXpFill");
    if (xpFill) {
      const prevNeed = Math.pow(Math.max(0, lvl - 1), 2) * 100;
      const nextNeed = Math.pow(lvl, 2) * 100;
      const span = Math.max(1, nextNeed - prevNeed);
      const pct = Math.min(100, Math.max(0, ((d.exp - prevNeed) / span) * 100));
      xpFill.style.width = pct + "%";
    }
    const sb = document.getElementById("statsBadges");
    if (sb && typeof badgeHtml === "function") {
      sb.innerHTML = badgeHtml(d.badges || [], "badge-sm");
    }
    const day = new Date().toDateString();
    const claimBtn = document.getElementById("claimBtn");
    if (claimBtn) {
      if (d.lastClaim === day) {
        claimBtn.disabled = true;
        claimBtn.textContent = "Claimed today";
        claimBtn.style.opacity = "0.6";
      } else {
        claimBtn.disabled = false;
        claimBtn.innerHTML = "🎁 Daily Claim";
        claimBtn.style.opacity = "1";
      }
    }
    const settingsUser = document.getElementById("settingsCurrentUser");
    if (settingsUser) settingsUser.textContent = u;
    updatePfp(u);
    if (typeof updateBadgesUI === "function") updateBadgesUI(u);
    renderMarket();
    renderBlooks();
    renderBazaar();
    updateAutoBar();
  };
})();
