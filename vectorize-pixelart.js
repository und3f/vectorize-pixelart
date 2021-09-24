#!/usr/bin/env node

'use strict'

const fs = require('fs')
const process = require('process')
const PNG = require('pngjs').PNG
const ContourTracing = require('./contour-tracing')
const utils = require('./utils')

const OutputFileFormats = {
  svg: utils.SVG,
  eps: utils.EPS
}

const targetSize = 2 ** 23
const inputFileName = process.argv[2]
const outputFileName = process.argv[3]

if (process.argv.length < 4) {
  process.stdout.write(
    `usage: ${process.argv[1]} <input png image> <output svg|eps vector>\n`)
  process.exit(1)
}

const VectorFormatterClass = OutputFileFormats[outputFileName.split('.').pop()]
if (VectorFormatterClass == null) { throw new Error('Unsupported file format ' + outputFileName) }

fs.createReadStream(inputFileName)
  .pipe(new PNG())
  .on('parsed', function () {
    // TODO check files exists
    const vectorOut = fs.createWriteStream(outputFileName)

    const pixelMultiplier = Math.sqrt(targetSize / (this.height * this.width))

    const image = new utils.PNGImageData(this)

    const vectorFormatter = new VectorFormatterClass(this.height, this.width, pixelMultiplier)
    vectorOut.write(vectorFormatter.header())

    const tracer = new ContourTracing(image)
    tracer.traceContours((contour, pixel) => {
      vectorOut.write(vectorFormatter.path(contour, pixel))
    })

    vectorOut.write(vectorFormatter.footer())
  })
