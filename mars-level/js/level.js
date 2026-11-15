/* =====================================================
   HYDRUS 2040 · MARS LEVEL — ENGINE
   5 sectors · checkpoints · driving + minigames + emergencies
   ===================================================== */
const ENERGY = { laser: 8, shield: 12, charge: 8 };
const L = { raf: 0 };

/* ---------- jobs on the rover (depends on how many players) ---------- */
function roles(n) {
  const all = (a) => [a, a, a], Y = [true, true, true], N = [false, false, false];
  if (n <= 1) return [{ keys: ['laser', 'drive', 'grab'], shield: [false, true, false], words: ['LASER', 'JUMP · HOLD SHIELD', 'GRAB'] }];
  if (n === 2) return [{ keys: all('drive'), shield: Y, words: ['', 'JUMP · HOLD SHIELD', ''] }, { keys: ['laser', 'laser', 'grab'], shield: N, words: ['LASER', 'LASER', 'GRAB'] }];
  const r = [{ keys: all('drive'), shield: n === 3 ? Y : N, words: ['', n === 3 ? 'JUMP · HOLD SHIELD' : 'JUMP', ''] }, { keys: all('laser'), shield: N, words: ['', 'LASER', ''] }];
  if (n === 3) r.push({ keys: all('grab'), shield: N, words: ['', 'GRAB', ''] });
  else r.push({ keys: [null, null, null], shield: Y, words: ['', 'HOLD SHIELD', ''] }, { keys: all('grab'), shield: N, words: ['', 'GRAB', ''] });
  return r;
}
function owner(act) {
  for (let p = 0; p < L.roles.length; p++) for (const k of [1, 0, 2]) if (act === 'shield' ? L.roles[p].shield[k] : L.roles[p].keys[k] === act) return { p, k };
  return { p: 0, k: 1 };
}
const WORD = { drive: 'JUMP', laser: 'LASER', grab: 'GRAB', shield: 'SHIELD' };

/* ---------- seeded random ---------- */
function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- build a sector's road ---------- */
function buildRoad(sec, S0, len, from, seedAdd = 0) {
  const r = rng(sec.seed + seedAdd), v = sec.speed, d = MARS.sectors.indexOf(sec);
  const evs = sec.events.map((e) => ({ s: S0 + Math.min(e.f, 1) * len, type: e.type, done: false }));
  const busy = (s) => evs.some((e) => s > e.s - 1400 && s < e.s + 900);
  let pos = Math.max(S0 + 1400, from), lastJ = -1e9, lastB = -1e9, gustEnd = -1e9;
  const gustW = L.n === 1 ? sec.gust * .5 : sec.gust, shieldShared = L.n <= 3;   // jump and shield on the same player: no jumps during meteor showers
  while (pos < S0 + len - 1100) {
    if (busy(pos)) { pos += 200; continue; }
    let type; const x = r();
    if (x < .26) type = 'rock'; else if (x < .4) type = 'crater'; else if (x < .58 + d * .02) type = 'boulder';
    else if (x < 1 - gustW) type = 'ice'; else type = 'gust';
    if (pos - S0 < 6000 && d === 0 && type === 'gust') type = 'ice';
    if ((type === 'rock' || type === 'crater') && (pos - lastJ < 1.15 * v || (shieldShared && pos < gustEnd + 400))) type = 'ice';
    if (type === 'boulder' && pos - lastB < .9 * v) type = 'ice';
    if (type === 'gust') { const gl = 600 + r() * 400; if (busy(pos + gl)) { pos += 300; continue; }
      gustEnd = pos + gl; const g = { s0: pos, s1: pos + gl, mets: [] }; for (let ms = pos + 250; ms <= g.s1; ms += 320) g.mets.push({ s: ms, spawn: -1, done: false, ox: 220 + ((ms * 7) % 300) }); L.gusts.push(g); }
    else L.objs.push({ type, s: pos, done: false, dead: false });
    if (type === 'rock' || type === 'crater') lastJ = pos; if (type === 'boulder') lastB = pos;
    pos += v * (.6 + r() * .55) * (1 - d * .05);
  }
  return evs;
}

/* ---------- start / sectors / checkpoints ---------- */
// Plays ONE sector (one sphere of the map). "state" carries what the crew had at the end of the last sphere.
function startLevel(n, sector = 0, state = null) {
  Object.assign(L, {
    n, roles: roles(n), t: 0, clock: 0, phase: 'sector', pt: 0, sector: 0, S: 0, v: 0, y: 0, vy: 0,
    hull: 5, maxHull: 5, kits: RUN.kits, energy: 100, o2: 100, ice: 0, score: 0, data: 0, combo: 0, best: 0, crashes: 0, inv: 0,
    signal: true, hints: true, solar: 1, objs: [], gusts: [], events: [], storm: null, sectorStart: 0, sectorEnd: 0,
    press: Array(n).fill(-9), held: Array.from({ length: n }, () => [-1, -1, -1]), shieldOn: false, beam: null, grabT: -9, pops: [], parts: [],
    quip: '', quipT: -99, lastHint: -99, mg: null, votes: {}, route: null, cp: null, log: [], secT0: 0, secNotes: [], ended: false, shake: 0, broken: -1
  });
  if (state) Object.assign(L, JSON.parse(JSON.stringify(state)));
  enterSector(sector, true);
  cancelAnimationFrame(L.raf); L.last = performance.now(); L.raf = requestAnimationFrame(loop);
}
function enterSector(i, fresh) {
  const sec = MARS.sectors[i];
  L.life = L.n === 1 ? 1 : 0;   // 1 player: one extra life per sector (not cumulative)
  L.sector = i; L.phase = 'sector'; L.pt = 0; L.v = 0; L.objs = []; L.gusts = []; L.storm = null; L.route = null; L.signal = true; L.hints = true; L.solar = 1; L.broken = -1;
  L.sectorStart = L.S; L.secT0 = L.clock; L.secNotes = [];
  if (sec.fork) { L.events = [{ s: L.S + 900, type: 'fork', done: false }]; L.sectorEnd = 1e12; }
  else { L.events = buildRoad(sec, L.S, sec.len, L.S); L.sectorEnd = L.S + sec.len;
    if (sec.storm) L.storm = [L.S + sec.storm[0] * sec.len, L.S + sec.storm[1] * sec.len]; }
  // checkpoint snapshot: if the rover breaks, we come back here
  L.cp = { sector: i, S: L.S, hull: L.hull, kits: L.kits, energy: L.energy, o2: L.o2, ice: L.ice, score: L.score, data: L.data, clock: L.clock, log: L.log.slice() };
  SND.music('calm');
}
function restoreCheckpoint() {
  const c = L.cp; Object.assign(L, { S: c.S, hull: Math.max(3, c.hull), kits: c.kits, energy: c.energy, o2: Math.max(60, c.o2), ice: c.ice, score: c.score, data: c.data, log: c.log.slice(), combo: 0, y: 0, vy: 0 });
  enterSector(c.sector);
}
function say(text, now) { if (!text) return; L.quip = text; L.quipT = L.t; }
function pop(text, x, y, c, size) { L.pops.push({ text, x, y, c, size, t: L.t }); }
function burst(x, y, n, cols, sp = 600, sz = 8, g = 1400) { for (let i = 0; i < n; i++) { const a = Math.random() * 7, v = sp * (.3 + Math.random() * .7); L.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .4, life: .6 + Math.random() * .6, age: 0, c: cols[i % cols.length], s: sz * (.5 + Math.random()), g }); } }
const pname = (p) => CONFIG.names[p] || 'P' + (p + 1);
function keyName(o) { return KEY_LABELS[o.p][o.k]; }

