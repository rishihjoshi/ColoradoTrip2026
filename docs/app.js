'use strict';

// ── Utilities ──────────────────────────────────────────────────────────────

/** HTML-escape untrusted strings before inserting into innerHTML */
function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Constants ──────────────────────────────────────────────────────────────

const DAY_LOCATIONS = {
  1: { name: 'Denver, CO',           lat: 39.7392, lon: -104.9903, date: '2026-06-19' },
  2: { name: 'Colorado Springs, CO', lat: 38.8339, lon: -104.8214, date: '2026-06-20' },
  3: { name: 'Glenwood Springs, CO', lat: 39.5505, lon: -107.3248, date: '2026-06-21' },
  4: { name: 'Aspen / Maroon Bells', lat: 39.0931, lon: -106.9253, date: '2026-06-22' },
  5: { name: 'Glenwood Springs, CO', lat: 39.5505, lon: -107.3248, date: '2026-06-23' },
  6: { name: 'Morrison / Red Rocks', lat: 39.6654, lon: -105.2057, date: '2026-06-24' },
};

// Per-destination weather spots for the forecast strip
const WEATHER_SPOTS = [
  { id: 'sp1', name: 'Denver Airport',    lat: 39.8561, lon: -104.6737, date: '2026-06-19', avgHi: 84, avgLo: 54 },
  { id: 'sp2', name: 'Colo. Springs',     lat: 38.8339, lon: -104.8214, date: '2026-06-20', avgHi: 78, avgLo: 50 },
  { id: 'sp3', name: 'Pikes Peak',        lat: 38.8405, lon: -105.0442, date: '2026-06-20', avgHi: 48, avgLo: 28 },
  { id: 'sp4', name: 'Vail',              lat: 39.6433, lon: -106.3781, date: '2026-06-21', avgHi: 73, avgLo: 44 },
  { id: 'sp5', name: 'Glenwood Spgs',    lat: 39.5505, lon: -107.3248, date: '2026-06-21', avgHi: 88, avgLo: 58 },
  { id: 'sp6', name: 'Aspen',             lat: 39.0931, lon: -106.9253, date: '2026-06-22', avgHi: 72, avgLo: 44 },
  { id: 'sp7', name: 'Maroon Bells',      lat: 39.0709, lon: -106.9890, date: '2026-06-22', avgHi: 62, avgLo: 36 },
  { id: 'sp8', name: 'Red Rocks',         lat: 39.6654, lon: -105.2057, date: '2026-06-24', avgHi: 82, avgLo: 52 },
];

const JUNE_AVERAGES = {
  1: { hi: 84, lo: 54, desc: 'Sunny',           icon: '☀️' },
  2: { hi: 78, lo: 50, desc: 'Partly Cloudy',   icon: '⛅' },
  3: { hi: 88, lo: 58, desc: 'Warm & Sunny',    icon: '☀️' },
  4: { hi: 72, lo: 44, desc: 'Mild',            icon: '🌤' },
  5: { hi: 88, lo: 58, desc: 'Warm & Sunny',    icon: '☀️' },
  6: { hi: 82, lo: 52, desc: 'Sunny',           icon: '☀️' },
};

const WMO_ICONS = {
  0:'☀️', 1:'🌤', 2:'⛅', 3:'☁️', 45:'🌫', 48:'🌫',
  51:'🌦', 53:'🌦', 55:'🌧', 61:'🌧', 63:'🌧', 65:'🌧',
  71:'🌨', 73:'🌨', 75:'❄️', 80:'🌦', 81:'🌧', 82:'⛈',
  95:'⛈', 96:'⛈', 99:'⛈',
};

const TRIP_DATES = { start: '2026-06-19', end: '2026-06-24' };
const FORECAST_DAYS = 16;

const RESERVATION_ITEMS = [
  { id: 'res1', title: 'Maroon Bells — Round Trip Shuttle', category: 'Hiking',    date: 'June 22, 2026',   refNote: '9:15 AM depart Aspen Highlands · visitmaroonbells.com', status: 'confirmed', pdfPath: './assets/r8xKq2mP/CMBR.pdf',  pdfLabel: 'View Ticket' },
  { id: 'res2', title: 'Pikes Peak Cog Railway',            category: 'Train',     date: 'June 20, 2026',   refNote: '9:05 AM · Car 1, Row 15, Seats A · B · C',             status: 'confirmed', pdfPath: './assets/r8xKq2mP/PPCRT.pdf', pdfLabel: 'View Ticket' },
  { id: 'res3', title: 'Quality Inn & Suites Denver Airport', category: 'Hotel',   date: 'Jun 19, 2026',    refNote: 'Expedia Conf: 73462444560278 · 6890 Tower Rd',          status: 'confirmed', imgPath: './assets/r8xKq2mP/ExQID.png' },
  { id: 'res4', title: 'Academy Hotel Colorado Springs',    category: 'Hotel',     date: 'Jun 20, 2026',    refNote: 'Expedia Conf: 73462463671459 · 8110 N Academy Blvd',    status: 'confirmed', imgPath: './assets/r8xKq2mP/TAHCS.png' },
  { id: 'res5', title: 'Residence Inn Glenwood Springs',    category: 'Hotel',     date: 'Jun 21-23, 2026', refNote: 'Expedia Conf: 73462520918893 · 125 Wulfsohn Rd',        status: 'confirmed', imgPath: './assets/r8xKq2mP/RIMGS.png' },
  { id: 'res6', title: 'Glenwood Hot Springs Resort',       category: 'Hotel',     date: 'Jun 23-24, 2026', refNote: 'Conf: 1042873 · 415 E 6th St · 1-800-537-7946',        status: 'confirmed', imgPath: './assets/r8xKq2mP/PGHSL.png' },
  { id: 'res7', title: 'Blue Sky Adventures — Rafting',     category: 'Activity',  date: 'June 23, 2026',   refNote: '9:00 AM · Half-day Shoshone Rapids · Class III',        status: 'book-now',  bookingUrl: 'https://blueskyrafting.com' },
];

// Maps each trip day number to its canonical Eats location-tab value
const TRIP_DAY_TO_LOCATION = {
  1: 'Denver Area',
  2: 'Colorado Springs',
  3: 'Glenwood Springs',
  4: 'Aspen',
  5: 'Glenwood Springs',
  6: 'Denver Area',
};

const SORT_OPTIONS = [
  { key: 'score-desc',  label: 'Trip Score (high → low)' },
  { key: 'google-desc', label: 'Google Rating (high → low)' },
  { key: 'yelp-desc',   label: 'Yelp Rating (high → low)' },
  { key: 'reviews-desc',label: 'Most Reviewed' },
  { key: 'price-asc',   label: 'Price ($ → $$$$)' },
  { key: 'price-desc',  label: 'Price ($$$$ → $)' },
  { key: 'distance',    label: 'Closest to Me' },
];

const CUISINE_ICONS = {
  indian: '🍛', mexican: '🌮', pizza: '🍕', italian: '🍝', thai: '🍜',
  american: '🍔', breakfast: '🥞', cafe: '☕', bakery: '🥐', seafood: '🦞',
  bbq: '🍖', asian: '🥢', vegetarian: '🥗', vegan: '🌱', mediterranean: '🥙',
  steakhouse: '🥩', dessert: '🍰', brewery: '🍺', sandwich: '🥪',
};

const CUISINE_COLORS = {
  indian: '#e08a3c', mexican: '#5cb85c', pizza: '#d9534f', italian: '#5cb85c',
  thai: '#9b59b6', american: '#4a90d9', breakfast: '#f0ad4e', cafe: '#a0785a',
  bakery: '#e0a070', seafood: '#4ab8d8', bbq: '#b8542e', asian: '#9b59b6',
  vegetarian: '#5cb85c', vegan: '#5cb85c', mediterranean: '#4ab8d8',
  steakhouse: '#b8542e', dessert: '#e88ab0', brewery: '#c8973a', sandwich: '#a0785a',
};

const PREFERRED_CUISINES = ['Indian', 'Mexican', 'Pizza', 'Italian', 'Thai'];

// ── State ──────────────────────────────────────────────────────────────────

let state = {
  currentTab: 'itinerary',
  itineraryData: null,
  packingData: null,
  weatherCache: {},
  userLocation: null,
  resSessionValid: false,
};

let eatsState = {
  restaurants: [],
  cuisine: 'all',
  location: 'all',
  search: '',
  sort: 'score-desc',
  sortPanelOpen: false,
};

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupOfflineDetection();
  setupFAB();

  await Promise.all([
    loadItinerary(),
    loadPacking(),
  ]);

  setupReservations();
  setupInstallPrompt();
});

// ── Navigation ─────────────────────────────────────────────────────────────

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      if (btn.dataset.tab === 'reservations') setTimeout(checkResAuth, 50);
    });
  });

  // Delegated handler for Book Now chips (avoids inline onclick in innerHTML)
  document.getElementById('main-content').addEventListener('click', e => {
    const chip = e.target.closest('.status-book-now[data-url]');
    if (chip && chip.dataset.url) window.open(chip.dataset.url, '_blank', 'noopener,noreferrer');
  });
}

function switchTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.nav-item').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.querySelectorAll('.tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === `tab-${tab}`)
  );
  document.getElementById('main-content').scrollTop = 0;

  if (tab === 'ask') {
    if (!askInitialized) {
      initAskTab();
      askInitialized = true;
    } else {
      updateAskContextPill();
    }
  }

  if (tab === 'eats' && !eatsInitialized) {
    eatsInitialized = true;
    initEatsTab();
  }
}

// ── Offline Detection ──────────────────────────────────────────────────────

function setupOfflineDetection() {
  const pill = document.getElementById('offline-indicator');
  const update = () => pill.classList.toggle('hidden', navigator.onLine);
  update();
  window.addEventListener('online',  update);
  window.addEventListener('offline', update);
}

// ── FAB ────────────────────────────────────────────────────────────────────

