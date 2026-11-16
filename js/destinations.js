/* =====================================================
   HYDRUS 2040 — CHOOSE YOUR DESTINATION
   ===================================================== */

let chosenDestination = null;

function renderDestinations() {
  $('#dest-guide-text').textContent = DESTINATION_GUIDE;
  $('#dest-cols').innerHTML = DESTINATIONS.map((d) => `
    <button class="dest-card diff-${d.difficulty.toLowerCase()} ${d.available ? '' : 'locked'}" data-id="${d.id}" ${d.available ? '' : 'disabled'}>
      ${d.available ? '' : '<span class="soon">COMING SOON</span>'}
      <span class="dest-diff">${d.difficulty.toUpperCase()}</span>
      <div class="planet-photo big"><img src="${d.image}" alt="Photo of ${d.name}"></div>
      <h3 class="dest-name">${d.name}</h3>
      <p class="dest-title">${d.title}</p>
      <p class="dest-desc">${d.description}</p>
      ${d.fact ? `<p class="dest-fact"><b>FUN FACT</b>${d.fact}</p>` : ''}
    </button>`).join('');
}

/* shrink text and photos until every card (fun fact included) fits; works for any screen size and font */
function fitDestCards() {
  const cols = $('#dest-cols');
  if (!cols || !$('#screen-destinations').classList.contains('active')) return;
  const cards = [...cols.querySelectorAll('.dest-card')];
  const overflows = () => cards.some((c) => c.scrollHeight > c.clientHeight + 1);
  let k = 1;
  cols.classList.remove('fit-scroll');
  cols.style.setProperty('--k', k);
  while (overflows() && k > 0.5) { k = Math.round((k - 0.04) * 100) / 100; cols.style.setProperty('--k', k); }
  cols.classList.toggle('fit-scroll', overflows());
}
let fitTimer = 0;
addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitDestCards, 80); });
if (document.fonts) document.fonts.ready.then(fitDestCards);

function chooseDestination(id) {
  chosenDestination = DESTINATIONS.find((d) => d.id === id);
  document.querySelectorAll('.dest-card').forEach((c) => c.classList.toggle('selected', c.dataset.id === id));
  $('#dest-choice').innerHTML = `Destination: <b>${chosenDestination.name}</b> · ${chosenDestination.title}`;
  $('#dest-go').disabled = false;
}

$('#dest-cols').addEventListener('click', (e) => {
  const card = e.target.closest('.dest-card');
  if (card && !card.disabled) chooseDestination(card.dataset.id);
});

$('#dest-back').addEventListener('click', () => showScreen('title'));

$('#dest-go').addEventListener('click', () => {
  GAME.destination = chosenDestination;
  openCrewWindow();          // asks how many astronauts, then the hangar opens
});

SCREENS.destinations = {
  enter: () => {
    chosenDestination = null;
    renderDestinations();
    $('#dest-choice').textContent = 'Pick a world to continue.';
    $('#dest-go').disabled = true;
    fitDestCards();                                   // reading scrollHeight forces layout, so this works right away
    setTimeout(fitDestCards, 300);                    // again once the planet photos and fonts have settled
  }
};
