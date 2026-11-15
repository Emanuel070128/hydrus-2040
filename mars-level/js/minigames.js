/* =====================================================
   HYDRUS 2040 · MARS LEVEL — MINIGAMES AND EMERGENCIES
   Each one: intro (shows the keys) → play (timer) → result.
   Keys are always shown as big colored key caps.
   ===================================================== */
const MG = {};
const lbl = (p, k) => KEY_LABELS[p][k];

function mgCreate(type, n) {
  const def = MARS.minigames[type];
  const g = { type, def, n, t: 0, phase: 'intro', result: null, rt: 0, hold: Array.from({ length: n }, () => [false, false, false]) };
  MG[type].init(g); return g;
}
function mgStep(g, dt) {
  g.t += dt;
  if (g.phase === 'intro' && g.t > 2.2) { g.phase = 'play'; g.pt = 0; }
  if (g.phase === 'play') {
    g.pt += dt; MG[g.type].step(g, dt);
    if (!g.result && g.def.time && g.pt > g.def.time && g.type !== 'drill') finish(g, 'lose');
  }
  if (g.phase === 'result') { g.rt += dt; if (g.rt > 2) g.phase = 'done'; }
}
function finish(g, r) { if (g.result) return; g.result = r; g.phase = 'result'; g.rt = 0; SND.play(r === 'win' ? 'win' : 'lose'); }
function mgKey(g, p, k, down) {
  if (p >= g.n) return; g.hold[p][k] = down;
  if (g.phase === 'play' && down) MG[g.type].key(g, p, k);
}
function mgPlayersText(g) { return g.n === 1 ? 'YOU' : 'ALL ' + g.n; }

/* ---------- 1 · scanner: shape the wave, then lock ---------- */
MG.scanner = {
  init(g) { g.ph = 2.3; g.drift = .55; g.dt0 = 0; g.lockFail = -9; },
  step(g, dt) { g.dt0 += dt; if (g.dt0 > 1.6) { g.dt0 = 0; g.drift = (Math.random() < .5 ? -1 : 1) * (.35 + Math.random() * .45); }
    g.ph += g.drift * dt; if (g.ph > Math.PI) g.ph -= 2 * Math.PI; if (g.ph < -Math.PI) g.ph += 2 * Math.PI;
    if (this.match(g) >= .9) { SND.play('lock'); finish(g, 'win'); } },   // 90% match wins right away (no LOCK, no hold)
  match(g) { return 1 - Math.abs(g.ph) / Math.PI; },
  key(g, p, k) {
    if (k === 0) { g.ph -= .28; SND.play('tap', p); } if (k === 2) { g.ph += .28; SND.play('tap', p); }
    if (this.match(g) >= .9) { SND.play('lock'); finish(g, 'win'); }
  },
  help(g) { return [g.n === 1 ? '◀ / ▶ move your wave onto the dotted wave' : 'Anyone: ◀ / ▶ move the wave onto the dotted wave', 'Reach 90% match and the signal locks by itself']; },
  keys(g, p) { return [[0, '◀ MOVE'], [2, 'MOVE ▶']]; },
  draw(g, t) {
    const m = this.match(g);
    for (const [amp, fr, col, dash, ph] of [[90, .02, 'rgba(224,242,254,.55)', [10, 8], 0], [90, .02, COL.cyan, [], g.ph]]) {
      X.setLineDash(dash); X.beginPath(); for (let x = 520; x <= 1400; x += 6) X.lineTo(x, 560 + amp * Math.sin((x - 520) * fr + ph + t * 2)); X.strokeStyle = col; X.lineWidth = 5; X.shadowColor = col; X.shadowBlur = 12; X.stroke(); X.shadowBlur = 0; }
    X.setLineDash([]);
    T(`MATCH ${Math.round(m * 100)}%`, 960, 700, 34, m >= .9 ? COL.green : COL.ice, 'center', 8, 'O', m >= .9 ? 20 : 0);
    bar(660, 730, 600, 14, m, m >= .9 ? COL.green : COL.cyan); X.fillStyle = COL.green; X.fillRect(660 + 600 * .9, 724, 3, 26);
    T('GOAL 90% · IT LOCKS BY ITSELF', 960, 775, 18, COL.green, 'center', 4);
  }
};

