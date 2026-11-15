/* =====================================================
   HYDRUS 2040 · NEW MINIGAMES FOR THE MOON AND EUROPA
   12 games, all different from the Mars ones. Same frame as always:
   GET READY → play (timer) → result. Each planet gives its own
   story and numbers in planets.js (def.p): easy on the Moon,
   hard on Europa.
   charge · crank · balance · memory · whack · sync · flappy · dodge · count · stopper · catch · sort
   ===================================================== */
const P = (g) => g.def.p;
const turnP = (g, i) => i % g.n;
const anyKey = (g, k) => g.hold.some((h) => h[k]);
const pushOf = (g) => g.hold.reduce((s, h) => s + (h[2] ? 1 : 0) - (h[0] ? 1 : 0), 0);
const flash = (g, text, c) => { g.msg = { text, c, t: g.t }; };
function drawMsg(g, y = 410) { if (g.msg && g.t - g.msg.t < .9) T(g.msg.text, 960, y, 22, g.msg.c, 'center', 5, 'O', 14); }
const rnd = Math.random;

/* ---------- 1 · charge: hold to fill, let go inside the green zone (players take turns) ---------- */
MG.charge = {
  init(g) { g.f = 0; g.ok = 0; g.miss = 0; g.turn = 0; g.was = false; this.zone(g); },
  zone(g) { g.zc = .45 + rnd() * .4; },
  step(g, dt) {
    const p = turnP(g, g.turn), hold = g.hold[p][1], z = P(g).zone;
    if (hold) { g.f = Math.min(1.05, g.f + P(g).speed * dt); g.was = true; }
    if ((g.was && !hold) || g.f >= 1.05) {
      if (Math.abs(g.f - g.zc) <= z / 2) { g.ok++; flash(g, 'PERFECT', COL.green); SND.play('lock'); } else { g.miss++; flash(g, g.f > g.zc ? 'TOO MUCH' : 'TOO LITTLE', COL.red); SND.play('error'); }
      g.f = 0; g.was = false; g.turn++; this.zone(g); g.hold[p][1] = false;
    }
    if (g.ok >= P(g).need) finish(g, 'win');
  },
  key() {},
  help(g) { return [g.n === 1 ? 'HOLD your middle key to charge' : 'Take turns: HOLD your middle key to charge', `Let go inside the green zone · ${P(g).need} good ones`]; },
  keys() { return [[1, 'HOLD']]; },
  bot(g) { const p = turnP(g, g.turn); setHold(g, p, 1, g.f < g.zc - .01); },
  draw(g) {
    const x = 900, y0 = 380, h = 380, z = P(g).zone, p = turnP(g, g.turn), c = PLAYER[p].color;
    X.fillStyle = 'rgba(56,189,248,.1)'; X.fillRect(x, y0, 120, h); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(x, y0, 120, h);
    X.fillStyle = 'rgba(52,211,153,.35)'; X.fillRect(x, y0 + h * (1 - g.zc - z / 2), 120, h * z); X.strokeStyle = COL.green; X.strokeRect(x, y0 + h * (1 - g.zc - z / 2), 120, h * z);
    const fh = h * Math.min(1, g.f); const gr = X.createLinearGradient(0, y0 + h, 0, y0); gr.addColorStop(0, '#f59e0b'); gr.addColorStop(1, '#f43f5e');
    X.fillStyle = gr; X.fillRect(x + 20, y0 + h - fh, 80, fh);
    T(g.def.final ? `DEPTH ${g.ok} / ${P(g).need}` : `GOOD ${g.ok} / ${P(g).need}`, 1100, 440, 24, COL.ice, 'left', 4);
    T(`MISSES ${g.miss}`, 1100, 480, 16, COL.sky, 'left', 3);
    T(g.n > 1 ? `TURN: ${nm(p)}` : 'YOUR TURN', 1100, 560, 18, c, 'left', 4); keyCap(1160, 650, 70, lbl(p, 1), c, g.hold[p][1], 'HOLD');
    drawMsg(g, 350);
  }
};

