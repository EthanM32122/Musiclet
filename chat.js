/* Musiclet Chat — local global chat (same device / shared storage) */
(function () {
  "use strict";

  var CHAT_KEY = "ml_chat_global";
  var MAX_MSG = 120;

  function ensureCSS() {
    if (document.getElementById("ml-chat-css")) return;
    var s = document.createElement("style");
    s.id = "ml-chat-css";
    s.textContent = [
      ".chat-page-head { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px; }",
      ".chat-title { margin:0; font-size:36px; font-weight:900; font-style:italic; color:#a5b4fc;",
      "  text-shadow: 0 2px 0 #312e81, 3px 3px 0 rgba(0,0,0,0.35); }",
      ".chat-hint { font-size:12px; color:rgba(255,255,255,0.65); }",
      ".chat-box { display:flex; flex-direction:column; height: min(62vh, 520px); max-width:720px;",
      "  background:rgba(0,0,0,0.28); border:2px solid rgba(165,180,252,0.35); border-radius:16px; overflow:hidden; }",
      ".chat-messages { flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; }",
      ".chat-msg { padding:8px 12px; border-radius:12px; background:rgba(255,255,255,0.08); max-width:92%; }",
      ".chat-msg.me { align-self:flex-end; background:rgba(99,102,241,0.35); }",
      ".chat-msg-user { font-weight:800; font-size:13px; color:#c4b5fd; margin-bottom:2px; }",
      ".chat-msg.me .chat-msg-user { color:#fde68a; }",
      ".chat-msg-text { font-size:14px; color:#fff; word-break:break-word; }",
      ".chat-msg-time { font-size:10px; color:rgba(255,255,255,0.45); margin-top:4px; }",
      ".chat-input-row { display:flex; gap:8px; padding:12px; border-top:1px solid rgba(255,255,255,0.12); background:rgba(0,0,0,0.2); }",
      ".chat-input { flex:1; border:none; border-radius:10px; padding:12px 14px; font-size:14px; font-weight:600;",
      "  background:rgba(255,255,255,0.12); color:#fff; outline:none; }",
      ".chat-send { border:none; cursor:pointer; padding:10px 18px; border-radius:10px; font-weight:800;",
      "  background:linear-gradient(180deg,#818cf8,#4f46e5); color:#fff; }",
      ".chat-send:hover { filter:brightness(1.08); }",
      ".chat-empty { text-align:center; color:rgba(255,255,255,0.55); padding:40px 16px; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function getMessages() {
    try {
      return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveMessages(arr) {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(arr.slice(-MAX_MSG)));
    } catch (e) {}
  }

  function ensurePage() {
    var main = document.querySelector("main.content");
    if (!main || document.getElementById("page-chat")) return;
    var sec = document.createElement("section");
    sec.id = "page-chat";
    sec.className = "page";
    sec.innerHTML =
      '<div class="chat-page-head">' +
      '<h1 class="chat-title">Chat</h1>' +
      '<span class="chat-hint">Global chat · stored on this device</span>' +
      "</div>" +
      '<div class="chat-box">' +
      '<div class="chat-messages" id="chatMessages"></div>' +
      '<div class="chat-input-row">' +
      '<input type="text" class="chat-input" id="chatInput" maxlength="200" placeholder="Say something…" />' +
      '<button type="button" class="chat-send" id="chatSend">Send</button>' +
      "</div></div>";
    main.appendChild(sec);
    var input = sec.querySelector("#chatInput");
    var send = sec.querySelector("#chatSend");
    function doSend() {
      sendMessage();
    }
    send.onclick = doSend;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        doSend();
      }
    });
  }

  function sendMessage() {
    var u = typeof currentUser === "function" ? currentUser() : "";
    if (!u) {
      alert("Log in to chat");
      return;
    }
    var input = document.getElementById("chatInput");
    if (!input) return;
    var text = (input.value || "").trim();
    if (!text) return;
    if (text.length > 200) text = text.slice(0, 200);
    var msgs = getMessages();
    msgs.push({ user: u, text: text, t: Date.now() });
    saveMessages(msgs);
    input.value = "";
    renderChat(true);
  }

  function formatTime(ts) {
    try {
      var d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function renderChat(scrollBottom) {
    ensureCSS();
    ensurePage();
    var box = document.getElementById("chatMessages");
    if (!box) return;
    var me = typeof currentUser === "function" ? currentUser() : "";
    var msgs = getMessages();
    box.innerHTML = "";
    if (!msgs.length) {
      var empty = document.createElement("div");
      empty.className = "chat-empty";
      empty.textContent = "No messages yet. Be the first!";
      box.appendChild(empty);
      return;
    }
    msgs.forEach(function (m) {
      var div = document.createElement("div");
      div.className = "chat-msg" + (me && m.user === me ? " me" : "");
      var user = document.createElement("div");
      user.className = "chat-msg-user";
      user.textContent = m.user || "?";
      var text = document.createElement("div");
      text.className = "chat-msg-text";
      text.textContent = m.text || "";
      var time = document.createElement("div");
      time.className = "chat-msg-time";
      time.textContent = formatTime(m.t);
      div.appendChild(user);
      div.appendChild(text);
      div.appendChild(time);
      box.appendChild(div);
    });
    if (scrollBottom) box.scrollTop = box.scrollHeight;
  }

  function hookShowPage() {
    var orig = window.showPage;
    if (typeof orig !== "function" || orig._chatHooked) return;
    window.showPage = function (page) {
      ensurePage();
      if (page === "chat") renderChat(true);
      orig.apply(this, arguments);
    };
    window.showPage._chatHooked = true;
  }

  function boot() {
    ensureCSS();
    ensurePage();
    hookShowPage();
    window.addEventListener("storage", function (e) {
      if (e.key === CHAT_KEY) renderChat(false);
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(boot, 40);
      setTimeout(boot, 500);
    });
  } else {
    setTimeout(boot, 40);
    setTimeout(boot, 500);
  }
  window.renderChat = renderChat;
})();
