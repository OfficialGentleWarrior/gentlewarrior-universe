document.addEventListener("DOMContentLoaded", () => {

  const chat = document.getElementById("chat");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const settingsModal = document.getElementById("settingsModal");
  const clearChat = document.getElementById("clearChat");

  const headerUserAvatar = document.getElementById("userAvatar");
  const avatarInput = document.getElementById("avatarInput");

  let isTyping = false;

  /* ===== AVATAR LOAD ===== */
  let userAvatar = localStorage.getItem("userAvatar") || "avatar.png";
  localStorage.setItem("userAvatar", userAvatar);
  headerUserAvatar.src = userAvatar;

  headerUserAvatar.addEventListener("click", () => avatarInput.click());

  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("userAvatar", reader.result);
      headerUserAvatar.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  /* ===== HELPERS ===== */
  function addBot(text) {
    const msg = document.createElement("div");
    msg.className = "msg bot";
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function addUser(text) {
    const msg = document.createElement("div");
    msg.className = "msg user";
    msg.textContent = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping() {
    isTyping = true;
    sendBtn.disabled = true;
    input.disabled = true;

    const typing = document.createElement("div");
    typing.id = "typing";
    typing.className = "typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chat.appendChild(typing);
  }

  function hideTyping() {
    isTyping = false;
    sendBtn.disabled = false;
    input.disabled = false;
    const t = document.getElementById("typing");
    if (t) t.remove();
    input.focus();
  }

  /* ===== SEND ===== */
  function send() {
    if (isTyping) return;

    const text = input.value.trim();
    if (!text) return;

    document.querySelector(".welcome")?.remove();

    addUser(text);
    input.value = "";

    showTyping();

    setTimeout(() => {
      hideTyping();

      if (typeof window.routeMessage === "function") {
        const result = window.routeMessage(text);
        addBot(result.text);
      } else {
        addBot("System error: logic not loaded.");
      }

    }, 1000);
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  });

  /* ===== SETTINGS ===== */
  openSettings.addEventListener("click", () =>
    settingsModal.classList.remove("hidden")
  );

  closeSettings.addEventListener("click", () =>
    settingsModal.classList.add("hidden")
  );

  clearChat.addEventListener("click", () => {
    chat.innerHTML = "";
    settingsModal.classList.add("hidden");
  });

});
