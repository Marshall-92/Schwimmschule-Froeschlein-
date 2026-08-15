/* ============================================================
   Schwimmschule Fröschlein — gemeinsames Script
   Enthaelt die Logik aller Seiten. Jeder Abschnitt prueft erst,
   ob die noetigen Elemente auf der aktuellen Seite vorhanden
   sind, bevor er aktiv wird -- diese eine Datei kann daher
   gefahrlos auf jeder Unterseite eingebunden werden.
   ============================================================ */

/* ===== Startseite (Kurse, Aktuelles, Team-Admin, Login) ===== */

/* ============================================================
   Datenmodell & Speicher
   Aktuelles und Ferienkurse werden über window.storage
   (shared=true) gespeichert, damit sie für alle Besucher:innen
   der Seite und über Sitzungen hinweg erhalten bleiben. Es gibt
   aktuell keine Buchungsfunktion, nur eine Infoliste.
   ============================================================ */
const NEWS_KEY = 'wr-news-v1';
const COURSES_KEY = 'wr-courses-v2';
const TEAM_KEY = 'wr-team-v1';
const CONTACT_EMAIL = 'info@schwimmschule-froeschlein.de';

const DEFAULT_NEWS = [
  {id:'n1', title:'Babyschwimmen im Arriba Bad Norderstedt', text:'Das Deutsche Rote Kreuz und unsere erfahrenen Schwimmlehrer Cathleen und Freddy leiten euch beim Babyschwimmen an und lassen euch mit euren Babys erste koordinative Übungen erfahren.', date:'2024-01-09'},
  {id:'n2', title:'Wir suchen Verstärkung!', text:'Viele kleine Fröschlein möchten mit uns schwimmen lernen, doch dafür brauchen wir weitere Schwimmlehrer! Wenn ihr Spaß an der Arbeit mit Kindern habt, meldet euch einfach über die Kontaktseite.', date:'2023-06-06'},
  {id:'n3', title:'Das Fröschlein', text:'Endlich ist es soweit: unsere Schwimmschule hat nun eine eigene Webseite. Ab sofort findet ihr hier Informationen zu uns, unseren Kursen und zum Schwimmen an sich.', date:'2023-04-08'},
];

const DEFAULT_COURSES = [
  {id:'c1', lane:1, title:'Wassergewöhnung Eltern-Kind', stage:'Kaulquappe', age:'3-5', ageLabel:'3–5 Jahre', dates:'Woche 1 · 27.–31. Juli · 9:00–9:45 Uhr', price:79},
  {id:'c2', lane:2, title:'Seepferdchen-Kurs', stage:'Frosch-Anfänger', age:'5-7', ageLabel:'5–7 Jahre', dates:'Woche 1 · 27.–31. Juli · 10:00–10:45 Uhr', price:89},
  {id:'c3', lane:3, title:'Seepferdchen-Kurs', stage:'Frosch-Anfänger', age:'5-7', ageLabel:'5–7 Jahre', dates:'Woche 2 · 3.–7. August · 9:00–9:45 Uhr', price:89},
  {id:'c4', lane:4, title:'Bronze-Kurs (Fortgeschrittene)', stage:'Frosch-Fortgeschritten', age:'6-9', ageLabel:'6–9 Jahre', dates:'Woche 2 · 3.–7. August · 10:00–11:00 Uhr', price:99},
  {id:'c5', lane:5, title:'Silber-Kurs (Technik & Ausdauer)', stage:'Springfrosch', age:'8-12', ageLabel:'8–12 Jahre', dates:'Woche 3 · 10.–14. August · 11:00–12:00 Uhr', price:109},
  {id:'c6', lane:6, title:'Seepferdchen-Kurs', stage:'Frosch-Anfänger', age:'5-7', ageLabel:'5–7 Jahre', dates:'Woche 3 · 10.–14. August · 9:00–9:45 Uhr', price:89},
];

const DEFAULT_TEAM = [
  {id:'t1', name:'Cathleen Schult', role:'Geschäftsführerin & Trainerin', bio:'', photo:''},
];

const LANE_PALETTES = [
  ['#E2833B','#E0836F'], ['#4EC0B8','#E6FBF9'], ['#1F5651','#E2833B'],
  ['#E0836F','#4EC0B8'], ['#E2833B','#1F5651'], ['#4EC0B8','#E0836F']
];

