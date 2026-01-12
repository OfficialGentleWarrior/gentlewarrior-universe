document.addEventListener("DOMContentLoaded", () => {

/* =========================
   FIREBASE / LEADERBOARD
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
  return getPillarDeviceTag();
}

let runStartTime = Date.now();

async function submitRunToLeaderboard() {
  const playerId = getPlayerId();
  const seasonId = currentSeasonId();
  const timeSpent = Math.floor((Date.now() - runStartTime) / 1000);

  const runData = {
    playerId,
    seasonId,
    level,
    score,
    time: timeSpent,
    createdAt: serverTimestamp()
  };

  await addDoc(pillarRuns, runData);

  const playerDocId = `${seasonId}_${playerId}`;
  const playerRef = doc(pillarPlayers, playerDocId);
  const snap = await getDoc(playerRef);

  const better =
    !snap.exists() ||
    level > snap.data().level ||
    (level === snap.data().level && score > snap.data().score) ||
    (level === snap.data().level && score === snap.data().score && timeSpent < snap.data().time);

  if (better) {
    await setDoc(playerRef, {
      playerId,
      seasonId,
      level,
      score,
      time: timeSpent,
      updatedAt: serverTimestamp()
    });
  }
}

async function loadLeaderboard() {
  const seasonId = currentSeasonId();

  const q = query(
    pillarPlayers,
    where("seasonId", "==", seasonId),
    orderBy("level", "desc"),
    orderBy("score", "desc"),
    orderBy("time", "asc"),
    limit(10)
  );

  const snap = await getDocs(q);
  const listEl = document.getElementById("leaderboardList");
  if (!listEl) return;

  let html = "";
  let rank = 1;

  snap.forEach(doc => {
    const d = doc.data();
    html += `
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;">
        <span>#${rank}</span>
        <span>${d.playerId.slice(-4)}</span>
        <span>L${d.level}</span>
        <span>${d.score}</span>
        <span>${d.time}s</span>
      </div>
    `;
    rank++;
  });

  listEl.innerHTML = html || "<div>No runs yet.</div>";
}

/* =========================
   CONFIG (UNCHANGED)
========================= */

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
   CP AWARENESS LINES
========================= */

const CP_LINES = {
  1:"Every small movement matters.", 2:"Progress looks different for every child.",
  3:"Consistency builds strength.", 4:"Effort is invisible but real.",
  5:"Some days are slower — that’s okay.", 6:"Patience is a form of courage.",
  7:"Support makes growth possible.", 8:"Rest is part of progress.",
  9:"Muscle memory takes time.", 10:"Milestone reached — keep going.",
  50:"Milestone reached — steady growth.", 100:"Milestone reached — gentle strength."
};

function getRandomCpLine(level) {
  const keys = Object.keys(CP_LINES);
  return CP_LINES[keys[Math.floor(Math.random() * keys.length)]];
}

/* =========================
   DOM
========================= */

const gridEl = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const movesEl = document.getElementById("moves");
const progressBar = document.getElementById("progressBar");

const levelOverlay = document.getElementById("levelOverlay");
const nextBtn = document.getElementById("nextLevelBtn");

const endRunOverlay = document.getElementById("endRunOverlay");
const endRunLevel = document.getElementById("endRunLevel");
const endRunScore = document.getElementById("endRunScore");
const endRunCpLine = document.getElementById("endRunCpLine");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const shareXBtn = document.getElementById("shareXBtn");

const endRunBtn = document.getElementById("endRunBtn");
const saveRunBtn = document.getElementById("saveRunBtn");
const resetRunBtn = document.getElementById("resetRunBtn");

/* =========================
   STATE
========================= */

let tiles = [];
let isResolving = true;
let isInitPhase = true;
let score = 0;
let level = 1;
let moves = LEVEL_CONFIG.baseMoves;
let levelStartScore = 0;
let isRunActive = true;

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

function showLevelComplete() {
  levelOverlay.querySelector(".cp-line").textContent = getRandomCpLine(level);
  levelOverlay.classList.remove("hidden");
}

function showEndRunOverlay() {
  endRunLevel.textContent = level;
  endRunScore.textContent = score;
  endRunCpLine.textContent = getRandomCpLine(level);

  endRunOverlay.classList.remove("hidden");
  endRunOverlay.style.display = "flex";
}

/* =========================
   SAVE / LOAD
========================= */

function saveGame() {
  if (!isRunActive) return;
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

/* =========================
   BUTTONS
========================= */

saveRunBtn?.addEventListener("click", saveGame);

resetRunBtn?.addEventListener("click", () => {
  localStorage.removeItem("pm_save");
  level = 1;
  score = 0;
  moves = LEVEL_CONFIG.baseMoves;
  levelStartScore = 0;
  runStartTime = Date.now();
  isRunActive = true;
  createGrid();
  updateHUD();
  setTimeout(resolveInitMatches, 0);
});

endRunBtn?.addEventListener("click", async () => {
  if (!isRunActive) return;

  isRunActive = false;
  saveGame();
  showEndRunOverlay();

  try {
    await submitRunToLeaderboard();
    await loadLeaderboard();
  } catch (e) {
    console.log("Leaderboard error", e);
  }
});

tryAgainBtn?.addEventListener("click", () => {
  endRunOverlay.classList.add("hidden");
  localStorage.removeItem("pm_save");

  level = 1;
  score = 0;
  moves = LEVEL_CONFIG.baseMoves;
  levelStartScore = 0;
  runStartTime = Date.now();
  isRunActive = true;

  createGrid();
  updateHUD();
  setTimeout(resolveInitMatches, 0);
});
/* =========================
   GRID & GAMEPLAY
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

/* =========================
   SWIPE
========================= */

let touchStartX = 0;
let touchStartY = 0;
let touchStartTile = null;

function onTouchStart(e) {
  if (!isRunActive || isResolving || moves <= 0) return;
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
  touchStartTile = e.currentTarget;
}

function onTouchEnd(e) {
  if (!touchStartTile) return;

  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    touchStartTile = null;
    return;
  }

  let dirRow = 0, dirCol = 0;
  if (Math.abs(dx) > Math.abs(dy)) dirCol = dx > 0 ? 1 : -1;
  else dirRow = dy > 0 ? 1 : -1;

  const i1 = +touchStartTile.dataset.index;
  const { row, col } = indexToRowCol(i1);

  const newRow = row + dirRow;
  const newCol = col + dirCol;

  if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
    touchStartTile = null;
    return;
  }

  const i2 = newRow * GRID_SIZE + newCol;
  onTileSwap(touchStartTile, tiles[i2]);
  touchStartTile = null;
}

/* =========================
   GRID CREATION
========================= */

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

    img.addEventListener("touchstart", onTouchStart, { passive: true });
    img.addEventListener("touchend", onTouchEnd, { passive: true });

    tiles.push(img);
    gridEl.appendChild(img);
  }
}

