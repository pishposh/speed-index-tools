#!/usr/bin/env node

'use strict';

process.on('unhandledRejection', (err) => { throw err; });

const image_size = require('image-size');
const sharp = require('sharp');
const path = require('path');

// const filename = '/dev/stdin';
const filename = process.argv[2];
if (!filename) {
  console.error('name of <timeline.json> file expected as argument; will be rewritten in-place');
  process.exit(1);
}

const fs = require('fs');
const timeline = JSON.parse(fs.readFileSync(filename));

const screenshots = timeline.traceEvents
  .filter(te => te.cat === 'disabled-by-default-devtools.screenshot');

var wxh_0, image_0, wxh_1, size_1, is_size_keeps_changing;
screenshots.forEach((te, i) => {
  const { ts, args: { snapshot } } = te;
  const image = Buffer.from(snapshot, 'base64');
  const size = image_size(image);
  const wxh = `${size.width} × ${size.height}`
  // console.log(`screenshot timestamp ${ts}: ${wxh}`);

  if (i == 0) {
    wxh_0 = wxh;
    image_0 = image;
  } else if (i == 1) {
    wxh_1 = wxh;
    size_1 = size;
  } else if (wxh != wxh_1) {
    is_size_keeps_changing = true;
  }
});

if (is_size_keeps_changing) {
  console.error('timeline screenshot sizes keep changing after second screenshot');
  process.exit(1);

} else if (wxh_0 == wxh_1) {
  console.log(`timeline screenshots look ok (size ${wxh_0})`);
  process.exit(0);
}

(async () => {
  const image_0_resized = await sharp(image_0)
    .resize(size_1.width, size_1.height)
    .toBuffer();

  screenshots[0].args.snapshot = image_0_resized.toString('base64');

  // const filename_out = filename.replace(/(\.json)?$/, '.fixed.json');
  fs.writeFileSync(filename, JSON.stringify(timeline, null, 2));
  console.log(`rewrote ${filename} to resize first screenshot from ${wxh_0} to ${wxh_1}`);
})();
