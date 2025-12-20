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

    const gained = score - levelStartScore;
    const target = LEVEL_CONFIG.scoreTarget(level);
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
      const init = findMatches();
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

  const randomPillar = () =>
    PILLARS[Math.floor(Math.random() * PILLARS.length)];

  const indexToRowCol = i => ({
    row: Math.floor(i / GRID_SIZE),
    col: i % GRID_SIZE
  });

  const isAdjacent = (a, b) => {
    const A = indexToRowCol(a);
    const B = indexToRowCol(b);
    return Math.abs(A.row - B.row) + Math.abs(A.col - B.col) === 1;
  };

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
      const matches = findMatches();

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

    a.style.transform = `translate(${dx}px, ${dy}px)`;
    b.style.transform = `translate(${-dx}px, ${-dy}px)`;

    setTimeout(() => {
      a.style.transform = "";
      b.style.transform = "";
      done();
    }, 150);
  }

  function commitSwap(a, b) {
    const t = a.dataset.pillar;
    a.dataset.pillar = b.dataset.pillar;
    b.dataset.pillar = t;
    a.src = `../assets/pillars/${a.dataset.pillar}.png`;
    b.src = `../assets/pillars/${b.dataset.pillar}.png`;
  }

  /* =========================
     MATCHING
  ========================== */

  function findMatches() {
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
            for (let k = 0; k < count; k++)
              g.push(r * GRID_SIZE + c - 1 - k);
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
            for (let k = 0; k < count; k++)
              g.push((r - 1 - k) * GRID_SIZE + c);
            groups.push(g);
          }
          count = 1;
        }
      }
    }

    return groups;
  }

  /* =========================
     RESOLUTION (WITH ANIMATION)
  ========================== */

  function resolveBoard(groups) {
    const toClear = new Set();

    groups.forEach(g => {
      if (!isInitPhase) {
        score += g.length === 3 ? 100 :
                 g.length === 4 ? 200 :
                 g.length === 5 ? 400 :
                 600;
      }
      g.forEach(i => toClear.add(i));
    });

    updateHUD();
    animateClear([...toClear], () => {
      applyGravity(() => {
        const next = findMatches();
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
    });
  }

  function animateClear(list, done) {
    list.forEach(i => {
      const t = tiles[i];
      t.style.transition = "transform 0.15s, opacity 0.15s";
      t.style.transform = "scale(0.5)";
      t.style.opacity = "0";
    });

    setTimeout(() => {
      list.forEach(i => tiles[i].dataset.pillar = "empty");
      done();
    }, 160);
  }

  /* =========================
     GRAVITY (FALL ANIMATION)
  ========================== */

  function applyGravity(done) {
    for (let c = 0; c < GRID_SIZE; c++) {
      let write = GRID_SIZE - 1;

      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r * GRID_SIZE + c];
        if (t.dataset.pillar !== "empty") {
          const target = tiles[write * GRID_SIZE + c];
          target.dataset.pillar = t.dataset.pillar;
          target.src = t.src;
          write--;
        }
      }

      while (write >= 0) {
        const t = tiles[write * GRID_SIZE + c];
        const p = randomPillar();
        t.dataset.pillar = p;
        t.src = `../assets/pillars/${p}.png`;
        t.style.transform = `translateY(-${TILE_SIZE}px)`;
        setTimeout(() => t.style.transform = "", 20);
        write--;
      }
    }

    setTimeout(done, 200);
  }

  /* =========================
     NO MOVE DETECTION
  ========================== */

  function ensurePlayableBoard() {
    if (hasValidMove()) return;

    gridEl.classList.add("reshuffle");
    setTimeout(() => {
      const pool = tiles.map(t => t.dataset.pillar).sort(() => Math.random() - 0.5);
      tiles.forEach((t, i) => {
        t.dataset.pillar = pool[i];
        t.src = `../assets/pillars/${pool[i]}.png`;
      });
      gridEl.classList.remove("reshuffle");

      const m = findMatches();
      if (m.length) resolveBoard(m);
      else ensurePlayableBoard();
    }, 250);
  }

  function hasValidMove() {
    for (let i = 0; i < tiles.length; i++) {
      const { row, col } = indexToRowCol(i);
      const dirs = [[1,0],[0,1]];
      for (const [dr,dc] of dirs) {
        const r = row + dr, c = col + dc;
        if (r >= GRID_SIZE || c >= GRID_SIZE) continue;
        swapData(i, r * GRID_SIZE + c);
        if (findMatches().length) {
          swapData(i, r * GRID_SIZE + c);
          return true;
        }
        swapData(i, r * GRID_SIZE + c);
      }
    }
    return false;
  }

  function swapData(a, b) {
    const t = tiles[a].dataset.pillar;
    tiles[a].dataset.pillar = tiles[b].dataset.pillar;
    tiles[b].dataset.pillar = t;
  }

  /* =========================
     INIT
  ========================== */

  startLevel();

});
