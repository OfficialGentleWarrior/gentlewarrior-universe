// Burning Well V2 - Revenue Dashboard
export async function fetchRevenueData(apiBaseUrl, period = 'all', page = 1, limit = 20) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const params = new URLSearchParams({ period, page: String(page), limit: String(limit) });
  const [summaryResponse, activityResponse] = await Promise.all([
    fetch(base + '/api/revenue/summary?period=' + encodeURIComponent(period)),
    fetch(base + '/api/revenue/activity?' + params.toString())
  ]);
  if (!summaryResponse.ok || !activityResponse.ok) throw new Error('Unable to load revenue data');
  return { summary: await summaryResponse.json(), activity: await activityResponse.json() };
}

export async function fetchCommunityRewards(base, year, quarter) {
  const params = new URLSearchParams({ year: String(year), quarter: String(quarter) });
  const response = await fetch(base + '/api/revenue/community-rewards?' + params.toString());
  if (!response.ok) throw new Error('Unable to load Community Rewards');
  return response.json();
}

export function renderCommunityRewards(data) {
  const root = document.getElementById('bwCommunityRewards');
  if (!root) return;
  root.replaceChildren();
  const add = (parent, tag, value) => { const el = document.createElement(tag); el.textContent = String(value); parent.appendChild(el); return el; };
  add(root, 'h4', 'Q' + data.quarter + ' ' + data.year + ' — ' + data.status);
  add(root, 'p', 'Community Rewards Pool: ' + data.communityRewardsSol + ' SOL');
  add(root, 'p', 'Top Burners Pool: ' + data.burnersPoolSol + ' SOL');
  add(root, 'p', 'Top Referrers Pool: ' + data.referrersPoolSol + ' SOL');
  for (const [title, leaders, prizes] of [['Top Burners', data.topBurners, data.burnersPrizes], ['Top Referrers', data.topReferrers, data.referrersPrizes]]) {
    const section = add(root, 'section', '');
    add(section, 'h4', title);
    if (!Array.isArray(leaders) || !leaders.length) { add(section, 'p', 'No eligible participants yet.'); continue; }
    leaders.slice(0, 3).forEach((entry, i) => {
      const prize = Array.isArray(prizes) ? prizes[i] : null;
      const count = title === 'Top Burners' ? entry.verifiedBurns : entry.successfulReferrals;
      add(section, 'p', '#' + (i + 1) + ' ' + entry.wallet + ' — ' + count + ' verified — Estimated prize: ' + (prize ? prize.sol : 0) + ' SOL');
    });
  }
  add(root, 'p', 'Rewards are estimates, not finalized payouts.');
}

export function renderRevenueOverview(summary, solPriceUsd = null) {
  const container = document.getElementById('bwRevenueOverview');
  if (!container) return;
  const formatSol = value => value == null ? 'Pending Verification' : Number(value).toLocaleString('en-US', {maximumFractionDigits: 9}) + ' SOL';
  const metrics = [
    ['Gross Collected', formatSol(summary.grossCollectedSol)],
    ['Referral Rewards', formatSol(summary.referralRewardsSol)],
    ['Net Revenue', formatSol(summary.netRevenueSol)],
    ['Verified Burns', String(summary.verifiedBurns ?? 0)]
  ];
  container.replaceChildren();
  for (const [label, value] of metrics) {
    const card = document.createElement('div');
    card.className = 'bw-revenue-card';
    const heading = document.createElement('h4');
    heading.textContent = label;
    const amount = document.createElement('p');
    amount.textContent = value;
    card.append(heading, amount); if (label !== "Verified Burns") { const usd = formatRevenueUsd(summary[label === "Gross Collected" ? "grossCollectedSol" : label === "Referral Rewards" ? "referralRewardsSol" : "netRevenueSol"], solPriceUsd); if (usd) { const equivalent = document.createElement("small"); equivalent.className = "bw-revenue-usd"; equivalent.textContent = "Approx. " + usd + " USD"; card.appendChild(equivalent); } }
    container.appendChild(card);
  }
}

