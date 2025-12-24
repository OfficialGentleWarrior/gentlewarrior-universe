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
  // ===== INFO / CP =====
  "what","why","how","is","are","do","does",
  "daily","life","simple","explanation",
  "therapy","types","causes","example","adaptation",
  "myth","myths","another","risk","factor","factors",

  // ===== FEELING =====
  "feel","feeling","i feel","i am feeling",
  "tired","exhausted","sleepy","drained","low energy",
  "emotional","physical","heavy","mixed","confused","unclear",
  "talk about","talk","share","let it out",
  "quiet","sit quietly","pause","slow down",
  "rest","take a break",
  "space","alone","step back",

  // ===== DESIRE =====
  "hungry","hunger","food","eat","eating",
  "craving","cravings","want","need",
  "quick","fast","easy",
  "filling","full","comforting",
  "comfort","reassurance",
  "taste","sweet","salty",

  // ===== GROUNDING =====
  "breath","breathe","breathing",
  "calm","ground","grounding",
  "slow down","relax","ease",
  "body","body awareness",
  "inhale","exhale",
  "here","present","right now"
];

    const tlHits = [
  // ===== INFO / CP =====
  "ano","bakit","paano","araw","buhay",
  "simpleng","paliwanag","halimbawa",
  "pag-angkop","uri","sanhi","maling akala",
  "maikling","listahan","pagkakaiba",
  "uri ng cp","uri ng therapy",

  // ===== FEELING =====
  "pagod","napapagod","antok","ubos","walang lakas",
  "pakiramdam","nararamdaman","nararamdaman ko",
  "emosyonal","pisikal","mabigat","halo-halo","magulo","hindi malinaw",
  "pag-usapan","ilabas","maglabas",
  "manahimik","tahimik","tahimik muna",
  "magpahinga","pahinga","pahinga muna",
  "andito ako","kasama kita",
  "espasyo","bigyan ng espasyo","mag-isa",

  // ===== DESIRE =====
  "gutom","nagugutom","gutom ako","gutom na ako",
  "pagkain","kain","kumain",
  "busog","nakakabusog",
  "craving","cravings","may gusto","may hinahanap",
  "mabilis","mabilis lang","madali",
  "aliw","umaliw","comfort","pampalakas-loob",
  "lasa","matamis","maalat",
  "kailangan","kailangan ko","kailangan mo",
  "kailangan mo ngayon","ano ang kailangan",
  "silipin","silipin ang kailangan",

  // ===== GROUNDING =====
  "hinga","huminga","paghinga","hinga muna",
  "malalim na hinga","dahan-dahang hinga",
  "kalma","kumalma","pakalma","pakalma muna",
  "magpakalma","kalma lang",
  "maghinay-hinay","dahan-dahan","dahan lang","bagalan",
  "ground","grounding","mag-ground",
  "dito muna","sa ngayon","nandito",
  "relax","mag-relax","paluwagin",
  "pakiramdam ng katawan","pakiramdaman ang katawan"
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
    if (/\b(eat|food|kain|gutom|hungry)\b/.test(t)) return "DESIRE";
    if (/\b(help|hirap|support)\b/.test(t)) return "SUPPORT";
    if (/\b(joke|haha|lol)\b/.test(t)) return "PLAYFUL";
    if (/\b(ground|grounding|hinga|huminga|paghinga|breathing|kalma|kumalma|relax|maghinay|dahan-dahan|pakalma)\b/.test(t))
  return "GROUNDING";
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
],
// ===== DESIRE FLOW ALIASES =====

desire: [
  "kailangan",
  "kailangan ko",
  "kailangan mo",
  "silipin ang kailangan",
  "ano ang kailangan",
  "need",
  "want"
],

food: [
  "pagkain",
  "kain",
  "kumain",
  "food"
],

hungry: [
  "gutom",
  "hungry",
  "nagugutom",
  "gutom ako",
  "gutom na ako"
],

craving: [
  "craving",
  "cravings",
  "may gusto",
  "may hinahanap"
],

quick: [
  "mabilis",
  "mabilis lang",
  "madali",
  "quick"
],

filling: [
  "nakakabusog",
  "busog",
  "masarap at busog",
  "filling"
],

comfort: [
  "comfort",
  "aliw",
  "umaliw",
  "pampalakas-loob",
  "kailangan ng comfort"
],

taste: [
  "lasa",
  "taste",
  "matamis",
  "maalat",
  "pang-tikim"
],

reassurance: [
  "reassure",
  "assurance",
  "kumpirmasyon",
  "palakas ng loob"
],

quiet_company: [
  "kasama",
  "may kasama",
  "andito ka",
  "andito ka lang"
],
// ===== GROUNDING FLOW ALIASES =====

grounding: [
  "ground",
  "grounding",
  "mag-ground",
  "mag ground",
  "kumalma",
  "kalma",
  "magpakalma",
  "pakalma",
  "maghinay-hinay",
  "dahan-dahan",
  "hinga muna",
  "sandali lang",
  "relax muna"
],

breathing: [
  "hinga",
  "paghinga",
  "huminga",
  "hinga muna",
  "breathing",
  "maghinga",
  "malalim na hinga",
  "hinga nang dahan-dahan"
],

one_breath: [
  "isang hinga",
  "isang malalim",
  "isang malalim na hinga",
  "one breath",
  "isa lang",
  "isa muna"
],

breathing_rhythm: [
  "ritmo",
  "rhythm",
  "hinga ritmo",
  "hinga 4 labas 6",
  "hinga apat labas anim",
  "bilang ng hinga",
  "pattern ng hinga"
],

body: [
  "katawan",
  "pakiramdam ng katawan",
  "body",
  "pisikal",
  "pisikal na pakiramdam",
  "pansinin ang katawan"
],

relax: [
  "relax",
  "mag-relax",
  "paluwagin",
  "paluwagin ang balikat",
  "paluwagin ang panga",
  "tanggalin ang tension",
  "pakawalan ang tensyon",
  "i-relax",
  "magluwag"
],

observe: [
  "obserbahan",
  "pansinin",
  "tingnan lang",
  "observe",
  "mapansin",
  "damhin",
  "damhin ang katawan"
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
