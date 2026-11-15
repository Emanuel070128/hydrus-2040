/* =====================================================
   HYDRUS 2040 · MISSION MAP (Mars, the Moon or Europa)
   5 spheres = 5 sectors. Each sphere is its own short level with its
   own minigames. They unlock in order (1 → 5); progress is kept
   between spheres. Inside the game, the crew comes from the URL:
   mars-level/index.html?n=3&names=ANA,LEO,SAM&kits=1
   ===================================================== */
const PINS = MARS.pins;   // the 5 spheres of the planet being played (data.js / planets.js)
const GAME_TAG = (id) => id === 'vote' ? ['TEAM VOTE', '#fbbf24'] : [MARS.minigames[id].title, MARS.minigames[id].kind === 'EMERGENCY' ? '#f43f5e' : MARS.minigames[id].kind === 'FINAL' ? '#34d399' : MARS.minigames[id].kind === 'BONUS' ? '#7dd3fc' : '#38bdf8'];

// Crew and run progress
const Q = new URLSearchParams(location.search);
const EMBED = Q.has('n');
let crewN = EMBED ? Math.max(1, Math.min(4, +Q.get('n') || 1)) : 4;
if (Q.get('names')) Q.get('names').split(',').forEach((s, i) => { if (i < 4 && s) CONFIG.names[i] = decodeURIComponent(s).toUpperCase().slice(0, 10); });
const RUN = { next: 0, state: null, kits: Q.has('kits') ? Math.max(0, Math.min(3, +Q.get('kits'))) : 1 };

