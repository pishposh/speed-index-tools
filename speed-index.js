#!/usr/bin/env node

/**
 *  these don't really work:
 *    python tsproxy.py --rtt=250 --inkbps=3000 --outkbps=768
 *    comcast --device=eth0 --latency=250 --target-bw=6000 --packet-loss=1.5% --target-port=443,80
 */

'use strict';

process.on('unhandledRejection', (err) => { throw err; });

var parser = new require('argparse').ArgumentParser({
  version: '0.0.1',
  addHelp: true,
});
parser.addArgument(['-f', '--filename'], {
  help: 'Write timeline JSON to this file.',
  type: 'string',
});
parser.addArgument(['-y', '--scroll-y'], {
  help: 'Pin viewport to this vertical scroll position, in pixels.',
  type: 'int',
});
parser.addArgument(['-d', '--devtools'], {
  help: 'Launch Chrome non-headless with devtools open.',
  action: 'storeTrue',
});
parser.addArgument('URI', {
  help: 'URI to measure',
});
var args = parser.parseArgs();

// http://localhost:8080/unscramble-long.html
// https://giphy.com/gifs/filmeditor-movie-90s-3ohzdNPEuXedjgC0Cs
// https://www.nytimes.com/2016/11/08/nyregion/chopped-cheese-sandwich-harlem.html

const uri = args['URI'];
if (!uri) {
  console.error(`usage: ${process.argv[1]} [--filename=timeline.json] [--scroll-y=N] [--devtools] https://uri-to-measure/`);
  process.exit(1);
}
const use_devtools = args['devtools'];
const scroll_y = args['scroll-y'] || 0;
const filename = args['filename']
  || (uri.replace(/[^a-zA-Z0-9%_-]+/g, '_')
      + (scroll_y ? `-y${scroll_y}` : '')
      + (use_devtools ? `-devtools` : '')
      + '.json');

if (scroll_y) {
  console.log(`loading ${uri} scrolled to ${scroll_y}...`);
} else {
  console.log(`loading ${uri}...`);
}

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const child_process = require('child_process');

// const children = [];
// function cleanExit() { process.exit() };
// process.on('SIGINT', cleanExit); // catch ctrl-c
// process.on('SIGTERM', cleanExit); // catch kill
// process.on('exit', () => {
//   children.forEach(child => child.kill());
// });

(async () => {
  // const tsproxy = child_process.spawn('./tsproxy.py', ['--rtt=50', '--inkbps=30000', '--outkbps=10000']);
  // const tsproxy = child_process.spawn('./tsproxy.py', ['--rtt=250', '--inkbps=3000', '--outkbps=768']);
  // let tsproxyOut = '';
  // tsproxy.stdout.on('data', data => { tsproxyOut += data });
  // children.push(tsproxy);

  // while (!/Started Socks5 proxy server/.test(tsproxyOut)) {
  //   console.log(tsproxyOut);
  //   await delayAsync(1000);
  // }
  // console.log('ok');
  // await delayAsync(1000);

  const browser = await puppeteer.launch({
    devtools: use_devtools,
    // args: [ '--proxy-server=socks5://127.0.0.1:1080' ],
    // dumpio: true,
  });
  // console.log(`DevTools url: ${browser.wsEndpoint()}`);

  const page = await browser.newPage();
  await page.emulate(devices['iPhone 6']);

  // page.on('console', msg => console.log(msg.text));

  if (scroll_y) {
    await page.evaluateOnNewDocument(`
      (function pinScrollWhileLoading(scroll_y) {
        if (window.top != window.self) return;
        setInterval(function pinScroll() {
          window.scrollTo(0, scroll_y);
        }, 500);
      })(${scroll_y});
    `);
    // await page.evaluateOnNewDocument(`
    //   (function scrollWhileLoading(scroll_y) {
    //     if (window.top != window.self) return;
    //     var observer = new MutationObserver(mutations => {
    //       window.scrollTo(0, scroll_y);
    //       if (window.scrollY > scroll_y - 1) {
    //         observer.disconnect();
    //         performance.mark('scrolled');
    //         // console.log('scrolled to ' + scroll_y);
    //       }
    //     });
    //     observer.observe(document, { childList: true, subtree: true, attributes: true });
    //   })(${scroll_y});
    // `);
  }

  await page.tracing.start({ path: filename, screenshots: true });
  await page.goto(uri, {
    timeout: 0,
    waitUntil: ['load', 'domcontentloaded', 'networkidle0']
  });
  await page.tracing.stop();
  console.log(`wrote ${filename}`);
  await browser.close();

  child_process.spawnSync(`./timeline-screenshot-size-fix.js ${filename}`, { stdio: 'inherit', shell: true });
  child_process.spawnSync(`speedline ${filename} --pretty`, { stdio: 'inherit', shell: true });
})();



function delayAsync(duration) {
  return new Promise(res => setTimeout(() => res(), duration));
}