export function renderRevenueAllocations(summary, solPriceUsd = null) {
  const container = document.getElementById('bwRevenueAllocations');
  if (!container) return;
  const allocations = summary.allocations || {};
  const funds = [
    ['Baby Leam\x27s Therapy Fund', '30%', allocations.leamTherapySol],
    ['CP Kids Fund', '30%', allocations.cpKidsSol],
    ['Community Rewards', '20%', allocations.communityRewardsSol],
    ['$GWAR Buy & Burn', '20%', allocations.gwarBuyBurnSol]
  ];
  container.replaceChildren();
  for (const [name, percentage, amount] of funds) {
    const card = document.createElement('div');
    card.className = 'bw-revenue-allocation-card';
    const heading = document.createElement('h4');
    heading.textContent = name + ' (' + percentage + ')';
    const value = document.createElement('p');
    value.textContent = amount == null ? 'Unavailable' : Number(amount).toLocaleString('en-US', {maximumFractionDigits:9}) + ' SOL';
    card.append(heading, value); const usd = formatRevenueUsd(amount, solPriceUsd); if (usd) { const equivalent = document.createElement("small"); equivalent.className = "bw-revenue-usd"; equivalent.textContent = "Approx. " + usd; card.appendChild(equivalent); }
    container.appendChild(card);
  }
}

export function renderRevenueActivity(activity, solPriceUsd = null) {
  const container = document.getElementById('bwRevenueActivity');
  if (!container) return;
  container.replaceChildren();
  const records = activity.records || [];
  if (!records.length) { container.textContent = 'No verified revenue transactions found for this period.'; return; }
  const formatSol = value => value == null ? 'Pending Verification' : Number(value).toLocaleString('en-US',{maximumFractionDigits:9}) + ' SOL';
  for (const record of records) {
    const card = document.createElement('div');
    card.className = 'bw-revenue-activity-card';
    const link = document.createElement('a');
    link.textContent = record.signature;
    link.href = 'https://solscan.io/tx/' + encodeURIComponent(record.signature);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const details = document.createElement('p');
    details.textContent = 'Gross: ' + formatSol(record.grossCollectedSol) + ' | Referral: ' + formatSol(record.referralRewardsSol) + ' | Net: ' + formatSol(record.netRevenueSol);
    const date = document.createElement('p');
    date.textContent = new Date(record.blockTime * 1000).toLocaleString();
    card.append(link, date, details); const grossUsd=formatRevenueUsd(record.grossCollectedSol,solPriceUsd); const referralUsd=formatRevenueUsd(record.referralRewardsSol,solPriceUsd); const netUsd=formatRevenueUsd(record.netRevenueSol,solPriceUsd); if(grossUsd || referralUsd || netUsd){const usdDetails=document.createElement("small");usdDetails.className="bw-revenue-usd";usdDetails.textContent="Approx. USD - Gross: "+(grossUsd || "N/A")+"; Referral: "+(referralUsd || "N/A")+"; Net: "+(netUsd || "N/A");card.appendChild(usdDetails);}
    container.appendChild(card);
  }
}

export async function fetchSolPrice(apiBaseUrl) {
  const base = apiBaseUrl.replace(/\/$/, "");
  const response = await fetch(base + "/api/revenue/sol-price");
  if (!response.ok) throw new Error("SOL/USD price unavailable");
  const data = await response.json();
  if (!Number.isFinite(Number(data.solPriceUsd)) || Number(data.solPriceUsd) <= 0) throw new Error("Invalid SOL/USD price");
  return data;
}

export function formatRevenueUsd(solAmount, solPriceUsd) {
  const amount = Number(solAmount);
  const price = Number(solPriceUsd);
  if (solAmount == null || !Number.isFinite(amount) || !Number.isFinite(price) || price <= 0) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount * price);
}
