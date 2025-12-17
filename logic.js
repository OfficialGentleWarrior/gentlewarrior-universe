// logic.js
// Gentle Heart — Logic Router v1
// Depends on: replies.js (REPLIES v1)

// ================= KEYWORDS =================

const CATEGORY_KEYWORDS = {

  mood: [
  "mood","pakiramdam","feeling","feelings","nararamdaman","emotion","emosyon","kamusta","okay","hindi okay","mabigat","magaan","empty","walang laman","down","low","malungkot","pagod","kwento","magkwento","makinig","makinig lang"
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
    "cerebral palsy","ano ang cp","about cp","cp overview"
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

// ================= UTILITIES =================

function normalize(text){
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

// ================= LANGUAGE DETECT =================

function detectLanguage(text){
  const tagalogMarkers = [
    "ako","ikaw","ka","ko","mo","siya","kami","tayo",
    "hindi","oo","wala","meron","gusto","pagod",
    "kumusta","bakit","ano","paano","kasi","lang"
  ];

  const t = normalize(text);
  return tagalogMarkers.some(w => t.includes(w)) ? "tl" : "en";
}

// ================= CATEGORY DETECT =================

function detectCategory(text){
  const t = normalize(text);

  // SAFETY FIRST
  if (CATEGORY_KEYWORDS.hotline.some(w => t.includes(w))) {
    return "hotline";
  }

  for (const category in CATEGORY_KEYWORDS) {
    if (CATEGORY_KEYWORDS[category].some(w => t.includes(w))) {
      return category;
    }
  }

  return "fallback";
}

// ================= MAIN ROUTER =================
// This is the ONLY function UI should call

function routeMessage(userText){

  // SAFETY: make sure replies.js is loaded
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

  const replySet = REPLIES[category] || REPLIES.fallback;
  const reply = replySet[language] || replySet.en;

  return {
    category,
    language,
    text: reply.text,
    options: reply.options
  };
}

// expose globally for ui.js
window.routeMessage = routeMessage;
