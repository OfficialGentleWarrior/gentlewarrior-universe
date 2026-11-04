let bwLeaderboardRequestId = 0;
let bwLeaderboardCustomDirty = false;

export async function loadBwLeaderboard(apiBaseUrl) {
  const requestId = ++bwLeaderboardRequestId;
  document.getElementById("bwLbHead")?.replaceChildren();
  document.getElementById("bwLbBody")?.replaceChildren();
  const status = document.getElementById("bwLbStatus");
  if (!status) return;
  const tabs = document.querySelectorAll(".bw-lb-tab");
  if (!window.bwLeaderboardTabsReady) {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((item) => item.classList.toggle("active", item === tab));
        if (document.getElementById("bwLbPeriod")?.value === "custom" && bwLeaderboardCustomDirty) {
          status.textContent = "Date range changed. Click Apply to load rankings.";
          return;
        }
        loadBwLeaderboard(apiBaseUrl);
      });
    });
    window.bwLeaderboardTabsReady = true;
  }
  const periodSelect = document.getElementById("bwLbPeriod");
  if (periodSelect && !periodSelect.dataset.bound) {
    periodSelect.addEventListener("change", () => {
      const customDates = document.getElementById("bwLbCustomDates");
      if (customDates) customDates.hidden = periodSelect.value !== "custom";
      if (periodSelect.value === "custom") {
        bwLeaderboardCustomDirty = true;
        ++bwLeaderboardRequestId;
        document.getElementById("bwLbHead")?.replaceChildren();
        document.getElementById("bwLbBody")?.replaceChildren();
        document.getElementById("bwLbStatus").textContent = "Select your date range, then click Apply.";
      } else {
        bwLeaderboardCustomDirty = false;
        loadBwLeaderboard(apiBaseUrl);
      }
    });
    periodSelect.dataset.bound = "true";
  }
  const period = periodSelect?.value || "all";
  if (period === "custom" && bwLeaderboardCustomDirty) {
    status.textContent = "Select your date range, then click Apply.";
    return;
  }
  const startInput = document.getElementById("bwLbStart");
  const endInput = document.getElementById("bwLbEnd");
  for (const input of [startInput, endInput]) {
    if (input && !input.dataset.lbBound) {
      input.addEventListener("change", () => {
        if (periodSelect?.value !== "custom") return;
        bwLeaderboardCustomDirty = true;
        ++bwLeaderboardRequestId;
        document.getElementById("bwLbHead")?.replaceChildren();
        document.getElementById("bwLbBody")?.replaceChildren();
        status.textContent = "Date range changed. Click Apply to load rankings.";
      });
      input.dataset.lbBound = "true";
    }
  }
  const applyButton = document.getElementById("bwLbApply");
  if (applyButton && !applyButton.dataset.bound) {
    applyButton.addEventListener("click", () => {
      if (!startInput?.value || !endInput?.value || startInput.value > endInput.value) {
        status.textContent = "Please select a valid date range.";
        return;
      }
      bwLeaderboardCustomDirty = false;
      loadBwLeaderboard(apiBaseUrl);
    });
    applyButton.dataset.bound = "true";
  }
  if (period === "custom" && (!startInput?.value || !endInput?.value || startInput.value > endInput.value)) {
    status.textContent = "Select From and To dates, then click Apply.";
    return;
  }
  const category = document.querySelector(".bw-lb-tab.active")?.dataset.lb || "burners";
  if (!["burners", "referrers", "tokens"].includes(category)) return;
  status.textContent = `Loading Top ${category}...`;
  try {
    const params = new URLSearchParams({ period });
    if (period === "custom") {
      params.set("start", startInput.value);
      params.set("end", endInput.value);
    }
    const response = await fetch(`${apiBaseUrl}/api/leaderboard/${category}?${params.toString()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (requestId !== bwLeaderboardRequestId) return;
    const count = Array.isArray(data.leaderboard) ? data.leaderboard.length : 0;
    status.textContent = count === 0 ? `No results found for Top ${category}.` : `Top ${category}: ${count} results`;
    const head = document.getElementById("bwLbHead");
    const body = document.getElementById("bwLbBody");
    if (!head || !body) return;
    head.replaceChildren();
    body.replaceChildren();
    const headerRow = document.createElement("tr");
    const columns = {
      burners: [["Rank", "rank"], ["Wallet", "wallet"], ["Burn Transactions", "burnTransactions"], ["Unique Tokens", "uniqueTokens"]],
      referrers: [["Rank", "rank"], ["Wallet", "wallet"], ["Successful Referrals", "successfulReferrals"]],
      tokens: [["Rank", "rank"], ["Token", "tokenName"], ["Symbol", "tokenSymbol"], ["Mint", "mint"], ["Burn Transactions", "burnTransactions"], ["Total Burned", "totalBurned"], ["Unique Burners", "uniqueBurners"]]
    };
    for (const [label] of columns[category]) {
      const th = document.createElement("th");
      th.textContent = label;
      headerRow.appendChild(th);
    }
    head.appendChild(headerRow);
    for (const item of (Array.isArray(data.leaderboard) ? data.leaderboard : [])) {
      const row = document.createElement("tr");
      for (const [, field] of columns[category]) {
        const value = item[field];
        const td = document.createElement("td");
        td.textContent = String(value ?? "-");
        row.appendChild(td);
      }
      body.appendChild(row);
    }
  } catch (error) {
    if (requestId !== bwLeaderboardRequestId) return;
    console.error("Leaderboard loading error:", error);
    status.textContent = "Unable to load leaderboard.";
  }
}