function setupFAB() {
  const fab = document.getElementById('fab-btn');
  fab.addEventListener('click', () => {
    if (state.currentTab === 'itinerary') openModal('modal-add-itinerary');
    else if (state.currentTab === 'eats')  openModal('modal-add-eats');
    else if (state.currentTab === 'pack')  promptAddPackItem();
    else if (state.currentTab === 'ask') {
      // Focus the ask input so the user can start typing immediately
      const askInput = document.getElementById('ask-input');
      if (askInput) { askInput.focus(); askInput.scrollIntoView({ behavior: 'smooth' }); }
    }
  });

  document.getElementById('btn-cancel-itinerary').addEventListener('click', () => closeModal('modal-add-itinerary'));
  document.getElementById('btn-cancel-eats').addEventListener('click', () => closeModal('modal-add-eats'));

  document.getElementById('form-add-itinerary').addEventListener('submit', e => {
    e.preventDefault();
    saveUserItineraryItem();
    closeModal('modal-add-itinerary');
  });

  document.getElementById('form-add-eats').addEventListener('submit', e => {
    e.preventDefault();
    saveUserEatsItem();
    closeModal('modal-add-eats');
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        if (modal.id === 'modal-pdf') closePdfViewer();
        else closeModal(modal.id);
      }
    });
  });

  document.getElementById('btn-close-lightbox').addEventListener('click', () => closeModal('modal-lightbox'));

  document.getElementById('btn-close-pdf').addEventListener('click', closePdfViewer);
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.style.overflow = '';
}

function closePdfViewer() {
  closeModal('modal-pdf');
  // 'about:blank' actually clears the frame — an empty src resolves to the
  // current document's URL and reloads the app inside the iframe.
  document.getElementById('pdf-frame').src = 'about:blank';
}

// ── Itinerary ──────────────────────────────────────────────────────────────

async function loadItinerary() {
  try {
    const res = await fetch('./data/itinerary.json');
    state.itineraryData = await res.json();
    window.ITINERARY_DAYS = state.itineraryData.days;
    renderItinerary();
  } catch(e) {
    document.getElementById('itinerary-days').innerHTML = '<p style="padding:20px;color:var(--sub-lite)">Failed to load itinerary.</p>';
  }
}

function renderItinerary() {
  buildWeatherStrip();
  const { days } = state.itineraryData;
  const container = document.getElementById('itinerary-days');
  const today = getTodayMDT();
  const userAdditions = getUserAdditions();

  container.innerHTML = '';
  days.forEach(day => {
    const isToday = day.date === today;
    const isTrip = day.date >= '2026-06-19' && day.date <= '2026-06-24';
    const additions = (userAdditions[day.day] || []);
    const el = buildDayCard(day, isToday, additions);
    container.appendChild(el);

    // Auto-expand today or Day 1 if before trip
    if (isToday || (!isTrip && day.day === 1 && !document.querySelector('.day-card.expanded'))) {
      el.classList.add('expanded');
    }
  });

  // If no day was auto-expanded (pre-trip), expand Day 1
  if (!document.querySelector('.day-card.expanded')) {
    const first = container.querySelector('.day-card');
    if (first) first.classList.add('expanded');
  }

  // Fetch weather for all days
  days.forEach(day => fetchAndDisplayWeather(day));
}

function buildDayCard(day, isToday, userAdditions) {
  const card = document.createElement('div');
  card.className = 'day-card';
  card.dataset.day = day.day;

  const badgeClass = `badge-${day.badgeColor}`;

  // Merge and sort activities
  const allActivities = mergeActivities(day.activities || [], userAdditions);

  card.innerHTML = `
    <div class="day-card-header">
      <div class="day-number">${day.day}</div>
      <div class="day-header-info">
        <div class="day-date">${day.dayOfWeek}, ${formatDate(day.date)}${isToday ? ' <span style="color:var(--gold);font-size:9px;background:rgba(200,151,58,0.15);padding:1px 5px;border-radius:4px;vertical-align:middle">TODAY</span>' : ''}</div>
        <div class="day-title">${day.title}</div>
      </div>
      <div class="day-header-right">
        <span class="day-badge ${badgeClass}">${day.badge}</span>
        <span class="day-weather-chip" id="weather-${day.day}"><span class="weather-loading">⟳ loading</span></span>
      </div>
      <svg class="day-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="day-card-body">
      ${buildHotelStrip(day.hotel)}
      ${buildTimeline(allActivities)}
    </div>
  `;

  card.querySelector('.day-card-header').addEventListener('click', () => {
    card.classList.toggle('expanded');
  });

  return card;
}

function buildHotelStrip(hotel) {
  if (!hotel || !hotel.name || hotel.nights === 0) return '';
  const mapLink = hotel.address ? `<a href="${mapsLink(hotel.address)}" target="_blank" rel="noopener" class="activity-address">📍 ${hotel.address}</a>` : '';
  const phone = hotel.phone ? `<br><a href="tel:${hotel.phone}" class="btn-mini" style="display:inline-flex;margin-top:4px;text-decoration:none">📞 ${hotel.phone}</a>` : '';
  const conf = hotel.confirmationNumber ? `<br><span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--gold)">Conf: ${hotel.confirmationNumber}</span>` : '';
  const notes = hotel.notes ? `<div class="hotel-notes">${hotel.notes}</div>` : '';
  return `
    <div class="day-hotel-strip">
      <div class="hotel-name">🏨 ${hotel.name}</div>
      <div class="hotel-meta">Check-in: ${hotel.checkIn}${hotel.nights > 0 ? ` · ${hotel.nights} night${hotel.nights>1?'s':''}` : ''}</div>
      ${mapLink}${phone}${conf}
      ${notes}
    </div>
  `;
}

