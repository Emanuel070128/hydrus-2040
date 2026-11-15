# Hydrus 2040: Follow the water

A space mission design game for the **NASA Space Apps Challenge 2026** ("Space Mission Design Game").
Team Singularity Squad. 1–4 players on one keyboard.

## ▶ Play online
**https://emanuel070128.github.io/hydrus-2040/** (GitHub Pages · Chrome recommended, press F11 for full screen)

## How to play
Play online with the link above, or open the folder and double-click `index.html`.

| Player | Left | Middle | Right |
|---|---|---|---|
| ▲ Player 1 | Q | W | E |
| ■ Player 2 | C | V | B |
| ● Player 3 | I | O | P |
| ◆ Player 4 | ← | ↓ | → |

## Game flow (Mars is the playable level)
1. Title → intro comic with Control Hydrus
2. Choose your destination: Moon (easy), Mars (medium) or Europa (hard)
3. Crew: how many astronauts and their names
4. Hangar: rocket, fuel (rocket equation, Δv), equipment with recommendations for the planet, hazards, crew stations → launch summary
5. Launch: GO/NO-GO poll (middle key) and countdown
6. Trajectory Earth → Mars
7. Mission map (click the points)
8. Animation slot (landing cinematic goes here in the final version)
9. **Mars level**: the crew walks by itself (spectator). Each emergency opens a JRPG-style transition to a **first-person helmet view**:
   - **Decision**: everyone votes with left / middle / right
   - **Minigame**: Control Hydrus calls one station; only that player plays (sequence, timing, hold)
   - **Mixed**: vote to use a repair kit (safe) or play the minigame (free if you win)
   - After each event a **NASA file** (real event + source) shows for 10 seconds, top-left
10. Final report with the 6 resources: mass, budget, power, data, communications, time

What you choose in the hangar matters in the level: nuclear generator (dust storm), shield (half damage), repair kits (rockslide, antenna), camera/laboratory (data per sample), antenna (all data reaches Earth).

## Where things are
| What | File |
|---|---|
| Texts and numbers (intro, planets, rockets, equipment, hazards, tour) | `js/data.js` |
| **Mars level (walks, events, NASA files)** | `js/missions/mars.js` |
| Level engine (walk, helmet view, minigames, report) | `js/level.js` |
| Launch, trajectory, mission map, animation slots | `js/journey.js` |
| Hangar | `js/hangar.js`, `js/tour.js` |
| Colors, sizes, animations | `css/style.css` |
| Images | `assets/images/` |

## The three missions
Each world has its own file in `js/missions/`: `moon.js`, `mars.js`, `europa.js` (same format, built from the Mars template).
Change **only** the text between quotes and the numbers. Every event is based on a real fact from the team's
database and shows its source in the NASA FILE box.
- Moon (Cabeus Crater): solar storm, dust in the air filter, the 14-day lunar night, short circuit near the O2 tank, goal: ice in the dark crater.
- Europa (south pole): Jupiter radiation spike, tidal ice quake, power drop at -160 C, antenna lost Earth (45 min delay), goal: sample the water plume.
Optional fields per mission: `gravity` (below 0.3 the crew bounces), `dustColor`, `skyImage` (fixed Earth/Jupiter in the sky),
`mapImage`, `mapIntro`, `travelDays`, `tripText`.
## Placeholders to replace later
- `assets/images/mars-walk.jpg` and `assets/images/mars-pov.jpg`: replace with NASA panoramas (Perseverance, Jezero Crater). Keep the same names.
- `moon-walk.jpg`, `moon-pov.jpg`, `earth-sky.jpg`, `europa-walk.jpg`, `europa-pov.jpg`, `europa-map.jpg`: generated placeholders. Replace with NASA images (Apollo, LRO, Galileo, Europa Clipper), same names. Walk images are 7680x1080 and must loop left to right.
- Launch video: put a NASA launch video in `assets/video/` and write its path in `LAUNCH_VIDEO` (`js/main.js`).
- Landing cinematic: put a video in `assets/animations/` and write its path in `landingAnimation` (`js/missions/mars.js`).

## Credits
- Images: NASA (see the Credits button in the game). NASA logos are not used.
- Real facts come from NASA (each NASA file shows its source); game numbers are tuned for play.
- Fonts: Orbitron and Exo 2 (SIL Open Font License).
- Code, drawings and part of the texts were made with help from AI (Claude).
