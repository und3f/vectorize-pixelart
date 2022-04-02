#!/usr/bin/env node

import { createReadStream, createWriteStream } from 'fs'
import { PNG } from 'pngjs'
import { SVG, EPS, PNGImageData, Path, Pixel } from './utils'
import * as Process from 'process'
const ContourTracing = require('./contour-tracing')

const OutputFileFormats: {[_: string]: any} = {
  svg: SVG,
  eps: EPS
}

const targetSize = 2 ** 23
const inputFileName = Process.argv[2]
const outputFileName: string = Process.argv[3]

if (Process.argv.length < 4) {
  Process.stdout.write(
    `usage: ${Process.argv[1]} <input png image> <output svg|eps vector>\n`)
  Process.exit(1)
}

const extension = outputFileName.split('.').pop() ?? ''
const VectorFormatterClass = OutputFileFormats[extension]
if (VectorFormatterClass == null) { throw new Error('Unsupported file format ' + outputFileName) }

createReadStream(inputFileName)
  .pipe(new PNG())
  .on('parsed', function () {
    // TODO check files exists
    const vectorOut = createWriteStream(outputFileName)

    const pixelMultiplier = Math.sqrt(targetSize / (this.height * this.width))

    const image = new PNGImageData(this)

    const vectorFormatter = new VectorFormatterClass(this.height, this.width, pixelMultiplier)
    vectorOut.write(vectorFormatter.header())

    const tracer = new ContourTracing(image)
    tracer.traceContours((contour: Path, pixel: Pixel) => {
      vectorOut.write(vectorFormatter.path(contour, pixel))
    })

    vectorOut.write(vectorFormatter.footer())
  })