/* ---------- 2 · crank: alternate LEFT and RIGHT as fast as you can (everyone together) ---------- */
MG.crank = {
  init(g) { g.prog = 0; g.last = Array(g.n).fill(-1); g.ang = Array(g.n).fill(0); g.need = Math.round(P(g).need * (1 + (g.n - 1) * .5)); },
  step(g) { if (g.prog >= g.need) finish(g, 'win'); },
  key(g, p, k) { if (k === 1) return; if (g.last[p] !== k) { if (g.last[p] >= 0) { g.prog++; g.ang[p] += .7; SND.play('tap', p); } g.last[p] = k; } },
  help(g) { return ['Alternate LEFT and RIGHT keys, fast!', g.n > 1 ? 'Everyone cranks together' : 'Left, right, left, right…']; },
  keys() { return [[0, '◀'], [2, '▶']]; },
  bot(g) { releaseTaps(g); if (g.t - (g.bt || 0) < .09) return; g.bt = g.t; for (let p = 0; p < g.n; p++) tap(g, p, g.last[p] === 0 ? 2 : 0); },
  draw(g) {
    const n = g.n, x0 = 960 - (n - 1) * 130;
    for (let p = 0; p < n; p++) { const cx = x0 + p * 260, cy = 540, c = PLAYER[p].color;
      X.beginPath(); X.arc(cx, cy, 70, 0, 7); X.strokeStyle = c; X.lineWidth = 6; X.stroke();
      for (let s = 0; s < 4; s++) { const a = g.ang[p] + s * Math.PI / 2; X.beginPath(); X.moveTo(cx, cy); X.lineTo(cx + Math.cos(a) * 64, cy + Math.sin(a) * 64); X.strokeStyle = COL.ice; X.lineWidth = 5; X.stroke(); }
      keyCap(cx - 45, 670, 54, lbl(p, 0), c, g.hold[p][0], ''); keyCap(cx + 45, 670, 54, lbl(p, 2), c, g.hold[p][2], ''); }
    const f = g.prog / g.need;
    T(g.def.final ? `DEPTH ${(f * 2).toFixed(1)} m / 2.0 m` : `${Math.round(f * 100)}%`, 960, 760, 24, COL.ice, 'center', 4);
    bar(660, 790, 600, 14, f, g.def.color);
  }
};

/* ---------- 3 · balance: keep the needle inside the green band ---------- */
MG.balance = {
  init(g) { g.v = .5; g.in = 0; g.force = 0; g.ft = 0; },
  step(g, dt) {
    g.ft -= dt; if (g.ft <= 0) { g.ft = .8; g.force = (rnd() < .5 ? -1 : 1) * P(g).drift * (.5 + rnd() * .5); }
    g.v = clamp(g.v + (g.force + clamp(pushOf(g), -1, 1) * .8) * dt);
    if (Math.abs(g.v - .5) < P(g).band / 2) g.in += dt;
    if (g.in >= P(g).need) finish(g, 'win');
  },
  key(g, p, k) { if (k !== 1) SND.play('tap', p); },
  help(g) { return [`HOLD ◀ / ▶ to keep the needle in the green band${g.n > 1 ? ' (anyone can push)' : ''}`, `Stay inside for ${P(g).need} seconds in total`]; },
  keys() { return [[0, '◀ PUSH'], [2, 'PUSH ▶']]; },
  bot(g) { setHold(g, 0, 0, g.v > .52); setHold(g, 0, 2, g.v < .48); },
  draw(g) {
    const x0 = 560, w = 800, y = 560, b = P(g).band, ok = Math.abs(g.v - .5) < b / 2;
    X.fillStyle = 'rgba(56,189,248,.1)'; X.fillRect(x0, y - 40, w, 80); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(x0, y - 40, w, 80);
    X.fillStyle = 'rgba(52,211,153,.35)'; X.fillRect(x0 + w * (.5 - b / 2), y - 40, w * b, 80);
    const nx = x0 + w * g.v; X.fillStyle = ok ? COL.green : COL.red; X.shadowColor = X.fillStyle; X.shadowBlur = 18; X.fillRect(nx - 5, y - 55, 10, 110); X.shadowBlur = 0;
    T(ok ? 'IN THE BAND' : 'OUT OF THE BAND', 960, 460, 22, ok ? COL.green : COL.red, 'center', 5);
    T(`${g.in.toFixed(1)} / ${P(g).need} s`, 960, 640, 22, COL.ice, 'center', 4); bar(660, 665, 600, 12, g.in / P(g).need, COL.green);
    keyCap(860, 760, 58, lbl(0, 0), PLAYER[0].color, anyKey(g, 0), 'PUSH'); keyCap(1060, 760, 58, lbl(0, 2), PLAYER[0].color, anyKey(g, 2), 'PUSH');
  }
};

