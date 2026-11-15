/* =====================================================
   HYDRUS 2040 · MARS LEVEL — SETTINGS YOU CAN CHANGE
   ===================================================== */
const CONFIG = {
  // Space background behind the planet. Put your own file in assets/ and write its path here.
  // If "video" has a path, the video is used; if not, the image.
  background: {
    image: '../assets/images/bg-credits.jpg',     // starry sky photo (same as the credits screen)
    video: null                               // e.g. 'assets/video/space.mp4'
  },
  names: ['ARI', 'BEN', 'CAM', 'DANI'],      // default crew names (players 1 to 4)
  sound: true
};

// Keys: 3 per player (left, middle, right)
const KEY_CODES = [['KeyQ', 'KeyW', 'KeyE'], ['KeyC', 'KeyV', 'KeyB'], ['KeyI', 'KeyO', 'KeyP'], ['ArrowLeft', 'ArrowDown', 'ArrowRight']];
const KEY_LABELS = [['Q', 'W', 'E'], ['C', 'V', 'B'], ['I', 'O', 'P'], ['←', '↓', '→']];
const PLAYER = [
  { color: '#38bdf8', shape: '▲' }, { color: '#f59e0b', shape: '■' },
  { color: '#a78bfa', shape: '●' }, { color: '#22c55e', shape: '◆' }
];
