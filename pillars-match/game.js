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
  const TILE_SIZE = 62;

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

  const levelOverlay = document.getElementById("levelOverlay");
  const failOverlay = document.getElementById("failOverlay");
  const nextBtn = document.getElementById("nextLevelBtn");

  /* =========================
     SAVE BUTTON
  ========================== */

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(255,255,255,0.12);
    color: #fff;
    border: none;
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 12px;
    opacity: 0.7;
  `;
  document.body.appendChild(saveBtn);

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
     SAVE / LOAD
  ========================== */

  function saveGame() {
    localStorage.setItem("pm_save", JSON.stringify({
      level,
      score,
      moves,
      levelStartScore,
      board: tiles.map(t => t.dataset.pillar)
    }));

    progressBar?.animate(
      [{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }],
      { duration: 600 }
    );
  }

  function loadGame() {
    const raw = localStorage.getItem("pm_save");
    return raw ? JSON.parse(raw) : null;
  }

  saveBtn.addEventListener("click", saveGame);
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
    levelOverlay.classList.remove("hidden");
  }

  function showFail() {
    isResolving = true;
    failOverlay.classList.remove("hidden");
  }

  /* =========================
     START
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
     GRID
  ========================== */

  function randomPillar() {
    return PILLARS[Math.floor(Math.random() * PILLARS.length)];
  }

  function createGrid(board = null) {
    gridEl.innerHTML = "";
    tiles = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const img = document.createElement("img");
      const p = board ? board[i] : randomPillar();

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
     INPUT
  ========================== */

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
      const matches = findMatchesDetailed();

      if (!matches.length) {
        animateSwap(a, b, () => {
          commitSwap(a, b);
          isResolving = false;
        });
      } else {
        moves--;
        updateHUD();
        resolveBoard(matches);
      }
    });
  }

  function isAdjacent(i1, i2) {
    const r1 = Math.floor(i1 / GRID_SIZE), c1 = i1 % GRID_SIZE;
    const r2 = Math.floor(i2 / GRID_SIZE), c2 = i2 % GRID_SIZE;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  function animateSwap(a, b, done) {
    const i1 = +a.dataset.index, i2 = +b.dataset.index;
    const r1 = Math.floor(i1 / GRID_SIZE), c1 = i1 % GRID_SIZE;
    const r2 = Math.floor(i2 / GRID_SIZE), c2 = i2 % GRID_SIZE;

    const dx = (c2 - c1) * TILE_SIZE;
    const dy = (r2 - r1) * TILE_SIZE;

    a.style.transform = `translate(${dx}px, ${dy}px)`;
    b.style.transform = `translate(${-dx}px, ${-dy}px)`;

    setTimeout(() => {
      a.style.transform = b.style.transform = "";
      done();
    }, 150);
  }

  function commitSwap(a, b) {
    const p1 = a.dataset.pillar;
    a.dataset.pillar = b.dataset.pillar;
    b.dataset.pillar = p1;
    a.src = `../assets/pillars/${a.dataset.pillar}.png`;
    b.src = `../assets/pillars/${b.dataset.pillar}.png`;
  }

  /* =========================
     MATCH + SPARKLE (FIXED)
  ========================== */

  function resolveBoard(groups) {
    const toClear = new Set();
    let maxSize = 0;

    groups.forEach(g => {
      maxSize = Math.max(maxSize, g.length);
      if (!isInitPhase) score += g.length >= 4 ? 200 : 100;
      g.forEach(i => toClear.add(i));
    });

    updateHUD();

    const sparkleTime = maxSize >= 4 ? 450 : 250;
    const sparkleClass = maxSize >= 4 ? ["sparkle", "sparkle-big"] : ["sparkle"];

    toClear.forEach(i => {
      tiles[i].classList.add(...sparkleClass);
    });

    setTimeout(() => {
      toClear.forEach(i => {
        const t = tiles[i];
        t.classList.remove("sparkle", "sparkle-big");
        t.dataset.pillar = "empty";
        t.style.opacity = "0";
      });

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
    }, sparkleTime);
  }

  function applyGravityAnimated(done) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const stack = [];
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r * GRID_SIZE + c];
        if (t.dataset.pillar !== "empty") stack.push(t.dataset.pillar);
      }

      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r * GRID_SIZE + c];
        const p = stack.shift() || randomPillar();
        t.dataset.pillar = p;
        t.src = `../assets/pillars/${p}.png`;
        t.style.opacity = "1";
      }
    }
    setTimeout(done, 200);
  }

  function findMatchesDetailed() {
    const groups = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      let run = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        const cur = c < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + c - 1].dataset.pillar;
        if (cur === prev) run++;
        else {
          if (run >= 3) {
            const g = [];
            for (let k = 0; k < run; k++) g.push(r * GRID_SIZE + c - 1 - k);
            groups.push(g);
          }
          run = 1;
        }
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let run = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        const cur = r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;
        if (cur === prev) run++;
        else {
          if (run >= 3) {
            const g = [];
            for (let k = 0; k < run; k++) g.push((r - 1 - k) * GRID_SIZE + c);
            groups.push(g);
          }
          run = 1;
        }
      }
    }
    return groups;
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
