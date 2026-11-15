/* =====================================================
   HYDRUS 2040 · MARS LEVEL — DRAWING (futuristic HUD style)
   ===================================================== */
const W = 1920, H = 1080, GROUND = 860, RX = 520;
const COL = { ice: '#e0f2fe', cyan: '#38bdf8', navy: 'rgba(4,18,43,.76)', amber: '#fbbf24', red: '#f43f5e', green: '#34d399', violet: '#a78bfa', sky: '#7dd3fc' };
const cv = document.getElementById('game'), X = cv.getContext('2d');
window.FONTS_READY = Promise.all([document.fonts.load('400 30px Orbitron'), document.fonts.load('700 30px Exo2'), document.fonts.load('400 30px Exo2')]);
const faceImg = new Image(); faceImg.src = '../assets/images/control-hydrus-face.png';
let bgSrc = null;
const skyImg = MARS.sky ? Object.assign(new Image(), { src: MARS.sky.src }) : null;   // Earth over the Moon, Jupiter over Europa
(function loadBackground() {
  if (CONFIG.background.video) {
    const v = document.createElement('video'); v.src = CONFIG.background.video; v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.addEventListener('loadeddata', () => { bgSrc = v; v.play().catch(() => {}); });
    v.addEventListener('error', () => loadImage());
  } else loadImage();
  function loadImage() { const im = new Image(); im.onload = () => { bgSrc = im; }; im.src = CONFIG.background.image; }
})();

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (a, b, t) => clamp((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const backOut = (x) => { const k = 1.7; x = clamp(x); return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };

function T(s, x, y, size, col = COL.ice, align = 'left', sp = 3, font = 'O', glow = 0) {
  X.font = font === 'O' ? `400 ${size}px Orbitron` : `700 ${size}px Exo2`; X.letterSpacing = sp + 'px';
  X.textAlign = align; X.textBaseline = 'middle';
  if (glow) { X.shadowColor = col; X.shadowBlur = glow; }
  X.fillStyle = col; X.fillText(s, x, y); X.shadowBlur = 0; X.letterSpacing = '0px';
}
function textW(s, size, font = 'O', sp = 3) { X.font = font === 'O' ? `400 ${size}px Orbitron` : `700 ${size}px Exo2`; X.letterSpacing = sp + 'px'; const w = X.measureText(s).width; X.letterSpacing = '0px'; return w; }
function notch(x, y, w, h, k = 16) { X.beginPath(); X.moveTo(x + k, y); X.lineTo(x + w, y); X.lineTo(x + w, y + h - k); X.lineTo(x + w - k, y + h); X.lineTo(x, y + h); X.lineTo(x, y + k); X.closePath(); }
function panel(x, y, w, h, col = COL.cyan, fill = COL.navy) {
  X.save(); notch(x, y, w, h); X.fillStyle = fill; X.fill();
  X.shadowColor = col; X.shadowBlur = 16; X.lineWidth = 2; X.strokeStyle = col; X.stroke(); X.shadowBlur = 0;
  X.lineWidth = 4; X.beginPath(); X.moveTo(x + w - 40, y); X.lineTo(x + w, y); X.lineTo(x + w, y + 22); X.moveTo(x, y + h - 22); X.lineTo(x, y + h); X.lineTo(x + 40, y + h); X.stroke();
  X.restore();
}
function bar(x, y, w, h, f, col, segs = 0) {
  X.fillStyle = 'rgba(56,189,248,.12)'; X.fillRect(x, y, w, h);
  if (segs) { const sw = w / segs; for (let i = 0; i < segs; i++) { X.fillStyle = i < Math.round(f * segs) ? col : 'rgba(56,189,248,.12)'; X.fillRect(x + i * sw + 2, y, sw - 4, h); } return; }
  const g = X.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, col); g.addColorStop(1, COL.ice); X.fillStyle = g; X.fillRect(x, y, w * clamp(f), h);
  X.fillStyle = 'rgba(224,242,254,.9)'; X.fillRect(x + w * clamp(f) - 2, y - 3, 3, h + 6);
}
// big, clear key cap: [ W ] with the player color and an action word under it
function keyCap(x, y, size, label, color, on = false, word = '') {
  X.save(); notch(x - size / 2, y - size / 2, size, size, size * .2);
  X.fillStyle = on ? color : 'rgba(4,18,43,.92)'; X.fill(); X.lineWidth = 3; X.strokeStyle = color; X.shadowColor = color; X.shadowBlur = on ? 30 : 14; X.stroke(); X.restore();
  T(label, x, y + 2, size * .52, on ? '#04122b' : color, 'center', 0);
  if (word) T(word, x, y + size / 2 + 18, Math.max(12, size * .2), color, 'center', 3);
}

/* ---------- planet scene ---------- */
function drawWorld(S, t, storm, dark) {
  X.fillStyle = '#01030a'; X.fillRect(0, 0, W, H);
  if (bgSrc) { const iw = bgSrc.videoWidth || bgSrc.width, ih = bgSrc.videoHeight || bgSrc.height, sc = Math.max(W / iw, H / ih), w = iw * sc, h = ih * sc;
    X.drawImage(bgSrc, -(w - W) / 2, -(h - H) / 2, w, h); }   // static background: no zoom, no scroll
  X.fillStyle = 'rgba(2,8,24,.35)'; X.fillRect(0, 0, W, H);
  const pal = MARS.palette;   // each planet has its own colors (data.js / planets.js)
  if (skyImg && skyImg.complete && skyImg.naturalWidth) { const s = MARS.sky; X.save(); X.beginPath(); X.arc(s.x + s.size / 2, s.y + s.size / 2, s.size / 2, 0, 7); X.clip(); X.drawImage(skyImg, s.x, s.y, s.size, s.size); X.restore(); }
  [[560, .12, pal.hills[0], 70], [650, .22, pal.hills[1], 55], [740, .4, pal.hills[2], 40]].forEach(([base, par, col, amp], j) => {
    X.beginPath(); X.moveTo(0, H); for (let x = 0; x <= W; x += 20) { const u = x + S * par; X.lineTo(x, base + amp * Math.sin(u / 260 + j) + amp * .5 * Math.sin(u / 97 + j * 2)); }
    X.lineTo(W, H); X.fillStyle = col; X.fill(); X.strokeStyle = 'rgba(56,189,248,.18)'; X.lineWidth = 2; X.stroke(); });
  const g = X.createLinearGradient(0, GROUND - 20, 0, H); g.addColorStop(0, pal.ground[0]); g.addColorStop(1, pal.ground[1]); X.fillStyle = g; X.fillRect(0, GROUND - 6, W, H);
  X.strokeStyle = 'rgba(56,189,248,.16)'; X.lineWidth = 2;
  for (let i = -2; i < 20; i++) { const x = i * 120 - (S % 120); X.beginPath(); X.moveTo(x, GROUND); X.lineTo(x - 260, H); X.stroke(); }
  for (let j = 0; j < 4; j++) { const y = GROUND + 20 + j * j * 22; X.beginPath(); X.moveTo(0, y); X.lineTo(W, y); X.stroke(); }
  if (storm > 0) { X.fillStyle = `rgba(${pal.storm.join(',')},${.42 * storm})`; X.fillRect(0, 0, W, H); if (pal.streak) { X.strokeStyle = `rgba(${pal.streak.join(',')},${.38 * storm})`; X.lineWidth = 3; }
    if (pal.streak) for (let i = 0; i < 70; i++) { const x = ((i * 157 - t * 1500) % 2100 + 2100) % 2100 - 100, y = (i * 89) % 1000; X.beginPath(); X.moveTo(x, y); X.lineTo(x + 90, y - 6); X.stroke(); } }
  if (dark > 0) { X.fillStyle = `rgba(2,6,16,${.35 * dark})`; X.fillRect(0, 0, W, H); }
}
function drawRover(t, y, o = {}) {
  const by = GROUND - y - 40 + (y > 0 || o.still ? 0 : Math.sin(t * 30) * 2);
  X.save(); if (o.blink) X.globalAlpha = .45;
  X.shadowColor = COL.cyan; X.shadowBlur = 20;
  X.beginPath(); X.roundRect(RX - 175, by - 120, 330, 90, 22); X.fillStyle = '#e8eef6'; X.fill(); X.shadowBlur = 0; X.lineWidth = 4; X.strokeStyle = '#0a1224'; X.stroke();
  X.fillStyle = COL.cyan; X.fillRect(RX - 170, by - 72, 320, 10); X.fillStyle = 'rgba(56,189,248,.35)'; X.fillRect(RX - 170, by - 60, 320, 4);
  for (let i = 0; i < o.n; i++) { const hx = RX - 120 + i * 62 + (4 - o.n) * 31, hy = by - 142 - (o.press && o.press[i] ? 10 : 0), c = PLAYER[i].color;
    X.beginPath(); X.arc(hx, hy, 26, 0, 7); X.fillStyle = '#fff'; X.fill(); X.lineWidth = 5; X.strokeStyle = c; X.stroke();
    X.beginPath(); X.ellipse(hx + 5, hy, 15, 12, 0, 0, 7); X.fillStyle = '#0a1a33'; X.fill(); X.beginPath(); X.arc(hx + 9, hy - 4, 4, 0, 7); X.fillStyle = COL.sky; X.fill(); }
  X.fillStyle = '#f59e0b'; X.beginPath(); X.roundRect(RX + 120, by - 110, 70, 20, 6); X.fill();
  X.strokeStyle = '#0a1224'; X.lineWidth = 4; X.beginPath(); X.moveTo(RX - 160, by - 120); X.lineTo(RX - 180, by - 200); X.stroke();
  X.beginPath(); X.arc(RX - 180, by - 205, 8, 0, 7); X.fillStyle = o.signal === false ? COL.red : COL.green; X.fill();
  const rot = (o.S || 0) / 32;
  [-130, -10, 110].forEach((dx, i) => { const wx = RX + dx, wy = GROUND - y - 32, br = o.broken === i;
    X.beginPath(); X.arc(wx, wy, 32, 0, 7); X.fillStyle = br ? '#5a1020' : '#141b2b'; X.fill(); X.lineWidth = 4; X.strokeStyle = br ? COL.red : COL.cyan; X.stroke();
    X.strokeStyle = '#8aa0bd'; for (let k = 0; k < 3; k++) { const a = rot + k * 2.094; X.beginPath(); X.moveTo(wx, wy); X.lineTo(wx + Math.cos(a) * 22, wy + Math.sin(a) * 22); X.stroke(); } });
  X.globalAlpha = 1;
  if (o.shield) { X.beginPath(); X.arc(RX - 10, by - 40, 250, Math.PI, 0); X.fillStyle = 'rgba(167,139,250,.16)'; X.fill(); X.lineWidth = 3; X.strokeStyle = COL.violet; X.shadowColor = COL.violet; X.shadowBlur = 20; X.stroke(); X.shadowBlur = 0;
    for (let i = 0; i < 12; i++) { const a = Math.PI + i * Math.PI / 11; X.beginPath(); X.arc(RX - 10 + Math.cos(a) * 250, by - 40 + Math.sin(a) * 250, 3, 0, 7); X.fillStyle = COL.ice; X.fill(); } }
  if (o.grab > 0) { const ga = o.grab; X.strokeStyle = PLAYER[o.grabP].color; X.lineWidth = 10; X.lineCap = 'round'; X.beginPath(); X.moveTo(RX + 40, by - 40); X.lineTo(RX + 40 + 30 * ga, by - 40 + 120 * ga); X.stroke(); }
  X.restore();
}
function drawRock(x, kind) {
  const pal = MARS.palette;
  if (kind === 'crater') { X.fillStyle = pal.crater; X.beginPath(); X.ellipse(x, GROUND + 6, 95, 26, 0, 0, 7); X.fill(); X.strokeStyle = 'rgba(56,189,248,.5)'; X.lineWidth = 2; X.stroke(); return; }
  const s = kind === 'boulder' ? 1.9 : 1;
  X.fillStyle = kind === 'boulder' ? pal.boulder : pal.rock; X.beginPath(); X.moveTo(x - 45 * s, GROUND); X.lineTo(x - 30 * s, GROUND - 50 * s); X.lineTo(x + 5 * s, GROUND - 66 * s); X.lineTo(x + 40 * s, GROUND - 38 * s); X.lineTo(x + 48 * s, GROUND); X.closePath(); X.fill();
  if (kind === 'boulder') { X.strokeStyle = COL.amber; X.lineWidth = 3; X.shadowColor = COL.amber; X.shadowBlur = 14; X.stroke(); X.shadowBlur = 0; }
}
function drawIce(x, t) {
  const gl = .6 + .4 * Math.sin(t * 9 + x * .01);
  [[-20, 14, 50], [0, 18, 70], [20, 13, 44]].forEach(([dx, w, h]) => { X.beginPath(); X.moveTo(x + dx - w / 2, GROUND); X.lineTo(x + dx, GROUND - h); X.lineTo(x + dx + w / 2, GROUND); X.fillStyle = `rgba(160,230,255,${.7 + .3 * gl})`; X.shadowColor = COL.cyan; X.shadowBlur = 18; X.fill(); X.shadowBlur = 0; });
}
// diamond tag over an obstacle: key letter + action
function keyTag(x, y, p, key, word, ready) {
  const c = PLAYER[p].color; X.save(); X.translate(x, y); X.rotate(Math.PI / 4);
  X.fillStyle = ready ? c : 'rgba(4,18,43,.92)'; X.strokeStyle = c; X.lineWidth = 3; X.shadowColor = c; X.shadowBlur = ready ? 28 : 10; X.fillRect(-30, -30, 60, 60); X.strokeRect(-30, -30, 60, 60); X.restore(); X.shadowBlur = 0;
  T(key, x, y + 2, 30, ready ? '#04122b' : c, 'center', 0);
  const w = textW(word, 14) + 20; X.fillStyle = 'rgba(4,18,43,.9)'; X.fillRect(x - w / 2, y - 76, w, 26); X.strokeStyle = c; X.lineWidth = 1.5; X.strokeRect(x - w / 2, y - 76, w, 26);
  T(word, x, y - 62, 14, c, 'center', 3);
}
function popText(p, t) {
  const k = t - p.t; if (k < 0 || k > 1.1) return;
  X.save(); X.globalAlpha = k < .15 ? k / .15 : 1 - ramp(.7, 1.1, k); const yy = p.y - 50 * easeOut(k);
  T(p.text, p.x, yy, p.size || 40, p.c, 'center', 6, 'O', 22); X.fillStyle = p.c; X.fillRect(p.x - 90 * easeOut(k * 3), yy + (p.size || 40) * .7, 180 * easeOut(k * 3), 3); X.restore();
}
