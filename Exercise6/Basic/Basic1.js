/////////////////////////////
////////   Helpers   ////////
/////////////////////////////


/**
 * Converts a color given in float range [0,1] to the integer range [0,255]
 * @param {number[]} rgb_float - three float color values [r,g,b] in the range [0,1]
 * @returns {number[]} - three integer color values [r,g,b] in the range [0,255]
 */
 function floatToColor(rgb_float) {
    return [Math.max(Math.min(Math.floor(rgb_float[0] * 255.0), 255), 0),
            Math.max(Math.min(Math.floor(rgb_float[1] * 255.0), 255), 0),
            Math.max(Math.min(Math.floor(rgb_float[2] * 255.0), 255), 0)];
}

/**
 * Set current stroke color of context to the given color.
 * @param {object} context - canvas 2D context
 * @param {number[]} rgb_float - three float color values in the range [0,1]
 */
function setStrokeStyle(context, rgb_float) {
    let c = floatToColor(rgb_float);
    context.strokeStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

/**
 * Set current fill color of context to the given color.
 * @param {object} context - canvas 2D context
 * @param {number[]} rgb_float - three float color values in the range [0,1]
 */
function setFillStyle(context, rgb_float) {
    let c = floatToColor(rgb_float);
    context.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

function arrow(context, fromx, fromy, tox, toy, text) {
    if (fromx == tox && fromy == toy) return;

    // http://stuff.titus-c.ch/arrow.html
    let headlen = 5;   // length of head in pixels
    let angle = Math.atan2(toy - fromy, tox - fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
    if(text) {
        let d = [tox - fromx, toy - fromy];
        let l = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
        context.fillText(text, tox + 10 / l * d[0], toy + 10 / l * d[1]);
    }
}



///////////////////////////
////////   6.1a)   ////////
///////////////////////////


function Basic1a(canvas) {
    let texture = [ [1.0, 0.0, 0.0], [0.5, 0.5, 0.5], [1.0, 0.0, 1.0],
                    [1.0, 1.0, 0.0], [1.0, 1.0, 1.0], [0.0, 1.0, 0.0],
                    [0.0, 0.0, 1.0], [0.0, 0.0, 0.0], [1.0, 1.0, 0.5],
                    [1.0, 0.0, 0.0], [0.5, 0.5, 0.5], [1.0, 0.0, 1.0]];
    let texDimU = 3; // width of texture
    let texDimV = 4; // height of texture
    Render();

    /**
     * access texture at texCoord in nearest neighbor mode.
     * @param {number[]} texCoord - 2D vector [u,v], each component in the range of [0,1]
     * @returns {number[]} - 3D vector, color value (same range as values in texture)
     */
    function sampleNearestNeighbor(texCoord) {
        // this implements texture clamp mode -> texCoord is in the range of [0,1]
        texCoord[0] = Math.max(Math.min(texCoord[0], 1.0), 0.0);
        texCoord[1] = Math.max(Math.min(texCoord[1], 1.0), 0.0);
        // compute nearest neighbor
        let u = Math.round(texCoord[0] * (texDimU - 1));
        let v = Math.round(texCoord[1] * (texDimV - 1));
        let idx = texDimU * v + u;
        return [texture[idx][0], texture[idx][1], texture[idx][2]];
    }

    /**
     * linearly interpolate two color values
     * @param {number[]} color0 - color value at alpha==0
     * @param {number[]} color1 - color value at alpha==1 
     * @param {number} alpha - interpolation factor in [0,1]
     * @returns {number[]} interpolated color value
     */
    function interpolateColor(color0, color1, alpha) {
        return [(1.0 - alpha) * color0[0] + alpha * color1[0],
                (1.0 - alpha) * color0[1] + alpha * color1[1],
                (1.0 - alpha) * color0[2] + alpha * color1[2]];
    }

    /**
     * access texture at texCoord in bilinear interpolation mode.
     * @param {number[]} texCoord - 2D vector [u,v], each component in the range of [0,1]
     * @returns {number[]} - 3D vector, color value (same range as values in texture)
     */
    function sampleBilinear(texCoord) {
        // texture clamp
        let u = Math.max(Math.min(texCoord[0], 1.0), 0.0) * (texDimU - 1); 
        let v = Math.max(Math.min(texCoord[1], 1.0), 0.0) * (texDimV - 1);

        // TODO 6.1a)   Implement bilinear interpolation of the texture stored in the global variable "texture"
        // 1. Given the current uv coordinates, determine the uv coordinates of the 4 surrounding pixels (use Math.floor / Math.ceil).
        let u1 = Math.floor(u);
        let v1 = Math.floor(v);

        let u2 = Math.ceil(u);
        let v2 = Math.floor(v);

        let u3 = Math.ceil(u);
        let v3 = Math.ceil(v);

        let u4 = Math.floor(u);
        let v4 = Math.ceil(v);

        // 2. Compute the linear indices of the surrounding pixels (e.g. idx = texDimU * v + u;).
        let idx1 = texDimU * v1 + u1;
        let idx2 = texDimU * v2 + u2;
        let idx3 = texDimU * v3 + u3;
        let idx4 = texDimU * v4 + u4;

        // 3. Interpolate linearly in u (use interpolateColor()). 
        //    You can access the color at index 'idx' using texture[idx].
        let m1 = 1 / (u2 - u1);
        let t1 = 1 - (1 / m1) * u2; 
        let color11 = interpolateColor(texture[idx1], texture[idx2], m1 * u + t1);
        let color12 = interpolateColor(texture[idx4], texture[idx3], m1 * u + t1);
   

        // 4. Interpolate linearly in v (use interpolateColor()).
        let m2 = 1 / (v3 - v2);
        let t2 = 1 - (1 / m1) * v3; 
        let color21 = interpolateColor(color11, color12, m2 * v + t2);

        // replace this line
        return color21;
    }

    function Render() {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, 400, 200);
        context.font = "bold 12px Arial";
        context.textAlign = "center";

        let canvasNN = context.createImageData(200, 200);
        for (let y = 0; y < 200; ++y) {
            for (let x = 0; x < 200; ++x) {
                let texCoord = [x / 199.0, y / 199.0];

                let color = sampleNearestNeighbor(texCoord);

                let pixelIdx = 4 * (y * 200 + x);
                canvasNN.data[pixelIdx + 0] = Math.min(Math.max(0, Math.floor(color[0] * 255)), 255);
                canvasNN.data[pixelIdx + 1] = Math.min(Math.max(0, Math.floor(color[1] * 255)), 255);
                canvasNN.data[pixelIdx + 2] = Math.min(Math.max(0, Math.floor(color[2] * 255)), 255);
                canvasNN.data[pixelIdx + 3] = 255;
            }
        }

        let canvasBI = context.createImageData(200, 200);
        for (let y = 0; y < 200; ++y) {
            for (let x = 0; x < 200; ++x) {
                let texCoord = [x / 199.0, y / 199.0];

                let color = sampleBilinear(texCoord);

                let pixelIdx = 4 * (y * 200 + x);
                canvasBI.data[pixelIdx + 0] = Math.min(Math.max(0, Math.floor(color[0] * 255)), 255);
                canvasBI.data[pixelIdx + 1] = Math.min(Math.max(0, Math.floor(color[1] * 255)), 255);
                canvasBI.data[pixelIdx + 2] = Math.min(Math.max(0, Math.floor(color[2] * 255)), 255);
                canvasBI.data[pixelIdx + 3] = 255;
            }
        }

        context.putImageData(canvasNN, 0, 0);
        context.putImageData(canvasBI, 200, 0);

        // draw texel centers
        for (let y = 0; y < texDimV; ++y) {
            for (let x = 0; x < texDimU; ++x) {
                let coord = [200.0 * x / (texDimU-1.0), 200.0 * y / (texDimV-1.0)];
                context.fillStyle = 'rgb(0,0,0)';
                context.beginPath();
                context.arc(coord[0], coord[1], 3, 0, 2 * Math.PI);
                context.fill();
                context.beginPath();
                context.arc(200 + coord[0], coord[1], 3, 0, 2 * Math.PI);
                context.fill();
            }
        }
        context.beginPath();
        context.moveTo(200, 0);
        context.lineTo(200, 200);
        context.stroke();
        context.fillText("Nearest Neighbor", 100, 15);
        context.fillText("Bilinear", 300, 15);
    }
}




///////////////////////////
////////   6.1b)   ////////
///////////////////////////

class MipMap {
    /**
     * @param {number[][]} texture1D - initial texture to build a mipmap pyramid from
     * @param {number} nLevelMax - upper bound for mipmap levels
     */
    constructor(texture1D, nLevelMax) {
        let texDim = texture1D.length;
        this.nLevel = Math.max(Math.min(Math.log2(texDim)+1, nLevelMax), 1);
        this.texLevels = new Array(this.nLevel);

        // copy first level
        this.texLevels[0] = new Array(texDim);
        for (let i = 0; i < texDim; ++i) this.texLevels[0][i] = [texture1D[i][0], texture1D[i][1], texture1D[i][2]];


        // TODO 6.1b)   Compute the MIP map pyramid.
        //              Use a simple boxfilter (same weight for 
        //              both contributors) to compute the
        //              next mipmap level. Assume the dimension of 
        //              the texture to be a power of 2.
        for (let l = 1; l < this.nLevel; ++l) {
            // 1. Compute the texture dimension of level 'l'.
            let newTexDim = texDim / 2;
            // 2. Allocate an array with the right dimension (see code for the 0th level above).
            this.texLevels[l] = new Array(newTexDim);
            // 3. Compute the color values using a boxfilter.
            for (let i = 0; i < texDim; i = i + 2) {
                let color1 = this.texLevels[l-1][i];
                let color2 = this.texLevels[l-1][i + 1];
                console.log(color2);
                let outputColor = [(color1[0] + color2[0]) / 2, (color1[1] + color2[1]) / 2, (color1[2] + color2[2]) / 2];
                this.texLevels[l][i / 2] = outputColor;
            }
            texDim = newTexDim;
        }
    }

    sampleNearestNeighbor(texCoord, level) {
        texCoord = Math.max(Math.min(texCoord, 1.0), 0.0); // this implements texture clamp mode -> texCoord is in the range of [0,1]
        level = Math.max(Math.min(level, this.nLevel - 1), 0);
        if (this.texLevels[level] == undefined) return [0.0, 0.0, 0.0];
        let idx = Math.max(Math.min(Math.round(texCoord * (this.texLevels[level].length) - 0.5), this.texLevels[level].length-1), 0); // nearest neigbor lookup idx
        return [this.texLevels[level][idx][0], this.texLevels[level][idx][1], this.texLevels[level][idx][2]];
    }
}


function Basic1b(canvas) {
    // texture
    let texture1D = [[1.0, 0.0, 0.0], [1.0, 1.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]];

    // mip map
    let mipmap = new MipMap(texture1D, 3);

    //// Scene Description
    
    // eye
    let eye = [4, 4];

    // line surface
    let line_x = 270;
    let line_minZ = 150;
    let line_maxZ = 575;
    let nSamples = texture1D.length;
    
    // image Plane
    let pixel_minX = 50;
    let pixel_maxX = 175;
    let imagePlaneZ = 100;
    let nPixels = 2;


    //// setup interaction
    document.getElementById("nPixels")
        .addEventListener("change", onChangeNPixels);

    function onChangeNPixels() {
        nPixels = this.value;
        Render();
    }
    
    // draw results
    Render();


    /**
     * Projects point2D to the line-surface given by the scene
     * @param {number[]} point2D - pixel coordinate in world space
     * @returns {number[]} [x, z, texCoord]; projected point and its texture coordinate
     */
    function ProjectPointOntoSurfaceLine( point2D ) {
        let z_intersect = eye[1] + (line_x - eye[0]) / (point2D[0] - eye[0]) * (point2D[1] - eye[1]);
        let texCoord = (z_intersect - line_minZ) / (line_maxZ - line_minZ);
        return [line_x, z_intersect, texCoord];
    }

    /**
     * @param {number} i - index of the pixel 
     * @returns {number} mipmap level of the pixel i
     */
    function DetermineMipMapLevelOfPixel( i ) {
        let pixelTop = [pixel_minX + (i / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];
        let pixelBottom = [pixel_minX + ((i + 1.0) / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];

        // pixel projected onto the surface
        let pixelTop_proj = ProjectPointOntoSurfaceLine( pixelTop );
        let pixelBottom_proj = ProjectPointOntoSurfaceLine( pixelBottom );

        // TODO 6.1b)   Determine the appropriate level based on the footprint of the pixel.
        // 1. Use pixelBottom_proj[2] and pixelTop_proj[2] to determine the footprint of the pixel on the texture.
        let footprint = Math.abs(pixelBottom_proj[2] - pixelTop_proj[2]);
        console.log(footprint)

        // 2. Determine the mipmap level where the texel size is larger than the pixel footprint.
        //    Use the mipmap pyramid stored in 'mipmap'.
        //    The texel size of the coarsest level is defined to be 1.

        // replace this line
        let level;
        let texelSize = 1;
        for (let x = 0; x < mipmap.nLevel - 1; x++) texelSize = texelSize / 2;

        for (let x = 0; x < mipmap.nLevel; x++) {
            level = x;
            if (texelSize >= footprint) {
                break;
            }
            texelSize = texelSize * 2;
        }
        return level;
    }


    function Render() {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "italic 12px Georgia";
        context.textAlign = "center";

        // draw texture onto surface
        for (let i = 0; i < nSamples; ++i) {
            let texCoord0 = i / nSamples;
            let texCoord1 = (i + 1.0) / nSamples;
            let p0 = [line_x, Math.floor((1.0 - texCoord0) * line_minZ + texCoord0 * line_maxZ)];
            let p1 = [line_x, Math.floor((1.0 - texCoord1) * line_minZ + texCoord1 * line_maxZ)];

            // draw the line segment
            context.beginPath();
            setStrokeStyle(context, [0, 0, 0]);
            context.lineWidth = 2;
            context.moveTo(p0[1], p0[0]);
            context.lineTo(p1[1], p1[0]);
            context.stroke();

            for (let level = 0; level < mipmap.nLevel; ++level) {
                let color = mipmap.sampleNearestNeighbor(0.5 * (texCoord0 + texCoord1), level);
                setStrokeStyle(context, color);
                // draw the line segment
                context.beginPath();
                context.lineWidth = 4;
                context.moveTo(p0[1], p0[0] + 3 + level * 5);
                context.lineTo(p1[1], p1[0] + 3 + level * 5);
                context.stroke();
            }

            // draw auxiliary line between this and the next line segment
            context.beginPath();
            setStrokeStyle(context, [0, 0, 0]);
            context.lineWidth = 2;
            context.moveTo(p0[1], p0[0] - 6);
            context.lineTo(p0[1], p0[0] + 6);
            if (i + 1 == texture1D.length) {
                context.moveTo(p1[1], p1[0] - 6);
                context.lineTo(p1[1], p1[0] + 6);
            }
            context.stroke();

            context.fillText(texCoord0, p0[1], p0[0] + 28);
            if (i + 1 == texture1D.length) {
                context.fillText(texCoord1, p1[1], p1[0] + 28);
            }
        }
        context.fillText("texture coord.: ", 50, 270 + 28);
        context.fillText("surface", line_maxZ, line_x - 4);

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();

        // draw axis
        arrow(context, eye[1], eye[0], eye[1] + 150, eye[0]);
        arrow(context, eye[1], eye[0], eye[1], eye[0] + 150);
        context.fillText("X", eye[1] + 11, eye[0] + 150);
        context.fillText("Z", eye[1] + 150, eye[0] + 14);

        // image plane
        context.fillStyle = 'rgb(0,0,0)';
        context.lineWidth = 1;
        context.fillText("image plane", imagePlaneZ, 210);
        context.strokeStyle = 'rgb(100,100,100)';
        context.beginPath();
        context.setLineDash([1, 1]);
        context.moveTo(imagePlaneZ, eye[0]);
        context.lineTo(imagePlaneZ, 200);
        context.stroke();
        context.setLineDash([1, 0]);

        // evaluate pixels
        for (let i = 0; i < nPixels; ++i) {
            // pixel coordinates in world space
            let pixelTop = [pixel_minX + (i / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];
            let pixelBottom = [pixel_minX + ((i + 1.0) / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];
            let pixelCenter = [0.5 * (pixelTop[0] + pixelBottom[0]), 0.5 * (pixelTop[1] + pixelBottom[1])];

            // pixel projected onto the surface
            let pixelTop_proj = ProjectPointOntoSurfaceLine( pixelTop );
            let pixelBottom_proj = ProjectPointOntoSurfaceLine( pixelBottom );
            let pixelCenter_proj = ProjectPointOntoSurfaceLine( pixelCenter );

            let level = DetermineMipMapLevelOfPixel( i );

            // read color from the mip map pyramid
            let color = mipmap.sampleNearestNeighbor(pixelCenter_proj[2], level);

            // draw pixel
            context.beginPath();
            setStrokeStyle(context, color);
            context.lineWidth = 4;
            context.moveTo(pixelTop[1], pixelTop[0]);
            context.lineTo(pixelBottom[1], pixelBottom[0]);
            context.stroke();

            // draw projection lines
            context.strokeStyle = 'rgb(200,200,200)';
            context.beginPath();
            context.lineWidth = 1;
            context.setLineDash([3, 3]);
            context.moveTo(eye[1], eye[0]);
            context.lineTo(pixelTop_proj[1], pixelTop_proj[0]);
            context.moveTo(eye[1], eye[0]);
            context.lineTo(pixelBottom_proj[1], pixelBottom_proj[0]);
            context.stroke();
            context.beginPath();
            context.strokeStyle = 'rgb(0,0,0)';
            context.moveTo(eye[1], eye[0]);
            context.lineTo(pixelCenter_proj[1], pixelCenter_proj[0]);
            context.stroke();
            context.setLineDash([1, 0]);

            // draw auxiliary line between this and the next line segment
            context.beginPath();
            setStrokeStyle(context, [0, 0, 0]);
            context.lineWidth = 2;
            context.moveTo(pixelTop[1] - 6, pixelTop[0]);
            context.lineTo(pixelTop[1] + 6, pixelTop[0]);
            context.moveTo(pixelBottom[1] - 6, pixelBottom[0]);
            context.lineTo(pixelBottom[1] + 6, pixelBottom[0]);
            context.stroke();
        }
        context.lineWidth = 1;
    }
}
