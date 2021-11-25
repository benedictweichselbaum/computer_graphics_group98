
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

/**
 * Compute the normals for each edge of a polygon.
 * where edge[0] == polygon[0] -> polygon[1], edge[1] == polygon[1] -> polygon[2], ... 
 * @param {number[][]} polygon - array of 2D points representing a polygon
 * @returns {number[][]} - array of 2D vectors representing the normals of the corresponding polygon edges 
 */
function computeNormals(polygon) {
    let nVertices = polygon.length;
    let normals = new Array(nVertices);
    for (let i = 0; i < nVertices; ++i) normals[i] = [0.0, 0.0];

    for (let e = 0; e < nVertices; ++e) {
        let i = e;
        let j = e + 1;
        if (j == nVertices) j = 0;
        let dir = [polygon[j][0] - polygon[i][0], polygon[j][1] - polygon[i][1]];
        let l = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
        if (l != 0.0) {
            let edgeNormal = [-dir[1] / l, dir[0] / l];
            normals[i][0] += edgeNormal[0];
            normals[i][1] += edgeNormal[1];
            normals[j][0] += edgeNormal[0];
            normals[j][1] += edgeNormal[1];
        }
    }

    for (let i = 0; i < nVertices; ++i) {
        let n = [normals[i][0], normals[i][1]];
        let l = Math.sqrt(n[0] * n[0] + n[1] * n[1]);
        if (l != 0.0) {
            normals[i][0] = n[0] / l;
            normals[i][1] = n[1] / l;
        }
    }
    return normals;
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
    if (text) {
        let d = [tox - fromx, toy - fromy];
        let l = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
        context.fillText(text, tox + 10 / l * d[0], toy + 10 / l * d[1]);
    }
}


///////////////////////////
////////   5.1a)   ////////
///////////////////////////

/**
 * @param {Object} context - Canvas 2D Context
 * @param {vec2} point - 2D surface point that should receive lighting
 * @param {vec2} normal - 2D surface normal
 * @param {vec2} eye - 2D eye position
 * @param {vec2} pointLight - 2D point light position
 * @param {vec3} albedo - base color
 * @param {boolean} showVectors 
 * @returns {vec3} - lighting color
 */
function PhongLighting(context, point, normal, eye, pointLight, albedo, showVectors) {

    // TODO 5.1a) Implement Phong lighting - follow the stepwise instructions below:

    // 1. Compute view vector v, light vector l and the reflected light vector r (all pointing away from the point and normalized!).
    //    Note: To help you implementing this task, we draw the computed vectors for the user specified sample point.
    //    Replace the following dummy lines:
    let v = [0, 0];
    vec2.normalize(v, vec2.fromValues((eye[0] - point[0]), (eye[1] - point[1])));
    let l = [0, 0];
    vec2.normalize(l, vec2.fromValues(- (point[0] - pointLight[0]), - (point[1] - pointLight[1])));
    let r = vec2.fromValues(0, 0);

    let dn = 2 * vec2.dot(normal, l);

    vec2.normalize(r, vec2.fromValues(-(l[0] - (normal[0] * dn)), -(l[1] - (normal[1] * dn))));

    // 2. Compute the ambient part, use 0.1 * albedo as ambient material property.
    //    You can check your results by setting "color" (defined below) to only ambient part - 
    //    this should give you constant dark green.

    let l_amb = vec3.fromValues(albedo[0] * 0.1, albedo[1] * 0.1, albedo[2] * 0.1);

    // 3. Compute the diffuse part, use 0.5 * albedo as diffuse material property.
    //    You can check your results by setting "color" (defined below) to only diffuse part - 
    //    this should give you a color which gets lighter the more the plane's normal coincides with the direction to the light.


    let cos_theta = vec2.dot(normal, l);
    let l_diff = vec3.fromValues(albedo[0] * 0.5 * cos_theta, albedo[1] * 0.5 * cos_theta, albedo[2] * 0.5 * cos_theta);

    // 4. Compute the specular part, assume an attenuated white specular material property (0.4 * [1.0, 1.0, 1.0]).
    //    Use the defined shiny factor.
    //    You can check your results by setting "color" (defined below) to only diffuse part - 
    //    this should give you a grey spotlight where view direction and reflection vector coincide.
    let shiny = 30.0;

    let cos_shiny = vec2.dot(r, v);

    let l_spec = vec3.fromValues(0.4 * Math.pow(cos_shiny, shiny), 0.4 * Math.pow(cos_shiny, shiny), 0.4 * Math.pow(cos_shiny, shiny));

    // 5. Add ambient, diffuse and specular color.
    //    Store the result in the variable color - replace the following dummy line:
    let color = vec3.create();
    vec3.add(color, l_amb, l_diff);
    vec3.add(color, color, l_spec);



    if (showVectors) {
        // draw vectors
        let vecScale = 100;
        context.strokeStyle = 'rgb(0,0,0)';
        arrow(context, point[1], point[0], point[1] + vecScale * normal[1], point[0] + vecScale * normal[0], "n");
        arrow(context, point[1], point[0], point[1] + vecScale * v[1], point[0] + vecScale * v[0], "v");
        arrow(context, point[1], point[0], point[1] + vecScale * l[1], point[0] + vecScale * l[0], "l");
        arrow(context, point[1], point[0], point[1] + vecScale * r[1], point[0] + vecScale * r[0], "r");
    }

    return color;
}

