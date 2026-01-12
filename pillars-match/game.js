document.addEventListener("DOMContentLoaded", () => {

/* =========================
   FIREBASE HOOKS (from index)
========================= */

const {
  pillarPlayers,
  pillarRuns,
  currentSeasonId,
  getPillarDeviceTag,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} = window.pillarDB;

/* =========================
   CORE CONFIG
========================= */

const PILLARS = [
  "aurelion","gaialune","ignara",
  "solyndra","umbrath","zeratheon"
];

const GRID_SIZE = 7;

const LEVEL_CONFIG = {
  baseMoves: 20,
  scoreTarget: level => 1500 + (level - 1) * 500
};

/* =========================
   CP LINES (1–100) PART 1
========================= */

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
  11:"Tiny gains are still victories.",
  12:"Strength grows in quiet moments.",
  13:"Balance takes practice.",
  14:"Every repetition builds pathways.",
  15:"Small steps shape big futures.",
  16:"Progress isn’t a race.",
  17:"Consistency beats intensity.",
  18:"Every effort counts.",
  19:"Growth is happening, even when unseen.",
  20:"Patience builds power.",
  21:"The body learns through time.",
  22:"Support makes the journey lighter.",
  23:"Rest allows healing.",
  24:"Movement is courage.",
  25:"Persistence creates change.",
  26:"One step today, stronger tomorrow.",
  27:"Small motions, strong spirit.",
  28:"Every try matters.",
  29:"Progress is personal.",
  30:"Quiet strength is real.",
  31:"Each attempt builds confidence.",
  32:"Your effort is enough.",
  33:"The body remembers.",
  34:"Growth takes patience.",
  35:"Every session matters.",
  36:"Consistency builds stability.",
  37:"Hard days still count.",
  38:"You are moving forward.",
  39:"Progress is not linear.",
  40:"Strength comes in many forms.",
  41:"Your journey is unique.",
  42:"Healing takes time.",
  43:"Your effort is powerful.",
  44:"Small wins build big courage.",
  45:"Every movement is meaningful.",
  46:"Progress lives in repetition.",
  47:"Patience grows resilience.",
  48:"Each step builds independence.",
  49:"Your work matters.",
  50:"Halfway there. Keep going."
};

function getRandomCpLine(level) {
  const pool = [];
  for (let i = Math.max(1, level - 3); i <= Math.min(100, level + 3); i++) {
    if (CP_LINES[i]) pool.push(CP_LINES[i]);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/* =========================
   DOM
========================= */

const gridEl = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const movesEl = document.getElementById("moves");
const progressBar = document.getElementById("progressBar");
const leaderboardEl = document.getElementById("leaderboardList");

const endRunOverlay = document.getElementById("endRunOverlay");
const endRunLevel   = document.getElementById("endRunLevel");
const endRunScore   = document.getElementById("endRunScore");
const endRunCpLine  = document.getElementById("endRunCpLine");
const tryAgainBtn   = document.getElementById("tryAgainBtn");
const shareXBtn     = document.getElementById("shareXBtn");

/* =========================
   STATE
========================= */

let tiles = [];
let selectedTile = null;
let isResolving = false;
let isRunActive = true;

let score = 0;
let level = 1;
let moves = LEVEL_CONFIG.baseMoves;
let levelStartScore = 0;
let runStartTime = Date.now();

/* =========================
   HUD
========================= */

function updateHUD() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  movesEl.textContent = moves;

  const gained = score - levelStartScore;
  progressBar.style.width =
    Math.min(100, (gained / LEVEL_CONFIG.scoreTarget(level)) * 100) + "%";
}

/* =========================
   END RUN OVERLAY
========================= */

function showEndRunOverlay() {
  endRunLevel.textContent = level;
  endRunScore.textContent = score;
  endRunCpLine.textContent = getRandomCpLine(level);
  endRunOverlay.classList.remove("hidden");
}

document.getElementById("endRunBtn").addEventListener("click", endRun);

tryAgainBtn.addEventListener("click", () => {
  endRunOverlay.classList.add("hidden");
  localStorage.removeItem("pm_save");

  level = 1;
  score = 0;
  moves = LEVEL_CONFIG.baseMoves;
  levelStartScore = 0;
  isRunActive = true;
  runStartTime = Date.now();

  startLevel();
});

shareXBtn.addEventListener("click", () => {
  const text = `Level ${level}\nScore ${score}\n\n${endRunCpLine.textContent}`;
  const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
  window.open(url, "_blank");
});
/* =========================
   CP LINES (51–100) PART 2
========================= */

Object.assign(CP_LINES, {
  51:"Strength is built quietly.",
  52:"Consistency shapes ability.",
  53:"Your courage shows in effort.",
  54:"Growth is happening.",
  55:"Progress takes persistence.",
  56:"You are getting stronger.",
  57:"Every day counts.",
  58:"Movement is progress.",
  59:"You are learning your body.",
  60:"Your effort is visible.",
  61:"Practice creates possibility.",
  62:"Each try builds control.",
  63:"Your journey matters.",
  64:"Strength grows with time.",
  65:"You are improving.",
  66:"Patience builds confidence.",
  67:"Small gains are real gains.",
  68:"Your work builds tomorrow.",
  69:"Consistency brings results.",
  70:"Progress continues.",
  71:"You are doing enough.",
  72:"Every repetition counts.",
  73:"Your effort builds stability.",
  74:"Growth takes dedication.",
  75:"You are moving forward.",
  76:"Strength is developing.",
  77:"Your persistence matters.",
  78:"Progress lives in practice.",
  79:"You are learning control.",
  80:"Your body is adapting.",
  81:"Every session builds strength.",
  82:"Your courage shows.",
  83:"Growth is steady.",
  84:"You are getting better.",
  85:"Consistency is key.",
  86:"Your work is meaningful.",
  87:"Strength comes with time.",
  88:"Progress is unfolding.",
  89:"You are building ability.",
  90:"Your effort is powerful.",
  91:"Every day brings growth.",
  92:"You are becoming stronger.",
  93:"Practice builds skill.",
  94:"Your patience pays off.",
  95:"You are making progress.",
  96:"Your journey continues.",
  97:"Strength is forming.",
  98:"You are improving daily.",
  99:"Almost there. Keep going.",
  100:"Every step you took mattered."
});

/* =========================
   GRID & MATCH LOGIC
========================= */

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

    img.addEventListener("click", () => onTileClick(i));

    tiles.push(img);
    gridEl.appendChild(img);
  }
}

