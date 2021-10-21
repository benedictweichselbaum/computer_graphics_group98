"use strict"

function drawPixelwiseCircle(canvas) {
    let context = canvas.getContext("2d");
    let img = context.createImageData(200, 200);

    //TODO 1.1a)      Copy the code from Example.js
    //                and modify it to create a 
    //                circle.




    context.putImageData(img, 0, 0);
}

function drawContourCircle(canvas) {
    let context = canvas.getContext("2d");
    let img = context.createImageData(200, 200);

    //TODO 1.1b)      Copy your code from above
    //                and extend it to receive a
    //                contour around the circle.



    

    context.putImageData(img, 0, 0);
}

function drawSmoothCircle(canvas) {
    let context = canvas.getContext("2d");
    let img = context.createImageData(200, 200);

    //TODO 1.1c)      Copy your code from above
    //                and extend it to get rid
    //                of the aliasing effects at
    //                the border.




    context.putImageData(img, 0, 0);
}
