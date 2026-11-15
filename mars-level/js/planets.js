/* =====================================================
   HYDRUS 2040 · PLANET LEVELS — THE MOON AND EUROPA
   Same structure as Mars (data.js): 5 sectors, the same number of
   minigames per sector and the same time (about 2 minutes each).
   What changes: the texts, the look and the minigames
   (new ones, see minigames3.js). The Moon is easier, Europa is harder.
   Every fact comes from the team's database ("Base de datos – HYDRUS
   2040 – Datos reales"): Moon D05–D09, Europa D22–D31.
   ===================================================== */
const SECTOR_SHAPE = LEVELS.mars.sectors.map((s) => ({ speed: s.speed, len: s.len, gust: s.gust, seed: s.seed }));   // same roads and times as Mars
const shape = (i, extra) => Object.assign({}, SECTOR_SHAPE[i], extra);

/* ---------------- THE MOON · ICE IN THE DARK (easy) ---------------- */
LEVELS.moon = {
  id: 'moon', name: 'MOON', place: 'CABEUS CRATER', title: 'ICE IN THE DARK', goal: 'FOLLOW THE WATER',
  mapImage: '../assets/images/moon-map-bg.jpg',          // "moon bg.jpeg": the whole half-lit disc, shown at its own size (black around it)
  mapFit: 'auto 100%', mapPos: '-100px 0',      // spheres sit on the sunlit side
  palette: { hills: ['#24262c', '#34373e', '#4a4d55'], ground: ['#a3a3a1', '#3b3b3e'], rock: '#7d7d80', boulder: '#5d5e63', crater: '#1b1b1e', dust: '#c8c8c8',
             storm: [4, 8, 24], streak: null },
  sky: { src: '../assets/images/earth-sky.jpg', x: 1190, y: 330, size: 120 },
  stormSay: ['The Sun has set: a lunar night lasts about 14 Earth days. Less power, save energy!', 'Night has fallen and our power is low! Save energy for the shield.'],
  found: { title: 'WATER ICE FOUND', sub: 'CABEUS CRATER · PERMANENT SHADOW · MOON COMPLETE', say: 'ICE! Water frozen for billions of years.' },
  iceGoal: 120, sectorMinutes: 2,   // only for the text on the map and the HUD clock · about 2 min per sphere, 10 min in all
  sectors: [
    shape(0, { id: 'landing', name: 'LANDING SITE', text: 'Touch down softly, then sort the first samples.',
      events: [{ f: 0, type: 'charge' }, { f: .55, type: 'sort' }] }),
    shape(1, { id: 'night', name: 'THE LONG NIGHT', text: 'A lunar night lasts about 14 Earth days. Keep the rover alive.',
      events: [{ f: .3, type: 'balance' }, { f: .6, type: 'memory' }, { f: .86, type: 'whack' }], storm: [.38, .8] }),
    shape(2, { id: 'rim', name: 'THE CRATER RIM', text: 'Pick a way down as a team, hop the boulders, then anchor the rover.',
      fork: true, events: [{ f: .3, type: 'flappy' }, { f: .65, type: 'sync' }] }),
    shape(3, { id: 'storm', name: 'SOLAR STORM RIDGE', text: 'No air to stop the radiation from the Sun. Stay sharp.',
      events: [{ f: .25, type: 'dodge' }, { f: .5, type: 'count' }, { f: .75, type: 'stopper' }] }),
    shape(4, { id: 'shadow', name: 'PERMANENT SHADOW', text: 'Cabeus crater never sees the Sun. The ice is here!',
      events: [{ f: .5, type: 'catch' }, { f: 1, type: 'crank' }] })
  ],
  fork: {
    question: 'TWO WAYS DOWN',
    left:  { id: 'crater', label: 'THROUGH THE DARK CRATER', text: 'Shorter road. The crater walls hide Earth: no warnings from Control Hydrus.', len: .76, hints: false },
    right: { id: 'ridge',  label: 'ALONG THE SUNLIT RIDGE',  text: 'Longer road with more rocks, but Earth stays in view and Control Hydrus can warn you.', len: 1, hints: true }
  },
  checkpoints: LEVELS.mars.checkpoints,
  pins: [
    { x: 300, y: 840, games: ['charge', 'sort'], text: 'Our landing site near the south pole. Touch down softly and sort the first samples.' },
    { x: 410, y: 640, games: ['balance', 'memory', 'whack'], text: 'The Sun sets for about 14 Earth days. Keep the heaters steady, wake the rover up and clean out the moon dust.' },
    { x: 580, y: 780, games: ['vote', 'flappy', 'sync'], text: 'Two ways down: a dark crater with no signal or the long sunlit ridge. Hop the boulders, then anchor together.' },
    { x: 700, y: 570, games: ['dodge', 'count', 'stopper'], text: 'A solar storm hits, and the Moon has no air to stop it. Dodge it, read the dosimeter and save the oxygen tank.' },
    { x: 840, y: 730, games: ['catch', 'crank'], text: 'GOAL: the floor of Cabeus, a crater that never sees the Sun. Catch the ice grains, then drill.' }
  ],
  minigames: {
    charge:  { kind: 'MINIGAME', title: 'SOFT TOUCHDOWN', color: '#38bdf8', time: 22, p: { need: 3, zone: .22, speed: .55 },
      say: 'No air to slow us down! HOLD to fire the engine, let go in the green zone.', win: 'SOFT TOUCHDOWN', lose: 'HARD LANDING · HULL −1', onLose: { hull: -1 } },
    sort:    { kind: 'MINIGAME', title: 'SORT THE FIRST SAMPLES', color: '#34d399', time: 22, p: { need: 6, window: 2.4, left: 'ICY SOIL', right: 'PLAIN ROCK' },
      say: 'Icy soil to the LEFT, plain rock to the RIGHT. Quick!', win: 'SAMPLES SORTED · +10 MB', lose: 'SAMPLES MIXED UP', onWin: { data: 10 } },
    balance: { kind: 'EMERGENCY', title: 'KEEP THE HEATERS STEADY', color: '#f43f5e', time: 22, p: { need: 6, drift: .25, band: .26 },
      say: 'Night lasts about 14 Earth days! Keep the heater power inside the green band.', win: 'THE ROVER STAYS WARM', lose: 'FROZEN · ENERGY −30%', onLose: { energy: -30 } },
    memory:  { kind: 'MINIGAME', title: 'WAKE UP THE ROVER', color: '#a78bfa', time: 28, p: { rounds: 2, start: 3, show: .7 },
      say: 'Systems are frozen. Watch the start-up code, then repeat it!', win: 'SYSTEMS ONLINE', lose: 'SLOW REBOOT · ENERGY −20%', onLose: { energy: -20 } },
    whack:   { kind: 'EMERGENCY', title: 'SWAT THE MOON DUST', color: '#fbbf24', time: 20, p: { need: 10, life: 1.7, every: .9, miss: 5 },
      say: 'Moon dust got inside, like on Apollo 17! Hit each dust cloud before it spreads.', win: 'CABIN CLEAN', lose: 'DUST IN THE FILTERS · O₂ −20%', onLose: { o2: -20 } },
    flappy:  { kind: 'MINIGAME', title: 'HOP THE BOULDERS', color: '#7dd3fc', time: 24, p: { need: 5, grav: 300, thrust: 700, gap: 190, speed: 230, lives: 3 },
      say: 'One sixth of Earth\'s gravity: we can hop! HOLD to rise, let go to fall.', win: 'OVER THE BOULDERS', lose: 'BUMPY LANDING · HULL −1', onLose: { hull: -1 } },
    sync:    { kind: 'MINIGAME', title: 'ANCHOR TOGETHER', color: '#34d399', time: 20, p: { need: 4, period: 1.7, win: .3 },
      say: 'In low gravity the rover could slide! Press together when the ring closes.', win: 'ROVER ANCHORED', lose: 'SLID DOWN · HULL −1', onLose: { hull: -1 } },
    dodge:   { kind: 'EMERGENCY', title: 'DODGE THE SOLAR STORM', color: '#f43f5e', time: 16, p: { survive: 14, speed: 520, every: 1.0, hits: 3 },
      say: 'A solar storm, like the one in August 1972! Pick a lane: TOP, MIDDLE or LOW.', win: 'STORM SURVIVED', lose: 'RADIATION HIT · HULL −1', onLose: { hull: -1 } },
    count:   { kind: 'MINIGAME', title: 'READ THE DOSIMETER', color: '#a78bfa', time: 24, p: { need: 4, show: 1.1, max: 3 },
      say: 'Count the radiation flashes, then answer: LEFT 1 · MIDDLE 2 · RIGHT 3.', win: 'DOSE LOGGED · +10 MB', lose: 'WRONG READINGS', onWin: { data: 10 } },
    stopper: { kind: 'EMERGENCY', title: 'SAVE THE O₂ TANK', color: '#fbbf24', time: 20, p: { need: 3, speed: .7, zone: .2, miss: 4 },
      say: 'The oxygen tank pressure is jumping, like on Apollo 13! Stop the needle in the green.', win: 'PRESSURE SAFE', lose: 'O₂ LEAK · O₂ −20%', onLose: { o2: -20 } },
    catch:   { kind: 'MINIGAME', title: 'CATCH THE ICE GRAINS', color: '#38bdf8', time: 24, p: { need: 8, speed: 240, every: .75, bad: .3 },
      say: 'Ice is flying up from the crater floor, like LCROSS saw in 2009! Catch the ice, dodge the rocks.', win: 'ICE COLLECTED · +12 MB', lose: 'TOO MANY ROCKS', onWin: { data: 12 } },
    crank:   { kind: 'FINAL', title: 'DRILL INTO CABEUS', color: '#38bdf8', time: 0, final: true, p: { need: 40 },
      say: 'This is it! Alternate LEFT and RIGHT to turn the drill.', win: 'WATER ICE FOUND', lose: '' }
  },
  facts: [
    { text: 'Apollo 13: an oxygen tank exploded on the way to the Moon. The crew used the lunar module as a "lifeboat" and improvised an air filter.', source: 'NASA – Apollo 13', url: 'https://www.nasa.gov/?p=409197' },
    { text: 'Apollo 17 astronaut Harrison Schmitt sneezed and felt congested from moon dust. He called it "lunar hay fever".', source: 'Space.com – Moon dust problem', url: 'https://www.space.com/moon-dust-problem-lunar-exploration.html' },
    { text: 'In August 1972, right between Apollo 16 and 17, a solar storm sent out dangerous radiation. No astronauts were on the Moon.', source: 'NASA – Solar activity forecast', url: 'https://www.nasa.gov/feature/ames/solar-activity-forecast-for-next-decade-favorable-for-exploration' },
    { text: 'In 2009, the LCROSS mission confirmed water ice in a crater near the Moon\'s south pole that never sees the Sun.', source: 'NASA Science – LCROSS', url: 'https://science.nasa.gov/mission/lcross/' },
    { text: 'On the Moon, one night lasts about 14 Earth days.', source: 'NASA LRO – Temperature variation on the Moon', url: 'https://science.nasa.gov/wp-content/uploads/2024/01/lrolitho7temperaturevariation27may2014.pdf' }
  ],
  winText: 'Water ice in a crater that never sees the Sun, just like LCROSS found in 2009: water to drink and air to breathe for future crews.'
};

