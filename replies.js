// replies.js
// Gentle Heart — Reply Sets v1 FINAL (OPTIONS FIXED)

const REPLIES = {

  mood: {
    en: { text: "I’m here with you — do you want to talk, or just listen for now?", options: ["Talk", "Listen"] },
    tl: { text: "Andito lang ako — gusto mo bang magkwento, o makinig lang muna?", options: ["Magkwento", "Makinig"] }
  },

  food: {
    en: { text: "Are you hungry, or just thinking about food?", options: ["Hungry", "Food"] },
    tl: { text: "Gutom ka ba, o naiisip mo lang ang pagkain?", options: ["Gutom", "Pagkain"] }
  },

  genz: {
    en: { text: "Chill talk, or something real?", options: ["Chill", "Talk"] },
    tl: { text: "Chill lang ba, o may gusto kang pag-usapan?", options: ["Chill", "Pag-usapan"] }
  },

  hobby: {
    en: { text: "Do you want to talk about hobbies, or free time?", options: ["Hobby", "Free time"] },
    tl: { text: "Gusto mo bang pag-usapan ang libangan, o free time?", options: ["Libangan", "Bakanteng oras"] }
  },

  crush: {
    en: { text: "Do you want to talk about your crush, or your feelings?", options: ["Crush", "Feelings"] },
    tl: { text: "Gusto mo bang pag-usapan ang crush mo, o nararamdaman mo?", options: ["Crush", "Nararamdaman"] }
  },

  cp_overview: {
    en: { text: "Do you want to know what CP is, or daily life with CP?", options: ["What is CP", "Daily life"] },
    tl: { text: "Gusto mo bang malaman kung ano ang CP, o ang araw-araw na buhay?", options: ["Ano ang CP", "Araw-araw"] }
  },

  cp_signs: {
    en: { text: "Are you asking about CP signs, or something you noticed?", options: ["CP signs", "Symptoms"] },
    tl: { text: "Tungkol ba ito sa palatandaan ng CP, o sintomas?", options: ["Palatandaan", "Sintomas"] }
  },

  cp_therapy: {
    en: { text: "Do you want to know about therapy, or rehab exercises?", options: ["Therapy", "Exercise"] },
    tl: { text: "Gusto mo bang malaman ang therapy, o ehersisyo?", options: ["Therapy", "Ehersisyo"] }
  },

  care_tips: {
    en: { text: "Are you looking for care tips, or daily care?", options: ["Care tips", "Daily care"] },
    tl: { text: "Naghahanap ka ba ng care tips, o pang-araw-araw na alaga?", options: ["Care tips", "Pag-aalaga"] }
  },

  emotional_support: {
    en: { text: "Do you want help, or someone to listen?", options: ["Help", "Listen"] },
    tl: { text: "Gusto mo ba ng tulong, o makinig lang ako?", options: ["Tulong", "Makinig"] }
  },

  family_support: {
    en: { text: "Do you want to talk about family, or parents?", options: ["Family", "Parents"] },
    tl: { text: "Gusto mo bang pag-usapan ang pamilya, o magulang?", options: ["Pamilya", "Magulang"] }
  },

  daily_life: {
    en: { text: "Do you want to talk about daily life, or routine?", options: ["Daily life", "Routine"] },
    tl: { text: "Gusto mo bang pag-usapan ang araw-araw na buhay, o routine?", options: ["Araw-araw", "Routine"] }
  },

  medical: {
    en: { text: "Is this about a doctor visit, or medicine?", options: ["Doctor", "Medicine"] },
    tl: { text: "Tungkol ba ito sa doktor, o gamot?", options: ["Doktor", "Gamot"] }
  },

  anxiety_stress: {
    en: { text: "Are you feeling stress, or anxiety?", options: ["Stress", "Anxiety"] },
    tl: { text: "Nakakaranas ka ba ng stress, o balisa?", options: ["Stress", "Balisa"] }
  },

  sleep: {
    en: { text: "Are you having trouble sleeping, or feeling tired?", options: ["Sleep", "Tired"] },
    tl: { text: "Hirap ka bang matulog, o pagod ka?", options: ["Tulog", "Pagod"] }
  },

  hotline: {
    en: { text: "Is this an emergency, or do you need urgent help?", options: ["Emergency", "Urgent help"] },
    tl: { text: "Emergency ba ito, o kailangan mo ng agarang tulong?", options: ["Emergency", "Agarang tulong"] }
  },

  cp_meaning: {
    en: { text: "Do you want the meaning of CP, or a definition?", options: ["Meaning of CP", "Definition"] },
    tl: { text: "Gusto mo bang malaman ang ibig sabihin ng CP, o kahulugan?", options: ["Ibig sabihin", "Kahulugan"] }
  },

  cp_specifics: {
    en: { text: "Do you want to know the types of CP, or severity?", options: ["Types of CP", "Severity"] },
    tl: { text: "Gusto mo bang malaman ang uri ng CP, o tindi?", options: ["Uri", "Tindi"] }
  },

  parenting_cp: {
    en: { text: "Is this about parenting, or caring for a child with CP?", options: ["Parenting", "Child with CP"] },
    tl: { text: "Tungkol ba ito sa pagiging magulang, o pag-aalaga ng batang may CP?", options: ["Pagiging magulang", "Anak na may CP"] }
  },

  social_support: {
    en: { text: "Do you want to talk about friends, or community?", options: ["Friends", "Community"] },
    tl: { text: "Gusto mo bang pag-usapan ang kaibigan, o komunidad?", options: ["Kaibigan", "Komunidad"] }
  },

  casual: {
    en: { text: "Do you want casual talk, or small talk?", options: ["Casual", "Small talk"] },
    tl: { text: "Casual lang ba, o kwentuhan?", options: ["Casual", "Kwentuhan"] }
  },

  rant: {
    en: { text: "Do you want to rant, or complain?", options: ["Rant", "Complain"] },
    tl: { text: "Gusto mo bang magreklamo, o mag-rant?", options: ["Reklamo", "Rant"] }
  },

  greetings: {
    en: { text: "Hi — do you want to chat, or talk about something?", options: ["Chat", "Talk"] },
    tl: { text: "Hi — gusto mo bang makipagkwentuhan, o may topic?", options: ["Kwentuhan", "Topic"] }
  },

  kids_safe: {
    en: { text: "Is this for kids, or a simple explanation?", options: ["Kids", "Simple explanation"] },
    tl: { text: "Para ba ito sa bata, o simpleng paliwanag?", options: ["Bata", "Madaling intindihin"] }
  },

  bot_intro: {
    en: { text: "Do you want to know who I am, or what I can do?", options: ["Who are you", "What can you do"] },
    tl: { text: "Gusto mo bang malaman kung sino ako, o anong kaya kong gawin?", options: ["Sino ka", "Anong kaya mo"] }
  },

  language: {
    en: { text: "Do you want English, or Tagalog?", options: ["English", "Tagalog"] },
    tl: { text: "Gusto mo bang mag-Tagalog, o English?", options: ["Tagalog", "English"] }
  },

  settings: {
    en: { text: "Do you want to open settings, or clear history?", options: ["Settings", "Clear history"] },
    tl: { text: "Gusto mo bang buksan ang settings, o burahin ang chat?", options: ["Settings", "Burahin ang chat"] }
  },

  grounding: {
    en: { text: "Do you want breathing, or grounding?", options: ["Breathing", "Grounding"] },
    tl: { text: "Gusto mo bang maghinga, o grounding?", options: ["Hinga", "Grounding"] }
  },

  encouragement: {
    en: { text: "Do you want encouragement, or hope?", options: ["Encouragement", "Hope"] },
    tl: { text: "Kailangan mo ba ng pampalakas-loob, o pag-asa?", options: ["Pampalakas loob", "Pag-asa"] }
  },

  fallback: {
    en: { text: "Do you want to explain more, or change topic?", options: ["Explain", "Change topic"] },
    tl: { text: "Gusto mo bang linawin, o mag-iba ng topic?", options: ["Linawin", "Ibang topic"] }
  }

};

window.REPLIES = REPLIES;
