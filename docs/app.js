'use strict';

// ── Constants ──────────────────────────────────────────────────────────────

const DAY_LOCATIONS = {
  1: { name: 'Denver, CO',           lat: 39.7392, lon: -104.9903, date: '2026-06-19' },
  2: { name: 'Colorado Springs, CO', lat: 38.8339, lon: -104.8214, date: '2026-06-20' },
  3: { name: 'Glenwood Springs, CO', lat: 39.5505, lon: -107.3248, date: '2026-06-21' },
  4: { name: 'Aspen / Maroon Bells', lat: 39.0931, lon: -106.9253, date: '2026-06-22' },
  5: { name: 'Glenwood Springs, CO', lat: 39.5505, lon: -107.3248, date: '2026-06-23' },
  6: { name: 'Morrison / Red Rocks', lat: 39.6654, lon: -105.2057, date: '2026-06-24' },
};

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

const ACTIVITIES_DATA = [
  { id:'act2', name:'Blue Sky Adventures — Whitewater Rafting', location:'Glenwood Springs', locationKey:'glenwood', lat:39.5489, lon:-107.3258, address:'152 W 6th St, Glenwood Springs, CO 81601', phone:'+19709455867', website:'https://blueskyrafting.com', type:'activity', tags:['family','adventure','river'], cost:'~$85/adult', note:'Half-day Shoshone Rapids (Class III in June). Tuesday departure 9AM. Ages 5+.', bookingStatus:'book-now', relevantDays:[5] },
  { id:'act3', name:'Maroon Bells Shuttle', location:'Aspen', locationKey:'aspen', lat:39.0931, lon:-106.9253, address:'75 Boomerang Rd, Aspen, CO 81611', website:'https://www.visitmaroonbells.com', type:'activity', tags:['must-do','family','hiking','iconic'], cost:'✓ Booked', note:'✓ CONFIRMED. Departs 9:15AM from Aspen Highlands. At Maroon Bells by 9:30AM. Left side on shuttle for views. Hard weather stop 12:30PM. Ticket in Passes tab.', bookingStatus:'confirmed', relevantDays:[4] },
  { id:'act4', name:'Pikes Peak Cog Railway', location:'Manitou Springs', locationKey:'csprings', lat:38.8605, lon:-104.9223, address:'515 Ruxton Ave, Manitou Springs, CO 80829', phone:'+17196855401', website:'https://www.cograilway.com', type:'activity', tags:['must-do','family','train','scenic'], cost:'✓ Booked', note:'✓ CONFIRMED — Car 1, Row 15, Seats A · B · C. Departs 9:05AM. Sit LEFT — seats already face the panoramic views. Ticket in Passes tab.', bookingStatus:'confirmed', relevantDays:[2] },
  { id:'act5', name:'Garden of the Gods', location:'Colorado Springs', locationKey:'csprings', lat:38.8784, lon:-104.8697, address:'1805 N 30th St, Colorado Springs, CO 80904', website:'https://gardenofgods.com', type:'activity', tags:['free','family','scenic','hiking'], cost:'Free', note:'Scenic loop drive + Perkins Central Garden Trail (1.5 mi). Adjacent to Red Rock Canyon Open Space.', bookingStatus:'free', relevantDays:[2] },
  { id:'act6', name:'Glenwood Hot Springs Pool', location:'Glenwood Springs', locationKey:'glenwood', lat:39.5487, lon:-107.3228, address:'401 N River Street, Glenwood Springs, CO 81601', phone:'+18005377946', website:'https://hotspringspool.com', type:'activity', tags:['family','kids','swimming','water-slides'], cost:'Included with stay', note:'Included with Glenwood Hot Springs Resort room. Sopris Splash Zone: water slides + fountains for kids. Grand Pool for adults. No reservations needed, hand stamp for re-entry. Open 8AM–10PM.', bookingStatus:'included', relevantDays:[5] },
  { id:'act7', name:'Red Rocks Park & Amphitheatre', location:'Morrison', locationKey:'denver', lat:39.6654, lon:-105.2057, address:'18300 W Alameda Pkwy, Morrison, CO 80465', website:'https://www.redrocksonline.com', type:'activity', tags:['free','family','scenic','hiking','iconic'], cost:'Free daytime entry', note:'Trading Post Trail (1.4 mi easy loop). Visitor center 7AM–7PM. Perfect Colorado farewell on Day 6.', bookingStatus:'free', relevantDays:[6] },
  { id:'act8', name:'Silver Queen Gondola — Aspen Mountain', location:'Aspen', locationKey:'aspen', lat:39.1879, lon:-106.8199, address:'601 E Dean St, Aspen, CO 81611', website:'https://www.aspensnowmass.com', type:'activity', tags:['family','gondola','scenic','views'], cost:'$149 Family Pkg', note:'18-min ride to 11,212 ft. Panoramic views of 4 mountain ranges. Last ride up 4PM sharp. Family Sightseeing Package: 2 adults + up to 4 kids.', bookingStatus:'book-now', bookingUrl:'https://www.aspensnowmass.com', relevantDays:[4] },
  { id:'act9',  name:'Vail Farmers Market & Art Show',          location:'Vail',             locationKey:'vail',     lat:39.6428, lon:-106.3743, address:'East Meadow Drive, Vail Village, Vail, CO 81657',                website:'https://www.vailfarmersmarket.com',        type:'activity', tags:['free','family','market','sunday-only'],       cost:'Free entry',                     note:'Sundays 9:30AM–3PM. Bring cash — many vendors don\'t take cards. Arrive by 12:30PM for 2 full hours.', bookingStatus:'free',     relevantDays:[3] },

  // ── Colorado Springs ──
  { id:'act10', name:'Cave of the Winds Mountain Park',          location:'Manitou Springs',  locationKey:'csprings', lat:38.8731, lon:-104.8943, address:'100 Cave of the Winds Rd, Manitou Springs, CO 80829', phone:'+17196851012',   website:'https://caveofthewinds.com',              type:'activity', tags:['family','caves','indoor','kids'],             cost:'$30-40/adult',                   note:'Guided cave tours year-round. "Terror-dactyl" zipline and wind tunnel add-ons. 45-min to 2-hr tours. Kids love the lantern tours.', bookingStatus:'book-now', bookingUrl:'https://caveofthewinds.com', relevantDays:[2] },
  { id:'act11', name:'North Cheyenne Cañon Park + Helen Hunt Falls', location:'Colorado Springs', locationKey:'csprings', lat:38.7922, lon:-104.8765, address:'2120 S Cheyenne Canyon Rd, Colorado Springs, CO 80906', website:'https://coloradosprings.gov/cheyenne-canon', type:'activity', tags:['free','family','hiking','waterfall','scenic'],  cost:'Free',                           note:'Helen Hunt Falls is a quick easy 0.5mi walk. Silver Cascade Falls adds another scenic stop. Pine-scented canyon road. Very popular with locals.', bookingStatus:'free', relevantDays:[2] },
  { id:'act12', name:'US Olympic & Paralympic Museum',            location:'Colorado Springs', locationKey:'csprings', lat:38.8290, lon:-104.8282, address:'200 S Sierra Madre St, Colorado Springs, CO 80905', website:'https://www.usopm.org',               type:'activity', tags:['family','museum','indoor','kids'],             cost:'$25/adult, $18/child',           note:'World-class interactive museum celebrating US Olympians. Downtown Colorado Springs. Allow 2-3 hrs. Kids can try simulated sports events.', bookingStatus:'optional', relevantDays:[2] },
  { id:'act13', name:'Cheyenne Mountain Zoo',                     location:'Colorado Springs', locationKey:'csprings', lat:38.7754, lon:-104.8759, address:'4250 Cheyenne Mountain Zoo Rd, Colorado Springs, CO 80906', phone:'+17193851212', website:'https://www.cmzoo.org', type:'activity', tags:['family','kids','animals','scenic'],             cost:'$25/adult, $18/child',           note:'Only mountain zoo in America at 6,800 ft. Giraffe feeding is a highlight ($5 extra). African Rift Valley exhibit. Spectacular views of Colorado Springs below.', bookingStatus:'optional', relevantDays:[2] },
  { id:'act14', name:'Red Rock Canyon Open Space',                location:'Colorado Springs', locationKey:'csprings', lat:38.8325, lon:-104.8821, address:'3550 W High St, Colorado Springs, CO 80904',          website:'https://coloradosprings.gov/red-rock-canyon', type:'activity', tags:['free','family','hiking','scenic'],           cost:'Free',                           note:'Same red sandstone geology as Garden of Gods — zero crowds. Mesa Trail (1.5mi easy). Views back toward GoG. Locals\' favorite. Dog-friendly.', bookingStatus:'free', relevantDays:[2] },

  // ── Glenwood Springs ──
  { id:'act15', name:'Glenwood Caverns Adventure Park',           location:'Glenwood Springs', locationKey:'glenwood', lat:39.5706, lon:-107.3304, address:'51000 Two Rivers Plaza Rd, Glenwood Springs, CO 81601', phone:'+19709451975', website:'https://glenwoodcaverns.com',              type:'activity', tags:['family','kids','caves','scenic','adventure'],   cost:'$25-80/person depending on rides', note:'Cable gondola to top of Lookout Mountain then cave tours + theme park rides. Giant Canyon Swing, alpine coaster. Kids LOVE this. Cave tours run ~45min.', bookingStatus:'book-now', bookingUrl:'https://glenwoodcaverns.com', relevantDays:[3,5] },
  { id:'act16', name:'Hanging Lake Trail',                        location:'Glenwood Springs', locationKey:'glenwood', lat:39.5997, lon:-107.1922, address:'Hanging Lake Trailhead, Glenwood Canyon, CO 81601',   website:'https://www.recreation.gov',              type:'activity', tags:['hiking','scenic','iconic','permit-required'],  cost:'$15 permit + $15 shuttle',       note:'One of Colorado\'s most iconic hikes — turquoise hanging lake at 7,323 ft. 2.8 mi RT, strenuous (1,000 ft gain). PERMIT REQUIRED May-Nov. Book weeks ahead on recreation.gov. No kids under 5.', bookingStatus:'book-now', bookingUrl:'https://www.recreation.gov/ticket/facility/300009', relevantDays:[3,5], flag:{type:'warning', text:'Permit sells out fast. Book at recreation.gov at least 2 weeks ahead. Shuttle from Glenwood departs 7AM-4PM.'} },
  { id:'act17', name:'Yampah Spa & Vapor Caves',                  location:'Glenwood Springs', locationKey:'glenwood', lat:39.5480, lon:-107.3258, address:'709 E 6th St, Glenwood Springs, CO 81601',           phone:'+19709450667', website:'https://yampahspa.com',               type:'activity', tags:['adults','relaxing','hot-springs','spa'],        cost:'~$18 caves / $65+ spa',          note:'North America\'s only natural underground hot springs vapor caves. Geothermal steam chambers reach 112°F. Walking distance from Hot Springs Resort. Very relaxing after rafting.', bookingStatus:'optional', relevantDays:[5] },
  { id:'act18', name:'Rio Grande Trail (Glenwood to Aspen)',      location:'Glenwood Springs', locationKey:'glenwood', lat:39.5505, lon:-107.3248, address:'Trailhead: Two Rivers Park, Glenwood Springs, CO 81601', website:'https://rfta.com',                        type:'activity', tags:['free','family','hiking','scenic','biking'],    cost:'Free (bike rental ~$40/day)',    note:'42-mile paved trail from Glenwood to Aspen along the Roaring Fork River. Stunning canyon scenery. Easy flat ride. Your daughter can handle 5-10 miles easily. Bike rentals in Glenwood.', bookingStatus:'free', relevantDays:[3,5] },

  // ── Aspen ──
  { id:'act19', name:'John Denver Sanctuary',                     location:'Aspen',            locationKey:'aspen',    lat:39.1916, lon:-106.8190, address:'Puppy Smith St & Rio Grande Trail, Aspen, CO 81611', website:'https://www.aspenpitkin.com',              type:'activity', tags:['free','family','scenic','peaceful'],            cost:'Free',                           note:'Riverside park with stone installations engraved with John Denver lyrics. "Rocky Mountain High" was written about Colorado. Emotional and meaningful 20-min visit. Right in downtown Aspen.', bookingStatus:'free', relevantDays:[4] },
  { id:'act20', name:'Aspen Art Museum',                          location:'Aspen',            locationKey:'aspen',    lat:39.1907, lon:-106.8183, address:'637 E Hyman Ave, Aspen, CO 81611',                  phone:'+19709258050',  website:'https://www.aspenartmuseum.org',          type:'activity', tags:['free','family','art','indoor'],                cost:'Free admission',                 note:'World-class contemporary art in a stunning building by Shigeru Ban. Rooftop terrace with mountain views is FREE even without exhibits. Open Tue–Sun 10am–6pm. Great if weather turns.', bookingStatus:'free', relevantDays:[4] },
  { id:'act21', name:'Grottos Trail (Ice Caves)',                 location:'Aspen',            locationKey:'aspen',    lat:39.1558, lon:-106.7588, address:'Grottos Trailhead, Hwy 82, Woody Creek, CO 81656',  website:'https://www.fs.usda.gov',                 type:'activity', tags:['free','family','hiking','caves','scenic'],    cost:'Free',                           note:'Easy 1-mile loop on the Roaring Fork River with natural granite ice caves — some with ice into July. Especially magical for kids. 20 min east of Aspen on Hwy 82 toward Independence Pass.', bookingStatus:'free', relevantDays:[4] },

  // ── Vail / en-route ──
  { id:'act22', name:'Betty Ford Alpine Gardens',                 location:'Vail',             locationKey:'vail',     lat:39.6411, lon:-106.3740, address:'183 Gore Creek Dr, Vail, CO 81657',                 website:'https://bettyfordalpinegardens.org',       type:'activity', tags:['free','family','scenic','gardens'],            cost:'Free',                           note:'Highest public botanical garden in North America at 8,200 ft. Over 3,000 alpine plants. Beautiful in June — wildflowers peak. Easy 45-min stroll. Right in Vail Village, 5 min from Farmers Market.', bookingStatus:'free', relevantDays:[3] },
  { id:'act23', name:'Colorado Ski Museum',                       location:'Vail',             locationKey:'vail',     lat:39.6420, lon:-106.3754, address:'231 S Frontage Rd E, Vail, CO 81657',                website:'https://skimuseum.net',                    type:'activity', tags:['free','family','museum','indoor'],             cost:'Free admission',                 note:'Free ski and snowboard history museum in Vail Village. Interactive exhibits, vintage equipment, Hall of Fame. Great 30-min stop alongside the Farmers Market.', bookingStatus:'free', relevantDays:[3] },

  // ── Denver / Morrison ──
  { id:'act24', name:'Dinosaur Ridge (Fossil Trace)',             location:'Morrison',         locationKey:'denver',   lat:39.6944, lon:-105.1769, address:'16831 W Alameda Pkwy, Morrison, CO 80465',          website:'https://dinoridge.org',                   type:'activity', tags:['free','family','kids','hiking','science'],    cost:'Free (guided tour $3)',          note:'Real dinosaur tracks from 100 million years ago in the rock face along the road. Easy 1.5-mile paved road. Adjacent to Red Rocks (combine both on Day 6). Kids absolutely love seeing actual fossils.', bookingStatus:'free', relevantDays:[6] },
  { id:'act25', name:'Denver Botanic Gardens',                    location:'Denver',           locationKey:'denver',   lat:39.7329, lon:-104.9617, address:'1007 York St, Denver, CO 80206',                    phone:'+17208653500',  website:'https://botanicgardens.org',              type:'activity', tags:['family','gardens','scenic'],                  cost:'$15/adult, $10/child',           note:'23 acres of themed gardens at 5,280 ft. Summer bloom is spectacular. Japanese Garden and Tropical Conservatory. Good for a few hours if you have extra time in Denver on arrival/departure day.', bookingStatus:'optional', relevantDays:[1,6] },
];

