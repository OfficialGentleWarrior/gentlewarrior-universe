let bwEvents = [];
let bwEventFilter = 'live';

export async function loadBwEvents(apiBaseUrl) {
  const status = document.getElementById('bwEventsStatus');
  if (!status) return;
  status.textContent = 'Loading events...';
  try {
    const response = await fetch((import.meta.env.DEV ? '/local-events-api' : apiBaseUrl) + '/api/public/burn-events');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    bwEvents = Array.isArray(data.events) ? data.events : [];
    renderBwEvents();
  } catch (error) {
    console.error('Events loading error:', error);
    status.textContent = 'Unable to load events. Please try again.';
  }
}

function renderBwEvents() {
  const list = document.getElementById('bwEventsList');
  const status = document.getElementById('bwEventsStatus');
  if (!list || !status) return;
  const filtered = bwEvents.filter(event => {
    const value = String(event.status || '').toLowerCase();
    if (bwEventFilter === 'live') return value === 'active' || value === 'live';
    if (bwEventFilter === 'upcoming') return value === 'scheduled' || value === 'upcoming';
    return value === 'ended' || value === 'completed';
  });
  list.replaceChildren();
  filtered.forEach(event => {
    const card = document.createElement('article');
    card.className = 'bw-event-card';
    const title = document.createElement('h3');
    title.textContent = event.name || 'Untitled Event';
    const token = document.createElement('p');
    token.textContent = 'Token: ' + (event.tokenSymbol || event.tokenMint || 'Unknown');
    const dates = document.createElement('p');
    const formatDate = value => value ? new Date(value).toLocaleString() : 'Not specified';
    dates.textContent = 'Start: ' + formatDate(event.startAt) + ' | End: ' + formatDate(event.endAt);
    const link = document.createElement('a');
    link.href = './event/?id=' + encodeURIComponent(event.id);
    link.textContent = 'View Event';
    card.append(title, token, dates, link);
    list.appendChild(card);
  });
  status.textContent = filtered.length ? '' : 'No ' + bwEventFilter + ' events found.';
}

export function initBwEventFilters() {
  const buttons = document.querySelectorAll('.bw-event-filter');
  buttons.forEach(button => {
    if (button.dataset.bound) return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      bwEventFilter = button.dataset.status || 'live';
      buttons.forEach(item => {
        item.classList.toggle('active', item === button);
      });
      renderBwEvents();
    });
  });
}
