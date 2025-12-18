// responses/help.js
// Gentle Heart — HELP / SAFETY RESPONSES FLOW (FINAL, 2-OPTIONS ONLY, ROUTER-SAFE)

window.RESPONSES_HELP = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "I want to make sure you’re safe — are you in immediate danger, or just needing support?"
      : "Gusto kong siguraduhin na ligtas ka — may agarang panganib ba, o kailangan mo lang ng suporta?",
    options: ["immediate_danger", "need_support"]
  }),

  // ===== IMMEDIATE DANGER =====
  immediate_danger: (lang) => ({
    text: lang === "en"
      ? "If you’re in danger right now, reaching out to someone near you is important — can you contact a trusted person, or local emergency help?"
      : "Kung may panganib ngayon, mahalagang may makontak ka — isang pinagkakatiwalaang tao, o emergency help?",
    options: ["trusted_person", "emergency_help"]
  }),

  trusted_person: (lang) => ({
    text: lang === "en"
      ? "Please reach out to someone you trust and let them know you need help."
      : "Mangyaring makipag-ugnayan sa taong pinagkakatiwalaan mo at sabihin na kailangan mo ng tulong.",
    options: ["exit", "emergency_help"]
  }),

  emergency_help: (lang) => ({
    text: lang === "en"
      ? "If possible, contact local emergency services right now."
      : "Kung kaya, makipag-ugnayan agad sa lokal na emergency services.",
    options: ["exit", "trusted_person"]
  }),

  // ===== NEED SUPPORT =====
  need_support: (lang) => ({
    text: lang === "en"
      ? "Thanks for telling me — do you want to talk about what’s going on, or ground first?"
      : "Salamat sa pagsabi — gusto mo bang magkwento, o mag-ground muna?",
    options: ["talk", "grounding"]
  }),

  talk: (lang) => ({
    text: lang === "en"
      ? "I’m here — you can share as much or as little as you want."
      : "Andito lang ako — kahit kaunti o marami, pwede mong ibahagi.",
    options: ["exit", "grounding"]
  }),

  grounding: (lang) => ({
    text: lang === "en"
      ? "Let’s slow things down together."
      : "Maghinay-hinay tayo nang magkasama.",
    options: ["exit", "talk"]
  }),

  // ===== EXIT =====
  exit: (lang) => ({
    text: lang === "en"
      ? "You’re not alone — we can talk again anytime."
      : "Hindi ka nag-iisa — pwede tayong mag-usap ulit kahit kailan.",
    options: []
  })

};