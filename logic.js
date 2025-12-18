// logic.js
// Gentle Heart — Stateful Logic Router (FINAL, FIXED)
// INFO follow-up works correctly

(function () {

  // ================= STATE =================
  let currentModule = null;
  let currentNode = "entry";
  let currentLanguage = "en";
  let pendingFollowup = null; // ✅ IMPORTANT

  // ================= NORMALIZE =================
  function normalize(text) {
    return text.toLowerCase().trim();
  }

  // ================= LANGUAGE DETECT =================
  const ENGLISH_MARKERS = [
    "what","why","how","when","where","who",
    "is","are","can","does","do",
    "cerebral","palsy","cp","therapy","cause","type",
    "feel","feeling","sad","tired","happy","stress",
    "want","need","food","talk"
  ];

  function detectLanguage(text) {
    const t = normalize(text);
    return ENGLISH_MARKERS.some(w => t.includes(w)) ? "en" : "tl";
  }

  // ================= INTENT DETECT =================
  function detectIntent(text) {
    const t = normalize(text);

    if (/\b(cp|cerebral\s+palsy|therapy|cause|type|symptom)\b/.test(t)) return "INFO";
    if (/\b(feel|sad|happy|tired|pagod|malungkot)\b/.test(t)) return "FEELING";
    if (/\b(want|gusto|food|kain|gutom)\b/.test(t)) return "DESIRE";
    if (/\b(help|support|hirap|nahihirapan)\b/.test(t)) return "SUPPORT";
    if (/\b(joke|funny|haha|trip|biro)\b/.test(t)) return "PLAYFUL";
    if (/\b(breath|hinga|calm|relax)\b/.test(t)) return "GROUNDING";
    if (/\b(emergency|suicide|panic)\b/.test(t)) return "HELP";

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
    currentLanguage = detectLanguage(text);

    /// ================= FOLLOW-UP HANDLER (INFO ONLY) =================
if (pendingFollowup && pendingFollowup.type === "INFO") {
  pendingFollowup = null;

  // 🔑 FORCE LANGUAGE BASED ON USER REPLY
  currentLanguage = detectLanguage(userText);

  if (text.includes("simple")) {
    return {
      text: currentLanguage === "en"
        ? "Cerebral palsy is a condition that affects movement and posture because the brain developed differently early on."
        : "Ang cerebral palsy ay kondisyon na nakaapekto sa galaw at postura dahil sa maagang pag-develop ng utak.",
      options: []
    };
  }

  if (text.includes("daily") || text.includes("life") || text.includes("araw")) {
    return {
      text: currentLanguage === "en"
        ? "In daily life, CP can affect walking, balance, speech, or muscle control, but therapy and support help a lot."
        : "Sa araw-araw, puwedeng maapektuhan ang paglakad, balanse, pagsasalita, o muscles, pero malaking tulong ang therapy.",
      options: []
    };
  }
}

    // ================= RESET STATE =================
    currentModule = null;
    currentNode = "entry";

    // ================= START NEW FLOW =================
    const intent = detectIntent(text);
    const moduleGetter = RESPONSE_MODULES[intent];
    currentModule = moduleGetter ? moduleGetter() : window.RESPONSES_OPEN;

    if (!currentModule || typeof currentModule.entry !== "function") {
      currentModule = window.RESPONSES_OPEN;
    }

    const response = currentModule.entry(currentLanguage);

    // ================= SET FOLLOW-UP =================
    if (intent === "INFO") {
      pendingFollowup = { type: "INFO" };
    }

    return {
      text: response.text,
      options: response.options || []
    };
  }

  // expose globally
  window.routeMessage = routeMessage;

})();
