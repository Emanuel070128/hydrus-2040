# ▶ PLAY NOW: https://emanuel070128.github.io/hydrus-2040/

> Runs in any modern browser, no install, no login. Chrome on a computer with a keyboard is recommended (press **F11** for full screen).
> Source code: https://github.com/Emanuel070128/hydrus-2040

---

# Hydrus 2040: Follow the Water

**NASA Space Apps Challenge 2026 · Challenge: Space Mission Design Game**
**Team: Singularity Squad**

| Team member |
|---|
| Emanuel Cruz Ortiz |
| Marco Loaiza Aguirre |
| Valeria Ojeda Flores |
| Oscar Miguel Cruz |

---

## Project name
**Hydrus 2040: Follow the Water**

## High-level project summary
Hydrus 2040 is a cooperative browser game where 1 to 4 players design and fly a mission to search for water on the **Moon**, **Mars** or **Europa**.
First the crew designs the mission: they pick a rocket, load fuel with the rocket equation (Δv), and choose equipment under real limits of **mass, budget and power**.
Then they launch, fly the trajectory and drive a rover through 5 sectors full of emergencies based on real NASA missions.
Every choice in the hangar changes what happens on the surface, and the final report shows the results in 6 resources: mass, budget, power, data, communications and time.

The challenge asks for a game that teaches how space missions are designed. Hydrus 2040 makes players feel the real trade-offs that mission designers face, for example:
- solar power vs. nuclear power far from the Sun;
- shielding vs. weight;
- the communication delay with Earth.

When systems fail thousands of kilometers from home, the manuals stop helping. Your only real tool is your ability to improvise with what you have. In this game, survival doesn't depend on luck. It depends on your ability to decide in seconds, own the consequences and stay calm when everything points to disaster.

## Link to project demo
_Add here the public link to the 30-second video or the 7-slide deck (YouTube, Google Drive, etc.)._

## Link to final project
- **Play online (GitHub Pages):** https://emanuel070128.github.io/hydrus-2040/
- **Source code (GitHub):** https://github.com/Emanuel070128/hydrus-2040

---

## Detailed project description

### What exactly does it do?
A complete mission, from the drawing board to the final report, in about 10 to 15 minutes:

1. **Title and intro.** Control Hydrus, the mission guide, explains the goal: follow the water.
2. **Choose your destination.**
   - **Moon** (easy): Cabeus Crater, *Ice in the Dark*.
   - **Mars** (medium): Jezero Crater, *The Last River*.
   - **Europa** (hard): south pole ice shell, *The Hidden Ocean*.
   - Each card shows a real fact.
3. **Crew.** 1 to 4 astronauts share one keyboard, with 3 keys each.
4. **World briefing.** Gravity, sunlight, radiation, signal delay and the equipment Control Hydrus recommends.
5. **Hangar (mission design).**
   - **Rocket:** light, medium or heavy (payload, cost and days to explore).
   - **Fuel:** Δv from the rocket equation.
   - **Equipment:** 8 items (solar panels, nuclear generator, battery, radiation shield, repair kits, high-gain antenna, camera, laboratory).
   - **Limits:** a $100M budget, a payload mass limit and a power balance that depends on the sunlight at the destination.
   - **Readiness meter:** shows the chance of success and blocks launches that can't work.
6. **Launch.** A GO / NO-GO poll (every player presses their middle key) and the countdown.
7. **Trajectory.** The transfer orbit and travel time (Moon: 4 days · Mars: 210 days · Europa: about 2,100 days).
8. **Mission map.** 5 sectors that unlock in order, with checkpoints between them.
9. **Rover level.**
   - The crew drives a rover through each sector: jump rocks, shoot debris, raise the shield against meteors and grab ice.
   - Each sector stops for minigames based on real problems. There are 12 per planet, all different, and harder on Europa than on the Moon:

   | World | Sectors and minigames |
   |---|---|
   | **Moon** | Landing site (soft touchdown, sort the first samples) · The long night (keep the heaters steady, wake up the rover, swat the moon dust) · The crater rim (team vote, hop the boulders, anchor together) · Solar storm ridge (dodge the solar storm, read the dosimeter, save the O₂ tank) · Permanent shadow (catch the ice grains, drill into Cabeus) |
   | **Mars** | Landing zone (sky crane landing, calibrate the water scanner) · Dust plains (dust on the solar panels, keep the rover warm, catch the dust devil) · The fork (team vote, core the leopard rock, extend the bridge) · Ridge of silence (signal lost with Earth, relay to the orbiter, wheel damaged) · Ice deposit (purify the water, drill to the ice) |
   | **Europa** | Touchdown on ice (land on the ice shell, keep Europa clean) · Jupiter's radiation (shield the brain, pump the generator heat, dodge the radiation belt) · The fractures (team vote, cross the fractures, map the cracks) · Tidal quake zone (patch the hull leaks, brace for the quake, count Io's eruptions) · The water plume (catch the plume, melt through the ice) |

