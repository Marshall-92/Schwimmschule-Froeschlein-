/* ============================================================
   Schwimmschule Fröschlein — gemeinsames Script
   Enthält die Logik aller Seiten. Jeder Abschnitt prüft erst,
   ob die nötigen Elemente auf der aktuellen Seite vorhanden
   sind, bevor er aktiv wird — diese eine Datei kann daher
   gefahrlos auf jeder Unterseite eingebunden werden.

   Kurse, Aktuelles und Team werden direkt in dieser Datei
   gepflegt (DEFAULT_NEWS, DEFAULT_COURSES, DEFAULT_TEAM).
   ============================================================ */

const CONTACT_EMAIL = 'info@schwimmschule-froeschlein.de';

const DEFAULT_NEWS = [
  {id:'n1', title:'Wir haben einen neuen Webauftritt!', text:'Die Schwimmschule Fröschlein präsentiert sich ab sofort mit einer neuen, modernen Website: übersichtlicher, schneller und auch am Smartphone bequem zu bedienen. Schaut euch in Ruhe um — hier findet ihr Informationen zu unseren Kursen, Standorten, unserem Team und den Schwimmabzeichen.', date:'2026-10-30'},
  {id:'n2', title:'Wir suchen Verstärkung in Hamburg-Sasel!', text:'Viele kleine Fröschlein möchten mit uns schwimmen lernen, doch dafür brauchen wir weitere Schwimmlehrer:innen für unseren Standort in Hamburg-Sasel. Wenn ihr Spaß an der Arbeit mit Kindern habt, meldet euch einfach bei uns — per E-Mail oder WhatsApp.', date:'2026-10-30'},
];

const DEFAULT_COURSES = [
  {id:'c1', lane:1, title:'Wassergewöhnung Eltern-Kind', location:'Norderstedt', dates:'Woche 1 · 27.–31. Juli · 9:00–9:45 Uhr', price:79},
  {id:'c2', lane:2, title:'Seepferdchen-Kurs', location:'Hamburg (TSV Sasel)', dates:'Woche 1 · 27.–31. Juli · 10:00–10:45 Uhr', price:89},
  {id:'c3', lane:3, title:'Seepferdchen-Kurs', location:'Norderstedt', dates:'Woche 2 · 3.–7. August · 9:00–9:45 Uhr', price:89},
  {id:'c4', lane:4, title:'Bronze-Kurs (Fortgeschrittene)', location:'Hamburg (TSV Sasel)', dates:'Woche 2 · 3.–7. August · 10:00–11:00 Uhr', price:99},
  {id:'c5', lane:5, title:'Silber-Kurs (Technik & Ausdauer)', location:'Pleystein bei Weiden', dates:'Woche 3 · 10.–14. August · 11:00–12:00 Uhr', price:109},
  {id:'c6', lane:6, title:'Seepferdchen-Kurs', location:'Pleystein bei Weiden', dates:'Woche 3 · 10.–14. August · 9:00–9:45 Uhr', price:89},
];

const DEFAULT_TEAM = [
  {id:'t1', name:'Cathleen Schult', role:'Schwimmtrainerin & Geschäftsführerin', bio:'', photo:'assets/team/team-cathleen.jpg'},
  {id:'t2', name:'Dani', role:'Schwimmtrainerin', bio:'', photo:'assets/team/team-dani.jpg'},
  {id:'t3', name:'Michelle', role:'Schwimmtrainerin', bio:'', photo:'assets/team/team-michelle.jpg'},
  {id:'t4', name:'Rana', role:'Schwimmtrainerin', bio:'', photo:'assets/team/team-rana.jpg'},
  {id:'t5', name:'Sarah', role:'Schwimmtrainerin', bio:'', photo:'assets/team/team-sarah.jpg'},
  {id:'t6', name:'Steffi', role:'Schwimmtrainerin', bio:'', photo:'assets/team/team-steffi.jpg'},
  {id:'t7', name:'Anna', role:'Schwimmtrainerin', bio:'', photo:''},
  {id:'t8', name:'Bine', role:'Schwimmtrainerin', bio:'', photo:''},
  {id:'t9', name:'Katy', role:'Schwimmtrainerin', bio:'', photo:''},
];

const LANE_PALETTES = [
  ['#E2833B','#E0836F'], ['#4EC0B8','#E6FBF9'], ['#1F5651','#E2833B'],
  ['#E0836F','#4EC0B8'], ['#E2833B','#1F5651'], ['#4EC0B8','#E0836F']
];

const courses = DEFAULT_COURSES;
const news = DEFAULT_NEWS;
const team = DEFAULT_TEAM;

function mailtoForCourse(course){
  const subject = encodeURIComponent('Kursanfrage: ' + course.title + ' (' + course.location + ')');
  const body = encodeURIComponent(
    'Hallo liebes Fröschlein-Team,\n\nich interessiere mich für folgenden Kurs:\n\n' +
    course.title + '\nOrt: ' + course.location + '\nTermin: ' + course.dates + '\n\nName des Kindes:\nGeburtsdatum des Kindes:\n\nHandynummer:\nE-Mail Adresse:\n\nViele Grüße'
  );
  return 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
}