let courses = [];
let news = [];
let team = [];

async function loadData(){
  try{
    const n = await window.storage.get(NEWS_KEY, true);
    news = JSON.parse(n.value);
  }catch(e){
    news = DEFAULT_NEWS;
    try{ await window.storage.set(NEWS_KEY, JSON.stringify(news), true); }catch(e2){ console.error('Konnte Aktuelles nicht speichern', e2); }
  }
  try{
    const c = await window.storage.get(COURSES_KEY, true);
    courses = JSON.parse(c.value);
  }catch(e){
    courses = DEFAULT_COURSES;
    try{ await window.storage.set(COURSES_KEY, JSON.stringify(courses), true); }catch(e2){ console.error('Konnte Kurse nicht speichern', e2); }
  }
  try{
    const t = await window.storage.get(TEAM_KEY, true);
    team = JSON.parse(t.value);
  }catch(e){
    team = DEFAULT_TEAM;
    try{ await window.storage.set(TEAM_KEY, JSON.stringify(team), true); }catch(e2){ console.error('Konnte Team nicht speichern', e2); }
  }
  renderCourses();
  renderNews();
  renderAdminNews();
  renderAdminCourses();
  renderAdminTeam();
}

async function saveTeam(){
  try{ await window.storage.set(TEAM_KEY, JSON.stringify(team), true); }
  catch(e){ showToast('Fehler beim Speichern des Teams.'); console.error(e); }
}

async function saveNews(){
  try{ await window.storage.set(NEWS_KEY, JSON.stringify(news), true); }
  catch(e){ showToast('Fehler beim Speichern der Neuigkeit.'); console.error(e); }
}

async function saveCourses(){
  try{ await window.storage.set(COURSES_KEY, JSON.stringify(courses), true); }
  catch(e){ showToast('Fehler beim Speichern der Kurse.'); console.error(e); }
}

function mailtoForCourse(course){
  const subject = encodeURIComponent('Anfrage Ferienkurs: ' + course.title + ' (' + course.dates + ')');
  const body = encodeURIComponent(
    'Hallo liebes Fröschlein-Team,\n\nich interessiere mich für folgenden Kurs:\n\n' +
    course.title + '\n' + course.dates + '\n\nName des Kindes:\nGeburtsdatum des Kindes:\n\nHandynummer:\nE-Mail Adresse:\n\nViele Grüße'
  );
  return 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
}

/* ---------------- Öffentliche Kursanzeige ---------------- */
function renderCourses(){
  const grid = document.getElementById('course-grid');
  const filter = document.getElementById('age-filter').value;
  const list = filter === 'all' ? courses : courses.filter(c => c.age === filter);

  if(list.length === 0){
    grid.innerHTML = '<p>Für diese Altersgruppe sind aktuell keine Kurse geplant. Schreibt uns gerne, wir richten bei Bedarf eine neue Gruppe ein.</p>';
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
        <span class="lane-badge">${escapeHtml(c.stage || 'Fröschlein')}</span><span class="lane-badge age-badge">${c.ageLabel}</span>
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
  const sorted = [...news].sort((a,b) => (a.date < b.date ? 1 : -1));
  grid.innerHTML = sorted.map(n => `
    <div class="news-card">
      <span class="news-date">${formatDateDe(n.date)}</span>
      <h3>${escapeHtml(n.title)}</h3>
      <p>${escapeHtml(n.text)}</p>
    </div>
  `).join('');
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---------------- Admin ---------------- */
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

const ADMIN_USERNAME = 'Schult';
const ADMIN_PASSWORD = 'Fröschlein';

function toggleAdminGate(e){
  e.preventDefault();
  const section = document.getElementById('admin-section');
  if(section.classList.contains('open')){
    section.classList.remove('open');
    return;
  }
  openAdminLogin();
}

function openAdminLogin(){
  document.getElementById('admin-login-overlay').classList.add('open');
  document.getElementById('admin-login-error').textContent = '';
  setTimeout(() => document.getElementById('admin-user').focus(), 50);
}

function closeAdminLogin(){
  document.getElementById('admin-login-overlay').classList.remove('open');
  document.getElementById('admin-login-form').reset();
  document.getElementById('admin-login-error').textContent = '';
}

function submitAdminLogin(e){
  e.preventDefault();
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value;
  if(user === ADMIN_USERNAME && pass === ADMIN_PASSWORD){
    closeAdminLogin();
    const section = document.getElementById('admin-section');
    section.classList.add('open');
    section.scrollIntoView({behavior:'smooth'});
  } else {
    document.getElementById('admin-login-error').textContent = 'Benutzername oder Passwort falsch.';
  }
}

if(document.getElementById('admin-login-overlay')){
  document.getElementById('admin-login-overlay').addEventListener('click', (e) => {
    if(e.target.id === 'admin-login-overlay') closeAdminLogin();
  });
}
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeAdminLogin();
});

