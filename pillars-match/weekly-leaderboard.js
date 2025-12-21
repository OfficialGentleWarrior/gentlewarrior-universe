/* =====================================================
   PILLAR MATCH — WEEKLY LEADERBOARD (UTC)
   SAFE • STANDALONE • NO GAME LOGIC TOUCH
===================================================== */

(function () {

  const STORAGE_KEY = "pillar_match_weekly_v1";
  const MAX_ENTRIES = 10;

  /* =========================
     UTC WEEK HELPERS
  ========================== */

  function getUtcNow() {
    return new Date(new Date().toISOString());
  }

  // ISO week (UTC)
  function getWeekIdUTC(date = getUtcNow()) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  }

  function getNextMondayUTC() {
    const now = getUtcNow();
    const day = now.getUTCDay();
    const diff = (8 - day) % 7 || 7;
    const next = new Date(now);
    next.setUTCDate(now.getUTCDate() + diff);
    next.setUTCHours(0, 0, 0, 0);
    return next;
  }

  /* =========================
     STORAGE
  ========================== */

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        weekId: getWeekIdUTC(),
        players: {}
      };
    }
    return JSON.parse(raw);
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function ensureCurrentWeek(data) {
    const currentWeek = getWeekIdUTC();
    if (data.weekId !== currentWeek) {
      data.weekId = currentWeek;
      data.players = {};
      saveData(data);
    }
  }

  /* =========================
     RANKING RULE
     Higher level → lower moves → lower time
  ========================== */

  function isBetterRun(a, b) {
    if (a.level !== b.level) return a.level > b.level;
    if (a.moves !== b.moves) return a.moves < b.moves;
    return a.time < b.time;
  }

  /* =========================
     PUBLIC API (SAFE GLOBAL)
  ========================== */

  window.weeklyLeaderboard = {

    submitRun({ name, level, score, moves, time }) {
      if (!name) return;

      const data = loadData();
      ensureCurrentWeek(data);

      const prev = data.players[name];
      const run = { name, level, score, moves, time };

      if (!prev || isBetterRun(run, prev)) {
        data.players[name] = run;
        saveData(data);
        render();
      }
    }

  };

  /* =========================
     RENDER
  ========================== */

  function render() {
    const listEl = document.getElementById("leaderboardList");
    if (!listEl) return;

    const data = loadData();
    ensureCurrentWeek(data);

    const entries = Object.values(data.players)
      .sort((a, b) => isBetterRun(a, b) ? -1 : 1)
      .slice(0, MAX_ENTRIES);

    if (!entries.length) {
      listEl.innerHTML = "<li>No runs yet</li>";
      return;
    }

    listEl.innerHTML = "";
    entries.forEach((p, i) => {
      const li = document.createElement("li");
      li.textContent =
        `#${i + 1} — ${p.name} · Stage ${p.level} · ${p.moves} moves · ${p.time}s`;
      listEl.appendChild(li);
    });
  }

  /* =========================
     COUNTDOWN
  ========================== */

  function startCountdown() {
    const el = document.getElementById("utcCountdown");
    if (!el) return;

    function tick() {
      const now = getUtcNow();
      const next = getNextMondayUTC();
      const diff = next - now;

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      el.textContent =
        `${String(h).padStart(2, "0")}h ` +
        `${String(m).padStart(2, "0")}m ` +
        `${String(s).padStart(2, "0")}s`;
    }

    tick();
    setInterval(tick, 1000);
  }

  /* =========================
     INIT
  ========================== */

  document.addEventListener("DOMContentLoaded", () => {
    render();
    startCountdown();
  });

})();