/* ---------------- EUROPA · THE HIDDEN OCEAN (hard) ---------------- */
LEVELS.europa = {
  id: 'europa', name: 'EUROPA', place: 'SOUTH POLE ICE SHELL', title: 'THE HIDDEN OCEAN', goal: 'FOLLOW THE WATER',
  mapImage: '../assets/images/europa-map-bg.jpg',       // Galileo photo of Europa (PIA02528): whole disc, shown at its own size
  mapFit: 'auto 100%', mapPos: '0 0', mapFilter: 'brightness(.72)',
  palette: { hills: ['#5f7290', '#8193ad', '#a9bacd'], ground: ['#e4ebf2', '#7a8ea8'], rock: '#a7b8cc', boulder: '#7f93ad', crater: '#4b5d78', dust: '#e6eef8',
             storm: [110, 50, 190], streak: [205, 175, 255] },
  sky: { src: '../assets/images/jupiter.jpg', x: 760, y: 120, size: 340 },
  stormSay: ['Radiation spike from Jupiter! Less power: save energy for the shield.', 'Radiation spike, and our power is low! Save energy!'],
  found: { title: 'OCEAN WATER FOUND', sub: 'SOUTH POLE · WATER PLUME · EUROPA COMPLETE', say: 'WATER! A sample of the hidden ocean.' },
  iceGoal: 120, sectorMinutes: 2,   // only for the text on the map and the HUD clock · about 2 min per sphere, 10 min in all
  sectors: [
    shape(0, { id: 'touchdown', name: 'TOUCHDOWN ON ICE', text: 'Land on the ice shell, and keep Europa clean.',
      events: [{ f: 0, type: 'stopper' }, { f: .55, type: 'sort' }] }),
    shape(1, { id: 'belt', name: 'JUPITER\'S RADIATION', text: 'Jupiter blasts this moon with radiation, and sunlight is 25 times weaker than on Earth.',
      events: [{ f: .3, type: 'balance' }, { f: .6, type: 'crank' }, { f: .86, type: 'dodge' }], storm: [.38, .8] }),
    shape(2, { id: 'fractures', name: 'THE FRACTURES', text: 'Pick a way across as a team, fly over the cracks, then map them.',
      fork: true, events: [{ f: .3, type: 'flappy' }, { f: .65, type: 'memory' }] }),
    shape(3, { id: 'quake', name: 'TIDAL QUAKE ZONE', text: 'Jupiter\'s pull squeezes the ice. Hold on!',
      events: [{ f: .25, type: 'whack' }, { f: .5, type: 'sync' }, { f: .75, type: 'count' }] }),
    shape(4, { id: 'plume', name: 'THE WATER PLUME', text: 'Water vapor rises from the ocean below. Catch it, then melt through!',
      events: [{ f: .5, type: 'catch' }, { f: 1, type: 'charge' }] })
  ],
  fork: {
    question: 'CROSS THE ICE',
    left:  { id: 'fracture', label: 'ACROSS THE FRACTURES', text: 'Shorter road. Radiation noise hides the signal: no warnings from Control Hydrus.', len: .76, hints: false },
    right: { id: 'ridge',    label: 'ALONG THE DOUBLE RIDGE', text: 'Longer road with more ice blocks, but Control Hydrus can still warn you.', len: 1, hints: true }
  },
  checkpoints: LEVELS.mars.checkpoints,
  pins: [
    { x: 150, y: 820, games: ['stopper', 'sort'], text: 'Our landing site on the ice shell. Land carefully and keep every tool sterile: Europa\'s ocean must stay clean.' },
    { x: 350, y: 640, games: ['balance', 'crank', 'dodge'], text: 'Jupiter\'s radiation belt. Shield the rover\'s brain, pump heat from the nuclear generator and dodge the bursts.' },
    { x: 560, y: 760, games: ['vote', 'flappy', 'memory'], text: 'Two ways: across the fractures with no signal or along the double ridge. Fly over the cracks, then map them.' },
    { x: 760, y: 560, games: ['whack', 'sync', 'count'], text: 'Jupiter\'s tides shake the ice. Patch the leaks, brace together and count Io\'s eruptions in the sky.' },
    { x: 1000, y: 700, games: ['catch', 'charge'], text: 'GOAL: the water plume from the hidden ocean. Catch the vapor, then melt through the ice.' }
  ],
  minigames: {
    stopper: { kind: 'MINIGAME', title: 'LAND ON THE ICE SHELL', color: '#38bdf8', time: 16, p: { need: 4, speed: 1.15, zone: .13, miss: 3 },
      say: 'No air here either! Stop the descent needle in the green to land.', win: 'TOUCHDOWN ON EUROPA', lose: 'HARD LANDING · HULL −1', onLose: { hull: -1 } },
    sort:    { kind: 'MINIGAME', title: 'KEEP EUROPA CLEAN', color: '#34d399', time: 18, p: { need: 8, window: 1.3, left: 'STERILE', right: 'DIRTY' },
      say: 'NASA crashed Galileo into Jupiter to protect this ocean. STERILE tools LEFT, DIRTY tools RIGHT!', win: 'NO GERMS FROM EARTH', lose: 'CONTAMINATION RISK · −10 MB', onLose: { data: -10 } },
    balance: { kind: 'EMERGENCY', title: 'SHIELD THE BRAIN', color: '#a78bfa', time: 18, p: { need: 8, drift: .55, band: .16 },
      say: 'Extreme radiation! Keep the shield power in the band, like Juno\'s titanium vault.', win: 'ELECTRONICS SAFE', lose: 'RADIATION DAMAGE · HULL −1', onLose: { hull: -1 } },
    crank:   { kind: 'MINIGAME', title: 'PUMP THE GENERATOR HEAT', color: '#fbbf24', time: 14, p: { need: 46 },
      say: 'Sunlight is 25 times weaker here: only nuclear power works, like on Galileo. Alternate LEFT and RIGHT!', win: 'GENERATOR WARM', lose: 'COLD SYSTEMS · ENERGY −30%', onLose: { energy: -30 } },
    dodge:   { kind: 'EMERGENCY', title: 'DODGE THE RADIATION BELT', color: '#f43f5e', time: 16, p: { survive: 14, speed: 760, every: .62, hits: 2 },
      say: 'Europa Clipper flies past fast to avoid this radiation. We can\'t: pick a lane and dodge!', win: 'OUT OF THE BELT', lose: 'RADIATION HIT · HULL −1', onLose: { hull: -1 } },
    flappy:  { kind: 'MINIGAME', title: 'CROSS THE FRACTURES', color: '#7dd3fc', time: 24, p: { need: 7, grav: 340, thrust: 760, gap: 150, speed: 300, lives: 2 },
      say: 'Gravity is only 0.134 g. HOLD to rise over the cracks, let go to fall.', win: 'FRACTURES CROSSED', lose: 'SLIPPED IN A CRACK · HULL −1', onLose: { hull: -1 } },
    memory:  { kind: 'MINIGAME', title: 'MAP THE CRACKS', color: '#a78bfa', time: 24, p: { rounds: 3, start: 4, show: .45 },
      say: 'Earth is 33 to 53 minutes away: no live help. Memorize the crack pattern and repeat it!', win: 'CRACKS MAPPED · +10 MB', lose: 'MAP LOST', onWin: { data: 10 } },
    whack:   { kind: 'EMERGENCY', title: 'PATCH THE HULL LEAKS', color: '#fbbf24', time: 18, p: { need: 14, life: 1.05, every: .55, miss: 4 },
      say: 'The tidal quake opened leaks! Patch each one before it grows.', win: 'HULL SEALED', lose: 'AIR LEAK · O₂ −20%', onLose: { o2: -20 } },
    sync:    { kind: 'MINIGAME', title: 'BRACE FOR THE QUAKE', color: '#34d399', time: 16, p: { need: 6, period: 1.15, win: .19 },
      say: 'Jupiter\'s tides squeeze the ice! Brace together when the ring closes.', win: 'QUAKE RIDDEN OUT', lose: 'KNOCKED DOWN · HULL −1', onLose: { hull: -1 } },
    count:   { kind: 'MINIGAME', title: 'COUNT IO\'S ERUPTIONS', color: '#f59e0b', time: 20, p: { need: 5, show: .65, max: 3 },
      say: 'Io has more than 400 active volcanoes! Count the eruptions: LEFT 1 · MIDDLE 2 · RIGHT 3.', win: 'ERUPTIONS LOGGED · +10 MB', lose: 'WRONG COUNT', onWin: { data: 10 } },
    catch:   { kind: 'MINIGAME', title: 'CATCH THE PLUME', color: '#38bdf8', time: 20, p: { need: 11, speed: 380, every: .48, bad: .4 },
      say: 'Water vapor from the hidden ocean, like Hubble saw! Catch the water, dodge the ice shards.', win: 'PLUME SAMPLED · +12 MB', lose: 'SAMPLE RUINED', onWin: { data: 12 } },
    charge:  { kind: 'FINAL', title: 'MELT THROUGH THE ICE', color: '#38bdf8', time: 0, final: true, p: { need: 5, zone: .13, speed: .85 },
      say: 'HOLD to heat the probe, let go in the green zone. Melt down to the water!', win: 'OCEAN WATER FOUND', lose: '' }
  },
  facts: [
    { text: 'Jupiter gets about 25 times less sunlight than Earth.', source: 'NASA – Juno fact sheet', url: 'https://nasa.gov/wp-content/uploads/2015/03/541929main_junofactsheet2011.pdf' },
    { text: 'Juno keeps its electronic "brain" inside a titanium vault, because Jupiter\'s radiation is the most intense in the solar system after the Sun.', source: 'NASA JPL – Juno spacecraft', url: 'https://www.jpl.nasa.gov/news/press_kits/juno/spacecraft' },
    { text: 'Galileo explored Jupiter for almost 8 years with nuclear power, not solar.', source: 'NASA Science – Galileo', url: 'https://science.nasa.gov/mission/galileo/?News_ID=72' },
    { text: 'In 2003, NASA crashed Galileo into Jupiter on purpose so it would not contaminate Europa\'s possible ocean.', source: 'NASA Science – Galileo', url: 'https://science.nasa.gov/?p=55413' },
    { text: 'The Hubble Space Telescope saw water vapor above Europa\'s south pole: the first strong evidence of water plumes from this moon.', source: 'NASA JPL – Hubble sees water vapor', url: 'https://www.jpl.nasa.gov/news/hubble-sees-evidence-of-water-vapor-at-jupiter-moon/' },
    { text: 'Io, another moon of Jupiter, has more than 400 active volcanoes. Juno saw the most powerful eruption ever recorded there.', source: 'ScienceAlert – Juno and Io', url: 'https://www.sciencealert.com/nasa-captures-most-intense-volcanic-eruption-ever-on-jupiters-moon-io' },
    { text: 'Europa Clipper does not stay at Europa: it orbits Jupiter and flies past Europa, to spend less time in the radiation. It launched in 2024 and arrives in 2030.', source: 'Planetary Society / NASA JPL – Europa Clipper', url: 'https://jpl.nasa.gov/press-kits/europa-clipper/mission' }
  ],
  winText: 'Water from Europa\'s hidden ocean, which may hold about twice as much water as all of Earth\'s oceans: the best place to look for life.'
};

/* ---------------- which planet is being played ----------------
   mars-level/index.html?planet=moon | mars | europa  (default: mars) */
const PLANET_ID = (new URLSearchParams(location.search).get('planet') || 'mars').toLowerCase();
const MARS = LEVELS[PLANET_ID] || LEVELS.mars;   // "MARS" = the level being played (the name is kept from the Mars model)
