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
  ========================== */

  const CP_LINES = {
    1:"Every small movement matters.",
    2:"Progress looks different for every child.",
    3:"Consistency builds strength.",
    4:"Effort is invisible but real.",
    5:"Some days are slower — that’s okay.",
    6:"Patience is a form of courage.",
    7:"Support makes growth possible.",
    8:"Rest is part of progress.",
    9:"Muscle memory takes time.",
    10:"Milestone reached — keep going.",

    11:"Repetition builds confidence.",
    12:"Stability comes before speed.",
    13:"Balance improves step by step.",
    14:"Care is strength, not weakness.",
    15:"Progress doesn’t rush.",
    16:"Every attempt counts.",
    17:"Therapy is effort, not ease.",
    18:"Small gains add up.",
    19:"Support systems matter.",
    20:"Another quiet victory.",

    21:"Some wins are internal.",
    22:"Strength grows through patience.",
    23:"Movement is learned, not forced.",
    24:"Caregivers are heroes too.",
    25:"Milestone reached — resilience shown.",

    26:"Progress isn’t linear.",
    27:"Rest days still count.",
    28:"Focus beats force.",
    29:"Adaptation is intelligence.",
    30:"Effort creates ability.",

    31:"Gentle persistence wins.",
    32:"Each repetition matters.",
    33:"Balance takes trust.",
    34:"Support enables growth.",
    35:"Quiet strength is real.",

    36:"Improvement can be slow and true.",
    37:"Movement is personal.",
    38:"No comparison needed.",
    39:"Care builds confidence.",
    40:"Another step forward.",

    41:"Every day is training.",
    42:"Some challenges are invisible.",
    43:"Progress lives in patience.",
    44:"Support changes outcomes.",
    45:"Strength grows gently.",

    46:"Adaptation is progress.",
    47:"Consistency beats intensity.",
    48:"Care is power.",
    49:"Small wins matter.",
    50:"Milestone reached — steady growth.",

    51:"Effort is success.",
    52:"Movement is earned.",
    53:"Trust the process.",
    54:"Growth is ongoing.",
    55:"Support sustains progress.",

    56:"Every attempt counts.",
    57:"Patience builds ability.",
    58:"Care creates opportunity.",
    59:"Resilience shows quietly.",
    60:"Progress continues.",

    61:"Gentle work creates strength.",
    62:"Consistency builds confidence.",
    63:"Support matters daily.",
    64:"No rush, no race.",
    65:"Adaptation is strength.",

    66:"Progress can be unseen.",
    67:"Effort never disappears.",
    68:"Care makes growth possible.",
    69:"Every repetition counts.",
    70:"Another step achieved.",

    71:"Growth takes time.",
    72:"Movement is learned.",
    73:"Care fuels courage.",
    74:"Strength comes softly.",
    75:"Consistency continues.",

    76:"Support builds stability.",
    77:"Patience brings progress.",
    78:"Every effort matters.",
    79:"Growth is personal.",
    80:"Still moving forward.",

    81:"Quiet strength endures.",
    82:"Adaptation leads progress.",
    83:"Care sustains effort.",
    84:"Progress is earned daily.",
    85:"Each step matters.",

    86:"Movement is resilience.",
    87:"Support empowers growth.",
    88:"Strength grows gently.",
    89:"Care makes difference.",
    90:"Another milestone reached.",

    91:"Progress continues forward.",
    92:"Patience shapes ability.",
    93:"Consistency creates change.",
    94:"Care strengthens effort.",
    95:"Movement evolves slowly.",

    96:"Support makes progress possible.",
    97:"Strength grows with time.",
    98:"Every effort counts.",
    99:"Resilience remains.",
    100:"Milestone reached — gentle strength."
  };
/* =========================
   CP SHARE LINES (FOR X SHARE)
========================== */