function onTileClick(index) {
  if (isResolving || !isRunActive) return;

  if (selectedTile === null) {
    selectedTile = index;
    tiles[index].style.opacity = 0.6;
    return;
  }

  if (index === selectedTile) {
    tiles[index].style.opacity = 1;
    selectedTile = null;
    return;
  }

  if (!isAdjacent(index, selectedTile)) {
    tiles[selectedTile].style.opacity = 1;
    selectedTile = index;
    tiles[index].style.opacity = 0.6;
    return;
  }

  swapTiles(index, selectedTile);
  tiles[selectedTile].style.opacity = 1;
  selectedTile = null;
}

function swapTiles(i1, i2) {
  const t1 = tiles[i1];
  const t2 = tiles[i2];

  const temp = t1.dataset.pillar;
  t1.dataset.pillar = t2.dataset.pillar;
  t2.dataset.pillar = temp;

  t1.src = `../assets/pillars/${t1.dataset.pillar}.png`;
  t2.src = `../assets/pillars/${t2.dataset.pillar}.png`;

  const matches = findMatches();

  if (matches.length === 0) {
    setTimeout(() => {
      const temp2 = t1.dataset.pillar;
      t1.dataset.pillar = t2.dataset.pillar;
      t2.dataset.pillar = temp2;

      t1.src = `../assets/pillars/${t1.dataset.pillar}.png`;
      t2.src = `../assets/pillars/${t2.dataset.pillar}.png`;
    }, 150);
    return;
  }

  moves--;
  updateHUD();
  resolveMatches(matches);
}

function findMatches() {
  const matches = new Set();

  // rows
  for (let r = 0; r < GRID_SIZE; r++) {
    let count = 1;
    for (let c = 1; c < GRID_SIZE; c++) {
      const i = r * GRID_SIZE + c;
      const prev = r * GRID_SIZE + c - 1;

      if (tiles[i].dataset.pillar === tiles[prev].dataset.pillar) {
        count++;
        if (count >= 3) {
          matches.add(i);
          matches.add(prev);
          matches.add(i - 2);
        }
      } else {
        count = 1;
      }
    }
  }

  // columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let count = 1;
    for (let r = 1; r < GRID_SIZE; r++) {
      const i = r * GRID_SIZE + c;
      const prev = (r - 1) * GRID_SIZE + c;

      if (tiles[i].dataset.pillar === tiles[prev].dataset.pillar) {
        count++;
        if (count >= 3) {
          matches.add(i);
          matches.add(prev);
          matches.add(i - 2 * GRID_SIZE);
        }
      } else {
        count = 1;
      }
    }
  }

  return Array.from(matches);
}

function resolveMatches(matchIndexes) {
  isResolving = true;

  matchIndexes.forEach(i => {
    tiles[i].dataset.pillar = null;
    tiles[i].style.opacity = 0;
  });

  score += matchIndexes.length * 100;
  updateHUD();

  setTimeout(() => {
    applyGravity();
    refillBoard();
    const next = findMatches();
    if (next.length > 0) {
      resolveMatches(next);
    } else {
      isResolving = false;
      checkLevelProgress();
    }
  }, 200);
}

function applyGravity() {
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = GRID_SIZE - 1; r >= 0; r--) {
      const i = r * GRID_SIZE + c;
      if (!tiles[i].dataset.pillar) {
        for (let k = r - 1; k >= 0; k--) {
          const above = k * GRID_SIZE + c;
          if (tiles[above].dataset.pillar) {
            tiles[i].dataset.pillar = tiles[above].dataset.pillar;
            tiles[i].src = tiles[above].src;
            tiles[above].dataset.pillar = null;
            tiles[above].style.opacity = 0;
            break;
          }
        }
      }
    }
  }
}

