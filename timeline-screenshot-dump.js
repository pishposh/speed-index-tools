#!/usr/bin/env node

'use strict';

// const timelineFile = '/dev/stdin';

const timelineFile = process.argv[2];
if (!timelineFile) {
  console.error('name of <timeline.json> file expected as argument');
  process.exit(1);
}

const fs = require('fs');
const timeline = JSON.parse(fs.readFileSync(timelineFile));
const traceEvents = timeline.traceEvents;


// like {"pid":23765,"tid":775,"ts":715358304887,"ph":"O","cat":"disabled-by-default-devtools.screenshot","name":"Screenshot","args":{"snapshot":"<screenshot1.jpg>"},"tts":116747,"id":"0x1"},


traceEvents
.filter(te => te.cat === 'disabled-by-default-devtools.screenshot')
.forEach(traceEvent => {
  const { ts, args: { snapshot } } = traceEvent;
  fs.writeFileSync(`${timelineFile}-screenshot${ts}.jpg`, snapshot, 'base64');
});
