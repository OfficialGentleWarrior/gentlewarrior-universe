// replies.js
// Gentle Heart — Reply Sets v1 FINAL (KEYWORD-ALIGNED, PURE LANG)

const REPLIES = {

  mood: {
    en: { text: "I’m here — do you want to talk about your feelings or just listen?", options: ["feelings","listen"] },
    tl: { text: "Andito ako — gusto mo bang magkwento ng nararamdaman mo o makinig lang?", options: ["kwento","makinig"] }
  },

  food: {
    en: { text: "Are you hungry or just thinking about food?", options: ["hungry","food"] },
    tl: { text: "Gutom ka ba o iniisip mo lang ang pagkain?", options: ["gutom","pagkain"] }
  },

  genz: {
    en: { text: "Is this just chill vibes or real talk?", options: ["chill","vibes"] },
    tl: { text: "Chill lang ba ito o seryosong usapan?", options: ["chill","kwentuhan"] }
  },

  hobby: {
    en: { text: "Do you want to talk about hobbies or free time?", options: ["hobby","free time"] },
    tl: { text: "Gusto mo bang pag-usapan ang libangan o bakanteng oras?", options: ["libangan","bakanteng oras"] }
  },

  crush: {
    en: { text: "Do you want to talk about your crush or your feelings?", options: ["crush","feelings"] },
    tl: { text: "Gusto mo bang pag-usapan ang crush mo o ang nararamdaman mo?", options: ["crush","nararamdaman"] }
  },

  cp_overview: {
    en: { text: "Do you want to know what cerebral palsy is or daily life with CP?", options: ["cerebral palsy","daily life"] },
    tl: { text: "Gusto mo bang malaman kung ano ang cerebral palsy o ang araw-araw na buhay?", options: ["ano ang cp","araw-araw"] }
  },

  cp_signs: {
    en: { text: "Are you asking about CP signs or symptoms?", options: ["cp signs","symptoms"] },
    tl: { text: "Tungkol ba ito sa palatandaan o sintomas ng CP?", options: ["palatandaan","sintomas"] }
  },

  cp_therapy: {
    en: { text: "Do you want to talk about therapy or exercise?", options: ["therapy","exercise"] },
    tl: { text: "Gusto mo bang pag-usapan ang therapy o ehersisyo?", options: ["therapy","ehersisyo"] }
  },

  care_tips: {
    en: { text: "Are you looking for care tips or daily care?", options: ["care tips","daily care"] },
    tl: { text: "Naghahanap ka ba ng care tips o pang-araw-araw na alaga?", options: ["care tips","alaga"] }
  },

  emotional_support: {
    en: { text: "Do you need help or someone to talk to?", options: ["help","talk"] },
    tl: { text: "Kailangan mo ba ng tulong o may makakausap?", options: ["tulong","makinig"] }
  },

  family_support: {
    en: { text: "Do you want to talk about family or parents?", options: ["family","parents"] },
    tl: { text: "Gusto mo bang pag-usapan ang pamilya o magulang?", options: ["pamilya","magulang"] }
  },

  daily_life: {
    en: { text: "Do you want to talk about daily life or routine?", options: ["daily life","routine"] },
    tl: { text: "Gusto mo bang pag-usapan ang araw-araw na buhay o routine?", options: ["araw-araw","routine"] }
  },

  medical: {
    en: { text: "Is this about a doctor or medicine?", options: ["doctor","medicine"] },
    tl: { text: "Tungkol ba ito sa doktor o gamot?", options: ["doktor","gamot"] }
  },

  anxiety_stress: {
    en: { text: "Are you feeling anxiety or stress?", options: ["anxiety","stress"] },
    tl: { text: "Nakakaranas ka ba ng balisa o stress?", options: ["balisa","stress"] }
  },

  sleep: {
    en: { text: "Are you having trouble sleeping or feeling tired?", options: ["sleep","tired"] },
    tl: { text: "Hirap ka bang matulog o pagod ka?", options: ["tulog","pagod"] }
  },

  hotline: {
    en: { text: "Is this an emergency or a crisis?", options: ["emergency","crisis"] },
    tl: { text: "Emergency ba ito o krisis?", options: ["emergency","krisis"] }
  },

  cp_meaning: {
    en: { text: "Do you want the meaning or definition of CP?", options: ["meaning","definition"] },
    tl: { text: "Gusto mo bang malaman ang ibig sabihin o kahulugan ng CP?", options: ["ibig sabihin","kahulugan"] }
  },

  cp_specifics: {
    en: { text: "Do you want to know CP types or severity?", options: ["types of cp","severity"] },
    tl: { text: "Gusto mo bang malaman ang uri o tindi ng CP?", options: ["uri","tindi"] }
  },

  parenting_cp: {
    en: { text: "Is this about parenting or caring for a child with CP?", options: ["parenting","child with cp"] },
    tl: { text: "Tungkol ba ito sa pagiging magulang o pag-aalaga ng batang may CP?", options: ["pagiging magulang","alaga ng bata"] }
  },

  social_support: {
    en: { text: "Do you want to talk about friends or community?", options: ["friends","community"] },
    tl: { text: "Gusto mo bang pag-usapan ang kaibigan o komunidad?", options: ["kaibigan","komunidad"] }
  },

  casual: {
    en: { text: "Do you want casual talk or small talk?", options: ["casual","small talk"] },
    tl: { text: "Casual lang ba o kwentuhan?", options: ["casual","kwentuhan"] }
  },

  rant: {
    en: { text: "Do you want to rant or complain?", options: ["rant","complain"] },
    tl: { text: "Gusto mo bang mag-rant o magreklamo?", options: ["rant","reklamo"] }
  },

  greetings: {
    en: { text: "Do you want to chat or say hello?", options: ["chat","hello"] },
    tl: { text: "Gusto mo bang makipagkwentuhan o bumati?", options: ["kwentuhan","kumusta"] }
  },

  kids_safe: {
    en: { text: "Is this for kids or a simple explanation?", options: ["kids","simple explanation"] },
    tl: { text: "Para ba ito sa bata o simpleng paliwanag?", options: ["bata","madaling intindihin"] }
  },

  bot_intro: {
    en: { text: "Do you want to know who I am or what I can do?", options: ["who are you","what can you do"] },
    tl: { text: "Gusto mo bang malaman kung sino ako o anong kaya kong gawin?", options: ["sino ka","anong kaya mo"] }
  },

  language: {
    en: { text: "Do you want English or Tagalog?", options: ["english","tagalog"] },
    tl: { text: "Gusto mo bang Tagalog o English?", options: ["tagalog","english"] }
  },

  settings: {
    en: { text: "Do you want settings or clear history?", options: ["settings","clear history"] },
    tl: { text: "Gusto mo bang settings o burahin ang chat?", options: ["settings","burahin ang chat"] }
  },

  grounding: {
    en: { text: "Do you want breathing or grounding?", options: ["breathing","grounding"] },
    tl: { text: "Gusto mo bang paghinga o grounding?", options: ["hinga","grounding"] }
  },

  encouragement: {
    en: { text: "Do you want encouragement or hope?", options: ["encouragement","hope"] },
    tl: { text: "Kailangan mo ba ng pampalakas-loob o pag-asa?", options: ["pampalakas loob","pag asa"] }
  },

  fallback: {
    en: { text: "Do you want to explain more or change topic?", options: ["explain","change topic"] },
    tl: { text: "Gusto mo bang linawin o mag-iba ng topic?", options: ["linawin","ibang topic"] }
  }

};

window.REPLIES = REPLIES;