/* ---------------- Öffentliche Kursanzeige ---------------- */
function renderCourses(){
  const grid = document.getElementById('course-grid');
  const filter = document.getElementById('location-filter').value;
  const list = filter === 'all' ? courses : courses.filter(c => c.location === filter);

  if(list.length === 0){
    grid.innerHTML = '<p>Für diesen Ort sind aktuell keine Kurse geplant. Schreibt uns gerne, wir richten bei Bedarf eine neue Gruppe ein.</p>';
    return;
  }

  grid.innerHTML = list.map(c => {
    const palette = LANE_PALETTES[(c.lane - 1) % LANE_PALETTES.length];
    const beads = palette.concat(palette, palette).slice(0,6);

    return `
    <div class="lane-card">
      <div class="lane-strip">
        ${beads.map(color => `<div class="lane-bead" style="background:${color}"></div>`).join('')}
        <div class="lane-number">BAHN ${c.lane}</div>
      </div>
      <div class="lane-body">
        <span class="lane-badge">${escapeHtml(c.location || 'Ort auf Anfrage')}</span>
        <h3>${escapeHtml(c.title)}</h3>
        <div class="lane-meta">
          <div><svg viewBox="0 0 24 24" fill="none" stroke="#4B6864" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke-linecap="round"/></svg>${escapeHtml(c.dates)}</div>
        </div>
        <div class="lane-footer">
          <div class="lane-price">${c.price} €<span>pro Kind / Kurswoche</span></div>
          <a class="btn-book" href="${mailtoForCourse(c)}">Anfragen</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ---------------- Aktuelles ---------------- */
function formatDateDe(iso){
  const d = new Date(iso + 'T00:00:00');
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'});
}

function renderNews(){
  const grid = document.getElementById('news-grid');
  if(!news || news.length === 0){
    grid.innerHTML = '<p class="news-empty">Aktuell gibt es keine neuen Meldungen.</p>';
    return;
  }
  const sorted = [...news].sort((a,b) => (a.date < b.date ? 1 : (a.date > b.date ? -1 : 0)));
  grid.innerHTML = sorted.map(n => `
    <div class="news-card">
      <span class="news-date">${formatDateDe(n.date)}</span>
      <h3>${escapeHtml(n.title)}</h3>
      <p>${escapeHtml(n.text)}</p>
    </div>
  `).join('');
}

/* ---------------- Mobiles Menü ---------------- */
const HAMBURGER_PATH = '<path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/>';
const CLOSE_PATH = '<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>';

function toggleMobileNav(forceClose){
  const nav = document.getElementById('nav-links');
  const toggleBtn = document.querySelector('.nav-toggle');
  const icon = document.getElementById('nav-toggle-icon');
  const isOpen = nav.classList.contains('open');
  const shouldOpen = forceClose === true ? false : !isOpen;

  nav.classList.toggle('open', shouldOpen);
  toggleBtn.setAttribute('aria-expanded', String(shouldOpen));
  toggleBtn.setAttribute('aria-label', shouldOpen ? 'Menü schließen' : 'Menü öffnen');
  icon.innerHTML = shouldOpen ? CLOSE_PATH : HAMBURGER_PATH;
}

if(document.getElementById('nav-links')){
  document.getElementById('nav-links').addEventListener('click', (e) => {
    if(e.target.tagName === 'A') toggleMobileNav(true);
  });
}

/* ---------------- Initialisierung Startseite ---------------- */
if(document.getElementById('nav-links')){
  const navToggle = document.querySelector('.nav-toggle');
  if(navToggle) navToggle.addEventListener('click', () => toggleMobileNav());
}
if(document.getElementById('course-grid')){
  document.getElementById('location-filter').addEventListener('change', renderCourses);
  renderCourses();
}
if(document.getElementById('news-grid')){ renderNews(); }


/* ===== Unser-Team-Seite ===== */

function teamCardHtml(m){
  const avatarInner = m.photo
    ? `<img src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" role="img" aria-label="Kein Foto vorhanden"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c0-4.1 3.4-6.6 7.5-6.6s7.5 2.5 7.5 6.6" stroke-linecap="round"/></svg>`;
  const role = m.role ? `<span class="role">${escapeHtml(m.role)}</span>` : '';
  const bio = m.bio ? `<p style="font-style:normal;">${escapeHtml(m.bio)}</p>` : '';
  return `
    <div class="team-card">
      <div class="avatar">${avatarInner}</div>
      <h2>${escapeHtml(m.name)}</h2>
      ${role}
      ${bio}
    </div>`;
}

function loadTeam(){
  const grid = document.getElementById('team-grid');
  if(team.length === 0){
    grid.innerHTML = '<p>Das Team wird gerade zusammengestellt — schaut bald wieder vorbei!</p>';
    return;
  }
  grid.innerHTML = team.map(m => teamCardHtml(m)).join('');
}

if(document.getElementById('team-grid')){ loadTeam(); }


/* ===== Standorte-Karte ===== */
if(document.getElementById('map') && typeof L !== 'undefined'){

  const map = L.map('map', { scrollWheelZoom: false }).setView([51.6, 10.8], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
    maxZoom: 18
  }).addTo(map);

  const froggyIcon = L.divIcon({
    className: 'froggy-marker',
    html: '<div style="width:16px;height:16px;border-radius:50%;background:#E0836F;border:3px solid #FFFFFF;box-shadow:0 2px 6px rgba(11,61,61,.35);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  const locations = [
    { name: 'Hamburg', coords: [53.5511, 9.9937] },
    { name: 'Norderstedt', coords: [53.6889, 9.9853] },
    { name: 'Pleystein bei Weiden (Oberpfalz)', coords: [49.6499, 12.4038] }
  ];

  locations.forEach(loc => {
    L.marker(loc.coords, { icon: froggyIcon }).addTo(map)
      .bindPopup('<b>' + loc.name + '</b>');
  });

}
