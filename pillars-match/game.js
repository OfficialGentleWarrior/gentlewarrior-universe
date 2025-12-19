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
  }

  /* ---------- interaction ---------- */
  function onTileClick(tile) {
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
        // invalid move → revert
        setTimeout(() => swapTiles(selectedTile, tile), 150);
      } else {
        highlightMatches(matches);
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

        if (curr === prev) {
          count++;
        } else {
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
        const curr =
          r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;

        if (curr === prev) {
          count++;
        } else {
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

  /* ---------- VISUAL DEBUG ---------- */
  function highlightMatches(indices) {
    indices.forEach(i => {
      tiles[i].style.outline = "4px solid gold";
      tiles[i].style.boxShadow = "0 0 20px gold";
    });

    setTimeout(() => {
      indices.forEach(i => {
        tiles[i].style.outline = "";
        tiles[i].style.boxShadow = "";
      });
    }, 400);
  }

  /* ---------- init ---------- */
  createGrid();

});
