'use strict';

document.addEventListener('DOMContentLoaded', e => {
  const jiggle_div = document.getElementById('jiggle');

  let is_tickling_network = true;
  (async () => {
    while (is_tickling_network) {
      await fetch(`?_t=${Date.now()}`);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
  })();

  function jiggle() {
    jiggle_div.style.marginTop = `${-2 * (++i % 2)}px`;
    return jiggler = setTimeout(jiggle, 1000 * Math.random());
  }

  let i = 0, jiggler;
  jiggle();

  setTimeout(() => {
    is_tickling_network = false;
    clearTimeout(jiggler);
  }, 30000);
});
