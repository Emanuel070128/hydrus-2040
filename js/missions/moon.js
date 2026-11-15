/* =====================================================
   HYDRUS 2040 — MOON MISSION (level data)
   Built from the Mars template (js/missions/mars.js).
   Change ONLY the text between quotes and the numbers.
   Every event is based on a real fact from the team's database
   ("Base de datos – HYDRUS 2040 – Datos reales"): D05–D09.

   Moon rules used here:
     gravity 0.166 g · no air · sharp, electrically charged dust
     a lunar night lasts about 14 Earth days (a full day-night cycle ≈ 28)
     direct radiation from the Sun · signal to Earth only 1.3 s
   Failures come from the documented subsystems:
     life support (O₂ filter, O₂ tank), power, suit integrity, comms
   ===================================================== */
window.MISSIONS = window.MISSIONS || {};

MISSIONS.moon = {
  name: 'MOON',
  title: 'Ice in the Dark',
  place: 'Cabeus Crater',
  mapIntro: "This is Cabeus Crater, near the Moon's south pole. Click any point to see what we will do there.",
  walkImage: 'assets/images/moon-walk.jpg',   // placeholder: replace with an Apollo / LRO panorama (same file name)
  povImage: 'assets/images/moon-pov.jpg',     // placeholder: landscape seen through the helmet visor
  skyImage: { src: 'assets/images/earth-sky.jpg', x: 1440, y: 150, size: 120 },   // Earth, low over the horizon
  mapImage: 'assets/images/moon.jpg', mapPosition: '50% 82%', mapSize: '330%',
  landingAnimation: null,                     // e.g. 'assets/animations/moon-landing.mp4'
  goalName: 'ice in a crater that never sees the Sun',
  energyPerWalk: 3,
  gravity: 0.166,
  dustColor: '#b9b9b9',
  travelDays: { light: 3, medium: 4, heavy: 5 },
  tripText: 'The Moon is our closest neighbor: about 3 days away. Earth will always be close, only 1.3 light-seconds from us.',

  // Points on the mission map (x, y in % of the map)
  map: [
    { x: 22, y: 70, icon: '⌂', color: '#38bdf8', label: 'HYDRUS BASE', text: 'Our lander near the south pole. Earth hangs low over the horizon.' },
    { x: 34, y: 50, icon: 'A', color: '#22c55e', label: 'SAMPLE A · HIGHLANDS', text: 'Very old lunar rock. Here the Sun never climbs high in the sky.' },
    { x: 46, y: 36, icon: '!', color: '#ef4444', label: 'OPEN GROUND', text: 'No air and no magnetic field: nothing stops radiation from the Sun.' },
    { x: 55, y: 62, icon: 'B', color: '#22c55e', label: 'SAMPLE B · CRATER DEBRIS', text: 'Rocks thrown out by an impact. Sharp dust everywhere.' },
    { x: 65, y: 30, icon: '!', color: '#ef4444', label: 'NIGHT SIDE', text: 'The Sun sets here soon. A lunar night lasts about 14 Earth days.' },
    { x: 74, y: 58, icon: 'C', color: '#22c55e', label: 'SAMPLE C · CRATER RIM', text: 'The edge of a dark crater. Nights here reach about −173 °C.' },
    { x: 84, y: 40, icon: '★', color: '#facc15', label: 'ICE IN THE DARK', text: 'GOAL: the floor of a crater that has not seen sunlight in billions of years.' }
  ],

  steps: [
    { type: 'walk', seconds: 8,
      line: 'Day 1 on the Moon! You weigh only about one sixth of your Earth weight here, so bounce along like the Apollo crews.',
      sample: 'Sample A collected in the highlands!' },

    // Radiation · suit integrity (D07)
    { type: 'event', id: 'solarstorm', kind: 'decision',
      alert: 'SOLAR STORM: RADIATION ALERT',
      say: 'The Sun just launched a radiation storm, and the Moon has no air to stop it! Vote: left, middle or right.',
      options: [
        { label: 'USE THE RADIATION SHIELD', text: 'Take cover behind the shield on the lander.', effects: { energy: -5 }, needs: 'shield',
          result: 'The shield blocked the storm. Great call in the hangar!' },
        { label: 'RETURN TO THE LANDER', text: 'Safe, but the trip back uses suit power.', effects: { energy: -15 },
          result: 'We waited inside the lander. It drained some power.' },
        { label: 'KEEP WORKING OUTSIDE', text: 'No delay, but the suits take the radiation.', effects: { hull: -25 },
          result: 'We kept working. The radiation caused suit damage.' }
      ],
      nasa: { text: 'In August 1972, between Apollo 16 and Apollo 17, a solar storm sent out dangerous radiation. Luckily, no astronauts were on the Moon.',
              source: 'NASA – Solar activity forecast', url: 'https://www.nasa.gov/feature/ames/solar-activity-forecast-for-next-decade-favorable-for-exploration' } },

    { type: 'walk', seconds: 10,
      line: 'Heading to the crater debris. Watch the dust: it is sharp like glass and sticks to everything.',
      sample: 'Sample B collected from the crater debris!' },

    // Life support (ECLSS): dust in the air filter (D06)
    { type: 'event', id: 'dustfilter', kind: 'minigame', station: 'safety', game: 'sequence', length: 5, seconds: 9,
      alert: 'MOON DUST CLOGS THE AIR FILTER',
      say: 'Charged dust got into the suit air filter! Repeat the sequence to clean it, fast!',
      win: { effects: {}, result: 'Filter clean. The air is flowing again!' },
      lose: { effects: { o2: -1 }, result: 'We had to swap the filter and lost 1 oxygen tank.' },
      nasa: { text: 'Apollo 17 astronaut Harrison Schmitt sneezed and felt congested from moon dust inside the lander. He called it "lunar hay fever".',
              source: 'Space.com – Moon dust problem', url: 'https://www.space.com/moon-dust-problem-lunar-exploration.html' } },

    { type: 'walk', seconds: 10,
      line: 'The Sun is going down. Night is coming to this side of the Moon.' },

    // Power: the lunar night (D09)
    { type: 'event', id: 'night', kind: 'decision',
      alert: 'LUNAR NIGHT: 14 DAYS OF DARK',
      say: 'The Sun has set, and it will not rise for about 14 Earth days. Solar panels are useless now. How do we keep the power on?',
      options: [
        { label: 'RUN ON NUCLEAR POWER', text: 'The generator works day and night.', effects: { energy: -5 }, needs: 'rtg',
          result: 'The nuclear generator kept us warm and running all night.' },
        { label: 'SAVE POWER AND WAIT', text: 'Turn off everything we can. Heaters still drain the suits.', effects: { energy: -25 },
          result: 'We made it through the night, but it drained a lot of power.' },
        { label: 'USE THE BATTERIES', text: 'Run on stored power. Only if we packed batteries.', effects: { energy: -12 }, needs: 'battery',
          result: 'The batteries got us through the night. Some power was drained.' }
      ],
      nasa: { text: 'On the Moon, one night lasts about 14 Earth days, and the temperature drops to about −173 °C.',
              source: 'NASA LRO – Temperature variation on the Moon', url: 'https://science.nasa.gov/wp-content/uploads/2024/01/lrolitho7temperaturevariation27may2014.pdf' } },

    { type: 'walk', seconds: 10,
      line: 'Morning again! Next stop: the rim of the dark crater.',
      sample: 'Sample C collected at the crater rim!' },

    // Power + life support: the O₂ tank wiring (D05)
    { type: 'event', id: 'o2tank', kind: 'mixed', station: 'power', game: 'timing', hits: 3, seconds: 10,
      alert: 'SHORT CIRCUIT NEAR THE O₂ TANK',
      say: 'A short circuit near the oxygen tank! Use a repair kit, or balance the pressure by hand?',
      safe: { label: 'USE 1 REPAIR KIT', text: 'Safe. The wiring is fixed for sure.', effects: { kits: -1 }, result: 'Repair kit used. The oxygen tank is safe.' },
      risky: { label: 'BALANCE IT BY HAND (MINIGAME)', text: 'Free if it works, but oxygen is lost if it fails.' },
      win: { effects: {}, result: 'Pressure is stable! We kept our repair kits and every bit of oxygen.' },
      lose: { effects: { o2: -1 }, result: 'The valve leaked and we lost 1 oxygen tank.' },
      nasa: { text: 'Apollo 13 (1970): an oxygen tank exploded on the way to the Moon. The crew used the lunar module as a "lifeboat" and improvised an air filter.',
              source: 'NASA – Apollo 13', url: 'https://www.nasa.gov/mission/apollo-13/' } },

    { type: 'walk', seconds: 10,
      line: 'There it is: the crater that never sees the Sun. Helmet lights on!' },

    // GOAL: water ice in a permanently shadowed crater (D08)
    { type: 'event', id: 'ice', kind: 'minigame', station: 'science', game: 'hold', holdSeconds: 3, seconds: 10, goal: true,
      alert: 'GOAL: ICE IN THE DARK CRATER',
      say: 'Hold your middle key to drill into the frozen soil. In low gravity the drill pushes you up, so hold steady!',
      win: { effects: {}, result: 'Ice core collected! Water that has been frozen for billions of years.' },
      lose: { effects: {}, result: 'The drill slipped on the ice. We only got a small piece.' },
      nasa: { text: "In 2009, NASA's LCROSS mission confirmed water ice in Cabeus, a crater near the Moon's south pole that never sees sunlight.",
              source: 'NASA Science – LCROSS', url: 'https://science.nasa.gov/mission/lcross/' } },

    { type: 'walk', seconds: 10,
      line: 'Back to Hydrus Base to send everything home. Earth gets it in just 1.3 seconds!' }
  ],

  // Final story text
  winTitle: 'Keepers of the Lunar Ice',
  winText: 'The ice your crew found can give future explorers water to drink. Hydrus Base on the Moon is open!',
  loseText: 'You survived, but the ice is still hiding in the dark.',
  realMission: "LCROSS (NASA) confirmed water ice near the Moon's south pole in 2009."
};
