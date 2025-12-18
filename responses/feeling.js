// responses/feeling.js
// Gentle Heart — FEELING RESPONSES FLOW (FINAL, VERIFIED, SAFE)

window.RESPONSES_FEELING = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "I hear what you’re feeling — do you want to talk about it, or sit quietly for a moment?"
      : "Naririnig kita — gusto mo bang magkwento, o tahimik muna sandali?",
    options: ["talk_about_it", "sit_quietly"]
  }),

  // ===== TALK ABOUT IT =====
  talk_about_it: (lang) => ({
    text: lang === "en"
      ? "Is it more emotional, or more physical?"
      : "Mas emosyon ba ito, o pisikal?",
    options: ["emotional", "physical"]
  }),

  // ===== EMOTIONAL =====
  emotional: (lang) => ({
    text: lang === "en"
      ? "Does it feel heavy, or mixed?"
      : "Mabigat ba, o halo-halo?",
    options: ["heavy", "mixed"]
  }),

  heavy: (lang) => ({
    text: lang === "en"
      ? "Do you want to talk more, or pause first?"
      : "Gusto mo bang magpatuloy, o huminto muna?",
    options: ["talk_more", "pause"]
  }),

  mixed: (lang) => ({
    text: lang === "en"
      ? "Do you want clarity, or space?"
      : "Linaw ba ang kailangan, o espasyo?",
    options: ["seek_clarity", "take_space"]
  }),

  talk_more: (lang) => ({
    text: lang === "en"
      ? "I’m listening."
      : "Nakikinig ako.",
    options: ["exit"]
  }),

  pause: (lang) => ({
    text: lang === "en"
      ? "We can pause here."
      : "Pwede tayong huminto muna.",
    options: ["exit"]
  }),

  seek_clarity: (lang) => ({
    text: lang === "en"
      ? "Let’s gently sort it out."
      : "Ayusin natin nang dahan-dahan.",
    options: ["exit"]
  }),

  take_space: (lang) => ({
    text: lang === "en"
      ? "Space is okay."
      : "Okay lang ang espasyo.",
    options: ["exit"]
  }),

  // ===== PHYSICAL =====
  physical: (lang) => ({
    text: lang === "en"
      ? "Are you tired, or low on energy?"
      : "Pagod ka ba, o kulang sa lakas?",
    options: ["tired", "low_energy"]
  }),

  tired: (lang) => ({
    text: lang === "en"
      ? "Do you want rest, or gentle care?"
      : "Pahinga ba, o banayad na alaga?",
    options: ["rest", "gentle_care"]
  }),

  low_energy: (lang) => ({
    text: lang === "en"
      ? "Do you want to recharge, or stay as you are?"
      : "Mag-recharge ba, o okay lang muna?",
    options: ["recharge", "stay_as_is"]
  }),

  rest: (lang) => ({
    text: lang === "en"
      ? "Rest is allowed."
      : "Pwede kang magpahinga.",
    options: ["exit"]
  }),

  gentle_care: (lang) => ({
    text: lang === "en"
      ? "Gentle care matters."
      : "Mahalaga ang banayad na pag-aalaga.",
    options: ["exit"]
  }),

  recharge: (lang) => ({
    text: lang === "en"
      ? "We can recharge slowly."
      : "Dahan-dahan tayong mag-recharge.",
    options: ["exit"]
  }),

  stay_as_is: (lang) => ({
    text: lang === "en"
      ? "That’s okay too."
      : "Ayos lang din iyon.",
    options: ["exit"]
  }),

  // ===== SIT QUIETLY =====
  sit_quietly: (lang) => ({
    text: lang === "en"
      ? "Do you want quiet support, or change the topic?"
      : "Tahimik na kasama, o mag-iba ng usapan?",
    options: ["quiet_support", "change_topic"]
  }),

  quiet_support: (lang) => ({
    text: lang === "en"
      ? "I’m here with you."
      : "Andito lang ako.",
    options: ["exit"]
  }),

  change_topic: (lang) => ({
    text: lang === "en"
      ? "We can change topics anytime."
      : "Pwede tayong mag-iba ng usapan kahit kailan.",
    options: ["exit"]
  }),

  // ===== EXIT =====
  exit: (lang) => ({
    text: lang === "en"
      ? "We can talk again anytime."
      : "Pwede tayong mag-usap ulit kahit kailan.",
    options: []
  })

};