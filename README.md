[![Build Status](https://travis-ci.org/und3f/vectorize-pixelart?branch=master)](https://travis-ci.org/und3f/vectorize-pixelart)

vectorize-pixelart
==================

Convert raster pixel art graphics to vector.

# Installation

    $ npm install vectorize-pixelart

# CLI usage

You may vectorize PNG image to SVG using next command:

    $ vectorize-pixelart Input.png Output.svg

Also EPS output is supported:

    $ vectorize-pixelart Input.png Output.eps

# Online web usage

The package has been build with a [Browserify](browserify.org) version and
available online:

http://zasenko.name/vectorize-pixelart.html

Main limitation of the web version is that browser has issues when processing
large SVG files. As there are no control over image displaying some resulting
SVG might cause browser hang.

# API

Please check [vectorize-pixelart.js](vectorize-pixelart.js) code.

So, basic usage is next:

1. Read raster image.
2. Trace image

```js
var fs  = require('fs'),
    PNG = require('pngjs').PNG,
    ContourTracing = require('vectorize-pixelart/contour-tracing'),
    paUtils = require('vectorize-pixelart/utils');

// PNGImageData provides transparent pixel retrieving/comparasion interface
let image = new paUtils.PNGImageData(PNG.sync.read(fs.readFileSync('in.png')));

// Vector composer
let composer = new paUtils.SVG(image.height, image.width);

process.stdout.write(composer.header());

let tracer = new ContourTracing(image);
tracer.traceContours((contour, pixel) => {
    // Output next traced contour
    process.stdout.write(composer.path(contour, pixel));
})

process.stdout.write(composer.footer());
```

## Class: ContourTracing

Trace contours of a given `image`.

### new ContourTracing(image)

Object image should contain `height` and `width` information. Also it should
provide `function comparePixels(y1, x1, y2, x2) { }` and `function getPixel(y1,
x1)`. See `PNGImageData`.

### ContourTracing.traceContours(callback)
Traces contours of a given image and return next contour to callback. The
callback gets one argument `(contour)` that contains array of contour points 
`[y, x]`.

# Copyright

Copyright (C) 2019 Sergii Zasenko

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
