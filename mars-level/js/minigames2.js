/* =====================================================
   HYDRUS 2040 · MARS — MORE MINIGAMES (one set per sector)
   Same frame as the level: GET READY → play (timer) → result.
   Same keys: 3 per player. Each idea has a "bot" that plays it
   so the video shows how it works.
   ===================================================== */
const R0 = (seed) => rng(seed);
function setHold(g, p, k, on) { if (p < g.n && g.hold[p][k] !== on) mgKey(g, p, k, on); }
function tap(g, p, k) { mgKey(g, p, k, true); g.taps = g.taps || []; g.taps.push({ p, k, t: g.t + .12 }); }
function releaseTaps(g) { if (!g.taps) return; g.taps = g.taps.filter((x) => { if (g.t >= x.t) { g.hold[x.p][x.k] = false; return false; } return true; }); }
const lanesOf = (g) => g.n === 1 ? [[0, 0], [0, 1], [0, 2]] : Array.from({ length: g.n }, (_, i) => [i, 1]);
const nm = (p) => CONFIG.names[p];
function wrapText(s, x, y, maxW, size, col, lh, align = 'left') {
  X.font = `700 ${size}px Exo2`; let line = '', yy = y;
  for (const w of s.split(' ')) { if (X.measureText(line + w).width > maxW && line) { T(line.trim(), x, yy, size, col, align, 0, 'E'); line = ''; yy += lh; } line += w + ' '; }
  T(line.trim(), x, yy, size, col, align, 0, 'E'); return yy;
}

/* ---------- definitions (same format as data.js) ---------- */
Object.assign(LEVELS.mars.minigames, {
  land:   { kind: 'MINIGAME',  title: 'SKY CRANE LANDING',     color: '#38bdf8', time: 18, win: 'TOUCHDOWN · ROVER SAFE',         lose: 'HARD LANDING · HULL −1',
            say: 'Seven minutes of terror! Steer over the pad and fire the thrusters.' },
  relay:  { kind: 'MINIGAME',  title: 'RELAY TO THE ORBITER',  color: '#a78bfa', time: 16, win: 'DATA RELAYED · +15 MB',          lose: 'ORBITER GONE · DATA WAITS',
            say: 'The orbiter is passing over us! Pass the data packets, gate by gate.' },
  purify: { kind: 'EMERGENCY', title: 'PURIFY THE WATER',      color: '#fbbf24', time: 16, win: 'WATER SAFE TO DRINK',            lose: 'TANK CONTAMINATED · O₂ −20%',
            say: 'We melted some ice, but the soil has perchlorates! Only let the clean drops in.' },
  heat:   { kind: 'EMERGENCY', title: 'KEEP THE ROVER WARM',   color: '#f43f5e', time: 11, win: 'NIGHT SURVIVED · NOTHING FROZE', lose: 'FROZEN · ENERGY −30%',
            say: 'The storm brought the night: −80 °C! Heat your part, but take turns.' },
  core:   { kind: 'MINIGAME',  title: 'CORE THE LEOPARD ROCK', color: '#34d399', time: 16, win: 'SAMPLES SEALED · +12 MB',        lose: 'OUT OF TUBES · NO SAMPLE',
            say: 'Leopard spots! Core only the spotted rocks in your color.' },
  devil:  { kind: 'BONUS',     title: 'CATCH THE DUST DEVIL',  color: '#7dd3fc', time: 16, win: 'PANELS CLEANED · ENERGY FULL',   lose: 'THE DUST DEVIL GOT AWAY',
            say: 'A dust devil! Drive under it with the panels open: free cleaning!' }
});