function buildTimeline(activities) {
  if (!activities || activities.length === 0) return '';
  let html = '<div class="timeline">';

  activities.forEach((act, i) => {
    if (act.type === 'drive-connector') {
      html += `
        <div class="drive-connector">
          <span class="drive-connector-text">🚗 ${act.duration}${act.distance ? ` · ${act.distance}` : ''}${act.via ? ` · ${act.via}` : ''}</span>
        </div>
      `;
      return;
    }

    const isLast = i === activities.length - 1;
    const dotClass = getDotClass(act);
    const statusHtml = buildStatusChip(act);
    const flagHtml = buildFlag(act.flag);
    const tipsHtml = buildTips(act.tips);
    const addressHtml = act.address && act.type !== 'drive'
      ? `<a href="${mapsLink(act.address, act.lat, act.lon)}" target="_blank" rel="noopener" class="activity-address">📍 ${act.address}</a>`
      : '';

    const btns = buildActivityBtns(act);

    const userTag = act._userAdded ? '<span class="user-added-tag">✦ Added</span>' : '';

    html += `
      <div class="timeline-node">
        <div class="timeline-left">
          <div class="timeline-dot ${dotClass}"></div>
          ${!isLast ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-content">
          <div class="activity-header">
            ${act.time ? `<span class="activity-time">${act.time}</span>` : ''}
            <span class="activity-title">${act.icon || ''} ${act._userAdded ? escapeHtml(act.title) : act.title}${userTag}</span>
            ${statusHtml}
          </div>
          ${act.description ? `<div class="activity-body">${act._userAdded ? escapeHtml(act.description) : act.description}</div>` : ''}
          ${addressHtml}
          ${act.cost ? `<div class="activity-body" style="margin-top:2px">💰 ${act.cost}</div>` : ''}
          ${act.driveInfo ? `<div class="activity-drive-info">🚗 ${act.driveInfo.duration}${act.driveInfo.via ? ` · ${act.driveInfo.via}` : ''}</div>` : ''}
          ${btns}
          ${tipsHtml}
          ${flagHtml}
        </div>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

function getDotClass(act) {
  if (!act.bookingStatus) return '';
  if (act.bookingStatus === 'book-now')  return 'dot-gold';
  if (act.bookingStatus === 'confirmed') return '';
  if (act.type === 'flight')             return 'dot-sky';
  if (act.flag?.type === 'critical')     return 'dot-red';
  return '';
}

function buildStatusChip(act) {
  const s = act.bookingStatus;
  if (!s) return '';
  const labels = {
    'confirmed':  '<span class="status-chip status-confirmed">✓ Confirmed</span>',
    'book-now':   `<span class="status-chip status-book-now" data-url="${act.bookingUrl||''}" role="button" tabindex="0">⚡ Book Now</span>`,
    'optional':   '<span class="status-chip status-optional">Optional</span>',
    'free':       '<span class="status-chip status-free">Free Entry</span>',
    'included':   '<span class="status-chip status-included">✓ Included</span>',
  };
  return labels[s] || '';
}

function buildStatusChipFromString(s) {
  if (!s) return '';
  const map = {
    'confirmed': '<span class="status-chip status-confirmed">✓ Confirmed</span>',
    'book-now':  '<span class="status-chip status-book-now">⚡ Book Now</span>',
    'optional':  '<span class="status-chip status-optional">Optional</span>',
    'free':      '<span class="status-chip status-free">Free</span>',
    'included':  '<span class="status-chip status-included">✓ Included</span>',
  };
  return map[s] || '';
}

function buildFlag(flag) {
  if (!flag) return '';
  return `<div class="activity-flag flag-${flag.type}"><span>${flag.text}</span></div>`;
}

function buildTips(tips) {
  if (!tips || tips.length === 0) return '';
  const items = tips.map(t => `<li>${t}</li>`).join('');
  return `<ul class="activity-tips">${items}</ul>`;
}

function buildActivityBtns(act) {
  const btns = [];
  if (act.phone) {
    btns.push(`<a href="tel:${act.phone}" class="btn-mini">📞 Call</a>`);
  }
  if (act.website) {
    btns.push(`<a href="${act.website}" target="_blank" rel="noopener" class="btn-mini">🌐 Web</a>`);
  }
  if (act.bookingStatus === 'book-now' && act.bookingUrl) {
    btns.push(`<a href="${act.bookingUrl}" target="_blank" rel="noopener" class="btn-mini gold">⚡ Book</a>`);
  }
  return btns.length ? `<div class="activity-btns">${btns.join('')}</div>` : '';
}

function mergeActivities(staticActs, userAdds) {
  const all = [...staticActs, ...userAdds.map(a => ({ ...a, _userAdded: true }))];
  // Sort by time (drive-connectors stay after their preceding item)
  return all.sort((a, b) => {
    if (a.type === 'drive-connector' || b.type === 'drive-connector') return 0;
    const ta = parseTime(a.time || '');
    const tb = parseTime(b.time || '');
    return ta - tb;
  });
}

function parseTime(t) {
  if (!t) return 9999;
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!m) return 9999;
  let h = parseInt(m[1]), min = parseInt(m[2]);
  const ampm = (m[3] || '').toUpperCase();
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  // Treat times like 12:15 AM as next-day (after midnight)
  if (ampm === 'AM' && h < 6) h += 24;
  return h * 60 + min;
}

// ── Weather ────────────────────────────────────────────────────────────────

async function fetchAndDisplayWeather(day) {
  const chip = document.getElementById(`weather-${day.day}`);
  if (!chip) return;

  const locKey = day.weatherLocationKey;
  const loc = DAY_LOCATIONS[locKey];
  if (!loc) return;

  const now = Date.now();
  const tripStart = new Date('2026-06-19T00:00:00-06:00').getTime();
  const daysUntilTrip = (tripStart - now) / (24 * 60 * 60 * 1000);
  const tripDate = new Date(loc.date + 'T12:00:00-06:00');
  const isToday = new Date().toLocaleDateString('en-CA', {timeZone:'America/Denver'}) === loc.date;

  // Mode 1: > 16 days before trip start
  if (daysUntilTrip > 16) {
    const avg = JUNE_AVERAGES[locKey];
    const hiC = Math.round((avg.hi - 32) * 5/9);
    chip.innerHTML = `${avg.icon} ${hiC}°C (${avg.hi}°F)`;
    chip.title = `June average · ${avg.desc}`;
    return;
  }

  // Mode 2 & 3: within 16 days — try forecast
  const cacheKey = `weather_${locKey}_${loc.date}`;
  const cached = getWeatherCache(cacheKey);
  if (cached) {
    chip.innerHTML = renderWeatherChip(cached, isToday);
    return;
  }

  // Only fetch future or current dates (Open-Meteo allows up to 16 days ahead)
  const today = new Date();
  if (tripDate < today - 24*60*60*1000) {
    // Past date — show historical average
    const avg = JUNE_AVERAGES[locKey];
    const hiC = Math.round((avg.hi - 32) * 5/9);
    chip.innerHTML = `${avg.icon} ${hiC}°C (${avg.hi}°F)`;
    return;
  }

  chip.innerHTML = '<span class="weather-loading">⟳</span>';

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=celsius&timezone=America%2FDenver&start_date=${loc.date}&end_date=${loc.date}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.daily || !data.daily.temperature_2m_max[0]) {
      throw new Error('No data');
    }

    const weather = {
      hiC: Math.round(data.daily.temperature_2m_max[0]),
      loC: Math.round(data.daily.temperature_2m_min[0]),
      hiF: Math.round(data.daily.temperature_2m_max[0] * 9/5 + 32),
      loF: Math.round(data.daily.temperature_2m_min[0] * 9/5 + 32),
      code: data.daily.weathercode[0],
    };

    setWeatherCache(cacheKey, weather);
    chip.innerHTML = renderWeatherChip(weather, isToday);
  } catch(e) {
    const avg = JUNE_AVERAGES[locKey];
    const hiC = Math.round((avg.hi - 32) * 5/9);
    chip.innerHTML = `${avg.icon} ${hiC}°C (${avg.hi}°F)`;
  }
}

function renderWeatherChip(w, isToday) {
  const icon = WMO_ICONS[w.code] || '🌤';
  return `${icon} ${w.hiC}°C (${w.hiF}°F)`;
}

// ── Destination Weather Strip ───────────────────────────────────────────────

function buildWeatherStrip() {
  const strip = document.getElementById('weather-strip');
  if (!strip || strip.dataset.built === '1') return;
  strip.dataset.built = '1';

  strip.innerHTML = WEATHER_SPOTS.map(sp => {
    const d = new Date(sp.date + 'T12:00:00');
    const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Denver' });
    return `
      <div class="wspot-card">
        <div class="wspot-name">${sp.name}</div>
        <div class="wspot-date">${dayLabel}</div>
        <div class="wspot-icon" id="wspot-icon-${sp.id}">⟳</div>
        <div class="wspot-hi"  id="wspot-hi-${sp.id}">—</div>
        <div class="wspot-lo"  id="wspot-lo-${sp.id}">—</div>
      </div>`;
  }).join('');

  WEATHER_SPOTS.forEach(sp => fetchSpotWeather(sp));
}

async function fetchSpotWeather(sp) {
  const iconEl = document.getElementById(`wspot-icon-${sp.id}`);
  const hiEl   = document.getElementById(`wspot-hi-${sp.id}`);
  const loEl   = document.getElementById(`wspot-lo-${sp.id}`);
  if (!iconEl) return;

  const now        = Date.now();
  const tripStart  = new Date('2026-06-19T00:00:00-06:00').getTime();
  const daysUntil  = (tripStart - now) / 86400000;

  function showAvg() {
    const hiC = Math.round((sp.avgHi - 32) * 5/9);
    const loC = Math.round((sp.avgLo - 32) * 5/9);
    iconEl.textContent = '🌤';
    if (hiEl) hiEl.textContent = `${sp.avgHi}°F / ${hiC}°C`;
    if (loEl) loEl.textContent = `Lo ${sp.avgLo}°F`;
  }

  if (daysUntil > 16) { showAvg(); return; }

  const cacheKey = `wspot_${sp.id}_${sp.date}`;
  const cached   = getWeatherCache(cacheKey);
  if (cached) { renderSpotCard(cached, iconEl, hiEl, loEl); return; }

  const tripDate = new Date(sp.date + 'T12:00:00-06:00');
  if (tripDate < new Date(now - 86400000)) { showAvg(); return; }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${sp.lat}&longitude=${sp.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=America%2FDenver&start_date=${sp.date}&end_date=${sp.date}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (!data.daily?.temperature_2m_max?.[0]) throw new Error('no data');
    const w = {
      hiF: Math.round(data.daily.temperature_2m_max[0]),
      loF: Math.round(data.daily.temperature_2m_min[0]),
      hiC: Math.round((data.daily.temperature_2m_max[0] - 32) * 5/9),
      loC: Math.round((data.daily.temperature_2m_min[0] - 32) * 5/9),
      code: data.daily.weathercode[0],
    };
    setWeatherCache(cacheKey, w);
    renderSpotCard(w, iconEl, hiEl, loEl);
  } catch(e) { showAvg(); }
}

function renderSpotCard(w, iconEl, hiEl, loEl) {
  iconEl.textContent = WMO_ICONS[w.code] || '🌤';
  if (hiEl) hiEl.textContent = `${w.hiF}°F / ${w.hiC}°C`;
  if (loEl) loEl.textContent = `Lo ${w.loF}°F`;
}

function getWeatherCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > 3 * 60 * 60 * 1000) return null; // 3hr TTL
    return data;
  } catch { return null; }
}

function setWeatherCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// ── User Itinerary Additions ───────────────────────────────────────────────

function getUserAdditions() {
  try { return JSON.parse(localStorage.getItem('user_itinerary_additions') || '{}'); }
  catch { return {}; }
}

function saveUserItineraryItem() {
  const day     = parseInt(document.getElementById('add-day').value);
  const time    = document.getElementById('add-time').value;
  const title   = document.getElementById('add-title').value.trim();
  const desc    = document.getElementById('add-description').value.trim();
  const address = document.getElementById('add-address').value.trim();
  const notes   = document.getElementById('add-notes').value.trim();
  const status  = document.getElementById('add-status').value;

  if (!title) return;

  const additions = getUserAdditions();
  if (!additions[day]) additions[day] = [];

  const t24 = time ? convertTo12h(time) : '';
  additions[day].push({ id: `user-${Date.now()}`, time: t24, title, description: (desc + (notes ? ' — '+notes : '')).trim(), address, bookingStatus: status, icon: '✦' });

  localStorage.setItem('user_itinerary_additions', JSON.stringify(additions));
  document.getElementById('form-add-itinerary').reset();
  renderItinerary();
}

function convertTo12h(t24) {
  const [h, m] = t24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

// ── Restaurants / Eats ─────────────────────────────────────────────────────

async function initEatsTab() {
  try {
    const res = await fetch('./data/restaurants.json');
    const data = await res.json();
    eatsState.restaurants = [...(data.restaurants || []), ...getUserEatsItems()];
  } catch (e) {
    document.getElementById('eats-grid').innerHTML = '<div class="eats-empty">Failed to load restaurant data.</div>';
    return;
  }

  buildCuisineChips();
  buildLocationTabs();
  autoSelectTodayLocation();
  setupEatsListeners();
  renderSmartHeader();
  rerenderEatsGrid();
}

function setupEatsListeners() {
  // Search
  const searchInput = document.getElementById('eats-search-input');
  const clearBtn = document.getElementById('eats-search-clear');
  searchInput.addEventListener('input', e => {
    eatsState.search = e.target.value.trim().toLowerCase();
    clearBtn.hidden = !eatsState.search;
    rerenderEatsGrid();
  });
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    eatsState.search = '';
    clearBtn.hidden = true;
    rerenderEatsGrid();
  });

  // Cuisine chips (delegated)
  document.getElementById('eats-cuisine-chips').addEventListener('click', e => {
    const chip = e.target.closest('.cuisine-chip');
    if (!chip) return;
    document.querySelectorAll('#eats-cuisine-chips .cuisine-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    eatsState.cuisine = chip.dataset.cuisine;
    rerenderEatsGrid();
  });

  // Location tabs
  document.getElementById('eats-location-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.loc-tab');
    if (!tab) return;
    document.querySelectorAll('#eats-location-tabs .loc-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    eatsState.location = tab.dataset.loc;
    rerenderEatsGrid();
  });

  // Sort toggle + panel
  const sortToggle = document.getElementById('eats-sort-toggle');
  const sortPanel = document.getElementById('eats-sort-panel');
  sortToggle.addEventListener('click', () => {
    eatsState.sortPanelOpen = !eatsState.sortPanelOpen;
    if (eatsState.sortPanelOpen) renderSortPanel();
    sortPanel.classList.toggle('hidden', !eatsState.sortPanelOpen);
  });
  document.addEventListener('click', e => {
    if (eatsState.sortPanelOpen && !sortPanel.contains(e.target) && e.target !== sortToggle) {
      eatsState.sortPanelOpen = false;
      sortPanel.classList.add('hidden');
    }
  });
  sortPanel.addEventListener('click', e => {
    const opt = e.target.closest('[data-sort]');
    if (!opt) return;
    const key = opt.dataset.sort;
    if (key === 'distance') {
      requestEatsGeolocation(() => {
        eatsState.sort = 'distance';
        renderSortPanel();
        rerenderEatsGrid();
      });
      return;
    }
    eatsState.sort = key;
    renderSortPanel();
    eatsState.sortPanelOpen = false;
    sortPanel.classList.add('hidden');
    rerenderEatsGrid();
  });

  // Grid card taps -> bottom sheet
  document.getElementById('eats-grid').addEventListener('click', e => {
    const card = e.target.closest('.rest-card');
    if (!card) return;
    openBottomSheet(card.dataset.id);
  });

  // Smart carousel taps -> bottom sheet
  document.getElementById('eats-smart-header').addEventListener('click', e => {
    const card = e.target.closest('.smart-card');
    if (!card) return;
    openBottomSheet(card.dataset.id);
  });

  // Bottom sheet close
  const sheet = document.getElementById('eats-bottom-sheet');
  sheet.querySelector('.bottom-sheet__overlay').addEventListener('click', closeBottomSheet);
  setupBottomSheetSwipe();
}

function renderSortPanel() {
  const panel = document.getElementById('eats-sort-panel');
  panel.innerHTML = SORT_OPTIONS.map(opt => `
    <button class="eats-sort-option ${eatsState.sort === opt.key ? 'active' : ''}" data-sort="${opt.key}">${opt.label}</button>
  `).join('');
}

// ── Smart "For Lunch / Dinner Tonight" header ──────────────────────────────

function getSmartMealContext() {
  const hour = parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/Denver', hour: 'numeric', hour12: false }), 10);
  if (hour >= 6 && hour < 11)  return { meal: 'breakfast', label: '🥞 BREAKFAST PICKS' };
  if (hour >= 11 && hour < 16) return { meal: 'lunch',     label: '🍽 FOR LUNCH NOW' };
  if (hour >= 16 && hour < 22) return { meal: 'dinner',    label: '🌙 FOR DINNER TONIGHT' };
  return { meal: 'late', label: '🌃 LATE NIGHT EATS' };
}

function getTodayTripDayNum() {
  const today = getTodayMDT();
  for (const [day, info] of Object.entries(DAY_LOCATIONS)) {
    if (info.date === today) return parseInt(day, 10);
  }
  return null;
}

function getTodayLocation() {
  const day = getTodayTripDayNum();
  return day ? TRIP_DAY_TO_LOCATION[day] : null;
}

function getTripScore(r) {
  if (typeof r.trip_score === 'number') return r.trip_score;
  const g = r.google_rating, y = r.yelp_rating;
  if (g && y) return Math.round(((g + y) / 2) * 10) / 10;
  return g || y || 0;
}

function renderTripScore(r) {
  return r.rating_unavailable ? 'NEW' : getTripScore(r).toFixed(1);
}

function getSmartPicks() {
  const todayLoc = getTodayLocation();
  let pool = eatsState.restaurants.filter(r => !r.seasonal_warning);
  let scoped = todayLoc ? pool.filter(r => r.itinerary_location === todayLoc) : pool;
  if (scoped.length < 3) scoped = pool;
  return [...scoped].sort((a, b) => getTripScore(b) - getTripScore(a)).slice(0, 5);
}

function renderSmartHeader() {
  const el = document.getElementById('eats-smart-header');
  const picks = getSmartPicks();
  if (!picks.length) { el.innerHTML = ''; return; }
  const ctx = getSmartMealContext();
  el.innerHTML = `
    <div class="eats-smart-label">${ctx.label}</div>
    <div class="eats-smart-carousel">
      ${picks.map((r, i) => renderSmartCard(r, i === 0)).join('')}
    </div>
  `;
}

function renderSmartCard(r, isTop) {
  return `
    <div class="smart-card ${isTop ? 'smart-card--top' : ''}" data-id="${r.id}">
      ${isTop ? '<div class="smart-card__crown">TOP PICK</div>' : ''}
      <div class="smart-card__score">★ ${renderTripScore(r)}</div>
      <div class="smart-card__name">${escapeHtml(r.name)}</div>
      <div class="smart-card__meta">${escapeHtml(r.price_range || '')} · ${escapeHtml((r.cuisine && r.cuisine[0]) || '')}</div>
    </div>
  `;
}

// ── Cuisine Filter Chips ───────────────────────────────────────────────────

function buildCuisineChips() {
  const counts = {};
  eatsState.restaurants.forEach(r => (r.cuisine || []).forEach(c => {
    counts[c] = (counts[c] || 0) + 1;
  }));

  const all = Object.keys(counts);
  const preferred = PREFERRED_CUISINES.filter(c => all.includes(c));
  const rest = all.filter(c => !PREFERRED_CUISINES.includes(c)).sort();
  const ordered = [...preferred, ...rest];

  const el = document.getElementById('eats-cuisine-chips');
  el.innerHTML = [
    `<button class="cuisine-chip active" data-cuisine="all">All</button>`,
    ...ordered.map(c => {
      const icon = CUISINE_ICONS[c.toLowerCase()] || '';
      return `<button class="cuisine-chip" data-cuisine="${escapeHtml(c)}">${icon ? icon + ' ' : ''}${escapeHtml(c)}</button>`;
    }),
  ].join('');
}

function getCuisineColor(cuisine) {
  if (!cuisine) return '#6a8a6a';
  return CUISINE_COLORS[cuisine.toLowerCase()] || '#6a8a6a';
}

// ── Location Tabs ───────────────────────────────────────────────────────────

function buildLocationTabs() {
  const cities = [...new Set(eatsState.restaurants.map(r => r.city).filter(Boolean))].sort();
  const el = document.getElementById('eats-location-tabs');
  el.innerHTML = [
    `<button class="loc-tab active" data-loc="all">All</button>`,
    ...cities.map(c => `<button class="loc-tab" data-loc="${escapeHtml(c)}">${escapeHtml(c)}</button>`),
  ].join('');
}

function autoSelectTodayLocation() {
  const todayLoc = getTodayLocation();
  const tabs = document.querySelectorAll('#eats-location-tabs .loc-tab');
  let target = 'all';
  if (todayLoc && [...tabs].some(t => t.dataset.loc === todayLoc)) target = todayLoc;
  tabs.forEach(t => t.classList.toggle('active', t.dataset.loc === target));
  eatsState.location = target;
}

// ── Filtering & Sorting ─────────────────────────────────────────────────────

function getSortedFilteredRestaurants() {
  const { cuisine, location, search } = eatsState;

  let list = eatsState.restaurants.filter(r => {
    if (cuisine !== 'all' && !(r.cuisine || []).includes(cuisine)) return false;
    if (location !== 'all' && r.city !== location) return false;
    if (search) {
      const haystack = `${r.name} ${(r.cuisine||[]).join(' ')} ${(r.popular_dishes||[]).map(getDishName).join(' ')} ${r.city||''} ${r.notes||''}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  return sortRestaurants(list, eatsState.sort);
}

function sortRestaurants(list, sortKey) {
  const sorted = [...list];
  switch (sortKey) {
    case 'google-desc':
      return sorted.sort((a, b) => (b.google_rating||0) - (a.google_rating||0));
    case 'yelp-desc':
      return sorted.sort((a, b) => (b.yelp_rating||0) - (a.yelp_rating||0));
    case 'reviews-desc':
      return sorted.sort((a, b) => ((b.google_review_count||0)+(b.yelp_review_count||0)) - ((a.google_review_count||0)+(a.yelp_review_count||0)));
    case 'price-asc':
      return sorted.sort((a, b) => (a.price_range||'').length - (b.price_range||'').length);
    case 'price-desc':
      return sorted.sort((a, b) => (b.price_range||'').length - (a.price_range||'').length);
    case 'distance':
      if (!state.userLocation) return sorted;
      return sorted.sort((a, b) => getDistanceToRestaurant(a) - getDistanceToRestaurant(b));
    case 'score-desc':
    default:
      return sorted.sort((a, b) => getTripScore(b) - getTripScore(a));
  }
}

function getDistanceToRestaurant(r) {
  if (!state.userLocation || !r.location) return 9999;
  const { latitude, longitude } = r.location;
  if (!latitude || !longitude) return 9999;
  return haversine(state.userLocation.lat, state.userLocation.lon, latitude, longitude);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function requestEatsGeolocation(cb) {
  if (!navigator.geolocation) { cb(); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      cb();
    },
    () => cb()
  );
}

// ── Grid Rendering ───────────────────────────────────────────────────────────

function rerenderEatsGrid() {
  const grid = document.getElementById('eats-grid');
  const countEl = document.getElementById('eats-results-count');
  const filtered = getSortedFilteredRestaurants();

  countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'PLACE' : 'PLACES'}`;

  if (!filtered.length) {
    grid.innerHTML = '<div class="eats-empty">No restaurants found.<br>Try adjusting your filters or search.</div>';
    return;
  }

  grid.innerHTML = filtered.map(renderRestaurantCard).join('');
}

function renderRestaurantCard(r) {
  const warned = !!r.seasonal_warning;
  const cuisines = (r.cuisine || []).join(' · ');
  const dish = getDishName((r.popular_dishes && r.popular_dishes[0]));
  const dot = getCuisineColor((r.cuisine && r.cuisine[0]) || '');

  return `
    <div class="rest-card ${warned ? 'rest-card--warned' : ''}" data-id="${r.id}">
      ${warned ? '<div class="rest-card__warn-strip"></div>' : ''}
      <div class="rest-card__top-row">
        <span class="rest-card__top-left">
          <span class="rest-card__dot" style="background:${dot}"></span>
          <span class="rest-card__score">★ ${renderTripScore(r)}</span>
        </span>
        ${r.city ? `<span class="rest-card__city">${escapeHtml(r.city)}</span>` : ''}
      </div>
      <div class="rest-card__name">${escapeHtml(r.name)}</div>
      <div class="rest-card__ratings">
        ${r.google_rating ? `
        <div class="rest-card__rating-row">
          <span class="rest-card__platform rest-card__platform--google">G</span>
          <span class="rest-card__stars">${renderStars(r.google_rating)}</span>
          <span class="rest-card__count">${r.google_review_count ? `(${r.google_review_count})` : ''}</span>
        </div>` : ''}
        ${r.yelp_rating ? `
        <div class="rest-card__rating-row">
          <span class="rest-card__platform rest-card__platform--yelp">Y</span>
          <span class="rest-card__stars">${renderStars(r.yelp_rating)}</span>
          <span class="rest-card__count">${r.yelp_review_count ? `(${r.yelp_review_count})` : ''}</span>
        </div>` : ''}
        ${r.rating_unavailable ? `<div class="rest-card__rating-row rest-card__no-rating">No ratings yet</div>` : ''}
      </div>
      <div class="rest-card__cuisines">${escapeHtml(cuisines)}</div>
      <div class="rest-card__footer">
        <span class="rest-card__price">${escapeHtml(r.price_range || '')}</span>
        ${r.itinerary_day ? `<span class="rest-card__day-pill">${escapeHtml(r.itinerary_day.split('-')[0].trim())}</span>` : ''}
      </div>
      ${dish ? `<div class="rest-card__dish">🍴 ${escapeHtml(dish)}</div>` : ''}
      ${warned ? `<div class="rest-card__warn-label">${escapeHtml(r.seasonal_warning_text || '⚠️ Seasonal closure — verify before visiting')}</div>` : ''}
    </div>
  `;
}

// A popular dish entry can be a plain string (legacy/user-added items)
// or an object { name, vegetarian } once classified.
function getDishName(dish) {
  if (!dish) return '';
  return typeof dish === 'string' ? dish : dish.name;
}

function renderDishChip(dish) {
  if (typeof dish === 'string') {
    return `<span class="sheet-dish-chip">${escapeHtml(dish)}</span>`;
  }
  const dot = dish.vegetarian ? '🟢' : '🔴';
  return `<span class="sheet-dish-chip">${dot} ${escapeHtml(dish.name)}</span>`;
}

function renderStars(rating) {
  if (!rating) return '';
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let out = '★'.repeat(full);
  if (half) out += '½';
  return `${out} ${rating.toFixed(1)}`;
}

// ── Bottom Sheet ─────────────────────────────────────────────────────────────

function openBottomSheet(id) {
  const r = eatsState.restaurants.find(x => String(x.id) === String(id));
  if (!r) return;
  document.getElementById('eats-sheet-content').innerHTML = renderBottomSheet(r);
  const sheet = document.getElementById('eats-bottom-sheet');
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => sheet.classList.add('bottom-sheet--open'));
}

function closeBottomSheet() {
  const sheet = document.getElementById('eats-bottom-sheet');
  sheet.classList.remove('bottom-sheet--open');
  document.body.style.overflow = '';
  setTimeout(() => { sheet.hidden = true; }, 350);
}

function setupBottomSheetSwipe() {
  const sheet = document.getElementById('eats-bottom-sheet');
  const panel = sheet.querySelector('.bottom-sheet__panel');
  let startY = 0, currentY = 0, dragging = false;

  panel.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    dragging = true;
    panel.style.transition = 'none';
  }, { passive: true });

  panel.addEventListener('touchmove', e => {
    if (!dragging) return;
    currentY = e.touches[0].clientY - startY;
    if (currentY > 0) panel.style.transform = `translateY(${currentY}px)`;
  }, { passive: true });

  panel.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    panel.style.transition = '';
    panel.style.transform = '';
    if (currentY > 100) closeBottomSheet();
    currentY = 0;
  });
}

function renderBottomSheet(r) {
  const cuisines = (r.cuisine || []).join(', ');
  const dishes = (r.popular_dishes || []).map(renderDishChip).join('');
  const address = r.full_address || '';

  const actions = [];
  if (address) actions.push(`<a href="${mapsLink(address)}" target="_blank" rel="noopener" class="sheet-btn sheet-btn--primary">📍 Maps</a>`);
  if (r.yelp_url) actions.push(`<a href="${r.yelp_url}" target="_blank" rel="noopener" class="sheet-btn sheet-btn--yelp">⭐ Yelp</a>`);
  if (r.phone) actions.push(`<a href="tel:${r.phone}" class="sheet-btn sheet-btn--call">📞 Call</a>`);

  return `
    <div class="sheet-header">
      <div class="sheet-name">${escapeHtml(r.name)}</div>
      <div class="sheet-meta">
        ${cuisines ? `<span class="sheet-cuisine-pill">${escapeHtml(cuisines)}</span>` : ''}
        ${r.price_range ? `<span class="sheet-price">${escapeHtml(r.price_range)}</span>` : ''}
        ${r.city ? `<span class="sheet-day">${escapeHtml(r.city)}</span>` : ''}
        ${r.itinerary_day ? `<span class="sheet-day">${escapeHtml(r.itinerary_day)}</span>` : ''}
      </div>
    </div>

    ${r.seasonal_warning ? `<div class="sheet-warn-box">${escapeHtml(r.seasonal_warning_text || '⚠️ Seasonal closure — verify before visiting')}</div>` : ''}

    <div class="sheet-ratings">
      ${r.google_rating ? `
      <div class="sheet-rating-block">
        <div class="sheet-rating-logo sheet-rating-logo--google">Google</div>
        <div class="sheet-rating-stars">
          <div>
            <div class="sheet-star-row">${renderStars(r.google_rating)}</div>
            <div class="sheet-rating-count">${r.google_review_count ? `${r.google_review_count} reviews` : ''}</div>
          </div>
        </div>
      </div>` : ''}
      ${r.yelp_rating ? `
      <div class="sheet-rating-divider"></div>
      <div class="sheet-rating-block">
        <div class="sheet-rating-logo sheet-rating-logo--yelp">Yelp</div>
        <div class="sheet-rating-stars">
          <div>
            <div class="sheet-star-row">${renderStars(r.yelp_rating)}</div>
            <div class="sheet-rating-count">${r.yelp_review_count ? `${r.yelp_review_count} reviews` : ''}</div>
          </div>
        </div>
      </div>` : ''}
      ${r.rating_unavailable ? `
      <div class="sheet-rating-block">
        <div class="sheet-rating-logo">Ratings</div>
        <div class="sheet-rating-count">Not yet available — verify before visiting</div>
      </div>` : ''}
      <div class="sheet-rating-divider"></div>
      <div class="sheet-rating-block">
        <div class="sheet-rating-logo">Trip Score</div>
        <div class="sheet-trip-score">${renderTripScore(r)}</div>
      </div>
    </div>

    ${address ? `
    <div class="sheet-address">
      <span class="sheet-addr-icon">📍</span>
      <a href="${mapsLink(address)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${escapeHtml(address)}</a>
    </div>` : ''}

    ${dishes ? `
    <div class="sheet-dishes">
      <div class="sheet-dishes-label">Popular Dishes</div>
      <div class="sheet-dishes-chips">${dishes}</div>
    </div>` : ''}

    ${r.notes ? `<div class="sheet-notes">${escapeHtml(r.notes)}</div>` : ''}

    <div class="sheet-actions">${actions.join('')}</div>
  `;
}

// ── User-added Restaurants ──────────────────────────────────────────────────

function getUserEatsItems() {
  try { return JSON.parse(localStorage.getItem('user_eats_items') || '[]'); }
  catch { return []; }
}

function saveUserEatsItem() {
  const name     = document.getElementById('eats-add-name').value.trim();
  const location = document.getElementById('eats-add-location').value.trim();
  const address  = document.getElementById('eats-add-address').value.trim();
  const note     = document.getElementById('eats-add-note').value.trim();
  if (!name) return;

  const items = getUserEatsItems();
  const item = {
    id: `user-${Date.now()}`,
    name,
    full_address: address,
    city: location,
    itinerary_location: 'Denver Area',
    cuisine: ['Custom'],
    price_range: '',
    google_rating: null,
    google_review_count: null,
    yelp_rating: null,
    yelp_review_count: null,
    trip_score: 0,
    popular_dishes: [],
    notes: note,
    _userAdded: true,
  };
  items.push(item);
  localStorage.setItem('user_eats_items', JSON.stringify(items));
  document.getElementById('form-add-eats').reset();

  if (eatsInitialized) {
    eatsState.restaurants.push(item);
    if (!eatsState.restaurants.some(r => (r.cuisine||[]).includes('Custom'))) buildCuisineChips();
    rerenderEatsGrid();
  }
}

// ── Reservations ───────────────────────────────────────────────────────────

function setupReservations() {
  const hasSetup = localStorage.getItem('res_setup_done');

  // Show correct initial screen
  if (!hasSetup) {
    showScreen('res-setup-screen');
  } else if (isResSessionValid()) {
    showScreen('res-content');
    renderReservations();
  } else {
    showScreen('res-auth-screen');
  }

  // Auth screen buttons
  document.getElementById('btn-faceid').addEventListener('click', attemptFaceID);
  document.getElementById('btn-show-pin').addEventListener('click', () => showScreen('res-pin-screen'));

  // Setup screen
  document.getElementById('btn-setup-faceid').addEventListener('click', setupFaceID);
  buildPinPad('setup-pin-pad', onSetupPinComplete);
  buildPinPad('auth-pin-pad', onAuthPinDigit);

  // Lock button
  document.getElementById('btn-lock').addEventListener('click', lockReservations);
}

function checkResAuth() {
  const hasSetup = localStorage.getItem('res_setup_done');
  if (!hasSetup) {
    showScreen('res-setup-screen');
  } else if (isResSessionValid()) {
    showScreen('res-content');
    renderReservations();
  } else {
    showScreen('res-auth-screen');
    // Auto-try Face ID
    if (isWebAuthnSupported() && localStorage.getItem('biometric_credential_id')) {
      setTimeout(attemptFaceID, 300);
    }
  }
}

function showScreen(id) {
  ['res-auth-screen','res-setup-screen','res-pin-screen','res-content'].forEach(sid => {
    const el = document.getElementById(sid);
    if (el) el.classList.toggle('hidden', sid !== id);
  });
}

async function setupFaceID() {
  if (!isWebAuthnSupported()) {
    showScreen('res-pin-screen');
    return;
  }
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'Colorado 2026', id: window.location.hostname },
        user: { id: new Uint8Array(16), name: 'family', displayName: 'Family' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
      }
    });
    const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    localStorage.setItem('biometric_credential_id', credId);
    localStorage.setItem('biometric_registered', 'true');

    // Face ID alone isn't enough — a PIN is still required as a backup
    // (e.g. if biometrics fail or the device changes), so prompt for one.
    const faceBtn = document.getElementById('btn-setup-faceid');
    if (faceBtn) {
      faceBtn.disabled = true;
      faceBtn.textContent = '✓ Face ID enabled';
    }
    showPinSetupFlow();
  } catch(e) {
    // Fall back to PIN setup
    showPinSetupFlow();
  }
}

function showPinSetupFlow() {
  const setupSection = document.querySelector('.pin-setup-section');
  if (setupSection) setupSection.style.display = 'block';
}

let setupPinBuffer = '';
function onSetupPinComplete(digit) {
  if (digit === 'del') {
    setupPinBuffer = setupPinBuffer.slice(0, -1);
  } else {
    if (setupPinBuffer.length >= 6) return;
    setupPinBuffer += digit;
  }
  updatePinDisplay('setup-pin-display', setupPinBuffer);

  if (setupPinBuffer.length === 6) {
    setTimeout(async () => {
      const hash = await hashPin(setupPinBuffer);
      localStorage.setItem('res_pin_hash', hash);
      localStorage.setItem('res_setup_done', 'true');
      setupPinBuffer = '';
      updatePinDisplay('setup-pin-display', '');
      grantResAccess();
    }, 200);
  }
}

async function attemptFaceID() {
  if (!isWebAuthnSupported()) {
    showScreen('res-pin-screen');
    return;
  }
  const credIdStr = localStorage.getItem('biometric_credential_id');
  if (!credIdStr) {
    showScreen('res-pin-screen');
    return;
  }
  try {
    const credId = Uint8Array.from(atob(credIdStr), c => c.charCodeAt(0));
    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: 'public-key', id: credId }],
        userVerification: 'required',
        timeout: 60000,
      }
    });
    grantResAccess();
  } catch(e) {
    showScreen('res-pin-screen');
  }
}

let authPinBuffer = '';
let pinAttempts = 0;
let pinLockUntil = 0;

function onAuthPinDigit(digit) {
  const now = Date.now();
  if (now < pinLockUntil) {
    const secs = Math.ceil((pinLockUntil - now) / 1000);
    document.getElementById('pin-error-msg').textContent = `Locked for ${secs}s`;
    return;
  }

  if (digit === 'del') {
    authPinBuffer = authPinBuffer.slice(0, -1);
  } else {
    if (authPinBuffer.length >= 6) return;
    authPinBuffer += digit;
  }
  updatePinDisplay('auth-pin-display', authPinBuffer, false);

  if (authPinBuffer.length === 6) {
    setTimeout(async () => {
      const entered = authPinBuffer;
      authPinBuffer = '';
      updatePinDisplay('auth-pin-display', '');

      const hash = await hashPin(entered);
      const storedHash = localStorage.getItem('res_pin_hash');
      const correct = !!storedHash && hash === storedHash;

      if (correct) {
        pinAttempts = 0;
        document.getElementById('pin-error-msg').textContent = '';
        grantResAccess();
      } else {
        pinAttempts++;
        updatePinDisplay('auth-pin-display', '------', true); // error flash
        setTimeout(() => updatePinDisplay('auth-pin-display', ''), 400);

        if (pinAttempts >= 3) {
          pinLockUntil = Date.now() + 5 * 60 * 1000;
          pinAttempts = 0;
          document.getElementById('pin-error-msg').textContent = 'Too many attempts. Locked 5 min.';
        } else {
          document.getElementById('pin-error-msg').textContent = `Wrong PIN (${3 - pinAttempts} attempts left)`;
        }
      }
    }, 200);
  }
}

function updatePinDisplay(displayId, value, isError = false) {
  const display = document.getElementById(displayId);
  if (!display) return;
  display.querySelectorAll('.pin-dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < value.length && !isError);
    dot.classList.toggle('error', isError);
  });
}

function buildPinPad(padId, callback) {
  const pad = document.getElementById(padId);
  if (!pad) return;
  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];
  pad.innerHTML = '';
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pin-key${k === '' ? ' empty' : ''}${k === 'del' ? ' del' : ''}`;
    btn.textContent = k === 'del' ? '⌫' : k;
    if (k !== '') btn.addEventListener('click', () => callback(k));
    pad.appendChild(btn);
  });
}

