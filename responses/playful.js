// responses/playful.js
// Gentle Heart — PLAYFUL RESPONSES FLOW (FINAL, ROUTER-SAFE)

window.RESPONSES_PLAYFUL = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "Want to keep things light for a bit — fun talk, or a gentle distraction?"
      : "Gusto mo bang magaan lang muna — kwentuhang masaya, o konting distraction?",
    options: ["fun_talk", "distraction"]
  }),

  // ===== FUN TALK =====
  fun_talk: (lang) => ({
    text: lang === "en"
      ? "Nice — what kind of fun are you in the mood for?"
      : "Ayos — anong klaseng saya ang trip mo?",
    options: ["random", "simple_question"]
  }),

  random: (lang) => ({
    text: lang === "en"
      ? "Random question: coffee or tea?"
      : "Random tanong: kape o tsaa?",
    options: ["coffee", "tea"]
  }),

  coffee: (lang) => ({
    text: lang === "en"
      ? "Coffee energy it is."
      : "Mukhang team kape ka.",
    options: ["exit"]
  }),

  tea: (lang) => ({
    text: lang === "en"
      ? "Tea feels calm and cozy."
      : "Mukhang chill ang tsaa para sa’yo.",
    options: ["exit"]
  }),

  simple_question: (lang) => ({
    text: lang === "en"
      ? "Do you prefer mornings, or nights?"
      : "Mas trip mo ba ang umaga, o gabi?",
    options: ["morning", "night"]
  }),

  morning: (lang) => ({
    text: lang === "en"
      ? "Morning vibes — fresh start."
      : "Umaga — bagong simula.",
    options: ["exit"]
  }),

  night: (lang) => ({
    text: lang === "en"
      ? "Night time feels quieter."
      : "Tahimik at kalmado ang gabi.",
    options: ["exit"]
  }),

  // ===== DISTRACTION =====
  distraction: (lang) => ({
    text: lang === "en"
      ? "Got it — do you want something playful, or something calming?"
      : "Sige — playful ba, o mas kalmado?",
    options: ["playful", "calm"]
  }),

  playful: (lang) => ({
    text: lang === "en"
      ? "Let’s keep it playful — jokes, or imagination?"
      : "Gawin nating playful — biro, o imagination?",
    options: ["joke", "imagine"]
  }),

  joke: (lang) => ({
    text: lang === "en"
      ? "Here’s a gentle one: Why did the cat sit on the computer? To keep an eye on the mouse."
      : "Eto banayad: Bakit umupo ang pusa sa computer? Para bantayan ang mouse.",
    options: ["exit"]
  }),

  imagine: (lang) => ({
    text: lang === "en"
      ? "Imagine a place where you feel safe — stay there, or change topic?"
      : "Isipin ang lugar na safe ka — manatili, o mag-iba ng usapan?",
    options: ["stay_here", "change_topic"]
  }),

  stay_here: (lang) => ({
    text: lang === "en"
      ? "We can stay with that calm image."
      : "Pwede tayong manatili sa kalmadong imahen.",
    options: ["exit"]
  }),

  calm: (lang) => ({
    text: lang === "en"
      ? "Let’s slow it down — breathe once, or sit quietly?"
      : "Bagalan natin — isang hinga, o tahimik muna?",
    options: ["breathe", "sit_quietly"]
  }),

  breathe: (lang) => ({
    text: lang === "en"
      ? "One slow breath is enough."
      : "Sapat na ang isang dahan-dahang hinga.",
    options: ["exit"]
  }),

  sit_quietly: (lang) => ({
    text: lang === "en"
      ? "Quiet moments count too."
      : "Mahalaga rin ang katahimikan.",
    options: ["exit"]
  }),

  // ===== CHANGE TOPIC =====
  change_topic: (lang) => ({
    text: lang === "en"
      ? "We can switch topics anytime."
      : "Pwede tayong mag-iba ng usapan kahit kailan.",
    options: ["exit"]
  }),

  // ===== EXIT =====
  exit: (lang) => ({
    text: lang === "en"
      ? "That was nice — we can talk again anytime."
      : "Ayos yun — pwede tayong mag-usap ulit kahit kailan.",
    options: []
  })

};