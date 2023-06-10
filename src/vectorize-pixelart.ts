#!/usr/bin/env node

import { createReadStream, createWriteStream } from 'fs'
import { PNG } from 'pngjs'
import { SVG, EPS, PNGImageData, Path, RGBA } from './utils'
import * as Process from 'process'
import { ContourTracing } from './contour-tracing'

const OutputFileFormats: { [_: string]: any } = {
  svg: SVG,
  eps: EPS
}

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

    const pixelMultiplier = 1

    const image = new PNGImageData(this)

    const vectorFormatter = new VectorFormatterClass(this.height, this.width, pixelMultiplier)
    vectorOut.write(vectorFormatter.header())

    const tracer = new ContourTracing(image)
    tracer.traceContours((contour: Path, color: RGBA) => {
      vectorOut.write(vectorFormatter.path(contour, color))
    })

    vectorOut.write(vectorFormatter.footer())
  })
