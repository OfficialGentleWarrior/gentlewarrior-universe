// replies.js
// Gentle Heart — Reply Sets v1 (LOCKED CONTENT)

const REPLIES = {

  mood: {
    en: {
      text: "I hear you — do you want to talk about how you feel, or just sit quietly for a bit?",
      options: ["Talk about it", "Just sit quietly"]
    },
    tl: {
      text: "Naririnig kita — gusto mo bang magkwento, o may makinig lang muna?",
      options: ["Magkwento", "Makinig lang"]
    }
  },

  food: {
    en: {
      text: "Are you feeling hungry right now, or just thinking about food?",
      options: ["I’m hungry", "Just thinking"]
    },
    tl: {
      text: "Gutom ka ba ngayon, o naiisip mo lang ang pagkain?",
      options: ["Gutom ako", "Naisip ko lang"]
    }
  },

  genz: {
    en: {
      text: "Got it — are we just chilling, or do you want to talk about something real?",
      options: ["Chill", "Something real"]
    },
    tl: {
      text: "Gets — chill lang ba tayo, o may gusto kang pag-usapan?",
      options: ["Chill lang", "May sasabihin ako"]
    }
  },

  hobby: {
    en: {
      text: "What do you usually enjoy doing when you have free time?",
      options: ["My hobbies", "Something new"]
    },
    tl: {
      text: "Ano ang madalas mong ginagawa kapag may free time ka?",
      options: ["Mga hilig ko", "Gusto ko ng bago"]
    }
  },

  crush: {
    en: {
      text: "Do you want to talk about the person you like, or how it made you feel?",
      options: ["The person", "My feelings"]
    },
    tl: {
      text: "Gusto mo bang pag-usapan ang taong gusto mo, o ang naramdaman mo?",
      options: ["Yung tao", "Nararamdaman ko"]
    }
  },

  cp_overview: {
    en: {
      text: "What would you like to know about cerebral palsy — basics or daily life?",
      options: ["Basics", "Daily life"]
    },
    tl: {
      text: "Ano ang gusto mong malaman tungkol sa cerebral palsy — paliwanag o araw-araw na buhay?",
      options: ["Paliwanag", "Araw-araw"]
    }
  },

  cp_signs: {
    en: {
      text: "Are you asking about possible signs, or something you already noticed?",
      options: ["Possible signs", "Something I noticed"]
    },
    tl: {
      text: "Nagtatanong ka ba tungkol sa palatandaan, o may napansin ka na?",
      options: ["Palatandaan", "May napansin"]
    }
  },

  cp_therapy: {
    en: {
      text: "Do you want to know about therapy options, or what sessions are like?",
      options: ["Therapy options", "What it’s like"]
    },
    tl: {
      text: "Gusto mo bang malaman ang mga therapy, o kung ano ang nangyayari sa session?",
      options: ["Mga therapy", "Sa session"]
    }
  },

  care_tips: {
    en: {
      text: "Are you looking for daily care tips, or help for a specific situation?",
      options: ["Daily care", "Specific help"]
    },
    tl: {
      text: "Naghahanap ka ba ng pang-araw-araw na tips, o tulong sa isang sitwasyon?",
      options: ["Araw-araw", "May sitwasyon"]
    }
  },

  emotional_support: {
    en: {
      text: "I’m here with you — do you want advice, or just someone to listen?",
      options: ["Advice", "Just listen"]
    },
    tl: {
      text: "Andito ako — gusto mo ba ng payo, o makikinig lang ako?",
      options: ["Payo", "Makinig lang"]
    }
  },

  family_support: {
    en: {
      text: "Do you want to talk about family roles, or something hard at home?",
      options: ["Family roles", "Something hard"]
    },
    tl: {
      text: "Gusto mo bang pag-usapan ang pamilya, o may mabigat sa bahay?",
      options: ["Pamilya", "Mabigat sa bahay"]
    }
  },

  daily_life: {
    en: {
      text: "Do you want to talk about your routine, or something that changed recently?",
      options: ["My routine", "Something changed"]
    },
    tl: {
      text: "Gusto mo bang pag-usapan ang routine mo, o may nagbago kamakailan?",
      options: ["Routine", "May nagbago"]
    }
  },

  medical: {
    en: {
      text: "Is this about treatment, or a recent checkup or diagnosis?",
      options: ["Treatment", "Checkup"]
    },
    tl: {
      text: "Tungkol ba ito sa gamutan, o sa checkup o diagnosis?",
      options: ["Gamutan", "Checkup"]
    }
  },

  anxiety_stress: {
    en: {
      text: "That sounds heavy — do you want to slow down together, or talk it out?",
      options: ["Slow down", "Talk it out"]
    },
    tl: {
      text: "Mabigat pakinggan — gusto mo bang kumalma muna, o pag-usapan?",
      options: ["Kumalma muna", "Pag-usapan"]
    }
  },

  sleep: {
    en: {
      text: "Are you having trouble sleeping, or just feeling tired lately?",
      options: ["Can’t sleep", "Just tired"]
    },
    tl: {
      text: "Hirap ka bang matulog, o pagod ka lang nitong mga araw?",
      options: ["Hirap matulog", "Pagod lang"]
    }
  },

  hotline: {
    en: {
      text: "This feels important — are you safe right now, or do you need urgent help?",
      options: ["I’m safe", "I need help"]
    },
    tl: {
      text: "Mukhang mahalaga ito — ligtas ka ba ngayon, o kailangan mo ng agarang tulong?",
      options: ["Ligtas ako", "Kailangan ko ng tulong"]
    }
  },

  cp_meaning: {
    en: {
      text: "Do you want a simple definition, or a clearer explanation?",
      options: ["Simple", "Detailed"]
    },
    tl: {
      text: "Gusto mo ba ng simpleng paliwanag, o mas malinaw na detalye?",
      options: ["Simple", "Detalyado"]
    }
  },

  cp_specifics: {
    en: {
      text: "Are you curious about types of CP, or how severe it can be?",
      options: ["Types", "Severity"]
    },
    tl: {
      text: "Interesado ka ba sa mga uri ng CP, o sa tindi nito?",
      options: ["Mga uri", "Tindi"]
    }
  },

  parenting_cp: {
    en: {
      text: "Are you looking for guidance, or reassurance as a parent or caregiver?",
      options: ["Guidance", "Reassurance"]
    },
    tl: {
      text: "Naghahanap ka ba ng gabay, o pampalakas-loob bilang magulang o caregiver?",
      options: ["Gabay", "Pampalakas-loob"]
    }
  },

  social_support: {
    en: {
      text: "Do you want to talk about friends and community, or feeling alone?",
      options: ["Friends", "Feeling alone"]
    },
    tl: {
      text: "Gusto mo bang pag-usapan ang kaibigan at komunidad, o ang pakiramdam na mag-isa?",
      options: ["Kaibigan", "Mag-isa"]
    }
  },

  casual: {
    en: {
      text: "We can chat lightly, or talk about something meaningful — your call.",
      options: ["Light chat", "Something meaningful"]
    },
    tl: {
      text: "Pwede tayong kwentuhan lang, o seryosong usapan — ikaw ang bahala.",
      options: ["Kwentuhan", "Seryoso"]
    }
  },

  rant: {
    en: {
      text: "It’s okay to let it out — do you want to vent, or pause first?",
      options: ["Vent", "Pause"]
    },
    tl: {
      text: "Okay lang ilabas — gusto mo bang mag-rant, o huminga muna?",
      options: ["Mag-rant", "Huminga muna"]
    }
  },

  greetings: {
    en: {
      text: "Hi — do you want to chat casually, or talk about something specific?",
      options: ["Casual", "Specific topic"]
    },
    tl: {
      text: "Hi — kwentuhan lang ba, o may gusto kang pag-usapan?",
      options: ["Kwentuhan", "May topic"]
    }
  },

  kids_safe: {
    en: {
      text: "Do you want a simple explanation, or a story-style answer?",
      options: ["Simple", "Story"]
    },
    tl: {
      text: "Gusto mo ba ng simpleng paliwanag, o parang kwento?",
      options: ["Simple", "Kwento"]
    }
  },

  bot_intro: {
    en: {
      text: "Do you want to know what I can do, or what my limits are?",
      options: ["What you can do", "Your limits"]
    },
    tl: {
      text: "Gusto mo bang malaman ang kaya kong gawin, o ang mga limitasyon ko?",
      options: ["Kaya mo", "Limitasyon"]
    }
  },

  language: {
    en: {
      text: "Do you want to continue in English, or switch languages?",
      options: ["English", "Switch"]
    },
    tl: {
      text: "Gusto mo bang magpatuloy sa Tagalog, o magpalit ng wika?",
      options: ["Tagalog", "Magpalit"]
    }
  },

  settings: {
    en: {
      text: "Do you want to change a setting, or clear the chat?",
      options: ["Change settings", "Clear chat"]
    },
    tl: {
      text: "Gusto mo bang baguhin ang settings, o burahin ang chat?",
      options: ["Settings", "Burahin"]
    }
  },

  grounding: {
    en: {
      text: "Do you want to try a breathing exercise, or grounding first?",
      options: ["Breathing", "Grounding"]
    },
    tl: {
      text: "Gusto mo bang subukan ang paghinga, o grounding muna?",
      options: ["Paghinga", "Grounding"]
    }
  },

  encouragement: {
    en: {
      text: "Do you need a little encouragement, or a reminder to rest?",
      options: ["Encouragement", "Rest reminder"]
    },
    tl: {
      text: "Kailangan mo ba ng pampalakas-loob, o paalala na magpahinga?",
      options: ["Pampalakas-loob", "Magpahinga"]
    }
  },

  fallback: {
    en: {
      text: "I want to understand you better — can you explain more, or try another topic?",
      options: ["Explain more", "Another topic"]
    },
    tl: {
      text: "Gusto kitang maintindihan — pwede mo bang linawin, o ibang topic na lang?",
      options: ["Linawin", "Ibang topic"]
    }
  }

};

export default REPLIES;