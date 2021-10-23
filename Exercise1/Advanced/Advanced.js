"use strict"

/////////////////////////////////////////////
/////////  Complex Number Helpers  //////////
/////////////////////////////////////////////
function ComplexNumber(re, im) {
    this.re = re;
    this.im = im;
}

function ComplexNumberFromCoords(x, y, canvasID) {
    let canvas = document.getElementById(canvasID);
    this.re = (x / (1.0 * canvas.width) - 0.5);
    this.im = (y / (1.0 * canvas.height) - 0.5);
    if (canvasID == 'julia_canvas') {
        this.re *= 3;
        this.im *= 3;
    } else {
        this.re = this.re * 3 * Math.pow(2, zoom) + center.re;
        this.im = this.im * 2 * Math.pow(2, zoom) + center.im;
    }
}

function mult(x, y) {
    let re = (x.re * y.re - x.im * y.im);
    let im = (x.re * y.im + x.im * y.re);
    return new ComplexNumber(re, im);
}

function add(x, y) {
    let re = (x.re + y.re);
    let im = (x.im + y.im);
    return new ComplexNumber(re, im);
}

function sub(x, y) {
    let re = (x.re - y.re);
    let im = (x.im - y.im);
    return new ComplexNumber(re, im);
}

function abs(x) {
    return Math.sqrt(x.re * x.re + x.im * x.im);
}


/////////////////////////////////
/////////  Magic Math  //////////
/////////////////////////////////
function f_c(z, c) {
    // TODO 1.4a):      Compute the result of function f_c for a given z and
    //                  a given c. Use the helper functions.
    return add(mult(z, z), c);



}

function countIterations(start_z, c, max_iter) {
    // TODO 1.4a):      Count iterations needed for the sequence to diverge.
    //                  z is declared diverged as soon as its absolute value
    //                  exceeds 2. If the sequence does not diverge during
    //                  the first max_iter iterations, return max_iter. Use
    //                  function f_c().
    let z = start_z;
    let i = 0
    for (; i < max_iter && abs(z) < 2; ++i){
        z = f_c(z, c);
    }
    //return i;


    // TODO 1.4b):      Change the return value of this function to avoid
    //                  banding. 

    // mu = N + 1 - log (log  |Z(N)|) / log 2
    let renormalized_i;
    if (i === max_iter){
        renormalized_i = i;
    }else{
        renormalized_i = i + 1 - Math.log(Math.log(abs(z)))/Math.log(2);
    }

    if (isNaN(renormalized_i)){
        renormalized_i = i;// not sure about this
    }

    return renormalized_i;

}


/////////////////////////////
/////////  Colors  //////////
/////////////////////////////
function getColorForIter(iter) {

    // find out which radio button is checked, i.e. which color scheme is picked
    let colorscheme;
    let radios = document.getElementsByName('colors');
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            colorscheme = radios[i].value;
            break;
        }
    }

    // return color according to chosen color scheme
    let color = [128, 128, 128];


    
    if (colorscheme == "black & white") {
        // TODO 1.4a):      Return the correct color for the iteration count
        //                  stored in iter. Pixels corresponding to complex
        //                  numbers for which the sequence diverges should be
        //                  shaded white. Use the global variable max_iter.
        if (iter < max_iter){
            color = [255,255,255];
        }else{
            color = [0,0,0];
        }



    } else if (colorscheme == "greyscale") {
        // TODO 1.4b):      Choose a greyscale color according to the given
        //                  iteration count in relation to the maximum
        //                  iteration count. The more iterations are needed
        //                  for divergence, the darker the color should be.
        //                  Be aware of integer division!
        let c = 255 * (1 - iter / max_iter);
        color = [c,c,c];


    } else if (colorscheme == "underwater") {
        // TODO 1.4b):      Choose a color between blue and green according
        //                  to the given iteration count in relation to the
        //                  maximum iteration count. The more iterations are
        //                  needed for divergence, the more green and less
        //                  blue the color should be.
        let k = (iter / max_iter);
        color = [0,255*k,255*(1-k)];
        if (iter >= max_iter){
            color = [0,0,0];
        }

    } else { // rainbow
        // TODO 1.4b):      Choose a rainbow color according to the given
        //                  iteration count in relation to the maximum
        //                  iteration count. Colors should change from cyan
        //                  (for very few needed iterations) over blue, violet, pink,
        //                  red, yellow and green back to cyan (for lots of
        //                  needed iterations). Use the HSV model and convert
        //                  HSV to RGB colors using function hsv2rgb.
        let k = (iter / max_iter);
        //let hsv = [180, 1, 1];
        let hsv = [(180 + 360*k)%360, 1, 1];
        color = hsv2rgb(hsv);
        if (iter >= max_iter){
            color = [0,0,0];
        }
    }
    return color;
}


