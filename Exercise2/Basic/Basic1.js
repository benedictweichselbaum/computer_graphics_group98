"use strict";

///////////////////////////
//// global variables  ////
///////////////////////////

// pixel scale
let pixelScale = 10;

// line
let line = new Line(    new Point( 10 / pixelScale,  10 / pixelScale),
                        new Point(180 / pixelScale, 180 / pixelScale),
                        new Color(0, 0, 0));

//////////////
//// gui  ////
//////////////

// event listener for gui
function onChangePixelScale(value) {
    // rescale line
    let s = pixelScale / value;
    line.startPoint.x = line.startPoint.x * s;
    line.startPoint.y = line.startPoint.y * s;
    line.endPoint.x = line.endPoint.x * s;
    line.endPoint.y = line.endPoint.y * s;
    // set new scaling factor
    pixelScale = value;
    // rerender scene
    RenderCanvas1();
}

function onMouseDownCanvas1(e) {
    let rect = document.getElementById("canvas1").getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    console.log("onMouseDownCanvas1: " + x + " " + y);

    // set new points
    if (e.ctrlKey) {
        line.endPoint.x = x / pixelScale;
        line.endPoint.y = y / pixelScale;
    } else {
        line.startPoint.x = x / pixelScale;
        line.startPoint.y = y / pixelScale;
    }

    // rerender image
    RenderCanvas1();
}


//////////////////////////////
//// bresenham algorithm  ////
//////////////////////////////

function bresenham(image, line) {
    // ensure integer coordinates
    let x0 = Math.floor(line.startPoint.x);
    let y0 = Math.floor(line.startPoint.y);
    let x1 = Math.floor(line.endPoint.x);
    let y1 = Math.floor(line.endPoint.y);

    // TODO 2.1     Write code to draw a line
    //              between the start point and
    //              the end point. To make things
    //              easier, there are some comments
    //              on what to do next: 

    // compute deltas and update directions

    let deltaX = x1 - x0
    let deltaY = y1 - y0

    let xStep = sgn(deltaX)
    let yStep = sgn(deltaY)
    
    deltaX = deltaX < 0 ? -deltaX : deltaX
    deltaY = deltaY < 0 ? -deltaY : deltaY

    let hsx, hsy, dsx, dsy
    let deltaInShortDirection, deltaInLongDirection

    if (deltaX > deltaY) {
        hsx = xStep
        hsy = 0
        dsx = xStep
        dsy = yStep
        deltaInShortDirection = deltaY
        deltaInLongDirection = deltaX
    } else {
        hsx = 0
        hsy = yStep
        dsx = xStep
        dsy = yStep
        deltaInShortDirection = deltaX
        deltaInLongDirection = deltaY
    }

    // set initial coordinates
    let xImage = x0
    let yImage = y0

    let D = deltaInLongDirection - (2 * deltaInShortDirection)
    let deltaHorizontalMove = -2 * deltaInShortDirection
    let deltaDiagonalMove = 2 * (deltaInLongDirection - deltaInShortDirection)


    // start loop to set nPixels 
    let nPixels = deltaInLongDirection; // think about how many pixels need to be set - zero is not correct ;)

    for (let i = 0; i < nPixels; ++i) {
        // set pixel using the helper function setPixelS()
        setPixelS(image, new Point(xImage, yImage), line.color, pixelScale)
        // update error
        // update coordinates depending on the error
        if (D < 0) {
            yImage += dsy
            xImage += dsx
            D = D + deltaDiagonalMove
        } else {
            yImage += hsy
            xImage += hsx
            D = D + deltaHorizontalMove
        }
    }
}

function sgn(x) {
    return x < 0 ? -1 : (x > 0 ? 1 : 0)
}


//////////////////////////
//// render function  ////
//////////////////////////

function RenderCanvas1() {
    // get canvas handle
    let context = document.getElementById("canvas1").getContext("2d");
    let canvas = context.createImageData(200, 200);

    // clear canvas
    clearImage(canvas, new Color(255, 255, 255));

    // draw line
    bresenham(canvas, line);

    // draw start and end point with different colors
    setPixelS(canvas, line.startPoint, new Color(255, 0, 0), pixelScale);
    setPixelS(canvas, line.endPoint, new Color(0, 255, 0), pixelScale);

    // show image
    context.putImageData(canvas, 0, 0);
}


function setupBresenham(canvas) {
    // execute rendering
    RenderCanvas1();
    // add event listener
    document.getElementById("canvas1").addEventListener('mousedown', onMouseDownCanvas1, false);
}
