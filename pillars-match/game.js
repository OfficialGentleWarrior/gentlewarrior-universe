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
     UI
  ========================== */

  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    movesEl.textContent = moves;

    const target = LEVEL_CONFIG.scoreTarget(level);
    const gained = score - levelStartScore;
    progressBar.style.width = Math.min(100, (gained / target) * 100) + "%";
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
    moves = LEVEL_CONFIG.baseMoves;
    levelStartScore = score;
    isInitPhase = true;

    createGrid();
    updateHUD();

    setTimeout(() => {
      const init = findMatchesDetailed();
      if (init.length) resolveBoard(init);
      else {
        isResolving = false;
        isInitPhase = false;
        ensurePlayableBoard();
      }
    }, 0);
  }

  nextBtn?.addEventListener("click", () => {
    levelOverlay.classList.add("hidden");
    level++;
    startLevel();
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

  function createGrid() {
    gridEl.innerHTML = "";
    tiles = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const img = document.createElement("img");
      const p = randomPillar();

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

    if (tile === selectedTile) {
      tile.classList.remove("selected");
      selectedTile = null;
      return;
    }

    const a = selectedTile;
    const b = tile;

    if (!isAdjacent(+a.dataset.index, +b.dataset.index)) {
      a.classList.remove("selected");
      selectedTile = null;
      return;
    }

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

    a.classList.remove("selected");
    selectedTile = null;
  }

  /* =========================
     SWAP
  ========================== */

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
     MATCH DETECTION
  ========================== */

  function findMatchesDetailed() {
    const groups = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      let count = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        const cur = c < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + c - 1].dataset.pillar;
        if (cur === prev) count++;
        else {
          if (count >= 3) {
            const g = [];
            for (let k = 0; k < count; k++) g.push(r * GRID_SIZE + c - 1 - k);
            groups.push(g);
          }
          count = 1;
        }
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let count = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        const cur = r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;
        if (cur === prev) count++;
        else {
          if (count >= 3) {
            const g = [];
            for (let k = 0; k < count; k++) g.push((r - 1 - k) * GRID_SIZE + c);
            groups.push(g);
          }
          count = 1;
        }
      }
    }

    return groups;
  }

  /* =========================
     NO MOVE DETECTION
  ========================== */

  function hasValidMove() {
    for (let i = 0; i < tiles.length; i++) {
      const { row, col } = indexToRowCol(i);

      const neighbors = [
        [row, col + 1],
        [row + 1, col]
      ];

      for (const [r, c] of neighbors) {
        if (r >= GRID_SIZE || c >= GRID_SIZE) continue;

        const j = r * GRID_SIZE + c;
        swapData(i, j);
        if (findMatchesDetailed().length) {
          swapData(i, j);
          return true;
        }
        swapData(i, j);
      }
    }
    return false;
  }

  function swapData(i, j) {
    const a = tiles[i];
    const b = tiles[j];
    const tmp = a.dataset.pillar;
    a.dataset.pillar = b.dataset.pillar;
    b.dataset.pillar = tmp;
  }

  function ensurePlayableBoard() {
    if (hasValidMove()) return;

    // reshuffle silently
    const pool = tiles.map(t => t.dataset.pillar);
    pool.sort(() => Math.random() - 0.5);

    tiles.forEach((t, i) => {
      t.dataset.pillar = pool[i];
      t.src = `../assets/pillars/${pool[i]}.png`;
    });

    setTimeout(() => {
      const matches = findMatchesDetailed();
      if (matches.length) resolveBoard(matches);
      else ensurePlayableBoard();
    }, 0);
  }

  /* =========================
     RESOLUTION
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
        if (next.length) resolveBoard(next);
        else {
          isResolving = false;
          isInitPhase = false;
          ensurePlayableBoard();

          const gained = score - levelStartScore;
          if (gained >= LEVEL_CONFIG.scoreTarget(level)) showLevelComplete();
          else if (moves <= 0) showFail();
        }
      });
    }, 120);
  }

  function clearTiles(list) {
    list.forEach(i => {
      const t = tiles[i];
      t.dataset.pillar = "empty";
      t.style.opacity = "0";
      t.style.pointerEvents = "none";
    });
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
        t.style.pointerEvents = "auto";
      }
    }
    setTimeout(done, 180);
  }

  /* =========================
     INIT
  ========================== */

  startLevel();

});
