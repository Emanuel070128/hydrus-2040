/* =====================================================
   HYDRUS 2040 — EUROPA MISSION (level data)
   Built from the Mars template (js/missions/mars.js).
   Change ONLY the text between quotes and the numbers.
   Every event is based on a real fact from the team's database
   ("Base de datos – HYDRUS 2040 – Datos reales"): D22–D31.

   Europa rules used here:
     gravity 0.134 g · lethal radiation from Jupiter's belts
     Jupiter's tides flex and crack the ice shell (quakes, fractures, plumes)
     the ocean is under the ice · 25 times less sunlight than Earth · about −160 °C
     signal to Earth: 33 to 53 minutes each way, so the crew is on its own
   Failures come from the documented subsystems:
     suit and lander integrity, life support (O₂), power, comms
   This is the HARD destination: bigger losses than the Moon or Mars.
   ===================================================== */
window.MISSIONS = window.MISSIONS || {};

MISSIONS.europa = {
  name: 'EUROPA',
  title: 'The Hidden Ocean',
  place: 'South Pole Ice Shell',
  mapIntro: "This is Europa's south pole, where Hubble saw water vapor. Click any point to see what we will do there.",
  walkImage: 'assets/images/europa-walk.jpg',   // placeholder: replace with Galileo / Europa Clipper images (same file name)
  povImage: 'assets/images/europa-pov.jpg',     // placeholder: landscape seen through the helmet visor
  skyImage: { src: 'assets/images/jupiter.jpg', x: 1120, y: 40, size: 360 },   // Jupiter fills the sky
  mapImage: 'assets/images/europa-map.jpg', mapPosition: 'center', mapSize: 'cover',
  landingAnimation: null,                       // e.g. 'assets/animations/europa-landing.mp4'
  goalName: 'the water plume',
  energyPerWalk: 6,                             // cold and dark: walks cost more power
  gravity: 0.134,
  dustColor: '#e6eef8',                         // ice frost, not dust
  travelDays: { light: 1900, medium: 2000, heavy: 2100 },
  tripText: "Jupiter is a long way out: more than 5 years of travel. NASA's real Europa Clipper launched in 2024 and arrives at Jupiter in 2030.",

  // Points on the mission map (x, y in % of the map)
  map: [
    { x: 22, y: 70, icon: '⌂', color: '#38bdf8', label: 'HYDRUS BASE', text: 'Our lander on the ice. Jupiter fills the sky above us.' },
    { x: 33, y: 48, icon: 'A', color: '#22c55e', label: 'SAMPLE A · ICE PLAINS', text: 'Bright ice crossed by red-brown cracks.' },
    { x: 45, y: 34, icon: '!', color: '#ef4444', label: 'RADIATION ZONE', text: "Jupiter's radiation is the most intense in the solar system after the Sun. Keep time outside short." },
    { x: 54, y: 62, icon: 'B', color: '#22c55e', label: 'SAMPLE B · DOUBLE RIDGE', text: "Two ice walls pushed up as Jupiter's tides squeeze the ice shell." },
    { x: 64, y: 30, icon: '!', color: '#ef4444', label: 'FRACTURE FIELD', text: 'Fresh cracks. The ice shell bends and breaks as Europa orbits Jupiter.' },
    { x: 73, y: 58, icon: 'C', color: '#22c55e', label: 'SAMPLE C · CHAOS TERRAIN', text: 'Broken blocks of ice frozen in place, like a jigsaw puzzle.' },
    { x: 84, y: 40, icon: '★', color: '#facc15', label: 'THE WATER PLUME', text: 'GOAL: water vapor rising from the hidden ocean, near the south pole.' }
  ],

  steps: [
    { type: 'walk', seconds: 8,
      line: 'Day 1 on Europa. Earth is 33 to 53 light-minutes away, so out here we solve problems ourselves.',
      sample: 'Sample A collected on the ice plains!' },

    // Radiation · suit integrity (D23, D31)
    { type: 'event', id: 'radiation', kind: 'decision',
      alert: 'JUPITER RADIATION SPIKE',
      say: "Jupiter's radiation just hit a peak! Every minute outside counts. Vote fast!",
      options: [
        { label: 'WORK BEHIND THE SHIELD', text: 'The shield protects us while we keep working.', effects: { energy: -8 }, needs: 'shield',
          result: 'The radiation shield protected us. Great call in the hangar!' },
        { label: 'RETREAT TO THE LANDER', text: 'Safe, but the walk back and the wait cost power.', effects: { energy: -20 },
          result: 'We waited in the lander until it calmed down. It drained a lot of power.' },
        { label: 'STAY OUT AND HURRY', text: 'Fast, but the radiation will hit the suits hard.', effects: { hull: -35 },
          result: 'We stayed outside. The radiation caused serious suit damage.' }
      ],
      nasa: { text: 'Juno keeps its electronic "brain" inside a titanium vault, because Jupiter\'s radiation is the most intense in the solar system after the Sun.',
              source: 'NASA JPL – Juno spacecraft', url: 'https://www.jpl.nasa.gov/news/press_kits/juno/spacecraft' } },

    { type: 'walk', seconds: 10,
      line: "Crossing a double ridge. Jupiter's pull bends this ice shell again and again.",
      sample: 'Sample B collected at the double ridge!' },

    // Structural integrity + life support: tidal ice quake (D28)
    { type: 'event', id: 'icequake', kind: 'minigame', station: 'safety', game: 'sequence', length: 6, seconds: 9,
      alert: 'TIDAL QUAKE: THE ICE CRACKS',
      say: "Jupiter's tides just cracked the ice under the lander! Seal the pressure valves in order, fast!",
      win: { effects: {}, result: 'Valves sealed. The lander is safe and steady.' },
      lose: { effects: { hull: -20, o2: -1 }, result: 'The quake shook the lander. We lost 1 oxygen tank and took damage.' },
      nasa: { text: "Jupiter's gravity squeezes its moons. On Io, that squeezing powers more than 400 active volcanoes, and Juno saw the most powerful eruption ever recorded there.",
              source: 'ScienceAlert – Juno and Io', url: 'https://www.sciencealert.com/nasa-captures-most-intense-volcanic-eruption-ever-on-jupiters-moon-io' } },

    { type: 'walk', seconds: 10,
      line: 'About −160 °C, and the Sun is just a bright star. Keep an eye on your power.' },

    // Power: almost no sunlight (D22, D24)
    { type: 'event', id: 'cold', kind: 'decision',
      alert: 'POWER DROP AT −160 °C',
      say: 'The cold is draining our power, and solar panels barely work this far from the Sun. What do we do?',
      options: [
        { label: 'RUN ON NUCLEAR POWER', text: 'The generator gives power and heat, day and night.', effects: { energy: -5 }, needs: 'rtg',
          result: 'The nuclear generator kept us warm. Great call in the hangar!' },
        { label: 'SHUT DOWN AND WAIT', text: 'Turn off everything except life support.', effects: { energy: -30 },
          result: 'We waited in the cold. It drained a lot of power.' },
        { label: 'TURN OFF THE SCIENCE', text: 'Save power by shutting down the instruments. Data will be lost.', effects: { energy: -10, data: -10 },
          result: 'We turned off the instruments. Some data was lost.' }
      ],
      nasa: { text: "Jupiter gets about 25 times less sunlight than Earth. That's why NASA's Galileo explored Jupiter for almost 8 years on nuclear power, not solar.",
              source: 'NASA Science – Galileo', url: 'https://science.nasa.gov/mission/galileo/' } },

    { type: 'walk', seconds: 10,
      line: 'Entering the chaos terrain. Broken ice blocks everywhere.',
      sample: 'Sample C collected in the chaos terrain!' },

    // Comms: antenna lost Earth, and help is 45 minutes away (Galileo antenna)
    { type: 'event', id: 'antenna', kind: 'mixed', station: 'comms', game: 'timing', hits: 4, seconds: 11,
      alert: 'ANTENNA LOST THE EARTH LOCK',
      say: 'The antenna lost Earth! A message takes about 45 minutes each way, so nobody can help us. Use a repair kit, or align it by hand?',
      safe: { label: 'USE 1 REPAIR KIT', text: 'Safe. The antenna is fixed for sure.', effects: { kits: -1 }, result: 'Repair kit used. The antenna is locked on Earth.' },
      risky: { label: 'ALIGN BY HAND (MINIGAME)', text: 'Free if it works, but a lot of data is lost if it fails.' },
      win: { effects: { data: 8 }, result: 'Signal locked! We kept our repair kits and even sent extra data.' },
      lose: { effects: { data: -15 }, result: 'No signal for hours. A lot of data was lost.' },
      nasa: { text: "In 1991, Galileo's big antenna never fully opened. The mission still sent its science home through a small backup antenna.",
              source: 'NASA Science – Galileo', url: 'https://science.nasa.gov/mission/galileo/' } },

    { type: 'walk', seconds: 10,
      line: 'There it is: water vapor rising from the ice. It comes from the ocean hidden below us!' },

    // GOAL: sample the water plume (D26)
    { type: 'event', id: 'plume', kind: 'minigame', station: 'science', game: 'hold', holdSeconds: 4, seconds: 11, goal: true,
      alert: 'GOAL: SAMPLE THE WATER PLUME',
      say: 'Hold your middle key to fill the sample tank. Gravity here is even lower than on the Moon, so hold steady!',
      win: { effects: {}, result: 'Plume sample collected! Water from an ocean hidden under the ice.' },
      lose: { effects: {}, result: 'The plume faded before the tank was full. We only got a small sample.' },
      nasa: { text: "The Hubble Space Telescope saw water vapor above Europa's south pole: the first strong evidence of water plumes coming from this moon.",
              source: 'NASA JPL – Hubble sees water vapor at Jupiter moon', url: 'https://www.jpl.nasa.gov/news/hubble-sees-evidence-of-water-vapor-at-jupiter-moon/' } },

    { type: 'walk', seconds: 10,
      line: 'Back to the lander. Our data will take about 45 minutes to reach Earth.' }
  ],

  // Final story text
  winTitle: 'Pioneers of the Hidden Ocean',
  winText: 'Your sample could tell us if the ocean under the ice has what life needs. Your crew made history.',
  loseText: "You survived, but Europa's ocean keeps its secrets.",
  realMission: "NASA's Europa Clipper launched in 2024 and arrives at Jupiter in 2030 to study if Europa could support life. In 2003, NASA crashed Galileo into Jupiter on purpose to protect Europa's ocean."
};
