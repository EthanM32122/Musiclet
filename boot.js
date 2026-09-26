document.addEventListener("DOMContentLoaded", function () {
  try {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (u) afterLogin(u);
    else {
      var landing = document.getElementById("landing");
      if (landing) landing.classList.add("active");
    }
    document.querySelectorAll(".modal-bg").forEach(function (bg) {
      bg.addEventListener("click", function (e) {
        if (e.target === bg) {
          if (bg.id === "openModal" && typeof autoRunning !== "undefined" && autoRunning) return;
          if (typeof closeModals === "function") closeModals();
        }
      });
    });
  } catch (err) {
    console.error("boot", err);
  }
});
