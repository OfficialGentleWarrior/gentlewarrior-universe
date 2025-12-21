document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     SPARKLE STYLE (REAL)
  ========================== */
  const style = document.createElement("style");
  style.textContent = `
    .tile {
      position: relative;
      width: 62px;
      height: 62px;
    }
    .tile img {
      width: 100%;
      height: 100%;
      display: block;
    }
    .sparkle {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: 50%;
      animation: sparklePop 0.45s ease-out forwards;
    }
    @keyframes sparklePop {
      0%   { transform: scale(0.3); opacity: 0; }
      40%  { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  /* =========================
     CONFIG
  ========================== */

  const PILLARS = ["aurelion","gaialune","ignara","solyndra","umbrath","zeratheon"];
  const GRID_SIZE = 7;
  const TILE_SIZE = 62;

  /* =========================
     DOM
  ========================== */

  const gridEl = document.querySelector(".grid");
  const scoreEl = document.getElementById("score");
  const levelEl = document.getElementById("level");
  const movesEl = document.getElementById("moves");
  const progressBar = document.getElementById("progressBar");

  /* =========================
     STATE
  ========================== */

  let tiles = [];
  let selectedTile = null;
  let isResolving = true;
  let isInitPhase = true;

  let score = 0;
  let level = 1;
  let moves = 20;
  let levelStartScore = 0;

  /* =========================
     GRID (FIXED)
  ========================== */

  function randomPillar() {
    return PILLARS[Math.floor(Math.random() * PILLARS.length)];
  }

  function createGrid() {
    gridEl.innerHTML = "";
    tiles = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const wrapper = document.createElement("div");
      wrapper.className = "tile";
      wrapper.dataset.index = i;
      wrapper.dataset.pillar = randomPillar();

      const img = document.createElement("img");
      img.src = `../assets/pillars/${wrapper.dataset.pillar}.png`;
      img.draggable = false;

      wrapper.appendChild(img);
      wrapper.addEventListener("click", () => onTileClick(wrapper));

      tiles.push(wrapper);
      gridEl.appendChild(wrapper);
    }
  }

  /* =========================
     SPARKLE (NOW VISIBLE)
  ========================== */

  function spawnSparkle(tile, big) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.background = big
      ? "radial-gradient(circle, rgba(255,255,255,.9), transparent)"
      : "radial-gradient(circle, rgba(255,255,255,.6), transparent)";
    tile.appendChild(s);
    setTimeout(() => s.remove(), 500);
  }

  /* =========================
     MATCH CLEAR (FIXED)
  ========================== */

  function resolveBoard(groups) {
    const toClear = new Set();
    let maxSize = 0;

    groups.forEach(g => {
      maxSize = Math.max(maxSize, g.length);
      g.forEach(i => toClear.add(i));
    });

    toClear.forEach(i => spawnSparkle(tiles[i], maxSize >= 4));

    setTimeout(() => {
      toClear.forEach(i => {
        const t = tiles[i];
        t.dataset.pillar = "empty";
        t.style.opacity = "0";
        t.style.transform = "scale(0.6)";
      });

      setTimeout(() => {
        tiles.forEach(t => {
          if (t.dataset.pillar === "empty") {
            const p = randomPillar();
            t.dataset.pillar = p;
            t.querySelector("img").src = `../assets/pillars/${p}.png`;
            t.style.opacity = "1";
            t.style.transform = "scale(1)";
          }
        });
        isResolving = false;
      }, 220);

    }, maxSize >= 4 ? 480 : 260);
  }

  /* =========================
     BASIC MATCH (MINIMAL)
  ========================== */

  function findMatches() {
    const groups = [];
    for (let i = 0; i < tiles.length - 2; i++) {
      const p = tiles[i].dataset.pillar;
      if (
        p &&
        tiles[i+1]?.dataset.pillar === p &&
        tiles[i+2]?.dataset.pillar === p
      ) {
        groups.push([i,i+1,i+2]);
      }
    }
    return groups;
  }

  function onTileClick(tile) {
    if (isResolving) return;
    isResolving = true;
    const matches = findMatches();
    if (matches.length) resolveBoard(matches);
    else isResolving = false;
  }

  /* =========================
     INIT
  ========================== */

  createGrid();
  isResolving = false;

});
