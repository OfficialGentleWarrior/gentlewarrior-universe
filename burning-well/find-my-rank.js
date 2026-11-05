let bwRankRequestId = 0;
export function cancelFindMyRank() { bwRankRequestId++; const button = document.getElementById('bwRankSearch'); if (button) button.disabled = false; }
export function initFindMyRank(apiBaseUrl) {
  const input = document.getElementById("bwRankWallet");
  const button = document.getElementById("bwRankSearch");
  const result = document.getElementById("bwRankResult");
  if (!input || !button || !result || button.dataset.bound) return;
  button.dataset.bound = "true";
  button.addEventListener("click", async () => {
    const requestId = ++bwRankRequestId;
    const wallet = input.value.trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) { result.textContent = "Enter a valid Solana wallet address."; return; }
    result.textContent = "Searching rankings...";
    button.disabled = true;
    try {
      const period = document.getElementById("bwLbPeriod")?.value || "all";
      const params = new URLSearchParams({ period });
      if (period === "custom") {
        const start = document.getElementById("bwLbStart")?.value;
        const end = document.getElementById("bwLbEnd")?.value;
        if (!start || !end || start > end) { result.textContent = "Select a valid date range first."; return; }
        params.set("start", start); params.set("end", end);
      }
      const categories = ["burners", "referrers"];
      const data = await Promise.all(categories.map(async category => {
        const response = await fetch(`${apiBaseUrl}/api/leaderboard/${category}?${params}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      }));
      const labels = ["Top Burners", "Top Referrers"];
      if (requestId !== bwRankRequestId) return;
      result.replaceChildren();
      data.forEach((entry, index) => {
        const match = (entry.leaderboard || []).find(item => item.wallet === wallet);
        const line = document.createElement("p");
        line.textContent = `${labels[index]}: ${match ? `#${match.rank}` : "Unranked"}`;
        result.appendChild(line);
      });
    } catch (error) { if (requestId !== bwRankRequestId) return; console.error("Find My Rank error:", error); result.textContent = "Unable to retrieve rankings."; }
    finally { if (requestId === bwRankRequestId) button.disabled = false; }
  });
}
