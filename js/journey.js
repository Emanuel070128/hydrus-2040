/* =====================================================
   HYDRUS 2040 — JOURNEY: launch countdown, trajectory,
   mission map and animation slots
   ===================================================== */

const mission = () => MISSIONS[GAME.destination.id];
const hydrusSays = (text, extra = '') =>
  `<div class="jr-say" ${extra}><img src="assets/images/control-hydrus-face.png" alt=""><div><b>CONTROL HYDRUS</b><p>${text}</p></div></div>`;

/* =====================================================
   5. LAUNCH: GO poll + countdown + liftoff
   ===================================================== */
const LN = { phase: 'poll', go: [], t0: 0, raf: 0 };

function launchEnter() {
  const n = GAME.players.length;
  LN.phase = 'poll'; LN.go = Array(n).fill(false); LN.t0 = performance.now();
  $('#launch-stage').innerHTML = `
    <div class="ln-bg"></div>
    <div class="ai-tag ln-ai">AI-generated illustration</div>
    <video class="ln-video hidden" id="ln-video" muted playsinline preload="auto"></video>
    <div class="ln-shade"></div>
    <div class="ln-top"><h1>LAUNCH SEQUENCE · HYDRUS 2040 → ${GAME.destination.name}</h1>
      <small>${ROCKETS.find((r) => r.id === GAME.rocket).name} rocket · Fuel ${GAME.fuel}% · Crew of ${n}</small></div>
    <div class="ln-count"><small id="ln-label">GO / NO-GO POLL</small><b id="ln-num">--</b><span id="ln-event"></span></div>
    <div class="ln-poll" id="ln-poll">${GAME.players.map((name, i) => `
      <div class="ln-seat" id="ln-seat-${i}" style="--c:${PLAYER_STYLE[i].color}">
        <span class="sh">${PLAYER_STYLE[i].shape}</span><div><b>${esc(name)}</b><small>Press <i>${KEY_LABELS[i][1]}</i> for GO</small></div>
        <span class="st" id="ln-st-${i}">GO?</span></div>`).join('')}</div>
    <div class="ln-tel hidden" id="ln-tel"></div>
    <div class="ln-big hidden" id="ln-big">LIFTOFF!</div>
    <div id="ln-say">${hydrusSays('All stations, this is Control Hydrus. Give me a GO for launch: press your middle key!')}</div>
    <button class="btn btn-small ln-skip" id="ln-skip">Skip ▸▸</button>${backButton('hangar')}`;
  const v = $('#ln-video');
  v.addEventListener('loadeddata', () => v.classList.remove('hidden'));
  v.addEventListener('error', () => v.classList.add('hidden'));
  if (LAUNCH_VIDEO) v.src = LAUNCH_VIDEO;
  $('#ln-skip').addEventListener('click', () => showScreen('trajectory'));
  cancelAnimationFrame(LN.raf); LN.raf = requestAnimationFrame(launchLoop);
}

function launchKey(i, k, down) {
  if (!down || LN.phase !== 'poll' || k !== 1 || LN.go[i]) return;
  LN.go[i] = true;
  $('#ln-seat-' + i).classList.add('go'); $('#ln-st-' + i).textContent = '✓ GO';
  if (LN.go.every(Boolean)) {
    LN.phase = 'count'; LN.t0 = performance.now();
    $('#ln-say').innerHTML = hydrusSays('GO from every station. Hold on tight, crew. Here we go!');
  }
}

