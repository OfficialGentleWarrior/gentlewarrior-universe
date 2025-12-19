const PILLARS = [
  "aurelion",
  "gaialune",
  "ignara",
  "solyndra",
  "umbrath",
  "zeratheon"
];

const grid = document.querySelector(".grid");

for (let i = 0; i < 49; i++) {
  const tile = document.createElement("img");
  const p = PILLARS[Math.floor(Math.random() * PILLARS.length)];
  tile.src = `../assets/pillars/${p}.png`;
  tile.className = "tile";
  grid.appendChild(tile);
}
