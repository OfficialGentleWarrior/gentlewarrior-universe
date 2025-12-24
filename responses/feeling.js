// responses/feeling.js
// Gentle Heart — FEELING RESPONSES FLOW (FINAL, PATTERN-MATCHED, ROUTER-SAFE)

window.RESPONSES_FEELING = {

  entry: (lang) => ({
    text: lang === "en"
      ? "I’m here with you — do you want to talk about how you’re feeling, or pause quietly for a moment?"
      : "Andito ako — gusto mo bang pag-usapan ang nararamdaman mo, o tahimik muna sandali?",
    options: ["talk_about_it", "sit_quietly"]
  }),

  talk_about_it: (lang) => ({
    text: lang === "en"
      ? "Is what you’re feeling more emotional, or more physical?"
      : "Mas emosyonal ba ito, o mas pisikal?",
    options: ["emotional", "physical"]
  }),

  emotional: (lang) => ({
    text: lang === "en"
      ? "Does it feel heavy, or more mixed and unclear?"
      : "Mabigat ba ang pakiramdam, o halo-halo at magulo?",
    options: ["heavy", "mixed"]
  }),

  heavy: (lang) => ({
    text: lang === "en"
      ? "Do you want to let it out more, or slow down for a bit?"
      : "Gusto mo bang ilabas pa, o maghinay-hinay muna?",
    options: ["talk_more", "pause"]
  }),

  mixed: (lang) => ({
    text: lang === "en"
      ? "Do you want to look for clarity, or give yourself some space?"
      : "Gusto mo bang linawin ito, o bigyan muna ng espasyo ang sarili mo?",
    options: ["seek_clarity", "take_space"]
  }),

  talk_more: (lang) => ({
    text: lang === "en"
      ? "I’m listening — do you want to keep talking, or check in with what you need?"
      : "Nakikinig ako — magpapatuloy ba tayo, o silipin ang kailangan mo?",
    options: ["talk_about_it", "__INTENT_DESIRE__"]
  }),

  pause: (lang) => ({
    text: lang === "en"
      ? "That’s okay — do you want to stay here quietly, or slow things down further?"
      : "Okay lang — manatili muna dito, o maghinay-hinay pa?",
    options: ["sit_quietly", "__INTENT_GROUNDING__"]
  }),

  seek_clarity: (lang) => ({
    text: lang === "en"
      ? "Let’s take it gently — do you want to talk it through, or step back a little?"
      : "Dahan-dahan lang — pag-usapan ba natin, o umatras muna?",
    options: ["talk_about_it", "sit_quietly"]
  }),

  take_space: (lang) => ({
    text: lang === "en"
      ? "Space can help — do you want quiet time, or check in with another need?"
      : "Nakakatulong ang espasyo — tahimik muna, o silipin ang ibang kailangan?",
    options: ["sit_quietly", "__INTENT_DESIRE__"]
  }),

  physical: (lang) => ({
    text: lang === "en"
      ? "Is it more about feeling tired, or just low on energy?"
      : "Mas pagod ba ang katawan mo, o kulang lang sa lakas?",
    options: ["tired", "low_energy"]
  }),

  tired: (lang) => ({
    text: lang === "en"
      ? "Do you want rest, or something comforting right now?"
      : "Pahinga ba ang kailangan mo, o konting comfort?",
    options: ["sit_quietly", "__INTENT_DESIRE__"]
  }),

  low_energy: (lang) => ({
    text: lang === "en"
      ? "Do you want to recharge, or keep things very light?"
      : "Gusto mo bang mag-recharge, o magaan lang muna?",
    options: ["__INTENT_DESIRE__", "__INTENT_GROUNDING__"]
  }),

  sit_quietly: (lang) => ({
  text: lang === "en"
    ? "We can sit quietly together, or we can check in with what you might need right now — which feels better?"
    : "Pwede tayong manahimik magkasama, o silipin kung ano ang kailangan mo ngayon — alin ang mas okay?",
  options: ["__INTENT_GROUNDING__", "__INTENT_DESIRE__"]
})

};
