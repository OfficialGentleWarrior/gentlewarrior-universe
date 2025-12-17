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

  /* ================= EMPTY STATE AUTO-HIDE ================= */
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

});
