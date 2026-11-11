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

export function renderRevenueOverview(summary) {
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
    card.append(heading, amount);
    container.appendChild(card);
  }
}

export function renderRevenueAllocations(summary) {
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
    card.append(heading, value);
    container.appendChild(card);
  }
}

export function renderRevenueActivity(activity) {
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
    card.append(link, date, details);
    container.appendChild(card);
  }
}
