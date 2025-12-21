document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CONFIG
  ========================== */

  const PILLARS = [
    "aurelion",
    "gaialune",
    "ignara",
    "solyndra",
    "umbrath",
    "zeratheon"
  ];

  const GRID_SIZE = 7;
  const TILE_SIZE = 56 + 6;

  const LEVEL_CONFIG = {
    baseMoves: 20,
    scoreTarget: level => 1500 + (level - 1) * 500
  };

  /* =========================
     DOM
  ========================== */

  const gridEl = document.querySelector(".grid");
  const scoreEl = document.getElementById("score");
  const levelEl = document.getElementById("level");
  const movesEl = document.getElementById("moves");
  const progressBar = document.getElementById("progressBar");
  const footerEl = document.querySelector("footer");

  const levelOverlay = document.getElementById("levelOverlay");
  const failOverlay = document.getElementById("failOverlay");
  const nextBtn = document.getElementById("nextLevelBtn");

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
     💾 SAVE / LOAD (STABLE)
  ========================== */

  function saveGame() {
    const state = {
      level,
      score,
      moves,
      levelStartScore,
      board: tiles.map(t => t.dataset.pillar)
    };
    localStorage.setItem("pm_save", JSON.stringify(state));

    progressBar?.animate(
      [{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }],
      { duration: 600, easing: "ease-out" }
    );
  }

  function loadGame() {
    const raw = localStorage.getItem("pm_save");
    return raw ? JSON.parse(raw) : null;
  }

  window.addEventListener("beforeunload", saveGame);

  footerEl?.addEventListener("contextmenu", e => {
    e.preventDefault();
    localStorage.removeItem("pm_save");
    location.reload();
  });

  /* =========================
     UI HELPERS
  ========================== */

  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    movesEl.textContent = moves;

    const target = LEVEL_CONFIG.scoreTarget(level);
    const gained = score - levelStartScore;
    const pct = Math.min(100, (gained / target) * 100);
    progressBar.style.width = pct + "%";
  }

  function showLevelComplete() {
    isResolving = true;
    levelOverlay.classList.remove("hidden");
  }

  function showFail() {
    isResolving = true;
    failOverlay.classList.remove("hidden");
  }

  function startLevel() {
    const saved = loadGame();

    if (saved) {
      level = saved.level;
      score = saved.score;
      moves = saved.moves;
      levelStartScore = saved.levelStartScore;
      isInitPhase = false;
      isResolving = false;
      createGrid(saved.board);
    } else {
      moves = LEVEL_CONFIG.baseMoves;
      levelStartScore = score;
      isInitPhase = true;
      isResolving = true;
      createGrid();
      setTimeout(resolveInitMatches, 0);
    }

    updateHUD();
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
     HELPERS
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

  /* =========================
     GRID
  ========================== */

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

  /* =========================
     INPUT / SWAP / MATCH
  ========================== */

  // (unchanged input, swap, match detection code)

  /* =========================
     RESOLUTION (FIXED SAVE POINT)
  ========================== */

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
      group.forEach(i => toClear.add(i));
    });

    updateHUD();
    clearTiles([...toClear]);

    setTimeout(() => {
      applyGravityAnimated(() => {
        const next = findMatchesDetailed();
        if (next.length) {
          resolveBoard(next);
        } else {
          isResolving = false;
          isInitPhase = false;

          saveGame(); // ✅ SAVE ONLY WHEN STABLE

          const gained = score - levelStartScore;
          if (gained >= LEVEL_CONFIG.scoreTarget(level)) showLevelComplete();
          else if (moves <= 0) showFail();
        }
      });
    }, 180);
  }

  /* =========================
     INIT
  ========================== */

  startLevel();

});
