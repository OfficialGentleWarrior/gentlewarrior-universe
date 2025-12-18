// UI ONLY — no logic, no routing

document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".gh-input input");

  // auto focus (mobile-safe)
  setTimeout(() => input.focus(), 300);
});