async function hashPin(pin) {
  const enc = new TextEncoder().encode('colorado-2026-' + pin);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function grantResAccess() {
  const expiry = Date.now() + 4 * 60 * 60 * 1000;
  localStorage.setItem('reservation_session', JSON.stringify({ expiry }));
  showScreen('res-content');
  renderReservations();
}

function isResSessionValid() {
  try {
    const s = JSON.parse(localStorage.getItem('reservation_session') || '{}');
    return s.expiry && Date.now() < s.expiry;
  } catch { return false; }
}

function lockReservations() {
  localStorage.removeItem('reservation_session');
  showScreen('res-auth-screen');
}

function isWebAuthnSupported() {
  return !!(window.PublicKeyCredential && navigator.credentials && navigator.credentials.create);
}

function renderReservations() {
  const container = document.getElementById('reservations-list');
  container.innerHTML = '';

  RESERVATION_ITEMS.forEach(item => {
    const card = buildResCard(item);
    container.appendChild(card);
  });
}

function buildResCard(item) {
  const card = document.createElement('div');
  card.className = 'res-card';

  const statusChip = buildStatusChipFromString(item.status);
  const storedImg = localStorage.getItem(`reservation_img_${item.id}`);

  // Priority: user-uploaded > pre-built imgPath > upload prompt (if no pdfPath/imgPath)
  // data-res-id only — image src is resolved at click time from RESERVATION_ITEMS, not DOM
  const hasImg = !!(storedImg || item.imgPath);
  const imgHtml = hasImg
    ? `<img src="${storedImg || item.imgPath}" class="res-img-thumb" alt="Confirmation" data-res-id="${item.id}">`
    : (item.pdfPath ? '' : `<label class="res-upload-btn">
         📤 Add confirmation photo / PDF
         <input type="file" class="res-upload-input" accept="image/*,application/pdf" data-res-id="${item.id}">
       </label>`);

  const bookBtn = (item.status === 'book-now' && item.bookingUrl)
    ? `<a href="${item.bookingUrl}" target="_blank" rel="noopener" class="btn-mini gold">⚡ Book Now</a>`
    : '';

  // Use res-id only — asset path never written to DOM attributes
  const pdfBtn = item.pdfPath
    ? `<button type="button" class="btn-mini gold btn-view-pdf" data-res-id="${item.id}">📄 ${item.pdfLabel || 'View Ticket'}</button>`
    : '';

  card.innerHTML = `
    <div class="res-card-top">
      <span class="res-category">${item.category}</span>
      ${statusChip}
    </div>
    <div class="res-title">${item.title}</div>
    <div class="res-date">${item.date}</div>
    <div class="res-ref">${item.refNote}</div>
    ${pdfBtn ? `<div class="res-btns" style="margin-top:8px">${pdfBtn}</div>` : ''}
    ${imgHtml}
    ${bookBtn ? `<div class="res-btns">${bookBtn}</div>` : ''}
  `;

  // Image thumbnail click → resolve src from data (never from DOM attribute)
  const thumb = card.querySelector('.res-img-thumb');
  if (thumb) {
    thumb.addEventListener('click', () => {
      const resId   = thumb.dataset.resId;
      const stored  = localStorage.getItem(`reservation_img_${resId}`);
      const resItem = RESERVATION_ITEMS.find(r => r.id === resId);
      const src     = stored || resItem?.imgPath;
      if (!src) return;
      document.getElementById('lightbox-img').src = src;
      openModal('modal-lightbox');
    });
  }

  // Ticket PDF click → look up path from data (never from DOM attribute)
  const pdfViewBtn = card.querySelector('.btn-view-pdf');
  if (pdfViewBtn) {
    pdfViewBtn.addEventListener('click', () => {
      const resId = pdfViewBtn.dataset.resId;
      const resItem = RESERVATION_ITEMS.find(r => r.id === resId);
      if (!resItem?.pdfPath) return;
      document.getElementById('pdf-frame').src = resItem.pdfPath;
      document.getElementById('pdf-frame-fallback').href = resItem.pdfPath;
      openModal('modal-pdf');
    });
  }

  // File upload
  const fileInput = card.querySelector('.res-upload-input');
  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const maxBytes = 4 * 1024 * 1024; // 4MB — data URLs are stored in localStorage (~5-10MB total quota)
      if (file.size > maxBytes) {
        alert('File too large. Please choose an image or PDF under 4MB.');
        fileInput.value = '';
        return;
      }
      const resId = fileInput.dataset.resId;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          localStorage.setItem(`reservation_img_${resId}`, ev.target.result);
          renderReservations();
        } catch (err) {
          alert('Could not save file — storage may be full.');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  return card;
}

// ── Packing ────────────────────────────────────────────────────────────────

async function loadPacking() {
  try {
    const res = await fetch('./data/packing.json');
    state.packingData = await res.json();
    renderPacking();
  } catch(e) {
    document.getElementById('pack-categories').innerHTML = '<p style="padding:20px;color:var(--sub-lite)">Failed to load packing list.</p>';
  }
}

function renderPacking() {
  const container = document.getElementById('pack-categories');
  if (!state.packingData) return;
  const { categories } = state.packingData;
  const checked = getPackingState();
  const userItems = getUserPackItems();

  container.innerHTML = '';
  let totalItems = 0;
  let totalChecked = 0;

  categories.forEach((cat, ci) => {
    const catItems = [...cat.items, ...(userItems[cat.name] || []).map(i => ({ text: i, _user: true }))];
    const itemsChecked = catItems.filter((item, ii) => {
      const key = `${ci}-${ii}`;
      return checked[key];
    }).length;

    totalItems += catItems.length;
    totalChecked += itemsChecked;

    const catEl = buildPackCategory(cat, catItems, ci, checked);
    container.appendChild(catEl);
  });

  document.getElementById('pack-count').textContent = totalChecked;
  document.getElementById('pack-total').textContent = totalItems;
  const pct = totalItems > 0 ? (totalChecked / totalItems * 100) : 0;
  document.getElementById('pack-progress-fill').style.width = pct + '%';

  document.getElementById('btn-reset-pack').addEventListener('click', resetPacking);
}

function buildPackCategory(cat, items, ci, checked) {
  const el = document.createElement('div');
  el.className = 'pack-category';

  const checkedCount = items.filter((_, ii) => checked[`${ci}-${ii}`]).length;

  el.innerHTML = `
    <div class="pack-cat-header">
      <span class="pack-cat-icon">${cat.icon}</span>
      <span class="pack-cat-name">${cat.name}</span>
      <span class="pack-cat-count">${checkedCount}/${items.length}</span>
      <svg class="pack-cat-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="pack-items-list">
      ${items.map((item, ii) => {
        const key = `${ci}-${ii}`;
        const isChecked = !!checked[key];
        const text = typeof item === 'string' ? item : item.text;
        const isUser = typeof item === 'object' && item._user;
        return `
          <div class="pack-item${isChecked ? ' checked' : ''}" data-key="${key}">
            <div class="pack-checkbox">
              ${isChecked ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
            </div>
            <div class="pack-item-text">${isUser ? escapeHtml(text) : text}</div>
            ${isUser ? '<span class="pack-item-user">✦</span>' : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  el.querySelector('.pack-cat-header').addEventListener('click', () => el.classList.toggle('expanded'));

  el.querySelectorAll('.pack-item').forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.key;
      const state = getPackingState();
      state[key] = !state[key];
      localStorage.setItem('packing_checklist', JSON.stringify(state));
      renderPacking();
      // Re-expand this category
      setTimeout(() => {
        const reEl = document.querySelector(`.pack-category:nth-child(${ci + 1})`);
        if (reEl) reEl.classList.add('expanded');
      }, 10);
    });
  });

  return el;
}