10. **Mission report.** The 6 resources, a log of what happened in each sector, and the **real NASA events** behind the mission, each with its source link.

**Single player:**
- A warning appears 1 second before each meteor hits.
- If the rover breaks, the player chooses between one **extra life** per sector or **restarting the sector**.

**ESC** opens a pause menu with three options: resume, mission map or main menu.

### How does it work?
- **Same keys on every screen:**

  | Player | Left | Middle | Right |
  |---|---|---|---|
  | ▲ Player 1 | Q | W | E |
  | ■ Player 2 | C | V | B |
  | ● Player 3 | I | O | P |
  | ◆ Player 4 | ← | ↓ | → |

- **Hangar decisions carry into the level.** Each choice changes what happens on the surface:
  - Energy depends on the power sources and the sunlight at the destination.
  - The shield reduces radiation and meteor damage.
  - Repair kits fix the rover.
  - The camera and the laboratory raise the science data per sample.
  - Without the high-gain antenna, only part of the data reaches Earth.
- **Real numbers decide the gameplay.** The minigames and hazards use the team's research database built from NASA sources:
  - gravity (Moon 0.166 g, Mars 0.38 g, Europa 0.134 g);
  - sunlight (Mars about 43 %, Europa about 4 % of Earth's);
  - the 14-day lunar night;
  - Jupiter's radiation;
  - the signal delay (Moon 1.3 s, Europa 33–53 min).
- **Technical details:**
  - Pure HTML, CSS and JavaScript, with no libraries and no server.
  - The game is drawn at 1920×1080 and scales to any screen.
  - The rover levels run in an `<iframe>` (`mars-level/`) and talk to the main game with `postMessage`.
  - All music and sound effects are synthesized live with the Web Audio API; there are no audio files.

### What benefits does it have?
- **Teaches mission design by doing.** Players learn by facing real trade-offs (mass, budget, power, Δv, radiation, signal delay) instead of reading about them.
- **Cooperative and social.** 1 to 4 players on one keyboard, so it works in classrooms, museums and families.
- **Grounded in real exploration.** Every emergency is based on a real NASA event, and the report shows the source.
- **Accessible.** It runs from a link in any browser, with no installation and no account.

### What do we hope to achieve?
We want players to understand why finding water is the key to living beyond Earth, and how much careful design every mission needs.
Next steps:
- more destinations, such as Enceladus;
- real NASA panoramas for the landscapes;
- a teacher mode with discussion questions;
- touch / gamepad support.

### Tools, languages and software
- **Languages:** HTML5, CSS3, JavaScript (ES2020) and the Canvas 2D and Web Audio APIs.
- **Hosting:** GitHub Pages.
- **Development and testing:** Claude Code and Google Chrome.
- **Fonts:** Orbitron and Exo 2 (SIL Open Font License).
- **AI tools:** Claude (Anthropic). See the next section.

---

## Use of AI (Super Intelligence)
We used **Claude (Anthropic)** as a tool to help build the project. The concept and the challenge approach came from the team, not from the AI. AI was used for:

- **Images:**
  - Images drawn with AI-assisted code:
    - the landscapes in the planet levels;
    - the planet backgrounds on the world-info screen;
    - the intro drawings;
    - the launch background;
    - the small Earth in the lunar sky.
  - They are **not real photos**. Every screen that shows them has a visible watermark: **"AI-generated illustration"**.
- **Audio:** all music (including the choir on the title screen) and sound effects are synthesized by code written with help from AI (Claude). The headers of `js/music.js` and `mars-level/js/sound.js` say so too.
- **Code and text:**
  - The game code was written with help from AI (Claude).
  - Part of the in-game text was written with help from AI.
  - The in-game Credits screen says so too.

AI did **not** generate or modify any NASA logo, flag or mission identifier. No NASA logos are used.

---

## NASA data
**NASA images** (credited in the game's Credits screen):
- Title background: the Milky Way from the International Space Station, Expedition 44 (ISS044-E-45215).
- Credits and level background: the Milky Way photographed by the Artemis II crew, April 7, 2026 (art002e012588).
- Mars: clouds over the Tharsis volcanoes, Mars Global Surveyor (PIA02653). NASA/JPL/Malin Space Science Systems.
- Moon: global mosaic from the Lunar Reconnaissance Orbiter. NASA/GSFC/Arizona State University.
- Moon mission map: the Moon seen by Mariner 10 (PIA02442). NASA/JPL/Northwestern University.
- Europa and the Europa mission map: Jupiter-facing hemisphere, Galileo, 1999 (PIA02528). NASA/JPL/University of Arizona.
- Jupiter. NASA.
- Hangar background: Tabby's Star, artist illustration (PIA22081). NASA/JPL-Caltech.
- Astronauts:
  - Mike Hopkins on a spacewalk, Expedition 38 (ISS038-E-020277);
  - Bruce McCandless II with the Manned Maneuvering Unit, STS-41B, 1984.
  - Mission patches were removed.
- Mars mission map: the Martian horizon seen from orbit. NASA.

**NASA facts and mission data** used for the hazards, the minigames and the "real NASA events" in the report:
- [Apollo 13](https://www.nasa.gov/mission/apollo-13/)
- [LCROSS](https://science.nasa.gov/mission/lcross/)
- [LRO: temperature variation on the Moon](https://science.nasa.gov/wp-content/uploads/2024/01/lrolitho7temperaturevariation27may2014.pdf)
- [Solar activity forecast](https://www.nasa.gov/feature/ames/solar-activity-forecast-for-next-decade-favorable-for-exploration)
- [Curiosity](https://science.nasa.gov/mission/msl-curiosity/)
- [Perseverance](https://science.nasa.gov/mission/mars-2020-perseverance/)
- [Opportunity](https://science.nasa.gov/mission/mer-opportunity/) and [the end of the Opportunity mission](https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end)
- [Mars Reconnaissance Orbiter](https://science.nasa.gov/mission/mars-reconnaissance-orbiter/)
- [Phoenix results](https://www.jpl.nasa.gov/news/nasa-phoenix-results-point-to-martian-climate-cycles/)
- [Potential biosignature (Perseverance)](https://www.jpl.nasa.gov/news/nasa-says-mars-rover-discovered-potential-biosignature-last-year/)
- [Juno fact sheet](https://nasa.gov/wp-content/uploads/2015/03/541929main_junofactsheet2011.pdf)
- [Juno spacecraft](https://www.jpl.nasa.gov/news/press_kits/juno/spacecraft)
- [Galileo](https://science.nasa.gov/mission/galileo/)
- [Hubble sees water vapor at Europa](https://www.jpl.nasa.gov/news/hubble-sees-evidence-of-water-vapor-at-jupiter-moon/)
- [Europa Clipper](https://jpl.nasa.gov/press-kits/europa-clipper/mission)

Game numbers (scores, timings, item stats) are tuned for play. The physical facts (gravity, sunlight, signal delay, night length, radiation) come from these sources and from the team's research database.

## Space agency partner data and other references
- Other sources cited in the game:
  - [Space.com: the Moon dust problem](https://www.space.com/moon-dust-problem-lunar-exploration.html)
  - [Space.com: Phoenix Mars Lander](https://www.space.com/42947-phoenix-mars-lander.html)
  - [Live Science: Perseverance landing](https://www.livescience.com/perseverance-mars-2020-rover-landing-video.html)
  - [ScienceAlert: Juno and Io](https://www.sciencealert.com/nasa-captures-most-intense-volcanic-eruption-ever-on-jupiters-moon-io)
  - [Pasadena Now: JPL](https://www.pasadenanow.com/main/?p=536307)
  - The Planetary Society (Europa Clipper)
- Fonts: [Orbitron](https://fonts.google.com/specimen/Orbitron) and [Exo 2](https://fonts.google.com/specimen/Exo+2) (SIL Open Font License).
- No space agency partner datasets were used directly.
- No copyrighted material is used without permission.

---

## Run it locally
Download or clone this repository and open `index.html` in Chrome. No server or install is needed.

## Where things are
| What | File |
|---|---|
| Texts, destinations, rockets, equipment, credits | `js/data.js` |
| Screens: title, intro, destinations, crew, briefing, hangar | `js/title.js`, `js/intro.js`, `js/destinations.js`, `js/crew.js`, `js/briefing.js`, `js/hangar.js`, `js/tour.js` |
| Launch, trajectory, report, link to the rover level | `js/journey.js` |
| Music for the menus | `js/music.js` |
| Rover levels: mission map, driving, minigames | `mars-level/` (`js/data.js` = Mars, `js/planets.js` = Moon and Europa, `js/minigames*.js`) |
| Styles | `css/style.css`, `mars-level/css/style.css` |
| Images and fonts | `assets/` |
