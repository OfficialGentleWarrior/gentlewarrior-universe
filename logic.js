// logic.js — Gentle Heart Logic Router v1 (FINAL)

let lastCategory = null;

// ================= KEYWORDS =================
const CATEGORY_KEYWORDS = {
  mood: [
    "mood","pakiramdam","feeling","feelings","nararamdaman",
    "emotion","emosyon","kamusta","okay","hindi okay",
    "mabigat","magaan","empty","walang laman",
    "down","low","malungkot","pagod"
  ],

  cp_overview: [
    "cerebral palsy","ano ang cp","about cp","cp overview","cp"
  ],

  food: ["food","pagkain","kain","gutom","hungry"],
  greetings: ["hello","hi","hey","kumusta"],
  fallback: []
};

// ================= UTILITIES =================
function normalize(text){
  return text.toLowerCase().replace(/[^\w\s]/g,"").trim();
}

// ================= LANGUAGE =================
function detectLanguage(text){
  const tl = ["ako","ikaw","ka","ko","mo","hindi","wala","gusto","kumusta"];
  const t = normalize(text);
  return tl.some(w => t.includes(w)) ? "tl" : "en";
}

// ================= CATEGORY =================
function detectCategory(text){
  const t = normalize(text);
  for (const cat in CATEGORY_KEYWORDS) {
    if (CATEGORY_KEYWORDS[cat].some(w => t.includes(w))) {
      return cat;
    }
  }
  return "fallback";
}

// ================= ROUTER =================
function routeMessage(userText){

  if (!window.REPLIES) {
    console.error("REPLIES not loaded");
    return {
      text: "System error. Please refresh.",
      options: []
    };
  }

  const language = detectLanguage(userText);
  let category = detectCategory(userText);

  // ✅ CONTEXT CARRY
  const followUps = ["magkwento","kwento","makinig","makinig lang"];
  if (
    lastCategory &&
    followUps.includes(normalize(userText))
  ) {
    category = lastCategory;
  }

  const replySet = window.REPLIES[category] || window.REPLIES.fallback;
  const reply = replySet[language] || replySet.en;

  lastCategory = category;

  return {
    text: reply.text,
    options: reply.options
  };
}

window.routeMessage = routeMessage;