/* ---------- 4 · memory: watch the code, then repeat it ---------- */
MG.memory = {
  init(g) { g.round = 0; g.len = P(g).start; this.newSeq(g); g.wrong = 0; },
  newSeq(g) { g.seq = Array.from({ length: g.len }, () => [Math.floor(rnd() * g.n), Math.floor(rnd() * 3)]); g.mode = 'show'; g.st = 0; g.pos = 0; },
  step(g, dt) {
    g.st += dt; if (g.mode === 'show' && g.st >= g.len * P(g).show + .4) { g.mode = 'input'; g.pos = 0; }
  },
  key(g, p, k) {
    if (g.mode !== 'input') return; const [sp, sk] = g.seq[g.pos];
    if (p === sp && k === sk) { g.pos++; SND.play('note', g.pos % 4);
      if (g.pos >= g.len) { g.round++; if (g.round >= P(g).rounds) return finish(g, 'win'); g.len++; flash(g, 'CORRECT · LONGER CODE', COL.green); this.newSeq(g); } }
    else { g.wrong++; flash(g, 'WRONG · WATCH AGAIN', COL.red); SND.play('error'); g.mode = 'show'; g.st = 0; g.pos = 0; }
  },
  help(g) { return ['WATCH the code light up, key by key', `Then press the same keys in the same order · ${P(g).rounds} codes`]; },
  keys() { return [[0, '1'], [1, '2'], [2, '3']]; },
  bot(g) { releaseTaps(g); if (g.mode !== 'input' || g.t - (g.bt || 0) < .25) return; g.bt = g.t; const [p, k] = g.seq[g.pos]; tap(g, p, k); },
  draw(g) {
    const n = g.len, x0 = 960 - (n - 1) * 70, show = g.mode === 'show', cur = show ? Math.floor(g.st / P(g).show) : g.pos;
    T(show ? 'WATCH' : 'YOUR TURN', 960, 430, 30, show ? COL.amber : COL.green, 'center', 10, 'O', 14);
    g.seq.forEach(([p, k], i) => { const x = x0 + i * 140, c = PLAYER[p].color;
      if (show) { const on = i === cur && (g.st % P(g).show) < P(g).show * .8; keyCap(x, 570, 100, on ? lbl(p, k) : '·', on ? c : 'rgba(56,189,248,.5)', on, on && g.n > 1 ? nm(p) : ''); }
      else keyCap(x, 570, 100, i < g.pos ? lbl(p, k) : '?', i < g.pos ? c : i === g.pos ? COL.ice : 'rgba(56,189,248,.5)', i < g.pos, ''); });
    T(`CODE ${g.round + 1} OF ${P(g).rounds}`, 960, 690, 18, COL.sky, 'center', 4); drawMsg(g, 740);
  }
};

/* ---------- 5 · whack: hit each target before it fades ---------- */
MG.whack = {
  init(g) { g.lanes = lanesOf(g); g.tg = []; g.next = .4; g.hits = 0; g.miss = 0; },
  step(g, dt) {
    g.next -= dt; const free = g.lanes.map((_, i) => i).filter((i) => !g.tg.some((t) => t.lane === i));
    if (g.next <= 0 && free.length) { g.next = P(g).every * (.7 + rnd() * .6); g.tg.push({ lane: free[Math.floor(rnd() * free.length)], t0: g.pt }); }
    g.tg = g.tg.filter((t) => { if (g.pt - t.t0 > P(g).life) { g.miss++; flash(g, 'MISSED ONE', COL.red); return false; } return true; });
    if (g.hits >= P(g).need) finish(g, 'win'); else if (g.miss >= P(g).miss) finish(g, 'lose');
  },
  key(g, p, k) { const lane = g.lanes.findIndex(([lp, lk]) => lp === p && lk === k); if (lane < 0) return;
    const i = g.tg.findIndex((t) => t.lane === lane); if (i >= 0) { g.tg.splice(i, 1); g.hits++; SND.play('note', lane % 4); } else SND.play('tap', p); },
  help(g) { return ['A target lights up in a slot: press THAT slot\'s key', `Hit ${P(g).need} before ${P(g).miss} get away`]; },
  keys(g) { return g.n === 1 ? [[0, 'SLOT 1'], [1, 'SLOT 2'], [2, 'SLOT 3']] : [[1, 'HIT']]; },
  bot(g) { releaseTaps(g); for (const t of g.tg) if (g.pt - t.t0 > .3 && !t.bot) { t.bot = true; const [p, k] = g.lanes[t.lane]; tap(g, p, k); } },
  draw(g) {
    const n = g.lanes.length, x0 = 960 - (n - 1) * 150;
    g.lanes.forEach(([p, k], i) => { const x = x0 + i * 300, y = 540, c = PLAYER[p].color, t = g.tg.find((q) => q.lane === i);
      X.beginPath(); X.arc(x, y, 80, 0, 7); X.fillStyle = 'rgba(4,18,43,.9)'; X.fill(); X.strokeStyle = c + '99'; X.lineWidth = 3; X.stroke();
      if (t) { const a = (g.pt - t.t0) / P(g).life;
        for (let s = 0; s < 7; s++) { X.beginPath(); X.arc(x + Math.cos(s + g.t * 3) * 26, y + Math.sin(s * 2 + g.t * 3) * 20, 26 + 10 * a, 0, 7); X.fillStyle = `rgba(${g.def.color === '#fbbf24' ? '226,180,120' : '200,200,210'},.55)`; X.fill(); }
        X.beginPath(); X.arc(x, y, 92, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - a)); X.strokeStyle = COL.red; X.lineWidth = 6; X.stroke(); }
      keyCap(x, y + 150, 66, lbl(p, k), c, g.hold[p][k], g.n > 1 ? nm(p) : 'SLOT ' + (i + 1)); });
    T(`HIT ${g.hits} / ${P(g).need}`, 560, 420, 20, COL.ice, 'left', 4); T(`MISSED ${g.miss} / ${P(g).miss}`, 1360, 420, 20, g.miss ? COL.red : COL.sky, 'right', 4);
    drawMsg(g, 760);
  }
};

