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

  cp_overview: [
    "cerebral palsy","ano ang cp","ano ang cerebral palsy","about cp","cp"
  ],

  greetings: [
    "hello","hi","hey","kumusta","kamusta",
    "good morning","good evening"
  ],

  hotline: [
    "hotline","emergency","crisis","suicide","urgent","agarang tulong"
  ]
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
