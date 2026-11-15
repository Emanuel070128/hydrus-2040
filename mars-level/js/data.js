/* =====================================================
   HYDRUS 2040 · PLANET LEVELS — MARS (the model for the Moon and Europa)
   The level has 5 sectors (about 2 minutes each) and a checkpoint
   at the end of sectors 1 to 4.
     len   : length of the road in pixels (speed × seconds)
     speed : rover speed in px/s
     events: minigames and emergencies, at a fraction of the road (0 to 1)
   ===================================================== */
const LEVELS = {};
LEVELS.mars = {
  id: 'mars', name: 'MARS', place: 'JEZERO CRATER', title: 'THE LAST RIVER', goal: 'FOLLOW THE WATER',
  mapImage: '../assets/images/mars-map-bg.jpg',
  palette: { hills: ['#5a2a1c', '#7a3a22', '#9a4a2a'], ground: ['#c2653a', '#5a2410'], rock: '#8a4422', boulder: '#6b3a20', crater: '#2a0e06', dust: '#e2b48a',
             storm: [150, 80, 40], streak: [240, 190, 140] },
  sky: null,
  stormSay: ['Dust storm! Less sun: save energy for the shield.', 'Dust storm, and our panels are still dirty! Save energy!'],
  found: { title: 'WATER ICE FOUND', sub: 'JEZERO CRATER · 2.0 M DEEP · MARS COMPLETE', say: 'WATER! You followed the water all the way.' },
  iceGoal: 120,
  sectorMinutes: 2,          // text only (map + HUD clock): each sphere takes about 2 minutes · 5 spheres = about 10 minutes
  sectors: [
    { id: 'landing', name: 'LANDING ZONE', speed: 620, len: 60000, gust: .04, seed: 11,
      text: 'Land safely, learn the rover, then find the water signal.',
      events: [{ f: 0, type: 'land' }, { f: .55, type: 'scanner' }] },
    { id: 'dust', name: 'DUST PLAINS', speed: 680, len: 65000, gust: .07, seed: 23,
      text: 'A dust storm is coming. Protect the power.',
      events: [{ f: .3, type: 'panels' }, { f: .6, type: 'heat' }, { f: .86, type: 'devil' }], storm: [.38, .8] },
    { id: 'fork', name: 'THE FORK', speed: 720, len: 62000, gust: .1, seed: 37,
      text: 'Pick a road as a team, core the spotted rocks, then cross the crevasse.',
      fork: true, events: [{ f: .3, type: 'core' }, { f: .65, type: 'bridge' }] },
    { id: 'ridge', name: 'RIDGE OF SILENCE', speed: 760, len: 58000, gust: .12, seed: 41,
      text: 'Rough ridge. Earth may go quiet.',
      events: [{ f: .25, type: 'antenna' }, { f: .5, type: 'relay' }, { f: .75, type: 'repair' }] },
    { id: 'ice', name: 'ICE DEPOSIT', speed: 800, len: 50000, gust: .12, seed: 53,
      text: 'Test the meltwater, then drill to the ice together!',
      events: [{ f: .5, type: 'purify' }, { f: 1, type: 'drill' }] }
  ],
  fork: {
    question: 'FORK IN THE ROAD',
    left:  { id: 'canyon', label: 'THROUGH THE CANYON', text: 'Shorter road. The canyon walls block the signal: no warnings from Control Hydrus.', len: .76, hints: false },
    right: { id: 'rim',    label: 'AROUND THE RIM',     text: 'Longer road with more rocks, but Control Hydrus can still warn you.', len: 1, hints: true }
  },
  checkpoints: [
    'CHECKPOINT REWARD · +1 REPAIR KIT · ENERGY FULL',
    'CHECKPOINT REWARD · OXYGEN REFILLED · +500 POINTS',
    'CHECKPOINT REWARD · +1 HULL SEGMENT · DATA BACKUP',
    'CHECKPOINT REWARD · ENERGY FULL · LAST SECTOR AHEAD'
  ],
  minigames: {
    scanner: { kind: 'MINIGAME', title: 'CALIBRATE THE WATER SCANNER', color: '#38bdf8', time: 20,
      say: 'The scanner feels ice nearby. Line up the wave and lock it!', win: 'ICE SIGNAL LOCKED', lose: 'SCAN FAILED · ENERGY −30%' },
    panels: { kind: 'EMERGENCY', title: 'DUST ON THE SOLAR PANELS', color: '#fbbf24', time: 14,
      say: 'Dust storm! Our panels are covered. Wipe them, fast!', win: 'PANELS CLEAN · POWER BACK', lose: 'PANELS STILL DIRTY · ENERGY LOW' },
    bridge: { kind: 'MINIGAME', title: 'EXTEND THE BRIDGE', color: '#34d399', time: 16,
      say: 'A crevasse! Everybody hold your key to extend the bridge.', win: 'BRIDGE READY', lose: 'BRIDGE WOBBLED · HULL −1' },
    antenna: { kind: 'EMERGENCY', title: 'SIGNAL LOST WITH EARTH', color: '#f43f5e', time: 22,
      say: 'We lost Earth! Turn the dish toward the blue dot, then lock it.', win: 'LINK LOCKED · DATA SENT', lose: 'NO SIGNAL · DATA LOST' },
    repair: { kind: 'EMERGENCY', title: 'WHEEL DAMAGED', color: '#fbbf24', time: 22,
      say: 'A rock cracked a wheel. Follow the repair order, one by one!', win: 'WHEEL FIXED', lose: 'BAD REPAIR · HULL −1' },
    drill: { kind: 'FINAL', title: 'DRILL TO THE ICE', color: '#38bdf8', time: 60,
      say: 'This is it! Hit your key when the block touches the line.', win: 'WATER ICE FOUND', lose: '', final: true }
  },
  pins: [
    { x: 150, y: 820, games: ['land', 'scanner'], text: 'Our landing site. Land the rover with the sky crane, learn to drive and calibrate the water scanner.' },
    { x: 350, y: 640, games: ['panels', 'heat', 'devil'], text: 'Wide dusty plains. A storm covers the panels, the night freezes the rover, and a dust devil can clean everything.' },
    { x: 560, y: 760, games: ['vote', 'core', 'bridge'], text: 'Two roads: a short canyon with no signal or the long rim. Core the leopard rocks, then bridge a crevasse.' },
    { x: 760, y: 560, games: ['antenna', 'relay', 'repair'], text: 'A high ridge. The signal with Earth drops, the orbiter passes overhead and a wheel gets damaged.' },
    { x: 1000, y: 700, games: ['purify', 'drill'], text: 'GOAL: water ice under the ground. Make the meltwater safe, then drill on the beat, together.' }
  ],
  facts: [
    { text: 'Curiosity and Perseverance landed in about 7 minutes: heat shield, parachute, retro-rockets and a "sky crane".', source: 'Live Science – Perseverance landing', url: 'https://www.livescience.com/perseverance-mars-2020-rover-landing-video.html' },
    { text: 'In 2018, a dust storm that covered all of Mars shut down the Opportunity rover forever.', source: 'NASA – Opportunity mission comes to end', url: 'https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end' },
    { text: 'Wind on Mars cleaned the panels of Spirit and Opportunity several times, so they lasted years longer than planned.', source: 'NASA – Dust cleanings', url: 'https://www.nasa.gov/?p=70994' },
    { text: 'In 2024, Perseverance found a rock with "leopard spots". In 2025, NASA called it a potential sign of ancient life, still unconfirmed.', source: 'NASA JPL – Potential biosignature', url: 'https://www.jpl.nasa.gov/news/nasa-says-mars-rover-discovered-potential-biosignature-last-year/' },
    { text: 'Every two years, Mars goes behind the Sun and NASA stops sending commands to its robots for about two weeks.', source: 'Pasadena Now – JPL', url: 'https://www.pasadenanow.com/main/?p=536307' },
    { text: 'In 2008, the Phoenix mission found perchlorates in Martian soil: a chemical that can be toxic.', source: 'NASA JPL – Phoenix results', url: 'https://www.jpl.nasa.gov/news/nasa-phoenix-results-point-to-martian-climate-cycles/' },
    { text: 'In 2008, the Phoenix lander touched and confirmed water ice under the Martian soil.', source: 'Space.com – Phoenix Mars Lander', url: 'https://www.space.com/42947-phoenix-mars-lander.html' }
  ],
  winText: 'Water ice under Jezero Crater: water to drink, oxygen to breathe and fuel for the trip home.'
};
