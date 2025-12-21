document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================== */

  const PILLARS = [
    "aurelion","gaialune","ignara",
    "solyndra","umbrath","zeratheon"
  ];

  const GRID_SIZE = 7;
  const TILE_SIZE = 56 + 6;

  const LEVEL_CONFIG = {
    baseMoves: 20,
    scoreTarget: level => 1500 + (level - 1) * 500
  };

  /* =========================
     CP AWARENESS LINES (1–100)
     🔁 RANDOM PER LEVEL CLEAR
     ⚠️ ARRAY — VALID JS
  ========================== */

  const CP_LINES = [
    "Every small movement matters.",
    "Progress looks different for every child.",
    "Consistency builds strength.",
    "Effort is invisible but real.",
    "Some days are slower — that’s okay.",
    "Patience is a form of courage.",
    "Support makes growth possible.",
    "Rest is part of progress.",
    "Muscle memory takes time.",
    "Milestone reached — keep going.",

    "Repetition builds confidence.",
    "Stability comes before speed.",
    "Balance improves step by step.",
    "Care is strength, not weakness.",
    "Progress doesn’t rush.",
    "Every attempt counts.",
    "Therapy is effort, not ease.",
    "Small gains add up.",
    "Support systems matter.",
    "Another quiet victory.",

    "Some wins are internal.",
    "Strength grows through patience.",
    "Movement is learned, not forced.",
    "Caregivers are heroes too.",
    "Milestone reached — resilience shown.",

    "Progress isn’t linear.",
    "Rest days still count.",
    "Focus beats force.",
    "Adaptation is intelligence.",
    "Effort creates ability.",

    "Gentle persistence wins.",
    "Each repetition matters.",
    "Balance takes trust.",
    "Support enables growth.",
    "Quiet strength is real.",

    "Improvement can be slow and true.",
    "Movement is personal.",
    "No comparison needed.",
    "Care builds confidence.",
    "Another step forward.",

    "Every day is training.",
    "Some challenges are invisible.",
    "Progress lives in patience.",
    "Support changes outcomes.",
    "Strength grows gently.",

    "Adaptation is progress.",
    "Consistency beats intensity.",
    "Care is power.",
    "Small wins matter.",
    "Milestone reached — steady growth.",

    "Effort is success.",
    "Movement is earned.",
    "Trust the process.",
    "Growth is ongoing.",
    "Support sustains progress.",

    "Every attempt counts.",
    "Patience builds ability.",
    "Care creates opportunity.",
    "Resilience shows quietly.",
    "Progress continues.",

    "Gentle work creates strength.",
    "Consistency builds confidence.",
    "Support matters daily.",
    "No rush, no race.",
    "Adaptation is strength.",

    "Progress can be unseen.",
    "Effort never disappears.",
    "Care makes growth possible.",
    "Every repetition counts.",
    "Another step achieved.",

    "Growth takes time.",
    "Movement is learned.",
    "Care fuels courage.",
    "Strength comes softly.",
    "Consistency continues.",

    "Support builds stability.",
    "Patience brings progress.",
    "Every effort matters.",
    "Growth is personal.",
    "Still moving forward.",

    "Quiet strength endures.",
    "Adaptation leads progress.",
    "Care sustains effort.",
    "Progress is earned daily.",
    "Each step matters.",

    "Movement is resilience.",
    "Support empowers growth.",
    "Strength grows gently.",
    "Care makes difference.",
    "Another milestone reached.",

    "Progress continues forward.",
    "Patience shapes ability.",
    "Consistency creates change.",
    "Care strengthens effort.",
    "Movement evolves slowly.",

    "Support makes progress possible.",
    "Strength grows with time.",
    "Every effort counts.",
    "Resilience remains.",
    "Milestone reached — gentle strength."
  ];

  function getRandomCpLine(level) {
    const idx = Math.max(0, Math.min(99, level - 1));
    const pool = [];
    for (let i = Math.max(0, idx - 3); i <= Math.min(99, idx + 3); i++) {
      pool.push(CP_LINES[i]);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* =========================
     DOM
  ========================== */

  const gridEl = document.querySelector(".grid");
  const scoreEl = document.getElementById("score");
  const levelEl = document.getElementById("level");
  const movesEl = document.getElementById("moves");
  const progressBar = document.getElementById("progressBar");

  const levelOverlay = document.getElementById("levelOverlay");
  const failOverlay = document.getElementById("failOverlay");
  const nextBtn = document.getElementById("nextLevelBtn");

  let cpLineEl = levelOverlay.querySelector(".cp-line");
  if (!cpLineEl) {
    cpLineEl = document.createElement("p");
    cpLineEl.className = "cp-line";
    cpLineEl.style.marginTop = "10px";
    cpLineEl.style.fontSize = "14px";
    cpLineEl.style.opacity = "0.9";
    levelOverlay.appendChild(cpLineEl);
  }

  /* =========================
     STATE
  ========================== */

  let tiles = [];
  let selectedTile = null;
  let isResolving = true;
  let isInitPhase = true;

  let score = 0;
  let level = 1;
  let moves = LEVEL_CONFIG.baseMoves;
  let levelStartScore = 0;

  /* =========================
     SAVE / LOAD (ANTI REFRESH)
  ========================== */

  function saveGame() {
    localStorage.setItem("pm_save", JSON.stringify({
      level,
      score,
      moves,
      levelStartScore,
      board: tiles.map(t => t.dataset.pillar)
    }));
  }

  function loadGame() {
    const raw = localStorage.getItem("pm_save");
    return raw ? JSON.parse(raw) : null;
  }

  window.addEventListener("beforeunload", saveGame);

  /* =========================
     UI
  ========================== */

  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    movesEl.textContent = moves;

    const gained = score - levelStartScore;
    progressBar.style.width =
      Math.min(100, (gained / LEVEL_CONFIG.scoreTarget(level)) * 100) + "%";
  }

  function showLevelComplete() {
    isResolving = true;
    cpLineEl.textContent = getRandomCpLine(level);
    levelOverlay.classList.remove("hidden");
  }

  function showFail() {
    isResolving = true;
    failOverlay.classList.remove("hidden");
  }

  /* =========================
     START LEVEL
  ========================== */

  function startLevel() {
    const saved = loadGame();

    isResolving = true;
    isInitPhase = true;
    selectedTile = null;

    if (saved) {
      level = saved.level;
      score = saved.score;
      moves = saved.moves;
      levelStartScore = saved.levelStartScore;
      createGrid(saved.board);
    } else {
      moves = LEVEL_CONFIG.baseMoves;
      levelStartScore = score;
      createGrid();
    }

    updateHUD();
    setTimeout(resolveInitMatches, 0);
  }

  nextBtn?.addEventListener("click", () => {
    levelOverlay.classList.add("hidden");
    level++;
    moves = LEVEL_CONFIG.baseMoves;
    levelStartScore = score;
    isResolving = true;
    isInitPhase = true;
    createGrid();
    updateHUD();
    setTimeout(resolveInitMatches, 0);
    saveGame();
  });

  /* =========================
     HELPERS / GRID / GAMEPLAY
     (UNCHANGED)
  ========================== */

  function randomPillar() {
    return PILLARS[Math.floor(Math.random() * PILLARS.length)];
  }

  function indexToRowCol(i) {
    return { row: Math.floor(i / GRID_SIZE), col: i % GRID_SIZE };
  }

  function isAdjacent(i1, i2) {
    const a = indexToRowCol(i1);
    const b = indexToRowCol(i2);
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
  }

  function createGrid(boardData = null) {
    gridEl.innerHTML = "";
    tiles = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const img = document.createElement("img");
      const p = boardData ? boardData[i] : randomPillar();
      img.className = "tile";
      img.dataset.index = i;
      img.dataset.pillar = p;
      img.src = `../assets/pillars/${p}.png`;
      img.draggable = false;
      img.addEventListener("click", () => onTileClick(img));
      tiles.push(img);
      gridEl.appendChild(img);
    }
  }

  /* ===== remainder (swap, match, sparkle, gravity) UNCHANGED ===== */

  startLevel();

});
