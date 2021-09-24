'use strict'

module.exports = ContourTracing

const DIRECTIONS = [
  [1, 0],
  [0, -1],
  [-1, 0],
  [0, 1]
]

const DIRECTION_VERTEX = [
  [1, 0],
  [0, 0],
  [0, 1],
  [1, 1]
]

const D_MOD = DIRECTIONS.length

function ContourTracing (image) {
  this.image = image
  this.visitedPixels = new Array(image.width * image.height)
  this.visitedPixels.fill(false)
}

ContourTracing.prototype.findNeighborbood = function (y, x) {
  // // console.log("findNeighborbood", y, x);

  for (let d = 0; d < DIRECTIONS.length; d++) {
    const y1 = y + DIRECTIONS[d][0]
    const x1 = x + DIRECTIONS[d][1]

    // console.log("\t", y1, x1);
    if (this.image.comparePixels(y, x, y1, x1)) {
      // Do not return visited pixels
      if (!this.visitedPixels[y1 * this.image.width + x1]) { return d }
    }
  }
  return undefined
}

ContourTracing.prototype.addMoveVertexes = function (contour, y, x, directionMove, directionPrevious) {
  // console.log("addMoveVertexes: ", y, x, directionMove, directionPrevious);

  for (let direction = directionPrevious; direction !== directionMove; direction = (direction + 1) % D_MOD) {
    const v = DIRECTION_VERTEX[direction]
    contour.push([y + v[0], x + v[1]])
    // console.log("\t", contour[contour.length-1]);
  }

  // Optimeze path by removing vertexes on straight lines
  if (directionMove === directionPrevious) { contour.pop() }

  const v = DIRECTION_VERTEX[directionMove]
  contour.push([y + v[0], x + v[1]])
  // console.log("\t", contour[contour.length-1]);
}

ContourTracing.prototype.addRotationVertexes = function (contour, y, x, currentDirection, targetDirection) {
  // console.log("addRotationVertexes: ", y, x, currentDirection, targetDirection);

  for (let direction = currentDirection; direction !== targetDirection; direction = (direction + 1) % D_MOD) {
    const v = DIRECTION_VERTEX[direction]
    contour.push([y + v[0], x + v[1]])
    // console.log("\t", contour[contour.length-1]);
  }
}

ContourTracing.prototype.addContour = function (contour, y, x, startDirection, endDirection) {
  // console.log("addContour: ", y, x, startDirection, endDirection);

  if (startDirection === endDirection) { return }

  for (let direction = (startDirection + D_MOD - 1) % D_MOD, firstRun = true; firstRun || direction !== endDirection; direction = (direction + 1) % D_MOD, firstRun = false) {
    const v = DIRECTION_VERTEX[direction]
    contour.push([y + v[0], x + v[1]])
    // console.log("\t", contour[contour.length-1]);
  }
}

ContourTracing.prototype.traceContour = function (y0, x0) {
  const image = this.image
  const width = this.image.width
  const height = this.image.height

  const contour = []
  // console.log("traceContour: ", y0, x0);

  // Find neighborhood
  const neighborhoodDirection = this.findNeighborbood(y0, x0)

  if (neighborhoodDirection === undefined) {
    this.visitedPixels[y0 * width + x0] = true
    this.addMoveVertexes(contour, y0, x0, D_MOD - 1, 0)
    return contour
  }

  this.addContour(contour, y0, x0, 0, neighborhoodDirection)

  let lastDirection = neighborhoodDirection
  let ylast = y0 + DIRECTIONS[neighborhoodDirection][0]
  let xlast = x0 + DIRECTIONS[neighborhoodDirection][1]

  const trace = [y0 * width + x0, ylast * width + xlast]

  do {
    const oppositeDirection = (lastDirection + D_MOD / 2) % D_MOD
    const startDirection = (oppositeDirection + 1) % D_MOD
    for (let newDirection = startDirection; ; newDirection = (newDirection + 1) % D_MOD) {
      const y = ylast + DIRECTIONS[newDirection][0]
      const x = xlast + DIRECTIONS[newDirection][1]

      if (y < 0 || y >= height || x < 0 || x >= width) { continue }

      if (image.comparePixels(ylast, xlast, y, x)) {
        // console.log("Similar: ", ylast, xlast, y, x);
        // Do not visit visited points
        if (!this.visitedPixels[y * width + x]) {
          // Mark Pixel as visited
          trace.push(y * width + x)

          this.addContour(contour, ylast, xlast, lastDirection, newDirection)
          ylast = y
          xlast = x
          lastDirection = newDirection
          break
        }
      }
      // console.log(ylast, xlast);
    }
  } while (!(ylast === y0 && xlast === x0))

  this.addContour(contour, y0, x0, lastDirection, neighborhoodDirection)

  for (const i in trace) {
    this.visitedPixels[trace[i]] = true
  }

  return contour
}

ContourTracing.prototype.traceContours = function (cb) {
  for (const i in this.visitedPixels) {
    if (this.visitedPixels[i]) { continue }

    const y0 = (i / this.image.width) | 0
    const x0 = i % this.image.width
    // console.log("Tracing", y0, x0);
    const contour = this.traceContour(y0, x0)
    // console.log("Found contour", contour);
    if (contour !== undefined) { cb(contour, this.image.getPixel(y0, x0)) }
  }

  /*
    let y0 = 0;
    let x0 = 2;
    console.log("Tracing", y0, x0);
    let contour = this.traceContour(y0, x0);
    console.log("Found contour", contour);
    if (contour !== undefined)
      cb(contour, this.image.getPixel(y0, x0));
  */
}