const AGE_LABELS = {'3-5':'3–5 Jahre','5-7':'5–7 Jahre','6-9':'6–9 Jahre','8-12':'8–12 Jahre'};

function renderAdminCourses(){
  const body = document.getElementById('admin-course-body');
  body.innerHTML = courses.map(c => `
    <tr>
      <td><input value="${escapeHtml(c.title)}" onchange="updateCourseField('${c.id}','title',this.value)"></td>
      <td><input value="${escapeHtml(c.stage || '')}" onchange="updateCourseField('${c.id}','stage',this.value)"></td>
      <td>
        <select onchange="updateCourseAge('${c.id}',this.value)">
          ${Object.entries(AGE_LABELS).map(([val,label]) => `<option value="${val}" ${c.age===val?'selected':''}>${label}</option>`).join('')}
        </select>
      </td>
      <td><input value="${escapeHtml(c.dates)}" onchange="updateCourseField('${c.id}','dates',this.value)"></td>
      <td><input type="number" min="0" value="${c.price}" onchange="updateCourseField('${c.id}','price',parseInt(this.value,10)||0)"></td>
      <td><button class="admin-mini-btn danger" onclick="deleteCourse('${c.id}')">Löschen</button></td>
    </tr>
  `).join('');
}

async function updateCourseField(courseId, field, value){
  const course = courses.find(c => c.id === courseId);
  if(!course) return;
  course[field] = value;
  await saveCourses();
  renderCourses();
  showToast('Kurs aktualisiert.');
}

async function updateCourseAge(courseId, ageVal){
  const course = courses.find(c => c.id === courseId);
  if(!course) return;
  course.age = ageVal;
  course.ageLabel = AGE_LABELS[ageVal];
  await saveCourses();
  renderCourses();
  showToast('Kurs aktualisiert.');
}

async function deleteCourse(courseId){
  if(!confirm('Diesen Kurs wirklich löschen?')) return;
  courses = courses.filter(c => c.id !== courseId);
  await saveCourses();
  renderCourses();
  renderAdminCourses();
  showToast('Kurs gelöscht.');
}

async function addCourse(e){
  e.preventDefault();
  const age = document.getElementById('ac-age').value;
  const maxLane = courses.reduce((m,c) => Math.max(m, c.lane || 0), 0);
  const newCourse = {
    id: 'c_' + Date.now(),
    lane: maxLane + 1 > 6 ? (maxLane % 6) + 1 : maxLane + 1,
    title: document.getElementById('ac-title').value.trim(),
    stage: document.getElementById('ac-stage').value.trim(),
    age, ageLabel: AGE_LABELS[age],
    dates: document.getElementById('ac-dates').value.trim(),
    price: parseInt(document.getElementById('ac-price').value, 10) || 0
  };
  courses.push(newCourse);
  await saveCourses();
  renderCourses();
  renderAdminCourses();
  e.target.reset();
  document.getElementById('ac-price').value = 89;
  showToast('Kurs hinzugefügt.');
}

