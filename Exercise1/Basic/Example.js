"use strict"

function drawIntoCanvas(canvas) {
	console.log("This is an exemplary log!");
	let context = canvas.getContext("2d");
	let img = context.createImageData(200, 200);

	for (let i = 0; i < 4 * 200 * 200; i += 4) {
	    img.data[i] = 100;
		img.data[i + 1] = 200;
		img.data[i + 2] = 255;
		img.data[i + 3] = 255;
	}

	context.putImageData(img, 0, 0);
}
