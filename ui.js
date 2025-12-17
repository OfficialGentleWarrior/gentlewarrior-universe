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
      empty.style.display = chat.querySelector(".bubble")
        ? "none"
        : "block";
    });
    observer.observe(chat, { childList: true });
  }

  /* ================= INPUT ELEMENTS ================= */
  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
/* ENTER KEY SEND */
if (chatInput && sendBtn) {
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });
}

  /* ================= TYPING INDICATOR ================= */
  const typingIndicator = document.getElementById("typingIndicator");

  window.showTyping = function () {
    if (!typingIndicator || !chat) return;

    // always keep typing indicator LAST
    chat.appendChild(typingIndicator);
    typingIndicator.classList.remove("hidden");

    // disable input while bot is typing
    if (sendBtn) sendBtn.disabled = true;
    if (chatInput) chatInput.disabled = true;

    typingIndicator.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  window.hideTyping = function () {
    if (!typingIndicator) return;

    typingIndicator.classList.add("hidden");

    // re-enable input after bot reply
    if (sendBtn) sendBtn.disabled = false;
    if (chatInput) {
      chatInput.disabled = false;
      chatInput.focus();
    }
  };

  /* ================= SEND MESSAGE ================= */
  if (sendBtn && chatInput && chat) {
    sendBtn.addEventListener("click", () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // remove empty state permanently
      const emptyState = chat.querySelector(".empty-state");
      if (emptyState) emptyState.remove();

      // USER bubble
      const userBubble = document.createElement("div");
      userBubble.className = "bubble user";
      userBubble.textContent = text;

      chat.appendChild(userBubble);
      chatInput.value = "";
      userBubble.scrollIntoView({ behavior: "smooth", block: "end" });

      // show typing indicator AFTER user message
      window.showTyping();

      // BOT reply after delay
      setTimeout(() => {
        window.hideTyping();

        const botBubble = document.createElement("div");
        botBubble.className = "bubble bot";
        const result = window.routeMessage(text);
console.log("ROUTE RESULT:", result);

botBubble.textContent = JSON.stringify(result);

        chat.appendChild(botBubble);
        botBubble.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 1500);
    });
  }

  /* ================= CLEAR CHAT ================= */
  const clearBtn = document.querySelector(".clear-btn");

  if (clearBtn && chat) {
    clearBtn.addEventListener("click", () => {

      // remove all bubbles
      chat.querySelectorAll(".bubble").forEach(b => b.remove());

      // hide typing indicator
      if (typingIndicator) typingIndicator.classList.add("hidden");

      // reset input state
      if (sendBtn) sendBtn.disabled = false;
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.value = "";
      }

      // restore empty state
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      emptyState.innerHTML = `
        <div class="empty-title">You’re safe here.</div>
        <div class="empty-sub">Start typing whenever you’re ready.</div>
      `;
      chat.appendChild(emptyState);
    });
  }

});