function renderAdminTeam(){
  const body = document.getElementById('admin-team-body');
  if(!team || team.length === 0){
    body.innerHTML = '<tr><td colspan="5" style="color:var(--ink-600);">Noch keine Teammitglieder.</td></tr>';
    return;
  }
  body.innerHTML = team.map(m => `
    <tr>
      <td><input value="${escapeHtml(m.name)}" onchange="updateTeamField('${m.id}','name',this.value)"></td>
      <td><input value="${escapeHtml(m.role)}" onchange="updateTeamField('${m.id}','role',this.value)"></td>
      <td><input value="${escapeHtml(m.bio || '')}" onchange="updateTeamField('${m.id}','bio',this.value)"></td>
      <td style="min-width:150px;">
        ${m.photo ? `<img src="${escapeHtml(m.photo)}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;">` : ''}
        <input type="file" accept="image/*" style="width:auto;min-width:120px;" onchange="handleTeamPhotoUpload(event, '${m.id}')">
        <p class="upload-status" id="team-photo-status-${m.id}"></p>
      </td>
      <td><button class="admin-mini-btn danger" onclick="deleteTeamMember('${m.id}')">Löschen</button></td>
    </tr>
  `).join('');
}

async function updateTeamField(memberId, field, value){
  const member = team.find(m => m.id === memberId);
  if(!member) return;
  member[field] = value;
  await saveTeam();
  showToast('Team aktualisiert.');
}

async function deleteTeamMember(memberId){
  if(!confirm('Dieses Teammitglied wirklich löschen?')) return;
  team = team.filter(m => m.id !== memberId);
  await saveTeam();
  renderAdminTeam();
  showToast('Teammitglied gelöscht.');
}

/* ---------------- Foto-Upload (ImgBB) ---------------- */
// Kostenlosen API-Key auf https://api.imgbb.com/ holen und hier eintragen:
const IMGBB_API_KEY = '3692024428bf1c7d29eb6f2679530c8a';