function good(x, y, text, c) { L.combo++; L.best = Math.max(L.best, L.combo); const pts = 100 * (1 + Math.floor(L.combo / 5)); L.score += pts; pop(text, x, y, c); SND.play('combo', L.combo); }
function hit(why) {
  if (L.t < L.inv || L.phase !== 'run' && L.phase !== 'brake') return;
  (L.hitLog = L.hitLog || []).push([+L.clock.toFixed(1), why, L.energy | 0]);
  L.hull--; L.crashes++; L.combo = 0; L.inv = L.t + 1.2; L.shake = 26; SND.play('hit');
  burst(RX, GROUND - 110, 30, [COL.red, COL.amber, '#888'], 700, 10); pop('IMPACT · HULL −1', RX, GROUND - 340, COL.red, 34); say(why);
  if (L.hull <= 0) {
    if (L.kits > 0) { L.kits--; L.hull = 2; SND.play('repair'); pop('REPAIR KIT USED', RX, GROUND - 420, COL.green, 30); say(`Repair kit used! ${L.kits} left.`); }
    else down('THE ROVER IS BROKEN');
  }
}
function down(why) {
  L.downPrev = L.phase; L.choice = false;   // 1 player: a menu lets them use the extra life or restart the sector
  L.phase = 'down'; L.pt = 0; L.downWhy = why; L.v = 0; SND.music('off'); SND.play('down');
}
// 1 player: the "rover down" menu (extra life / restart sector)
const DC = { el: document.getElementById('downc'), sel: 0 };
const dcBtns = () => [...DC.el.querySelectorAll('button')];
const dcOpen = () => !DC.el.classList.contains('hidden');
function dcSelect(i) { const b = dcBtns(); let s = (i + b.length) % b.length; if (b[s].disabled) s = b.findIndex((x) => !x.disabled); DC.sel = s; b.forEach((x, j) => x.classList.toggle('on', j === s)); }
function openDownChoice() {
  const life = L.life > 0, b = dcBtns();
  b[0].disabled = !life; document.getElementById('downc-life').textContent = life ? 'Keep going from here · 1 per sector' : 'Already used in this sector';
  document.getElementById('downc-why').textContent = L.downWhy;
  DC.el.classList.remove('hidden'); dcSelect(life ? 0 : 1); SND.play('click');
}
function downChoice(act) {
  const b = dcBtns().find((x) => x.dataset.act === act); if (!b || b.disabled || !dcOpen()) return;
  DC.el.classList.add('hidden'); SND.play('click');
  if (act === 'life') { L.life = 0; revive(); } else restoreCheckpoint();
}
function closeDownChoice() { DC.el.classList.add('hidden'); }
dcBtns().forEach((b, i) => { b.onclick = () => downChoice(b.dataset.act); b.onmouseenter = () => { if (!b.disabled) dcSelect(i); }; });

// extra life (1 player): keep playing from where the rover broke
function revive() {
  L.hull = Math.max(L.hull, 3); L.o2 = Math.max(L.o2, 40); L.energy = Math.max(L.energy, 40); L.inv = L.t + 2.5; L.vy = 0; L.y = 0;
  L.phase = L.downPrev === 'event' && L.mg ? 'event' : L.downPrev === 'vote' ? 'vote' : 'run'; L.pt = 0;
  SND.music('drive'); SND.play('repair'); say('Extra life used! Keep going, you have no more in this sector.');
}

