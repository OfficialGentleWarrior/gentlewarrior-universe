// Pillar Match – Weekly Leaderboard (Isolated)

document.addEventListener("DOMContentLoaded", () => {

  if (!window.pillarDB) {
    console.error("pillarDB not ready");
    return;
  }

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

  async function submitRun(score, level, movesUsed) {
    const playerId = getPillarDeviceTag();
    const seasonId = currentSeasonId();

    const runData = {
      playerId,
      seasonId,
      score,
      level,
      movesUsed,
      createdAt: Date.now()
    };

    await addDoc(pillarRuns, runData);

    const playerDocId = `${seasonId}_${playerId}`;
    const playerRef = doc(pillarPlayers, playerDocId);
    const snap = await getDoc(playerRef);

    if (!snap.exists() || snap.data().score < score) {
      await setDoc(playerRef, {
        playerId,
        seasonId,
        score,
        level,
        updatedAt: serverTimestamp()
      });
    }
  }

  async function loadLeaderboard() {
  const seasonId = currentSeasonId();

  const q = query(
    pillarPlayers,
    orderBy("score", "desc"),
    limit(20)
  );

  const snap = await getDocs(q);
  const listEl = document.getElementById("leaderboardList");
  if (!listEl) return;

  if (snap.empty) {
    listEl.innerHTML = "<div>No runs yet this week.</div>";
    return;
  }

  let html = "";
  let rank = 1;

  snap.forEach(d => {
    const data = d.data();
    if (data.seasonId !== seasonId) return; // manual filter

    html += `
      <div style="display:flex;justify-content:space-between;padding:2px 0;">
        <span>#${rank}</span>
        <span>${data.playerId.slice(-4)}</span>
        <span>${data.score}</span>
      </div>
    `;
    rank++;
  });

  listEl.innerHTML = html || "<div>No runs yet this week.</div>";
}

  window.PillarLeaderboard = {
    submitRun,
    loadLeaderboard
  };

  // auto load on page open
  loadLeaderboard();

});
