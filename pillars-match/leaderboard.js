// Pillar Match – Weekly Leaderboard (Isolated)

(function () {

  const dbx = window.pillarDB;
  if (!dbx) {
    console.error("pillarDB not loaded");
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
  } = dbx;

  async function submitRun(score, level, movesUsed) {
    try {
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

      console.log("Leaderboard saved:", score);

    } catch (e) {
      console.error("submitRun failed:", e);
    }
  }

  async function loadLeaderboard() {
    try {
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

      snap.forEach(d => {
        const data = d.data();
        html += `
          <div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span>#${rank}</span>
            <span>${data.playerId.slice(-4)}</span>
            <span>${data.score}</span>
          </div>
        `;
        rank++;
      });

      listEl.innerHTML = html;
      console.log("Leaderboard loaded");

    } catch (e) {
      console.error("loadLeaderboard failed:", e);
    }
  }

  window.PillarLeaderboard = {
    submitRun,
    loadLeaderboard
  };

  // auto-load on page open
  document.addEventListener("DOMContentLoaded", loadLeaderboard);

})();