const LOCATION_KEY_MAP = {
  denver:   ['Denver', 'Aurora', 'Morrison', 'Greenwood Village'],
  csprings: ['Colorado Springs', 'Manitou Springs', 'Buena Vista'],
  glenwood: ['Glenwood Springs'],
  aspen:    ['Aspen'],
  vail:     ['Vail'],
  frisco:   ['Frisco'],
};

// ── State ──────────────────────────────────────────────────────────────────

let state = {
  currentTab: 'itinerary',
  itineraryData: null,
  restaurantsData: null,
  packingData: null,
  weatherCache: {},
  eatsFilter: { cuisine: 'all', loc: 'all', search: '' },
  userLocation: null,
  resSessionValid: false,
};

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupOfflineDetection();
  setupFAB();

  await Promise.all([
    loadItinerary(),
    loadRestaurants(),
    loadPacking(),
  ]);

  setupEatsFilters();
  setupActivitiesFilters();
  setupSubTabs();
  setupReservations();
  setupInstallPrompt();
});

// ── Navigation ─────────────────────────────────────────────────────────────

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
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
      ? `<a href="${mapsLink(act.address)}" target="_blank" rel="noopener" class="activity-address">📍 ${act.address}</a>`
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
            <span class="activity-title">${act.icon || ''} ${act.title}${userTag}</span>
            ${statusHtml}
          </div>
          ${act.description ? `<div class="activity-body">${act.description}</div>` : ''}
          ${addressHtml}
          ${act.cost ? `<div class="activity-body" style="margin-top:2px">💰 ${act.cost}</div>` : ''}
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

