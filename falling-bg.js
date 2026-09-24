(function () {
  var colors = ["#2ec4ff", "#ffd60a", "#ff4d9a", "#a78bfa", "#5eead4", "#f472b6", "#facc15", "#38bdf8", "#c084fc", "#67e8f9"];
  function mount() {
    if (document.getElementById("fallingBg")) return;
    var layer = document.createElement("div");
    layer.id = "fallingBg";
    layer.setAttribute("aria-hidden", "true");
    var n = 42;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("div");
      s.className = "sq";
      var size = 18 + Math.random() * 72;
      s.style.width = size + "px";
      s.style.height = size + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.background = colors[i % colors.length];
      s.style.opacity = (0.55 + Math.random() * 0.45).toFixed(2);
      s.style.setProperty("--rot", (Math.random() * 50 - 25).toFixed(1) + "deg");
      var dur = 10 + Math.random() * 18;
      s.style.animationDuration = dur.toFixed(1) + "s";
      s.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
      layer.appendChild(s);
    }
    document.body.prepend(layer);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
