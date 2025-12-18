// ui.js
// Gentle Heart — UI v1 (LOCKED) + LOGIC WIRED
// Calls routeMessage() ONLY

document.addEventListener("DOMContentLoaded", () => {

  const chatArea = document.getElementById("chatArea");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const typing = document.getElementById("typingIndicator");

  const settingsModal = document.getElementById("settingsModal");
  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const clearChatBtn = document.getElementById("clearChat");

  // ================= UI HELPERS =================

  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "gh-msg user" : "gh-msg bot";
    msg.textContent = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function showTyping() {
    typing.classList.remove("hidden");
    input.disabled = true;
    sendBtn.disabled = true;
  }

  function hideTyping() {
    typing.classList.add("hidden");
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }

  // ================= CORE SEND =================

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";
    showTyping();

    setTimeout(() => {
      const res = window.routeMessage(text); // ✅ LOGIC CONNECTED

      hideTyping();
      addMessage(res.text, "bot");

    }, 600);
  }

  // ================= EVENTS =================

  sendBtn.addEventListener("click", handleSend);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  openSettings.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  clearChatBtn.addEventListener("click", () => {
    chatArea.innerHTML = "";
    settingsModal.classList.add("hidden");
  });

});
