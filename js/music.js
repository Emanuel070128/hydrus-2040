/* =====================================================
   HYDRUS 2040 — MUSIC (made with code, no audio files)
   One original theme for each part of the game:
     title                          → 'chant'    deep male choir, slow, suspense
     intro, destinations, briefing  → 'dawn'     soft choir pads and glass bells
     hangar                         → 'hangar'   steady synth pulse while you prepare
     launch, trajectory             → 'voyage'   string ostinato, drums and choir
     report                         → 'triumph'  bright choir for the mission result
     rover                          → silence here (the mission map and the
                                      minigames play their own music)
   Browsers only allow sound after a click or a key, so the title screen
   shows a short "click to begin" gate the first time.
   ===================================================== */
const MUSIC = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  const BY_SCREEN = { title: 'chant', intro: 'dawn', destinations: 'dawn', briefing: 'dawn', hangar: 'hangar',
    launch: 'voyage', trajectory: 'voyage', map: 'voyage', anim: 'voyage', report: 'triumph', rover: 'off', level: 'off' };
  let ac = null, out = null, rev = null, noiseBuf = null, cur = null, want = 'chant';
  let muted = false;
  try { muted = localStorage.getItem('hydrus-music') === 'off'; } catch (e) { /* storage blocked: music on */ }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);

  function init() {
    if (ac) return true;
    if (!AC) return false;
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = .02; comp.release.value = .4;
    out = ac.createGain(); out.gain.value = .5; out.connect(comp); comp.connect(ac.destination);
    rev = ac.createConvolver(); rev.buffer = impulse(5, 2.4); rev.connect(out);          // big hall
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    document.addEventListener('visibilitychange', () => { if (!ac) return; if (document.hidden) ac.suspend(); else if (!muted) ac.resume(); });
    return true;
  }
  function impulse(sec, decay) {
    const len = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, len, ac.sampleRate), pre = ac.sampleRate * .03;
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay) * Math.min(1, i / pre); }
    return b;
  }

  /* ---------- a bus per theme: fades in and out as a whole ---------- */
  function makeBus(wet) {
    const mk = (v) => { const g = ac.createGain(); g.gain.value = v; return g; };
    const dry = mk(0), deep = mk(0), send = mk(wet);
    dry.connect(out); dry.connect(send); send.connect(rev); deep.connect(rev);
    return { dry, deep, send };
  }
  function fade(bus, v, sec) {
    const t = ac.currentTime;
    [bus.dry, bus.deep].forEach((g) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + sec); });
  }

  /* ---------- instruments ---------- */
  // Choir voice: detuned sawtooth "singers" through vowel formant filters
  const VOWELS = {
    a: [[730, 1, 7], [1090, .55, 9], [2440, .2, 12]],
    o: [[500, 1, 6], [850, .5, 8], [2450, .12, 12]],
    u: [[340, 1, 5], [780, .35, 8], [2350, .08, 12]],
    e: [[460, 1, 6], [1700, .35, 10], [2600, .15, 12]]
  };
  function choir(bus, midi, at, dur, o = {}) {
    const { vol = .1, vow = 'o', n = 3, cents = 10, att = .9, rel = 1.6, deep = false } = o;
    const t = ac.currentTime + at, end = t + dur + rel, f = mtof(midi);
    const env = ac.createGain(), sum = ac.createGain(); sum.gain.value = 1 / n;
    env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(vol, t + att);
    env.gain.setValueAtTime(vol, t + Math.max(att, dur)); env.gain.linearRampToValueAtTime(.0001, end);
    VOWELS[vow].forEach(([ff, a, q]) => {
      const bp = ac.createBiquadFilter(), ga = ac.createGain();
      bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q; ga.gain.value = a * 4.5;
      sum.connect(bp); bp.connect(ga); ga.connect(env);
    });
    const lp = ac.createBiquadFilter(), lg = ac.createGain();               // chest: keeps the low notes heavy
    lp.type = 'lowpass'; lp.frequency.value = f * 2.5; lg.gain.value = .35; sum.connect(lp); lp.connect(lg); lg.connect(env);
    for (let i = 0; i < n; i++) {
      const os = ac.createOscillator(), lfo = ac.createOscillator(), ld = ac.createGain(), st = t + rnd(0, .08);
      os.type = 'sawtooth'; os.frequency.value = f; os.detune.value = (i - (n - 1) / 2) * cents + rnd(-3, 3);
      lfo.frequency.value = rnd(4.2, 5.6); ld.gain.value = rnd(5, 9); lfo.connect(ld); ld.connect(os.detune);   // vibrato
      os.connect(sum); os.start(st); lfo.start(st); os.stop(end + .05); lfo.stop(end + .05);
    }
    env.connect(deep ? bus.deep : bus.dry);
  }
  function tone(bus, f, at, dur, o = {}) {
    const { type = 'sine', vol = .1, att = .005, lp = 0, q = 1, lpFrom = 0, f2 = 0, sus = false, rel = .3, deep = false } = o;
    const t = ac.currentTime + at, os = ac.createOscillator(), g = ac.createGain();
    os.type = type; os.frequency.setValueAtTime(f, t); if (f2) os.frequency.exponentialRampToValueAtTime(f2, t + dur);
    let node = os;
    if (lp) {
      const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = q;
      fl.frequency.setValueAtTime(lpFrom || lp, t); if (lpFrom) fl.frequency.exponentialRampToValueAtTime(lp, t + dur * .8);
      os.connect(fl); node = fl;
    }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att);
    if (sus) { g.gain.setValueAtTime(vol, t + Math.max(att, dur)); g.gain.linearRampToValueAtTime(.0001, t + dur + rel); }
    else g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    node.connect(g); g.connect(deep ? bus.deep : bus.dry);
    os.start(t); os.stop(t + dur + (sus ? rel : 0) + .05);
  }
  function noise(bus, at, dur, { vol = .1, lp = 800, hp = 0, deep = false } = {}) {
    const t = ac.currentTime + at, s = ac.createBufferSource(), g = ac.createGain(), fl = ac.createBiquadFilter();
    s.buffer = noiseBuf; fl.type = hp ? 'highpass' : 'lowpass'; fl.frequency.value = hp || lp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(deep ? bus.deep : bus.dry); s.start(t, rnd(0, 1)); s.stop(t + dur + .05);
  }
  const boom = (bus, at, v = .5) => {          // deep drum hit with a long hall tail
    tone(bus, 72, at, 1.6, { vol: v, f2: 36 });
    tone(bus, 110, at, .5, { vol: v * .35, f2: 55, type: 'triangle' });
    noise(bus, at, .7, { vol: v * .45, lp: 260 });
    noise(bus, at, 1.4, { vol: v * .3, lp: 500, deep: true });
  };
  const bell = (bus, m, at, v = .04) => {      // glass bell: fundamental + two bright partials
    const f = mtof(m);
    tone(bus, f, at, 3, { vol: v }); tone(bus, f * 2.76, at, 1.4, { vol: v * .3 }); tone(bus, f * 5.4, at, .6, { vol: v * .1 });
  };
  const drone = (bus, m, at, dur, v = .1) => {
    tone(bus, mtof(m), at, dur, { type: 'triangle', vol: v, att: 3, sus: true, rel: 3, lp: 260 });
    tone(bus, mtof(m) * 1.004, at, dur, { type: 'sawtooth', vol: v * .25, att: 4, sus: true, rel: 3, lp: 180 });
  };

  /* ---------- themes: play(bus, beat in loop, loop number, seconds from now) ---------- */
  const THEMES = {
    // TITLE · deep chant in D minor, 60 bpm. 8 beats of breath, then the melody.
    chant: {
      beat: 1.0, len: 32, wet: .7, fadeIn: 3,
      ch: [[50, 57, 62], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61], [50, 57, 62, 65], [41, 48, 53, 57], [48, 55, 60, 64], [45, 52, 57, 61]],
      mel: [[8, 62, 2], [10, 58, 1], [11, 57, 1], [12, 61, 2], [14, 64, 2], [16, 62, 3], [19, 60, 1], [20, 57, 2], [22, 60, 1], [23, 65, 1], [24, 64, 3], [27, 62, 1], [28, 61, 4]],
      play(bus, b, cyc, at) {
        const B = this.beat;
        if (b === 0) drone(bus, 38, at, 31 * B, .11);
        if (b % 4 === 0) this.ch[b / 4].forEach((m) => choir(bus, m, at, 4.3 * B, { vow: 'u', vol: .045, att: 1.6, rel: 2.2 }));
        if (b === 0) boom(bus, at, cyc === 0 ? .6 : .45);
        if (b === 16) boom(bus, at, .35);
        if (b === 28 || b === 30) boom(bus, at, b === 28 ? .25 : .4);
        this.mel.forEach(([s, m, d]) => {
          if (s !== b) return;
          choir(bus, m, at, d * B, { vow: 'a', vol: .11, n: 4, att: .35, rel: 1.3 });       // tenors
          choir(bus, m - 12, at, d * B, { vow: 'o', vol: .07, n: 3, att: .4, rel: 1.3 });   // basses an octave below
          if (cyc % 2 === 1) choir(bus, m + 12, at, d * B, { vow: 'u', vol: .025, n: 2, att: .6, rel: 1.5, deep: true });
        });
        if (cyc >= 1 && b % 4 === 2) bell(bus, this.ch[Math.floor(b / 4)].slice(-1)[0] + 12, at, .018);
      }
    },
    // INTRO / DESTINATIONS / BRIEFING · open, hopeful mystery in D, 80 bpm
    dawn: {
      beat: .75, len: 32, wet: .6, fadeIn: 2,
      ch: [[50, 57, 62, 64], [47, 54, 57, 62], [43, 50, 54, 59], [45, 52, 57, 62]],
      arp: [0, 2, 1, 3, 2, 1, 3, -1],
      play(bus, b, cyc, at) {
        const B = this.beat, c = this.ch[Math.floor(b / 8)];
        if (b % 8 === 0) {
          c.forEach((m) => choir(bus, m, at, 8.3 * B, { vow: 'o', vol: .035, att: 2, rel: 2.5 }));
          tone(bus, mtof(c[0] - 12), at, 8 * B, { vol: .07, att: 1.5, sus: true, rel: 2 });
        }
        if (b === 28) choir(bus, 61, at, 4 * B, { vow: 'o', vol: .03, att: 1, rel: 2 });      // A sus4 → A
        const k = this.arp[b % 8];
        if (k >= 0) bell(bus, c[k] + 12, at, .03);
        if (cyc % 2 === 1 && b % 4 === 0) bell(bus, c[(b / 4) % c.length] + 24, at + B / 2, .012);
      }
    },
    // HANGAR · focused pulse in A minor, 100 bpm (steps are eighth notes)
    hangar: {
      beat: .3, len: 64, wet: .35, fadeIn: 1.5,
      ch: [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]],
      play(bus, e, cyc, at) {
        const c = this.ch[Math.floor(e / 16)], root = c[0] - 24;
        tone(bus, mtof(root + (e % 4 === 3 ? 12 : 0)), at, .26, { type: 'sawtooth', vol: .08, lp: 420, lpFrom: 1500, q: 3 });
        if (e % 4 === 0) tone(bus, 120, at, .3, { vol: .2, f2: 45 });
        if (e % 2 === 1) noise(bus, at, .04, { vol: .025, hp: 8000 });
        if (e % 8 === 4) noise(bus, at, .14, { vol: .05, lp: 2500 });
        if (e % 16 === 0) c.forEach((m) => choir(bus, m, at, 4.6, { vow: 'e', vol: .022, n: 2, att: 1, rel: 1.5 }));
        if (cyc >= 1 || e >= 32) tone(bus, mtof(c[e % 3] + 12), at, .25, { type: 'triangle', vol: .028 });
        if (cyc % 2 === 1 && e % 16 === 8) bell(bus, c[2] + 12, at, .02);
      }
    },
    // LAUNCH / TRAJECTORY · building ostinato in D minor, 120 bpm (steps are 16th notes)
    voyage: {
      beat: .125, len: 128, wet: .45, fadeIn: 1.2,
      ch: [[50, 57, 62], [46, 53, 58], [53, 57, 60], [48, 55, 60]],
      pat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0],
      mel: [[0, 62, 12], [12, 65, 4], [16, 64, 8], [24, 62, 8], [32, 58, 16], [48, 57, 16], [64, 60, 12], [76, 62, 4], [80, 65, 16], [96, 64, 12], [108, 67, 4], [112, 69, 16]],
      play(bus, s, cyc, at) {
        const B = this.beat, c = this.ch[Math.floor(s / 32)], k = s % 16;
        if (this.pat[k]) tone(bus, mtof(c[0] - 12 + (k >= 8 && k % 3 === 1 ? 12 : 0)), at, .18, { type: 'sawtooth', vol: .05, lp: 900, q: 2 });
        if (s % 32 === 0) c.forEach((m) => choir(bus, m, at, 32 * B + .2, { vow: 'a', vol: .035, att: .8, rel: 1.6 }));
        if (s % 32 === 0) tone(bus, mtof(c[0] - 24), at, 32 * B, { type: 'triangle', vol: .09, sus: true, rel: .6, lp: 200 });
        if (cyc >= 1 || s >= 64) {
          if (k === 0) boom(bus, at, .28);
          if (k === 10 || k === 12) tone(bus, k === 10 ? 150 : 120, at, .3, { vol: .15, f2: 70 });
          if (k % 2 === 1) noise(bus, at, .03, { vol: .018, hp: 7000 });
        }
        if (cyc >= 1) this.mel.forEach(([st, m, d]) => { if (st === s) choir(bus, m, at, d * B, { vow: 'a', vol: .075, n: 4, att: .15, rel: .9 }); });
      }
    },
    // REPORT · bright choir in D major, 86 bpm
    triumph: {
      beat: .7, len: 32, wet: .6, fadeIn: 1,
      ch: [[50, 57, 62, 66], [50, 55, 59, 62], [47, 54, 59, 62], [45, 52, 57, 61], [43, 50, 55, 59], [45, 52, 57, 61], [50, 57, 62, 66], [50, 57, 62, 66]],
      mel: [[0, 66, 2], [2, 69, 2], [4, 71, 3], [7, 69, 1], [8, 66, 2], [10, 64, 2], [12, 64, 4], [16, 67, 2], [18, 66, 2], [20, 64, 3], [23, 61, 1], [24, 62, 6]],
      play(bus, b, cyc, at) {
        const B = this.beat, c = this.ch[Math.floor(b / 4)];
        if (b % 4 === 0) {
          c.forEach((m) => choir(bus, m, at, 4.2 * B, { vow: 'a', vol: .04, att: .5, rel: 1.5 }));
          tone(bus, mtof(c[0] - 12), at, 4 * B, { type: 'triangle', vol: .08, sus: true, rel: 1, lp: 300 });
        }
        if (b === 0 || b === 16) boom(bus, at, .4);
        this.mel.forEach(([s, m, d]) => { if (s === b) choir(bus, m, at, d * B, { vow: 'a', vol: .085, n: 4, att: .2, rel: 1.2 }); });
        if (b % 2 === 1) bell(bus, c[(b >> 1) % c.length] + 24, at, .014);
      }
    }
  };

  /* ---------- player ---------- */
  function stopCurrent() {
    if (!cur) return;
    const old = cur; cur = null; clearInterval(old.timer); fade(old.bus, 0, 1.4);
    setTimeout(() => { old.bus.dry.disconnect(); old.bus.deep.disconnect(); old.bus.send.disconnect(); }, 9000);
  }
  function startTheme(name) {
    stopCurrent();
    const th = THEMES[name]; if (!th) return;
    const bus = makeBus(th.wet); fade(bus, 1, th.fadeIn);
    cur = { name, th, bus, step: 0, nextT: ac.currentTime + .15, timer: 0 };
    const me = cur;
    const tick = () => {
      if (cur !== me) return;
      while (me.nextT < ac.currentTime + .6) {
        me.th.play(me.bus, me.step % me.th.len, Math.floor(me.step / me.th.len), Math.max(0, me.nextT - ac.currentTime));
        me.nextT += me.th.beat; me.step++;
      }
    };
    tick(); me.timer = setInterval(tick, 100);
  }
  function apply() {
    if (muted || want === 'off' || !ac || ac.state !== 'running') { if (ac && (muted || want === 'off')) stopCurrent(); return; }
    if (!cur || cur.name !== want) startTheme(want);
  }
  function unlock() {
    if (muted || !init()) return;
    if (ac.state === 'running') return apply();
    ac.resume().then(apply);
  }
  ['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, unlock, true));

  return {
    get muted() { return muted; },
    screen(id) { want = BY_SCREEN[id] || 'off'; if (ac) apply(); },
    toggle() {
      muted = !muted;
      try { localStorage.setItem('hydrus-music', muted ? 'off' : 'on'); } catch (e) { /* not saved */ }
      if (muted) stopCurrent(); else unlock();
      return muted;
    },
    unlock
  };
})();