/* ---------- 6 · sync: everyone presses together when the ring closes ---------- */
MG.sync = {
  init(g) { g.beat = 1.4; g.pressed = Array(g.n).fill(-99); g.ok = 0; g.fails = 0; },
  step(g) {
    const w = P(g).win;
    if (g.pt >= g.beat + w) {
      if (g.pressed.every((t) => Math.abs(t - g.beat) <= w)) { g.ok++; flash(g, 'IN SYNC!', COL.green); SND.play('lock'); } else { g.fails++; flash(g, 'OUT OF SYNC', COL.red); SND.play('error'); }
      g.beat += P(g).period;
    }
    if (g.ok >= P(g).need) finish(g, 'win');
  },
  key(g, p, k) { if (k === 1) { g.pressed[p] = g.pt; SND.play('tap', p); } },
  help(g) { return [g.n === 1 ? 'Press the middle key when the ring closes' : 'EVERYONE presses the middle key when the ring closes', `${P(g).need} good beats`]; },
  keys() { return [[1, 'NOW']]; },
  bot(g) { releaseTaps(g); for (let p = 0; p < g.n; p++) if (Math.abs(g.pt - g.beat) < .03 && Math.abs(g.pressed[p] - g.beat) > P(g).win) tap(g, p, 1); },
  draw(g) {
    const k = clamp((g.beat - g.pt) / P(g).period), r = 50 + 220 * k, near = Math.abs(g.pt - g.beat) <= P(g).win;
    X.beginPath(); X.arc(960, 560, 50, 0, 7); X.strokeStyle = COL.green; X.lineWidth = 6; X.shadowColor = COL.green; X.shadowBlur = near ? 30 : 8; X.stroke(); X.shadowBlur = 0;
    X.beginPath(); X.arc(960, 560, r, 0, 7); X.strokeStyle = near ? COL.green : g.def.color; X.lineWidth = 4; X.stroke();
    T(`${g.ok} / ${P(g).need}`, 960, 562, 26, COL.ice, 'center', 2);
    const x0 = 960 - (g.n - 1) * 70; for (let p = 0; p < g.n; p++) keyCap(x0 + p * 140, 790, 62, lbl(p, 1), PLAYER[p].color, Math.abs(g.pressed[p] - g.beat) <= P(g).win || g.hold[p][1], g.n > 1 ? nm(p) : 'NOW');
    drawMsg(g, 400);
  }
};

