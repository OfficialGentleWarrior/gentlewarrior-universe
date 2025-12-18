document.addEventListener("DOMContentLoaded", () => {
  const chat = document.getElementById("chatArea");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  const modal = document.getElementById("settingsModal");
  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const clearChat = document.getElementById("clearChat");

  function addMessage(text, who){
    const wrap = document.createElement("div");
    wrap.className = `msg ${who}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    wrap.appendChild(bubble);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
  }

  function send(){
    const text = input.value.trim();
    if(!text) return;
    input.value = "";
    addMessage(text,"user");

    setTimeout(()=>{
      addMessage("I’m here with you.","bot");
    },500);
  }

  sendBtn.onclick = send;
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter") send();
  });

  openSettings.onclick = ()=> modal.classList.remove("hidden");
  closeSettings.onclick = ()=> modal.classList.add("hidden");

  clearChat.onclick = ()=>{
    chat.innerHTML = `
      <div class="welcome">
        <h1>You’re safe here.</h1>
        <p>Start typing whenever you’re ready.</p>
      </div>`;
    modal.classList.add("hidden");
  };
});
