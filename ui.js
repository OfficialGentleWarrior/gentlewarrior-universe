document.addEventListener("DOMContentLoaded", () => {

  /* ================= USER AVATAR UPLOAD ================= */
  const avatarInput = document.getElementById("avatarInput");
  const userAvatar = document.getElementById("userAvatar");

  if (avatarInput && userAvatar) {
    avatarInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        userAvatar.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ================= SETTINGS MODAL ================= */
  const gearBtn = document.getElementById("gearBtn");
  const overlay = document.getElementById("settingsOverlay");
  const closeBtn = document.getElementById("closeSettings");

  if (gearBtn && overlay && closeBtn) {
    gearBtn.addEventListener("click", () => {
      overlay.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", () => {
      overlay.classList.add("hidden");
    });

    overlay.addEventListener("click", e => {
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  }

  /* ================= ANDROID KEYBOARD / VIEWPORT FIX ================= */
  const app = document.querySelector(".app");

  if (window.visualViewport && app) {
    const resize = () => {
      app.style.height = window.visualViewport.height + "px";
    };

    window.visualViewport.addEventListener("resize", resize);
    resize();
  }

  /* ================= CHAT + EMPTY STATE ================= */
  const chat = document.querySelector(".gh-chat");
  const empty = document.querySelector(".empty-state");

  if (chat && empty) {
    const observer = new MutationObserver(() => {
      if (chat.querySelector(".bubble")) {
        empty.style.display = "none";
      } else {
        empty.style.display = "block";
      }
    });
    observer.observe(chat, { childList: true });
  }

  /* ================= TYPING INDICATOR ================= */
  const typingIndicator = document.getElementById("typingIndicator");

  window.showTyping = function () {
    if (!typingIndicator) return;
    typingIndicator.classList.remove("hidden");
    typingIndicator.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  window.hideTyping = function () {
    if (!typingIndicator) return;
    typingIndicator.classList.add("hidden");
  };

  /* ================= SEND MESSAGE ================= */
  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");

  if (sendBtn && chatInput && chat) {
    sendBtn.addEventListener("click", () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // remove empty state permanently
      const emptyState = chat.querySelector(".empty-state");
      if (emptyState) emptyState.remove();

      // user bubble
      const bubble = document.createElement("div");
      bubble.className = "bubble user";
      bubble.textContent = text;

      chat.appendChild(bubble);
      chatInput.value = "";
      bubble.scrollIntoView({ behavior: "smooth", block: "end" });

      // show typing indicator (bot thinking)
      window.showTyping();

      // TEMP bot reply (UI only)
      setTimeout(() => {
  // bot reply appears AFTER typing is visible
  const botBubble = document.createElement("div");
  botBubble.className = "bubble bot";
  botBubble.textContent = "I’m here with you. Tell me more.";

  window.hideTyping();
  chat.appendChild(botBubble);
  botBubble.scrollIntoView({ behavior: "smooth", block: "end" });
}, 1500);
    });
  }

});
