document.addEventListener("DOMContentLoaded", () => {

/* =========================
   FIREBASE LEADERBOARD CORE
   (Heart Defender Pattern)
========================= */

import { initializeApp, getApps, getApp } from
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDZQFN0iMQ1QvgY2ptRFuOKY1sTz9zZhb8",
  authDomain: "gentle-warrior.firebaseapp.com",
  projectId: "gentle-warrior",
  storageBucket: "gentle-warrior.firebasestorage.app",
  messagingSenderId: "206508766648",
  appId: "1:206508766648:web:3451e7dcd6c9008e9c8b4d"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);
const pillarRuns = collection(db, "pillarRuns");

/* =========================
   WEEKLY SEASON
========================= */

function isoWeekId(date = new Date()) {
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

function currentSeasonId() {
  return isoWeekId() + "-pillar";
}

/* =========================
   DEVICE ID
========================= */

function getPillarDeviceTag() {
  let tag = localStorage.getItem("gw_pillar_device_tag");
  if (!tag) {
    tag = "pillar_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("gw_pillar_device_tag", tag);
  }
  return tag;
}

/* =========================
   CONFIG
========================= */

const PILLARS = [
  "aurelion","gaialune","ignara",
  "solyndra","umbrath","zeratheon"
];

const GRID_SIZE = 7;
const TILE_SIZE = 56 + 6;

const LEVEL_CONFIG = {
  baseMoves: 20,
  scoreTarget: level => 1500 + (level - 1) * 500
};

/* =========================
   CP LINES (1–100)
========================= */

const CP_LINES = {
  1:"Every small movement matters.",
  2:"Progress looks different for every child.",
  3:"Consistency builds strength.",
  4:"Effort is invisible but real.",
  5:"Some days are slower — that’s okay.",
  6:"Patience is a form of courage.",
  7:"Support makes growth possible.",
  8:"Rest is part of progress.",
  9:"Muscle memory takes time.",
  10:"Milestone reached — keep going.",
  // ... hanggang 100, walang babaguhin (kasama sa Part 2)
};

function getRandomCpLine(level) {
  const pool = [];
  for (let i = Math.max(1, level - 3); i <= Math.min(100, level + 3); i++) {
    pool.push(CP_LINES[i]);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/* =========================
   DOM
========================= */

const gridEl = document.querySelector(".grid");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const movesEl = document.getElementById("moves");
const progressBar = document.getElementById("progressBar");
const leaderboardEl = document.getElementById("leaderboardList");
/* =========================
   END RUN OVERLAY
========================= */

const endRunOverlay = document.getElementById("endRunOverlay");
const endRunLevel   = document.getElementById("endRunLevel");
const endRunScore   = document.getElementById("endRunScore");
const endRunCpLine  = document.getElementById("endRunCpLine");
const tryAgainBtn   = document.getElementById("tryAgainBtn");
const shareXBtn     = document.getElementById("shareXBtn");

function showEndRunOverlay() {
  endRunLevel.textContent = level;
  endRunScore.textContent = score;
  endRunCpLine.textContent = getRandomCpLine(level);
  endRunOverlay.classList.remove("hidden");
}

/* =========================
   RUN STATE
========================= */

let tiles = [];
let isResolving = true;
let isInitPhase = true;
let score = 0;
let level = 1;
let moves = LEVEL_CONFIG.baseMoves;
let levelStartScore = 0;
let runStartTime = Date.now();
let isRunActive = true;

/* =========================
   SAVE / LOAD
========================= */

function saveGame() {
  if (!isRunActive) return;
  localStorage.setItem("pm_save", JSON.stringify({
    level,
    score,
    moves,
    levelStartScore,
    board: tiles.map(t => t.dataset.pillar)
  }));
}

function loadGame() {
  const raw = localStorage.getItem("pm_save");
  return raw ? JSON.parse(raw) : null;
}

window.addEventListener("beforeunload", saveGame);

/* =========================
   UI
========================= */

function updateHUD() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  movesEl.textContent = moves;

  const gained = score - levelStartScore;
  progressBar.style.width =
    Math.min(100, (gained / LEVEL_CONFIG.scoreTarget(level)) * 100) + "%";
}

/* =========================
   LEVEL FLOW
========================= */

function startLevel() {
  const saved = loadGame();
  isResolving = true;
  isInitPhase = true;

  if (saved) {
    level = saved.level;
    score = saved.score;
    moves = saved.moves;
    levelStartScore = saved.levelStartScore;
    createGrid(saved.board);
  } else {
    moves = LEVEL_CONFIG.baseMoves;
    levelStartScore = score;
    createGrid();
  }

  updateHUD();
  setTimeout(resolveInitMatches, 0);
}

function showLevelComplete() {
  isResolving = true;
  document.getElementById("levelOverlay").classList.remove("hidden");
}

/* =========================
   GAME OVER HANDLING
========================= */

function endRun() {
  isRunActive = false;
  saveGame();
  showEndRunOverlay();
  submitRunToLeaderboard();
  loadLeaderboard();
}

/* =========================
   CONTROLS
========================= */

document.getElementById("endRunBtn").addEventListener("click", endRun);

tryAgainBtn.addEventListener("click", () => {
  endRunOverlay.classList.add("hidden");
  localStorage.removeItem("pm_save");
  level = 1;
  score = 0;
  moves = LEVEL_CONFIG.baseMoves;
  levelStartScore = 0;
  isRunActive = true;
  runStartTime = Date.now();
  startLevel();
});

shareXBtn.addEventListener("click", () => {
  const text = `Level ${level}\nScore ${score}\n\n${endRunCpLine.textContent}`;
  const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
  window.open(url, "_blank");
});

/* =========================
   GRID LOGIC (UNCHANGED)
========================= */

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

function createGrid(boardData = null) {
  gridEl.innerHTML = "";
  tiles = [];

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const img = document.createElement("img");
    const p = boardData ? boardData[i] : randomPillar();
    img.className = "tile";
    img.dataset.index = i;
    img.dataset.pillar = p;
    img.src = `../assets/pillars/${p}.png`;
    tiles.push(img);
    gridEl.appendChild(img);
  }
}
/* =========================
   FIREBASE LEADERBOARD
   (PATTERNED FROM HEART DEFENDER)
========================= */

const {
  pillarPlayers,
  pillarRuns,
  currentSeasonId,
  getPillarDeviceTag,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} = window.pillarDB;

function getPlayerId() {
  return getPillarDeviceTag(); // same device = same identity
}

/* =========================
   RECORD RUN (LIKE gwRecordRun)
========================= */

async function submitRunToLeaderboard() {
  const playerId = getPlayerId();
  const seasonId = currentSeasonId();
  const timeSpent = Math.floor((Date.now() - runStartTime) / 1000);

  try {
    // store every run
    await addDoc(pillarRuns, {
      playerId,
      seasonId,
      level,
      score,
      time: timeSpent,
      createdAt: serverTimestamp()
    });

    // store best per player per season
    const bestId = `${seasonId}_${playerId}`;
    const bestRef = doc(pillarPlayers, bestId);
    const snap = await getDoc(bestRef);

    const isBetter =
      !snap.exists() ||
      level > snap.data().level ||
      (level === snap.data().level && score > snap.data().score) ||
      (level === snap.data().level && score === snap.data().score && timeSpent < snap.data().time);

    if (isBetter) {
      await setDoc(bestRef, {
        playerId,
        seasonId,
        level,
        score,
        time: timeSpent,
        updatedAt: serverTimestamp()
      });
    }

  } catch (e) {
    console.error("Leaderboard submit failed:", e);
  }
}

/* =========================
   LOAD + RENDER (LIKE renderLeaderboard)
========================= */

async function loadLeaderboard() {
  const listEl = document.getElementById("leaderboardList");
  if (!listEl) return;

  listEl.textContent = "Loading leaderboard…";

  try {
    const q = query(
      pillarPlayers,
      where("seasonId", "==", currentSeasonId()),
      orderBy("level", "desc"),
      orderBy("score", "desc"),
      orderBy("time", "asc"),
      limit(10)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.textContent = "No runs yet. Be the first Gentle Warrior.";
      return;
    }

    let html = `<div style="font-size:12px;margin-bottom:6px;opacity:.7;">
      Weekly Top Warriors
    </div>`;

    let rank = 1;

    snap.forEach(s => {
      const d = s.data();
      html += `
        <div style="display:flex;justify-content:space-between;font-size:11px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.08);">
          <span>#${rank}</span>
          <span>${d.playerId.slice(-4)}</span>
          <span>L${d.level}</span>
          <span>${d.score}</span>
          <span>${d.time}s</span>
        </div>
      `;
      rank++;
    });

    listEl.innerHTML = html;

  } catch (e) {
    console.error("Leaderboard load error:", e);
    listEl.textContent = "Unable to load leaderboard.";
  }
}

/* =========================
   AUTO LOAD ON START
========================= */

loadLeaderboard();
