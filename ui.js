document.addEventListener("DOMContentLoaded", () => {

  const chat = document.getElementById("chat");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const settingsModal = document.getElementById("settingsModal");
  const clearChat = document.getElementById("clearChat");

  // ===== HEADER AVATAR ONLY =====
  const headerUserAvatar = document.getElementById("userAvatar");
  const avatarInput = document.getElementById("avatarInput");

  let isTyping = false;

  // ===== USER AVATAR (LOAD) =====
  let userAvatar = localStorage.getItem("userAvatar");
  if (!userAvatar) {
    userAvatar = "avatar.png";
    localStorage.setItem("userAvatar", userAvatar);
  }

  if (headerUserAvatar) {
    headerUserAvatar.src = userAvatar;
  }

  // ===== AVATAR UPLOAD =====
  if (headerUserAvatar && avatarInput) {
    headerUserAvatar.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", () => {
      const file = avatarInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        userAvatar = reader.result;
        localStorage.setItem("userAvatar", userAvatar);
        headerUserAvatar.src = userAvatar;
      };
      reader.readAsDataURL(file);
    });
  }

  // ===== HELPERS =====
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

  // ===== TYPING INDICATOR =====
  function showTyping() {
    isTyping = true;
    sendBtn.disabled = true;
    input.disabled = true;

    const typing = document.createElement("div");
    typing.className = "typing";
    typing.id = "typingIndicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;
  }

  function hideTyping() {
    isTyping = false;
    sendBtn.disabled = false;
    input.disabled = false;

    const typing = document.getElementById("typingIndicator");
    if (typing) typing.remove();

    input.focus();
  }

  // ===== SEND FLOW (FINAL) =====
  function send() {
    if (isTyping) return;

    const text = input.value.trim();
    if (!text) return;

    const welcome = document.querySelector(".welcome");
    if (welcome) welcome.remove();

    addUser(text);
    input.value = "";

    showTyping();

    setTimeout(() => {
  hideTyping();

  console.log("routeMessage exists:", typeof window.routeMessage);
  console.log("RESPONSES:", {
    OPEN: window.RESPONSES_OPEN,
    FEELING: window.RESPONSES_FEELING,
    DESIRE: window.RESPONSES_DESIRE,
    SUPPORT: window.RESPONSES_SUPPORT,
    PLAYFUL: window.RESPONSES_PLAYFUL,
    GROUNDING: window.RESPONSES_GROUNDING,
    HELP: window.RESPONSES_HELP
  });

  if (typeof window.routeMessage === "function") {
    const result = window.routeMessage(text);
    console.log("ROUTE RESULT:", result);
    addBot(result?.text || "NO RESPONSE TEXT");
  } else {
    addBot("ROUTER NOT FOUND");
  }
}, 1200);
  }

  sendBtn.addEventListener("click", send);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  });

  // ===== SETTINGS =====
  if (openSettings && closeSettings && settingsModal) {
    openSettings.addEventListener("click", () => {
      settingsModal.classList.remove("hidden");
    });

    closeSettings.addEventListener("click", () => {
      settingsModal.classList.add("hidden");
    });
  }

  if (clearChat) {
    clearChat.addEventListener("click", () => {
      chat.innerHTML = "";
      settingsModal.classList.add("hidden");
    });
  }

  // ===== ANDROID KEYBOARD FIX =====
  if (window.visualViewport) {
    const viewport = window.visualViewport;

    function resizeApp() {
      document.body.style.height = viewport.height + "px";
    }

    resizeApp();
    viewport.addEventListener("resize", resizeApp);
  }

});