/* ---------- hook into the screen switcher ---------- */
{
  const _showMusic = showScreen;
  showScreen = function (id) { _showMusic(id); MUSIC.screen(id); document.body.classList.toggle('in-rover', id === 'rover'); };
}

/* ---------- ♪ button (music on/off) and the first "click to begin" gate ---------- */
{
  const btn = document.createElement('button');
  btn.id = 'music-btn'; btn.className = 'music-btn';
  const paint = () => { btn.classList.toggle('off', MUSIC.muted); btn.title = MUSIC.muted ? 'Music off · click to turn on' : 'Music on · click to turn off'; btn.setAttribute('aria-label', btn.title); };
  btn.innerHTML = '<span>♪</span>';
  btn.addEventListener('click', (e) => { e.stopPropagation(); MUSIC.toggle(); paint(); btn.blur(); });
  document.body.appendChild(btn); paint();

  if (!MUSIC.muted) {
    const gate = document.createElement('div');
    gate.id = 'music-gate'; gate.className = 'music-gate';
    gate.innerHTML = '<p>CLICK OR PRESS ANY KEY TO BEGIN</p><small>with sound</small>';
    $('#screen-title').appendChild(gate);
    const open = (e) => {
      if (e && e.target === btn) return;
      if (e) { e.preventDefault(); e.stopPropagation(); }
      MUSIC.unlock(); gate.classList.add('gone');
      removeEventListener('keydown', open, true); gate.removeEventListener('pointerdown', open, true);
      setTimeout(() => gate.remove(), 900);
    };
    addEventListener('keydown', open, true); gate.addEventListener('pointerdown', open, true);
  }
}
MUSIC.screen('title');
