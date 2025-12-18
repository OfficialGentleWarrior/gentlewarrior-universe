// responses/grounding.js
// Gentle Heart — GROUNDING RESPONSES FLOW (FINAL, 2-OPTIONS ONLY, ROUTER-SAFE)

window.RESPONSES_GROUNDING = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "Let’s ground for a moment — breathing, or body awareness?"
      : "Mag-ground muna tayo — hinga, o pakiramdam ng katawan?",
    options: ["breathing", "body"]
  }),

  // ===== BREATHING =====
  breathing: (lang) => ({
    text: lang === "en"
      ? "Slow breathing helps — one deep breath, or a short rhythm?"
      : "Nakakatulong ang mabagal na hinga — isang malalim, o maikling ritmo?",
    options: ["one_breath", "breathing_rhythm"]
  }),

  one_breath: (lang) => ({
    text: lang === "en"
      ? "Inhale slowly… exhale gently."
      : "Huminga nang dahan-dahan… ilabas nang marahan.",
    options: ["exit", "breathing"]
  }),

  breathing_rhythm: (lang) => ({
    text: lang === "en"
      ? "Inhale for 4, exhale for 6."
      : "Hinga 4, labas 6.",
    options: ["breathing_rhythm", "exit"]
  }),

  // ===== BODY =====
  body: (lang) => ({
    text: lang === "en"
      ? "Let’s notice your body — relax tension, or just observe?"
      : "Pansinin natin ang katawan — mag-relax, o obserbahan lang?",
    options: ["relax", "observe"]
  }),

  relax: (lang) => ({
    text: lang === "en"
      ? "Soften your shoulders and jaw."
      : "Paluwagin ang balikat at panga.",
    options: ["exit", "body"]
  }),

  observe: (lang) => ({
    text: lang === "en"
      ? "Notice where your body feels supported."
      : "Pansinin kung saan sinusuportahan ang katawan mo.",
    options: ["exit", "body"]
  }),

  // ===== EXIT =====
  exit: (lang) => ({
    text: lang === "en"
      ? "You’re more grounded now."
      : "Mas grounded ka na ngayon.",
    options: []
  })

};