'use strict';

window.addEventListener('load', e => {
  let is_tickling_network = true;
  (async () => {
    while (is_tickling_network) {
      await fetch(`?_t=${Date.now()}`);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
  })();

  document.body.addEventListener('transitionend', e => {
    is_tickling_network = false;
  });
  document.body.style.filter = 'none';
});
