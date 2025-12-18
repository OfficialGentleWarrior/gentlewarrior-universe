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

  // ================= INFO (CP / EDUCATION) =================
  if (
    /\b(cp|cerebral\s+palsy|therapy|therapies|cause|causes|risk|risks|type|types|diagnosis|symptom|symptoms)\b/.test(t)
  ) {
    return "INFO";
  }

  // ================= FEELING (EMOTIONS) =================
  if (
    /\b(feel|feeling|feelings|emotion|emotions|sad|happy|tired|stress|stressed|anxious|down|
       pagod|malungkot|masaya|naiiyak|naiinis|kinakabahan|okay\s+lang|hindi\s+okay)\b/x.test(t)
  ) {
    return "FEELING";
  }

  // ================= DESIRE (WANTS / FOOD / CRAVINGS) =================
  if (
    /\b(want|wants|need|needs|crave|craving|food|eat|eating|hungry|
       gusto|kain|kumain|gutom|dessert|matamis|maalat)\b/x.test(t)
  ) {
    return "DESIRE";
  }

  // ================= SUPPORT (STRUGGLE / CARE) =================
  if (
    /\b(help|support|struggle|hard|difficult|overwhelmed|
       hirap|nahihirapan|pagod\s+na|di\s+kaya|kailangan\s+ng\s+tulong)\b/x.test(t)
  ) {
    return "SUPPORT";
  }

  // ================= PLAYFUL (LIGHT / FUN / GENZ) =================
  if (
    /\b(crush|joke|funny|lol|haha|vibes|mood|trip|
       biro|kulit|kilig|asaran)\b/x.test(t)
  ) {
    return "PLAYFUL";
  }

  // ================= GROUNDING (CALM / BREATHING) =================
  if (
    /\b(breath|breathe|breathing|calm|relax|ground|grounding|panic|
       hinga|huminga|kalma|relax\s+muna)\b/x.test(t)
  ) {
    return "GROUNDING";
  }

  // ================= HELP (CRISIS / EMERGENCY) =================
  if (
    /\b(emergency|hotline|suicide|kill\s+myself|self\s+harm|panic\s+attack|
       gusto\s+kong\s+mawala|ayoko\s+na|saktan\s+ang\s+sarili)\b/x.test(t)
  ) {
    return "HELP";
  }

  // ================= DEFAULT =================
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
