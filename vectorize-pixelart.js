#!/usr/bin/env node

"use strict";

var fs              = require('fs'),
    PNG             = require('pngjs').PNG,
    ContourTracing  = require('./contour-tracing'),
    utils           = require('./utils');

const OutputFileFormats = {
    'svg': utils.SVG,
    'eps': utils.EPS
};

const targetSize = 2 ** 23;
let inputFileName = process.argv[2];
let outputFileName = process.argv[3];

if (process.argv.length < 4) {
    process.stdout.write(
`usage: ${process.argv[1]} <input png image> <output svg|eps vector>\n`)
    process.exit(1);
}

let vectorFormatterClass = OutputFileFormats[outputFileName.split('.').pop()];
if (vectorFormatterClass == null)
    throw new Error("Unsupported file format " + outputFileName);

fs.createReadStream(inputFileName)
    .pipe(new PNG())
    .on('parsed', function() {

      // TODO check files exists
      let vectorOut = fs.createWriteStream(outputFileName);

      let pixelMultiplier = Math.sqrt(targetSize / (this.height * this.width));

      let image = new utils.PNGImageData(this);

      let vectorFormatter = new vectorFormatterClass(this.height, this.width, pixelMultiplier);
      vectorOut.write(vectorFormatter.header());

      let tracer = new ContourTracing(image);
      tracer.traceContours((contour, pixel) => {
        vectorOut.write(vectorFormatter.path(contour, pixel));
      })

      vectorOut.write(vectorFormatter.footer());
    });