/* ---------- 2 · panels: mash to wipe the dust ---------- */
MG.panels = {
  init(g) { g.need = 28; g.c = Array(g.n).fill(0); },
  step(g) { if (g.c.every((c) => c >= g.need)) finish(g, 'win'); },
  key(g, p, k) { if (k !== 1) return; g.c[p] = Math.min(g.need, g.c[p] + 1); SND.play('tap', p); },
  help(g) { return [g.n === 1 ? 'MASH your middle key' : 'Each player MASHES their middle key', 'to wipe YOUR panel']; },
  keys(g, p) { return [[1, 'MASH']]; },
  draw(g, t) {
    const n = g.n, w = Math.min(260, 1000 / n - 30), x0 = 960 - (n * (w + 30) - 30) / 2;
    for (let i = 0; i < n; i++) { const x = x0 + i * (w + 30), y = 420, d = 1 - g.c[i] / g.need, c = PLAYER[i].color;
      X.fillStyle = '#0f2a5c'; X.fillRect(x, y, w, 240); X.strokeStyle = COL.cyan; X.lineWidth = 1.5;
      for (let k = 1; k < 4; k++) { X.beginPath(); X.moveTo(x + k * w / 4, y); X.lineTo(x + k * w / 4, y + 240); X.moveTo(x, y + k * 60); X.lineTo(x + w, y + k * 60); X.stroke(); }
      X.fillStyle = `rgba(170,95,55,${.95 * d})`; X.fillRect(x, y, w, 240);
      for (let k = 0; k < 26 * d; k++) { X.fillStyle = `rgba(110,55,25,${d})`; X.beginPath(); X.arc(x + ((k * 73 + i * 41) % w), y + ((k * 131 + i * 17) % 240), 6 + (k % 5) * 3, 0, 7); X.fill(); }
      X.strokeStyle = c; X.lineWidth = 3; X.strokeRect(x, y, w, 240);
      if (d <= 0) T('CLEAN', x + w / 2, y + 120, 26, COL.green, 'center', 6, 'O', 18);
      keyCap(x + w / 2, y + 300, 70, lbl(i, 1), c, g.hold[i][1], 'MASH'); bar(x, y + 370, w, 10, 1 - d, c); }
  }
};

/* ---------- 3 · bridge: everyone holds ---------- */
MG.bridge = {
  init(g) { g.f = 0; },
  step(g, dt) { const all = g.hold.every((h) => h[1]); g.f = clamp(g.f + (all ? .12 : -.16) * dt); g.all = all; if (g.f >= 1) finish(g, 'win'); },
  key(g, p, k) { if (k === 1) SND.play('tap', p); },
  help(g) { return [g.n === 1 ? 'HOLD your middle key' : 'EVERYONE HOLDS their middle key', 'If anyone lets go, the bridge pulls back']; },
  keys(g, p) { return [[1, 'HOLD']]; },
  draw(g, t) {
    X.fillStyle = '#12060a'; X.fillRect(760, 470, 400, 170); X.fillStyle = '#7a3a22'; X.fillRect(520, 470, 240, 170); X.fillRect(1160, 470, 240, 170);
    for (let i = 0; i < 10; i++) { if (i / 10 >= g.f) break; X.fillStyle = COL.green; X.shadowColor = COL.green; X.shadowBlur = 12; X.fillRect(760 + i * 40, 458, 36, 14); } X.shadowBlur = 0;
    T(`BRIDGE ${Math.round(g.f * 100)}%`, 960, 680, 30, g.all ? COL.green : COL.ice, 'center', 8);
    const n = g.n, x0 = 960 - (n - 1) * 70;
    for (let i = 0; i < n; i++) keyCap(x0 + i * 140, 760, 74, lbl(i, 1), PLAYER[i].color, g.hold[i][1], g.hold[i][1] ? 'HOLDING' : 'HOLD!');
  }
};

