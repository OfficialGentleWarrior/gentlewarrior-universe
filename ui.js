document.addEventListener("DOMContentLoaded",()=>{

  const chat = document.getElementById("chat");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  const openSettings = document.getElementById("openSettings");
  const closeSettings = document.getElementById("closeSettings");
  const settingsModal = document.getElementById("settingsModal");
  const clearChat = document.getElementById("clearChat");

  function addMessage(text,type){
    const msg=document.createElement("div");
    msg.className=`msg ${type}`;
    msg.textContent=text;
    chat.appendChild(msg);
    chat.scrollTop=chat.scrollHeight;
  }

  function send(){
    const text=input.value.trim();
    if(!text) return;

    const welcome=document.querySelector(".welcome");
    if(welcome) welcome.remove();

    addMessage(text,"user");
    input.value="";

    setTimeout(()=>{
      addMessage("I’m here with you.","bot");
    },400);
  }

  sendBtn.onclick=send;
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter") send();
  });

  openSettings.onclick=()=>settingsModal.classList.remove("hidden");
  closeSettings.onclick=()=>settingsModal.classList.add("hidden");

  clearChat.onclick=()=>{
    chat.innerHTML="";
    settingsModal.classList.add("hidden");
  };

});
