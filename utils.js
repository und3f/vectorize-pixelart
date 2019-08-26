"use strict";

var SVG = exports.SVG = function (height, width, _multiplier) {
  this.height = height;
  this.width = width;
  this.multiplier = _multiplier == null ? 1 : _multiplier
}

SVG.prototype.header = function() {
  return `\
<?xml version="1.0" encoding="UTF-8" ?>
<svg width="${this.width * this.multiplier}" \
height="${this.height * this.multiplier}" xmlns="http://www.w3.org/2000/svg">
`;
}

SVG.prototype.footer = function() {
    return "</svg>\n";
}

SVG.prototype.pixel = function (y, x, pixel) {
    if (pixel[3] < 255)
        return;

    let rgb = pixel.join(", ");
    return `\
    <rect x="${x * this.multiplier}" y="${y * this.multiplier}" \
width="${1 * this.multiplier}" height="${1 * this.multiplier}" \
style="fill:rgba(${rgb})" />\n`
}

SVG.prototype.path = function(contour, pixel) {
  let m = this.multiplier;
  let rgb = pixel.join(", ");

  let move = contour.shift();
  let path = `  <path d="M ${move[1] * m} ${move[0] * m}`;
  for (let i in contour) {
    path += ` L${contour[i][1] * m} ${contour[i][0] * m}`;
  }
  path += ` Z" style="fill:rgb(${rgb})" />\n`

  return path;
}

const BYTES_PER_PIXEL = 4;

var PngImageData = exports.PNGImageData = function(png) {
  this.png = png;
  this.width = this.png.width;
  this.height = this.png.height;
  this.data = png.data;
}

PngImageData.prototype.comparePixels = function (y1, x1, y2, x2) {
  let pixels = this.data;
  let offset1 = (y1 * this.width + x1) * BYTES_PER_PIXEL;
  let offset2 = (y2 * this.width + x2) * BYTES_PER_PIXEL;

  for (let i = 0; i < BYTES_PER_PIXEL; i++) {
    if (pixels[offset1 + i] !== pixels[offset2 + i])
      return false;
  }

  return true;
}

PngImageData.prototype.getPixel = function (y, x) {
  let offset = (y * this.width + x) * BYTES_PER_PIXEL;
  return this.data.slice(offset, offset + BYTES_PER_PIXEL);
}

