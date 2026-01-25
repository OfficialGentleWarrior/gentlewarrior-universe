// Pillar Match – Weekly Leaderboard (FINAL, MATCHED)

if (!window.pillarDB) {
  console.error("pillarDB not ready");
} else {

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
    getDocs
  } = window.pillarDB;

  function getPlayerNameSafe() {
    return typeof window.getPillarPlayerName === "function"
      ? window.getPillarPlayerName()
      : "Player";
  }

  // Save best run of the week (Level > Score > Lowest Moves)
  async function submitRun(score, level, movesUsed) {
    const playerId = getPillarDeviceTag();
    const seasonId = currentSeasonId();
    const playerName = getPlayerNameSafe();

    // log all runs
    await addDoc(pillarRuns, {
      playerId,
      playerName,
      seasonId,
      score,
      level,
      movesUsed,
      createdAt: serverTimestamp()
    });

    const playerDocId = `${seasonId}_${playerId}`;
    const playerRef = doc(pillarPlayers, playerDocId);
    const snap = await getDoc(playerRef);

    let isBetter = false;

    if (!snap.exists()) {
      isBetter = true;
    } else {
      const prev = snap.data();
      isBetter =
        level > prev.level ||
        (level === prev.level && score > prev.score) ||
        (level === prev.level && score === prev.score && movesUsed < prev.movesUsed);
    }

    if (isBetter) {
      await setDoc(playerRef, {
        playerId,
        playerName,
        seasonId,
        level,
        score,
        movesUsed,
        updatedAt: serverTimestamp()
      });
    }
  }

  // Render Weekly Top 10
  async function loadLeaderboard() {
    const seasonId = currentSeasonId();
    const listEl = document.getElementById("leaderboardList");
    if (!listEl) return;

    const q = query(pillarPlayers, where("seasonId", "==", seasonId));
    const snap = await getDocs(q);

    if (snap.empty) {
      listEl.innerHTML = "<div>No runs yet this week.</div>";
      return;
    }

    let rows = [];
    snap.forEach(d => rows.push(d.data()));

    rows.sort((a,b)=>
      b.level - a.level ||
      b.score - a.score ||
      a.movesUsed - b.movesUsed
    );

    rows = rows.slice(0,10);

    let html = `
      <div style="display:grid;grid-template-columns:40px 1fr 60px 80px 90px;font-weight:600;">
        <div>Rank</div><div>Name</div><div>Level</div><div>Score</div><div>Moves</div>
      </div>
    `;

    rows.forEach((p,i)=>{
      html += `
        <div style="display:grid;grid-template-columns:40px 1fr 60px 80px 90px;">
          <div>#${i+1}</div>
          <div>${p.playerName || "Player"}</div>
          <div>${p.level}</div>
          <div>${p.score}</div>
          <div>${p.movesUsed}</div>
        </div>
      `;
    });

    listEl.innerHTML = html;
  }

  // Expose to game.js
  window.PillarLeaderboard = {
    submitRun,
    loadLeaderboard
  };

  loadLeaderboard();
}