/* ---------- 7 · flappy: hold to rise, let go to fall, fly through the gaps ---------- */
MG.flappy = {
  init(g) { g.cy = 560; g.vy = 0; g.cols = []; g.passed = 0; g.lives = P(g).lives; g.inv = 0; this.add(g, 1150); },
  add(g, x) { g.cols.push({ x, c: 470 + rnd() * 180, passed: false }); },
  step(g, dt) {
    const pp = P(g), up = g.hold.some((h) => h[1]);
    g.vy = clamp(g.vy + (up ? -pp.thrust : pp.grav) * dt, -320, 320); g.cy = clamp(g.cy + g.vy * dt, 395, 745);
    for (const c of g.cols) { c.x -= pp.speed * dt;
      if (!c.passed && c.x < 600 - 30) { c.passed = true; g.passed++; SND.play('note', g.passed % 4); }
      if (g.t > g.inv && Math.abs(c.x - 620) < 45 && Math.abs(g.cy - c.c) > pp.gap / 2 - 16) { g.lives--; g.inv = g.t + 1.1; flash(g, 'BUMP!', COL.red); SND.play('error'); } }
    g.cols = g.cols.filter((c) => c.x > 380); if (g.cols[g.cols.length - 1].x < 1460 - 380) this.add(g, 1500);
    if (g.passed >= pp.need) finish(g, 'win'); else if (g.lives <= 0) finish(g, 'lose');
  },
  key(g, p, k) { if (k === 1) SND.play('tap', p); },
  help(g) { return [g.n === 1 ? 'HOLD the middle key to rise, let go to fall' : 'Anyone HOLDS the middle key to rise, let go to fall', `Fly through ${P(g).need} gaps · ${P(g).lives} bumps allowed`]; },
  keys() { return [[1, 'RISE']]; },
  bot(g) { const c = g.cols.find((q) => q.x > 560) || g.cols[0]; setHold(g, 0, 1, g.cy + g.vy * .22 > c.c); },
  draw(g) {
    X.save(); X.beginPath(); X.rect(440, 380, 1040, 380); X.clip();
    X.fillStyle = 'rgba(56,189,248,.05)'; X.fillRect(440, 380, 1040, 380);
    for (const c of g.cols) { const gp = P(g).gap; X.fillStyle = MARS.palette.boulder; X.fillRect(c.x - 40, 380, 80, c.c - gp / 2 - 380); X.fillRect(c.x - 40, c.c + gp / 2, 80, 760 - c.c - gp / 2);
      X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(c.x - 40, 380, 80, c.c - gp / 2 - 380); X.strokeRect(c.x - 40, c.c + gp / 2, 80, 760 - c.c - gp / 2); }
    const blink = g.t < g.inv && Math.floor(g.t * 12) % 2;
    if (!blink) { X.fillStyle = '#e8eef6'; X.beginPath(); X.roundRect(590, g.cy - 16, 60, 30, 8); X.fill(); X.fillStyle = COL.cyan; X.fillRect(596, g.cy - 4, 48, 5);
      if (g.hold.some((h) => h[1])) { X.fillStyle = COL.amber; X.beginPath(); X.moveTo(605, g.cy + 14); X.lineTo(635, g.cy + 14); X.lineTo(620, g.cy + 40); X.fill(); } }
    X.restore(); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(440, 380, 1040, 380);
    T(`GAPS ${g.passed} / ${P(g).need}`, 460, 800, 20, COL.ice, 'left', 4); T(`BUMPS LEFT ${g.lives}`, 1460, 800, 20, g.lives > 1 ? COL.sky : COL.red, 'right', 4);
    keyCap(960, 805, 56, lbl(0, 1), PLAYER[0].color, g.hold.some((h) => h[1]), ''); drawMsg(g, 350);
  }
};

/* ---------- 8 · dodge: pick a lane and survive ---------- */
MG.dodge = {
  init(g) { g.lane = 1; g.obs = []; g.next = .8; g.hits = 0; g.inv = 0; },
  step(g, dt) {
    const pp = P(g); g.next -= dt;
    if (g.next <= 0) { g.next = pp.every * (.75 + rnd() * .5); const free = Math.floor(rnd() * 3); for (let l = 0; l < 3; l++) if (l !== free && rnd() < .55) g.obs.push({ x: 1480, lane: l }); }
    for (const o of g.obs) { o.x -= pp.speed * dt; if (!o.hit && g.t > g.inv && o.lane === g.lane && Math.abs(o.x - 620) < 40) { o.hit = true; g.hits++; g.inv = g.t + .8; flash(g, 'HIT!', COL.red); SND.play('error'); } }
    g.obs = g.obs.filter((o) => o.x > 420);
    if (g.hits >= pp.hits) finish(g, 'lose'); else if (g.pt >= pp.survive) finish(g, 'win');
  },
  key(g, p, k) { g.lane = k; SND.play('tap', p); },
  help(g) { return ['Press TOP, MIDDLE or LOW to change lane', `Survive ${P(g).survive} seconds · ${P(g).hits} hits and you fail`]; },
  keys() { return [[0, 'TOP'], [1, 'MID'], [2, 'LOW']]; },
  bot(g) { releaseTaps(g); const danger = (l) => g.obs.some((o) => o.lane === l && o.x > 560 && o.x < 960); if (danger(g.lane)) { const l = [0, 1, 2].find((q) => !danger(q)); if (l !== undefined) tap(g, 0, l); } },
  draw(g) {
    const ys = [470, 570, 670];
    ys.forEach((y, l) => { X.fillStyle = l === g.lane ? 'rgba(56,189,248,.1)' : 'rgba(56,189,248,.04)'; X.fillRect(440, y - 45, 1040, 90); X.strokeStyle = 'rgba(56,189,248,.25)'; X.lineWidth = 1; X.strokeRect(440, y - 45, 1040, 90); });
    for (const o of g.obs) { X.beginPath(); X.arc(o.x, ys[o.lane], 26, 0, 7); X.fillStyle = g.def.color; X.shadowColor = g.def.color; X.shadowBlur = 22; X.fill(); X.shadowBlur = 0;
      X.strokeStyle = 'rgba(255,255,255,.5)'; X.beginPath(); X.moveTo(o.x + 30, ys[o.lane]); X.lineTo(o.x + 90, ys[o.lane]); X.stroke(); }
    if (!(g.t < g.inv && Math.floor(g.t * 12) % 2)) { const y = ys[g.lane]; X.fillStyle = '#e8eef6'; X.beginPath(); X.roundRect(580, y - 20, 80, 36, 8); X.fill(); X.fillStyle = COL.cyan; X.fillRect(586, y - 4, 68, 6); }
    T(`${Math.max(0, P(g).survive - g.pt).toFixed(1)} s LEFT`, 960, 400, 22, COL.ice, 'center', 5); T(`HITS ${g.hits} / ${P(g).hits}`, 1460, 400, 18, g.hits ? COL.red : COL.sky, 'right', 4);
    ['TOP', 'MID', 'LOW'].forEach((w, k) => keyCap(860 + k * 100, 790, 54, lbl(0, k), PLAYER[0].color, anyKey(g, k), w));
    drawMsg(g, 760);
  }
};

