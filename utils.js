'use strict'

const SVG = exports.SVG = function (height, width, _multiplier) {
  this.height = height
  this.width = width
  this.multiplier = _multiplier == null ? 1 : _multiplier
}

SVG.prototype.header = function () {
  return `\
<?xml version="1.0" encoding="UTF-8" ?>
<svg width="${this.width * this.multiplier}" \
height="${this.height * this.multiplier}" xmlns="http://www.w3.org/2000/svg">
`
}

SVG.prototype.footer = function () {
  return '</svg>\n'
}

SVG.prototype.pixel = function (y, x, pixel) {
  if (pixel[3] < 255) { return }

  const rgb = pixel.join(', ')
  return `\
    <rect x="${x * this.multiplier}" y="${y * this.multiplier}" \
width="${1 * this.multiplier}" height="${1 * this.multiplier}" \
style="fill:rgba(${rgb})" />\n`
}

SVG.prototype.path = function (contour, pixel) {
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

const EPS = exports.EPS = function (height, width, _multiplier) {
  this.height = height
  this.width = width
  this.multiplier = _multiplier == null ? 1 : _multiplier
}

EPS.prototype.header = function () {
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

EPS.prototype.footer = function () {
  return `\
showpage
%%Trailer
%%EOF
`
}

EPS.prototype.path = function (contour, pixel) {
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

const BYTES_PER_PIXEL = 4

const PngImageData = exports.PNGImageData = function (png) {
  this.png = png
  this.width = this.png.width
  this.height = this.png.height
  this.data = png.data
}

PngImageData.prototype.comparePixels = function (y1, x1, y2, x2) {
  const pixels = this.data
  const offset1 = (y1 * this.width + x1) * BYTES_PER_PIXEL
  const offset2 = (y2 * this.width + x2) * BYTES_PER_PIXEL

  for (let i = 0; i < BYTES_PER_PIXEL; i++) {
    if (pixels[offset1 + i] !== pixels[offset2 + i]) { return false }
  }

  return true
}

PngImageData.prototype.getPixel = function (y, x) {
  const offset = (y * this.width + x) * BYTES_PER_PIXEL
  return this.data.slice(offset, offset + BYTES_PER_PIXEL)
}
