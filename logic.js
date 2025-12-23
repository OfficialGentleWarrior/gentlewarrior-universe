// logic.js — Gentle Heart BRANCHING ROUTER (FINAL CLEAN)

(function () {

  // ================= STATE =================
  let currentModule = null;
  let currentNode = "entry";
  let currentLanguage = "en";

  // ================= HELPERS =================
  function normalize(text) {
    return text.toLowerCase().trim();
  }

  // ================= LANGUAGE DETECT =================
  function detectLanguage(text) {
    const t = text.toLowerCase();

    const enHits = [
      "what","why","how","is","are","do","does",
      "daily","life","simple","explanation",
      "therapy","types","causes","example","adaptation"
    ];

    const tlHits = [
      "ano","bakit","paano","araw","buhay",
      "simpleng","paliwanag","halimbawa",
      "pag-angkop","uri","sanhi"
    ];

    const enScore = enHits.filter(w => t.includes(w)).length;
    const tlScore = tlHits.filter(w => t.includes(w)).length;

    if (enScore > tlScore) return "en";
    if (tlScore > enScore) return "tl";

    // fallback: keep current
    return currentLanguage || "en";
  }

  // ================= INTENT DETECT =================
  function detectIntent(text) {
    const t = normalize(text);

    if (/\b(cp|cerebral)\b/.test(t)) return "INFO";
    if (/\b(feel|pagod|sad|tired)\b/.test(t)) return "FEELING";
    if (/\b(eat|food|kain|gutom)\b/.test(t)) return "DESIRE";
    if (/\b(help|hirap|support)\b/.test(t)) return "SUPPORT";
    if (/\b(joke|haha|lol)\b/.test(t)) return "PLAYFUL";
    if (/\b(breath|hinga|calm)\b/.test(t)) return "GROUNDING";
    if (/\b(suicide|hotline|emergency)\b/.test(t)) return "HELP";

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

  // ================= OPTION MATCHER =================
  function matchOption(userText, options) {
    const t = normalize(userText).replace(/\s+/g, "_");
    return options.find(opt => t.includes(opt));
  }

  // ================= MAIN ROUTER =================
  function routeMessage(userText) {
    const text = normalize(userText);

    // 🔑 Update language PER MESSAGE
    const detectedLang = detectLanguage(text);
    if (detectedLang) {
      currentLanguage = detectedLang;
    }

    // ===== CONTINUE EXISTING BRANCH =====
    if (
      currentModule &&
      currentModule[currentNode] &&
      typeof currentModule[currentNode] === "function"
    ) {
      const node = currentModule[currentNode](currentLanguage);
      const nextKey = matchOption(text, node.options || []);

      if (nextKey && typeof currentModule[nextKey] === "function") {
        currentNode = nextKey;
        const next = currentModule[currentNode](currentLanguage);
        return {
          text: next.text,
          options: next.options || []
        };
      }
    }

    // ===== START NEW FLOW =====
    const intent = detectIntent(text);
    currentModule = RESPONSE_MODULES[intent]?.() || window.RESPONSES_OPEN;
    currentNode = "entry";

    if (!currentModule || typeof currentModule.entry !== "function") {
      currentModule = window.RESPONSES_OPEN;
    }

    const entry = currentModule.entry(currentLanguage);
    return {
      text: entry.text,
      options: entry.options || []
    };
  }

  // ================= EXPOSE =================
  window.routeMessage = routeMessage;

})();