function getPackingState() {
  try { return JSON.parse(localStorage.getItem('packing_checklist') || '{}'); }
  catch { return {}; }
}

function resetPacking() {
  if (!confirm('Reset all packing items?')) return;
  localStorage.removeItem('packing_checklist');
  renderPacking();
}

function getUserPackItems() {
  try { return JSON.parse(localStorage.getItem('user_pack_items') || '{}'); }
  catch { return {}; }
}

function promptAddPackItem() {
  const name = prompt('Category name to add to:');
  if (!name) return;
  const text = prompt('Item to add:');
  if (!text) return;

  const items = getUserPackItems();
  if (!items[name]) items[name] = [];
  items[name].push(text);
  localStorage.setItem('user_pack_items', JSON.stringify(items));
  renderPacking();
}

// ── Android Install Prompt ─────────────────────────────────────────────────

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    window._installPrompt = e;
  });
}

// ── Utils ──────────────────────────────────────────────────────────────────

function mapsLink(address, lat, lon) {
  if (lat != null && lon != null) return `https://maps.google.com/?q=${lat},${lon}`;
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getTodayMDT() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
}

// ── Ask Tab ───────────────────────────────────────────────────────────────────

// Each user supplies their own Anthropic API key, stored only in this
// browser's localStorage. It is never bundled, committed, or sent anywhere
// except directly to api.anthropic.com.
const ASK_KEY_STORAGE     = 'colorado26_ask_key';
const ASK_HISTORY_STORAGE = 'colorado26_ask_history';
const ASK_MODEL           = 'claude-sonnet-4-5';
const ASK_MAX_TOKENS      = 1024;
const ASK_HISTORY_LIMIT   = 6;

