// logic.js
// Gentle Heart — Logic Router v1.2 (STABLE, COMPLETE)
// Depends on: replies.js (REPLIES v1)

// ================= STATE =================
let lastCategory = null;
let lastLanguage = "en";
let lastStep = 0;

// ================= KEYWORDS =================
const CATEGORY_KEYWORDS = {

  mood: [
    "mood","pakiramdam","feeling","feelings","nararamdaman",
    "emotion","emosyon","kamusta","okay","hindi okay",
    "mabigat","magaan","empty","walang laman",
    "down","low","malungkot","pagod",
    "kwento","magkwento","makinig","makinig lang"
  ],

  cp_overview: [
    "cerebral palsy","ano ang cp","ano ang cerebral palsy","about cp","cp overview"
  ],

  greetings: [
    "hello","hi","hey","kumusta","good morning","good evening"
  ],

  hotline: [
    "hotline","emergency","crisis","suicide","urgent","agarang tulong"
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
    "ako","ikaw","ka","ko","mo","hindi","oo","wala","meron",
    "gusto","pagod","kumusta","ano","bakit","paano","lang",
    "kwento","magkwento","makinig"
  ];
  const t = normalize(text);
  return tagalogMarkers.some(w => t.includes(w)) ? "tl" : "en";
}

// ================= CATEGORY DETECT =================
function detectCategory(text){
  const t = normalize(text);

  for (const category in CATEGORY_KEYWORDS) {
    if (CATEGORY_KEYWORDS[category].some(w => t.includes(w))) {
      return category;
    }
  }
  return "fallback";
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

  const clean = normalize(userText);
  let language = detectLanguage(userText);
  let category = detectCategory(userText);

  const contextWords = ["kwento","magkwento","makinig","makinig lang"];

  // ===== CONTEXT CARRY =====
  if (lastCategory && contextWords.includes(clean)) {
    category = lastCategory;
    language = lastLanguage;
    lastStep++;
  } else {
    lastStep = 0;
  }

  lastCategory = category;
  lastLanguage = language;

  // ===== STEP RESPONSE (MOOD FLOW) =====
  if (category === "mood" && lastStep === 1) {
    return {
      category,
      language,
      text:
        language === "tl"
          ? "Sige — ano ang gusto mong ikwento, o ano ang mabigat sa’yo ngayon?"
          : "Alright — what would you like to share, or what’s been heavy lately?",
      options: []
    };
  }

  // ===== DEFAULT =====
  const replySet = REPLIES[category] || REPLIES.fallback;
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
