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
  let isResolving = false;

  /* ---------- PRELOAD (NON-BLOCKING) ---------- */
  function preloadImages() {
    PILLARS.forEach(name => {
      const img = new Image();
      img.src = `../assets/pillars/${name}.png`;
    });
  }

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

  /* ---------- GRID ---------- */
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

      // 🔒 IMPORTANT MOBILE FIXES
      img.draggable = false;
      img.style.touchAction = "manipulation";
      img.decoding = "async";

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

    if (!wouldMatch(selectedTile, tile)) {
      selectedTile.classList.remove("selected");
      selectedTile = null;
      return;
    }

    isResolving = true;

    animateSwap(selectedTile, tile, () => {
      commitSwap(selectedTile, tile);
      resolveBoard();
    });

    selectedTile.classList.remove("selected");
    selectedTile = null;
  }

  /* ---------- MATCH CHECK ---------- */
  function wouldMatch(t1, t2) {
    const p1 = t1.dataset.pillar;
    const p2 = t2.dataset.pillar;

    t1.dataset.pillar = p2;
    t2.dataset.pillar = p1;

    const valid = findMatches().length > 0;

    t1.dataset.pillar = p1;
    t2.dataset.pillar = p2;

    return valid;
  }

  /* ---------- SWAP ---------- */
  function animateSwap(t1, t2, done) {
    t1.classList.add("swapping");
    t2.classList.add("swapping");

    setTimeout(() => {
      t1.classList.remove("swapping");
      t2.classList.remove("swapping");
      done();
    }, 150);
  }

  function commitSwap(t1, t2) {
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

    for (let r = 0; r < GRID_SIZE; r++) {
      let count = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        const curr = c < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + c - 1].dataset.pillar;

        if (curr && curr === prev) count++;
        else {
          if (count >= 3 && prev !== "empty") {
            for (let k = 0; k < count; k++) {
              matches.add(r * GRID_SIZE + (c - 1 - k));
            }
          }
          count = 1;
        }
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let count = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        const curr = r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;

        if (curr && curr === prev) count++;
        else {
          if (count >= 3 && prev !== "empty") {
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

  /* ---------- CLEAR + GRAVITY ---------- */
  function clearMatches(indices) {
    indices.forEach(i => {
      tiles[i].dataset.pillar = "empty";
      tiles[i].style.opacity = "0";
    });
  }

  function applyGravity() {
    for (let c = 0; c < GRID_SIZE; c++) {
      let stack = [];

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
  }

  function resolveBoard() {
    const matches = findMatches();
    if (matches.length === 0) {
      isResolving = false;
      return;
    }

    clearMatches(matches);
    setTimeout(() => {
      applyGravity();
      setTimeout(resolveBoard, 150);
    }, 150);
  }

  /* ---------- INIT ---------- */
  preloadImages();
  createGrid();

  // 🔓 IMPORTANT: stabilize board once, then unlock
  isResolving = true;
  setTimeout(resolveBoard, 50);

});
