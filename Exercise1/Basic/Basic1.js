"use strict"

function drawPixelwiseCircle(canvas) {
    let context = canvas.getContext("2d");
    let img = context.createImageData(200, 200);

    let distanceToPoint = function (cx, cy, x, y) {
        let dx = cx - x
        let dy = cy - y
        return Math.sqrt(dx*dx + dy*dy)
    }

    let isInsideCircle = function (cx, cy, x, y, r) {
        return distanceToPoint(cx, cy, x, y) < r
    }

    for (let i = 0; i < 4 * 200 * 200; i += 4) {
	    let x = (i % (4 * 200)) / 4
        let y = Math.floor(i / (4 * 200))
        if (isInsideCircle(100, 100, x, y, 50)) {
            img.data[i] = 0;
            img.data[i + 1] = 255;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        }
	}
    context.putImageData(img, 0, 0);
}

function drawContourCircle(canvas) {
    let context = canvas.getContext("2d");
    let img = context.createImageData(200, 200);

    let distanceToPoint = function (cx, cy, x, y) {
        let dx = cx - x
        let dy = cy - y
        return Math.sqrt(dx*dx + dy*dy)
    }

    let isInsideCircle = function (cx, cy, x, y, r) {
        return distanceToPoint(cx, cy, x, y) < r
    }

    for (let i = 0; i < 4 * 200 * 200; i += 4) {
	    let x = (i % (4 * 200)) / 4
        let y = Math.floor(i / (4 * 200))
        if (isInsideCircle(100, 100, x, y, 45)) {
            img.data[i] = 0;
            img.data[i + 1] = 255;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        } else if (isInsideCircle(100, 100, x, y, 55)) {
            img.data[i] = 0;
            img.data[i + 1] = 127;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        }
	}
    context.putImageData(img, 0, 0);
}

function drawSmoothCircle(canvas) {
    let context = canvas.getContext("2d");
    let img = context.createImageData(200, 200);

    let distanceToPoint = function (cx, cy, x, y) {
        let dx = cx - x
        let dy = cy - y
        return Math.sqrt(dx*dx + dy*dy)
    }

    let isInsideCircle = function (cx, cy, x, y, r) {
        return distanceToPoint(cx, cy, x, y) < r
    }

    for (let i = 0; i < 4 * 200 * 200; i += 4) {
	    let x = (i % (4 * 200)) / 4
        let y = Math.floor(i / (4 * 200))

        if (isInsideCircle(100, 100, x, y, 45)) {
            img.data[i] = 0;
            img.data[i + 1] = 255;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        } else if (isInsideCircle(100, 100, x, y, 46)) {
            var colorFactor = distanceToPoint(100, 100, x, y) - 45
            img.data[i] = 0;
            img.data[i + 1] = (127 - 255) * colorFactor + 255;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        } else if (isInsideCircle(100, 100, x, y, 54)) {
            img.data[i] = 0;
            img.data[i + 1] = 127;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        } else if (isInsideCircle(100, 100, x, y, 55)) {
            var colorFactor = distanceToPoint(100, 100, x, y) - 54
            img.data[i] = (255 - 0) * colorFactor + 0
            img.data[i + 1] = (255 - 127) * colorFactor + 127
            img.data[i + 2] = (255 - 0) * colorFactor + 0
            img.data[i + 3] = 255;
        }
	}
    context.putImageData(img, 0, 0);
}
