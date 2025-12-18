// logic.js
// Gentle Heart — Stateful Logic Router (FINAL, STABLE)
// Works with existing 7 response files (NO CHANGES REQUIRED)

(function () {

  // ================= STATE =================
  let currentModule = null;
  let currentNode = "entry";
  let currentLanguage = "en";

  // ================= NORMALIZE =================
  function normalize(text) {
    return text.toLowerCase().trim();
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
    /\b(feel|feeling|feelings|emotion|emotions|sad|happy|tired|stress|stressed|anxious|down|pagod|malungkot|masaya|naiiyak|naiinis|kinakabahan|okay\s+lang|hindi\s+okay)\b/.test(t)
  ) {
    return "FEELING";
  }

  // ================= DESIRE (WANTS / FOOD / CRAVINGS) =================
  if (
    /\b(want|wants|need|needs|crave|craving|food|eat|eating|hungry|gusto|kain|kumain|gutom|dessert|matamis|maalat)\b/.test(t)
  ) {
    return "DESIRE";
  }

  // ================= SUPPORT (STRUGGLE / CARE) =================
  if (
    /\b(help|support|struggle|hard|difficult|overwhelmed|hirap|nahihirapan|pagod\s+na|di\s+kaya|kailangan\s+ng\s+tulong)\b/.test(t)
  ) {
    return "SUPPORT";
  }

  // ================= PLAYFUL (LIGHT / FUN / GENZ) =================
  if (
    /\b(crush|joke|funny|lol|haha|vibes|mood|trip|biro|kulit|kilig|asaran)\b/.test(t)
  ) {
    return "PLAYFUL";
  }

  // ================= GROUNDING (CALM / BREATHING) =================
  if (
    /\b(breath|breathe|breathing|calm|relax|ground|grounding|panic|hinga|huminga|kalma|relax\s+muna)\b/.test(t)
  ) {
    return "GROUNDING";
  }

  // ================= HELP (CRISIS / EMERGENCY) =================
  if (
    /\b(emergency|hotline|suicide|kill\s+myself|self\s+harm|panic\s+attack|gusto\s+kong\s+mawala|ayoko\s+na|saktan\s+ang\s+sarili)\b/.test(t)
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

  // ================= MAIN ROUTER =================
  function routeMessage(userText) {
    const text = normalize(userText);

    // detect language once per turn
    currentLanguage = detectLanguage(text);

    // ========= CONTINUE EXISTING FLOW =========
    if (
      currentModule &&
      currentModule[currentNode] &&
      typeof currentModule[currentNode] === "function"
    ) {
      const nodeResponse = currentModule[currentNode](currentLanguage);

      // user chose an option
      if (nodeResponse.options && nodeResponse.options.includes(text)) {
        currentNode = text;

        if (typeof currentModule[currentNode] === "function") {
          const next = currentModule[currentNode](currentLanguage);
          return {
            text: next.text,
            options: next.options || []
          };
        }
      }
    }

    // ========= START NEW FLOW =========

// 🔑 RESET STATE (IMPORTANT FIX)
currentModule = null;
currentNode = "entry";

const intent = detectIntent(text);
const moduleGetter = RESPONSE_MODULES[intent];
currentModule = moduleGetter ? moduleGetter() : window.RESPONSES_OPEN;
currentNode = "entry";

if (!currentModule || typeof currentModule.entry !== "function") {
  currentModule = window.RESPONSES_OPEN;
}

const response = currentModule.entry(currentLanguage);

return {
  text: response.text,
  options: response.options || []
};
  }

  // expose globally
  window.routeMessage = routeMessage;

})();