let askConversationHistory = [];
let askIsStreaming          = false;
let askCurrentLocation     = null;
let askInitialized         = false;
let askChatStarted         = false;
let eatsInitialized        = false;

function initAskTab() {
  setupAskKeyEventListeners();
  if (getAskKey()) {
    startAskChat();
  } else {
    showAskSetup();
  }
}

function startAskChat() {
  askChatStarted = true;
  showAskChat();
  loadAskHistory();
  updateAskContextPill();
  if (askConversationHistory.length === 0) {
    showAskWelcome();
    showAskSuggestions();
  }
  setupAskEventListeners();
  requestLocationSilently();
}

// ── API Key Management ───────────────────────────────────────────────────────

function showAskSetup() {
  const setup = document.getElementById('ask-setup');
  if (setup) setup.hidden = false;
  document.getElementById('ask-chat').hidden = true;
}

function showAskChat() {
  const setup = document.getElementById('ask-setup');
  if (setup) setup.hidden = true;
  document.getElementById('ask-chat').hidden = false;
}

function saveAskKey(key) {
  if (!key || !key.startsWith('sk-ant-')) {
    alert('Key must start with sk-ant-');
    return false;
  }
  localStorage.setItem(ASK_KEY_STORAGE, key.trim());
  return true;
}

function getAskKey() {
  return localStorage.getItem(ASK_KEY_STORAGE);
}