/* ---------- 9 · count: count the flashes, then answer 1, 2 or 3 ---------- */
MG.count = {
  init(g) { g.ok = 0; g.wrong = 0; this.round(g); },
  round(g) { g.ans = 1 + Math.floor(rnd() * P(g).max); const sh = P(g).show; g.fl = Array.from({ length: g.ans }, (_, i) => ({ t: .3 + (i + rnd() * .5) * sh / g.ans, x: 560 + rnd() * 800, y: 420 + rnd() * 260 }));
    g.mode = 'show'; g.st = 0; },
  step(g, dt) { g.st += dt; if (g.mode === 'show' && g.st > P(g).show + .6) g.mode = 'ask'; if (g.mode === 'result' && g.st > .7) this.round(g); },
  key(g, p, k) { if (g.mode !== 'ask') return; if (k + 1 === g.ans) { g.ok++; flash(g, 'CORRECT', COL.green); SND.play('lock'); } else { g.wrong++; flash(g, `IT WAS ${g.ans}`, COL.red); SND.play('error'); }
    if (g.ok >= P(g).need) return finish(g, 'win'); if (g.wrong >= 3) return finish(g, 'lose'); g.mode = 'result'; g.st = 0; },
  help(g) { return ['Count the flashes, then answer', 'LEFT = 1 · MIDDLE = 2 · RIGHT = 3 · 3 mistakes and you fail']; },
  keys() { return [[0, '1'], [1, '2'], [2, '3']]; },
  bot(g) { releaseTaps(g); if (g.mode === 'ask' && g.st > .3 && !g.botDone) { g.botDone = true; tap(g, 0, g.ans - 1); } if (g.mode !== 'ask') g.botDone = false; },
  draw(g) {
    X.fillStyle = 'rgba(1,3,10,.6)'; X.fillRect(540, 390, 840, 320); X.strokeStyle = 'rgba(56,189,248,.3)'; X.strokeRect(540, 390, 840, 320);
    if (g.mode === 'show') for (const f of g.fl) { const a = g.st - f.t; if (a < 0 || a > .22) continue; X.beginPath(); X.arc(f.x, f.y, 30 * (1 - a * 2), 0, 7); X.fillStyle = g.def.color; X.shadowColor = g.def.color; X.shadowBlur = 40; X.fill(); X.shadowBlur = 0; }
    if (g.mode === 'show') T('WATCH…', 960, 740, 22, COL.amber, 'center', 6);
    if (g.mode === 'ask') T('HOW MANY?', 960, 550, 44, COL.ice, 'center', 10, 'O', 20);
    [0, 1, 2].forEach((k) => keyCap(860 + k * 100, 800, 56, lbl(0, k), PLAYER[0].color, anyKey(g, k), String(k + 1)));
    T(`CORRECT ${g.ok} / ${P(g).need}`, 560, 365, 18, COL.ice, 'left', 4); T(`MISTAKES ${g.wrong} / 3`, 1360, 365, 18, g.wrong ? COL.red : COL.sky, 'right', 4);
    drawMsg(g, 640);
  }
};

