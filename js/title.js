/* =====================================================
   HYDRUS 2040 — TITLE SCREEN
   ===================================================== */

$('#btn-start').addEventListener('click', () => showScreen('intro'));

$('#btn-credits').addEventListener('click', () => {
  const items = CREDITS.map((line) => `<li>${line}</li>`).join('');
  const team = CREATORS.map((name) => `<li>${name}</li>`).join('');
  openModal(`<h3>CREDITS</h3>
    <h4 class="credits-sub">CREATORS · SINGULARITY SQUAD</h4><ul class="creators">${team}</ul>
    <h4 class="credits-sub">IMAGES, TOOLS AND SOURCES</h4><ul class="credits">${items}</ul>`);
  $('#modal').classList.add('credits-open');            // starry sky photo behind the credits
});
