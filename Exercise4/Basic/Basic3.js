
/////////////////////////
////////   4.3   ////////
/////////////////////////

/**
 * @param {number} index - linearized image index 
 * @param {number[][]} images - array of circle images
 * @param {number[]} alphas - respective alpha values
 * @returns {number[]} - triple [r,g,b] of resulting color, each in range [0,255]
 */
 function doAlphaBlending(index, images, alphas) {
    // TODO 4.3:    Compute the blended color (as an array of 3 values
    //              in the interval [0, 255]) for one pixel
    //              of the resulting image. "images" is the array
    //              of circle images from left to right, "alphas"
    //              contains the respective alpha values. "index"
    //              is the linearized index for the images, so for
    //              example with images[2][index + 1] you can address
    //              the green color channel of the current pixel 
    //              in the third image.

    // 1. Set up a color as a return value, and initialize it with the 
    //    desired background color.
    let color = [255, 255, 255];
    // 2. Loop over the four circle images in the correct order to blend
    //    them one after another.
    for (let i = 0; i<images.length; i++) {
        // 3. Compute the resulting alpha value for the current pixel.
        //    If it is a background pixel of the current image (denoted
        //    with a zero alpha channel value), it should not contribute to the
        //    resulting image. Otherwise, it should contribute with the 
        //    alpha value given through the sliders.
        let alpha = 0;
        if (images[i][index+3] != 0) {
            alpha = alphas[i];
        }
        // 4. Compute the resulting color using alpha blending in all
        //    three color channels.
        for (let j=0; j<3; j++) {
            color[j] = (1-alpha)*color[j] + alpha*images[i][index+j];
        }
    }
    // 5. Return the resulting color. Replace the following dummy line.
    return color;
}


function Basic3(canvas) {
    let alphas = [0.5, 0.5, 0.5, 0.5];

    // setup default values and event listeners
    let sliders = document.getElementsByName("alpha");
    for (let slider of sliders) {
        slider.addEventListener("change",onChangeAlpha);
        slider.value = 0.5;
    }
    let srcImages = document.getElementsByName("srcImage");
    for (let img of srcImages) {
        img.addEventListener("drop",drop);
        img.addEventListener("dragover",allowDrop);
        img.children[0].addEventListener("dragstart",drag);
    }

    // render
    render();

    function render() {
        let context = canvas.getContext("2d");
        let img = context.createImageData(canvas.width, canvas.height);

        let images = [getImageInContainer("div0"),
                      getImageInContainer("div1"),
                      getImageInContainer("div2"),
                      getImageInContainer("div3")];

        // walk over the canvas image and set the blended color for each pixel
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                // compute the linearized index for the image data array
                let i = 4 * (x + canvas.width * y);
                // compute the blended color using the index, the four circle images and the alpha values
                let color = doAlphaBlending(i, images, alphas);
                // set the color accordingly, alpha value is always 255
                img.data[i] = color[0];
                img.data[i + 1] = color[1];
                img.data[i + 2] = color[2];
                img.data[i + 3] = 255;
            }
        }

        context.putImageData(img, 0, 0);
    }

    function getImageInContainer(container) {
        let image = document.getElementById(container).children[0];
        let c = document.createElement('canvas');
        c.width = canvas.width;
        c.height = canvas.height;
        canvas.getContext('2d').clearRect(0, 0, c.width, c.height);
        canvas.getContext('2d').drawImage(image, 0, 0, c.width, c.height);
        let data = canvas.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        return data;
    }


    //////////////////////////
    ///// Event Listener /////
    //////////////////////////

    /**
     * @param {string} id - id ending in a single digit decimal number
     * @returns {number} single digit decimal number
     */
    function getIndex(id){ return -(-id[id.length-1]);  }

    function onChangeAlpha() {
        // expecting id "alpha0" to "alpha3"
        alphas[getIndex(this.id)] = this.value;
        render();
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev) {
        ev.dataTransfer.setData("src", ev.target.id);
    }

    function drop(ev) {
        ev.preventDefault();
        let id = ev.dataTransfer.getData("src");

        let src = document.getElementById( id );
        let srcParent = src.parentNode;
        let tgt = ev.currentTarget.firstElementChild;

        // expecting id "div0" to "div4"
        let a = getIndex(srcParent.id);
        let b = getIndex(tgt.parentNode.id);

        let sliders = document.getElementsByName("alpha");
        let tmp = alphas[a];
        alphas[a] = alphas[b];
        sliders[a].value = sliders[b].value;
        alphas[b] = tmp;
        sliders[b].value = tmp;

        ev.currentTarget.replaceChild(src, tgt);
        srcParent.appendChild(tgt);

        render();
    }
}