function launchLoop(now) {
  if (currentScreen !== 'launch') return;
  const t = (now - LN.t0) / 1000;
  if (LN.phase === 'poll') {
    $('#ln-num').textContent = `${LN.go.filter(Boolean).length}/${LN.go.length}`;
  }
  if (LN.phase === 'count') {
    const T = 10 - Math.floor(t);
    $('#ln-label').textContent = 'T MINUS';
    $('#ln-num').textContent = String(Math.max(0, T)).padStart(2, '0');
    $('#ln-event').textContent = T <= 6 ? (T <= 3 ? 'ENGINES AT FULL POWER' : 'MAIN ENGINES START') : '';
    $('#launch-stage').classList.toggle('shake', T <= 6);
    if (t >= 10) {
      LN.phase = 'lift'; LN.t0 = now;
      $('#ln-poll').classList.add('hidden'); $('#ln-big').classList.remove('hidden'); $('#ln-tel').classList.remove('hidden');
      const v = $('#ln-video'); if (!v.classList.contains('hidden')) { v.currentTime = 0; v.play().catch(() => {}); }
      $('#ln-say').innerHTML = hydrusSays(`We have liftoff! Hydrus 2040 has cleared the tower. Next stop: ${GAME.destination.name.charAt(0) + GAME.destination.name.slice(1).toLowerCase()}!`);
    }
  }
  if (LN.phase === 'lift') {
    $('#ln-label').textContent = 'T PLUS';
    $('#ln-num').textContent = '00:' + String(Math.floor(t)).padStart(2, '0');
    $('#ln-event').textContent = t > 4 ? 'BOOSTER SEPARATION' : '';
    $('#ln-big').style.opacity = Math.max(0, 1 - (t - 1.5) / 1);
    $('#ln-tel').innerHTML = `<div>ALTITUDE<b>${(t * t * 4.2).toFixed(1)} km</b></div><div>SPEED<b>${Math.round(t * t * 310 + t * 120)} km/h</b></div><div>G-FORCE<b>${(1.2 + t * .45).toFixed(1)} g</b></div>`;
    $('#launch-stage').classList.toggle('shake', t < 5);
    $('.ln-bg').style.transform = `translateY(${t * t * 9}px)`;
    if (t > 7) { showScreen('trajectory'); return; }
  }
  LN.raf = requestAnimationFrame(launchLoop);
}
SCREENS.launch = { enter: launchEnter, key: launchKey };

/* =====================================================
   6. TRAJECTORY
   ===================================================== */
const TRAVEL_DAYS = { light: 180, medium: 210, heavy: 240 };   // default (Mars): a trip takes about 7 months
const travelDays = () => (mission().travelDays || TRAVEL_DAYS)[GAME.rocket];
const label = (x, y, text, col) => `<text x="${x}" y="${y}" text-anchor="middle" fill="${col}" font-family="Orbitron" font-size="18">${text}</text>`;

// Map drawing for each destination (the texts and days live in js/missions/<planet>.js)
const TRAJ_MAPS = {
  // Earth-centered: short trip to the Moon
  moon: { kind: 'Translunar trajectory', path: 'M 690 560 C 760 300, 1150 230, 1330 380', svg: `
      <circle cx="640" cy="580" r="725" fill="none" stroke="#cbd5e155" stroke-dasharray="4 8"/>
      <circle cx="640" cy="580" r="58" fill="#1d6fd8" stroke="#7dd3fc" stroke-width="3"/><circle cx="640" cy="580" r="90" fill="#38bdf81a"/>
      ${label(640, 680, 'EARTH', '#7dd3fc')}
      <circle cx="1340" cy="390" r="22" fill="#c9c9c9"/>${label(1340, 350, 'MOON', '#e2e8f0')}` },
  // Sun-centered: Earth to Mars transfer orbit
  mars: { kind: 'Transfer orbit', path: 'M 560 540 C 600 230, 1100 170, 1360 360', svg: `
      <circle cx="960" cy="560" r="400" fill="none" stroke="#38bdf855" stroke-dasharray="4 8"/>
      <circle cx="960" cy="560" r="560" fill="none" stroke="#f9731655" stroke-dasharray="4 8"/>
      <circle cx="960" cy="560" r="34" fill="#fde047"/><circle cx="960" cy="560" r="70" fill="#fde04722"/>
      <circle cx="560" cy="540" r="18" fill="#1d6fd8" stroke="#7dd3fc" stroke-width="3"/>${label(560, 590, 'EARTH', '#7dd3fc')}
      <circle cx="1360" cy="360" r="15" fill="#dc5a2a"/>${label(1360, 320, 'MARS', '#fdba74')}` },
  // Sun-centered: long trip out to Jupiter, then Europa
  europa: { kind: 'Transfer to Jupiter', path: 'M 760 560 C 700 160, 1300 120, 1500 330', svg: `
      <circle cx="960" cy="560" r="200" fill="none" stroke="#38bdf855" stroke-dasharray="4 8"/>
      <circle cx="960" cy="560" r="300" fill="none" stroke="#f9731633" stroke-dasharray="4 8"/>
      <circle cx="960" cy="560" r="600" fill="none" stroke="#fbbf2455" stroke-dasharray="4 8"/>
      <circle cx="960" cy="560" r="22" fill="#fde047"/><circle cx="960" cy="560" r="44" fill="#fde04722"/>
      <circle cx="760" cy="560" r="14" fill="#1d6fd8" stroke="#7dd3fc" stroke-width="3"/>${label(760, 605, 'EARTH', '#7dd3fc')}
      <circle cx="1510" cy="320" r="34" fill="#d6b48c"/><circle cx="1510" cy="320" r="56" fill="none" stroke="#e2e8f055" stroke-dasharray="3 6"/>
      <circle cx="1562" cy="306" r="6" fill="#f1e6d6"/>${label(1510, 255, 'JUPITER · EUROPA', '#fde68a')}` }
};