/* ---------- 10 · stopper: stop the moving needle inside the green zone (players take turns) ---------- */
MG.stopper = {
  init(g) { g.x = 0; g.dir = 1; g.ok = 0; g.miss = 0; g.turn = 0; g.zc = .5; this.zone(g); },
  zone(g) { g.zc = .15 + rnd() * .7; },
  step(g, dt) { g.x += g.dir * P(g).speed * (1 + g.ok * .08) * dt; if (g.x > 1) { g.x = 1; g.dir = -1; } if (g.x < 0) { g.x = 0; g.dir = 1; } },
  key(g, p, k) { if (k !== 1 || p !== turnP(g, g.turn)) return;
    if (Math.abs(g.x - g.zc) <= P(g).zone / 2) { g.ok++; flash(g, 'GOT IT', COL.green); SND.play('lock'); this.zone(g); } else { g.miss++; flash(g, 'MISSED', COL.red); SND.play('error'); }
    g.turn++; if (g.ok >= P(g).need) finish(g, 'win'); else if (g.miss >= P(g).miss) finish(g, 'lose'); },
  help(g) { return [g.n === 1 ? 'Press the middle key when the needle is in the green' : 'Take turns: press when the needle is in the green', `${P(g).need} good stops · ${P(g).miss} misses and you fail`]; },
  keys() { return [[1, 'STOP']]; },
  bot(g) { releaseTaps(g); if (Math.abs(g.x - g.zc) < P(g).zone * .25 && g.t - (g.bt || 0) > .3) { g.bt = g.t; tap(g, turnP(g, g.turn), 1); } },
  draw(g) {
    const x0 = 560, w = 800, y = 560, z = P(g).zone, p = turnP(g, g.turn), c = PLAYER[p].color;
    X.fillStyle = 'rgba(56,189,248,.1)'; X.fillRect(x0, y - 30, w, 60); X.strokeStyle = COL.cyan; X.lineWidth = 2; X.strokeRect(x0, y - 30, w, 60);
    X.fillStyle = 'rgba(52,211,153,.4)'; X.fillRect(x0 + w * (g.zc - z / 2), y - 30, w * z, 60);
    X.fillStyle = COL.amber; X.shadowColor = COL.amber; X.shadowBlur = 16; X.fillRect(x0 + w * g.x - 5, y - 46, 10, 92); X.shadowBlur = 0;
    T(`GOOD ${g.ok} / ${P(g).need}`, 560, 450, 20, COL.ice, 'left', 4); T(`MISSES ${g.miss} / ${P(g).miss}`, 1360, 450, 20, g.miss ? COL.red : COL.sky, 'right', 4);
    T(g.n > 1 ? `TURN: ${nm(p)}` : '', 960, 660, 18, c, 'center', 4); keyCap(960, 740, 66, lbl(p, 1), c, g.hold[p][1], 'STOP'); drawMsg(g, 400);
  }
};

/* ---------- 11 · catch: move the catcher, catch the good ones, dodge the bad ones ---------- */
MG.catch = {
  init(g) { g.cx = .5; g.items = []; g.next = .5; g.got = 0; g.bad = 0; },
  step(g, dt) {
    const pp = P(g); g.cx = clamp(g.cx + clamp(pushOf(g), -1, 1) * 1.15 * dt, .04, .96); g.next -= dt;
    if (g.next <= 0) { g.next = pp.every * (.7 + rnd() * .6); g.items.push({ x: .06 + rnd() * .88, y: 390, bad: rnd() < pp.bad }); }
    for (const it of g.items) { it.y += pp.speed * dt;
      if (!it.done && it.y >= 715 && Math.abs(it.x - g.cx) < .075) { it.done = true; if (it.bad) { g.bad++; flash(g, 'OUCH!', COL.red); SND.play('error'); } else { g.got++; SND.play('grab'); } } }
    g.items = g.items.filter((it) => !it.done && it.y < 770);
    if (g.got >= pp.need) finish(g, 'win'); else if (g.bad >= 3) finish(g, 'lose');
  },
  key(g, p, k) { if (k !== 1) SND.play('tap', p); },
  help(g) { return [`HOLD ◀ / ▶ to move the catcher${g.n > 1 ? ' (anyone can move it)' : ''}`, `Catch ${P(g).need} blue ones · 3 red ones and you fail`]; },
  keys() { return [[0, '◀ MOVE'], [2, 'MOVE ▶']]; },
  bot(g) { const good = g.items.filter((i) => !i.bad).sort((a, b) => b.y - a.y)[0], bad = g.items.find((i) => i.bad && i.y > 600 && Math.abs(i.x - g.cx) < .12);
    let tx = good ? good.x : .5; if (bad) tx = bad.x > g.cx ? g.cx - .2 : g.cx + .2; setHold(g, 0, 0, tx < g.cx - .02); setHold(g, 0, 2, tx > g.cx + .02); },
  draw(g) {
    const x0 = 460, w = 1000;
    X.fillStyle = 'rgba(56,189,248,.05)'; X.fillRect(x0, 380, w, 380); X.strokeStyle = 'rgba(56,189,248,.3)'; X.strokeRect(x0, 380, w, 380);
    for (const it of g.items) { const x = x0 + w * it.x; X.beginPath(); X.arc(x, it.y, 16, 0, 7); X.fillStyle = it.bad ? COL.red : COL.sky; X.shadowColor = X.fillStyle; X.shadowBlur = 16; X.fill(); X.shadowBlur = 0; }
    const cx = x0 + w * g.cx; X.fillStyle = '#e8eef6'; X.beginPath(); X.moveTo(cx - 70, 715); X.lineTo(cx + 70, 715); X.lineTo(cx + 50, 745); X.lineTo(cx - 50, 745); X.closePath(); X.fill(); X.strokeStyle = COL.cyan; X.lineWidth = 3; X.stroke();
    T(`CAUGHT ${g.got} / ${P(g).need}`, 460, 800, 20, COL.ice, 'left', 4); T(`RED ${g.bad} / 3`, 1460, 800, 20, g.bad ? COL.red : COL.sky, 'right', 4);
    keyCap(900, 805, 54, lbl(0, 0), PLAYER[0].color, anyKey(g, 0), ''); keyCap(1020, 805, 54, lbl(0, 2), PLAYER[0].color, anyKey(g, 2), ''); drawMsg(g, 350);
  }
};