function Basic1_1(canvas) {
    let nSamples = 5;
    let alpha = 0.25;

    // reset the slider and the checkboxes
    let slider = document.getElementById('nSamples');
    slider.addEventListener('change',onChangeNSamples);
    slider.value = 5;

    canvas.addEventListener('mousedown', onMouseDown, false);
    Render();
    
    // Interaction

    function onChangeNSamples() {
        nSamples = this.value;
        Render();
    }

    function onMouseDown(e) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        alpha = x / rect.width;
        Render();
    }

    // Rendering

    function Render() {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "italic 12px Georgia";
        context.textAlign = "center";

        // light source
        let eye = [40, 20];

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("eye", eye[1], eye[0] + 20);
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();

        // light source
        let pointLight = [20, 580];

        // draw light source
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("light", pointLight[1], pointLight[0] + 20);
        context.arc(pointLight[1], pointLight[0], 4, 0, 2 * Math.PI);
        context.fill();

        // line
        let line = [[270, 0], [270, 600]];
        let albedo = [0, 1, 0];

        // draw surface (line)
        setStrokeStyle(context, [0.5, 0.5, 0.5]);
        context.beginPath();
        context.lineWidth = 4;
        context.moveTo(line[0][1], line[0][0]);
        context.lineTo(line[1][1], line[1][0]);
        context.stroke();
        context.fillText("surface", line[0][1] + 50, line[0][0] + 20);
        context.lineWidth = 1;

        for (let i = 0; i < nSamples; ++i) {
            let _alpha = i / (nSamples - 1.0);
            // sampled point on the surface
            let point = [(1.0 - _alpha) * line[0][0] + _alpha * line[1][0], (1.0 - _alpha) * line[0][1] + _alpha * line[1][1]];
            let normal = [-1.0, 0.0];

            // compute light - Phong Lighting
            let color = PhongLighting(context, point, normal, eye, pointLight, albedo, false);

            // draw point
            setFillStyle(context, color)
            context.beginPath();
            context.arc(point[1], point[0], 4, 0, 2 * Math.PI);
            context.fill();
        }

        // current point on the surface
        let point = [(1.0 - alpha) * line[0][0] + alpha * line[1][0], (1.0 - alpha) * line[0][1] + alpha * line[1][1]];
        let normal = [-1.0, 0.0];

        // compute light - Phong Lighting
        let color = PhongLighting(context, point, normal, eye, pointLight, albedo, true);

        // draw point
        setFillStyle(context, color)
        context.beginPath();
        context.fillText("p", point[1], point[0] + 20);
        context.arc(point[1], point[0], 6, 0, 2 * Math.PI);
        context.fill();
    }
}


///////////////////////////
////////   5.1b)   ////////
///////////////////////////

