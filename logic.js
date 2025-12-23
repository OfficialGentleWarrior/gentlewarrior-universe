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
  "therapy","types","causes","example","adaptation",

  // ✅ ADD THESE
  "another", "myth", "myths", "type", "types",
  "risk", "factors", "example", "examples"
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

const ALIASES = {

  // ===== SIMPLE EXPLANATION =====
  simple_explanation: [
    "simple", "simple explanation", "explain", "basic",
    "simpleng paliwanag", "paliwanag", "ipaliwanag"
  ],

  // ===== DAILY LIFE =====
  daily_life: [
  "daily life",
  "everyday",
  "daily",
  "life",
  "how it shows up",
  "shows up",
  "shows",
  "in daily life",

  "araw-araw", 
  "araw araw",
  "pang-araw-araw",
  "buhay",
  "pamumuhay"
]

  // ===== CAUSES =====
  causes: [
    "cause", "causes", "why", "reason",
    "sanhi", "dahilan", "bakit"
  ],

  // ===== RISK FACTORS =====
  risk_factors: [
    "risk", "risk factor", "risk factors",
    "panganib", "salik", "risk factors"
  ],

  // ===== MYTHS =====
  myths: [
    "myth", "myths", "misconception",
    "maling akala", "hindi totoo", "paniniwala"
  ],

  more_myths: [
    "another myth", "more myths", "other myths",
    "isa pang myth", "iba pang maling akala"
  ],

  // ===== TYPES =====
  types: [
    "type", "types", "kind", "kinds",
    "uri", "mga uri", "klase"
  ],

  short_list: [
    "list", "short list", "main types",
    "listahan", "maikling listahan", "pangunahing uri"
  ],

  differences: [
    "difference", "differences", "compare", "comparison",
    "pagkakaiba", "naiiba", "ikukumpara"
  ],

  // ===== DAILY LIFE DETAILS =====
  examples: [
    "example", "examples", "sample", "real life",
    "halimbawa", "mga halimbawa"
  ],

  adaptation: [
    "adapt", "adaptation", "adjust", "coping",
    "pag-angkop", "umaangkop", "adjustment"
  ],

  // ===== THERAPY =====
  therapy: [
    "therapy", "therapies", "treatment", "rehab",
    "therapy", "gamutan", "rehabilitation", "rehabilitasyon"
  ],

  // ===== HANDOFF TO FEELING =====
  feeling_jump: [
    "feeling", "emotion", "emotionally",
    "pakiramdam", "damdamin", "emosyon"
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
  function matchOption(userText, options) {
    const t = normalize(userText);

    return options.find(opt =>
      ALIASES[opt]?.some(word => t.includes(word))
    );
  }

 
  // ================= MAIN ROUTER =================
  function routeMessage(userText) {
  const text = normalize(userText);

  // update language per message
  currentLanguage = detectLanguage(text) || currentLanguage;

  // try option match first (if may active flow)
  if (currentModule && currentModule[currentNode]) {
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

  // NO OPTION → INTENT ALWAYS WINS
  const intent = detectIntent(text);
  currentModule = RESPONSE_MODULES[intent]?.() || window.RESPONSES_OPEN;
  currentNode = "entry";

  const entry = currentModule.entry(currentLanguage);
  return {
    text: entry.text,
    options: entry.options || []
  };
}

// 🔁 DIRECT NODE JUMP (INFO shortcuts)
if (
  currentModule === window.RESPONSES_INFO_CP &&
  currentNode === "entry"
) {
  const directKey = Object.keys(ALIASES).find(key =>
    ALIASES[key]?.some(word => text.includes(word))
  );

  if (directKey && typeof currentModule[directKey] === "function") {
    currentNode = directKey;
    const next = currentModule[currentNode](currentLanguage);
    return {
      text: next.text,
      options: next.options || []
    };
  }
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

    /// ===== START NEW FLOW (ONLY IF NO ACTIVE MODULE) =====
if (!currentModule) {
  const intent = overrideIntent || detectIntent(text);
  currentModule = RESPONSE_MODULES[intent]?.() || window.RESPONSES_OPEN;
  currentNode = "entry";

  if (!currentModule || typeof currentModule.entry !== "function") {
    currentModule = window.RESPONSES_OPEN;
  }
}

const entry = currentModule.entry(currentLanguage);
return {
  text: entry.text,
  options: entry.options || []
};
}

window.routeMessage = routeMessage;

})();