/* ---------- 12 · sort: send each item LEFT or RIGHT before time runs out ---------- */
MG.sort = {
  init(g) { g.ok = 0; g.err = 0; g.k = 0; this.item(g); },
  item(g) { g.it = { type: rnd() < .5 ? 0 : 1, owner: g.k % g.n, t0: g.pt || 0 }; g.k++; },
  step(g) { if (g.pt - g.it.t0 > P(g).window) { g.err++; flash(g, 'TOO SLOW', COL.red); SND.play('error'); this.after(g); } },
  after(g) { if (g.ok >= P(g).need) return finish(g, 'win'); if (g.err >= 3) return finish(g, 'lose'); this.item(g); },
  key(g, p, k) { if (k === 1 || p !== g.it.owner) return; const right = (k === 0 ? 0 : 1) === g.it.type;
    if (right) { g.ok++; SND.play('note', g.ok % 4); } else { g.err++; flash(g, 'WRONG SIDE', COL.red); SND.play('error'); } this.after(g); },
  help(g) { return [`${P(g).left} → LEFT key · ${P(g).right} → RIGHT key`, g.n > 1 ? 'Only the player whose color shows answers' : `${P(g).need} right · 3 mistakes and you fail`]; },
  keys() { return [[0, '◀ LEFT'], [2, 'RIGHT ▶']]; },
  bot(g) { releaseTaps(g); if (g.pt - g.it.t0 > .35 && g.botK !== g.k) { g.botK = g.k; tap(g, g.it.owner, g.it.type ? 2 : 0); } },
  draw(g) {
    const pp = P(g), it = g.it, c = PLAYER[it.owner].color;
    panel(470, 420, 300, 260, COL.green, 'rgba(4,30,20,.8)'); T(pp.left, 620, 460, 20, COL.green, 'center', 4); T('◀', 620, 560, 60, COL.green, 'center', 0);
    panel(1150, 420, 300, 260, COL.red, 'rgba(30,4,10,.8)'); T(pp.right, 1300, 460, 20, COL.red, 'center', 4); T('▶', 1300, 560, 60, COL.red, 'center', 0);
    X.beginPath(); X.arc(960, 550, 80, 0, 7); X.fillStyle = 'rgba(4,18,43,.95)'; X.fill(); X.strokeStyle = c; X.lineWidth = 5; X.stroke();
    if (it.type === 0) { X.fillStyle = COL.sky; X.beginPath(); X.moveTo(960, 495); X.lineTo(995, 550); X.lineTo(960, 605); X.lineTo(925, 550); X.closePath(); X.fill(); }
    else { X.fillStyle = '#8a8f99'; X.beginPath(); X.ellipse(960, 555, 50, 36, .3, 0, 7); X.fill(); for (let s = 0; s < 4; s++) { X.beginPath(); X.arc(935 + s * 16, 540 + (s % 2) * 20, 7, 0, 7); X.fillStyle = '#5b2a1a'; X.fill(); } }
    T(it.type === 0 ? pp.left : pp.right, 960, 655, 18, COL.ice, 'center', 3);
    bar(860, 680, 200, 10, 1 - (g.pt - it.t0) / pp.window, COL.amber);
    if (g.n > 1) T(`${nm(it.owner)} ANSWERS`, 960, 445, 18, c, 'center', 4);
    keyCap(860, 770, 58, lbl(it.owner, 0), c, g.hold[it.owner][0], 'LEFT'); keyCap(1060, 770, 58, lbl(it.owner, 2), c, g.hold[it.owner][2], 'RIGHT');
    T(`RIGHT ${g.ok} / ${pp.need}`, 470, 720, 18, COL.ice, 'left', 4); T(`MISTAKES ${g.err} / 3`, 1450, 720, 18, g.err ? COL.red : COL.sky, 'right', 4); drawMsg(g, 380);
  }
};
