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
  let isBusy = false;

  /* ---------- FAST IMAGE PRELOAD (NON-BLOCKING) ---------- */
  PILLARS.forEach(p => {
    const img = new Image();
    img.src = `../assets/pillars/${p}.png`;
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
      img.draggable = false;

      img.addEventListener("click", () => onTileClick(img));

      tiles.push(img);
      gridEl.appendChild(img);
    }
  }

  /* ---------- interaction ---------- */
  function onTileClick(tile) {
    if (isBusy) return;

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

    isBusy = true;

    animateSwap(selectedTile, tile, () => {
      swapTiles(selectedTile, tile);

      const matches = findMatches();
      if (matches.length === 0) {
        // invalid move → swap back
        setTimeout(() => {
          animateSwap(tile, selectedTile, () => {
            swapTiles(tile, selectedTile);
            isBusy = false;
          });
        }, 120);
      } else {
        resolveBoard();
      }
    });

    selectedTile.classList.remove("selected");
    selectedTile = null;
  }

  /* ---------- swap animation ---------- */
  function animateSwap(a, b, done) {
    a.classList.add("swapping");
    b.classList.add("swapping");
    setTimeout(() => {
      a.classList.remove("swapping");
      b.classList.remove("swapping");
      done();
    }, 150);
  }

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

        if (curr === prev) {
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
        const curr = r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;

        if (curr === prev) {
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

  /* ---------- CLEAR + GRAVITY ---------- */
  function clearMatches(indices) {
    indices.forEach(i => {
      tiles[i].dataset.pillar = "empty";
      tiles[i].style.opacity = "0";
    });
  }

  function applyGravity() {
    for (let c = 0; c < GRID_SIZE; c++) {
      const stack = [];

      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const tile = tiles[r * GRID_SIZE + c];
        if (tile.dataset.pillar !== "empty") {
          stack.push(tile.dataset.pillar);
        }
      }

      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const tile = tiles[r * GRID_SIZE + c];
        const pillar = stack.shift() || randomPillar();

        tile.dataset.pillar = pillar;
        tile.src = `../assets/pillars/${pillar}.png`;
        tile.style.opacity = "1";
      }
    }
  }

  function resolveBoard() {
    const matches = findMatches();
    if (matches.length === 0) {
      isBusy = false;
      return;
    }

    clearMatches(matches);
    setTimeout(() => {
      applyGravity();
      setTimeout(resolveBoard, 150);
    }, 150);
  }

  /* ---------- init ---------- */
  createGrid();

});
