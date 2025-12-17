// logic.js
// Gentle Heart — Logic Router v1 FINAL
// Depends on: replies.js (global REPLIES)

// ================= STATE =================
let lastCategory = null;
let lastLanguage = "en";

// ================= KEYWORDS =================
const CATEGORY_KEYWORDS = {

  mood: [
    "mood","pakiramdam","feeling","feelings","nararamdaman",
    "emotion","emosyon","kamusta","kumusta","okay","hindi okay",
    "mabigat","magaan","empty","walang laman",
    "down","low","malungkot","pagod",
    "kwento","magkwento","makinig","makinig lang"
  ],

  food: [
    "food","pagkain","eat","eating","kain","hungry","gutom",
    "dessert","panghimagas","snack","meryenda",
    "lunch","dinner","breakfast","ulam","inumin"
  ],

  genz: [
    "genz","slang","vibes","vibe","slay","bet","rizz",
    "flex","cringe","sus","iykyk","lit","bussin"
  ],

  hobby: [
    "hobby","hobbies","libangan","free time","bakanteng oras",
    "interests","pastime","talent","skills","trip"
  ],

  crush: [
    "crush","like","gusto","may gusto","love","mahal",
    "dating","ligaw","ligawan","relationship","heartbreak"
  ],

  cp_overview: [
    "cerebral palsy","ano ang cp","ano ang cerebral palsy",
    "about cp","cp overview","cp"
  ],

  cp_signs: [
    "cp signs","palatandaan","symptoms","sintomas",
    "delayed","hirap gumalaw","stiff","spastic"
  ],

  cp_therapy: [
    "therapy","physical therapy","occupational therapy",
    "speech therapy","rehab","ehersisyo"
  ],

  care_tips: [
    "care","care tips","alaga","pag-aalaga",
    "daily care","routine care","support care"
  ],

  emotional_support: [
    "help","tulong","need help","someone to talk",
    "lonely","nag-iisa","makinig","comfort","aliw"
  ],

  family_support: [
    "family","pamilya","parents","magulang",
    "mother","father","nanay","tatay","siblings"
  ],

  daily_life: [
    "daily life","araw-araw","routine","schedule","iskedyul"
  ],

  medical: [
    "medical","doctor","doktor","medicine","gamot",
    "diagnosis","checkup","hospital","treatment","reseta"
  ],

  anxiety_stress: [
    "anxiety","stress","panic","panic attack",
    "balisa","nerbyos","overwhelmed","burnout"
  ],

  sleep: [
    "sleep","tulog","antok","insomnia",
    "hirap matulog","puyat","rest","pahinga"
  ],

  hotline: [
    "hotline","emergency","crisis",
    "suicide","urgent","agarang tulong"
  ],

  cp_meaning: [
    "meaning of cp","ibig sabihin","definition","kahulugan"
  ],

  cp_specifics: [
    "types of cp","uri ng cp","severity",
    "mild cp","severe cp","classification"
  ],

  parenting_cp: [
    "parenting","raising","magulang ng cp",
    "alaga ng bata","child with cp"
  ],

  social_support: [
    "friends","kaibigan","community","komunidad",
    "support group","social life"
  ],

  casual: [
    "casual","random","chill","fun",
    "small talk","kwentuhan"
  ],

  rant: [
    "rant","complain","reklamo",
    "angry","galit","inis","frustrated","bwisit","vent"
  ],

  greetings: [
    "hello","hi","hey","kumusta",
    "good morning","good evening"
  ],

  kids_safe: [
    "kids","bata","child","kid safe",
    "simple explanation","madaling intindihin"
  ],

  bot_intro: [
    "who are you","sino ka","what are you",
    "bot ka ba","what can you do","anong kaya mo"
  ],

  language: [
    "language","wika","tagalog","english",
    "change language","palitan ang wika"
  ],

  settings: [
    "settings","options","privacy",
    "kids mode","private mode","clear history","reset chat"
  ],

  grounding: [
    "grounding","breathing","hinga",
    "inhale","exhale","calm","relax","focus"
  ],

  encouragement: [
    "encouragement","affirmation",
    "you got this","kaya mo yan",
    "stay strong","hope","motivation"
  ],

  fallback: []
};

// ================= UTIL =================
function normalize(text){
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

// ================= LANGUAGE =================
function detectLanguage(text){
  const tlMarkers = [
    "ako","ikaw","ka","ko","mo","hindi","oo","wala","meron",
    "gusto","pagod","kumusta","ano","bakit","paano","lang",
    "kwento","makinig"
  ];
  const t = normalize(text);
  return tlMarkers.some(w => t.includes(w)) ? "tl" : "en";
}

// ================= CATEGORY =================
function detectCategory(text){
  const t = normalize(text);

  for (const cat in CATEGORY_KEYWORDS) {
    if (CATEGORY_KEYWORDS[cat].some(k => t.includes(k))) {
      return cat;
    }
  }

  return lastCategory || "mood"; // ✅ NO DEAD END
}

// ================= MAIN ROUTER =================
function routeMessage(userText){

  if (typeof REPLIES === "undefined") {
    return {
      category: "error",
      language: "en",
      text: "Replies not loaded.",
      options: []
    };
  }

  const language = detectLanguage(userText);
  const category = detectCategory(userText);

  lastCategory = category;
  lastLanguage = language;

  const replySet = REPLIES[category] || REPLIES.fallback;
  const reply = replySet[language] || replySet.en;

  return {
    category,
    language,
    text: reply.text,
    options: [] // ❌ NOT USED
  };
}

// expose globally
window.routeMessage = routeMessage;