/* ---------- 1 · sky crane landing (propulsion) ---------- */
MG.land = {
  init(g) { g.x = 640; g.alt = 100; g.v = 18; g.fuel = 1; g.pad = 1190; g.thrP = g.n > 1 ? 1 : 0; g.thrK = 1; },
  step(g, dt) {
    const h = g.hold[0]; g.x = clamp(g.x + ((h[2] ? 1 : 0) - (h[0] ? 1 : 0)) * 300 * dt, 520, 1400);
    g.thr = g.hold[g.thrP][g.thrK] && g.fuel > 0;
    g.v = Math.max(0, g.v + (g.thr ? -9 : 3.7) * dt); if (g.thr) g.fuel = Math.max(0, g.fuel - dt * .11);
    g.alt -= g.v * dt;
    if (g.alt <= 0) { g.alt = 0; finish(g, g.v < 4.5 && Math.abs(g.x - g.pad) < 95 ? 'win' : 'lose'); }
  },
  key() {},
  help(g) { return g.n === 1 ? ['◀ / ▶ steer over the green pad', 'HOLD the middle key to fire the thrusters'] : [`${nm(0)}: HOLD ◀ / ▶ to steer over the green pad`, `${nm(1)}: HOLD to fire the thrusters · land under 4 m/s`]; },
  keys(g, p) { const r = []; if (p === 0) r.push([0, '◀ STEER'], [2, 'STEER ▶']); if (p === g.thrP) r.push([1, 'THRUST']); return r; },
  bot(g) { const d = g.pad - g.x; setHold(g, 0, 2, d > 14); setHold(g, 0, 0, d < -14); setHold(g, g.thrP, 1, g.v > (g.alt > 40 ? 18 : g.alt > 12 ? 8 : 3.5)); },
  draw(g, t) {
    // solid ground: its top is the landing line, the rover's wheels rest on it
    const gy = 790, padTop = gy - 6, ry = padTop - 21 - Math.max(0, g.alt) * 3.4, sy = ry - 60 - Math.min(50, (100 - g.alt) * .7);   // the cables get longer as it gets close, like the real sky crane
    const gg = X.createLinearGradient(0, gy, 0, 856); gg.addColorStop(0, '#9a4a2a'); gg.addColorStop(1, '#3a1608');
    X.fillStyle = gg; X.fillRect(406, gy, 1108, 856 - gy); X.fillStyle = '#c2653a'; X.fillRect(406, gy, 1108, 5);
    X.fillStyle = '#6b3a20'; [[520, 18], [700, 10], [900, 22], [1400, 14]].forEach(([x, r]) => { X.beginPath(); X.ellipse(x, gy + 22, r, r * .4, 0, 0, 7); X.fill(); });
    X.fillStyle = '#1e293b'; X.fillRect(g.pad - 100, padTop, 200, gy - padTop + 6);
    X.fillStyle = COL.green; X.shadowColor = COL.green; X.shadowBlur = 20; X.fillRect(g.pad - 100, padTop - 3, 200, 6); X.shadowBlur = 0; T('LANDING PAD', g.pad, gy + 34, 13, COL.green, 'center', 3);
    // descent stage + rover on cables (sky crane)
    X.strokeStyle = COL.ice; X.lineWidth = 2; X.beginPath(); X.moveTo(g.x - 40, sy + 20); X.lineTo(g.x - 50, ry - 18); X.moveTo(g.x + 40, sy + 20); X.lineTo(g.x + 50, ry - 18); X.stroke();
    X.fillStyle = '#e8eef6'; X.beginPath(); X.roundRect(g.x - 70, ry - 30, 140, 32, 8); X.fill(); X.fillStyle = COL.cyan; X.fillRect(g.x - 66, ry - 12, 132, 5);
    [-48, 0, 48].forEach((dx) => { X.beginPath(); X.arc(g.x + dx, ry + 8, 13, 0, 7); X.fillStyle = '#141b2b'; X.fill(); X.strokeStyle = COL.cyan; X.lineWidth = 3; X.stroke(); });
    X.fillStyle = '#9aa7b8'; X.beginPath(); X.moveTo(g.x - 80, sy); X.lineTo(g.x + 80, sy); X.lineTo(g.x + 60, sy + 24); X.lineTo(g.x - 60, sy + 24); X.closePath(); X.fill(); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.stroke();
    if (g.thr) [-70, 70].forEach((dx) => { const f = 30 + Math.random() * 25; X.fillStyle = COL.amber; X.shadowColor = COL.amber; X.shadowBlur = 24; X.beginPath(); X.moveTo(g.x + dx - 10, sy + 20); X.lineTo(g.x + dx + 10, sy + 20); X.lineTo(g.x + dx, sy + 20 + f); X.fill(); X.shadowBlur = 0; });
    // readouts
    T('ALTITUDE', 1260, 420, 14, COL.sky, 'left', 4); T(`${g.alt.toFixed(0)} m`, 1480, 420, 26, COL.ice, 'right', 2);
    T('SPEED', 1260, 470, 14, COL.sky, 'left', 4); T(`${g.v.toFixed(1)} m/s`, 1480, 470, 26, g.v > 4.5 ? COL.red : COL.green, 'right', 2);
    T('FUEL', 1260, 520, 14, COL.sky, 'left', 4); bar(1340, 512, 140, 14, g.fuel, COL.amber);
    T('SAFE: UNDER 4 m/s', 1260, 560, 12, COL.green, 'left', 3);
    keyCap(560, 470, 56, lbl(0, 0), PLAYER[0].color, g.hold[0][0], 'STEER'); keyCap(640, 470, 56, lbl(0, 2), PLAYER[0].color, g.hold[0][2], 'STEER');
    keyCap(760, 470, 56, lbl(g.thrP, 1), PLAYER[g.thrP].color, g.hold[g.thrP][1], 'THRUST');
  }
};

