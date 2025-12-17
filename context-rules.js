// context-rules.js
// Gentle Heart — Context Rules v1 (LOCKED)
// Used by logic.js ONLY
// Keyword-first, context-second (NO LOGIC CHANGE)

// ================= CLASS A — FULL CONTEXT =================
// Emotional / conversational categories
// Allows generic follow-ups like "oo", "kwento", "makinig"

window.FULL_CONTEXT_CATEGORIES = [
  "mood",
  "emotional_support",
  "rant",
  "casual",
  "encouragement",
  "anxiety_stress",
  "sleep",
  "social_support",
  "family_support",
  "parenting_cp"
];

window.FULL_CONTEXT_WORDS = [
  "oo",
  "yes",
  "sige",
  "okay",
  "ganon",
  "ganun",
  "kwento",
  "magkwento",
  "makinig",
  "makinig lang",
  "bakit",
  "paano",
  "ano pa",
  "tuloy"
];

// ================= CLASS B — LIMITED CONTEXT =================
// Informational CP-related categories
// Context carry ONLY if still inside same category

window.LIMITED_CONTEXT_CATEGORIES = [
  "cp_overview",
  "cp_meaning",
  "cp_specifics",
  "cp_signs",
  "cp_therapy",
  "care_tips",
  "daily_life",
  "medical",
  "kids_safe"
];

window.LIMITED_CONTEXT_WORDS = [
  "paliwanag",
  "explain",
  "basic",
  "basics",
  "simple",
  "detailed",
  "detalyado",
  "araw araw",
  "araw-araw",
  "daily life",
  "halimbawa",
  "example"
];

// ================= CLASS C — NO CONTEXT =================
// Keyword-only categories (NO carry)

window.NO_CONTEXT_CATEGORIES = [
  "food",
  "hobby",
  "crush",
  "genz",
  "language",
  "settings",
  "bot_intro"
];

// ================= CLASS D — SAFETY =================
// Always override, never carry

window.SAFETY_CATEGORIES = [
  "hotline"
];

// ================= CLASS E — SYSTEM =================
// Resets only

window.SYSTEM_CATEGORIES = [
  "greetings",
  "fallback"
];