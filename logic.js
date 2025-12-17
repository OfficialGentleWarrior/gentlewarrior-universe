// logic.js
// Gentle Heart — Logic Router v1.1 (STABLE)

let lastCategory = null;
let lastLanguage = "en";
let lastStep = 0;

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
    "kumusta","bakit","ano","paano","kasi","lang",
    "kwento","magkwento","makinig"
  ];
  const t = normalize(text);
  return tagalogMarkers.some(w => t.includes(w)) ? "tl" : "en";
}

// ================= CATEGORY DETECT =================

function detectCategory(text){
  const t = normalize(text);

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

  // ================= CONTEXT HANDLING =================
  if (lastCategory && contextWords.includes(clean)) {
    category = lastCategory;
    language = lastLanguage;
    lastStep++;
  } else {
    lastStep = 0;
  }

  lastCategory = category;
  lastLanguage = language;

  // ================= STEP LOGIC =================
  if (category === "mood" && lastStep === 1) {
    return {
      category,
      language,
      text:
        language === "tl"
          ? "Sige — ano ang mabigat sa’yo ngayon, o saan mo gustong magsimula?"
          : "Alright — what’s been weighing on you, or where would you like to start?",
      options: []
    };
  }

  // ================= DEFAULT REPLY =================
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