/* ---------- 2 · relay to the orbiter (telecommunications) ---------- */
MG.relay = {
  init(g) { g.lanes = lanesOf(g); g.packets = []; g.next = .3; g.up = 0; g.need = 4; g.flash = []; g.lost = 0; g.made = 0;
    const m = g.lanes.length; g.gx = g.lanes.map((_, i) => m === 1 ? 900 : 640 + i * 700 / (m - 1)); },
  orb(g) { const a = Math.PI * (1 - clamp(g.pt / 16)); return { x: 960 + Math.cos(a) * 420, y: 700 - Math.sin(a) * 300, a }; },
  step(g, dt) {
    g.next -= dt; if (g.next <= 0 && g.made < 6) { g.next = 1.7; g.made++; g.packets.push({ x: 470, passed: g.lanes.map(() => false), dead: false, id: g.made }); }
    for (const pk of g.packets) { if (pk.dead || pk.up) continue; pk.x += 400 * dt;
      g.gx.forEach((x, i) => { if (!pk.passed[i] && pk.x > x + 38) { pk.dead = true; pk.deadT = g.t; g.lost++; } });
      if (pk.x > 1420) { const o = this.orb(g); if (o.a < Math.PI * .85 && o.a > Math.PI * .15) { pk.up = true; pk.upT = g.t; g.up++; } else { pk.dead = true; pk.deadT = g.t; } } }
    if (g.up >= g.need) finish(g, 'win');
  },
  key(g, p, k) { const i = g.lanes.findIndex(([lp, lk]) => lp === p && lk === k); if (i < 0) return;
    const pk = g.packets.find((q) => !q.dead && !q.up && !q.passed[i] && Math.abs(q.x - g.gx[i]) < 40);
    if (pk) { pk.passed[i] = true; g.flash.push({ i, t: g.t, ok: true }); SND.play('note', i); } else g.flash.push({ i, t: g.t, ok: false }); },
  help(g) { return ['Press YOUR key when the data packet is inside your gate', `Pass ${g.need} packets to the orbiter before it sets`]; },
  keys(g, p) { return g.n === 1 ? [[0, 'GATE 1'], [1, 'GATE 2'], [2, 'GATE 3']] : [[1, 'PASS']]; },
  bot(g) { releaseTaps(g); for (const pk of g.packets) { if (pk.dead || pk.up) continue; g.gx.forEach((x, i) => { const skip = pk.id === 2 && i === g.gx.length - 1;
    if (!pk.passed[i] && !skip && Math.abs(pk.x - x) < 15) tap(g, g.lanes[i][0], g.lanes[i][1]); }); } },
  draw(g, t) {
    const o = this.orb(g), y = 640;
    X.strokeStyle = 'rgba(167,139,250,.25)'; X.setLineDash([6, 10]); X.lineWidth = 2; X.beginPath(); X.ellipse(960, 700, 420, 300, 0, Math.PI, 2 * Math.PI); X.stroke(); X.setLineDash([]);
    X.save(); X.translate(o.x, o.y); X.fillStyle = '#e8eef6'; X.fillRect(-12, -9, 24, 18); X.fillStyle = COL.violet; X.fillRect(-46, -5, 30, 10); X.fillRect(16, -5, 30, 10); X.restore();
    T('ORBITER', o.x, o.y - 28, 13, COL.violet, 'center', 3);
    X.strokeStyle = 'rgba(56,189,248,.35)'; X.lineWidth = 4; X.beginPath(); X.moveTo(450, y); X.lineTo(1430, y); X.stroke();
    X.fillStyle = '#e8eef6'; X.beginPath(); X.moveTo(1430, y); X.lineTo(1460, y - 50); X.lineTo(1490, y); X.fill(); T('UPLINK', 1460, y + 26, 12, COL.sky, 'center', 3);
    g.gx.forEach((x, i) => { const [p, k] = g.lanes[i], c = PLAYER[p].color, fl = g.flash.filter((f) => f.i === i && g.t - f.t < .3).pop();
      X.strokeStyle = fl ? (fl.ok ? COL.green : COL.red) : c; X.lineWidth = 3; X.shadowColor = c; X.shadowBlur = 12; X.strokeRect(x - 40, y - 40, 80, 80); X.shadowBlur = 0;
      keyCap(x, y + 110, 62, lbl(p, k), c, g.hold[p][k], nm(p)); });
    for (const pk of g.packets) { if (pk.up && g.t - pk.upT < .6) { X.strokeStyle = COL.violet; X.lineWidth = 6; X.shadowColor = COL.violet; X.shadowBlur = 20; X.beginPath(); X.moveTo(1460, y - 50); X.lineTo(o.x, o.y); X.stroke(); X.shadowBlur = 0; }
      if (pk.up) continue; if (pk.dead) { if (g.t - pk.deadT < .8) T('LOST', pk.x, y - 70, 18, COL.red, 'center', 4, 'O', 12); continue; }
      X.save(); X.translate(pk.x, y); X.rotate(Math.PI / 4); X.fillStyle = COL.violet; X.shadowColor = COL.violet; X.shadowBlur = 22; X.fillRect(-14, -14, 28, 28); X.restore(); X.shadowBlur = 0; }
    T(`UPLINKED ${g.up}/${g.need}`, 470, 420, 22, COL.ice, 'left', 5); T('ORBITER SETS IN', 1100, 420, 14, COL.sky, 'left', 3); bar(1300, 412, 180, 12, 1 - g.pt / 16, COL.violet);
  }
};

