// responses/grounding.js
// Gentle Heart — GROUNDING RESPONSES FLOW (FINAL, NO DEAD-ENDS, 2 OPTIONS ONLY)

window.RESPONSES_GROUNDING = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "Let’s ground for a moment — do you want to focus on breathing, or body awareness?"
      : "Mag-ground muna tayo — hinga ba, o pakiramdam ng katawan?",
    options: ["breathing", "body"]
  }),

  // ===== BREATHING =====
  breathing: (lang) => ({
    text: lang === "en"
      ? "Slow breathing helps — do you want one deep breath, or a short rhythm?"
      : "Nakakatulong ang mabagal na hinga — isang malalim ba, o maikling ritmo?",
    options: ["one_breath", "breathing_rhythm"]
  }),

  one_breath: (lang) => ({
    text: lang === "en"
      ? "After one deep breath, do you want to check in with how you feel, or return to your needs?"
      : "Pagkatapos ng isang malalim na hinga, gusto mo bang silipin ang nararamdaman mo, o balikan ang kailangan mo?",
    options: ["__INTENT_FEELING__", "__INTENT_DESIRE__"]
  }),

  breathing_rhythm: (lang) => ({
    text: lang === "en"
      ? "After a breathing rhythm, do you want to continue grounding, or check in with your needs?"
      : "Pagkatapos ng ritmo ng paghinga, gusto mo bang magpatuloy sa grounding, o silipin ang kailangan mo?",
    options: ["breathing", "__INTENT_DESIRE__"]
  }),

  // ===== BODY =====
  body: (lang) => ({
    text: lang === "en"
      ? "Let’s notice your body — do you want to relax tension, or simply observe?"
      : "Pansinin natin ang katawan — mag-relax ba ng tension, o obserbahan lang?",
    options: ["relax", "observe"]
  }),

  relax: (lang) => ({
    text: lang === "en"
      ? "After relaxing your body, do you want to check in with how you feel, or focus on another need?"
      : "Pagkatapos mag-relax ng katawan, gusto mo bang silipin ang nararamdaman mo, o tumingin sa ibang kailangan?",
    options: ["__INTENT_FEELING__", "__INTENT_DESIRE__"]
  }),

  observe: (lang) => ({
    text: lang === "en"
      ? "After observing your body, do you want to continue grounding, or check in with how you feel?"
      : "Pagkatapos obserbahan ang katawan mo, gusto mo bang magpatuloy sa grounding, o silipin ang nararamdaman mo?",
    options: ["body", "__INTENT_FEELING__"]
  })

};