function Basic1_2(canvas) {
    let nLineSegments = 5;
    let amplitude = 50;

    // reset the slider and the checkboxes
    let slider1 = document.getElementById('nLineSegments2_2');
    slider1.addEventListener("change",onChangeNLineSegments);
    slider1.value = 5;
    let slider2 = document.getElementById('amplitude2_2');
    slider2.addEventListener("change",onChangeAmplitude);
    slider2.value = 50;

    Render();

    // Interaction

    function onChangeNLineSegments() {
        nLineSegments = this.value;
        Render();
    }
    function onChangeAmplitude() {
        amplitude = this.value;
        Render();
    }

    // Rendering

    function Render() {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "italic 12px Georgia";
        context.textAlign = "center";

        // light source
        let eye = [40, 20];

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("eye", eye[1], eye[0] + 20);
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();

        // light source
        let pointLight = [20, 580];

        // draw light source
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("light", pointLight[1], pointLight[0] + 20);
        context.arc(pointLight[1], pointLight[0], 4, 0, 2 * Math.PI);
        context.fill();

        // line segments
        let p0 = 0;
        let p1 = 600;
        let lineSegments = new Array(nLineSegments);
        for (let i = 0; i < nLineSegments; ++i) {
            let _alpha = i / (nLineSegments);
            let start = [270 - amplitude * Math.sin(_alpha * Math.PI), Math.floor((1.0 - _alpha) * p0 + _alpha * p1)];
            _alpha = (i + 1.0) / (nLineSegments);
            let end = [270 - amplitude * Math.sin(_alpha * Math.PI), Math.ceil((1.0 - _alpha) * p0 + _alpha * p1)];
            lineSegments[i] = [[start[0], start[1]], [end[0], end[1]]];
        }
        let albedo = [0, 1, 0];

        // draw surface (line segments) using flat shading
        for (let i = 0; i < nLineSegments; ++i) {
            // TODO 5.1b) Implement Flat Shading of the line segments - follow the stepwise instructions below:

            // 1. Compute representor of the primitive (-> midpoint on the line segment).
            let representor = vec2.fromValues(
                (lineSegments[i][1][0] + lineSegments[i][0][0]) / 2,
                (lineSegments[i][1][1] + lineSegments[i][0][1]) / 2
            );

            // 2. Compute the normal of the line segment.
            let normal = vec2.fromValues(
                -(lineSegments[i][1][1] - lineSegments[i][0][1]), lineSegments[i][1][0] - lineSegments[i][0][0]
            );
            vec2.normalize(normal, normal);

            // 3. Use the function PhongLighting that you implemented in the previous assignment to evaluate the color.
            let color = PhongLighting(context, representor, normal, eye, pointLight, albedo, false);

            // 4. Set the stroke color (use setStrokeStyle() defined in this .js-file).
            setStrokeStyle(context, color);



            // draw the line segment
            context.beginPath();
            context.lineWidth = 8;
            context.moveTo(lineSegments[i][0][1], lineSegments[i][0][0]);
            context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0]);
            context.stroke();

            if (i < nLineSegments - 1) {
                // draw auxiliary line between this and the next line segment
                context.beginPath();
                setStrokeStyle(context, [0, 0, 0]);
                context.lineWidth = 1;
                context.moveTo(lineSegments[i][1][1], lineSegments[i][1][0] + 4);
                context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0] + 14);
                context.stroke();
            }
        }
        context.fillText("surface", p0[1] + 50, p0[0] + 20);
        context.lineWidth = 1;
    }
}



///////////////////////////
////////   5.1c)   ////////
///////////////////////////