/* ---------- 3 · purify the water (life support) ---------- */
MG.purify = {
  init(g) { g.lanes = lanesOf(g); g.drops = []; g.next = .5; g.tank = 0; g.bad = 0; g.need = 10; g.fx = []; g.r = R0(7); g.k = 0; },
  step(g, dt) {
    g.next -= dt; if (g.next <= 0) { g.next = .5; g.k++; g.drops.push({ lane: Math.floor(g.r() * g.lanes.length), t: g.pt + 1.5, toxic: g.k % 4 === 2, done: false }); }
    for (const d of g.drops) if (!d.done && g.pt - d.t > .2) d.done = true;
    if (g.tank >= g.need) finish(g, 'win'); if (g.bad >= 3) finish(g, 'lose');
  },
  key(g, p, k) { const lane = g.lanes.findIndex(([lp, lk]) => lp === p && lk === k); if (lane < 0) return;
    const d = g.drops.filter((x) => !x.done && x.lane === lane).sort((a, b) => Math.abs(a.t - g.pt) - Math.abs(b.t - g.pt))[0];
    if (d && Math.abs(d.t - g.pt) < .2) { d.done = true; if (d.toxic) { g.bad++; g.fx.push({ lane, t: g.t, txt: 'TOXIC!', c: COL.red }); SND.play('error'); } else { g.tank++; g.fx.push({ lane, t: g.t, txt: 'CLEAN', c: COL.green }); SND.play('note', lane); } } },
  help(g) { return ['Open YOUR valve when a BLUE drop touches the line', 'RED drops are perchlorate: let them fall'] ; },
  keys(g, p) { return g.n === 1 ? [[0, 'VALVE 1'], [1, 'VALVE 2'], [2, 'VALVE 3']] : [[1, 'VALVE']]; },
  bot(g) { releaseTaps(g); for (const d of g.drops) { if (d.done || d.bot) continue; const near = d.t - g.pt < .02; if (near) d.bot = true; mistake = d.toxic && g.bad === 0 && g.pt > 3;
    if (near && (!d.toxic || mistake)) { const [p, k] = g.lanes[d.lane]; tap(g, p, k); } } },
  draw(g, t) {
    const n = g.lanes.length, lw = 120, x0 = 860 - (n * (lw + 20)) / 2, top = 360, line = 690;
    g.lanes.forEach(([p, k], i) => { const x = x0 + i * (lw + 20), c = PLAYER[p].color;
      X.fillStyle = 'rgba(56,189,248,.06)'; X.fillRect(x, top, lw, 360); X.strokeStyle = c + '88'; X.lineWidth = 1.5; X.strokeRect(x, top, lw, 360);
      for (const d of g.drops) { if (d.done || d.lane !== i) continue; const y = line - (d.t - g.pt) * 220; if (y < top) continue; const col = d.toxic ? COL.red : COL.cyan, cx = x + lw / 2;
        X.beginPath(); X.moveTo(cx, y - 30); X.bezierCurveTo(cx - 6, y - 18, cx - 18, y - 6, cx - 18, y + 4); X.arc(cx, y + 4, 18, Math.PI, 0, true); X.bezierCurveTo(cx + 18, y - 6, cx + 6, y - 18, cx, y - 30);
        X.fillStyle = col; X.shadowColor = col; X.shadowBlur = 16; X.fill(); X.shadowBlur = 0; if (d.toxic) T('ClO₄', cx, y + 4, 11, '#04122b', 'center', 0); }
      for (const f of g.fx) if (f.lane === i && g.t - f.t < .5) T(f.txt, x + lw / 2, line - 70, 18, f.c, 'center', 3, 'O', 14);
      keyCap(x + lw / 2, line + 70, 66, lbl(p, k), c, g.hold[p][k], 'VALVE'); });
    X.fillStyle = COL.ice; X.shadowColor = COL.cyan; X.shadowBlur = 16; X.fillRect(x0 - 10, line - 2, n * (lw + 20), 4); X.shadowBlur = 0;
    T('DRINKING WATER', 1250, 380, 14, COL.sky, 'left', 3); X.fillStyle = 'rgba(56,189,248,.12)'; X.fillRect(1270, 400, 90, 300);
    const f = g.tank / g.need; X.fillStyle = COL.cyan; X.fillRect(1270, 700 - 300 * f, 90, 300 * f); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(1270, 400, 90, 300);
    T(`${Math.round(f * 100)}%`, 1315, 730, 20, COL.ice, 'center', 2);
    T('TOXIC', 1400, 380, 14, COL.red, 'left', 3); for (let i = 0; i < 3; i++) { X.fillStyle = i < g.bad ? COL.red : 'rgba(244,63,94,.15)'; X.fillRect(1405, 660 - i * 60, 40, 46); }
  }
};

