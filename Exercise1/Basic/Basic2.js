"use strict"

function drawArcCircle(canvas) {
    let context = canvas.getContext("2d");

    //TODO 1.2)       Use the arc() function to
    //                rasterize the two circles
    //                from Task 1.1.
    context.beginPath();
    context.arc(60, 60, 50, 0, 2 * Math.PI);
    context.fillStyle = "#00FF00";
    context.fill(); 

    context.beginPath();
    context.arc(140, 140, 60, 0, 2 * Math.PI);
    context.fillStyle = "#007F00";
    context.fill(); 

    context.beginPath();
    context.arc(140, 140, 50, 0, 2 * Math.PI);
    context.fillStyle = "#00FF00";
    context.fill(); 

}