function setupAskKeyEventListeners() {
  if (setupAskKeyEventListeners._attached) return;
  setupAskKeyEventListeners._attached = true;

  document.getElementById('ask-key-toggle')?.addEventListener('click', () => {
    const input = document.getElementById('ask-key-input');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('ask-key-save-btn')?.addEventListener('click', () => {
    const input = document.getElementById('ask-key-input');
    if (!input) return;
    if (saveAskKey(input.value)) {
      input.value = '';
      if (askChatStarted) showAskChat();
      else startAskChat();
    }
  });

  document.getElementById('ask-key-update-btn')?.addEventListener('click', showAskSetup);
}

// ── Context Builder ──────────────────────────────────────────────────────────

function buildTripContext() {
  const now     = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  const tripStart = new Date('2026-06-19');
  const tripEnd   = new Date('2026-06-24');
  const msPerDay  = 86400000;
  let todayDayNum = null;
  if (now >= tripStart && now <= tripEnd) {
    todayDayNum = Math.floor((now - tripStart) / msPerDay) + 1;
  }

  let todayScheduleText = 'Trip has not started yet.';
  if (todayDayNum && window.ITINERARY_DAYS) {
    const dayData = window.ITINERARY_DAYS[todayDayNum - 1];
    if (dayData) {
      const activities = (dayData.activities || [])
        .filter(a => a.type !== 'drive-connector')
        .map(a => `  ${a.time || ''} — ${a.title}${a.address ? ' · ' + a.address : ''}`)
        .join('\n');
      todayScheduleText = `Day ${todayDayNum}: ${dayData.title}\n${activities}`;
    }
  }

  const weatherKey = todayDayNum ? `weather_${todayDayNum}_2026-06-${(18 + todayDayNum).toString().padStart(2,'0')}` : null;
  let weatherText = 'Not available';
  if (weatherKey) {
    try {
      const cached = JSON.parse(localStorage.getItem(weatherKey) || '{}');
      if (cached.data) {
        weatherText = `${cached.data.hiC}°C (${cached.data.hiF}°F) high / ${cached.data.loC}°C (${cached.data.loF}°F) low`;
      }
    } catch(e) {}
  }

  const locationText = askCurrentLocation
    ? `${askCurrentLocation.city || 'Unknown city'} (${askCurrentLocation.lat.toFixed(3)}, ${askCurrentLocation.lon.toFixed(3)})`
    : 'Not available (location not permitted or not yet fetched)';

  const needsBooking = [];
  const confirmed    = [];
  if (window.ITINERARY_DAYS) {
    window.ITINERARY_DAYS.forEach(day => {
      (day.activities || []).forEach(act => {
        if (act.bookingStatus === 'book-now' && act.title)  needsBooking.push(act.title);
        if (act.bookingStatus === 'confirmed' && act.title) confirmed.push(act.title);
      });
    });
  }

  return `You are a helpful trip assistant for the Colorado Family Trip, June 19-24 2026.
Family: 2 adults + 10-year-old daughter. Vegetarian diet. Based in St. Louis.

CURRENT DATE & TIME: ${dateStr}, ${timeStr}
CURRENT LOCATION: ${locationText}
TODAY'S WEATHER: ${weatherText}

${todayDayNum
  ? `TODAY IS TRIP DAY ${todayDayNum}:\n${todayScheduleText}`
  : `The trip ${now < tripStart ? 'has not started yet' : 'has ended'}.`
}

FULL TRIP OVERVIEW (one line each):
Day 1 — Fri Jun 19: Travel STL→Denver, land 11:55PM. Rental car at DEN (~12:30AM, shuttle required — add flight# to booking). Hotel: Quality Inn & Suites Denver Airport, 6890 Tower Rd. Arrive ~1:15AM.
Day 2 — Sat Jun 20: Depart hotel 6:45AM (1h45m drive) → arrive depot 8:30AM → board 8:45AM → Pikes Peak Cog Railway 9:05AM (Car 1 Row 15 A/B/C). Call +17196855401 if running late — they can switch slots. + Garden of Gods + Red Rock Canyon. Hotel: Academy Hotel Colorado Springs.
Day 3 — Sun Jun 21: Late start 10AM. Drive via US-24 W → Buena Vista (lunch at CO Ranch House) → Twin Lakes photo stop → Independence Pass (12,095 ft, check cotrip.org) → Aspen → Glenwood Springs. Evening: Grizzly Creek Trail hike 30 min. Hotel: Residence Inn Glenwood Springs (Conf: 73462520918893).
Day 4 — Mon Jun 22: Maroon Bells 8AM shuttle (MAIN HIGHLIGHT) + Silver Queen Gondola + Cooper St Aspen. Hotel: Residence Inn Glenwood Springs.
Day 5 — Tue Jun 23: 8:30AM load car/late checkout from Residence Inn (request night before). Blue Sky Adventures rafting 9AM. Checkout clash fix: ask for 1PM late checkout OR pack car before leaving. + Glenwood Hot Springs Pool. Hotel: Glenwood Hot Springs Lodge.
Day 6 — Wed Jun 24: Late start 11AM. I-70 East → lunch Silverthorne (exit 205, Pug Ryan's/Butterhorn) → optional Idaho Springs stop → Red Rocks 2:30PM (2 hrs) → farewell dinner near DEN (Pappadeaux Aurora or Root Down DIA inside terminal) → return rental 6PM → DEN security 6:30PM → WN#1324 8:45PM → STL 11:55PM.

KEY RESERVATIONS STATUS:
Needs booking: ${needsBooking.slice(0,5).join(', ') || 'None flagged'}
Confirmed: ${confirmed.slice(0,5).join(', ') || 'None yet'}

KEY CONTACTS & FACTS:
- Maroon Bells shuttle: visitmaroonbells.com, booked — 9:15AM depart Aspen Highlands
- Pikes Peak Cog Railway: confirmed — Car 1, Row 15, Seats A/B/C, 9:05AM
- Blue Sky Adventures rafting: (970) 945-5867, 152 W 6th St Glenwood Springs, 9AM Tues
- Residence Inn: (970) 928-0900, 125 Wulfsohn Rd, Glenwood Springs
- Hot Springs Lodge: 1-800-537-7946, 415 E 6th St, Classic Double Queen ground floor patio
- Maroon Bells weather hard rule: be back at lake heading to shuttle by 12:30PM
- Nepal Restaurant: 6824 Hwy 82 Glenwood Springs — best Indian food of the trip
- Independence Pass (CO-82): check cotrip.org morning of Jun 21; alternate US-24 N → I-70 W if closed
- Grizzly Creek Trail: I-70 Exit 121, flat canyon hike, 30 min, free

RESPONSE STYLE:
- Mobile interface — keep answers to 2-4 sentences unless detail is requested
- Use bullet points for lists of 3+ items
- Mention real names, addresses, times from the itinerary when relevant
- If asked about something not in the trip context, still try to help based on general knowledge
- Never repeat the question back. Get straight to the answer.`;
}

// ── Location ─────────────────────────────────────────────────────────────────

function requestLocationSilently() {
  if (!('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      askCurrentLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude, city: null };
      updateAskContextPill();
    },
    err => console.log('Location not available:', err.message),
    { timeout: 8000, maximumAge: 300000 }
  );
}

// ── Context Pill ─────────────────────────────────────────────────────────────

function updateAskContextPill() {
  const pill = document.getElementById('ask-context-pill');
  if (!pill) return;
  const now       = new Date();
  const tripStart = new Date('2026-06-19');
  const tripEnd   = new Date('2026-06-24');
  const msPerDay  = 86400000;
  const parts     = [];

  if (now >= tripStart && now <= tripEnd) {
    parts.push(`Day ${Math.floor((now - tripStart) / msPerDay) + 1}`);
  } else if (now < tripStart) {
    parts.push(`${Math.ceil((tripStart - now) / msPerDay)}d to trip`);
  } else {
    parts.push('Trip complete');
  }

  if (askCurrentLocation) parts.push('📍 Located');

  const dayNum    = Math.floor((now - tripStart) / msPerDay) + 1;
  const dateStr   = now.toISOString().split('T')[0];
  const wKey      = `weather_${dayNum}_${dateStr}`;
  try {
    const cached = JSON.parse(localStorage.getItem(wKey) || '{}');
    if (cached.data) parts.push(`${cached.data.hiC}°C`);
  } catch(e) {}

  pill.textContent = parts.join(' · ');
}

// ── Suggestions ──────────────────────────────────────────────────────────────

function getAskSuggestions() {
  const now       = new Date();
  const tripStart = new Date('2026-06-19');
  if (now < tripStart) {
    return [
      'What should I book immediately?',
      'Tips for altitude sickness prevention?',
      'What to pack for Maroon Bells?',
      'What time should we leave for Pikes Peak?',
    ];
  }
  const dayNum = Math.min(6, Math.max(1, Math.floor((now - tripStart) / 86400000) + 1));
  const daySuggestions = {
    1: ['What time does the hotel shuttle run?', 'Best dinner near DEN airport?', 'Car rental pickup tips?', "What's the drive to Colorado Springs tomorrow?"],
    2: ['What should I know before Pikes Peak?', 'Best seats on the Cog Railway?', 'How long for Garden of Gods?', 'Lunch near Manitou Springs?'],
    3: ['What time does the Vail market close?', 'Best stop for Indian food today?', "What's in Glenwood Canyon?", 'Check-in time at Residence Inn?'],
    4: ['What time to leave for Maroon Bells?', 'Is the weather clear at Maroon Bells?', 'What trail should we hike?', "What's the Silver Queen Gondola last ride time?"],
    5: ['What time does rafting start today?', 'How far is Iron Mountain from the hotel?', "What's included with the Hot Springs Lodge room?", 'Best dinner in Glenwood tonight?'],
    6: ['What time to leave for Red Rocks?', "What's the Trading Post Trail like?", 'What time must we return the rental car?', 'Best farewell lunch in Denver?'],
  };
  return daySuggestions[dayNum] || daySuggestions[1];
}

function showAskSuggestions() {
  const container = document.getElementById('ask-suggestions');
  if (!container) return;
  container.innerHTML = getAskSuggestions()
    .map(s => `<button class="ask-suggestion-chip" onclick="handleAskSuggestion(this.textContent)">${s}</button>`)
    .join('');
}

function handleAskSuggestion(text) {
  const input = document.getElementById('ask-input');
  if (input) {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }
  sendAskMessage();
}

// ── History ───────────────────────────────────────────────────────────────────

function loadAskHistory() {
  try {
    const stored = localStorage.getItem(ASK_HISTORY_STORAGE);
    if (stored) {
      askConversationHistory = JSON.parse(stored);
      askConversationHistory.forEach(msg => {
        if (msg.role === 'user')      appendUserMessage(msg.content);
        else if (msg.role === 'assistant') appendAssistantMessage(msg.content);
      });
    }
  } catch(e) {
    askConversationHistory = [];
  }
}

function saveAskHistory() {
  const limited = askConversationHistory.slice(-ASK_HISTORY_LIMIT * 2);
  try { localStorage.setItem(ASK_HISTORY_STORAGE, JSON.stringify(limited)); } catch(e) {}
}

function clearAskHistory() {
  askConversationHistory = [];
  localStorage.removeItem(ASK_HISTORY_STORAGE);
  const messages = document.getElementById('ask-messages');
  if (messages) messages.innerHTML = '';
  showAskWelcome();
  showAskSuggestions();
}

// ── Welcome Message ───────────────────────────────────────────────────────────

function showAskWelcome() {
  const messages = document.getElementById('ask-messages');
  if (!messages) return;
  const now       = new Date();
  const tripStart = new Date('2026-06-19');
  const daysUntil = Math.ceil((tripStart - now) / 86400000);
  const welcomeText = daysUntil > 0
    ? `<strong>Colorado Trip Assistant ✨</strong><br>${daysUntil} days until your trip. Ask me anything — what to pack, what to book first, altitude tips, restaurant suggestions, or any question about your 6-day Colorado itinerary.`
    : `<strong>Colorado Trip Assistant ✨</strong><br>You're on the trip! Ask me what to do now, directions, nearby restaurants, activity tips, or anything else about your Colorado adventure.`;
  const div = document.createElement('div');
  div.className = 'ask-msg ask-welcome';
  div.innerHTML = welcomeText;
  messages.appendChild(div);
}

// ── Message Rendering ─────────────────────────────────────────────────────────

function appendUserMessage(text) {
  const messages = document.getElementById('ask-messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'ask-msg user';
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function appendAssistantMessage(text) {
  const messages = document.getElementById('ask-messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'ask-msg assistant';
  div.innerHTML = formatAskResponse(text);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function formatAskResponse(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');
}

// ── Send Message ──────────────────────────────────────────────────────────────

async function sendAskMessage() {
  if (askIsStreaming) return;
  const input   = document.getElementById('ask-input');
  const sendBtn = document.getElementById('ask-send-btn');
  const userText = input.value.trim();
  if (!userText) return;

  const apiKey = getAskKey();
  if (!apiKey) { showAskSetup(); return; }

  const suggestions = document.getElementById('ask-suggestions');
  if (suggestions) suggestions.innerHTML = '';

  appendUserMessage(userText);
  askConversationHistory.push({ role: 'user', content: userText });
  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;
  askIsStreaming    = true;

  const messages  = document.getElementById('ask-messages');
  const loadingEl = document.createElement('div');
  loadingEl.className = 'ask-msg assistant';
  loadingEl.innerHTML = '<div class="ask-loading-dots"><span></span><span></span><span></span></div>';
  messages.appendChild(loadingEl);
  messages.scrollTop = messages.scrollHeight;

  try {
    const systemPrompt  = buildTripContext();
    const historyToSend = askConversationHistory.slice(-(ASK_HISTORY_LIMIT * 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ASK_MODEL,
        max_tokens: ASK_MAX_TOKENS,
        system: systemPrompt,
        messages: historyToSend,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API error ${response.status}`);
    }

    loadingEl.remove();
    const assistantEl = document.createElement('div');
    assistantEl.className = 'ask-msg assistant streaming';
    messages.appendChild(assistantEl);

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer   = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            fullText += parsed.delta.text;
            assistantEl.innerHTML = formatAskResponse(fullText);
            messages.scrollTop = messages.scrollHeight;
          }
        } catch(e) { /* skip malformed chunks */ }
      }
    }

    assistantEl.classList.remove('streaming');
    assistantEl.innerHTML = formatAskResponse(fullText);
    askConversationHistory.push({ role: 'assistant', content: fullText });
    saveAskHistory();

  } catch(err) {
    loadingEl.remove();
    const errEl = document.createElement('div');
    errEl.className = 'ask-msg error';
    if (err.message.includes('401') || err.message.includes('auth')) {
      errEl.textContent = '🔑 API key invalid or expired. Tap the key icon to update it.';
    } else if (err.message.includes('429')) {
      errEl.textContent = '⏳ Rate limit hit. Wait a moment and try again.';
    } else if (!navigator.onLine) {
      errEl.textContent = '📡 No internet connection. Ask tab requires connectivity.';
    } else {
      errEl.textContent = `⚠️ ${err.message}`;
    }
    messages.appendChild(errEl);
    messages.scrollTop = messages.scrollHeight;
    askConversationHistory.pop();
  } finally {
    askIsStreaming    = false;
    sendBtn.disabled  = false;
    input.focus();
  }
}

// ── Event Listeners ───────────────────────────────────────────────────────────

function setupAskEventListeners() {
  if (setupAskEventListeners._attached) return;
  setupAskEventListeners._attached = true;

  document.getElementById('ask-send-btn')?.addEventListener('click', sendAskMessage);

  document.getElementById('ask-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAskMessage();
    }
  });

  document.getElementById('ask-input')?.addEventListener('input', e => {
    const sendBtn = document.getElementById('ask-send-btn');
    if (sendBtn) sendBtn.disabled = e.target.value.trim().length === 0 || askIsStreaming;
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  });

  document.getElementById('ask-clear-btn')?.addEventListener('click', () => {
    if (confirm('Clear conversation history?')) clearAskHistory();
  });
}