/* ---------- input ---------- */
function onKey(p, k, isDown) {
  if (p >= L.n || L.ended) return;
  if (!isDown) { L.held[p][k] = -1; if (L.mg) mgKey(L.mg, p, k, false); return; }
  if (L.held[p][k] >= 0) return;
  L.held[p][k] = L.t; L.press[p] = L.t;
  if (L.phase === 'event' && L.mg) { mgKey(L.mg, p, k, true); return; }
  if (L.phase === 'vote') { if (k !== 1) { L.votes[p] = k === 0 ? 0 : 1; SND.play('vote'); } return; }
  if (L.phase === 'log') { if (k === 1 && L.pt > 2) missionComplete(); return; }
  if (L.phase !== 'run' && L.phase !== 'brake') return;
  const act = L.roles[p].keys[k];
  if (act === 'drive' && L.y <= 0) { L.vy = 950; SND.play('jump'); }
  if (act === 'laser') {
    if (L.energy < ENERGY.laser) { pop('NO ENERGY', RX + 200, GROUND - 330, COL.red, 30); SND.play('nopower'); return; }
    L.energy -= ENERGY.laser;
    const tg = L.objs.filter((o) => o.type === 'boulder' && !o.dead && sx(o) > RX + 150 && sx(o) < W).sort((a, b) => sx(a) - sx(b))[0];
    L.beam = { t: L.t, x: tg ? sx(tg) : W }; SND.play('laser');
    if (tg) { tg.dead = tg.done = true; SND.play('boom'); burst(sx(tg), GROUND - 80, 36, ['#c8743f', COL.amber, '#6b3a20'], 900, 12); good(sx(tg), GROUND - 300, 'TARGET DESTROYED', COL.amber); }
  }
  if (act === 'grab') {
    L.grabT = L.t; L.grabP = p;
    const tg = L.objs.find((o) => o.type === 'ice' && !o.done && Math.abs(sx(o) - (RX + 60)) < 120);
    if (tg) { tg.dead = tg.done = true; L.ice++; if (L.signal) L.data += 2; SND.play('grab'); burst(RX + 60, GROUND - 20, 22, [COL.sky, '#fff'], 500, 7); good(RX + 60, GROUND - 270, 'ICE +1', COL.sky); }
    else SND.play('click');
  }
}
const sx = (o) => RX + (o.type === 'ice' ? 60 : 0) + (o.s - L.S);

/* ---------- events (minigames, emergencies, vote) ---------- */
function startEvent(e) {
  e.done = true; L.v = 0; L.pt = 0;
  if (e.type === 'fork') { L.phase = 'vote'; L.votes = {}; SND.music('off'); SND.play('warn'); say('Two roads. Vote with your LEFT or RIGHT key!'); return; }
  L.phase = 'event'; L.mg = mgCreate(e.type, L.n); L.mgType = e.type;
  const def = MARS.minigames[e.type];
  SND.music(def.kind === 'EMERGENCY' ? 'emer' : def.final ? 'drill' : 'calm');
  if (def.kind === 'EMERGENCY') SND.play('alarm');
  if (e.type === 'antenna') { L.signal = false; L.hints = false; }
  if (e.type === 'repair') L.broken = 2;
  say(def.say);
}
function endEvent() {
  const g = L.mg, win = g.result === 'win', type = g.type, def = MARS.minigames[type];
  L.secNotes.push(`${MARS.minigames[type].title.toLowerCase()}: ${win ? 'done' : 'failed'}`);
  if (win) L.score += 500;
  if (type === 'scanner' && !win) L.energy = Math.max(0, L.energy - 30);
  if (type === 'panels') { L.solar = win ? 1 : .45; if (!win) L.energy = Math.min(L.energy, 25); }
  if (type === 'bridge' && !win) { L.hull = Math.max(1, L.hull - 1); }
  if (type === 'antenna') { L.signal = win; L.hints = win; if (win) L.data += 10; }
  if (type === 'repair') { L.broken = -1; if (!win) L.hull = Math.max(1, L.hull - 1); }
  if (type === 'land' && !win) L.hull = Math.max(1, L.hull - 1);
  if (type === 'relay' && win) L.data += 15;
  if (type === 'purify' && !win) L.o2 = Math.max(5, L.o2 - 20);
  if (type === 'heat' && !win) L.energy = Math.max(0, L.energy - 30);
  if (type === 'core' && win) L.data += 12;
  if (type === 'devil' && win) { L.energy = 100; L.solar = 1; }
  const fx = win ? def.onWin : def.onLose;   // effects written in the planet data (Moon and Europa minigames)
  if (fx) { if (fx.hull) L.hull = Math.max(1, Math.min(L.maxHull, L.hull + fx.hull)); if (fx.energy) L.energy = clamp(L.energy + fx.energy, 0, 100);
    if (fx.o2) L.o2 = clamp(L.o2 + fx.o2, 5, 100); if (fx.data) L.data = Math.max(0, L.data + fx.data); }
  L.mg = null;
  if (type === 'drill' || def.final) { L.phase = 'found'; L.pt = 0; L.score += 3000; SND.music('win'); SND.play('found'); say(MARS.found.say); burst(960, 480, 120, [COL.cyan, COL.ice, COL.amber, COL.green], 1100, 7, 600); return; }
  L.phase = 'run'; SND.music(L.storm && L.S > L.storm[0] && L.S < L.storm[1] ? 'emer' : 'drive'); SND.play('go');
}
function resolveVote() {
  const vs = Object.values(L.votes), left = vs.filter((v) => v === 0).length, right = vs.length - left;
  const pick = right > left ? MARS.fork.right : MARS.fork.left, sec = MARS.sectors[L.sector];
  L.route = pick.id; L.hints = pick.hints; L.secNotes.push(`vote: ${pick.label.toLowerCase()}`);
  const len = sec.len * pick.len;
  L.events = L.events.concat(buildRoad(sec, L.sectorStart, len, L.S + 700, pick.id === 'rim' ? 5 : 0));
  L.sectorEnd = L.sectorStart + len;
  L.phase = 'run'; SND.music('drive'); SND.play('go');
  say(pick.hints ? 'Around the rim! I can still warn you.' : 'Into the canyon! The walls block my signal. Eyes open!');
}

