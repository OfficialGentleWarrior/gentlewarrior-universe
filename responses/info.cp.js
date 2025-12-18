// responses/info.cp.js
// Gentle Heart — CP INFO RESPONSES FLOW (FINAL, FIXED, ROUTER-SAFE)

window.RESPONSES_INFO_CP = {

  // ===== ENTRY =====
  entry: (lang) => ({
    text: lang === "en"
      ? "Cerebral palsy (CP) affects movement and posture due to early brain injury — do you want a simple explanation or how it affects daily life?"
      : "Ang cerebral palsy (CP) ay nakaapekto sa galaw at postura dahil sa maagang pinsala sa utak — gusto mo ba ng simpleng paliwanag o epekto nito sa araw-araw?",
    options: ["simple_explanation", "daily_life"]
  }),

  // ===== SIMPLE EXPLANATION =====
  simple_explanation: (lang) => ({
    text: lang === "en"
      ? "CP happens when the brain has difficulty sending signals to muscles — do you want the causes or the types of CP?"
      : "Nangyayari ang CP kapag nahihirapan ang utak magpadala ng signal sa kalamnan — gusto mo bang malaman ang sanhi o mga uri nito?",
    options: ["causes", "types"]
  }),

  // ===== CAUSES =====
  causes: (lang) => ({
    text: lang === "en"
      ? "CP can occur before birth, during delivery, or after — do you want risk factors or common myths?"
      : "Maaaring mangyari ang CP bago ipanganak, habang ipinapanganak, o pagkatapos — gusto mo bang malaman ang risk factors o maling akala?",
    options: ["risk_factors", "myths"]
  }),

  risk_factors: (lang) => ({
    text: lang === "en"
      ? "Risk factors include premature birth, infections, and lack of oxygen."
      : "Kasama sa risk factors ang premature birth, impeksyon, at kakulangan sa oxygen.",
    options: ["exit"]
  }),

  myths: (lang) => ({
    text: lang === "en"
      ? "A common myth is that CP always gets worse — it does not."
      : "Isang maling akala ay palaging lumalala ang CP — hindi ito totoo.",
    options: ["exit"]
  }),

  // ===== TYPES =====
  types: (lang) => ({
    text: lang === "en"
      ? "There are different types of CP — do you want a short list or how they differ?"
      : "May iba’t ibang uri ng CP — gusto mo ba ng listahan o paliwanag ng pagkakaiba?",
    options: ["short_list", "differences"]
  }),

  short_list: (lang) => ({
    text: lang === "en"
      ? "The main types are spastic, dyskinetic, ataxic, and mixed CP."
      : "Ang pangunahing uri ay spastic, dyskinetic, ataxic, at mixed CP.",
    options: ["exit"]
  }),

  differences: (lang) => ({
    text: lang === "en"
      ? "They differ in muscle tone, control, and coordination."
      : "Nagkakaiba sila sa muscle tone, kontrol, at koordinasyon.",
    options: ["exit"]
  }),

  // ===== DAILY LIFE =====
  daily_life: (lang) => ({
    text: lang === "en"
      ? "In daily life, CP can affect walking, balance, or speech — do you want examples or adaptation?"
      : "Sa araw-araw, maaaring maapektuhan ang lakad, balanse, o pananalita — gusto mo ba ng halimbawa o pag-angkop?",
    options: ["examples", "adaptation"]
  }),

  examples: (lang) => ({
    text: lang === "en"
      ? "Some people with CP walk independently, others use mobility aids."
      : "May mga taong may CP na nakakalakad mag-isa, ang iba ay gumagamit ng mobility aids.",
    options: ["exit"]
  }),

  adaptation: (lang) => ({
    text: lang === "en"
      ? "People adapt through therapy, routines, and support systems."
      : "Umaangkop ang mga may CP sa pamamagitan ng therapy, routine, at suporta.",
    options: ["therapy", "exit"]
  }),

  // ===== THERAPY =====
  therapy: (lang) => ({
    text: lang === "en"
      ? "Therapy helps improve movement and independence over time."
      : "Tinutulungan ng therapy ang galaw at pagiging independent sa paglipas ng panahon.",
    options: ["exit"]
  }),

  // ===== EXIT =====
  exit: (lang) => ({
    text: lang === "en"
      ? "We can continue talking about CP, or shift to how you’re feeling."
      : "Pwede pa nating ituloy ang usapang CP, o lumipat sa nararamdaman mo.",
    options: []
  })

};