/* ---------- 4 · antenna: rotate, then hold to lock ---------- */
MG.antenna = {
  init(g) { g.a = -1.2; g.rot = 0; },
  target(g) { return .55 + .35 * Math.sin(g.t * .7); },
  WIN: .9,                                           // reaching 90% signal wins right away (no hold time)
  sig(g) { return clamp(1 - Math.abs(g.a - this.target(g)) / 2); },   // 90% = within 0.2 rad of Earth
  step(g, dt) {
    const h = g.hold[g.rot]; g.a = clamp(g.a + ((h[2] ? 1 : 0) - (h[0] ? 1 : 0)) * .9 * dt, -1.5, 1.5);
    if (this.sig(g) >= this.WIN) { SND.play('lock'); finish(g, 'win'); }
  },
  key(g, p, k) { if (p === g.rot && k !== 1) SND.play('tap', p); },
  help(g) { return [`${g.n === 1 ? 'HOLD' : CONFIG.names[g.rot] + ': HOLD'} ◀ / ▶ to turn the dish toward Earth`, 'Reach 90% signal and the link locks by itself']; },
  keys(g, p) { return p === g.rot ? [[0, '◀ TURN'], [2, 'TURN ▶']] : []; },
  draw(g, t) {
    const cx = 760, cy = 640, tg = this.target(g), sig = this.sig(g), ok = sig >= this.WIN;
    X.strokeStyle = 'rgba(56,189,248,.25)'; X.lineWidth = 2; for (let r = 70; r <= 210; r += 70) { X.beginPath(); X.arc(cx, cy, r, Math.PI, 2 * Math.PI); X.stroke(); }
    const ex = cx + Math.sin(tg) * 200, ey = cy - Math.cos(tg) * 200;
    X.beginPath(); X.arc(ex, ey, 16, 0, 7); X.fillStyle = '#1d6fd8'; X.shadowColor = COL.cyan; X.shadowBlur = 18; X.fill(); X.shadowBlur = 0; T('EARTH', ex, ey - 32, 14, COL.ice, 'center', 3);
    X.save(); X.translate(cx, cy); X.rotate(g.a); X.beginPath(); X.arc(0, 0, 80, Math.PI * 1.15, Math.PI * 1.85); X.strokeStyle = COL.ice; X.lineWidth = 9; X.stroke();
    X.beginPath(); X.moveTo(0, -24); X.lineTo(0, -230); X.strokeStyle = ok ? COL.green : COL.cyan; X.lineWidth = 3; X.setLineDash([8, 8]); X.stroke(); X.setLineDash([]); X.restore();
    T(`SIGNAL ${Math.round(sig * 100)}%`, 1060, 470, 18, ok ? COL.green : COL.sky, 'left', 4); T('GOAL 90%', 1360, 470, 12, COL.green, 'right', 3);
    for (let i = 0; i < 10; i++) { const h = 16 + i * 12; X.fillStyle = i < Math.round(sig * 10) ? (sig >= .85 ? COL.green : COL.cyan) : 'rgba(56,189,248,.12)'; X.fillRect(1060 + i * 30, 620 - h, 22, h); }
    X.fillStyle = COL.green; X.fillRect(1060 + 9 * 30 - 4, 480, 2, 140);   // 90% mark
    keyCap(1140, 720, 66, lbl(g.rot, 0), PLAYER[g.rot].color, g.hold[g.rot][0], 'TURN'); keyCap(1240, 720, 66, lbl(g.rot, 2), PLAYER[g.rot].color, g.hold[g.rot][2], 'TURN');
  }
};
/* ---------- 5 · repair: follow the order ---------- */
MG.repair = {
  init(g) { g.seq = Array.from({ length: 6 }, (_, i) => [g.n === 1 ? 0 : (i + Math.floor(Math.random() * g.n)) % g.n, Math.floor(Math.random() * 3)]); g.pos = 0; g.err = -9; },
  step() {},
  key(g, p, k) {
    const [sp, sk] = g.seq[g.pos];
    if (p === sp && k === sk) { g.pos++; SND.play('note', g.pos % 4); if (g.pos >= g.seq.length) finish(g, 'win'); }
    else { g.pos = 0; g.err = g.t; SND.play('error'); }
  },
  help(g) { return ['Press the keys IN ORDER, one by one', 'A wrong key restarts the sequence']; },
  keys(g, p) { return []; },
  draw(g, t) {
    g.seq.forEach(([p, k], i) => { const x = 960 - 2.5 * 150 + i * 150, done = i < g.pos, nx = i === g.pos, c = PLAYER[p].color;
      keyCap(x, 560, nx ? 110 : 90, lbl(p, k), c, done, CONFIG.names[p]);
      if (nx) { X.beginPath(); X.moveTo(x, 470); X.lineTo(x - 14, 450); X.lineTo(x + 14, 450); X.fillStyle = c; X.fill(); T('NOW', x, 432, 16, c, 'center', 4); } });
    if (g.t - g.err < .8) T('WRONG KEY · START OVER', 960, 720, 24, COL.red, 'center', 6, 'O', 14);
    else T(`STEP ${Math.min(g.pos + 1, 6)} OF 6`, 960, 720, 22, COL.ice, 'center', 6);
  }
};

