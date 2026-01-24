// Pillar Match – Weekly Leaderboard (Isolated)

(function () {

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
      where("seasonId", "==", seasonId),
      orderBy("score", "desc"),
      limit(10)
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

    snap.forEach(doc => {
      const d = doc.data();
      html += `
        <div style="display:flex;justify-content:space-between;padding:2px 0;">
          <span>#${rank}</span>
          <span>${d.playerId.slice(-4)}</span>
          <span>${d.score}</span>
        </div>
      `;
      rank++;
    });

    listEl.innerHTML = html;
  }

  window.PillarLeaderboard = {
    submitRun,
    loadLeaderboard
  };

})();
