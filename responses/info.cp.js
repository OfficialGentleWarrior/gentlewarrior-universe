// responses/info.cp.js
// Gentle Heart — CP INFO RESPONSES FLOW (FINAL, NO DEAD-ENDS, BRANCH-SAFE)

window.RESPONSES_INFO_CP = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "Cerebral palsy (CP) affects movement and posture because of early brain injury — do you want a simple explanation or how it shows up in daily life?"
      : "Ang cerebral palsy (CP) ay nakaapekto sa galaw at postura dahil sa maagang pinsala sa utak — gusto mo ba ng simpleng paliwanag o kung paano ito lumalabas sa araw-araw?",
    options: ["simple_explanation", "daily_life"]
  }),

  // ===== SIMPLE EXPLANATION =====
  simple_explanation: (lang) => ({
    text: lang === "en"
      ? "CP happens when the brain has difficulty sending signals to muscles — do you want to know the causes or the types of CP?"
      : "Nangyayari ang CP kapag nahihirapan ang utak magpadala ng signal sa mga kalamnan — gusto mo bang malaman ang sanhi o mga uri ng CP?",
    options: ["causes", "types"]
  }),

  // ===== CAUSES =====
  causes: (lang) => ({
    text: lang === "en"
      ? "CP can happen before birth, during delivery, or after — do you want to know the risk factors or common myths?"
      : "Maaaring mangyari ang CP bago ipanganak, habang ipinapanganak, o pagkatapos — gusto mo bang malaman ang risk factors o mga maling akala?",
    options: ["risk_factors", "myths"]
  }),

  // ===== RISK FACTORS =====
  risk_factors: (lang) => ({
    text: lang === "en"
      ? "Risk factors include premature birth, infections, and lack of oxygen — do you want to learn about myths or daily life impact?"
      : "Kasama sa risk factors ang premature birth, impeksyon, at kakulangan sa oxygen — gusto mo bang malaman ang mga maling akala o epekto nito sa araw-araw?",
    options: ["myths", "daily_life"]
  }),

  // ===== MYTHS =====
  myths: (lang) => ({
    text: lang === "en"
      ? "A common myth is that CP always gets worse — it does not. Do you want to hear another myth or learn about CP types?"
      : "Isang maling akala ay palaging lumalala ang CP — hindi ito totoo. Gusto mo bang makarinig ng isa pang maling akala o alamin ang mga uri ng CP?",
    options: ["another_myth", "types"]
  }),

  another_myth: (lang) => ({
    text: lang === "en"
      ? "Another myth is that people with CP can’t live independently — many can with the right support. Do you want to know the types of cp or move to daily life?"
      : "Isa pang maling akala ay hindi kayang maging independent ang may CP — marami ang nakakaya ito sa tamang suporta. Gusto mo bang malaman ang mga klase ng cp o lumipat sa araw-araw na buhay?",
    options: ["types", "daily_life"]
  }),

  // ===== TYPES =====
  types: (lang) => ({
    text: lang === "en"
      ? "There are different types of CP — do you want a short list or how they differ from each other?"
      : "May iba’t ibang uri ng CP — gusto mo ba ng maikling listahan o paliwanag kung paano sila nagkakaiba?",
    options: ["short_list", "differ"]
  }),

  short_list: (lang) => ({
    text: lang === "en"
      ? "The main types are spastic, dyskinetic, ataxic, and mixed CP — do you want to learn how they differ or how therapy helps?"
      : "Ang pangunahing uri ay spastic, dyskinetic, ataxic, at mixed CP — gusto mo bang malaman ang pagkakaiba nila o kung paano nakakatulong ang therapy?",
    options: ["differences", "therapy"]
  }),

  differ: (lang) => ({
    text: lang === "en"
      ? "These types differ in muscle tone, control, and coordination — do you want to learn about therapy or daily life impact?"
      : "Nagkakaiba sila sa muscle tone, kontrol, at koordinasyon — gusto mo bang malaman ang tungkol sa therapy o epekto sa araw-araw?",
    options: ["therapy", "daily_life"]
  }),

  // ===== DAILY LIFE =====
  daily_life: (lang) => ({
    text: lang === "en"
      ? "In daily life, CP can affect walking, balance, or speech — do you want examples or how people adapt?"
      : "Sa araw-araw, maaaring maapektuhan ang paglakad, balanse, o pagsasalita — gusto mo ba ng mga halimbawa o kung paano sila umaangkop?",
    options: ["examples", "adaptation"]
  }),

  examples: (lang) => ({
    text: lang === "en"
      ? "Some people with CP walk independently, others use mobility aids — do you want to learn about adaptation or therapy?"
      : "May mga taong may CP na nakakalakad mag-isa, ang iba ay gumagamit ng mobility aids — gusto mo bang malaman ang pag-angkop o therapy?",
    options: ["adaptation", "therapy"]
  }),

  adaptation: (lang) => ({
    text: lang === "en"
      ? "People adapt through routines, tools, and support — do you want to learn about therapy or talk about how this feels emotionally?"
      : "Umaangkop ang mga may CP sa pamamagitan ng routines, tools, at suporta — gusto mo bang malaman ang therapy o pag-usapan ang nararamdaman nito?",
    options: ["therapy", "feeling_jump"]
  }),

  // ===== THERAPY =====
  therapy: (lang) => ({
    text: lang === "en"
      ? "Therapy helps improve movement and independence over time — do you want to continue learning about CP or shift to how you’re feeling?"
      : "Tinutulungan ng therapy ang galaw at pagiging independent sa paglipas ng panahon — gusto mo bang ipagpatuloy ang usapang CP o lumipat sa nararamdaman mo?",
    options: ["entry", "feeling_jump"]
  }),

  // ===== FEELING HANDOFF =====
  feeling_jump: (lang) => ({
    text: lang === "en"
      ? "How are you feeling right now — physically or emotionally?"
      : "Kumusta ang pakiramdam mo ngayon — sa katawan man o sa damdamin?",
    options: ["__INTENT_FEELING__", "entry"]
  })

};
