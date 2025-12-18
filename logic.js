// logic.js
// Gentle Heart — Keyword Router (CLEAN RESET)
// Depends on: replies.js (global REPLIES)

// ================= STATE =================
let lastCategory = null;

// ================= KEYWORDS =================
const CATEGORY_KEYWORDS = {

  mood: [
    // EN
    "mood","feeling","feelings","emotion","emotional","sad","tired","heavy","empty","down",
    // TL
    "pakiramdam","nararamdaman","emosyon","malungkot","pagod","mabigat","walang laman","okay","hindi okay","lungkot"
  ],

  emotional_support: [
    // EN
    "help","support","listen","comfort","lonely","alone","overwhelmed","stress","talk","care",
    // TL
    "tulong","suporta","makinig","aliw","nag-iisa","mag-isa","nahihirapan","stress","usap","alalay"
  ],

  rant: [
    // EN
    "rant","complain","angry","anger","frustrated","upset","mad","annoyed","vent","pissed",
    // TL
    "rant","reklamo","galit","inis","bwisit","badtrip","yamot","irita","sama ng loob","gigil"
  ],

  sleep: [
    // EN
    "sleep","sleepy","tired","insomnia","rest","wake","awake","nightmare","nap","exhausted",
    // TL
    "tulog","antok","pagod","hirap matulog","pahinga","gising","puyat","bangungot","idlip","hapo"
  ],

  food: [
    // EN
    "food","eat","eating","hungry","meal","snack","dessert","lunch","dinner","breakfast",
    // TL
    "pagkain","kain","gutom","ulam","meryenda","panghimagas","almusal","tanghalian","hapunan","inumin"
  ],

  daily_life: [
    // EN
    "daily life","routine","schedule","day","work","school","chores","time","busy","normal day",
    // TL
    "araw-araw","routine","iskedyul","trabaho","eskwela","gawain","oras","abala","pang-araw-araw","normal na araw"
  ],

  cp_support: [
    // EN
    "cerebral palsy","cp","disability","condition","support","care","therapy","child with cp","special needs","diagnosis",
    // TL
    "cerebral palsy","cp","kondisyon","kapansanan","alaga","therapy","ehersisyo","batang may cp","espesyal na pangangailangan","diagnosis"
  ],

  family_support: [
    // EN
    "family","parents","mother","father","sibling","home","caregiving","child","parenting","relatives",
    // TL
    "pamilya","magulang","nanay","tatay","kapatid","bahay","pag-aalaga","anak","pagiging magulang","kamag-anak"
  ],

  grounding: [
    // EN
    "breathing","breathe","calm","relax","grounding","focus","slow down","inhale","exhale","center",
    // TL
    "hinga","paghinga","kalma","relax","grounding","focus","dahan-dahan","inhale","exhale","sentro"
  ],

  casual: [
    // EN
    "casual","chat","talk","random","chill","fun","joke","vibes","small talk","kwento",
    // TL
    "kwentuhan","usap","random","chill","saya","biro","trip","vibes","simpleng usap","kwento"
  ]
};

// ================= UTIL =================
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

// ================= LANGUAGE =================
function detectLanguage(text) {
  const t = normalize(text);
  return CATEGORY_KEYWORDS.mood
    .filter(w => w.match(/[a-z]/i) === null)
    .some(w => t.includes(w))
    ? "tl"
    : "en";
}

// ================= CATEGORY =================
function detectCategory(text) {
  const t = normalize(text);

  for (const category in CATEGORY_KEYWORDS) {
    if (CATEGORY_KEYWORDS[category].some(k => t.includes(k))) {
      return category;
    }
  }

  return lastCategory || "cp_support"; // DEFAULT = CP + COMPANION
}

// ================= MAIN ROUTER =================
function routeMessage(userText) {

  if (typeof REPLIES === "undefined") {
    return {
      category: "error",
      language: "en",
      text: "System error.",
      options: []
    };
  }

  const language = detectLanguage(userText);
  const category = detectCategory(userText);

  lastCategory = category;

  const replySet = REPLIES[category] || REPLIES.cp_support;
  const reply = replySet[language] || replySet.en;

  return {
    category,
    language,
    text: reply.text,
    options: reply.options
  };
}

// expose globally
window.routeMessage = routeMessage;