async function loadRestaurants() {
  try {
    const res = await fetch('./data/Colorado_Trip_Restaurants_2026.json');
    state.restaurantsData = await res.json();
    renderEats();
  } catch(e) {
    document.getElementById('eats-list').innerHTML = '<p style="padding:20px;color:var(--sub-lite)">Failed to load restaurant data.</p>';
  }
}

function setupEatsFilters() {
  document.getElementById('eats-search').addEventListener('input', e => {
    state.eatsFilter.search = e.target.value.toLowerCase();
    renderEats();
  });

  document.getElementById('cuisine-filters').addEventListener('click', e => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    document.querySelectorAll('#cuisine-filters .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.eatsFilter.cuisine = chip.dataset.filter;
    renderEats();
  });

  document.getElementById('location-filters').addEventListener('click', e => {
    const chip = e.target.closest('[data-loc]');
    if (!chip) return;
    document.querySelectorAll('#location-filters .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const loc = chip.dataset.loc;

    if (loc === 'closest') {
      requestGeolocation();
    } else {
      state.eatsFilter.loc = loc;
      renderEats();
    }
  });
}

function requestGeolocation() {
  if (!navigator.geolocation) {
    state.eatsFilter.loc = 'all';
    renderEats();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      state.userLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      state.eatsFilter.loc = 'closest';
      renderEats();
    },
    () => {
      state.eatsFilter.loc = 'all';
      renderEats();
    }
  );
}