let trajRaf = 0;
function trajectoryEnter() {
  const m = mission(), days = travelDays(), map = TRAJ_MAPS[GAME.destination.id] || TRAJ_MAPS.mars;
  const path = map.path;
  $('#traj-stage').innerHTML = `
    <div class="jr-bg"></div>
    <div class="ln-top"><h1>TRAJECTORY · EARTH → ${GAME.destination.name}</h1><small>${map.kind} · ${days} days in space</small></div>
    <svg class="tr-map" viewBox="0 0 1920 1080">
      ${map.svg}
      <path id="tr-path" d="${path}" fill="none" stroke="#38bdf8" stroke-width="4" style="filter:drop-shadow(0 0 8px #0ea5e9)"/>
      <g id="tr-ship"><path d="M14 0 L-10 -9 L-5 0 L-10 9Z" fill="#fff" stroke="#38bdf8" stroke-width="2"/><circle cx="-12" cy="0" r="4" fill="#f59e0b"/></g>
      <text id="tr-day" x="960" y="960" text-anchor="middle" fill="#e0f2fe" font-family="Orbitron" font-size="34"></text>
    </svg>
    ${hydrusSays(m.tripText || 'A trip to Mars takes about 7 months. NASA launches when Earth and Mars line up, about every 26 months.', 'style="left:40px;top:150px;width:620px"')}
    <button class="btn btn-main tr-go hidden" id="tr-go">TO THE MISSION MAP ▸</button>${backButton('hangar')}`;
  $('#tr-go').addEventListener('click', toMissionMap);
  const p = $('#tr-path'), L = p.getTotalLength(), t0 = performance.now();
  cancelAnimationFrame(trajRaf);
  const loop = (now) => {
    if (currentScreen !== 'trajectory') return;
    const f = Math.min(1, (now - t0) / 6000), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    const a = p.getPointAtLength(L * e), b = p.getPointAtLength(Math.min(L, L * e + 1));
    $('#tr-ship').setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 57.3})`);
    $('#tr-day').textContent = `DAY ${Math.round(days * e)} / ${days}`;
    if (f >= 1) $('#tr-go').classList.remove('hidden'); else trajRaf = requestAnimationFrame(loop);
  };
  trajRaf = requestAnimationFrame(loop);
}
SCREENS.trajectory = { enter: trajectoryEnter, key: (i, k, d) => { if (d && k === 1 && !$('#tr-go').classList.contains('hidden')) toMissionMap(); } };
// Mars, the Moon and Europa use the same 5-sector map + rover level, each with its own data (mars-level/js/planets.js).
function toMissionMap() { showScreen('rover'); }   // every world now uses the 5-sector map + rover level (mars-level/?planet=...)

/* =====================================================
   7b. MARS ROVER LEVEL (runs in its own page inside a frame)
   ===================================================== */
const MARS_FACTS = [
  { text: 'Curiosity and Perseverance landed in about 7 minutes: heat shield, parachute, retro-rockets and a "sky crane".', source: 'Live Science – Perseverance landing', url: 'https://www.livescience.com/perseverance-mars-2020-rover-landing-video.html' },
  { text: 'In 2018, a dust storm that covered all of Mars shut down the Opportunity rover forever.', source: 'NASA – Opportunity mission comes to end', url: 'https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end' },
  { text: 'Wind on Mars cleaned the panels of Spirit and Opportunity several times, so they lasted years longer than planned.', source: 'NASA – Dust cleanings', url: 'https://www.nasa.gov/?p=70994' },
  { text: 'In 2024, Perseverance found a rock with "leopard spots". In 2025, NASA called it a potential sign of ancient life, still unconfirmed.', source: 'NASA JPL – Potential biosignature', url: 'https://www.jpl.nasa.gov/news/nasa-says-mars-rover-discovered-potential-biosignature-last-year/' },
  { text: 'Every two years, Mars goes behind the Sun and NASA stops sending commands to its robots for about two weeks.', source: 'Pasadena Now – JPL', url: 'https://www.pasadenanow.com/main/?p=536307' },
  { text: 'In 2008, the Phoenix mission found perchlorates in Martian soil: a chemical that can be toxic.', source: 'NASA JPL – Phoenix results', url: 'https://www.jpl.nasa.gov/news/nasa-phoenix-results-point-to-martian-climate-cycles/' },
  { text: 'In 2008, the Phoenix lander touched and confirmed water ice under the Martian soil.', source: 'Space.com – Phoenix Mars Lander', url: 'https://www.space.com/42947-phoenix-mars-lander.html' }
];
function roverEnter() {
  const names = GAME.players.map((n) => encodeURIComponent(String(n).replace(/,/g, ' '))).join(',');
  const f = $('#rover-frame');
  f.onload = () => { try { f.contentWindow.focus(); } catch (e) {} };
  f.src = `mars-level/index.html?planet=${GAME.destination.id}&n=${GAME.players.length}&names=${names}&kits=${GAME.items.repair || 0}${typeof MUSIC !== 'undefined' && MUSIC.muted ? '&music=off' : ''}`;
}
window.addEventListener('message', (e) => {
  const r = e.data;
  if (!r || currentScreen !== 'rover') return;
  if (r.type === 'hydrus-mars-back') { $('#rover-frame').src = 'about:blank'; return showScreen('trajectory'); }   // ◂ BACK on the Mars map
  if (r.type === 'hydrus-mars-menu') { $('#rover-frame').src = 'about:blank'; return showScreen('title'); }       // pause menu → MAIN MENU
  if (r.type !== 'hydrus-mars-done') return;
  const goal = r.ice > 0, antenna = (GAME.items.antenna || 0) > 0;
  GAME.report = { survived: true, why: null, goal, samples: r.ice, unit: 'MB', c: calculate(), antenna,
    inv: { energy: r.energy, hull: Math.round(r.hull / r.maxHull * 100), o2: r.o2, kits: r.kits, data: r.data },
    dataSent: Math.round(r.data * (antenna ? 1 : .6)),
    log: r.log.map((s) => ({ title: `SECTOR · ${s.name}`, text: (s.notes.join(' · ') || 'drove through') + ` (${Math.floor(s.time / 60)}:${String(Math.floor(s.time % 60)).padStart(2, '0')})` })),
    facts: r.facts || MARS_FACTS, score: r.score };
  $('#rover-frame').src = 'about:blank';
  showScreen('report');
});
SCREENS.rover = { enter: roverEnter };

/* =====================================================
   7. MISSION MAP (click the points to see the plan)
   ===================================================== */
function mapEnter() {
  const m = mission();
  const route = m.map.map((p) => `${p.x * 12},${p.y * 9.4 + 90}`).join(' ');
  const plan = m.steps.filter((s) => s.type === 'event');
  $('#map-stage').innerHTML = `
    <div class="mp-bg" ${m.mapImage ? `style="background-image:url(${m.mapImage});background-position:${m.mapPosition || 'center'};background-size:${m.mapSize || 'cover'}"` : ''}></div>
    <div class="ln-top"><h1>MISSION MAP · ${m.name} · ${m.place.toUpperCase()}</h1><small>${m.title} · Goal: ${m.goalName}</small></div>
    <svg class="mp-svg" viewBox="0 0 1920 1080">
      <polyline points="${route}" fill="none" stroke="#e0f2fe" stroke-width="4" stroke-dasharray="14 10" opacity=".85"/>
      ${m.map.map((p, i) => `<g class="mp-pin" data-i="${i}" transform="translate(${p.x * 12} ${p.y * 9.4 + 90})">
        <circle r="44" fill="${p.color}" opacity=".18"/><circle r="28" fill="#04122b" stroke="${p.color}" stroke-width="4"/>
        <text y="9" text-anchor="middle" font-size="24" font-family="Orbitron" fill="${p.color}">${p.icon}</text>
        <rect x="-95" y="36" width="190" height="28" rx="6" fill="#04122bdd"/>
        <text y="56" text-anchor="middle" font-size="13" font-family="Orbitron" fill="#e0f2fe">${p.label}</text></g>`).join('')}
    </svg>
    <div class="mp-card hidden" id="mp-card"></div>${backButton('trajectory')}
    ${hydrusSays(m.mapIntro || `This is ${m.place}. Click any point to see what we will do there.`, 'style="left:40px;top:140px;width:640px"')}
    <aside class="mp-plan"><h3>MISSION PLAN</h3>
      ${plan.map((s, i) => `<div class="mp-day ${s.kind}"><b>${i + 1}</b><div><p>${s.alert}</p><small>${s.kind === 'decision' ? 'Team decision' : s.kind === 'minigame' ? 'Minigame · ' + s.station.toUpperCase() : 'Kit or minigame · ' + s.station.toUpperCase()}</small></div></div>`).join('')}
      <button class="lb" id="mp-start">START MISSION ▸</button></aside>`;
  $('.mp-svg').addEventListener('click', (e) => {
    const g = e.target.closest('.mp-pin'); if (!g) return;
    const p = m.map[+g.dataset.i], card = $('#mp-card');
    card.innerHTML = `<b style="color:${p.color}">${p.label}</b><p>${p.text}</p>`;
    card.style.left = Math.min(p.x * 12 + 50, 1040) + 'px'; card.style.top = Math.max(150, p.y * 9.4) + 'px';
    card.classList.remove('hidden');
  });
  $('#mp-start').addEventListener('click', startPlanet);
}
function startPlanet() {
  const m = mission();
  playAnimSlot({ title: 'LANDING', subtitle: `${m.name} · ${m.place}`, file: m.landingAnimation,
    note: 'Landing cinematic goes here in the final version', next: () => showScreen('level') });
}
SCREENS.map = { enter: mapEnter };

/* =====================================================
   8. ANIMATION SLOT
   If "file" is a video path, it plays. If not, a placeholder
   shows for a few seconds. Press SKIP or any middle key.
   ===================================================== */
let ANIM = { next: null, timer: 0 };
function playAnimSlot({ title, subtitle, file, note, next }) {
  ANIM.next = next;
  showScreen('anim');
  $('#anim-stage').innerHTML = `
    <div class="jr-bg"></div>
    <div class="an-box">${file ? `<video id="an-video" src="${file}" autoplay muted playsinline></video>` : ''}
      <div class="an-ph" id="an-ph"><h2>ANIMATION SLOT</h2><p>${note || ''}</p><small>FILE: ${file || 'not added yet'}</small></div></div>
    <div class="an-title"><h1>${title}</h1><p>${subtitle}</p></div>
    <button class="btn btn-main an-skip" id="an-skip">SKIP ▸</button>`;
  const go = () => { clearTimeout(ANIM.timer); const n = ANIM.next; ANIM.next = null; if (n) n(); };
  $('#an-skip').addEventListener('click', go);
  const v = $('#an-video');
  if (v) { v.addEventListener('loadeddata', () => $('#an-ph').classList.add('hidden')); v.addEventListener('ended', go); v.addEventListener('error', () => { ANIM.timer = setTimeout(go, 4000); }); }
  else ANIM.timer = setTimeout(go, 4000);
}
SCREENS.anim = { key: (i, k, d) => { if (d && k === 1 && ANIM.next) $('#an-skip').click(); } };