function hsv2rgb(hsv) {
    let h = hsv[0];
    let s = hsv[1];
    let v = hsv[2];


    // TODO 1.4b):      Replace the following line by code performing the
    //                  HSV to RGB convertion known from the lecture.
    //let rgb = [255, 255, 255];
    //let h_deg = h * 360 / 255
    //let v_norm = v/255;
    //let s_norm = s/255;
    let c = v*s;
    let x = c * (1-Math.abs((h/60)%2-1));
    let m = v-c;
    let rgb_c;
    if(h <60)       {rgb_c = [c,x,0]}
    else if(h <120) {rgb_c = [x,c,0]}
    else if(h <180) {rgb_c = [0,c,x]}
    else if(h <240) {rgb_c = [0,x,c]}
    else if(h <300) {rgb_c = [x,0,c]}
    else if(h <=360){rgb_c = [c,0,x]}
    else {alert("hsv conversion error")}
    let rgb = [(rgb_c[0]+m)*255, (rgb_c[1] + m)*255, (rgb_c[2] + m)*255]

    return rgb;
}


/////////////////////////////////////
/////////  Canvas Fillers  //////////
/////////////////////////////////////
function mandelbrotSet(image) {
    for (let i = 0; i < 4 * image.width * image.height; i += 4) {
        let pixel = i / 4;
        let x = pixel % image.width;
        let y = image.height - pixel / image.width;
        let c = new ComplexNumberFromCoords(x, y, 'mandelbrot_canvas');
        let rgb;

        // TODO 1.4a):      Replace the following line by creation of the
        //                  Mandelbrot set. Use functions countIterations() 
        //                  and getColorForIter().
        //rgb = [(c.re + 0.5) * 255, (c.im + 0.5) * 255, 0];
        {
            // x0 & y0 are c
            let iterations = countIterations(new ComplexNumber(0,0), c, max_iter);
            rgb = getColorForIter(iterations)
            
        }


        image.data[i] = rgb[0];
        image.data[i + 1] = rgb[1];
        image.data[i + 2] = rgb[2];
        image.data[i + 3] = 255;
    }
}

function juliaSet(image) {
    for (let i = 0; i < 4 * image.width * image.height; i += 4) {
        let pixel = i / 4;
        let x = pixel % image.width;
        let y = image.height - pixel / image.width;
        let rgb;

        // TODO 1.4d):      Replace the following line by creation of the
        //                  Julia set for c = juliaC (global variable). Use
        //                  functions ComplexNumberFromCoords(),
        //                  countIterations() and getColorForIter().
        //rgb = [128, 128, 128];
        let z = new ComplexNumberFromCoords(x, y, 'julia_canvas');
        let iterations = countIterations(z, juliaC, max_iter);
        rgb = getColorForIter(iterations)


        image.data[i] = rgb[0];
        image.data[i + 1] = rgb[1];
        image.data[i + 2] = rgb[2];
        image.data[i + 3] = 255;
    }
}

///////////////////////////////
/////////  Renderers  //////////
///////////////////////////////
function RenderMandelbrotSet() {
    // get the canvas
    let canvas = document.getElementById("mandelbrot_canvas");
    let ctx = canvas.getContext("2d");

    // create a new image
    let image = ctx.createImageData(canvas.width, canvas.height);

    // render Mandelbrot set
    mandelbrotSet(image);

    // write image back to canvas
    ctx.putImageData(image, 0, 0);
}

function RenderJuliaSet() {
    // get the canvas
    let canvas = document.getElementById("julia_canvas");
    let ctx = canvas.getContext("2d");

    // create a new image
    let image = ctx.createImageData(canvas.width, canvas.height);

    // render Julia set
    juliaSet(image);

    // write image back to canvas
    ctx.putImageData(image, 0, 0);
}


///////////////////////////////
//////////   "main"   /////////
///////////////////////////////

// maximum iteration number for Mandelbrot computation
let max_iter = 30;

// coordinate system center
let center = new ComplexNumber(-0.5, 0);