function renderEats() {
  const container = document.getElementById('eats-list');
  if (!state.restaurantsData) return;

  const restaurants = state.restaurantsData.restaurants || [];
  const userItems = getUserEatsItems();

  // Restaurants tab: show only restaurants + user-added items (activities have their own tab)
  const allItems = [
    ...restaurants.map(r => ({ ...r, _source: 'restaurant' })),
    ...userItems.filter(u => u.type !== 'activity').map(u => ({ ...u, _source: 'user', _userAdded: true })),
  ];

  const { cuisine, loc, search } = state.eatsFilter;

  let filtered = allItems.filter(item => {
    // Cuisine filter
    if (cuisine !== 'all') {
      const cuisines = (item.cuisine || item.tags || []).map(c => c.toLowerCase());
      const match = {
        'indian':  cuisines.some(c => c.includes('indian') || c.includes('nepalese') || c.includes('himalayan')),
        'mexican': cuisines.some(c => c.includes('mexican') || c.includes('latin') || c.includes('salvadoran')),
        'pizza':   cuisines.some(c => c.includes('pizza') || c.includes('italian')),
        'thai':    cuisines.some(c => c.includes('thai') || c.includes('asian')),
        'cafe':    cuisines.some(c => c.includes('coffee') || c.includes('breakfast') || c.includes('brunch') || c.includes('cafe') || c.includes('bakery') || c.includes('donut')),
        'veg':     cuisines.some(c => c.includes('vegetarian') || c.includes('vegan')),
      };
      if (!match[cuisine]) return false;
    }

    // Location filter
    if (loc !== 'all' && loc !== 'closest') {
      const cities = LOCATION_KEY_MAP[loc] || [];
      const itemCity = item.city || item.location || '';
      if (!cities.some(c => itemCity.toLowerCase().includes(c.toLowerCase()))) {
        // Also check locationKey
        if (item.locationKey !== loc) return false;
      }
    }

    // Search filter
    if (search) {
      const searchIn = `${item.name} ${item.city || item.location} ${(item.cuisine || item.tags || []).join(' ')} ${item.note || ''} ${(item.popular_dishes || []).join(' ')}`.toLowerCase();
      if (!searchIn.includes(search)) return false;
    }

    return true;
  });

  // Sort by distance if geolocation available
  if (loc === 'closest' && state.userLocation) {
    filtered = filtered.sort((a, b) => {
      const da = getDistanceToItem(a);
      const db = getDistanceToItem(b);
      return da - db;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<div class="eats-empty">No results found.<br>Try adjusting filters.</div>';
    return;
  }

  container.innerHTML = '';
  filtered.forEach(item => {
    container.appendChild(buildEatsCard(item));
  });
}

function buildEatsCard(item) {
  const card = document.createElement('div');
  card.className = 'eats-card';

  const isActivity = item._source === 'activity' || item.type === 'activity';
  const cuisines = item.cuisine || item.tags || [];
  const tags = cuisines.slice(0, 3).map(c =>
    `<span class="eats-tag ${isActivity ? 'tag-activity' : ''}">${c}</span>`
  ).join('');

  const dist = state.userLocation ? getDistanceToItem(item) : null;
  const distHtml = dist !== null && dist < 9999
    ? `<span class="eats-distance">📍 ${dist.toFixed(1)} mi</span>`
    : '';

  const dayBadge = item.itinerary_day
    ? `<span class="eats-day-badge">${item.itinerary_day.split('-')[0].trim()}</span>`
    : item.relevantDays ? `<span class="eats-day-badge">Day ${item.relevantDays.join(',')}</span>` : '';

  const address = item.full_address || item.address || '';
  const addressHtml = address
    ? `<a href="${mapsLink(address)}" target="_blank" rel="noopener" class="eats-address-link">📍 ${address}</a>`
    : '';

  const dishes = item.popular_dishes && item.popular_dishes.length
    ? `<div class="eats-dishes"><strong>Popular: </strong>${item.popular_dishes.slice(0,4).join(', ')}</div>`
    : '';

  const note = item.note || item.notes || '';
  const noteHtml = note ? `<div class="eats-note">${note}</div>` : '';

  const btns = [];
  if (item.phone) btns.push(`<a href="tel:${item.phone}" class="btn-mini">📞 Call</a>`);
  if (item.website) btns.push(`<a href="${item.website}" target="_blank" rel="noopener" class="btn-mini">🌐 Web</a>`);
  if (item.yelp_url) btns.push(`<a href="${item.yelp_url}" target="_blank" rel="noopener" class="btn-mini">⭐ Yelp</a>`);
  if ((item.bookingStatus === 'book-now' || item.status === 'book-now') && item.bookingUrl) {
    btns.push(`<a href="${item.bookingUrl}" target="_blank" rel="noopener" class="btn-mini gold">⚡ Book</a>`);
  }

  const userTag = item._userAdded ? '<span class="user-added-tag">✦ Added</span>' : '';
  const statusChip = buildStatusChipFromString(item.bookingStatus || item.status);

  card.innerHTML = `
    <div class="eats-card-top">
      <div class="eats-tags">${tags}${item._userAdded ? '<span class="eats-tag" style="background:rgba(200,151,58,0.15);color:var(--gold);border-color:rgba(200,151,58,0.3)">Custom</span>' : ''}</div>
      <span class="eats-price">${item.price_range || item.cost || ''}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <div class="eats-name">${item.name}${userTag}</div>
      ${statusChip}
    </div>
    ${addressHtml}
    ${dishes}
    ${noteHtml}
    <div style="display:flex;gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap">
      ${dayBadge}
      ${distHtml}
    </div>
    ${btns.length ? `<div class="eats-btns">${btns.join('')}</div>` : ''}
  `;

  return card;
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

function getDistanceToItem(item) {
  if (!state.userLocation) return 9999;
  const lat = item.location?.latitude || item.lat;
  const lon = item.location?.longitude || item.lon;
  if (!lat || !lon) return 9999;
  return haversine(state.userLocation.lat, state.userLocation.lon, lat, lon);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getUserEatsItems() {
  try { return JSON.parse(localStorage.getItem('user_eats_items') || '[]'); }
  catch { return []; }
}

function saveUserEatsItem() {
  const name     = document.getElementById('eats-add-name').value.trim();
  const type     = document.getElementById('eats-add-type').value;
  const location = document.getElementById('eats-add-location').value.trim();
  const address  = document.getElementById('eats-add-address').value.trim();
  const note     = document.getElementById('eats-add-note').value.trim();
  if (!name) return;

  const items = getUserEatsItems();
  items.push({ id: `user-eats-${Date.now()}`, name, type, location, address, note, cuisine: [type], _userAdded: true });
  localStorage.setItem('user_eats_items', JSON.stringify(items));
  document.getElementById('form-add-eats').reset();
  renderEats();
}

// ── Sub-tabs (Restaurants / Activities) ───────────────────────────────────

function setupSubTabs() {
  document.querySelectorAll('.subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.subtab;
      document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.subtab-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById(`subtab-${target}`).classList.remove('hidden');
      if (target === 'activities') renderActivities();
    });
  });
}

// ── Activities Tab ─────────────────────────────────────────────────────────

let actsFilter = { type: 'all', loc: 'all', search: '' };

function setupActivitiesFilters() {
  document.getElementById('acts-search').addEventListener('input', e => {
    actsFilter.search = e.target.value.toLowerCase();
    renderActivities();
  });

  document.getElementById('acts-type-filters').addEventListener('click', e => {
    const chip = e.target.closest('[data-atype]');
    if (!chip) return;
    document.querySelectorAll('#acts-type-filters .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    actsFilter.type = chip.dataset.atype;
    renderActivities();
  });

  document.getElementById('acts-loc-filters').addEventListener('click', e => {
    const chip = e.target.closest('[data-aloc]');
    if (!chip) return;
    document.querySelectorAll('#acts-loc-filters .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    actsFilter.loc = chip.dataset.aloc;
    renderActivities();
  });
}

function renderActivities() {
  const container = document.getElementById('acts-list');
  if (!container) return;

  let items = [...ACTIVITIES_DATA];
  const { type, loc, search } = actsFilter;

  // Type filter
  if (type !== 'all') {
    const typeMap = {
      free:    a => a.tags.includes('free') || a.cost === 'Free' || a.cost === 'Free entry' || a.cost === 'Free daytime entry' || a.cost === 'Free admission',
      family:  a => a.tags.includes('family') || a.tags.includes('kids'),
      hiking:  a => a.tags.includes('hiking'),
      water:   a => a.tags.some(t => ['water','swimming','hot-springs','river','water-slides','biking'].includes(t)),
      scenic:  a => a.tags.includes('scenic') || a.tags.includes('views') || a.tags.includes('gondola'),
      'must-do': a => a.tags.includes('must-do') || a.tags.includes('iconic'),
    };
    items = items.filter(typeMap[type] || (() => true));
  }

  // Location filter
  if (loc !== 'all') {
    const locMap = {
      denver:   ['denver','morrison'],
      csprings: ['csprings','manitou-springs'],
      glenwood: ['glenwood'],
      aspen:    ['aspen'],
      vail:     ['vail'],
    };
    const keys = locMap[loc] || [loc];
    items = items.filter(a => keys.includes(a.locationKey));
  }

  // Search filter
  if (search) {
    items = items.filter(a => {
      return `${a.name} ${a.location} ${a.tags.join(' ')} ${a.note || ''} ${a.cost || ''}`.toLowerCase().includes(search);
    });
  }

  if (items.length === 0) {
    container.innerHTML = '<div class="eats-empty">No activities match your filters.</div>';
    return;
  }

  container.innerHTML = '';
  items.forEach(item => container.appendChild(buildActivityCard(item)));
}

function buildActivityCard(item) {
  const card = document.createElement('div');
  card.className = 'eats-card activity-card';

  const tags = (item.tags || []).slice(0, 4).map(t =>
    `<span class="eats-tag tag-activity">${t}</span>`
  ).join('');

  const statusChip = buildStatusChipFromString(item.bookingStatus);
  const isMustDo = item.tags.includes('must-do') || item.tags.includes('iconic');
  const days = item.relevantDays ? `Day${item.relevantDays.length > 1 ? 's' : ''} ${item.relevantDays.join(', ')}` : '';

  const address = item.address || '';
  const addressHtml = address
    ? `<a href="${mapsLink(address)}" target="_blank" rel="noopener" class="eats-address-link">📍 ${address}</a>`
    : '';

  const btns = [];
  if (item.phone)       btns.push(`<a href="tel:${item.phone}" class="btn-mini">📞 Call</a>`);
  if (item.website)     btns.push(`<a href="${item.website}" target="_blank" rel="noopener" class="btn-mini">🌐 Web</a>`);
  if ((item.bookingStatus === 'book-now') && item.bookingUrl) {
    btns.push(`<a href="${item.bookingUrl}" target="_blank" rel="noopener" class="btn-mini gold">⚡ Book</a>`);
  }

  const flagHtml = item.flag
    ? `<div class="activity-flag flag-${item.flag.type}"><span>${item.flag.text}</span></div>` : '';

  card.innerHTML = `
    <div class="eats-card-top">
      <div class="eats-tags">${isMustDo ? '<span class="eats-tag" style="background:rgba(200,151,58,0.2);color:var(--gold);border-color:rgba(200,151,58,0.4)">⭐ Must-Do</span>' : ''}${tags}</div>
      <span class="eats-price">${item.cost || ''}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px">
      <div class="eats-name">${item.name}</div>
      ${statusChip}
    </div>
    <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--sub-lite);margin-bottom:4px">
      📍 ${item.location}${days ? ` · <span style="color:var(--gold)">${days}</span>` : ''}
    </div>
    ${addressHtml}
    ${item.note ? `<div class="eats-note">${item.note}</div>` : ''}
    ${flagHtml}
    ${btns.length ? `<div class="eats-btns">${btns.join('')}</div>` : ''}
  `;

  return card;
}

// ── Reservations ───────────────────────────────────────────────────────────

function setupReservations() {
  const hasSetup = localStorage.getItem('res_setup_done');

  document.getElementById('tab-reservations').addEventListener('click-check', () => {});

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

// Called when user switches to reservations tab
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'reservations') {
        setTimeout(checkResAuth, 50);
      }
    });
  });
});

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
    localStorage.setItem('res_setup_done', 'true');
    grantResAccess();
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

      // Fall back to default hash if no PIN has been set up yet
      const defaultHash = await hashPin('202606');
      const correct = hash === storedHash || (!storedHash && hash === defaultHash);

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
      const resId = fileInput.dataset.resId;
      const reader = new FileReader();
      reader.onload = ev => {
        localStorage.setItem(`reservation_img_${resId}`, ev.target.result);
        renderReservations();
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
            <div class="pack-item-text">${text}</div>
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

function mapsLink(address) {
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

// Build-time placeholder replaced by GitHub Actions deploy workflow.
// Falls back to localStorage for local development.
const INJECTED_API_KEY    = '__ANTHROPIC_API_KEY_PLACEHOLDER__';
const ASK_KEY_STORAGE     = 'colorado26_ask_key';
const ASK_HISTORY_STORAGE = 'colorado26_ask_history';
const ASK_MODEL           = 'claude-sonnet-4-20250514';
const ASK_MAX_TOKENS      = 1024;
const ASK_HISTORY_LIMIT   = 6;

let askConversationHistory = [];
let askIsStreaming          = false;
let askCurrentLocation     = null;
let askInitialized         = false;

function initAskTab() {
  // Key is always available (injected at build time); show chat directly
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
  // Use build-time injected key (production); fall back to localStorage (local dev)
  if (INJECTED_API_KEY && !INJECTED_API_KEY.startsWith('__')) return INJECTED_API_KEY;
  return localStorage.getItem(ASK_KEY_STORAGE);
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
Day 1 — Fri Jun 19: Travel STL→Denver, arrive midnight. Hotel: Quality Inn & Suites Denver Airport, 6890 Tower Rd.
Day 2 — Sat Jun 20: Pikes Peak Cog Railway (9AM) + Garden of Gods + Red Rock Canyon. Hotel: Academy Hotel Colorado Springs.
Day 3 — Sun Jun 21: Vail Farmers Market (12:30–3PM) → Glenwood Springs. Hotel: Residence Inn Glenwood Springs.
Day 4 — Mon Jun 22: Maroon Bells 8AM shuttle (MAIN HIGHLIGHT) + Silver Queen Gondola + Cooper St Aspen. Hotel: Residence Inn Glenwood Springs.
Day 5 — Tue Jun 23: Blue Sky Adventures rafting (9AM) + Glenwood Hot Springs Pool + Iron Mountain Hot Springs. Hotel: Glenwood Hot Springs Lodge (Classic Double Queen, ground floor patio).
Day 6 — Wed Jun 24: Red Rocks Park (10:30AM) + Denver RiNo lunch + fly home DEN 8:45PM (WN#1324).

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
- Vail Farmers Market: Sundays 9:30AM–3PM, East Meadow Drive, Vail Village (Jun–Oct)

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
  const setup = document.getElementById('ask-setup');
  if (setup._listenersAttached) return;
  setup._listenersAttached = true;

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
