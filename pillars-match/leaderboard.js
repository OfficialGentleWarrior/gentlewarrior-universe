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

const playerName = window.getPillarPlayerName();

  async function submitRun(score, level, movesUsed) {
  const playerId = getPillarDeviceTag();
  const seasonId = currentSeasonId();
  const playerName = window.getPillarPlayerName();

  const runData = {
    playerId,
    playerName,
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
      playerName,
      seasonId,
      score,
      level,
      movesUsed,
      updatedAt: serverTimestamp()
    });
  }
}

  async function loadLeaderboard() {
  const seasonId = currentSeasonId();

  const q = query(
  pillarPlayers,
  where("seasonId", "==", seasonId),
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

  let html = `
<div style="display:grid;grid-template-columns:40px 1fr 60px 80px 90px;font-weight:600;">
  <div>Rank</div><div>Name</div><div>Level</div><div>Score</div><div>Moves</div>
</div>
`;

let rank = 1;

snap.forEach(doc => {
  const d = doc.data();

  html += `
  <div style="display:grid;grid-template-columns:40px 1fr 60px 80px 90px;">
    <div>#${rank}</div>
    <div>${d.playerName || "Player"}</div>
    <div>${d.level}</div>
    <div>${d.score}</div>
    <div>${d.movesUsed}</div>
  </div>
  `;
  rank++;
});

listEl.innerHTML = html;

  window.PillarLeaderboard = {
    submitRun,
    loadLeaderboard
  };

  // auto load on page open
  loadLeaderboard();

});