/* ---------- 6 · drill: hit on the line ---------- */
MG.drill = {
  init(g) { g.lanes = g.n === 1 ? [[0, 0], [0, 1], [0, 2]] : Array.from({ length: g.n }, (_, i) => [i, 1]); g.notes = []; g.next = .6; g.hits = 0; g.need = 24; g.combo = 0; g.fx = []; },
  step(g, dt) {
    g.next -= dt;
    if (g.next <= 0) { g.next = .42 + Math.random() * .25; g.notes.push({ lane: Math.floor(Math.random() * g.lanes.length), t: g.pt + 1.6, done: false }); }
    for (const nt of g.notes) if (!nt.done && g.pt - nt.t > .18) { nt.done = true; g.combo = 0; }
    if (g.hits >= g.need) finish(g, 'win');
  },
  key(g, p, k) {
    const lane = g.lanes.findIndex(([lp, lk]) => lp === p && lk === k); if (lane < 0) return;
    const nt = g.notes.filter((x) => !x.done && x.lane === lane).sort((a, b) => Math.abs(a.t - g.pt) - Math.abs(b.t - g.pt))[0];
    if (nt && Math.abs(nt.t - g.pt) < .18) { nt.done = true; g.hits++; g.combo++; SND.play('note', lane % 4); g.fx.push({ lane, t: g.t, perfect: Math.abs(nt.t - g.pt) < .07 }); }
    else { g.combo = 0; SND.play('tap', p); }
  },
  help(g) { return ['Press YOUR key when a block touches the line', `${g.need} good hits reach the ice`]; },
  keys(g, p) { return g.n === 1 ? [[0, 'LANE 1'], [1, 'LANE 2'], [2, 'LANE 3']] : [[1, 'HIT']]; },
  draw(g, t) {
    const n = g.lanes.length, lw = 120, x0 = 870 - (n * (lw + 20)) / 2, top = 330, line = 690;
    g.lanes.forEach(([p, k], i) => { const x = x0 + i * (lw + 20), c = PLAYER[p].color;
      X.fillStyle = 'rgba(56,189,248,.06)'; X.fillRect(x, top, lw, 400); X.strokeStyle = c + '88'; X.lineWidth = 1.5; X.strokeRect(x, top, lw, 400);
      for (const nt of g.notes) { if (nt.done || nt.lane !== i) continue; const y = line - (nt.t - (g.pt || 0)) * 230; if (y < top || y > top + 420) continue;
        X.fillStyle = c; X.shadowColor = c; X.shadowBlur = 16; X.fillRect(x + 10, y - 14, lw - 20, 28); X.shadowBlur = 0; }
      for (const f of g.fx) if (f.lane === i && g.t - f.t < .4) T(f.perfect ? 'PERFECT' : 'GOOD', x + lw / 2, line - 60, 18, COL.green, 'center', 3, 'O', 14);
      keyCap(x + lw / 2, line + 70, 70, lbl(p, k), c, g.hold[p][k], 'HIT'); });
    X.fillStyle = COL.ice; X.shadowColor = COL.cyan; X.shadowBlur = 16; X.fillRect(x0 - 10, line - 2, n * (lw + 20), 4); X.shadowBlur = 0;
    const d = g.hits / g.need; T('DEPTH', 1220, 340, 16, COL.sky, 'left', 4); X.fillStyle = 'rgba(56,189,248,.12)'; X.fillRect(1230, 360, 40, 380);
    const gr = X.createLinearGradient(0, 360, 0, 740); gr.addColorStop(0, '#c2653a'); gr.addColorStop(1, COL.sky); X.fillStyle = gr; X.fillRect(1230, 360, 40, 380 * d);
    T(`${(d * 2).toFixed(1)} m`, 1290, 360 + 380 * d, 22, COL.ice, 'left', 2); T(`COMBO x${g.combo}`, 1220, 780, 20, COL.amber, 'left', 3);
  }
};

