const test = require('tape')
const utils = require('../utils')

test('compose SVG image', (t) => {
  const svg = new utils.SVG(101, 102)

  const header = svg.header()
  t.ok(header.match(/<svg/), 'correct header')

  t.ok(svg.path(
    [[0, 0], [10, 0], [10, 1], [1, 1], [2, 1], [2, 0]], [0, 0, 0, 0])
    .match(/<path/), 'correct path')

  t.ok(svg.footer().match(/<\/svg>/), 'correct footer')

  t.end()
})

test('compose EPS image', (t) => {
  const eps = new utils.EPS(101, 102)

  const header = eps.header()
  t.ok(header.match(/%!PS-Adobe-3.0 EPSF-3.0/), 'correct header')

  t.ok(eps.path(
    [[0, 0], [10, 0], [10, 1], [1, 1], [2, 1], [2, 0]], [0, 0, 0, 0])
    .match(/.+\srg.+\sl.+\sf/s), 'correct path')

  t.ok(eps.footer().match(/%%EOF/), 'correct footer')

  t.end()
})