function renderMap() {
  document.title = `Hydrus 2040 · ${MARS.name.charAt(0) + MARS.name.slice(1).toLowerCase()}`;
  document.getElementById('mp-title').textContent = `MISSION MAP · ${MARS.name}`;
  document.getElementById('mp-sub').textContent = `${MARS.place} · 5 SECTORS · 12 MINIGAMES · ABOUT ${MARS.sectorMinutes * 5} MINUTES`;
  const bg = document.querySelector('.mp-bg');
  bg.style.backgroundImage = `url(${MARS.mapImage})`;
  if (MARS.mapFit) bg.style.backgroundSize = MARS.mapFit;        // e.g. the Moon photo: whole disc, not zoomed
  if (MARS.mapPos) bg.style.backgroundPosition = MARS.mapPos;
  if (MARS.mapFilter) bg.style.filter = MARS.mapFilter;          // e.g. darken the bright Europa ice so the labels stay readable
  SND.music('map');
  const svg = document.getElementById('mp-svg');
  let h = `<polyline points="${PINS.map((p) => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="#e0f2fe" stroke-width="3" stroke-dasharray="12 10" opacity=".8"/>`;
  for (let i = 0; i < 4; i++) { const a = PINS[i], b = PINS[i + 1], x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, on = RUN.next > i;
    h += `<g transform="translate(${x} ${y}) rotate(45)"><rect x="-11" y="-11" width="22" height="22" fill="${on ? '#34d399' : '#04122b'}" stroke="#34d399" stroke-width="3"/></g>
      <text x="${x}" y="${y + 36}" text-anchor="middle" font-size="12" letter-spacing="3" fill="#34d399">CHECKPOINT ${i + 1}</text>`; }
  PINS.forEach((p, i) => { const s = MARS.sectors[i], last = i === 4, done = i < RUN.next, cur = i === RUN.next, locked = i > RUN.next;
    const c = done ? '#34d399' : locked ? '#475569' : last ? '#34d399' : '#38bdf8';
    h += `<g class="pin" data-i="${i}" transform="translate(${p.x} ${p.y})" opacity="${locked ? .6 : 1}">
      ${cur ? `<circle r="60" fill="none" stroke="${c}" stroke-width="2" opacity=".6"><animate attributeName="r" values="40;70;40" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0;.8" dur="2s" repeatCount="indefinite"/></circle>` : ''}
      <circle r="52" fill="${c}" opacity=".12"/><circle r="34" fill="#04122b" stroke="${c}" stroke-width="3" style="filter:drop-shadow(0 0 10px ${c})"/>
      <text y="10" text-anchor="middle" font-size="28" fill="${c}">${done ? '✓' : last ? '★' : i + 1}</text>
      <rect x="-110" y="44" width="220" height="30" fill="#04122bdd" stroke="${c}" stroke-width="1"/>
      <text y="65" text-anchor="middle" font-size="13" letter-spacing="3" fill="#e0f2fe">${s.name}</text></g>`; });
  svg.innerHTML = h;
  svg.onclick = (e) => { const g = e.target.closest('.pin'); if (!g) return; showCard(+g.dataset.i); };
  document.getElementById('mp-plan').innerHTML = MARS.sectors.map((s, i) => `
    <div class="sec ${i < RUN.next ? 'done' : i > RUN.next ? 'locked' : 'cur'}"><span class="n">${i < RUN.next ? '✓' : i + 1}</span><div><b>${s.name}</b>
      <small>${PINS[i].games.map((id) => GAME_TAG(id)[0].toLowerCase()).join(' · ')} · about ${MARS.sectorMinutes} min</small></div></div>
    ${i < 4 ? `<div class="cp">◆ CHECKPOINT ${i + 1}</div>` : ''}`).join('');
  document.getElementById('start').innerHTML = RUN.next < 5 ? `START SECTOR ${RUN.next + 1} ▸` : 'MISSION COMPLETE';
  if (RUN.next < 5) showCard(RUN.next);
  renderCrew();
}
function showCard(i) {
  const p = PINS[i], card = document.getElementById('mp-card'), st = i < RUN.next ? 'CLEARED' : i > RUN.next ? 'LOCKED · CLEAR SECTOR ' + RUN.next + ' FIRST' : 'NEXT';
  card.innerHTML = `<b>SECTOR ${i + 1} · ${MARS.sectors[i].name}</b><p>${p.text}</p>${p.games.map((id) => { const [t, c] = GAME_TAG(id); return `<span class="tag" style="color:${c}">${t}</span>`; }).join('')}
    <small class="st">${st}</small>`;
  card.style.left = '820px'; card.style.top = '210px'; card.classList.remove('hidden');   // fixed spot: never covers a sphere
}
function renderCrew() {
  const nb = document.getElementById('crew-n');
  if (EMBED) nb.innerHTML = ''; else {
    nb.innerHTML = [1, 2, 3, 4].map((n) => `<button class="${n === crewN ? 'on' : ''}" data-n="${n}" ${RUN.next ? 'disabled' : ''}>${n}</button>`).join('');
    document.querySelectorAll('#crew-n button').forEach((b) => b.onclick = () => { if (RUN.next) return; crewN = +b.dataset.n; SND.play('click'); renderCrew(); }); }
  document.getElementById('crew-keys').innerHTML = Array.from({ length: crewN }, (_, i) => `
    <div class="ck" style="color:${PLAYER[i].color};border-color:${PLAYER[i].color}"><input maxlength="10" value="${CONFIG.names[i]}" data-i="${i}" ${EMBED ? 'readonly' : ''}>
      ${KEY_LABELS[i].map((k) => `<kbd>${k}</kbd>`).join('')}</div>`).join('');
  document.querySelectorAll('.ck input').forEach((inp) => inp.oninput = () => { CONFIG.names[+inp.dataset.i] = (inp.value || 'P' + (+inp.dataset.i + 1)).toUpperCase().slice(0, 10); });
}
function show(id) { document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id)); fit(); }
function fit() { const k = Math.min(innerWidth / 1920, innerHeight / 1080); const st = document.getElementById('map-stage'); st.style.transform = `translate(-50%, -50%) scale(${k})`; }
addEventListener('resize', fit);

// START: play the next sphere
function startMission() { if (RUN.next >= 5) return; SND.play('check'); show('play'); startLevel(crewN, RUN.next, RUN.state); }
// end of a sphere (checkpoint): save, unlock the next one, back to the map
function sectorCleared() {
  RUN.state = { hull: L.hull, maxHull: L.maxHull, kits: L.kits, energy: L.energy, o2: L.o2, ice: L.ice, score: L.score, data: L.data, best: L.best, crashes: L.crashes, log: L.log, clock: L.clock };
  RUN.next = L.sector + 1; stopLevel(); show('map'); renderMap();
}
// end of sphere 5: tell the main game (or go back to the map when played alone)
function missionComplete() {
  const res = { type: 'hydrus-mars-done', planet: MARS.id, facts: MARS.facts, ice: L.ice, iceGoal: MARS.iceGoal, data: L.data, score: L.score, hull: L.hull, maxHull: L.maxHull, energy: Math.round(L.energy),
    o2: Math.round(L.o2), kits: L.kits, crashes: L.crashes, clock: L.clock, log: L.log };
  stopLevel(); RUN.next = 5;
  if (window.parent !== window) window.parent.postMessage(res, '*'); else { show('map'); renderMap(); }
}
document.getElementById('start').onclick = startMission;

/* ---------- back button (map) and ESC pause menu (level) ---------- */
const toParent = (type) => window.parent.postMessage({ type }, '*');
const backBtn = document.getElementById('mp-back');
if (window.parent === window) backBtn.classList.add('hidden');
backBtn.onclick = () => { SND.play('click'); toParent('hydrus-mars-back'); };

const PAUSE = { el: document.getElementById('pause'), sel: 0 };
const pauseBtns = [...PAUSE.el.querySelectorAll('button')];
const isPaused = () => !PAUSE.el.classList.contains('hidden');
function pauseSelect(i) { PAUSE.sel = (i + pauseBtns.length) % pauseBtns.length; pauseBtns.forEach((b, j) => b.classList.toggle('on', j === PAUSE.sel)); }
function openPause() {
  if (L.ended || L.phase === 'log') return;
  for (let p = 0; p < L.n; p++) for (let k = 0; k < 3; k++) if (L.held[p][k] >= 0) onKey(p, k, false);   // let go of every key
  L.paused = true; PAUSE.el.classList.remove('hidden'); pauseSelect(0); SND.play('click');
}
function closePause() { L.paused = false; PAUSE.el.classList.add('hidden'); L.last = performance.now(); }
function pauseAct(act) {
  SND.play('click');
  if (act === 'resume') return closePause();
  closePause(); stopLevel();
  if (act === 'map') { show('map'); renderMap(); }
  if (act === 'menu') { if (window.parent !== window) toParent('hydrus-mars-menu'); else { show('map'); renderMap(); } }
}
pauseBtns.forEach((b, i) => { b.onclick = () => pauseAct(b.dataset.act); b.onmouseenter = () => pauseSelect(i); });

// keys: middle key on the map starts the next sphere; in the level the keys go to the rover
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' && !e.target.readOnly) return;
  const onMap = document.getElementById('map').classList.contains('active');
  if (e.code === 'Escape') { e.preventDefault(); if (onMap || dcOpen()) return; if (isPaused()) closePause(); else openPause(); return; }
  if (dcOpen() && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); downChoice(dcBtns()[DC.sel].dataset.act); return; }
  for (let p = 0; p < 4; p++) { const k = KEY_CODES[p].indexOf(e.code); if (k < 0) continue; e.preventDefault();
    if (onMap) { if (k === 1) startMission(); return; }
    if (dcOpen()) { if (!e.repeat) { if (k === 1) downChoice(dcBtns()[DC.sel].dataset.act); else dcSelect(DC.sel + (k === 2 ? 1 : -1)); } return; }
    if (isPaused()) { if (!e.repeat) { if (k === 1) pauseAct(pauseBtns[PAUSE.sel].dataset.act); else pauseSelect(PAUSE.sel + (k === 2 ? 1 : -1)); } return; }
    if (!e.repeat) onKey(p, k, true); return; }
  if (isPaused() && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); pauseAct(pauseBtns[PAUSE.sel].dataset.act); }
});
addEventListener('keyup', (e) => { if (isPaused() || dcOpen()) return; for (let p = 0; p < 4; p++) { const k = KEY_CODES[p].indexOf(e.code); if (k >= 0 && document.getElementById('play').classList.contains('active')) onKey(p, k, false); } });

renderMap(); fit();
if (location.search.includes('bot')) { window.BOT = true; window.FAST = location.search.includes('fast'); }
