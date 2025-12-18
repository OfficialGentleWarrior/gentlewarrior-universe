// responses/support.js
// Gentle Heart — SUPPORT RESPONSES FLOW (FINAL, COMPLETE, SAFE)

window.RESPONSES_SUPPORT = {

  // ===== ENTRY POINT =====
  entry: (lang) => ({
    text: lang === "en"
      ? "That sounds really hard — do you want comfort right now, or help figuring things out?"
      : "Mukhang mahirap talaga — gusto mo bang may umaliw muna, o tulong sa pag-ayos nito?",
    options: ["comfort", "help"]
  }),

  // ===== COMFORT =====
  comfort: (lang) => ({
    text: lang === "en"
      ? "I’m here with you — do you want quiet presence, or gentle reassurance?"
      : "Andito lang ako — gusto mo bang tahimik na kasama, o banayad na pampalakas-loob?",
    options: ["quiet_presence", "reassurance"]
  }),

  // ===== QUIET PRESENCE =====
  quiet_presence: (lang) => ({
    text: lang === "en"
      ? "We can stay here quietly — do you want to breathe together, or just pause?"
      : "Pwede tayong manatiling tahimik — gusto mo bang maghinga kasama, o huminto muna?",
    options: ["breathe_together", "pause"]
  }),

  breathe_together: (lang) => ({
    text: lang === "en"
      ? "Let’s take a slow breath — another breath, or sit quietly?"
      : "Huminga tayo nang dahan-dahan — isa pa, o tahimik lang?",
    options: ["another_breath", "sit_quietly"]
  }),

  another_breath: (lang) => ({
    text: lang === "en"
      ? "Good — keep breathing, or exit for now?"
      : "Ayos — magpatuloy sa paghinga, o lumabas muna?",
    options: ["breathe_together", "exit"]
  }),

  sit_quietly: (lang) => ({
    text: lang === "en"
      ? "That’s okay — stay here, or change topic?"
      : "Ayos lang — manatili, o mag-iba ng usapan?",
    options: ["stay", "change_topic"]
  }),

  pause: (lang) => ({
    text: lang === "en"
      ? "Pausing is okay — stay here, or change the topic?"
      : "Okay lang huminto — manatili, o mag-iba ng usapan?",
    options: ["stay", "change_topic"]
  }),

  stay: (lang) => ({
    text: lang === "en"
      ? "I’m here — rest a bit, or check in with your feelings?"
      : "Andito ako — magpahinga muna, o kumustahin ang pakiramdam?",
    options: ["rest", "my_feelings"]
  }),

  rest: (lang) => ({
    text: lang === "en"
      ? "Rest is okay — stay here, or exit?"
      : "Ayos lang magpahinga — manatili, o lumabas?",
    options: ["stay", "exit"]
  }),

  my_feelings: (lang) => ({
    text: lang === "en"
      ? "Tell me what you’re feeling right now."
      : "Sabihin mo kung ano ang nararamdaman mo ngayon.",
    options: ["exit"]
  }),

  change_topic: (lang) => ({
    text: lang === "en"
      ? "Sure — we can switch topics anytime."
      : "Sige — pwede tayong mag-iba ng topic kahit kailan.",
    options: ["exit"]
  }),

  // ===== REASSURANCE =====
  reassurance: (lang) => ({
    text: lang === "en"
      ? "You’re not alone — reminder of your strength, or steady support?"
      : "Hindi ka nag-iisa — paalala ng lakas mo, o tuloy-tuloy na suporta?",
    options: ["my_strength", "steady_support"]
  }),

  my_strength: (lang) => ({
    text: lang === "en"
      ? "You’ve handled a lot — reflect on that, or rest?"
      : "Marami ka nang nalagpasan — balikan iyon, o magpahinga?",
    options: ["reflect", "rest"]
  }),

  reflect: (lang) => ({
    text: lang === "en"
      ? "That strength is real — keep talking, or pause?"
      : "Totoo ang lakas mo — magpatuloy, o huminto?",
    options: ["keep_talking", "pause"]
  }),

  steady_support: (lang) => ({
    text: lang === "en"
      ? "I’m staying with you — keep talking, or just feel supported?"
      : "Kasama mo ako — magpatuloy, o suporta lang?",
    options: ["keep_talking", "just_support"]
  }),

  keep_talking: (lang) => ({
    text: lang === "en"
      ? "I’m listening."
      : "Nakikinig ako.",
    options: ["exit"]
  }),

  just_support: (lang) => ({
    text: lang === "en"
      ? "I’m here with you."
      : "Andito lang ako.",
    options: ["exit"]
  }),

  // ===== HELP =====
  help: (lang) => ({
    text: lang === "en"
      ? "Let’s take this step by step — advice, or break it down?"
      : "Isa-isahin natin — payo, o himayin?",
    options: ["advice", "break_it_down"]
  }),

  advice: (lang) => ({
    text: lang === "en"
      ? "Start small — one step, or a few options?"
      : "Magsimula sa maliit — isang hakbang, o mga pagpipilian?",
    options: ["one_step", "options"]
  }),

  one_step: (lang) => ({
    text: lang === "en"
      ? "Do it now, or later?"
      : "Ngayon, o mamaya?",
    options: ["now", "later"]
  }),

  now: (lang) => ({
    text: lang === "en"
      ? "Okay — let’s do it together."
      : "Sige — sabay natin gawin.",
    options: ["exit"]
  }),

  later: (lang) => ({
    text: lang === "en"
      ? "That’s fine — we can come back to it."
      : "Ayos lang — babalikan natin.",
    options: ["exit"]
  }),

  options: (lang) => ({
    text: lang === "en"
      ? "Choose one, or talk it through?"
      : "Pumili, o pag-usapan?",
    options: ["choose", "talk_it_through"]
  }),

  choose: (lang) => ({
    text: lang === "en"
      ? "Take your time — I’m here."
      : "Walang rush — andito lang ako.",
    options: ["exit"]
  }),

  talk_it_through: (lang) => ({
    text: lang === "en"
      ? "Let’s talk it through slowly."
      : "Pag-usapan natin nang dahan-dahan.",
    options: ["exit"]
  }),

  break_it_down: (lang) => ({
    text: lang === "en"
      ? "Hardest part, or what you control?"
      : "Pinakamahirap, o kaya mong kontrolin?",
    options: ["hardest_part", "what_i_control"]
  }),

  hardest_part: (lang) => ({
    text: lang === "en"
      ? "Want to talk, or breathe first?"
      : "Pag-usapan, o huminga muna?",
    options: ["talk", "breathe"]
  }),

  talk: (lang) => ({
    text: lang === "en"
      ? "I’m listening."
      : "Nakikinig ako.",
    options: ["exit"]
  }),

  breathe: (lang) => ({
    text: lang === "en"
      ? "Let’s take one slow breath together."
      : "Huminga tayo nang dahan-dahan.",
    options: ["exit"]
  }),

  what_i_control: (lang) => ({
    text: lang === "en"
      ? "Act on it, or acknowledge it?"
      : "Kilos, o kilalanin?",
    options: ["act", "acknowledge"]
  }),

  act: (lang) => ({
    text: lang === "en"
      ? "One small action is enough."
      : "Sapat na ang maliit na hakbang.",
    options: ["exit"]
  }),

  acknowledge: (lang) => ({
    text: lang === "en"
      ? "That awareness already helps."
      : "Malaking tulong na ang pag-alam.",
    options: ["exit"]
  }),

  // ===== EXIT =====
  exit: (lang) => ({
    text: lang === "en"
      ? "We can talk again anytime."
      : "Pwede tayong mag-usap ulit kahit kailan.",
    options: []
  })

};