function refillBoard() {
  tiles.forEach(t => {
    if (!t.dataset.pillar) {
      const p = randomPillar();
      t.dataset.pillar = p;
      t.src = `../assets/pillars/${p}.png`;
      t.style.opacity = 1;
    }
  });
}

/* =========================
   LEVEL FLOW
========================= */

function checkLevelProgress() {
  if (score - levelStartScore >= LEVEL_CONFIG.scoreTarget(level)) {
    document.getElementById("levelOverlay").classList.remove("hidden");
    document.querySelector(".cp-line").textContent = getRandomCpLine(level);
  }
}

document.getElementById("nextLevelBtn").addEventListener("click", () => {
  document.getElementById("levelOverlay").classList.add("hidden");
  level++;
  levelStartScore = score;
  moves = LEVEL_CONFIG.baseMoves;
  updateHUD();
  createGrid();
});

function startLevel() {
  moves = LEVEL_CONFIG.baseMoves;
  levelStartScore = score;
  createGrid();
  updateHUD();
}
/* =========================
   END RUN OVERLAY + SHARE
========================= */

const endRunOverlay = document.getElementById("endRunOverlay");
const endRunLevel   = document.getElementById("endRunLevel");
const endRunScore   = document.getElementById("endRunScore");
const endRunCpLine  = document.getElementById("endRunCpLine");
const tryAgainBtn   = document.getElementById("tryAgainBtn");
const shareXBtn     = document.getElementById("shareXBtn");

function showEndRunOverlay() {
  endRunLevel.textContent = level;
  endRunScore.textContent = score;
  endRunCpLine.textContent = getRandomCpLine(level);
  endRunOverlay.classList.remove("hidden");
}

document.getElementById("endRunBtn").addEventListener("click", endRun);

tryAgainBtn.addEventListener("click", () => {
  endRunOverlay.classList.add("hidden");
  level = 1;
  score = 0;
  moves = LEVEL_CONFIG.baseMoves;
  levelStartScore = 0;
  updateHUD();
  startLevel();
});

shareXBtn.addEventListener("click", () => {
  const text = `Level ${level}\nScore ${score}\n\n${endRunCpLine.textContent}`;
  const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
  window.open(url, "_blank");
});

/* =========================
   FIREBASE LEADERBOARD
   (Heart Defender Pattern)
========================= */

const {
  pillarPlayers,
  pillarRuns,
  currentSeasonId,
  getPillarDeviceTag,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} = window.pillarDB;

function getPlayerId() {
  return getPillarDeviceTag(); // same device = same identity
}

/* =========================
   SUBMIT RUN
========================= */

async function submitRunToLeaderboard() {
  const playerId = getPlayerId();
  const seasonId = currentSeasonId();
  const timeSpent = Math.floor((Date.now() - runStartTime) / 1000);

  try {
    await addDoc(pillarRuns, {
      playerId,
      seasonId,
      level,
      score,
      time: timeSpent,
      createdAt: serverTimestamp()
    });

    const bestId = `${seasonId}_${playerId}`;
    const bestRef = doc(pillarPlayers, bestId);
    const snap = await getDoc(bestRef);

    const isBetter =
      !snap.exists() ||
      level > snap.data().level ||
      (level === snap.data().level && score > snap.data().score) ||
      (level === snap.data().level && score === snap.data().score && timeSpent < snap.data().time);

    if (isBetter) {
      await setDoc(bestRef, {
        playerId,
        seasonId,
        level,
        score,
        time: timeSpent,
        updatedAt: serverTimestamp()
      });
    }
  } catch (e) {
    console.error("Leaderboard submit failed:", e);
  }
}

/* =========================
   LOAD + RENDER LEADERBOARD
========================= */

async function loadLeaderboard() {
  if (!leaderboardEl) return;

  leaderboardEl.textContent = "Loading leaderboard…";

  try {
    const q = query(
      pillarPlayers,
      where("seasonId", "==", currentSeasonId()),
      orderBy("level", "desc"),
      orderBy("score", "desc"),
      orderBy("time", "asc"),
      limit(10)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      leaderboardEl.textContent = "No runs yet. Be the first Gentle Warrior.";
      return;
    }

    let html = `<div style="font-size:12px;margin-bottom:6px;opacity:.7;">
      Weekly Top Warriors
    </div>`;

    let rank = 1;

    snap.forEach(s => {
      const d = s.data();
      html += `
        <div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.08);">
          <span>#${rank}</span>
          <span>${d.playerId.slice(-4)}</span>
          <span>L${d.level}</span>
          <span>${d.score}</span>
          <span>${d.time}s</span>
        </div>
      `;
      rank++;
    });

    leaderboardEl.innerHTML = html;
  } catch (e) {
    console.error("Leaderboard load error:", e);
    leaderboardEl.textContent = "Unable to load leaderboard.";
  }
}

/* =========================
   END RUN + SAVE
========================= */

function endRun() {
  isRunActive = false;
  saveGame();
  showEndRunOverlay();
  submitRunToLeaderboard();
  loadLeaderboard();
}

/* =========================
   INIT
========================= */

startLevel();
loadLeaderboard();

});
