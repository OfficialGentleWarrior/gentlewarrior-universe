// responses/desire.js
// Gentle Heart — DESIRE RESPONSES FLOW (REVISED, LINKED TO INFO + FEELING)

window.RESPONSES_DESIRE = {

  // ===== ENTRY (from INFO / FEELING jumps) =====
  entry: (lang) => ({
    text: lang === "en"
      ? "Let’s check in with what you might need — is this about food, or comfort?"
      : "Silipin natin ang kailangan mo — tungkol ba ito sa pagkain, o comfort?",
    options: ["food", "comfort"]
  }),

  // ===== FOOD PATH =====
  food: (lang) => ({
    text: lang === "en"
      ? "Are you actually hungry, or just craving something?"
      : "Gutom ka ba talaga, o may cravings lang?",
    options: ["hungry", "craving"]
  }),

  hungry: (lang) => ({
    text: lang === "en"
      ? "Do you want something quick, or something more filling?"
      : "Gusto mo ba ng mabilis lang, o mas nakakabusog?",
    options: ["quick", "filling"]
  }),

  quick: (lang) => ({
    text: lang === "en"
      ? "Something light and easy can help — do you want to rest after, or check in with how you feel?"
      : "Makakatulong ang magaan at madali — gusto mo bang magpahinga, o silipin ang nararamdaman mo?",
    options: ["__INTENT_FEELING__", "__INTENT_INFO__"]
  }),

  filling: (lang) => ({
    text: lang === "en"
      ? "A filling meal can ground you — do you want to talk about how you feel after, or shift topics?"
      : "Nakakatulong ang nakakabusog — gusto mo bang pag-usapan ang pakiramdam mo, o mag-iba ng usapan?",
    options: ["__INTENT_FEELING__", "__INTENT_INFO__"]
  }),

  craving: (lang) => ({
    text: lang === "en"
      ? "Is the craving more about comfort, or just taste?"
      : "Comfort ba ang hanap ng craving, o lasa lang?",
    options: ["comfort", "taste"]
  }),

  taste: (lang) => ({
    text: lang === "en"
      ? "Enjoying a little is okay — do you want to stay here, or talk about something else?"
      : "Okay lang mag-enjoy ng kaunti — gusto mo bang manatili dito, o mag-usap ng iba?",
    options: ["__INTENT_FEELING__", "__INTENT_INFO__"]
  }),

  // ===== COMFORT / EMOTIONAL DESIRE =====
  comfort: (lang) => ({
    text: lang === "en"
      ? "Do you want reassurance, or quiet company?"
      : "Pampalakas-loob ba ang kailangan mo, o tahimik na kasama?",
    options: ["reassurance", "quiet_company"]
  }),

  reassurance: (lang) => ({
    text: lang === "en"
      ? "You’re allowed to want comfort — do you want to talk about how you feel, or pause quietly?"
      : "Karapat-dapat kang umaliw — gusto mo bang pag-usapan ang nararamdaman mo, o manahimik muna?",
    options: ["__INTENT_FEELING__", "__INTENT_GROUNDING__"]
  }),

  quiet_company: (lang) => ({
    text: lang === "en"
      ? "I’m here with you — do you want to sit quietly, or check in with another need?"
      : "Andito lang ako — gusto mo bang manahimik, o silipin ang ibang kailangan?",
    options: ["__INTENT_GROUNDING__", "__INTENT_FEELING__"]
  })

};
