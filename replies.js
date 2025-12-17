// replies.js
// Gentle Heart — Reply Sets v1 FINAL (STRICT MATCH)

const REPLIES = {

  mood: {
    en: { text: "I am here with you, do you want to talk or listen?", options: ["talk", "listen"] },
    tl: { text: "Andito ako para sa iyo, gusto mo bang magkwento o makinig?", options: ["magkwento", "makinig"] }
  },

  food: {
    en: { text: "Are you hungry or just thinking about food?", options: ["hungry", "food"] },
    tl: { text: "Gutom ka ba o iniisip mo lang ang pagkain?", options: ["gutom", "pagkain"] }
  },

  genz: {
    en: { text: "Is this just chill or about vibes?", options: ["chill", "vibes"] },
    tl: { text: "Chill lang ba ito o tungkol sa vibes?", options: ["chill", "trip"] }
  },

  hobby: {
    en: { text: "Do you want to talk about hobbies or free time?", options: ["hobby", "free time"] },
    tl: { text: "Gusto mo bang pag-usapan ang libangan o bakanteng oras?", options: ["libangan", "bakanteng oras"] }
  },

  crush: {
    en: { text: "Do you want to talk about your crush or feelings?", options: ["crush", "feelings"] },
    tl: { text: "Gusto mo bang pag-usapan ang crush o nararamdaman?", options: ["crush", "nararamdaman"] }
  },

  cp_overview: {
    en: { text: "Do you want to know cerebral palsy or daily life?", options: ["cerebral palsy", "daily life"] },
    tl: { text: "Gusto mo bang malaman ang cerebral palsy o araw-araw?", options: ["ano ang cp", "araw-araw"] }
  },

  cp_signs: {
    en: { text: "Are you asking about cp signs or symptoms?", options: ["cp signs", "symptoms"] },
    tl: { text: "Tungkol ba ito sa palatandaan o sintomas?", options: ["palatandaan", "sintomas"] }
  },

  cp_therapy: {
    en: { text: "Do you want therapy or rehab?", options: ["therapy", "rehab"] },
    tl: { text: "Gusto mo bang malaman ang therapy o ehersisyo?", options: ["therapy", "ehersisyo"] }
  },

  care_tips: {
    en: { text: "Are you looking for care tips or daily care?", options: ["care tips", "daily care"] },
    tl: { text: "Naghahanap ka ba ng care tips o pag-aalaga?", options: ["care tips", "pag-aalaga"] }
  },

  emotional_support: {
    en: { text: "Do you need help or someone to listen?", options: ["help", "listen"] },
    tl: { text: "Kailangan mo ba ng tulong o makinig lang?", options: ["tulong", "makinig"] }
  },

  family_support: {
    en: { text: "Is this about family or parents?", options: ["family", "parents"] },
    tl: { text: "Tungkol ba ito sa pamilya o magulang?", options: ["pamilya", "magulang"] }
  },

  daily_life: {
    en: { text: "Do you want to talk about daily life or routine?", options: ["daily life", "routine"] },
    tl: { text: "Gusto mo bang pag-usapan ang araw-araw o routine?", options: ["araw-araw", "routine"] }
  },

  medical: {
    en: { text: "Is this about doctor or medicine?", options: ["doctor", "medicine"] },
    tl: { text: "Tungkol ba ito sa doktor o gamot?", options: ["doktor", "gamot"] }
  },

  anxiety_stress: {
    en: { text: "Are you feeling anxiety or stress?", options: ["anxiety", "stress"] },
    tl: { text: "Nakakaranas ka ba ng balisa o stress?", options: ["balisa", "stress"] }
  },

  sleep: {
    en: { text: "Is this about sleep or tired?", options: ["sleep", "tired"] },
    tl: { text: "Tungkol ba ito sa tulog o pagod?", options: ["tulog", "pagod"] }
  },

  hotline: {
    en: { text: "Is this an emergency or urgent help?", options: ["emergency", "urgent"] },
    tl: { text: "Emergency ba ito o agarang tulong?", options: ["emergency", "agarang tulong"] }
  },

  cp_meaning: {
    en: { text: "Do you want meaning or definition?", options: ["meaning of cp", "definition"] },
    tl: { text: "Gusto mo bang malaman ang ibig sabihin o kahulugan?", options: ["ibig sabihin", "kahulugan"] }
  },

  cp_specifics: {
    en: { text: "Are you asking about types or severity?", options: ["types of cp", "severity"] },
    tl: { text: "Tungkol ba ito sa uri o tindi?", options: ["uri", "tindi"] }
  },

  parenting_cp: {
    en: { text: "Is this about parenting or child with cp?", options: ["parenting", "child with cp"] },
    tl: { text: "Tungkol ba ito sa pagiging magulang o alaga ng bata?", options: ["pagiging magulang", "alaga ng bata"] }
  },

  social_support: {
    en: { text: "Is this about friends or community?", options: ["friends", "community"] },
    tl: { text: "Tungkol ba ito sa kaibigan o komunidad?", options: ["kaibigan", "komunidad"] }
  },

  casual: {
    en: { text: "Do you want casual or small talk?", options: ["casual", "small talk"] },
    tl: { text: "Casual lang ba o kwentuhan?", options: ["casual", "kwentuhan"] }
  },

  rant: {
    en: { text: "Do you want rant or complain?", options: ["rant", "complain"] },
    tl: { text: "Gusto mo bang magreklamo o mag-rant?", options: ["reklamo", "rant"] }
  },

  greetings: {
    en: { text: "Do you want hello or hi?", options: ["hello", "hi"] },
    tl: { text: "Gusto mo bang kumusta o hi?", options: ["kumusta", "kamusta"] }
  },

  kids_safe: {
    en: { text: "Is this for kids or simple explanation?", options: ["kids", "simple explanation"] },
    tl: { text: "Para ba ito sa bata o madaling intindihin?", options: ["bata", "madaling intindihin"] }
  },

  bot_intro: {
    en: { text: "Do you want to know who am I or what can I do?", options: ["who are you", "what can you do"] },
    tl: { text: "Gusto mo bang malaman kung sino kausap mo o anong kaya ko?", options: ["sino ka", "anong kaya mo"] }
  },

  language: {
    en: { text: "Do you want english or tagalog?", options: ["english", "tagalog"] },
    tl: { text: "Gusto mo bang tagalog o english?", options: ["tagalog", "english"] }
  },

  settings: {
    en: { text: "Do you want settings or clear history?", options: ["settings", "clear history"] },
    tl: { text: "Gusto mo bang settings o burahin ang chat?", options: ["settings", "burahin ang chat"] }
  },

  grounding: {
    en: { text: "Do you want breathing or grounding?", options: ["breathing", "grounding"] },
    tl: { text: "Gusto mo bang paghinga o grounding?", options: ["hinga", "grounding"] }
  },

  encouragement: {
    en: { text: "Do you want encouragement or hope?", options: ["encouragement", "hope"] },
    tl: { text: "Kailangan mo ba ng pampalakas loob o pag asa?", options: ["pampalakas loob", "pag asa"] }
  },

  fallback: {
    en: { text: "Do you want explain or change topic?", options: ["explain", "change topic"] },
    tl: { text: "Gusto mo bang linawin o ibang topic?", options: ["linawin", "ibang topic"] }
  }

};

window.REPLIES = REPLIES;