/* =========================
   SWAP & MATCH
========================= */

function onTileSwap(a, b) {
  if (!isRunActive || isResolving || moves <= 0) return;
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

/* =========================
   MATCH FIND
========================= */

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

/* =========================
   RESOLVE & GAME OVER
========================= */

async function resolveBoard(groups) {
  const toClear = new Set();

  groups.forEach(group => {
    const size = group.length;
    if (!isInitPhase) {
      score += size === 3 ? 100 :
               size === 4 ? 200 :
               size === 5 ? 400 :
               600 + (size - 6) * 100;
    }
    group.forEach(i => toClear.add(i));
  });

  updateHUD();

  toClear.forEach(i => {
    const t = tiles[i];
    t.dataset.pillar = "empty";
    t.style.opacity = "0";
  });

  setTimeout(() => {
    applyGravityAnimated(async () => {
      const next = findMatchesDetailed();
      if (next.length) {
        resolveBoard(next);
      } else {
        isResolving = false;
        isInitPhase = false;

        const gained = score - levelStartScore;

        if (gained >= LEVEL_CONFIG.scoreTarget(level)) {
          saveGame();
          showLevelComplete();
        }
        else if (moves <= 0) {
          isRunActive = false;
          saveGame();
          showEndRunOverlay();

          try {
            await submitRunToLeaderboard();
            await loadLeaderboard();
          } catch (e) {
            console.log("Leaderboard error", e);
          }
          return;
        }
        else {
          saveGame();
        }
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
    }
  }
  setTimeout(done, 220);
}

/* =========================
   INIT
========================= */

function resolveInitMatches() {
  const init = findMatchesDetailed();
  if (init.length) resolveBoard(init);
  else {
    isResolving = false;
    isInitPhase = false;
    saveGame();
  }
}

const saved = loadGame();
if (saved) {
  level = saved.level;
  score = saved.score;
  moves = saved.moves;
  levelStartScore = saved.levelStartScore;
  createGrid(saved.board);
} else {
  createGrid();
}

updateHUD();
setTimeout(resolveInitMatches, 0);
loadLeaderboard();

}); // DOMContentLoaded END
