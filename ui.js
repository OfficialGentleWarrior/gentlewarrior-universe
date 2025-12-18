document.addEventListener("DOMContentLoaded",()=>{

  const chat = document.getElementById("chat");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const settingsModal = document.getElementById("settingsModal");
  const clearChat = document.getElementById("clearChat");

  let isTyping = false;

  // ===== USER AVATAR =====
  let userAvatar = localStorage.getItem("userAvatar");
  if(!userAvatar){
    userAvatar = "avatar.png";
    localStorage.setItem("userAvatar", userAvatar);
  }

  // ===== HELPERS =====
  function addBot(text){
    const msg=document.createElement("div");
    msg.className="msg bot";
    msg.textContent=text;
    chat.appendChild(msg);
    chat.scrollTop=chat.scrollHeight;
  }

  function addUser(text){
    const wrap=document.createElement("div");
    wrap.className="user-wrap";

    const msg=document.createElement("div");
    msg.className="msg user";
    msg.textContent=text;

    const img=document.createElement("img");
    img.src=userAvatar;
    img.className="user-avatar";

    wrap.appendChild(msg);
    wrap.appendChild(img);
    chat.appendChild(wrap);
    chat.scrollTop=chat.scrollHeight;
  }

  function showTyping(){
    isTyping=true;
    sendBtn.disabled=true;
    input.disabled=true;

    const typing=document.createElement("div");
    typing.className="typing";
    typing.id="typing";
    typing.innerHTML="<span></span><span></span><span></span>";
    chat.appendChild(typing);
    chat.scrollTop=chat.scrollHeight;
  }

  function hideTyping(){
    isTyping=false;
    sendBtn.disabled=false;
    input.disabled=false;
    const t=document.getElementById("typing");
    if(t) t.remove();
    input.focus();
  }

  // ===== SEND =====
  function send(){
    if(isTyping) return;
    const text=input.value.trim();
    if(!text) return;

    const welcome=document.querySelector(".welcome");
    if(welcome) welcome.remove();

    addUser(text);
    input.value="";
    showTyping();

    setTimeout(()=>{
      hideTyping();
      addBot("I’m here with you.");
    },1200);
  }

  sendBtn.onclick=send;
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter") send();
  });

  // ===== SETTINGS =====
  openSettings.onclick=()=>settingsModal.classList.remove("hidden");
  closeSettings.onclick=()=>settingsModal.classList.add("hidden");

  clearChat.onclick=()=>{
    chat.innerHTML="";
    settingsModal.classList.add("hidden");
  };

});