// zoom stage
let zoom = 0;

// flag to show if mouse is pressed
let dragging = false;

// helper variables for Julia set line
let firstLinePointSet = false;
let firstLinePoint;
let secondLinePoint;
let loopVariable = 0;
let looper = null;

// helper variable for moving around
let lastPoint;

// c for Julia set creation
let juliaC = new ComplexNumber(0.4, 0.1);

function setupMandelbrot(canvas) {
    // reset color scheme and maximum iteration number
    let radios = document.getElementsByName('colors');
    radios[0].checked = true;
    let slider = document.getElementById('slider');
    slider.value = 30;

    // render
    RenderMandelbrotSet();
    RenderJuliaSet();

    // add event listeners
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mouseup', onMouseUp, false);

    // TODO 1.4c):      Uncomment the following line to enable zooming.

    canvas.addEventListener('DOMMouseScroll', onMouseWheel, false);

}


//////////////////////////////////////
//////////   Event Listeners   ///////
//////////////////////////////////////
function onMouseDown(e) {
    let canvas = document.getElementById("mandelbrot_canvas");
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    y = canvas.height - y;

    if (e.ctrlKey) {
        // choose new c for Julia set creation
        clearInterval(looper);
        juliaC = new ComplexNumberFromCoords(x, y, 'mandelbrot_canvas');
        RenderJuliaSet();
    } else if (e.shiftKey) {
        if (firstLinePointSet == false) {
            firstLinePointSet = true;
            firstLinePoint = [x, y];
            RenderMandelbrotSet();
            clearInterval(looper);
        } else {
            firstLinePointSet = false;
            secondLinePoint = [x, y];
            let c = document.getElementById('mandelbrot_canvas');
            let ctx = c.getContext("2d");
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.moveTo(Math.round(firstLinePoint[0]), canvas.height - Math.round(firstLinePoint[1]));
            ctx.lineTo(Math.round(secondLinePoint[0]), canvas.height - Math.round(secondLinePoint[1]));
            ctx.stroke();
            looper = setInterval(juliaLoop, 20);
            loopVariable = 0;
        }
    } else {
        // TODO 1.4c):      Store the hit point as pixel coordinates and
        //                  start the dragging process. Use the global
        //                  variables dragging (bool) and lastPoint (two
        //                  dimensional vector).
        dragging = true;
        lastPoint = [e.clientX, e.clientY];

    }
}


function juliaLoop() {
    let alpha = 0.5 * Math.sin(loopVariable * 0.05) + 0.5; // oscillating between 0 and 1
    juliaC = new ComplexNumberFromCoords((1 - alpha) * firstLinePoint[0] + alpha * secondLinePoint[0], (1 - alpha) * firstLinePoint[1] + alpha * secondLinePoint[1], 'mandelbrot_canvas');
    RenderJuliaSet();
    loopVariable++;
}


function onMouseMove(e) {
    if (dragging) {
        let canvas = document.getElementById("mandelbrot_canvas");
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        y = canvas.height - y;

        // TODO 1.4c):      Convert both last and current hit point to
        //                  their corresponding complex numbers, compute
        //                  their distance (also as a complex number) and
        //                  shift the plane accordingly. To do so, change
        //                  the global variable center which is used to
        //                  compute the complex number corresponding to a pixel.
        // ComplexNumberFromCoords(x, y, 'mandelbrot_canvas');
        let lastHit = new ComplexNumberFromCoords(lastPoint[0] - rect.left, canvas.height - (lastPoint[1] - rect.top), 'mandelbrot_canvas');
        let currentHit = new ComplexNumberFromCoords(x, y, 'mandelbrot_canvas');
        let diff = sub(lastHit, currentHit);
        lastPoint = [e.clientX, e.clientY]

        center = add(center, diff);



        // rerender image
        RenderMandelbrotSet();
    }
}

function onMouseUp(e) {
    // TODO 1.4c):      Prevent dragging of the plane once the mouse is
    //                  not pressed anymore.
    dragging = false;


}

function onMouseWheel(e) {
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    zoom = zoom + delta;

    // render
    RenderMandelbrotSet();

    // do not scroll the page
    e.preventDefault();
}

function onChangeMaxIter(value) {
    max_iter = value;

    // render
    RenderMandelbrotSet();
    RenderJuliaSet();
}

function onChangeColorScheme() {
    // render
    RenderMandelbrotSet();
    RenderJuliaSet();
}
