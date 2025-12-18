// responses/desire.js
// Gentle Heart — DESIRE RESPONSES FLOW (FINAL, FIXED, ROUTER-SAFE)

window.RESPONSES_DESIRE = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "Sounds like there’s something you want — is this about food, or something emotional?"
      : "Mukhang may gusto ka — tungkol ba ito sa pagkain, o emosyon?",
    options: ["food", "emotional"]
  }),

  // ===== FOOD =====
  food: (lang) => ({
    text: lang === "en"
      ? "Are you actually hungry, or just craving something?"
      : "Gutom ka ba talaga, o may cravings lang?",
    options: ["hungry", "craving"]
  }),

  // ===== HUNGRY =====
  hungry: (lang) => ({
    text: lang === "en"
      ? "Do you want a quick meal, or do you want to name what you’re craving?"
      : "Gusto mo bang mabilis na kain, o pangalanan ang gusto mo?",
    options: ["quick_meal", "name_it"]
  }),

  // ===== QUICK MEAL =====
  quick_meal: (lang) => ({
    text: lang === "en"
      ? "Light and fast, or hot and filling?"
      : "Magaan at mabilis, o mainit at nakakabusog?",
    options: ["light", "filling"]
  }),

  light: (lang) => ({
    text: lang === "en"
      ? "Something light sounds good."
      : "Mukhang okay ang magaan.",
    options: ["exit"]
  }),

  filling: (lang) => ({
    text: lang === "en"
      ? "Something filling makes sense."
      : "Mukhang kailangan mo ng nakakabusog.",
    options: ["exit"]
  }),

  // ===== NAME IT =====
  name_it: (lang) => ({
    text: lang === "en"
      ? "That sounds good — do you want to talk about it, or move on?"
      : "Mukhang masarap — pag-usapan ba natin, o mag-iba na?",
    options: ["talk_about_it", "change_topic"]
  }),

  talk_about_it: (lang) => ({
    text: lang === "en"
      ? "I’m listening."
      : "Nakikinig ako.",
    options: ["exit"]
  }),

  // ===== CRAVING =====
  craving: (lang) => ({
    text: lang === "en"
      ? "Is it sweet, or savory?"
      : "Matamis ba, o maalat?",
    options: ["sweet", "savory"]
  }),

  sweet: (lang) => ({
    text: lang === "en"
      ? "Sweet cravings often mean comfort — indulge, or check in with your feelings?"
      : "Madalas comfort ang matamis — pagbigyan, o silipin ang pakiramdam?",
    options: ["indulge", "my_feelings"]
  }),

  indulge: (lang) => ({
    text: lang === "en"
      ? "Enjoying a little is okay."
      : "Okay lang mag-enjoy ng kaunti.",
    options: ["exit"]
  }),

  savory: (lang) => ({
    text: lang === "en"
      ? "Savory cravings can mean hunger — want an idea, or is that enough?"
      : "Minsan gutom ang maalat — ideya ba, o sapat na?",
    options: ["meal_idea", "enough"]
  }),

  meal_idea: (lang) => ({
    text: lang === "en"
      ? "A simple meal could help."
      : "Makakatulong ang simpleng pagkain.",
    options: ["exit"]
  }),

  enough: (lang) => ({
    text: lang === "en"
      ? "Got it — thanks for sharing."
      : "Sige — salamat sa pagsabi.",
    options: ["exit"]
  }),

  // ===== EMOTIONAL =====
  emotional: (lang) => ({
    text: lang === "en"
      ? "Does this want come from comfort, or from wanting distraction?"
      : "Aliw ba ang hanap mo, o distraction?",
    options: ["comfort", "distraction"]
  }),

  comfort: (lang) => ({
    text: lang === "en"
      ? "Do you want reassurance, or quiet company?"
      : "Pampalakas-loob ba, o tahimik na kasama?",
    options: ["reassurance", "quiet_company"]
  }),

  reassurance: (lang) => ({
    text: lang === "en"
      ? "You’re allowed to want comfort."
      : "Karapat-dapat kang umaliw.",
    options: ["exit"]
  }),

  quiet_company: (lang) => ({
    text: lang === "en"
      ? "I’m here with you."
      : "Andito lang ako.",
    options: ["exit"]
  }),

  distraction: (lang) => ({
    text: lang === "en"
      ? "Do you want light talk, or grounding?"
      : "Kwentuhan ba, o grounding?",
    options: ["light_talk", "grounding"]
  }),

  light_talk: (lang) => ({
    text: lang === "en"
      ? "We can keep things light."
      : "Pwede tayong mag-light lang.",
    options: ["exit"]
  }),

  grounding: (lang) => ({
    text: lang === "en"
      ? "Let’s slow things down together."
      : "Maghinay-hinay tayo.",
    options: ["exit"]
  }),

  // ===== MY FEELINGS (FIXED NODE) =====
  my_feelings: (lang) => ({
    text: lang === "en"
      ? "Let’s check in with how you’re feeling."
      : "Silipin natin ang nararamdaman mo.",
    options: ["exit"]
  }),

  // ===== CHANGE TOPIC =====
  change_topic: (lang) => ({
    text: lang === "en"
      ? "We can change topics anytime."
      : "Pwede tayong mag-iba ng usapan kahit kailan.",
    options: ["exit"]
  }),

  // ===== EXIT =====
  exit: (lang) => ({
    text: lang === "en"
      ? "We can keep talking, or shift to something else."
      : "Pwede pa tayong mag-usap, o lumipat sa iba.",
    options: []
  })

};