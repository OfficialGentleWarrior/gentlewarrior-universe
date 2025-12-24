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
  "pag-angkop","uri","sanhi","maling akala",

  // ✅ ADD THESE
  "maikling",
  "listahan",
  "pagkakaiba",
  "uri ng cp", "uri ng therapy",
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
  "daily life",
  "everyday life",
  "daily impact",
  "day to day",
  "how it affects daily life",
  "araw-araw na buhay",
  "pang-araw-araw na buhay",
  "epekto sa araw-araw"
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
    another_myth: [
  "another myth",
  "another myths",
  "more myths",
  "other myths",
  "isa pang myth",
  "isa pang maling akala"
],
    types: [
      "type","types","kind","kinds",
      "uri","mga uri"
    ],
    short_list: [
      "list","short list","main types",
      "listahan","pangunahing uri"
    ],
    differences: [
  "differ",
  "difference",
  "differences",
  "compare",
  "comparison",
  "pagkakaiba",
  "pinagkaiba"
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
  "therapy",
  "therapies",
  "treatment",
  "rehabilitation",
  "gamutan",
  "therapy helps",
  "paano nakakatulong ang therapy",
  "tulong ng therapy"
],
types_of_therapy: [
  "types of therapy",
  "therapy types",
  "kind of therapy",
  "kinds of therapy",
  "uri ng therapy",
  "mga uri ng therapy",
  "mga therapy",
  "physical therapy",
  "occupational therapy",
  "speech therapy"
],
// ===== FEELING FLOW ALIASES =====

feeling: [
  "feel",
  "feeling",
  "i feel",
  "i am feeling",
  "emotion",
  "emotional",
  "nararamdaman",
  "nararamdaman ko",
  "pakiramdam",
  "pakiramdam ko",
  "damdamin",
  "emosyon"
],

talk_about_it: [
  "talk",
  "talk about it",
  "kwento",
  "magkwento",
  "maglabas",
  "sabihin",
  "share"
],

sit_quietly: [
  "quiet",
  "sit quietly",
  "tahimik",
  "manahimik",
  "quiet muna",
  "pause",
  "pahinga muna"
],

emotional: [
  "emotional",
  "emotion",
  "damdamin",
  "emosyon",
  "mental",
  "sa loob"
],

physical: [
  "physical",
  "katawan",
  "body",
  "physically",
  "pisikal"
],

heavy: [
  "heavy",
  "bigat",
  "mabigat",
  "overwhelmed",
  "drained",
  "stress",
  "stressed",
  "pagod na pagod"
],

mixed: [
  "mixed",
  "halo halo",
  "halo-halo",
  "confused",
  "magulo",
  "di ko alam",
  "unsure",
  "hindi malinaw"
],

talk_more: [
  "talk more",
  "continue",
  "tuloy",
  "sige",
  "oo",
  "go on"
],

pause: [
  "pause",
  "stop",
  "wait",
  "sandali",
  "huminto",
  "break"
],

seek_clarity: [
  "clarity",
  "clear",
  "linawin",
  "intindihin",
  "maintindihan",
  "explain"
],

take_space: [
  "space",
  "alone",
  "mag-isa",
  "espasyo",
  "distance",
  "time muna"
],

tired: [
  "tired",
  "pagod",
  "exhausted",
  "antok",
  "ubos"
],

low_energy: [
  "low energy",
  "walang lakas",
  "mahina",
  "lethargic",
  "burnout"
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
