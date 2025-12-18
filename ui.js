document.addEventListener("DOMContentLoaded", () => {

  const chatArea = document.getElementById("chatArea");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  const emptyState = document.getElementById("emptyState");

  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const settingsModal = document.getElementById("settingsModal");

  function addMessage(text, sender){
    if (emptyState) emptyState.remove();

    const msg = document.createElement("div");
    msg.className = `gh-msg ${sender}`;
    msg.textContent = text;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  function send(){
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    setTimeout(() => {
      addMessage("I’m here with you.", "bot");
    }, 600);
  }

  // SEND
  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") send();
  });

  // SETTINGS
  openSettings.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

});
