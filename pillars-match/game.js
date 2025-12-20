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
  const TILE_SIZE = 56 + 6; // tile + gap
  const gridEl = document.querySelector(".grid");

  let tiles = [];
  let selectedTile = null;
  let isResolving = true;
  let isInitPhase = true;

  /* ---------- FAST IMAGE PRELOAD ---------- */
  PILLARS.forEach(p => {
    const img = new Image();
    img.src = `../assets/pillars/${p}.png`;
  });

  /* ---------- HELPERS ---------- */
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

  /* ---------- GRID ---------- */
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

    const a = selectedTile;
    const b = tile;
    const i1 = Number(a.dataset.index);
    const i2 = Number(b.dataset.index);

    if (!isAdjacent(i1, i2)) {
      a.classList.remove("selected");
      selectedTile = null;
      return;
    }

    isResolving = true;

    // 👉 VISUAL SWAP FIRST
    animateSwap(a, b, () => {

      // 👉 COMMIT AFTER ANIMATION
      commitSwap(a, b);

      const matches = findMatches();

      if (matches.length === 0) {
        // ❌ INVALID MOVE → SWAP BACK
        animateSwap(a, b, () => {
          commitSwap(a, b);
          isResolving = false;
        });
      } else {
        // ✅ VALID MOVE → RESOLVE
        resolveBoard(matches);
      }
    });

    a.classList.remove("selected");
    selectedTile = null;
  }

  /* ---------- SWAP SLIDE ---------- */
  function animateSwap(a, b, done) {
    const i1 = Number(a.dataset.index);
    const i2 = Number(b.dataset.index);
    const p1 = indexToRowCol(i1);
    const p2 = indexToRowCol(i2);

    const dx = (p2.col - p1.col) * TILE_SIZE;
    const dy = (p2.row - p1.row) * TILE_SIZE;

    a.style.transition = "transform 0.15s ease";
    b.style.transition = "transform 0.15s ease";

    a.style.transform = `translate(${dx}px, ${dy}px)`;
    b.style.transform = `translate(${-dx}px, ${-dy}px)`;

    setTimeout(() => {
      a.style.transition = "";
      b.style.transition = "";
      a.style.transform = "";
      b.style.transform = "";
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

  /* ---------- MATCH DETECTION ---------- */
  function findMatches() {
    const m = new Set();

    // horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      let count = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        const cur = c < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + c - 1].dataset.pillar;
        if (cur === prev) count++;
        else {
          if (count >= 3)
            for (let k = 0; k < count; k++)
              m.add(r * GRID_SIZE + c - 1 - k);
          count = 1;
        }
      }
    }

    // vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      let count = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        const cur = r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;
        if (cur === prev) count++;
        else {
          if (count >= 3)
            for (let k = 0; k < count; k++)
              m.add((r - 1 - k) * GRID_SIZE + c);
          count = 1;
        }
      }
    }

    return [...m];
  }

  /* ---------- RESOLUTION ---------- */
  function resolveBoard(matches) {
    clearMatches(matches);

    setTimeout(() => {
      applyGravity();
      setTimeout(() => {
        const next = findMatches();
        if (next.length) resolveBoard(next);
        else {
          isResolving = false;
          if (isInitPhase) isInitPhase = false;
        }
      }, 120);
    }, 120);
  }

  function clearMatches(list) {
    list.forEach(i => {
      const t = tiles[i];
      t.dataset.pillar = "empty";
      t.style.opacity = "0";
      t.style.pointerEvents = "none";
    });
  }

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

  // silent cleanup before player interaction
  setTimeout(() => {
    const initMatches = findMatches();
    if (initMatches.length) resolveBoard(initMatches);
    else {
      isResolving = false;
      isInitPhase = false;
    }
  }, 0);

});
