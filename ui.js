// USER AVATAR UPLOAD
const avatarInput = document.getElementById("avatarInput");
const userAvatar = document.getElementById("userAvatar");

avatarInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    userAvatar.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// GEAR CLICK (TEMP CONFIRM)
const gearBtn = document.getElementById("gearBtn");
gearBtn.addEventListener("click", () => {
  alert("Settings panel (design next)");
});