/* ---------- simulation ---------- */
function step(dt) {
  const t0 = L.t; L.t += dt; const t = L.t; L.pt += dt;
  if (L.phase !== 'log') L.clock += dt;
  if (window.BOT) bot();
  const sec = MARS.sectors[L.sector];
  if (L.phase === 'sector' && L.pt > (L.sector === 0 ? 4.2 : 3.2)) { L.phase = 'run'; SND.music('drive'); SND.play('go'); say(L.sector === 0 ? 'Rover online. Follow the water, crew!' : `Sector ${L.sector + 1}: ${sec.name.toLowerCase()}. ${sec.text}`); }
  if (L.phase === 'sector' && L.sector === 0) [[1.2, 'beep'], [2.0, 'beep'], [2.8, 'beep']].forEach(([a, e]) => { if (L.pt - dt < a && L.pt >= a) SND.play(e); });
  // driving and braking
  if (L.phase === 'run' || L.phase === 'brake') {
    const nextEv = L.events.filter((e) => !e.done).sort((a, b) => a.s - b.s)[0];
    const stopAt = Math.min(nextEv ? nextEv.s : 1e12, L.sectorEnd);
    if (L.phase === 'run') { L.v = Math.min(sec.speed, L.v + 600 * dt); if (L.S > stopAt - 700) { L.phase = 'brake'; L.brakeA = L.v * L.v / (2 * Math.max(60, stopAt - L.S)); SND.play('brake'); } }
    if (L.phase === 'brake') { L.v = Math.max(0, L.v - L.brakeA * dt); if (L.v < 6 || L.S >= stopAt) { L.v = 0; L.S = stopAt;
      if (nextEv && nextEv.s <= stopAt + 1) startEvent(nextEv); else { L.phase = 'checkpoint'; L.pt = 0; SND.music('calm'); SND.play('check'); applyCheckpoint(); } } }
    L.S += L.v * dt;
    // energy, oxygen, storm
    const storm = L.storm && L.S > L.storm[0] && L.S < L.storm[1];
    if (storm && !L.inStorm) { SND.play('storm'); SND.music('emer'); say(L.solar < 1 ? MARS.stormSay[1] : MARS.stormSay[0]); }
    if (!storm && L.inStorm) SND.music('drive');
    L.inStorm = storm;
    L.energy = Math.min(100, L.energy + ENERGY.charge * L.solar * (storm ? .5 : 1) * dt);
    const want = L.held.some((ks, p) => ks.some((h, k) => h >= 0 && L.roles[p].shield[k] && t - h > .15));
    if (want && L.energy > 0) L.energy = Math.max(0, L.energy - ENERGY.shield * dt);
    const on = want && L.energy > 0; if (on !== L.shieldOn) SND.play(on ? 'shieldon' : 'shieldoff'); L.shieldOn = on;
  } else L.shieldOn = false;
  if (L.phase !== 'log' && L.phase !== 'found') { L.o2 = Math.max(0, L.o2 - dt * .15); if (L.o2 <= 0 && L.phase !== 'down') down('OUT OF OXYGEN'); }
  // jump
  if (L.y > 0 || L.vy > 0) { L.vy -= 2600 * dt; L.y += L.vy * dt; if (L.y <= 0) { L.y = 0; L.vy = 0; SND.play('land'); } }
  // meteors
  for (const g of L.gusts) {
    if (L.S > g.s0 - 1100 && !g.warned && L.S < g.s1) { g.warned = true; SND.play('warn'); const o = owner('shield'); say(`Meteors! SHIELD UP: ${pname(o.p)}, hold ${keyName(o)}!`); }
    for (const m of g.mets) {
      if (m.done) continue;
      // 1 player: a warning appears and the meteor hits exactly 1 s later (2–4 players: unchanged, 0.6 s)
      if (m.spawn < 0 && L.S >= m.s - L.v * meteorLead() && L.v > 50) { m.spawn = t; if (L.n === 1) SND.play('warn'); }
      if (m.spawn >= 0 && t - m.spawn >= meteorLead()) { m.done = true;
        if (L.shieldOn) { SND.play('clang'); burst(RX + 40, GROUND - 330, 14, [COL.amber, COL.violet, '#fff'], 600, 6); good(RX + 260, GROUND - 420, 'BLOCKED', COL.violet); }
        else hit('Meteor hit! Keep the shield up next time.'); }
    }
  }
  // obstacles
  for (const o of L.objs) {
    if (o.done) continue; const x = sx(o), xp = x + L.v * dt;
    if (o.type === 'boulder' && x - RX < 170) { o.done = o.dead = true; burst(x, GROUND - 90, 26, ['#6b3a20', '#c8743f'], 700, 12); hit('Crash! Blast the big rocks with the laser.'); }
    if ((o.type === 'rock' || o.type === 'crater') && xp >= RX && x < RX) { o.done = true;
      if (o.type === 'rock' ? L.y > 55 : L.y > 15) good(RX, GROUND - 350, o.type === 'rock' ? 'NICE JUMP' : 'CLEARED', COL.cyan); else hit('Ouch! Jump earlier!'); }
    if (o.type === 'ice' && x < RX + 60 - 120) { o.done = true; L.combo = 0; }
  }
  // Control Hydrus warns about the next thing, with the key to press
  if (L.phase === 'run' && L.hints && t - L.quipT > 2.6) {
    const nx = L.objs.find((o) => !o.done && sx(o) > RX + 350 && sx(o) < RX + 1000);
    if (nx && nx !== L.lastHintObj) { L.lastHintObj = nx; const act = nx.type === 'boulder' ? 'laser' : nx.type === 'ice' ? 'grab' : 'drive', o = owner(act);
      say({ rock: 'Rock ahead!', crater: 'Crater ahead!', boulder: 'Big rock!', ice: 'Ice ahead!' }[nx.type] + ` ${WORD[act]}: ${pname(o.p)}, press ${keyName(o)}`); }
  }
  // minigame
  if (L.phase === 'event' && L.mg) { mgStep(L.mg, dt); if (L.mg.phase === 'done') endEvent(); }
  if (L.phase === 'vote' && (Object.keys(L.votes).length >= L.n || L.pt > 10)) resolveVote();
  if (L.phase === 'checkpoint' && L.pt > 4.2) { L.log.push({ name: sec.name, time: L.clock - L.secT0, notes: L.secNotes.slice() }); sectorCleared(); return; }
  if (L.phase === 'down') {
    if (L.n === 1) { if (L.pt > 1.2 && !L.choice) { L.choice = true; openDownChoice(); } }   // waits for the player's choice
    else if (L.pt > 3.4) restoreCheckpoint();                                                 // 2-4 players: unchanged
  }
  if (L.phase === 'found' && L.pt > 4.8) { L.log.push({ name: sec.name, time: L.clock - L.secT0, notes: L.secNotes.slice() }); L.phase = 'log'; L.pt = 0; }
  // effects
  for (const p of L.parts) { p.age += dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  L.parts = L.parts.filter((p) => p.age < p.life); L.pops = L.pops.filter((p) => t - p.t < 1.2); L.shake *= Math.pow(.02, dt);
}
function applyCheckpoint() {
  const i = L.sector;
  if (i === 0) { L.kits++; L.energy = 100; } if (i === 1) { L.o2 = 100; L.score += 500; }
  if (i === 2) { L.hull = Math.min(L.maxHull, L.hull + 1); L.data += 5; } if (i === 3) { L.energy = 100; }
  L.o2 = Math.min(100, L.o2 + 35);
}

/* ---------- autoplay (for testing: open index.html?bot) ---------- */
function botTap(p, k) { onKey(p, k, true); setTimeout(() => onKey(p, k, false), 60); }
function bot() {
  const B = L.bot || (L.bot = {}), t = L.t;
  if (L.phase === 'run' || L.phase === 'brake') {
    const j = owner('drive'), la = owner('laser'), gr = owner('grab'), sh = { ...owner('shield') };
    if (sh.p === j.p && sh.k === j.k) sh.k = L.roles[sh.p].shield[0] ? 0 : sh.k;
    for (const o of L.objs) { if (o.done || o.bot) continue; const x = sx(o), tta = (x - RX) / Math.max(1, L.v);
      if ((o.type === 'rock' || o.type === 'crater') && tta < .33 && tta > 0 && L.y <= 0) { o.bot = true; if (B.sh && sh.p === j.p && sh.k === j.k) { onKey(sh.p, sh.k, false); B.sh = false; } botTap(j.p, j.k); }
      if (o.type === 'boulder' && x < RX + 1000) { o.bot = true; botTap(la.p, la.k); }
      if (o.type === 'ice' && Math.abs(x - (RX + 60)) < 45) { o.bot = true; botTap(gr.p, gr.k); } }
    const need = L.gusts.some((g) => L.S > g.s0 - L.v * .9 && L.S < g.s1 + 100);
    if (need && !B.sh) { B.sh = true; onKey(sh.p, sh.k, true); } if (!need && B.sh) { B.sh = false; onKey(sh.p, sh.k, false); }
  }
  if (L.phase === 'vote') for (let p = 0; p < L.n; p++) if (L.votes[p] === undefined && L.pt > 1 + p * .5) botTap(p, window.BOT_VOTE === 'right' ? 2 : 0);
  const g = L.mg; if (!g || g.phase !== 'play') return;
  if (MG[g.type].bot) { MG[g.type].bot(g); return; }   // the new minigames carry their own test bot
  if (!B.next || t > B.next) {
    B.next = t + .09;
    if (g.type === 'scanner') { if (MG.scanner.match(g) >= .93) mgKey(g, 0, 1, true); else mgKey(g, 0, g.ph > 0 ? 0 : 2, true); mgKey(g, 0, 0, false); mgKey(g, 0, 2, false); mgKey(g, 0, 1, false); }
    if (g.type === 'panels') for (let p = 0; p < g.n; p++) { mgKey(g, p, 1, true); mgKey(g, p, 1, false); }
    if (g.type === 'repair') { const [p, k] = g.seq[g.pos]; mgKey(g, p, k, true); mgKey(g, p, k, false); B.next = t + .4; }
  }
  if (g.type === 'bridge') for (let p = 0; p < g.n; p++) g.hold[p][1] = true;
  if (g.type === 'antenna') { const tg = MG.antenna.target(g), h = g.hold[g.rot]; h[0] = g.a > tg + .05; h[2] = g.a < tg - .05; }
  if (g.type === 'drill') for (const nt of g.notes) if (!nt.done && Math.abs(nt.t - g.pt) < .03) { const [p, k] = g.lanes[nt.lane]; mgKey(g, p, k, true); mgKey(g, p, k, false); }
}

/* ---------- drawing ---------- */
function drawHud() {
  const sec = MARS.sectors[L.sector], total = MARS.sectors.reduce((s, x) => s + x.len, 0);
  // progress: sector + checkpoints
  const secLen = L.sectorEnd < 1e11 ? L.sectorEnd - L.sectorStart : sec.len, f = clamp((L.S - L.sectorStart) / secLen);
  const prog = (L.sector + f) / 5;
  panel(560, 18, 800, 96);
  T(`SECTOR ${L.sector + 1}/5 · ${sec.name}`, 590, 46, 18, COL.ice, 'left', 4);
  const st = L.clock - L.secT0, lim = MARS.sectorMinutes * 60, mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  T(`${mmss(st)} / ${mmss(lim)}`, 1330, 46, 18, st > lim ? COL.amber : COL.cyan, 'right', 3);   // this sphere's time (about 2 min each · 10 min total)
  const x0 = 600, x1 = 1320; X.fillStyle = 'rgba(56,189,248,.18)'; X.fillRect(x0, 80, x1 - x0, 6);
  X.fillStyle = COL.cyan; X.shadowColor = COL.cyan; X.shadowBlur = 12; X.fillRect(x0, 80, (x1 - x0) * prog, 6); X.shadowBlur = 0;
  for (let i = 0; i <= 5; i++) { const x = x0 + (x1 - x0) * i / 5, on = prog >= i / 5 - .001, cp = i > 0 && i < 5;
    X.save(); X.translate(x, 83); X.rotate(Math.PI / 4); X.fillStyle = on ? (cp ? COL.green : COL.cyan) : '#04122b'; X.strokeStyle = cp ? COL.green : COL.cyan; X.lineWidth = 2; X.fillRect(-9, -9, 18, 18); X.strokeRect(-9, -9, 18, 18); X.restore(); }
  const mx = x0 + (x1 - x0) * prog; X.beginPath(); X.moveTo(mx, 70); X.lineTo(mx - 8, 58); X.lineTo(mx + 8, 58); X.fillStyle = COL.ice; X.fill();
  // systems
  panel(26, 18, 500, 196);
  T('HULL', 50, 52, 15, COL.sky, 'left', 4); bar(150, 44, 340, 16, L.hull / L.maxHull, L.hull <= 1 ? COL.red : COL.cyan, L.maxHull);
  T('ENERGY', 50, 92, 15, COL.sky, 'left', 4); bar(150, 84, 340, 16, L.energy / 100, L.energy < 25 ? COL.red : COL.amber);
  T('O₂', 50, 132, 15, COL.sky, 'left', 4); bar(150, 124, 340, 16, L.o2 / 100, L.o2 < 25 ? COL.red : COL.sky);
  T(`KITS ${L.kits}`, 50, 176, 16, COL.green, 'left', 4); if (L.n === 1) T(`♥ ${L.life}`, 165, 176, 16, L.life ? COL.red : '#64748b', 'left', 2); T('SIGNAL', 250, 176, 16, L.signal ? COL.green : COL.red, 'left', 4);
  T(L.signal ? (L.hints ? 'LIVE' : 'BLOCKED') : 'LOST', 490, 176, 16, L.signal && L.hints ? COL.green : COL.red, 'right', 3);
  // objective
  panel(1394, 18, 500, 196);
  T('OBJECTIVE · FOLLOW THE WATER', 1418, 50, 15, COL.sky, 'left', 3);
  const drops = Math.min(6, Math.floor(L.ice / (MARS.iceGoal / 6)));
  for (let i = 0; i < 6; i++) { const x = 1440 + i * 74, on = i < drops;
    X.beginPath(); X.moveTo(x, 80); X.bezierCurveTo(x - 12, 100, x - 22, 112, x - 22, 124); X.arc(x, 124, 22, Math.PI, 0, true); X.bezierCurveTo(x + 22, 112, x + 12, 100, x, 80);
    X.fillStyle = on ? COL.cyan : 'rgba(56,189,248,.1)'; X.shadowColor = COL.cyan; X.shadowBlur = on ? 18 : 0; X.fill(); X.shadowBlur = 0; X.strokeStyle = COL.cyan; X.lineWidth = 2; X.stroke(); }
  T(`ICE ${L.ice}/${MARS.iceGoal}`, 1418, 180, 16, COL.sky, 'left', 3); T(`SCORE ${L.score.toLocaleString('en-US')}`, 1660, 180, 16, COL.amber, 'center', 3); T(`${L.data} MB`, 1870, 180, 16, COL.violet, 'right', 3);
  if (L.combo >= 3) T(`COMBO x${L.combo}`, 1870, 240, 30, COL.amber, 'right', 6, 'O', 16);
  // crew: each key with its job
  const n = L.n, cw = n === 1 ? 560 : 400, gap = 24, xs = (W - (n * cw + (n - 1) * gap)) / 2;
  for (let p = 0; p < n; p++) { const x = xs + p * (cw + gap), c = PLAYER[p].color, r = L.roles[p];
    panel(x, 958, cw, 100, c, L.t - L.press[p] < .15 ? c + '44' : 'rgba(4,18,43,.88)');
    T(pname(p), x + 22, 990, 20, c, 'left', 4);
    const ks = [0, 1, 2].filter((k) => r.words[k]); const kx0 = x + cw - 24 - ks.length * 110;
    ks.forEach((k, j) => { const on = L.held[p][k] >= 0; keyCap(kx0 + j * 110 + 55, 994, 46, KEY_LABELS[p][k], c, on); T(r.words[k], kx0 + j * 110 + 55, 1038, 11, c, 'center', 2); });
    if (n <= 2 || ks.length === 1) T(r.words[ks[0]] && ks.length === 1 ? 'press ' + KEY_LABELS[p][ks[0]] : '', x + 22, 1030, 14, '#cfe3ff', 'left', 2); }
}
function drawHydrus() {
  const k = L.t - L.quipT; if (k < 0 || k > 3.6 || !L.quip) return;
  X.save(); X.globalAlpha = easeOut(k * 4) * (1 - ramp(3.2, 3.6, k));
  const w = Math.min(1100, Math.max(640, textW(L.quip, 26, 'E', 0) + 170));
  panel(26, 232, w, 104, COL.cyan, 'rgba(4,18,43,.86)');
  X.save(); X.beginPath(); X.arc(84, 284, 36, 0, 7); X.clip(); if (faceImg.complete) X.drawImage(faceImg, 48, 248, 72, 72); X.restore();
  X.beginPath(); X.arc(84, 284, 40, 0, 7); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.stroke();
  X.beginPath(); X.arc(84, 284, 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ((L.t * .7) % 1)); X.strokeStyle = 'rgba(56,189,248,.6)'; X.stroke();
  T(L.hints ? 'CONTROL HYDRUS · LIVE' : 'CONTROL HYDRUS · ONBOARD', 142, 258, 13, COL.cyan, 'left', 4);
  T(L.quip.slice(0, Math.floor(clamp(k * 1.6) * L.quip.length)), 142, 298, 26, COL.ice, 'left', 0, 'E');
  for (let y = 236; y < 334; y += 4) { X.fillStyle = 'rgba(56,189,248,.04)'; X.fillRect(30, y, w - 8, 1); }
  X.restore();
}
function drawTags() {
  if (L.phase !== 'run' && L.phase !== 'brake') return;
  for (const g of L.gusts) if (L.S > g.s0 - 1100 && L.S < g.s1) { const o = owner('shield'); keyTag(RX, GROUND - 470, o.p, keyName(o), 'HOLD · SHIELD', L.S > g.s0 - 500); }
  for (const o of L.objs) { if (o.done) continue; const x = sx(o); if (x > RX + 1450 || x < RX - 40 || x > W + 40) continue;
    const act = o.type === 'boulder' ? 'laser' : o.type === 'ice' ? 'grab' : 'drive', w = owner(act);
    const ready = o.type === 'boulder' ? x < 1500 : (x - RX) / Math.max(1, L.v) < .45;
    keyTag(x, GROUND - (o.type === 'boulder' ? 260 : 160), w.p, keyName(w), WORD[act], ready); }
}
const meteorLead = () => L.n === 1 ? 1 : .6;   // seconds from warning/appearance to impact
function drawMeteors() {
  const lead = meteorLead();
  for (const g of L.gusts) for (const m of g.mets) { if (m.spawn < 0 || m.done) continue;
    const since = L.t - m.spawn;
    if (L.n === 1) {   // 1 player: warning over the rover for the whole second before impact
      const left = Math.max(0, lead - since), pulse = .5 + .5 * Math.sin(L.t * 18), o = owner('shield');
      X.save(); X.globalAlpha = .55 + .45 * pulse; X.strokeStyle = COL.red; X.lineWidth = 5; X.shadowColor = COL.red; X.shadowBlur = 20;
      X.beginPath(); X.arc(RX + 20, GROUND - 260, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (left / lead)); X.stroke(); X.shadowBlur = 0; X.restore();
      T('⚠', RX + 20, GROUND - 258, 46, COL.red, 'center', 0, 'O', 16);
      T(`METEOR IN ${left.toFixed(1)} s · HOLD ${keyName(o)} · SHIELD`, RX + 20, GROUND - 360, 22, COL.red, 'center', 4, 'O', 14);
    }
    const k = clamp((since - (lead - .6)) / .6); if (since < lead - .6) continue;   // the meteor itself falls during the last 0.6 s
    const x = RX + 20 + m.ox * (1 - k), y = -40 + (GROUND - 260) * k;
    X.strokeStyle = 'rgba(251,191,36,.7)'; X.lineWidth = 8; X.beginPath(); X.moveTo(x + 50, y - 80); X.lineTo(x, y); X.stroke(); X.beginPath(); X.arc(x, y, 14, 0, 7); X.fillStyle = COL.amber; X.fill(); }
}
function drawOverlays() {
  const t = L.t, sec = MARS.sectors[L.sector];
  if (L.phase === 'sector') { const a = 1 - ramp(L.sector === 0 ? 3.6 : 2.7, L.sector === 0 ? 4.2 : 3.2, L.pt);
    X.save(); X.globalAlpha = a; X.fillStyle = 'rgba(1,3,10,.6)'; X.fillRect(0, 0, W, H);
    T(`SECTOR ${L.sector + 1} OF 5`, 960, 380, 22, COL.sky, 'center', 12);
    T(sec.name, 960, 460, 76 * easeOut(ramp(0, .4, L.pt)) + 1, COL.ice, 'center', 16, 'O', 30);
    T(sec.text, 960, 540, 28, '#cfe3ff', 'center', 1, 'E');
    if (L.sector === 0) { const n = L.pt < 1.2 ? '' : L.pt < 2 ? '3' : L.pt < 2.8 ? '2' : L.pt < 3.6 ? '1' : 'GO'; T(n, 960, 660, 80, n === 'GO' ? COL.green : COL.ice, 'center', 6, 'O', 26); }
    X.restore(); }
  if (L.phase === 'event' && L.mg) mgDraw(L.mg, t);
  if (L.phase === 'vote') { const f = MARS.fork; X.fillStyle = 'rgba(2,8,24,.55)'; X.fillRect(0, 0, W, H);
    T(`${f.question} · TEAM VOTE`, 960, 330, 34, COL.amber, 'center', 8, 'O', 20); T(`${Math.max(0, Math.ceil(10 - L.pt))} s`, 960, 380, 22, COL.ice, 'center', 4);
    [f.left, f.right].forEach((o, i) => { const x = i ? 1000 : 320, k = backOut(ramp(.1 * i, .4 + .1 * i, L.pt));
      X.save(); X.translate(x + 300, 580); X.scale(k, k); X.translate(-(x + 300), -580);
      panel(x, 420, 600, 330, COL.cyan, 'rgba(4,14,34,.94)');
      T(o.label, x + 300, 470, 28, COL.ice, 'center', 4);
      const words = o.text.split(' '); let line = '', ly = 520; X.font = '700 22px Exo2';
      for (const w of words) { if (X.measureText(line + w).width > 520) { T(line.trim(), x + 300, ly, 22, '#cfe3ff', 'center', 0, 'E'); line = ''; ly += 30; } line += w + ' '; } T(line.trim(), x + 300, ly, 22, '#cfe3ff', 'center', 0, 'E');
      for (let p = 0; p < L.n; p++) keyCap(x + 300 + (p - (L.n - 1) / 2) * 90, 680, 58, KEY_LABELS[p][i ? 2 : 0], PLAYER[p].color, L.votes[p] === i, L.votes[p] === i ? 'VOTED' : '');
      X.restore(); }); }
  if (L.phase === 'checkpoint') { const k = L.pt, a = easeOut(k * 4) * (1 - ramp(3.8, 4.2, k));
    X.save(); X.globalAlpha = a; const r = 140 + 600 * easeOut(k / 1.2); X.beginPath(); X.arc(RX, GROUND - 120, r, 0, 7); X.strokeStyle = `rgba(52,211,153,${1 - easeOut(k / 1.2)})`; X.lineWidth = 6; X.stroke();
    panel(520, 380, 880, 230, COL.green, 'rgba(4,24,30,.92)');
    T(`CHECKPOINT ${L.sector + 1}/4`, 960, 440, 46, COL.green, 'center', 10, 'O', 24);
    T('PROGRESS SAVED · IF THE ROVER BREAKS, YOU RESTART HERE', 960, 500, 16, COL.ice, 'center', 3);
    T(MARS.checkpoints[L.sector], 960, 555, 20, COL.amber, 'center', 3); X.restore(); }
  if (L.phase === 'down') { X.save(); X.globalAlpha = ramp(0, .4, L.pt); X.fillStyle = 'rgba(30,2,8,.7)'; X.fillRect(0, 0, W, H);
    panel(520, 380, 880, 230, COL.red, 'rgba(30,4,10,.92)'); T(L.downWhy, 960, 450, 40, COL.red, 'center', 8, 'O', 22);
    if (L.n === 1) T(L.life > 0 ? 'USE YOUR EXTRA LIFE OR RESTART THE SECTOR' : 'NO EXTRA LIFE LEFT IN THIS SECTOR', 960, 530, 20, L.life > 0 ? COL.green : COL.amber, 'center', 4);
    else T(`RESTARTING SECTOR ${L.cp.sector + 1} FROM THE CHECKPOINT`, 960, 530, 20, COL.ice, 'center', 4);
    X.restore(); }
  if (L.phase === 'found') { const k = L.pt; X.save(); X.fillStyle = `rgba(56,189,248,${.25 * (1 - ramp(0, .6, k))})`; X.fillRect(0, 0, W, H);
    T(MARS.found.title, 960, 450, 96 * backOut(ramp(0, .4, k)), COL.ice, 'center', 14, 'O', 40);
    T(MARS.found.sub, 960, 560, 22, COL.cyan, 'center', 6); X.restore(); }
  if (L.phase === 'log') drawLog();
}
function drawLog() {   // the final Mars sign
  const k = L.pt; X.save(); X.globalAlpha = ramp(0, .5, k); X.fillStyle = 'rgba(1,3,10,.9)'; X.fillRect(0, 0, W, H);
  T(`MISSION LOG · ${MARS.name}`, 960, 120, 56, COL.sky, 'center', 14, 'O', 26);
  const m = L.clock / 60, tm = `${String(Math.floor(m)).padStart(2, '0')}:${String(Math.floor((m % 1) * 60)).padStart(2, '0')}`;
  T(`${tm} · 4/4 CHECKPOINTS · ICE ${L.ice}/${MARS.iceGoal} · ${L.data} MB SENT TO EARTH · ${L.crashes} CRASHES`, 960, 190, 19, COL.ice, 'center', 4);
  L.log.forEach((s, i) => { const y = 250 + i * 118, a = ramp(.4 + i * .2, .7 + i * .2, k), mm = s.time / 60;
    X.save(); X.globalAlpha *= a; panel(320, y, 1280, 98, COL.cyan, 'rgba(4,18,43,.9)');
    T(String(i + 1), 370, y + 49, 36, COL.cyan, 'center', 0); T(s.name, 430, y + 32, 20, COL.ice, 'left', 5);
    T(s.notes.join(' · ') || 'drove through', 430, y + 68, 21, '#cfe3ff', 'left', 0, 'E');
    T(`${String(Math.floor(mm)).padStart(2, '0')}:${String(Math.floor((mm % 1) * 60)).padStart(2, '0')}`, 1560, y + 49, 28, COL.amber, 'right', 3); X.restore(); });
  T(MARS.winText, 960, 870, 24, COL.ice, 'center', 0, 'E');
  T(`SCORE ${L.score.toLocaleString('en-US')} · BEST COMBO x${L.best}`, 960, 920, 24, COL.amber, 'center', 5);
  if (k > 2) { T('PRESS ANY MIDDLE KEY TO SEE THE MISSION REPORT', 960, 990, 18, COL.green, 'center', 4, 'O', Math.floor(k * 2) % 2 ? 14 : 0); }
  X.restore();
}
function render() {
  const t = L.t, storm = L.inStorm ? 1 : 0;
  X.save(); if (L.shake > .5) X.translate((Math.random() - .5) * L.shake, (Math.random() - .5) * L.shake);
  drawWorld(L.S, t, storm, L.route === 'canyon' ? 1 : 0);
  for (const o of L.objs) { if (o.dead) continue; const x = sx(o); if (x < -300 || x > W + 300) continue; if (o.type === 'ice') drawIce(x, t); else drawRock(x, o.type); }
  const ga = t - L.grabT < .3 ? Math.sin(Math.PI * (t - L.grabT) / .3) : 0;
  drawRover(t, L.y, { n: L.n, S: L.S, shield: L.shieldOn, signal: L.signal, broken: L.broken, blink: t < L.inv && Math.floor(t * 14) % 2, press: L.press.map((x) => t - x < .2), grab: ga, grabP: L.grabP || 0, still: L.v < 5 });
  drawMeteors();
  if (L.beam && t - L.beam.t < .18) { X.strokeStyle = COL.amber; X.lineWidth = 12; X.shadowColor = COL.amber; X.shadowBlur = 20; X.beginPath(); X.moveTo(RX + 190, GROUND - L.y - 140); X.lineTo(L.beam.x, GROUND - 90); X.stroke(); X.shadowBlur = 0; }
  for (const p of L.parts) { X.globalAlpha = 1 - p.age / p.life; X.fillStyle = p.c; X.fillRect(p.x, p.y, p.s, p.s); } X.globalAlpha = 1;
  drawTags(); L.pops.forEach((p) => popText(p, t));
  X.restore();
  drawHud(); drawHydrus(); drawOverlays(); drawAiTag();
}
// Space Apps rule: visible mark on AI-made images. The landscapes here are drawn by AI-assisted code.
// Bottom-right strip, under the crew panels: it never covers bars or keys.
function drawAiTag() {
  X.save(); X.font = '700 14px Exo2'; X.letterSpacing = '0.5px'; X.textAlign = 'right'; X.textBaseline = 'alphabetic';
  X.fillStyle = 'rgba(255,255,255,.65)'; X.shadowColor = 'rgba(0,0,0,.85)'; X.shadowBlur = 4;
  X.fillText('AI-generated illustration', W - 20, H - 6); X.restore(); X.letterSpacing = '0px';
}
function loop(now) {
  if (L.ended) return;
  const dt = Math.min(.05, (now - L.last) / 1000); L.last = now;
  const steps = L.paused ? 0 : window.FAST ? 8 : 1; for (let i = 0; i < steps && !L.ended; i++) step(dt);   // ESC pauses the level
  render(); L.raf = requestAnimationFrame(loop);
}
function stopLevel() { closeDownChoice(); L.ended = true; cancelAnimationFrame(L.raf); SND.music('off'); }
