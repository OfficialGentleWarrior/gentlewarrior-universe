document.addEventListener("DOMContentLoaded", () => {

  /* USER AVATAR UPLOAD */
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

  /* GEAR CLICK */
  const gearBtn = document.getElementById("gearBtn");
  if (gearBtn) {
    gearBtn.addEventListener("click", () => {
      const overlay = document.getElementById("settingsOverlay");
const closeBtn = document.getElementById("closeSettings");

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
    });
  }

  /* ANDROID KEYBOARD / VIEWPORT FIX */
  const app = document.querySelector(".app");

  if (window.visualViewport && app) {
    const resize = () => {
      app.style.height = window.visualViewport.height + "px";
    };

    window.visualViewport.addEventListener("resize", resize);
    resize();
  }

});