/* ---------- 4 · keep the rover warm (power) ---------- */
const PARTS = ['BATTERY', 'WHEELS', 'COMPUTER', 'CAMERA'];
MG.heat = {
  init(g) { g.lanes = lanesOf(g); g.temp = g.lanes.map((_, i) => .7 - i * .05); g.rate = g.lanes.map((_, i) => .07 + i * .012); g.load = 0; g.trip = -9; g.fx = []; },
  step(g, dt) { const tripped = g.t - g.trip < 2;
    g.temp = g.temp.map((v, i) => Math.max(0, v - g.rate[i] * dt)); g.load = Math.max(0, g.load - 1.6 * dt);
    if (g.temp.some((v) => v <= 0)) finish(g, 'lose'); if (g.pt >= 10.9 && !g.result) finish(g, 'win'); g.tripped = tripped; },
  key(g, p, k) { const i = g.lanes.findIndex(([lp, lk]) => lp === p && lk === k); if (i < 0 || g.tripped) return;
    g.temp[i] = Math.min(1, g.temp[i] + .22); g.load += 1; SND.play('tap', p);
    if (g.load > 3.05) { g.trip = g.t; g.load = 0; g.fx.push({ t: g.t }); SND.play('error'); } },
  help(g) { return ['TAP your key to heat your part before it freezes', 'Too many heaters at once trips the breaker: take turns!']; },
  keys(g, p) { return g.n === 1 ? [[0, PARTS[0]], [1, PARTS[1]], [2, PARTS[2]]] : [[1, 'HEAT']]; },
  bot(g) { releaseTaps(g); if (g.tripped) return;
    if (!g.didTrip && g.pt > 2.6) { g.didTrip = true; g.lanes.forEach(([p, k]) => tap(g, p, k)); return; }
    const i = g.temp.indexOf(Math.min(...g.temp)); if (g.temp[i] < .5 && g.load < 1.9 && (!g.lastBot || g.t - g.lastBot > .35)) { g.lastBot = g.t; tap(g, g.lanes[i][0], g.lanes[i][1]); } },
  draw(g, t) {
    const n = g.lanes.length, w = 150, x0 = 900 - (n * (w + 30) - 30) / 2;
    T('OUTSIDE: −80 °C · NIGHT', 440, 400, 16, COL.sky, 'left', 4);
    g.lanes.forEach(([p, k], i) => { const x = x0 + i * (w + 30), c = PLAYER[p].color, v = g.temp[i];
      T(PARTS[i], x + w / 2, 440, 15, COL.ice, 'center', 3);
      X.fillStyle = 'rgba(56,189,248,.08)'; X.fillRect(x + w / 2 - 26, 460, 52, 230); X.strokeStyle = c; X.lineWidth = 2; X.strokeRect(x + w / 2 - 26, 460, 52, 230);
      const col = v < .25 ? COL.cyan : v < .5 ? COL.amber : COL.green; X.fillStyle = col; X.shadowColor = col; X.shadowBlur = 12; X.fillRect(x + w / 2 - 22, 690 - 226 * v, 44, 226 * v); X.shadowBlur = 0;
      X.setLineDash([6, 6]); X.strokeStyle = COL.sky; X.beginPath(); X.moveTo(x + 10, 690 - 226 * .15); X.lineTo(x + w - 10, 690 - 226 * .15); X.stroke(); X.setLineDash([]);
      T(`${Math.round(-80 + v * 100)} °C`, x + w / 2, 712, 16, COL.ice, 'center', 2);
      keyCap(x + w / 2, 775, 62, lbl(p, k), c, g.hold[p][k], 'HEAT'); });
    T('FREEZE LINE', x0 - 20, 690 - 226 * .15, 12, COL.sky, 'right', 2);
    T('BREAKER', 1290, 440, 14, COL.sky, 'left', 3); bar(1290, 460, 180, 18, Math.min(1, g.load / 3), g.load > 2.2 ? COL.red : COL.amber, 3);
    T('MAX 3 HEATERS AT ONCE', 1290, 500, 11, COL.ice, 'left', 2);
    if (g.tripped) { T('BREAKER TRIPPED', 1380, 560, 20, COL.red, 'center', 4, 'O', 16); T('NO HEAT FOR 2 s', 1380, 592, 14, COL.ice, 'center', 3); }
  }
};

