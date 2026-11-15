/* =====================================================
   HYDRUS 2040 — WORLD INFO
   A big info screen about the chosen world. It shows once before
   the hangar, and again as a pop-up from the hangar (WORLD INFO).
   Facts are in data.js (PLANET_INFO.<planet>.brief).
   ===================================================== */

// Builds the 1920 x 1080 info frame for the chosen destination
function worldInfoHTML(mode) {
  const d = GAME.destination, pi = PLANET_INFO[d.id], m = MISSIONS[d.id];
  const recs = EQUIPMENT.filter((e) => ['yes', 'best'].includes(pi.recs[e.id][0])).map((e) => e.name);
  const land = `background-image:url(${m.walkImage})`;
  return `
    <div class="wi-frame">
      <div class="wi-land" style="${land}"></div>
      <img class="wi-planet" src="${d.image}" alt="Photo of ${d.name}">
      <div class="wi-land wi-front" style="${land}"></div>
      <div class="wi-shade"></div>
      <div class="ai-tag">AI-generated illustration (landscape)</div>
      <div class="wi-text">
        <span class="wi-diff">${d.difficulty.toUpperCase()} MISSION · ${m.place.toUpperCase()}</span>
        <h1>${d.name}</h1>
        <h2>${d.title.toUpperCase()}</h2>
        <ul>${pi.brief.map((f) => `<li>${f}</li>`).join('')}</ul>
        <div class="wi-recs"><b>CONTROL HYDRUS RECOMMENDS</b>${recs.map((r) => `<span>${r}</span>`).join('')}</div>
      </div>
      ${mode === 'screen' ? `${backButton('destinations')}<button class="btn btn-main wi-go" id="wi-go">TO THE HANGAR ▸</button>
        <small class="wi-keyhint">or press any middle key</small>` : ''}
    </div>`;
}

/* ---------- Full screen, before the hangar ---------- */
function briefingEnter() {
  $('#briefing-stage').innerHTML = worldInfoHTML('screen');
  $('#wi-go').addEventListener('click', () => showScreen('hangar'));
  $('#wi-go').focus();
}
SCREENS.briefing = { enter: briefingEnter, key: (i, k, down) => { if (down && k === 1) showScreen('hangar'); } };

/* ---------- Pop-up inside the hangar ---------- */
function openWorldInfo() {
  $('#wi-pop-frame').innerHTML = worldInfoHTML('popup');
  $('#wi-pop').classList.remove('hidden');
  $('#wi-close').focus();
}
function closeWorldInfo() { $('#wi-pop').classList.add('hidden'); }

$('#wi-close').addEventListener('click', closeWorldInfo);
$('#wi-pop').addEventListener('click', (e) => { if (e.target.id === 'wi-pop') closeWorldInfo(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#wi-pop').classList.contains('hidden')) closeWorldInfo(); });