/* ---------- shared frame: title, how to play, timer, result ---------- */
function mgDraw(g, t) {
  const d = g.def, col = d.color, k = backOut(ramp(0, .35, g.t));
  X.fillStyle = 'rgba(2,8,24,.55)'; X.fillRect(0, 0, W, H);
  if (d.kind === 'EMERGENCY') { X.fillStyle = `rgba(244,63,94,${.08 + .06 * Math.sin(t * 8)})`; X.fillRect(0, 0, W, H); X.strokeStyle = COL.red; X.lineWidth = 10; X.strokeRect(5, 5, W - 10, H - 10); }
  X.save(); X.translate(960, 560); X.scale(k, k); X.translate(-960, -560);
  panel(400, 300, 1120, 560, col, 'rgba(4,14,34,.93)');
  T(`${d.kind} · ${d.title}`, 440, 340, 22, col, 'left', 6, 'O', 12);
  if (g.phase === 'play' && d.time && g.type !== 'drill') { const left = Math.max(0, d.time - g.pt); bar(1180, 332, 280, 12, left / d.time, left < 4 ? COL.red : col); T(`${left.toFixed(0)} s`, 1470, 362, 16, COL.ice, 'right', 3); }
  if (g.phase === 'intro') {
    const help = MG[g.type].help(g);
    T('GET READY', 960, 430, 46, COL.ice, 'center', 12, 'O', 20);
    T(help[0], 960, 500, 28, COL.ice, 'center', 1, 'E'); T(help[1], 960, 542, 24, '#9fd8ff', 'center', 1, 'E');
    // every player's keys for this minigame
    const ps = Array.from({ length: g.n }, (_, i) => i).filter((p) => MG[g.type].keys(g, p).length), x0 = 960 - (ps.length - 1) * 150;
    ps.forEach((p, j) => { const ks = MG[g.type].keys(g, p), cx = x0 + j * 300; T(CONFIG.names[p], cx, 620, 18, PLAYER[p].color, 'center', 4);
      ks.forEach(([kk, word], m) => keyCap(cx + (m - (ks.length - 1) / 2) * 92, 700, 72, lbl(p, kk), PLAYER[p].color, Math.floor(t * 3) % 2 === 0, word)); });
    if (g.type === 'repair') T('Watch the order, then press your color when it says NOW', 960, 700, 24, COL.ice, 'center', 1, 'E');
    bar(760, 820, 400, 6, g.t / 2.2, col);
  } else MG[g.type].draw(g, t);
  if (g.phase === 'result' || g.phase === 'done') {
    const win = g.result === 'win'; X.fillStyle = 'rgba(4,14,34,.75)'; X.fillRect(404, 380, 1112, 470);
    T(win ? d.win : d.lose, 960, 600, 46, win ? COL.green : COL.red, 'center', 8, 'O', 26);
  }
  X.restore();
}
