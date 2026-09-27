/* Musiclet — stronger Login / Register */
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function validUsername(u) {
    if (!u || u.length < 3 || u.length > 20) return "Username must be 3–20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return "Username: letters, numbers, underscore only";
    return "";
  }

  window.openLogin = function () {
    if (typeof closeModals === "function") closeModals();
    var m = $("loginModal");
    if (m) m.classList.add("open");
    var err = $("loginErr");
    if (err) err.textContent = "";
    setTimeout(function () {
      var inp = $("loginUser");
      if (inp) inp.focus();
    }, 50);
  };

  window.openRegister = function () {
    if (typeof closeModals === "function") closeModals();
    var m = $("regModal");
    if (m) m.classList.add("open");
    var err = $("regErr");
    if (err) err.textContent = "";
    setTimeout(function () {
      var inp = $("regUser");
      if (inp) inp.focus();
    }, 50);
  };

  window.doRegister = function () {
    var u = (($("regUser") && $("regUser").value) || "").trim();
    var p = ($("regPass") && $("regPass").value) || "";
    var p2 = ($("regPass2") && $("regPass2").value) || "";
    var err = $("regErr");
    if (!err) return;

    var uErr = validUsername(u);
    if (uErr) {
      err.textContent = uErr;
      return;
    }
    if (p.length < 4) {
      err.textContent = "Password must be at least 4 characters";
      return;
    }
    if (p !== p2) {
      err.textContent = "Passwords do not match";
      return;
    }

    var users = typeof getUsers === "function" ? getUsers() : {};
    var key = u.toLowerCase();
    if (users[key]) {
      err.textContent = "Username taken";
      return;
    }

    users[key] = { username: u, password: p };
    try {
      localStorage.setItem("ml_users", JSON.stringify(users));
    } catch (e) {
      err.textContent = "Could not save account (storage blocked?)";
      return;
    }

    if (typeof saveData === "function" && typeof defaultData === "function") {
      saveData(u, defaultData());
    }

    err.textContent = "Account created! Signing in…";
    err.style.color = "#2e7d32";
    setTimeout(function () {
      err.style.color = "";
      if (typeof closeModals === "function") closeModals();
      try {
        localStorage.setItem("ml_current", u);
      } catch (e) {}
      if (typeof afterLogin === "function") afterLogin(u);
    }, 400);
  };

  window.doLogin = function () {
    var u = (($("loginUser") && $("loginUser").value) || "").trim();
    var p = ($("loginPass") && $("loginPass").value) || "";
    var err = $("loginErr");
    if (!err) return;

    if (!u || !p) {
      err.textContent = "Enter username and password";
      return;
    }

    var users = typeof getUsers === "function" ? getUsers() : {};
    var user = users[u.toLowerCase()];
    if (!user || user.password !== p) {
      err.textContent = "Invalid username or password";
      return;
    }

    try {
      localStorage.setItem("ml_current", user.username);
    } catch (e) {
      err.textContent = "Could not save session";
      return;
    }
    if (typeof afterLogin === "function") afterLogin(user.username);
  };

  function bindEnter(ids, fn) {
    ids.forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          fn();
        }
      });
    });
  }

  function wire() {
    bindEnter(["loginUser", "loginPass"], function () {
      if (typeof doLogin === "function") doLogin();
    });
    bindEnter(["regUser", "regPass", "regPass2"], function () {
      if (typeof doRegister === "function") doRegister();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
