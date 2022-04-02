'use strict'

import type { PNG } from 'pngjs'

const DEFAULT_MULTIPLIER = 1

export type Pixel = [number, number, number, number]
export type Coord = [number, number]
export type Path = Coord[]

abstract class Image {
  protected readonly height: number
  protected readonly width: number
  protected readonly multiplier: number

  constructor (height: number, width: number, _multiplier = DEFAULT_MULTIPLIER) {
    this.height = height
    this.width = width
    this.multiplier = _multiplier == null ? 1 : _multiplier
  }

  abstract header (): string
  abstract footer (): string
  // abstract pixel(y: number, x: number, pixel: Pixel): string | undefined
  abstract path (contour: Path, pixel: Pixel): string
}

export class SVG extends Image {
  header () {
    return `\
<?xml version="1.0" encoding="UTF-8" ?>
<svg width="${this.width * this.multiplier}" height="${this.height * this.multiplier}" xmlns="http://www.w3.org/2000/svg">
`
  }

  footer () {
    return '</svg>\n'
  }

  pixel (y: number, x: number, pixel: Pixel) {
    if (pixel[3] < 255) { return }

    const rgb = pixel.join(', ')
    return `\
    <rect x="${x * this.multiplier}" y="${y * this.multiplier}" \
width="${1 * this.multiplier}" height="${1 * this.multiplier}" \
style="fill:rgba(${rgb})" />\n`
  }

  path (contour: Path, pixel: Pixel) {
    const m = this.multiplier
    const rgb = pixel.join(', ')

    const move = contour[0]
    let path = `  <path d="M ${move[1] * m} ${move[0] * m}`
    for (let i = 1; i < contour.length; i++) {
      path += ` L${contour[i][1] * m} ${contour[i][0] * m}`
    }
    path += ` Z" style="fill:rgb(${rgb})" />\n`

    return path
  }
}

export class EPS extends Image {
  header () {
    return `\
%!PS-Adobe-3.0 EPSF-3.0
%%Creator: vectorize-pixelart (https://github.com/und3f/vectorize-pixelart)
%%BoundingBox: 0 0 ${this.width * this.multiplier} ${this.height * this.multiplier}
%%Pages: 1
%%EndComments
%%BeginProlog
/m { moveto } bind def
/l { lineto } bind def
/z { closepath } bind def
/f { fill } bind def
/rg { setrgbcolor } bind def
%%EndProlog
%%Page: 1 1
%%BeginPageSetup
%%PageBoundingBox: 0 0 ${this.width * this.multiplier} ${this.height * this.multiplier}
%%EndPageSetup
`
  }

  footer () {
    return `\
showpage
%%Trailer
%%EOF
`
  }

  path (contour: Path, pixel: Pixel) {
    const m = this.multiplier
    const height = this.height

    let path = ''
    for (let i = 0; i < 3; i++) {
      path += (pixel[i] / 255).toFixed(3) + ' '
    }
    path += ' rg\n'

    const move = contour[0]
    path += `${(move[1]) * m} ${(height - move[0]) * m} m`
    for (let i = 1; i < contour.length; i++) {
      path += ` ${contour[i][1] * m} ${(height - contour[i][0]) * m} l`
    }
    path += ' z\nf\n'

    return path
  }
}

const BYTES_PER_PIXEL = 4

export class PNGImageData {
  private readonly png: PNG
  private readonly data: Buffer

  readonly width: number
  readonly height: number

  constructor (png: PNG) {
    this.png = png
    this.width = this.png.width
    this.height = this.png.height
    this.data = png.data
  }

  comparePixels (y1: number, x1: number, y2: number, x2: number): boolean {
    const pixels = this.data
    const offset1 = (y1 * this.width + x1) * BYTES_PER_PIXEL
    const offset2 = (y2 * this.width + x2) * BYTES_PER_PIXEL

    for (let i = 0; i < BYTES_PER_PIXEL; i++) {
      if (pixels[offset1 + i] !== pixels[offset2 + i]) { return false }
    }

    return true
  }

  getPixel (y: number, x: number): Pixel {
    const offset = (y * this.width + x) * BYTES_PER_PIXEL
    return Array.prototype.slice.call(this.data, offset, offset + BYTES_PER_PIXEL) as Pixel
  }
}