async function uploadToImgbb(file){
  if(!IMGBB_API_KEY || IMGBB_API_KEY === 'DEIN_IMGBB_API_KEY'){
    throw new Error('Kein ImgBB-API-Key hinterlegt. Bitte IMGBB_API_KEY im Code eintragen.');
  }
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_API_KEY, {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
  if(!response.ok || !data.success){
    throw new Error(data?.error?.message || 'Upload fehlgeschlagen');
  }
  return data.data.url;
}

async function handlePhotoUpload(e, targetFieldId, statusId){
  const file = e.target.files[0];
  const status = document.getElementById(statusId);
  if(!file) return;
  status.textContent = 'Wird hochgeladen …';
  status.className = 'upload-status';
  try{
    const url = await uploadToImgbb(file);
    document.getElementById(targetFieldId).value = url;
    status.textContent = 'Hochgeladen ✓';
    status.className = 'upload-status success';
  }catch(err){
    console.error(err);
    status.textContent = 'Fehler: ' + err.message;
    status.className = 'upload-status error';
  }
}

async function handleTeamPhotoUpload(e, memberId){
  const file = e.target.files[0];
  const status = document.getElementById('team-photo-status-' + memberId);
  if(!file) return;
  status.textContent = 'Wird hochgeladen …';
  status.className = 'upload-status';
  try{
    const url = await uploadToImgbb(file);
    const member = team.find(m => m.id === memberId);
    if(member){
      member.photo = url;
      await saveTeam();
      renderAdminTeam();
      showToast('Foto hochgeladen und gespeichert.');
    }
  }catch(err){
    console.error(err);
    status.textContent = 'Fehler: ' + err.message;
    status.className = 'upload-status error';
  }
}

async function addTeamMember(e){
  e.preventDefault();
  const newMember = {
    id: 't_' + Date.now(),
    name: document.getElementById('at-name').value.trim(),
    role: document.getElementById('at-role').value.trim(),
    bio: document.getElementById('at-bio').value.trim(),
    photo: document.getElementById('at-photo').value.trim()
  };
  team.push(newMember);
  await saveTeam();
  renderAdminTeam();
  e.target.reset();
  document.getElementById('at-photo-status').textContent = '';
  showToast('Teammitglied hinzugefügt.');
}

function renderAdminNews(){
  const list = document.getElementById('admin-news-list');
  if(!news || news.length === 0){
    list.innerHTML = '<p style="font-size:.85rem;color:var(--ink-600);">Noch keine Meldungen vorhanden.</p>';
    return;
  }
  const sorted = [...news].sort((a,b) => (a.date < b.date ? 1 : -1));
  list.innerHTML = sorted.map(n => `
    <div class="booking-row">
      <b>${escapeHtml(n.title)} <span style="font-weight:400;color:var(--ink-600);">— ${formatDateDe(n.date)}</span></b>
      <span>${escapeHtml(n.text)}</span>
      <button class="admin-mini-btn danger" style="margin-top:6px;" onclick="deleteNews('${n.id}')">Meldung löschen</button>
    </div>
  `).join('');
}

async function addNews(e){
  e.preventDefault();
  const entry = {
    id: 'n_' + Date.now(),
    title: document.getElementById('an-title').value.trim(),
    text: document.getElementById('an-text').value.trim(),
    date: document.getElementById('an-date').value
  };
  news.push(entry);
  await saveNews();
  renderNews();
  renderAdminNews();
  e.target.reset();
  showToast('Meldung veröffentlicht.');
}

async function deleteNews(newsId){
  if(!confirm('Diese Meldung wirklich löschen?')) return;
  news = news.filter(n => n.id !== newsId);
  await saveNews();
  renderNews();
  renderAdminNews();
  showToast('Meldung gelöscht.');
}

if(document.getElementById('nav-links')){ loadData(); }


/* ===== Unser-Team-Seite (oeffentliche Anzeige) ===== */

function teamCardHtml(m, isPlaceholder){
  const avatarInner = m.photo
    ? `<img src="${escapeHtml(m.photo)}" alt="${escapeHtml(m.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c0-4.1 3.4-6.6 7.5-6.6s7.5 2.5 7.5 6.6" stroke-linecap="round"/></svg>`;
  const name = m.name || '[Name folgt]';
  const role = m.role || '[Rolle folgt]';
  const bio = m.bio || '[Kurzvorstellung folgt]';
  const tag = m.photo ? '' : `<div class="placeholder-tag">Foto folgt</div>`;
  return `
    <div class="team-card">
      <div class="avatar">${avatarInner}</div>
      <h3>${escapeHtml(name)}</h3>
      <span class="role">${escapeHtml(role)}</span>
      <p style="${m.bio ? 'font-style:normal;' : ''}">${escapeHtml(bio)}</p>
      ${tag}
    </div>`;
}

async function loadTeam(){
  const grid = document.getElementById('team-grid');
  let team = [];
  try{
    const t = await window.storage.get(TEAM_KEY, true);
    team = JSON.parse(t.value);
  }catch(e){
    team = [{id:'t1', name:'Cathleen Schult', role:'Geschäftsführerin & Trainerin', bio:'', photo:''}];
  }

  if(team.length === 0){
    grid.innerHTML = '<p>Das Team wird gerade zusammengestellt — schaut bald wieder vorbei!</p>';
    return;
  }

  grid.innerHTML = team.map(m => teamCardHtml(m)).join('') + `
    <div class="add-more">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
      Weitere Teammitglieder folgen
    </div>`;
}

if(document.getElementById('team-grid')){ loadTeam(); }


/* ===== Warteliste-Formular ===== */

function formatDobInput(e){
  const cursorAtEnd = e.target.selectionStart === e.target.value.length;
  let digits = e.target.value.replace(/\D/g, '').slice(0, 8);
  let formatted = digits;
  if(digits.length > 4){
    formatted = digits.slice(0,2) + '.' + digits.slice(2,4) + '.' + digits.slice(4);
  } else if(digits.length > 2){
    formatted = digits.slice(0,2) + '.' + digits.slice(2);
  }
  e.target.value = formatted;
  if(cursorAtEnd){
    e.target.setSelectionRange(formatted.length, formatted.length);
  }
}

async function submitWaitlist(e){
  e.preventDefault();
  const form = document.getElementById('waitlist-form');
  const btn = document.getElementById('waitlist-submit-btn');
  const status = document.getElementById('form-status');

  status.classList.remove('visible', 'error');
  status.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Wird gesendet …';

  try{
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if(response.ok){
      form.reset();
      document.getElementById('waitlist-form').closest('.waitlist-card').style.display = 'none';
      document.getElementById('waitlist-success').style.display = 'block';
    } else {
      throw new Error('Formspree-Fehler: ' + response.status);
    }
  }catch(err){
    console.error(err);
    status.textContent = 'Da ist etwas schiefgelaufen. Bitte versucht es erneut oder schreibt uns direkt an info@schwimmschule-froeschlein.de.';
    status.classList.add('visible', 'error');
    btn.disabled = false;
    btn.textContent = 'In die Warteliste eintragen';
  }
}


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