/* ---------- 5 · core the leopard rock (science) ---------- */
const ROCKS = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1];   // 1 = leopard spots
MG.core = {
  ZONE: 95,   // a rock counts as "under the drill" while its center is within 95 px (the rock is 140 px wide)
  init(g) {
    g.lanes = g.n === 1 ? [[0, 1]] : Array.from({ length: g.n }, (_, i) => [i, 1]);   // 1 player: one key (middle) for every rock
    g.rocks = ROCKS.map((s, i) => ({ x: 1560 + i * 230, spot: !!s, owner: i % g.lanes.length, state: 0, seed: i * 13 }));
    g.tubes = []; g.good = 0; g.need = 3; g.drill = -9; g.msg = null;
  },
  step(g, dt) { for (const r of g.rocks) r.x -= 210 * dt; if (g.good >= g.need) finish(g, 'win'); if (g.tubes.length >= 6 && g.good < g.need) finish(g, 'lose'); },
  key(g, p, k) {
    const i = g.lanes.findIndex(([lp, lk]) => lp === p && lk === k); if (i < 0) return;
    g.drill = g.t; g.drillC = PLAYER[p].color;
    const r = g.rocks.filter((q) => !q.state && Math.abs(q.x - 960) < this.ZONE).sort((a, b) => Math.abs(a.x - 960) - Math.abs(b.x - 960))[0];
    if (!r) { g.msg = { t: g.t, text: 'NOTHING UNDER THE DRILL', c: COL.amber }; return; }                       // no tube wasted
    if (r.owner !== i) { const op = g.lanes[r.owner][0]; g.msg = { t: g.t, text: `THAT ROCK IS ${CONFIG.names[op]}'S`, c: PLAYER[op].color }; SND.play('error'); return; }   // not your color: no tube wasted
    if (r.spot) { r.state = 1; g.good++; g.tubes.push(1); SND.play('lock'); } else { r.state = 2; g.tubes.push(0); SND.play('error'); }
  },
  help(g) { return g.n === 1 ? ['Rocks roll under the drill', 'Leopard spots? Press your middle key to CORE it (6 tubes, need 3)'] : ['Rocks roll under the drill, each with a player color', 'Spotted rock in YOUR color? CORE it! (6 tubes, need 3)']; },
  keys(g, p) { return [[1, 'CORE']]; },
  bot(g) { releaseTaps(g); for (const r of g.rocks) { if (r.state || r.bot || r.x > 965) continue; r.bot = true; const oops = !r.spot && !g.oops && g.pt > 4;
    if (r.spot || oops) { if (oops) g.oops = true; const [p, k] = g.lanes[r.owner]; tap(g, p, k); } } },
  draw(g, t) {
    const y = 660, Z = this.ZONE;
    X.fillStyle = 'rgba(56,189,248,.08)'; X.fillRect(960 - Z, 590, Z * 2, 140);   // drill zone
    X.fillStyle = '#1a2436'; X.fillRect(420, y + 40, 1080, 26); for (let x = 420 - ((g.pt * 210) % 60); x < 1500; x += 60) { X.fillStyle = '#2c3b56'; X.fillRect(x, y + 44, 30, 18); }
    for (const r of g.rocks) { if (r.x < 380 || r.x > 1540) continue; const [op, ok] = g.lanes[r.owner], c = PLAYER[op].color, under = !r.state && Math.abs(r.x - 960) < Z;
      X.beginPath(); X.ellipse(r.x, y, 70, 42, 0, 0, 7); X.fillStyle = r.spot ? '#a35a3a' : '#7a4a30'; X.fill(); X.lineWidth = under ? 6 : 4; X.strokeStyle = r.state === 1 ? COL.green : r.state === 2 ? COL.red : c;
      if (under) { X.shadowColor = c; X.shadowBlur = 18; } X.stroke(); X.shadowBlur = 0;
      if (r.spot) for (let s = 0; s < 6; s++) { const sx = r.x - 40 + ((r.seed + s * 29) % 80), sy = y - 20 + ((r.seed * 3 + s * 17) % 40); X.beginPath(); X.arc(sx, sy, 8, 0, 7); X.fillStyle = '#e8d2b0'; X.fill(); X.beginPath(); X.arc(sx, sy, 5, 0, 7); X.fillStyle = '#2a140a'; X.fill(); }
      if (!r.state && g.n > 1) T(lbl(op, ok), r.x, y + 70, 16, c, 'center', 0);   // whose key cores this rock
      if (r.state === 1) T('CORED', r.x, y - 70, 15, COL.green, 'center', 3, 'O', 12); if (r.state === 2) T('NO SPOTS', r.x, y - 70, 15, COL.red, 'center', 3); }
    const dy = g.t - g.drill < .4 ? 40 * Math.sin(Math.PI * (g.t - g.drill) / .4) : 0;
    X.fillStyle = '#9aa7b8'; X.fillRect(930, 420, 60, 80); X.fillStyle = g.t - g.drill < .4 ? g.drillC : COL.ice; X.fillRect(950, 500, 20, 70 + dy); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(930, 420, 60, 80);
    X.setLineDash([6, 6]); X.strokeStyle = 'rgba(56,189,248,.5)'; X.beginPath(); X.moveTo(960 - Z, 590); X.lineTo(960 - Z, 730); X.moveTo(960 + Z, 590); X.lineTo(960 + Z, 730); X.stroke(); X.setLineDash([]);
    if (g.msg && g.t - g.msg.t < 1) T(g.msg.text, 960, 400, 18, g.msg.c, 'center', 4, 'O', 12);
    T('SAMPLE TUBES', 460, 420, 14, COL.sky, 'left', 3);
    for (let i = 0; i < 6; i++) { const v = g.tubes[i]; X.fillStyle = v === 1 ? COL.green : v === 0 ? COL.red : 'rgba(56,189,248,.12)'; X.beginPath(); X.roundRect(460 + i * 44, 440, 30, 90, 14); X.fill(); }
    T(`GOOD CORES ${g.good}/${g.need}`, 460, 560, 18, COL.ice, 'left', 4);
    const x0 = 960 - (g.lanes.length - 1) * 60; g.lanes.forEach(([p, k], i) => keyCap(x0 + i * 120, 800, 56, lbl(p, k), PLAYER[p].color, g.hold[p][k], 'CORE'));
  }
};
/* ---------- 6 · catch the dust devil (bonus, power) ---------- */
MG.devil = {
  init(g) { g.x = 640; g.clean = 0; g.holders = g.n === 1 ? [[0, 1]] : Array.from({ length: g.n - 1 }, (_, i) => [i + 1, 1]); },
  dx(g) { return 960 + 380 * Math.sin(g.pt * .7); },
  step(g, dt) { const h = g.hold[0]; g.x = clamp(g.x + ((h[2] ? 1 : 0) - (h[0] ? 1 : 0)) * 330 * dt, 470, 1450);
    g.open = g.holders.every(([p, k]) => g.hold[p][k]); g.under = Math.abs(g.x - this.dx(g)) < 80;
    if (g.open && g.under) g.clean = Math.min(1, g.clean + .17 * dt); if (g.clean >= 1) finish(g, 'win'); },
  key() {},
  help(g) { return g.n === 1 ? ['◀ / ▶ drive under the dust devil', 'HOLD the middle key to open the panels'] : [`${nm(0)}: HOLD ◀ / ▶ to drive under the dust devil`, 'Everyone else: HOLD to open the solar panels']; },
  keys(g, p) { const r = []; if (p === 0) r.push([0, '◀ DRIVE'], [2, 'DRIVE ▶']); if (g.holders.some(([q]) => q === p)) r.push([1, 'PANELS']); return r; },
  bot(g) { const d = this.dx(g) + 40 * Math.cos(g.pt * .7) - g.x; setHold(g, 0, 2, d > 20); setHold(g, 0, 0, d < -20); g.holders.forEach(([p, k]) => setHold(g, p, k, g.pt > .8)); },
  draw(g, t) {
    const gy = 760, dx = this.dx(g);
    X.fillStyle = '#5a2410'; X.fillRect(420, gy, 1080, 60); X.fillStyle = '#c2653a'; X.fillRect(420, gy, 1080, 5);
    for (let i = 0; i < 26; i++) { const yy = gy - i * 16, w = 18 + i * 5, ph = t * 9 + i * .7; X.beginPath(); X.ellipse(dx + Math.sin(ph) * (6 + i * .8), yy, w, 7, 0, 0, 7); X.strokeStyle = `rgba(226,180,138,${.55 - i * .015})`; X.lineWidth = 4; X.stroke(); }
    for (let i = 0; i < 24; i++) { const a = t * 6 + i, r = 30 + (i * 13) % 90; X.fillStyle = 'rgba(240,200,150,.6)'; X.fillRect(dx + Math.cos(a) * r, gy - 30 - (i * 17) % 330, 5, 5); }
    const ang = g.open ? -.9 : 0;
    X.fillStyle = '#e8eef6'; X.beginPath(); X.roundRect(g.x - 80, gy - 70, 160, 40, 10); X.fill();
    [-1, 1].forEach((s) => { X.save(); X.translate(g.x + s * 70, gy - 70); X.rotate(s * ang); X.fillStyle = g.clean > .02 && g.under && g.open ? COL.cyan : '#1e3a6a'; X.fillRect(s > 0 ? 0 : -110, -6, 110, 12); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(s > 0 ? 0 : -110, -6, 110, 12); X.restore(); });
    [-55, 0, 55].forEach((o) => { X.beginPath(); X.arc(g.x + o, gy - 20, 18, 0, 7); X.fillStyle = '#141b2b'; X.fill(); X.strokeStyle = COL.cyan; X.lineWidth = 3; X.stroke(); });
    if (g.under && g.open) T('CLEANING!', g.x, gy - 150, 20, COL.green, 'center', 4, 'O', 14);
    T('PANEL CLEAN', 1280, 420, 14, COL.sky, 'left', 3); bar(1280, 440, 200, 16, g.clean, COL.cyan);
    T(g.open ? 'PANELS OPEN' : 'PANELS CLOSED', 1280, 490, 14, g.open ? COL.green : COL.red, 'left', 3);
  }
};

