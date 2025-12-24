// logic.js — Gentle Heart BRANCHING ROUTER (FINAL, STABLE)

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
    const t = text;

    const enHits = [
      "what","why","how","is","are","do","does",
      "daily","life","simple","explanation",
      "therapy","types","causes","example","adaptation",
      "myth","myths","another","risk","factor","factors"
    ];

    const tlHits = [
      "ano","bakit","paano","araw","buhay",
      "simpleng","paliwanag","halimbawa",
      "pag-angkop","uri","sanhi","maling akala"
    ];

    const enScore = enHits.filter(w => t.includes(w)).length;
    const tlScore = tlHits.filter(w => t.includes(w)).length;

    if (enScore > tlScore) return "en";
    if (tlScore > enScore) return "tl";
    return currentLanguage;
  }

  // ================= INTENT DETECT =================
  function detectIntent(text) {
    const t = text;

    if (/\b(cp|cerebral)\b/.test(t)) return "INFO";
    if (/\b(feel|pagod|sad|tired)\b/.test(t)) return "FEELING";
    if (/\b(eat|food|kain|gutom)\b/.test(t)) return "DESIRE";
    if (/\b(help|hirap|support)\b/.test(t)) return "SUPPORT";
    if (/\b(joke|haha|lol)\b/.test(t)) return "PLAYFUL";
    if (/\b(breath|hinga|calm)\b/.test(t)) return "GROUNDING";
    if (/\b(suicide|hotline|emergency)\b/.test(t)) return "HELP";

    return "OPEN";
  }

  // ================= ALIASES =================
  const ALIASES = {
    simple_explanation: [
      "simple","simple explanation","explain","basic",
      "simpleng paliwanag","paliwanag","ipaliwanag"
    ],
    daily_life: [
      "daily life","everyday","how it shows up","in daily life",
      "araw-araw","pang-araw-araw","buhay","pamumuhay"
    ],
    causes: [
      "cause","causes","why","reason",
      "sanhi","dahilan","bakit"
    ],
    risk_factors: [
      "risk","risk factor","risk factors",
      "panganib","salik"
    ],
    myths: [
      "myth","myths","misconception",
      "maling akala","hindi totoo"
    ],
    more_myths: [
      "another myth","more myths","other myths",
      "isa pang myth"
    ],
    types: [
      "type","types","kind","kinds",
      "uri","mga uri"
    ],
    short_list: [
      "list","short list","main types",
      "listahan","pangunahing uri"
    ],
    differ: [
      "differ","difference", "diffetence", "compare",
      "pagkakaiba"
    ],
    examples: [
      "example","examples","real life",
      "halimbawa"
    ],
    adaptation: [
      "adapt","adaptation","adjust",
      "pag-angkop","umaangkop"
    ],
    therapy: [
      "therapy","therapies","treatment",
      "gamutan","rehabilitation"
    ],
    feeling_jump: [
      "feeling","emotion","emotionally",
      "pakiramdam","damdamin","emosyon"
    ]
  };

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
  function matchOption(text, options) {
    return options.find(opt =>
      ALIASES[opt]?.some(word => text.includes(word))
    );
  }

  // ================= MAIN ROUTER =================
  function routeMessage(userText) {
    const text = normalize(userText);

    // language per message
    currentLanguage = detectLanguage(text);

    /// 🔁 GLOBAL ALIAS JUMP (ANY MODULE, ANYTIME)
const globalKey = Object.keys(ALIASES).find(key =>
  ALIASES[key]?.some(word => text.includes(word))
);

if (
  globalKey &&
  window.RESPONSES_INFO_CP &&
  typeof window.RESPONSES_INFO_CP[globalKey] === "function"
) {
  currentModule = window.RESPONSES_INFO_CP;
  currentNode = globalKey;

  const next = currentModule[currentNode](currentLanguage);
  return { text: next.text, options: next.options || [] };
}

    // 1️⃣ OPTION MATCH FIRST
    if (currentModule && currentModule[currentNode]) {
      const node = currentModule[currentNode](currentLanguage);
      const nextKey = matchOption(text, node.options || []);

      if (nextKey && typeof currentModule[nextKey] === "function") {
        currentNode = nextKey;
        const next = currentModule[currentNode](currentLanguage);
        return { text: next.text, options: next.options || [] };
      }
    }

    // 2️⃣ INTENT ALWAYS WINS
    const intent = detectIntent(text);
    currentModule = RESPONSE_MODULES[intent]();
    currentNode = "entry";

    const entry = currentModule.entry(currentLanguage);
    return { text: entry.text, options: entry.options || [] };
  }

  // ================= EXPOSE =================
  window.routeMessage = routeMessage;

})();
