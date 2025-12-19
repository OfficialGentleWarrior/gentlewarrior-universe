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

  /* ---------- PRELOAD (FAST, NON-BLOCKING) ---------- */
  PILLARS.forEach(p => {
    const img = new Image();
    img.src = `../assets/pillars/${p}.png`;
  });

  /* ---------- HELPERS ---------- */
  function randomPillar() {
    return PILLARS[Math.floor(Math.random() * PILLARS.length)];
  }

  function isAdjacent(i1, i2) {
    const r1 = Math.floor(i1 / GRID_SIZE);
    const c1 = i1 % GRID_SIZE;
    const r2 = Math.floor(i2 / GRID_SIZE);
    const c2 = i2 % GRID_SIZE;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
  }

  /* ---------- GRID ---------- */
  function createGrid() {
    gridEl.innerHTML = "";
    tiles = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const img = document.createElement("img");
      const pillar = randomPillar();

      img.className = "tile";
      img.dataset.index = i;
      img.dataset.pillar = pillar;
      img.src = `../assets/pillars/${pillar}.png`;

      img.draggable = false;
      img.oncontextmenu = e => e.preventDefault();
      img.addEventListener("pointerdown", onTilePointer, { passive: false });

      tiles.push(img);
      gridEl.appendChild(img);
    }
  }

  /* ---------- INPUT ---------- */
  function onTilePointer(e) {
    e.preventDefault();
    if (isResolving) return;

    const tile = e.currentTarget;

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

    isResolving = true;

    animateSwap(selectedTile, tile, () => {
      commitSwap(selectedTile, tile);

      const matches = findMatches();
      if (matches.length === 0) {
        // ❌ invalid → swap back
        setTimeout(() => {
          animateSwap(tile, selectedTile, () => {
            commitSwap(tile, selectedTile);
            isResolving = false;
          });
        }, 120);
      } else {
        resolveBoard();
      }
    });

    selectedTile.classList.remove("selected");
    selectedTile = null;
  }

  /* ---------- SWAP ---------- */
  function animateSwap(a, b, done) {
    a.classList.add("swapping");
    b.classList.add("swapping");
    setTimeout(() => {
      a.classList.remove("swapping");
      b.classList.remove("swapping");
      done();
    }, 120);
  }

  function commitSwap(a, b) {
    const p1 = a.dataset.pillar;
    const p2 = b.dataset.pillar;

    a.dataset.pillar = p2;
    b.dataset.pillar = p1;
    a.src = `../assets/pillars/${p2}.png`;
    b.src = `../assets/pillars/${p1}.png`;
  }

  /* ---------- MATCH DETECTION ---------- */
  function findMatches() {
    const m = new Set();

    for (let r = 0; r < GRID_SIZE; r++) {
      let c = 1;
      for (let x = 1; x <= GRID_SIZE; x++) {
        const cur = x < GRID_SIZE ? tiles[r * GRID_SIZE + x].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + x - 1].dataset.pillar;
        if (cur === prev) c++;
        else {
          if (c >= 3) for (let k = 0; k < c; k++) m.add(r * GRID_SIZE + x - 1 - k);
          c = 1;
        }
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let r = 1;
      for (let y = 1; y <= GRID_SIZE; y++) {
        const cur = y < GRID_SIZE ? tiles[y * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(y - 1) * GRID_SIZE + c].dataset.pillar;
        if (cur === prev) r++;
        else {
          if (r >= 3) for (let k = 0; k < r; k++) m.add((y - 1 - k) * GRID_SIZE + c);
          r = 1;
        }
      }
    }
    return [...m];
  }

  /* ---------- CLEAR + GRAVITY ---------- */
  function clearMatches(list) {
    list.forEach(i => {
      tiles[i].dataset.pillar = "empty";
      tiles[i].style.opacity = "0";
    });
  }

  function applyGravity() {
    for (let c = 0; c < GRID_SIZE; c++) {
      let s = [];
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r * GRID_SIZE + c];
        if (t.dataset.pillar !== "empty") s.push(t.dataset.pillar);
      }
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r * GRID_SIZE + c];
        const p = s.shift() || randomPillar();
        t.dataset.pillar = p;
        t.src = `../assets/pillars/${p}.png`;
        t.style.opacity = "1";
      }
    }
  }

  function resolveBoard() {
    const m = findMatches();
    if (m.length === 0) {
      isResolving = false;
      return;
    }
    clearMatches(m);
    setTimeout(() => {
      applyGravity();
      setTimeout(resolveBoard, 120);
    }, 120);
  }

  /* ---------- INIT ---------- */
  createGrid();
});
