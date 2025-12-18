// logic.js
// Gentle Heart — Core Logic Router (STATEFUL, FINAL, SAFE)

// ================= NORMALIZE =================
function normalize(text) {
  return (text || "").toLowerCase().trim();
}

// ================= LANGUAGE DETECT =================
const ENGLISH_MARKERS = [
  "what","why","how","when","where","who",
  "is","are","can","does","do",
  "cerebral","palsy","cp","therapy","cause","causes","type","types",
  "feel","feeling","sad","tired","happy","stress","help","support",
  "want","need","sleep","food","talk"
];

function detectLanguage(text) {
  const t = normalize(text);
  return ENGLISH_MARKERS.some(w => t.includes(w)) ? "en" : "tl";
}

// ================= INTENT DETECT =================
function detectIntent(text) {
  const t = normalize(text);

  if (/(cp|cerebral palsy|therapy|cause|causes|type|types)/.test(t)) return "INFO";
  if (/(feel|feeling|sad|happy|pagod|malungkot|kilig)/.test(t)) return "FEELING";
  if (/(want|gusto|crave|food|kain|dessert)/.test(t)) return "DESIRE";
  if (/(help|hirap|support|tulong|nahihirapan)/.test(t)) return "SUPPORT";
  if (/(crush|joke|vibes|trip|biro)/.test(t)) return "PLAYFUL";
  if (/(breath|hinga|calm|relax)/.test(t)) return "GROUNDING";
  if (/(emergency|hotline|suicide|panic|atak)/.test(t)) return "HELP";

  return "OPEN";
}

// ================= RESPONSE MODULE MAP =================
const RESPONSE_MODULES = {
  INFO: () => window.RESPONSES_INFO_CP,
  FEELING: () => window.RESPONSES_FEELING,
  DESIRE: () => window.RESPONSES_DESIRE,
  SUPPORT: () => window.RESPONSES_SUPPORT,
  PLAYFUL: () => window.RESPONSES_PLAYFUL,
  GROUNDING: () => window.RESPONSES_GROUNDING,
  HELP: () => window.RESPONSES_HELP,
  OPEN: () => window.RESPONSES_OPEN
};

// ================= CONVERSATION STATE =================
let currentIntent = null;
let currentNode = "entry";

// ================= MAIN ROUTER =================
function routeMessage(userText, selectedNode = null) {
  const language = detectLanguage(userText);

  // 🔹 If user selected an option, move node
  if (selectedNode) {
    currentNode = selectedNode;
  }

  // 🔹 First message or reset
  if (!currentIntent) {
    currentIntent = detectIntent(userText);
    currentNode = "entry";
  }

  const moduleGetter = RESPONSE_MODULES[currentIntent];
  const module = moduleGetter ? moduleGetter() : null;

  // 🔥 SAFETY RESET
  if (!module || typeof module[currentNode] !== "function") {
    currentIntent = null;
    currentNode = "entry";
    return {
      language,
      intent: "OPEN",
      text:
        language === "en"
          ? "I’m here — do you want to keep talking or change the topic?"
          : "Andito lang ako — gusto mo bang magpatuloy o mag-iba ng usapan?",
      options: []
    };
  }

  const response = module[currentNode](language);

  return {
    language,
    intent: currentIntent,
    text: response.text,
    options: response.options || []
  };
}

// ================= RESET (OPTIONAL) =================
function resetConversation() {
  currentIntent = null;
  currentNode = "entry";
}

// expose globally
window.routeMessage = routeMessage;
window.resetConversation = resetConversation;
