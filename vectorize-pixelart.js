#!/usr/bin/env node

"use strict";

var fs              = require('fs'),
    PNG             = require('pngjs').PNG,
    ContourTracing  = require('./contour-tracing'),
    utils           = require('./utils');

const targetSize = 2 ** 23;
let inputFileName = process.argv[2];
let outputFileName = process.argv[3];

if (process.argv.length < 4) {
    process.stdout.write(
`usage: ${process.argv[1]} <input png image> <output svg vector>\n`)
    process.exit(1);
}

fs.createReadStream(inputFileName)
    .pipe(new PNG())
    .on('parsed', function() {

      // TODO check files exists
      let vectorOut = fs.createWriteStream(outputFileName);

      let pixelMultiplier = Math.sqrt(targetSize / (this.height * this.width));

      let image = new utils.PNGImageData(this);
      let svg = new utils.SVG(this.height, this.width, pixelMultiplier);

      vectorOut.write(svg.header());

      let tracer = new ContourTracing(image);
      tracer.traceContours((contour, pixel) => {
        vectorOut.write(svg.path(contour, pixel));
      })

      vectorOut.write(svg.footer());
    });
