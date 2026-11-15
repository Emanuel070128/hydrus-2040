/* =====================================================
   HYDRUS 2040 · SOUND (made with code, no audio files)
   SND.play('jump')    SND.music('drive' | 'calm' | 'emer' | 'drill' | 'win' | 'off')
   ===================================================== */
const SND = (() => {
  let ac = null, master = null, mus = null, nb = null;
  const api = { muted: !CONFIG.sound, noMusic: /[?&]music=off\b/.test(location.search) };   // ♪ off in the main game → no music here either
  function init() {
    if (ac) return true;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ac = new AC(); master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
    mus = ac.createGain(); mus.gain.value = .45; mus.connect(master);
    nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  ['pointerdown', 'keydown'].forEach((e) => addEventListener(e, () => { if (init() && ac.state === 'suspended') ac.resume(); }, true));
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function tone(f, d, { type = 'sine', vol = .2, at = 0, f2 = null, dest = null, lp = 4000, att = .005 } = {}) {
    if (!ac || api.muted) return;
    const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain(), fl = ac.createBiquadFilter();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    fl.type = 'lowpass'; fl.frequency.value = lp;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    o.connect(fl); fl.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + .05);
  }
  function noise(d, { vol = .3, at = 0, lp = 1200, hp = 0, dest = null } = {}) {
    if (!ac || api.muted) return;
    const t = ac.currentTime + at, s = ac.createBufferSource(), g = ac.createGain(), fl = ac.createBiquadFilter();
    s.buffer = nb; fl.type = hp ? 'highpass' : 'lowpass'; fl.frequency.value = hp || lp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    s.connect(fl); fl.connect(g); g.connect(dest || master); s.start(t); s.stop(t + d + .05);
  }
  const kick = (at, dest, v = .5) => tone(160, .25, { vol: v, at, f2: 42, dest });
  const hat = (at, dest) => noise(.05, { vol: .08, at, hp: 7000, dest });
  const chime = (notes, v = .14, gap = .07) => notes.forEach((n, i) => tone(mtof(n), .8, { vol: v, at: i * gap }));
  const FX = {
    click: () => tone(900, .08, { vol: .12, f2: 1300 }),
    beep: () => tone(660, .2, { type: 'triangle', vol: .15 }),
    go: () => { tone(1320, .5, { type: 'triangle', vol: .15 }); tone(990, .5, { type: 'triangle', vol: .1 }); },
    jump: () => tone(300, .3, { vol: .25, f2: 900 }),
    land: () => tone(90, .12, { vol: .22 }),
    laser: () => tone(2400, .25, { type: 'sawtooth', vol: .09, f2: 300, lp: 3000 }),
    boom: () => { noise(.6, { vol: .6, lp: 700 }); kick(0, null, .5); },
    clang: () => [1230, 1870, 2650].forEach((f) => tone(f, .35, { vol: .07 })),
    grab: () => { tone(1568, .4, { vol: .18 }); tone(2093, .4, { vol: .18, at: .07 }); tone(1500, .4, { vol: .04, at: .2, f2: 3000 }); },
    combo: (n) => tone(880 * Math.pow(2, Math.min(n || 0, 14) / 12), .25, { vol: .1 }),
    hit: () => { noise(.5, { vol: .6, lp: 900 }); tone(220, .4, { type: 'sawtooth', vol: .2, f2: 60, lp: 1500 }); },
    nopower: () => { tone(220, .18, { type: 'square', vol: .08 }); tone(160, .25, { type: 'square', vol: .08, at: .12 }); },
    repair: () => chime([72, 76, 79], .16, .08),
    shieldon: () => tone(200, .3, { vol: .14, f2: 700 }),
    shieldoff: () => tone(600, .2, { vol: .08, f2: 200 }),
    tap: (p) => tone([880, 988, 1175, 1319][p || 0], .06, { type: 'triangle', vol: .08 }),
    vote: () => tone(600, .12, { vol: .16, f2: 1200 }),
    alarm: () => { for (let i = 0; i < 3; i++) { tone(700, .22, { vol: .1, at: i * .5, f2: 1100, type: 'triangle' }); tone(1100, .22, { vol: .1, at: i * .5 + .25, f2: 700, type: 'triangle' }); } },
    warn: () => [880, 660, 880].forEach((f, i) => tone(f, .18, { type: 'triangle', vol: .08, at: i * .2 })),
    check: () => { noise(.5, { vol: .12, lp: 2500 }); chime([69, 73, 76, 81], .15, .09); tone(200, .6, { vol: .08, f2: 800 }); },
    win: () => chime([76, 81, 84, 88], .13, .06),
    lose: () => [67, 63, 60].forEach((m, i) => tone(mtof(m), .4, { type: 'triangle', vol: .14, at: i * .18 })),
    lock: () => chime([72, 79, 84], .15, .07),
    error: () => { tone(150, .3, { type: 'square', vol: .07 }); tone(157, .3, { type: 'square', vol: .06 }); },
    brake: () => tone(500, .7, { type: 'sawtooth', vol: .06, f2: 80, lp: 1500 }),
    storm: () => noise(2.5, { vol: .2, lp: 400 }),
    found: () => { noise(1.6, { vol: .3, lp: 3000 }); kick(0, null, .7); chime([57, 64, 69, 72, 76, 81, 88], .13, .06); },
    down: () => { noise(.8, { vol: .4, lp: 600 }); [64, 60, 57, 52].forEach((m, i) => tone(mtof(m), .5, { type: 'triangle', vol: .15, at: i * .25 })); },
    note: (k) => tone(mtof([81, 84, 88, 91][k || 0]), .18, { type: 'triangle', vol: .12 })
  };
  api.play = (type, x) => { if (api.muted || !init() || !FX[type]) return; FX[type](x); };

  /* music: cold synth, 120 bpm */
  const CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], WIN = [[48, 52, 55], [53, 57, 60], [55, 59, 62], [48, 52, 55]];
  const S16 = .125; let mode = 'off', step = 0, nextT = 0, timer = 0;
  function schedule() {
    if (!ac) return;
    while (nextT < ac.currentTime + .2) {
      const at = nextT - ac.currentTime, k = step % 16, bar = Math.floor(step / 16) % 4, ch = (mode === 'win' ? WIN : CH)[bar], d = mus;
      if (k === 0) ch.forEach((n) => tone(mtof(n), 2.2, { vol: .025, at, dest: d, att: .5, lp: 1800 }));
      if (mode === 'map') {          // mission map: slow pads, a sparse arpeggio and a soft pulse
        if (k === 0) tone(mtof(ch[0] - 12), 2.1, { vol: .06, at, dest: d, att: .6, lp: 400 });
        if (k % 4 === 0) tone(mtof(ch[(k >> 2) % 3] + 12), .9, { type: 'triangle', vol: .03, at, dest: d });
        if (k === 10) tone(mtof(ch[2] + 24), 1.2, { vol: .014, at, dest: d });
        nextT += S16 * 1.5; step++; continue;
      }
      const arpOn = mode !== 'calm' || k % 2 === 0;
      if (arpOn) tone(mtof(ch[k % 3] + 12 + ((k >> 2) % 2 ? 12 : 0)), .22, { type: 'triangle', vol: mode === 'calm' ? .03 : .045, at, dest: d });
      if (mode === 'drive' || mode === 'emer' || mode === 'drill' || mode === 'win') {
        if (k % 4 === 0) kick(at, d, mode === 'drill' ? .45 : .32);
        if (k % 4 === 2) hat(at, d);
        if (k % 2 === 0) tone(mtof(ch[0] - 24 + (k % 4 === 2 ? 12 : 0)), .2, { vol: .12, at, dest: d, lp: 600 });
      }
      if (mode === 'emer' && k % 2 === 1) tone(mtof(ch[0] - 12) * 1.01, .1, { type: 'sawtooth', vol: .035, at, dest: d, lp: 900 });
      if (mode === 'drill' && k % 8 === 4) noise(.12, { vol: .1, at, hp: 2000, dest: d });
      nextT += S16; step++;
    }
  }
  api.music = (m) => {
    if (m === mode) return; mode = m; if (!init()) return;
    step = 0; nextT = ac.currentTime + .05; clearInterval(timer);
    if (m !== 'off' && !api.muted && !api.noMusic) timer = setInterval(schedule, 30);
  };
  return api;
})();
