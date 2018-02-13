'use strict';

// globals for debugging:
var tokens, token_indices, delay_ms, update_freq;

function unscramble(text_in, delay_ms_default, update_freq_default) {

  // deterministic Math.random() from <https://gist.github.com/mathiasbynens/5670917>:
  Math.random = (function() {
    var seed = 0x2F6E2BB;
    return function() {
      // Robert Jenkins’ 32 bit integer hash function
      seed = ((seed + 0x7ED55D16) + (seed << 12))  & 0xFFFFFFFF;
      seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
      seed = ((seed + 0x165667B1) + (seed << 5))   & 0xFFFFFFFF;
      seed = ((seed + 0xD3A2646C) ^ (seed << 9))   & 0xFFFFFFFF;
      seed = ((seed + 0xFD7046C5) + (seed << 3))   & 0xFFFFFFFF;
      seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
      return (seed & 0xFFFFFFF) / 0x10000000;
    };
  }());

  tokens = text_in.trim().split(/\s+/); // ['<p>', 'argh', 'argh', 'argh', 'argh', '<br>', 'argh', ... 'argh']
  // console.log(tokens);
  token_indices = Array.from(Array(tokens.length), (_, i) => i); // [0, 1, 2, 3, 4, 5, 6, ... 99]
  shuffle(token_indices);

  delay_ms = +(location.search.match(/(?:^\?|&)d(?:elay)?=([^&]*)/) || [,delay_ms_default])[1]; // 55000 / tokens.length seems good
  update_freq = +(location.search.match(/(?:^\?|&)u(?:pdate)?=([^&]*)/) || [,update_freq_default])[1];

  document.addEventListener('DOMContentLoaded', e => {
    // keep puppeteer trace alive with network activtiy:
    let is_tickling_network = true;
    (async () => {
      while (is_tickling_network) {
        await fetch(`?_t=${Date.now()}`);
        await new Promise((resolve) => setTimeout(resolve, 450));
      }
    })();

    // kick off sorting:
    (async () => {
      update_body();
      await quicksort(token_indices, async () => {
        await new Promise(resolve => setTimeout(resolve, delay_ms * Math.random()));
        if (Math.random() < update_freq) update_body();
      });
      update_body();
      is_tickling_network = false; // stop network activity, let puppeteer terminate
    })();


    function update_body() {
      // join tokens in in-progress sort order:
      let html = '<p>' + token_indices.map(i => tokens[i]).join(' ');
      // collapse line-breaking whitespace:
      html = html.replace(/((<br>|<p>)\s*)+/g, s => /<p>/.test(s) ? '<p>' : '<br>');
      // update document.body and sleep:
      document.body.innerHTML = html;
    }
  });

  // <https://stackoverflow.com/a/12646864>:
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // adapted from <https://www.nczonline.net/blog/2012/11/27/computer-science-in-javascript-quicksort/>:
  async function partition(items, update, left, right) {
    var pivot = items[Math.floor((right + left) / 2)], i = left, j = right;
    while (i <= j) {
      while (items[i] < pivot) i++;
      while (items[j] > pivot) j--;
      if (i <= j) {
        [items[i], items[j]] = [items[j], items[i]];
        i++, j--;
        await update();
      }
    }
    return i;
  }

  async function quicksort(items, update, left, right) {
    var index;
    if (items.length > 1) {
      left = typeof left != "number" ? 0 : left;
      right = typeof right != "number" ? items.length - 1 : right;
      index = await partition(items, update, left, right);

      // var a = [];
      if (left < index - 1) {
        // a.push( quicksort(items, update, left, index - 1) );
        await quicksort(items, update, left, index - 1);
      }
      if (index < right) {
        // a.push( quicksort(items, update, index, right) );
        await quicksort(items, update, index, right);
      }
      // await Promise.all(a);
    }
    return items;
  }
}
