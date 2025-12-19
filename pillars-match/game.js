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

  /* ---------- grid creation ---------- */
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

      img.addEventListener("click", () => onTileClick(img));

      tiles.push(img);
      gridEl.appendChild(img);
    }

    // remove accidental starting matches
    resolveBoard();
  }

  /* ---------- interaction ---------- */
  function onTileClick(tile) {
    if (isResolving) return;

    if (!selectedTile) {
      selectTile(tile);
      return;
    }

    if (tile === selectedTile) {
      deselectTile();
      return;
    }

    const i1 = Number(selectedTile.dataset.index);
    const i2 = Number(tile.dataset.index);

    if (isAdjacent(i1, i2)) {
      swapTiles(selectedTile, tile);

      const matches = findMatches();
      if (matches.length === 0) {
        setTimeout(() => swapTiles(selectedTile, tile), 150);
      } else {
        resolveBoard();
      }
    }

    deselectTile();
  }

  function selectTile(tile) {
    selectedTile = tile;
    tile.classList.add("selected");
  }

  function deselectTile() {
    if (selectedTile) {
      selectedTile.classList.remove("selected");
    }
    selectedTile = null;
  }

  /* ---------- swap ---------- */
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
        const curr =
          c < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + c - 1].dataset.pillar;

        if (curr && curr === prev) {
          count++;
        } else {
          if (count >= 3 && prev !== "empty") {
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
        const curr =
          r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;

        if (curr && curr === prev) {
          count++;
        } else {
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

  /* ---------- CLEAR (NO BROKEN IMAGES) ---------- */
  function clearMatches(indices) {
    indices.forEach(i => {
      const tile = tiles[i];
      tile.dataset.pillar = "empty";
      tile.style.opacity = "0";
    });
  }

  /* ---------- GRAVITY + REFILL ---------- */
  function applyGravity() {
    for (let c = 0; c < GRID_SIZE; c++) {
      let stack = [];

      // collect non-empty tiles
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const tile = tiles[r * GRID_SIZE + c];
        if (tile.dataset.pillar !== "empty") {
          stack.push(tile.dataset.pillar);
        }
      }

      // refill column
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const tile = tiles[r * GRID_SIZE + c];
        const pillar = stack.shift() || randomPillar();

        tile.dataset.pillar = pillar;
        tile.src = `../assets/pillars/${pillar}.png`;
        tile.style.opacity = "1";
      }
    }
  }

  /* ---------- RESOLVE LOOP (CASCADE) ---------- */
  function resolveBoard() {
    isResolving = true;

    setTimeout(() => {
      const matches = findMatches();
      if (matches.length === 0) {
        isResolving = false;
        return;
      }

      clearMatches(matches);

      setTimeout(() => {
        applyGravity();
        resolveBoard();
      }, 200);

    }, 100);
  }

  /* ---------- init ---------- */
  createGrid();

});
