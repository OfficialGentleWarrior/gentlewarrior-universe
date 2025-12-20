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

    animateSwap(a, b, () => {
      commitSwap(a, b);

      const matches = findMatches();
      if (matches.length === 0) {
        animateSwap(a, b, () => {
          commitSwap(a, b);
          isResolving = false;
        });
      } else {
        resolveBoard(matches);
      }
    });

    a.classList.remove("selected");
    selectedTile = null;
  }

  /* ---------- SWAP ---------- */
  function animateSwap(a, b, done) {
    const p1 = indexToRowCol(+a.dataset.index);
    const p2 = indexToRowCol(+b.dataset.index);
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

  /* ---------- RESOLUTION ---------- */
  function resolveBoard(matches) {
    clearMatches(matches);

    setTimeout(() => {
      applyGravityAnimated(() => {
        const next = findMatches();
        if (next.length) resolveBoard(next);
        else {
          isResolving = false;
          if (isInitPhase) isInitPhase = false;
        }
      });
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

  /* ---------- GRAVITY (ANIMATED) ---------- */
  function applyGravityAnimated(done) {
    let maxDelay = 0;

    for (let c = 0; c < GRID_SIZE; c++) {
      const stack = [];

      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r * GRID_SIZE + c];
        if (t.dataset.pillar !== "empty") stack.push(t.dataset.pillar);
      }

      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        const t = tiles[r * GRID_SIZE + c];
        const newPillar = stack.shift() || randomPillar();

        const oldRow = indexToRowCol(+t.dataset.index).row;
        const newRow = r;
        const dy = (oldRow - newRow) * TILE_SIZE;

        t.dataset.pillar = newPillar;
        t.src = `../assets/pillars/${newPillar}.png`;
        t.style.opacity = "1";
        t.style.pointerEvents = "auto";

        if (dy !== 0) {
          t.style.transform = `translateY(${dy}px)`;
          t.style.transition = "transform 0.18s ease-out";
          maxDelay = 180;

          requestAnimationFrame(() => {
            t.style.transform = "";
          });
        }
      }
    }

    setTimeout(() => {
      tiles.forEach(t => {
        t.style.transition = "";
        t.style.transform = "";
      });
      done();
    }, maxDelay);
  }

  /* ---------- INIT ---------- */
  createGrid();

  setTimeout(() => {
    const initMatches = findMatches();
    if (initMatches.length) resolveBoard(initMatches);
    else {
      isResolving = false;
      isInitPhase = false;
    }
  }, 0);

});
