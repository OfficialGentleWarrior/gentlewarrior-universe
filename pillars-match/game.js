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

  // swap data
  t1.dataset.pillar = p2;
  t2.dataset.pillar = p1;

  // swap images
  t1.src = `../assets/pillars/${p2}.png`;
  t2.src = `../assets/pillars/${p1}.png`;
}

/* ---------- init ---------- */
createGrid();
