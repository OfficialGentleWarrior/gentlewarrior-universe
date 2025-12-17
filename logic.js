// logic.js — FINAL FIXED v1.1

let lastCategory = null;

// ================= UTILITIES =================
function normalize(text){
  return text.toLowerCase().replace(/[^\w\s]/g,"").trim();
}

// ================= LANGUAGE =================
function detectLanguage(text){
  const tl = ["ako","ikaw","ka","ko","mo","hindi","wala","gusto","pagod","kumusta"];
  const t = normalize(text);
  return tl.some(w => t.includes(w)) ? "tl" : "en";
}

// ================= CATEGORY =================
function detectCategory(text){
  const t = normalize(text);

  if (CATEGORY_KEYWORDS.hotline.some(w => t.includes(w))) {
    return "hotline";
  }

  for (const cat in CATEGORY_KEYWORDS) {
    if (CATEGORY_KEYWORDS[cat].some(w => t.includes(w))) {
      return cat;
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
      text: "System error. Please refresh.",
      options: []
    };
  }

  const language = detectLanguage(userText);
  let category = detectCategory(userText);
  const clean = normalize(userText);

  // ✅ OPTION A — CONTEXT CARRY
  if (
    lastCategory &&
    ["kwento","magkwento","makinig","makinig lang","kwentuhan"].includes(clean)
  ) {
    category = lastCategory;
  }

  const replySet = REPLIES[category] || REPLIES.fallback;
  const reply = replySet[language] || replySet.en;

  lastCategory = category;

  return {
    category,
    language,
    text: reply.text,
    options: reply.options
  };
}

window.routeMessage = routeMessage;