function Basic1_3(canvas) {
    let nLineSegments = 5;
    let amplitude = 50;
    
    // reset the slider and the checkboxes
    let slider1 = document.getElementById('nLineSegments2_3');
    slider1.addEventListener('change',onChangeNLineSegments);
    slider1.value = 5;
    let slider2 = document.getElementById('amplitude2_3');
    slider2.addEventListener('change',onChangeAmplitude);
    slider2.value = 50;

    Render();

    // Interaction
        
    function onChangeNLineSegments() {
        nLineSegments = this.value;
        Render();
    }
    function onChangeAmplitude() {
        amplitude = this.value;
        Render();
    }
    
    // Rendering

    function Render() {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "italic 12px Georgia";
        context.textAlign = "center";

        // light source
        let eye = [40, 20];

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("eye", eye[1], eye[0] + 20);
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();

        // light source
        let pointLight = [20, 580];

        // draw light source
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("light", pointLight[1], pointLight[0] + 20);
        context.arc(pointLight[1], pointLight[0], 4, 0, 2 * Math.PI);
        context.fill();

        // line segments
        let p0 = 0;
        let p1 = 600;
        let lineSegments = new Array(nLineSegments);
        for (let i = 0; i < nLineSegments; ++i) {
            let _alpha = i / (nLineSegments);
            let start = [270 - amplitude * Math.sin(_alpha * Math.PI), Math.floor((1.0 - _alpha) * p0 + _alpha * p1)];
            _alpha = (i + 1.0) / (nLineSegments);
            let end = [270 - amplitude * Math.sin(_alpha * Math.PI), Math.ceil((1.0 - _alpha) * p0 + _alpha * p1)];
            lineSegments[i] = [[start[0], start[1]], [end[0], end[1]]];
        }
        let albedo = [0, 1, 0];

        // draw surface (line segments) using flat shading
        for (let i = 0; i < nLineSegments; ++i) {
            // TODO 5.1c) Implement Gouraud Shading of the line segments - follow the stepwise instructions below:

            let start = lineSegments[i][0];
            let end = lineSegments[i][1];
            // 1. Compute vertex normals by interpolating between normals of adjacent line segments (weighted by line segment length!). Take care of border cases.
            let normal1a = vec2.fromValues(0, 0);
            let normal1b = vec2.fromValues(0, 0);
            let lineLength1 = 1;
            let normal2a = vec2.fromValues(0, 0);
            let normal2b = vec2.fromValues(0, 0);
            let lineLength2 = Math.sqrt((end[0] - start[0])*(end[0] - start[0]) + (end[1] - start[1])*(end[1] - start[1]));
            let lineLength3 = 1;
            if (i > 0) {
                let x = lineSegments[i-1][0];
                let y = lineSegments[i-1][1];
                normal1a = vec2.fromValues(x[1] - y[1], y[0] - x[0]);
                vec2.normalize(normal1a, normal1a);
                lineLength1 = Math.sqrt((x[0] - y[0])*(x[0] - y[0]) + (x[1] - y[1])*(x[1] - y[1]));
            }
            normal1b = vec2.fromValues(start[1] - end[1], end[0] - start[0]);
            vec2.normalize(normal1b, normal1b);
            let normal1 = vec2.create();
            vec2.scale(normal1a, normal1a, lineLength1);
            vec2.scale(normal1b, normal1b, lineLength2);
            vec2.add(normal1, normal1a, normal1b);
            vec2.normalize(normal1, normal1);

            if (i < nLineSegments - 1) {
                let x = lineSegments[i+1][0];
                let y = lineSegments[i+1][1];
                normal2b = vec2.fromValues(x[1] - y[1], y[0] - x[0]);
                vec2.normalize(normal2b, normal2b);
                lineLength3 = Math.sqrt((x[0] - y[0])*(x[0] - y[0]) + (x[1] - y[1])*(x[1] - y[1]));
            }
            vec2.copy(normal2a, normal1b);
            vec2.normalize(normal2a, normal2a);
            let normal2 = vec2.create();
            vec2.scale(normal2a, normal2a, lineLength2);
            vec2.scale(normal2b, normal2b, lineLength3);
            vec2.add(normal2, normal2a, normal2b);
            vec2.normalize(normal2, normal2);


            // 2. Evaluate the color at the vertices using the PhongLighting function.
            let color1 = PhongLighting(context, start, normal1, eye, pointLight, albedo, false);
            let color2 = PhongLighting(context, end, normal2, eye, pointLight, albedo, false);


            // 3. Use the linear gradient stroke style of the context to linearly interpolate the vertex colors over the primitive (https://www.w3schools.com/TAgs/canvas_createlineargradient.asp).
            //    The color triples can be scaled from [0,1] to [0,255] using the function floatToColor().
            //    The start and end points of the line segments are stored in [y,x] order concerning the canvas, remember when using createLinearGradient()!

            function to_hex(number) {
                let hex_str = number.toString(16);
                if  (hex_str.length == 1) {
                    return '0' + hex_str;
                } else {
                    return hex_str;
                }
            }

            function to_hex_color(rgb_color) {
                return '#' + to_hex(rgb_color[0]) + to_hex(rgb_color[1]) + to_hex(rgb_color[2]);
            }
            let gradient = context.createLinearGradient(end[1], end[0], start[1], start[0]);
            let color_rgb1 = floatToColor(color1)
            let color1_hex = to_hex_color(color_rgb1);
            let color_rgb2 = floatToColor(color2);
            let color2_hex = to_hex_color(color_rgb2);
            gradient.addColorStop(1, color1_hex);
            gradient.addColorStop(0, color2_hex);
            context.strokeStyle = gradient;


            // draw line segment
            context.beginPath();
            context.lineWidth = 8;
            context.moveTo(lineSegments[i][0][1], lineSegments[i][0][0]);
            context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0]);
            context.stroke();

            if (i < nLineSegments - 1) {
                // draw auxiliary line between this and the next line segment
                context.beginPath();
                setStrokeStyle(context, [0, 0, 0]);
                context.lineWidth = 1;
                context.moveTo(lineSegments[i][1][1], lineSegments[i][1][0] + 4);
                context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0] + 14);
                context.stroke();
            }
        }
        context.fillText("surface", p0[1] + 50, p0[0] + 20);
        context.lineWidth = 1;
    }
}

