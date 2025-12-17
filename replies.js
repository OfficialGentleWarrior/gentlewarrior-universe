// replies.js
// Gentle Heart — Reply Sets v1 FINAL (LOCKED)

const REPLIES = {

  mood: {
    en: { text: "I’m here with you — do you want to share what you’re feeling, or should we sit quietly for a moment?", options: ["Share", "Sit quietly"] },
    tl: { text: "Andito lang ako — gusto mo bang magkwento ng nararamdaman mo, o tahimik lang muna tayo?", options: ["Magkwento", "Tahimik muna"] }
  },

  food: {
    en: { text: "Are you hungry right now, or just thinking about food?", options: ["Hungry", "Just thinking"] },
    tl: { text: "Gutom ka ba ngayon, o naiisip mo lang ang pagkain?", options: ["Gutom", "Naisip lang"] }
  },

  genz: {
    en: { text: "Got the vibe — chill talk, or something deeper?", options: ["Chill", "Deeper"] },
    tl: { text: "Gets ko ang vibe — chill lang ba, o seryoso?", options: ["Chill", "Seryoso"] }
  },

  hobby: {
    en: { text: "What do you enjoy doing these days, or are you looking for something new?", options: ["My hobbies", "Something new"] },
    tl: { text: "Ano ang hilig mong gawin ngayon, o may gusto kang subukan?", options: ["Mga hilig", "May bago"] }
  },

  crush: {
    en: { text: "Do you want to talk about the person, or how it makes you feel?", options: ["The person", "My feelings"] },
    tl: { text: "Gusto mo bang pag-usapan ang tao, o ang nararamdaman mo?", options: ["Yung tao", "Nararamdaman ko"] }
  },

  cp_overview: {
    en: { text: "Do you want a simple explanation, or how it affects daily life?", options: ["Simple", "Daily life"] },
    tl: { text: "Gusto mo ba ng simpleng paliwanag, o kung paano ito sa araw-araw?", options: ["Simple", "Araw-araw"] }
  },

  cp_signs: {
    en: { text: "Are you asking about common signs, or something you noticed?", options: ["Common signs", "Something noticed"] },
    tl: { text: "Nagtatanong ka ba tungkol sa palatandaan, o may napansin ka na?", options: ["Palatandaan", "May napansin"] }
  },

  cp_therapy: {
    en: { text: "Do you want to know therapy options, or what sessions are like?", options: ["Options", "Sessions"] },
    tl: { text: "Gusto mo bang malaman ang mga therapy, o kung ano ang nangyayari sa session?", options: ["Mga therapy", "Session"] }
  },

  care_tips: {
    en: { text: "Are you looking for daily care tips, or help with a situation?", options: ["Daily tips", "Specific help"] },
    tl: { text: "Naghahanap ka ba ng pang-araw-araw na tips, o tulong sa isang sitwasyon?", options: ["Araw-araw", "May sitwasyon"] }
  },

  emotional_support: {
    en: { text: "I’m listening — do you want advice, or just someone to hear you?", options: ["Advice", "Just listen"] },
    tl: { text: "Nakikinig ako — gusto mo ba ng payo, o makinig lang ako?", options: ["Payo", "Makinig lang"] }
  },

  family_support: {
    en: { text: "Do you want to talk about family roles, or something heavy at home?", options: ["Family", "Something heavy"] },
    tl: { text: "Gusto mo bang pag-usapan ang pamilya, o may mabigat sa bahay?", options: ["Pamilya", "Mabigat"] }
  },

  daily_life: {
    en: { text: "Do you want to talk about your routine, or something that changed?", options: ["Routine", "Something changed"] },
    tl: { text: "Gusto mo bang pag-usapan ang routine, o may nagbago?", options: ["Routine", "May nagbago"] }
  },

  medical: {
    en: { text: "Is this about treatment, or a recent checkup?", options: ["Treatment", "Checkup"] },
    tl: { text: "Tungkol ba ito sa gamutan, o sa checkup?", options: ["Gamutan", "Checkup"] }
  },

  anxiety_stress: {
    en: { text: "That sounds heavy — do you want to slow down, or talk it through?", options: ["Slow down", "Talk it out"] },
    tl: { text: "Mukhang mabigat — gusto mo bang kumalma muna, o pag-usapan?", options: ["Kumalma", "Pag-usapan"] }
  },

  sleep: {
    en: { text: "Are you having trouble sleeping, or just feeling tired?", options: ["Can’t sleep", "Just tired"] },
    tl: { text: "Hirap ka bang matulog, o pagod ka lang?", options: ["Hirap matulog", "Pagod lang"] }
  },

  hotline: {
    en: { text: "This feels urgent — are you safe right now, or do you need help?", options: ["I’m safe", "I need help"] },
    tl: { text: "Mukhang urgent ito — ligtas ka ba ngayon, o kailangan mo ng tulong?", options: ["Ligtas ako", "Kailangan ko ng tulong"] }
  },

  cp_meaning: {
    en: { text: "Do you want a simple meaning, or a clearer explanation?", options: ["Simple", "Clearer"] },
    tl: { text: "Gusto mo ba ng simpleng kahulugan, o mas malinaw na paliwanag?", options: ["Simple", "Mas malinaw"] }
  },

  cp_specifics: {
    en: { text: "Are you curious about the types, or how severe it can be?", options: ["Types", "Severity"] },
    tl: { text: "Interesado ka ba sa mga uri, o sa tindi nito?", options: ["Mga uri", "Tindi"] }
  },

  parenting_cp: {
    en: { text: "Do you need guidance, or reassurance right now?", options: ["Guidance", "Reassurance"] },
    tl: { text: "Kailangan mo ba ng gabay, o pampalakas-loob?", options: ["Gabay", "Pampalakas-loob"] }
  },

  social_support: {
    en: { text: "Do you want to talk about friends, or feeling alone?", options: ["Friends", "Feeling alone"] },
    tl: { text: "Gusto mo bang pag-usapan ang kaibigan, o ang pakiramdam na mag-isa?", options: ["Kaibigan", "Mag-isa"] }
  },

  casual: {
    en: { text: "Light chat, or something meaningful?", options: ["Light", "Meaningful"] },
    tl: { text: "Kwentuhan lang, o seryosong usapan?", options: ["Kwentuhan", "Seryoso"] }
  },

  rant: {
    en: { text: "It’s okay to vent — do you want to let it out, or pause first?", options: ["Vent", "Pause"] },
    tl: { text: "Okay lang maglabas — gusto mo bang mag-rant, o huminga muna?", options: ["Mag-rant", "Huminga"] }
  },

  greetings: {
    en: { text: "Hi — do you want to chat, or talk about something specific?", options: ["Chat", "Specific"] },
    tl: { text: "Hi — kwentuhan lang ba, o may topic ka?", options: ["Kwentuhan", "May topic"] }
  },

  kids_safe: {
    en: { text: "Do you want a simple answer, or a story-style one?", options: ["Simple", "Story"] },
    tl: { text: "Gusto mo ba ng simpleng sagot, o parang kwento?", options: ["Simple", "Kwento"] }
  },

  bot_intro: {
    en: { text: "Do you want to know what I can do, or what I can’t?", options: ["What you can do", "Limits"] },
    tl: { text: "Gusto mo bang malaman ang kaya kong gawin, o ang limitasyon ko?", options: ["Kaya mo", "Limitasyon"] }
  },

  language: {
    en: { text: "Do you want to continue in English, or switch languages?", options: ["English", "Switch"] },
    tl: { text: "Gusto mo bang magpatuloy sa Tagalog, o magpalit ng wika?", options: ["Tagalog", "Magpalit"] }
  },

  settings: {
    en: { text: "Do you want to change a setting, or clear the chat?", options: ["Settings", "Clear chat"] },
    tl: { text: "Gusto mo bang baguhin ang settings, o burahin ang chat?", options: ["Settings", "Burahin"] }
  },

  grounding: {
    en: { text: "Do you want to try breathing, or grounding first?", options: ["Breathing", "Grounding"] },
    tl: { text: "Gusto mo bang subukan ang paghinga, o grounding muna?", options: ["Paghinga", "Grounding"] }
  },

  encouragement: {
    en: { text: "Do you need encouragement, or a reminder to rest?", options: ["Encouragement", "Rest"] },
    tl: { text: "Kailangan mo ba ng pampalakas-loob, o paalala na magpahinga?", options: ["Pampalakas-loob", "Magpahinga"] }
  },

  fallback: {
    en: { text: "I want to understand — do you want to explain more, or change topic?", options: ["Explain", "Change topic"] },
    tl: { text: "Gusto kitang maintindihan — lilinawin mo ba, o ibang topic?", options: ["Linawin", "Ibang topic"] }
  }

};

window.REPLIES = REPLIES;