const CP_SHARE_LINES = [
  "For children with cerebral palsy, progress is built through patience and daily effort.",
  "Cerebral palsy progress looks different for every child — and every step matters.",
  "For kids with cerebral palsy, care and consistency matter more than speed.",
  "Cerebral palsy isn’t about limits — it’s about steady progress over time.",
  "For children with cerebral palsy, small gains are real victories."
];

  function getRandomCpLine(level) {
    const pool = [];
    for (let i = Math.max(1, level - 3); i <= Math.min(100, level + 3); i++) {
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
const retryBtn = document.getElementById("retryBtn");
const shareXBtn = document.getElementById("shareXBtn");
const nextBtn = document.getElementById("nextLevelBtn");
retryBtn?.addEventListener("click", () => {
  failOverlay.classList.add("hidden");

  localStorage.removeItem("pm_save");

  isRunOver = false;

  score = 0;
  level = 1;
  moves = LEVEL_CONFIG.baseMoves;
  levelStartScore = 0;

  selectedTile = null;
  isResolving = true;
  isInitPhase = true;

  runStartTime = Date.now();
  runSubmitted = false;

  startLevel(true); // ✅ FORCE FRESH START
});
shareXBtn?.addEventListener("click", () => {
  const cpLine =
    CP_SHARE_LINES[Math.floor(Math.random() * CP_SHARE_LINES.length)];

  const text =
    `I just finished a Pillar Match run.\n\n` +
    `${cpLine}\n\n` +
    `Play here: https://gentlewarrior.github.io`;

  const url =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(text);

  window.open(url, "_blank");
});

  /* =========================
     CP LINE CONTAINER (SAFE)
  ========================== */

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

let isRunOver = false;

let tiles = [];
let selectedTile = null;
let isResolving = true;
let isInitPhase = true;

let score = 0;
let level = 1;
let moves = LEVEL_CONFIG.baseMoves;
let levelStartScore = 0;
let runStartTime = Date.now();
let runSubmitted = false;

  /* =========================
     SAVE / LOAD (ANTI REFRESH)
  ========================== */

  function saveGame() {
  if (isRunOver) return; // ⛔ DO NOT SAVE AFTER FAIL

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

function submitWeeklyRun() {
  if (runSubmitted) return;
  if (!window.weeklyLeaderboard) return;

  runSubmitted = true;

  const timeSeconds = Math.floor((Date.now() - runStartTime) / 1000);

  const name =
    localStorage.getItem("pm_player_name") ||
    prompt("Enter your name for the weekly leaderboard:");

  if (!name) return;

  localStorage.setItem("pm_player_name", name);

  window.weeklyLeaderboard.submitRun({
    name,
    level,
    score,
    moves,
    time: timeSeconds
  });
}

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
    cpLineEl.textContent = getRandomCpLine(level); // 🔁 RANDOM EACH TIME
    levelOverlay.classList.remove("hidden");
  }

  function showFail() {
  isResolving = true;
  isRunOver = true;        // 🔒 LOCK SAVE
  selectedTile = null;
  submitWeeklyRun();
  failOverlay.classList.remove("hidden");
}

  /* =========================
     START LEVEL (LOCKED)
  ========================== */

  function startLevel(forceFresh = false) {
  const saved = forceFresh ? null : loadGame();

    runStartTime = Date.now();
    runSubmitted = false;

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
    isInitPhase = true;
    isResolving = true;
    createGrid();
    updateHUD();
    setTimeout(resolveInitMatches, 0);
    saveGame();
  });

  /* =========================
     HELPERS / GRID / GAMEPLAY
     (UNCHANGED — SAME AS YOUR CODE)
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

  function onTileClick(tile) {
    if (isResolving || moves <= 0) return;

    if (!selectedTile) {
      selectedTile = tile;
      tile.classList.add("selected");
      return;
    }

    const a = selectedTile;
    const b = tile;
    a.classList.remove("selected");
    selectedTile = null;

    if (!isAdjacent(+a.dataset.index, +b.dataset.index)) return;

    isResolving = true;

    animateSwap(a, b, () => {
      commitSwap(a, b);
      const groups = findMatchesDetailed();

      if (!groups.length) {
        animateSwap(a, b, () => {
          commitSwap(a, b);
          isResolving = false;
        });
      } else {
        moves--;
        updateHUD();
        resolveBoard(groups);
      }
    });
  }

  function animateSwap(a, b, done) {
    const p1 = indexToRowCol(+a.dataset.index);
    const p2 = indexToRowCol(+b.dataset.index);
    const dx = (p2.col - p1.col) * TILE_SIZE;
    const dy = (p2.row - p1.row) * TILE_SIZE;

    a.style.transition = b.style.transition = "transform 0.15s ease";
    a.style.transform = `translate(${dx}px, ${dy}px)`;
    b.style.transform = `translate(${-dx}px, ${-dy}px)`;

    setTimeout(() => {
      a.style.transition = b.style.transition = "";
      a.style.transform = b.style.transform = "";
      done();
    }, 150);
  }

  function commitSwap(a, b) {
    const p1 = a.dataset.pillar;
    const p2 = b.dataset.pillar;
    a.dataset.pillar = p2;
    b.dataset.pillar = p1;
    a.src = `../assets/pillars/${p2}.png`;
    b.src = `../assets/pillars/${p1}.png`;
  }

  function findMatchesDetailed() {
    const groups = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      let count = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        const cur = c < GRID_SIZE ? tiles[r*GRID_SIZE+c].dataset.pillar : null;
        const prev = tiles[r*GRID_SIZE+c-1].dataset.pillar;
        if (cur === prev) count++;
        else {
          if (count >= 3) {
            const g = [];
            for (let k = 0; k < count; k++) g.push(r*GRID_SIZE+c-1-k);
            groups.push(g);
          }
          count = 1;
        }
      }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      let count = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        const cur = r < GRID_SIZE ? tiles[r*GRID_SIZE+c].dataset.pillar : null;
        const prev = tiles[(r-1)*GRID_SIZE+c].dataset.pillar;
        if (cur === prev) count++;
        else {
          if (count >= 3) {
            const g = [];
            for (let k = 0; k < count; k++) g.push((r-1-k)*GRID_SIZE+c);
            groups.push(g);
          }
          count = 1;
        }
      }
    }
    return groups;
  }

  function spawnSparkle(tile) {
    const sparkle = document.createElement("div");
    sparkle.style.position = "absolute";
    sparkle.style.width = "10px";
    sparkle.style.height = "10px";
    sparkle.style.borderRadius = "50%";
    sparkle.style.pointerEvents = "none";
    sparkle.style.background =
      "radial-gradient(circle, #fff, rgba(255,255,255,0.2), transparent)";
    const rect = tile.getBoundingClientRect();
    sparkle.style.left = rect.left + rect.width / 2 + "px";
    sparkle.style.top = rect.top + rect.height / 2 + "px";
    document.body.appendChild(sparkle);
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 20;
    sparkle.animate([
      { transform: "scale(0.5)", opacity: 1 },
      {
        transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(1.2)`,
        opacity: 0
      }
    ], { duration: 400, easing: "ease-out" });
    setTimeout(() => sparkle.remove(), 420);
  }

  function resolveBoard(groups) {
    const toClear = new Set();

    groups.forEach(group => {
      const size = group.length;
      if (!isInitPhase) {
        score += size === 3 ? 100 :
                 size === 4 ? 200 :
                 size === 5 ? 400 :
                 600 + (size - 6) * 100;
      }
      group.forEach(i => {
        toClear.add(i);
        spawnSparkle(tiles[i]);
      });
    });

    updateHUD();

    toClear.forEach(i => {
      const t = tiles[i];
      t.dataset.pillar = "empty";
      t.style.opacity = "0";
      t.style.transform = "scale(0.6)";
      t.style.pointerEvents = "none";
    });

    setTimeout(() => {
      applyGravityAnimated(() => {
        const next = findMatchesDetailed();
        if (next.length) resolveBoard(next);
        else {
          isResolving = false;
          isInitPhase = false;
          saveGame();
          const gained = score - levelStartScore;
          if (gained >= LEVEL_CONFIG.scoreTarget(level)) showLevelComplete();
          else if (moves <= 0) showFail();
        }
      });
    }, 180);
  }

  function applyGravityAnimated(done) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const stack = [];
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r*GRID_SIZE+c];
        if (t.dataset.pillar !== "empty") stack.push(t.dataset.pillar);
      }
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r*GRID_SIZE+c];
        const p = stack.shift() || randomPillar();
        t.dataset.pillar = p;
        t.src = `../assets/pillars/${p}.png`;
        t.style.opacity = "1";
        t.style.transform = "scale(1)";
        t.style.pointerEvents = "auto";
      }
    }
    setTimeout(done, 220);
  }

  function resolveInitMatches() {
    const init = findMatchesDetailed();
    if (init.length) resolveBoard(init);
    else {
      isResolving = false;
      isInitPhase = false;
      saveGame();
    }
  }

  /* =========================
     INIT
  ========================== */

  startLevel();

});
