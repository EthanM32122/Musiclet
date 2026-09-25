/* Musiclet Credits */
const CREDITS = [
  {
    id: "ethan",
    name: "EthanM32",
    role: "Owner",
    roleColor: "#7c4dff",
    titleColor: "linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff)",
    blurb: "Owner, coder of Musiclet. Loves playing trumpet.",
    full: "Owner and coder of Musiclet. Loves playing trumpet.",
    letter: "E",
    bg: "linear-gradient(145deg, #7e57c2, #4527a0)"
  },
  {
    id: "steven",
    name: "Steven Montez",
    role: "Teacher",
    roleColor: "#26c6da",
    titleColor: null,
    blurb: "My teacher for music — shows EthanM32 how to play trumpet.",
    full: "My teacher for music. Shows EthanM32 how to play trumpet.",
    letter: "S",
    bg: "linear-gradient(145deg, #26c6da, #00838f)"
  }
];

function renderCredits() {
  const grid = document.getElementById("creditsGrid");
  if (!grid) return;
  grid.innerHTML = CREDITS.map((c, i) => {
    const roleHtml = '<span class="role" style="color:' + c.roleColor + '">[' + c.role + ']</span> ';
    const nameStyle = c.titleColor
      ? 'background:' + c.titleColor + ';-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;'
      : 'color:#fff;';
    return '<button type="button" class="credit-card" data-i="' + i + '">' +
      '<div class="credit-card-pfp" style="background:' + c.bg + '">' + c.letter + '</div>' +
      '<div class="credit-card-title">' + roleHtml + '<span style="' + nameStyle + '">' + c.name + '</span></div>' +
      '<div class="credit-card-blurb">' + c.blurb + '</div>' +
      '</button>';
  }).join("");
  grid.querySelectorAll(".credit-card").forEach(btn => {
    btn.onclick = () => openCreditModal(Number(btn.getAttribute("data-i")));
  });
}

function openCreditModal(i) {
  const c = CREDITS[i];
  if (!c) return;
  const av = document.getElementById("creditModalAvatar");
  av.style.background = c.bg;
  av.innerHTML = c.letter;
  document.getElementById("creditModalName").textContent = c.name;
  const role = document.getElementById("creditModalRole");
  role.textContent = "[" + c.role + "]";
  role.style.color = c.roleColor;
  document.getElementById("creditModalDesc").textContent = c.full;
  document.getElementById("creditModal").classList.add("open");
}

function closeCreditModal() {
  document.getElementById("creditModal").classList.remove("open");
}

(function () {
  const _show = typeof showPage === "function" ? showPage : null;
  if (_show) {
    window.showPage = function (page) {
      _show(page);
      if (page === "credits") renderCredits();
    };
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("page-credits") && document.getElementById("page-credits").classList.contains("active")) {
      renderCredits();
    }
  });
})();
