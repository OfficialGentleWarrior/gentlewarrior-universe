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
  const TILE_SIZE = 56 + 6;
  const gridEl = document.querySelector(".grid");

  let tiles = [];
  let selectedTile = null;
  let isResolving = true;
  let isInitPhase = true;

  /* ---------- PRELOAD ---------- */
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
      const p = randomPillar();
      const img = document.createElement("img");

      img.className = "tile";
      img.dataset.index = i;
      img.dataset.pillar = p;
      img.dataset.special = "";
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

    if (!isAdjacent(+a.dataset.index, +b.dataset.index)) {
      a.classList.remove("selected");
      selectedTile = null;
      return;
    }

    isResolving = true;

    animateSwap(a, b, () => {
      commitSwap(a, b);

      // 🔥 IGNARA CORE ACTIVATION
      if (a.dataset.special === "ignara") {
        triggerIgnara(+a.dataset.index);
        return;
      }
      if (b.dataset.special === "ignara") {
        triggerIgnara(+b.dataset.index);
        return;
      }

      const result = findMatchesDetailed();

      if (result.matches.length === 0) {
        animateSwap(a, b, () => {
          commitSwap(a, b);
          isResolving = false;
        });
      } else {
        resolveBoard(result);
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

  /* ---------- MATCH DETECTION ---------- */
  function findMatchesDetailed() {
    const matches = [];

    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      let count = 1;
      for (let c = 1; c <= GRID_SIZE; c++) {
        const cur = c < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[r * GRID_SIZE + c - 1].dataset.pillar;

        if (cur === prev) count++;
        else {
          if (count >= 3) {
            const group = [];
            for (let k = 0; k < count; k++)
              group.push(r * GRID_SIZE + (c - 1 - k));
            matches.push(group);
          }
          count = 1;
        }
      }
    }

    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      let count = 1;
      for (let r = 1; r <= GRID_SIZE; r++) {
        const cur = r < GRID_SIZE ? tiles[r * GRID_SIZE + c].dataset.pillar : null;
        const prev = tiles[(r - 1) * GRID_SIZE + c].dataset.pillar;

        if (cur === prev) count++;
        else {
          if (count >= 3) {
            const group = [];
            for (let k = 0; k < count; k++)
              group.push((r - 1 - k) * GRID_SIZE + c);
            matches.push(group);
          }
          count = 1;
        }
      }
    }

    return { matches };
  }

  /* ---------- IGNARA EXPLOSION ---------- */
  function triggerIgnara(index) {
    const { row, col } = indexToRowCol(index);
    const blast = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE)
          blast.push(r * GRID_SIZE + c);
      }
    }

    clearMatches(blast);

    setTimeout(() => {
      applyGravityAnimated(() => {
        const next = findMatchesDetailed();
        if (next.matches.length) resolveBoard(next);
        else isResolving = false;
      });
    }, 120);
  }

  /* ---------- RESOLUTION ---------- */
  function resolveBoard(result) {
    const toClear = new Set();

    result.matches.forEach(group => {
      if (group.length === 4) {
        const core = group[1];
        const t = tiles[core];

        if (t.dataset.pillar === "ignara") {
          t.dataset.special = "ignara";
          t.classList.add("ignara-core");
          group.forEach(i => { if (i !== core) toClear.add(i); });
        } else {
          group.forEach(i => toClear.add(i));
        }
      } else {
        group.forEach(i => toClear.add(i));
      }
    });

    clearMatches([...toClear]);

    setTimeout(() => {
      applyGravityAnimated(() => {
        const next = findMatchesDetailed();
        if (next.matches.length) resolveBoard(next);
        else {
          isResolving = false;
          isInitPhase = false;
        }
      });
    }, 120);
  }

  function clearMatches(list) {
    list.forEach(i => {
      const t = tiles[i];
      if (t.dataset.special === "ignara") return; // 🔒 keep core

      t.dataset.pillar = "empty";
      t.dataset.special = "";
      t.classList.remove("ignara-core");
      t.style.opacity = "0";
      t.style.pointerEvents = "none";
    });
  }

  /* ---------- GRAVITY ---------- */
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

  /*/* ---------- INIT ---------- */
createGrid();

/* 🔥 TEMP TEST: force ignara core glow */
tiles[24].classList.add("ignara-core");

setTimeout(() => {
  const init = findMatchesDetailed();
  if (init.matches.length) resolveBoard(init);
  else {
    isResolving = false;
    isInitPhase = false;
  }
}, 0);
