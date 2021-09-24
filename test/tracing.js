const test = require('tape')
const ContourTracing = require('../contour-tracing')

test('trace contours of sample image', (t) => {
  const imageData = [
    0.0, 0.0, 0.2, 0.0, 0.0,
    0.1, 0.2, 0.2, 0.2, 0.0,
    0.1, 0.0, 0.2, 0.0, 0.0,
    0.1, 0.3, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0
  ]

  const image = new MockedImage(imageData, 5, 5)

  const ct = new ContourTracing(image)
  let foundContours = 0

  ct.traceContours((contour) => {
    foundContours++
    if (isStraightContour(contour)) {
      t.pass('Retrieved countour is straight')
    } else {
      t.fail('Wrong contour: ' + contour)
    }
  })

  t.ok(foundContours === 6, 'Found exacly 6 contours')

  t.end()
})

function isStraight (point1, point2) {
  const yChange = point1[0] !== point2[0]
  const xChange = point1[1] !== point2[1]
  return yChange !== xChange
};

function isStraightContour (contour) {
  for (let i = 0; i < contour.length - 1; i++) {
    if (!isStraight(contour[i], contour[i + 1])) { return false }
  }

  if (!isStraight(contour[contour.length - 1], contour[0])) { return false }

  return true
}

function MockedImage (imageArray, height, width) {
  this.image = imageArray
  this.height = height
  this.width = width

  function _getOffset (y, x) {
    return y * width + x
  }

  this.comparePixels = function (y1, x1, y2, x2) {
    return this.image[_getOffset(y1, x1)] === this.image[_getOffset(y2, x2)]
  }

  this.getPixel = function (y, x) {
    const gray = 255 * this.image[_getOffset(y, x)]
    return [gray, gray, gray, 255]
  }
}
