// logic.js — Gentle Heart BRANCHING ROUTER (STABLE)

(function () {

  let currentModule = null;
  let currentNode = "entry";
  let currentLanguage = "en";

  function normalize(text) {
    return text.toLowerCase().trim();
  }

  function detectLanguage(text) {
    return /\b(what|why|how|is|are|cp|cerebral|therapy)\b/i.test(text)
      ? "en"
      : "tl";
  }

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

  function matchOption(userText, options) {
    const t = normalize(userText).replace(/\s+/g, "_");
    return options.find(opt => t.includes(opt));
  }

  function routeMessage(userText) {
    const text = normalize(userText);
    currentLanguage = detectLanguage(text);

    // ===== CONTINUE BRANCH =====
    if (
      currentModule &&
      currentModule[currentNode]
    ) {
      const node = currentModule[currentNode](currentLanguage);
      const nextKey = matchOption(text, node.options || []);

      if (nextKey && typeof currentModule[nextKey] === "function") {
        currentNode = nextKey;
        const next = currentModule[currentNode](currentLanguage);
        return { text: next.text, options: next.options || [] };
      }
    }

    // ===== START NEW FLOW =====
    const intent = detectIntent(text);
    currentModule = RESPONSE_MODULES[intent]?.() || window.RESPONSES_OPEN;
    currentNode = "entry";

    const entry = currentModule.entry(currentLanguage);
    return { text: entry.text, options: entry.options || [] };
  }

  window.routeMessage = routeMessage;

})();
