/* Badge system for Musiclet */
const BADGE_DEFS = {
  owner: { label: "Owner", img: "badges/owner.svg" },
  "co-owner": { label: "Co-owner", img: "badges/co-owner.svg" },
  developer: { label: "Developer", img: "badges/developer.svg" },
  admin: { label: "Admin", img: "badges/admin.svg" },
  mod: { label: "Mod", img: "badges/mod.svg" },
  helper: { label: "Helper", img: "badges/helper.svg" },
  musictuber: { label: "Musictuber", img: "badges/musictuber.svg" },
  verified: { label: "Verified", img: "badges/verified.svg" },
  og: { label: "OG", img: "badges/og.svg" }
};

function badgeHtml(list, sizeClass) {
  const badges = (list || []).filter(id => BADGE_DEFS[id]);
  if (!badges.length) return "";
  return badges.map(id => {
    const b = BADGE_DEFS[id];
    return '<img class="badge-icon ' + (sizeClass || "") + '" src="' + b.img + '" alt="' + b.label + '" title="' + b.label + '">';
  }).join("");
}

function updateBadgesUI(username) {
  const u = username || (typeof currentUser === "function" ? currentUser() : null);
  if (!u || typeof getData !== "function") return;
  const d = getData(u);
  if (!Array.isArray(d.badges)) d.badges = [];
  const el = document.getElementById("userBadges");
  if (el) el.innerHTML = badgeHtml(d.badges, "badge-sm");
  const sb = document.getElementById("statsBadges");
  if (sb) sb.innerHTML = badgeHtml(d.badges, "badge-sm");
}

(function patchBadges() {
  const _updatePfp = typeof updatePfp === "function" ? updatePfp : null;
  if (_updatePfp) {
    window.updatePfp = function (username) {
      _updatePfp(username);
      updateBadgesUI(username);
    };
  }
  const _openProfile = typeof openProfile === "function" ? openProfile : null;
  if (_openProfile) {
    window.openProfile = function (username) {
      _openProfile(username);
      try {
        const me = currentUser();
        const name = (username || me || "").trim();
        const users = getUsers();
        const user = users[name.toLowerCase()];
        if (!user) return;
        const d = getData(user.username);
        const badgeRow = document.getElementById("profileBadges");
        if (badgeRow) {
          const html = badgeHtml(d.badges, "badge-md");
          badgeRow.innerHTML = html || '<span class="muted">No badges</span>';
        }
      } catch (e) {}
    };
  }
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      const u = typeof currentUser === "function" ? currentUser() : null;
      if (u) updateBadgesUI(u);
    }, 100);
  });
})();
