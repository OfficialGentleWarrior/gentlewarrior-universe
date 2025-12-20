document.addEventListener("DOMContentLoaded", () => {

  const PILLARS = [
    "aurelion",
    "gaialune",
    "ignara",
    "solyndra",
    "umbrath",
    "zeratheon"
  ];

  const GRID_SIZE = 7;
  const gridEl = document.querySelector(".grid");

  let tiles = [];
  let selectedTile = null;
  let isResolving = true;        // 🔒 lock during init
  let isInitPhase = true;        // 🔑 silent cleanup flag

  /* ---------- FAST IMAGE PRELOAD ---------- */
  PILLARS.forEach(name => {
    const img = new Image();
    img.src = `../assets/pillars/${name}.png`;
  });

  /* ---------- helpers ---------- */
  function randomPillar() {
    return PILLARS[Math.floor(Math.random() * PILLARS.length)];
  }

  function indexToRowCol(index) {
    return {
      row: Math.floor(index / GRID_SIZE),
      col: index % GRID_SIZE
    };
  }

  function isAdjacent(i1, i2) {
    const a = indexToRowCol(i1);
    const b = indexToRowCol(i2);
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
  }

  /* ---------- GRID CREATION ---------- */
  function createGrid() {
    gridEl.innerHTML = "";
    tiles = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const pillar = randomPillar();
      const img = document.createElement("img");

      img.className = "tile";
      img.dataset.index = i;
      img.dataset.pillar = pillar;
      img.src = `../assets/pillars/${pillar}.png`;
      img.draggable = false;

      img.addEventListener("click", () => onTileClick(img));

      tiles.push(img);
      gridEl.appendChild(img);
    }
  }

  /* ---------- INPUT ---------- */
  function onTileClick(tile) {
    if (isResolving) return;

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

    const i1 = Number(selectedTile.dataset.index);
    const i2 = Number(tile.dataset.index);

    if (!isAdjacent(i1, i2)) {
      selectedTile.classList.remove("selected");
      selectedTile = null;
      return;
    }

    swapTiles(selectedTile, tile);

    const matches = findMatches();
    if (matches.length === 0) {
      setTimeout(() => swapTiles(selectedTile, tile), 150);
    } else {
      isResolving = true;
      resolveBoard(matches);
    }

    selectedTile.classList.remove("selected");
    selectedTile = null;
  }

  /* ---------- SWAP ---------- */
  function swapTiles(t1, t2) {
    const p1 = t1.dataset.pillar;
    const p2 = t2.dataset.pillar;

    t1.dataset.pillar = p2;
    t2.dataset.pillar = p1;

    t1.src = `../assets/pillars/${p2}.png`;
    t2.src = `../assets/pillars/${p1}.png`;
  }

  /* ---------- MATCH DETECTION ---------- */
  function findMatches() {
    const matches = new Set();

    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      let count = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        const curr = c < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + c - 1].dataset.pillar;

        if (curr === prev) count++;
        else {
          if (count >= 3) {
            for (let k = 0; k < count; k++) {
              matches.add(r * GRID_SIZE + (c - 1 - k));
            }
          }
          count = 1;
        }
      }
    }

    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      let count = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        const curr = r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;

        if (curr === prev) count++;
        else {
          if (count >= 3) {
            for (let k = 0; k < count; k++) {
              matches.add((r - 1 - k) * GRID_SIZE + c);
            }
          }
          count = 1;
        }
      }
    }

    return [...matches];
  }

  /* ---------- RESOLUTION (INIT + GAMEPLAY) ---------- */
  function resolveBoard(matches) {
    clearMatches(matches);

    setTimeout(() => {
      applyGravity();

      setTimeout(() => {
        const next = findMatches();
        if (next.length) {
          resolveBoard(next);          // cascade
        } else {
          isResolving = false;
          if (isInitPhase) isInitPhase = false; // 🔓 unlock gameplay
        }
      }, 120);

    }, 120);
  }

  /* ---------- CLEAR ---------- */
  function clearMatches(indices) {
    indices.forEach(i => {
      const t = tiles[i];
      t.dataset.pillar = "empty";
      t.style.opacity = "0";
      t.style.pointerEvents = "none";
    });
  }

  /* ---------- GRAVITY ---------- */
  function applyGravity() {
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
  }

  /* ---------- INIT ---------- */
  createGrid();

  // 🔒 silent cleanup before player sees anything
  setTimeout(() => {
    const initMatches = findMatches();
    if (initMatches.length) resolveBoard(initMatches);
    else {
      isResolving = false;
      isInitPhase = false;
    }
  }, 0);

});
