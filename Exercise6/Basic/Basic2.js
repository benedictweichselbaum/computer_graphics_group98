/////////////////////////////
////////   Helpers   ////////
/////////////////////////////

/**
 * dehomogenize a point
 * @param {vec4} v4 - homogeneous point3D
 * @returns {vec3} dehomogenized point3D
 */
vec3.dehomogenize = function (v4) {
    return vec3.fromValues(v4[0] / v4[3], v4[1] / v4[3], v4[2] / v4[3]);
}

/**
 * computes the midpoint between a and b
 * @param {number[]} a - point with arbitrary dimension
 * @param {number[]} b - point with dimension like a
 * @returns {number[]} component wise center between a and b
 */
function midPoint(a, b) {
    let result = new Array(a.length);
    for (let i = 0; i < a.length; ++i) result[i] = 0.5 * (a[i] + b[i]);
    return result;
}

function Basic2a(canvas) {
    let context = canvas.getContext("2d");
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.font = "bold 12px Georgia";
    context.textAlign = "center";
    context.fillText("a)", 10, 16);

    // triangle - in camera space
    let triangle = [[0.0, 0.0, -1.0], [0.0, 2.0, -3.0], [-2.0, -1.0, -3.0]];

    // projection matrix
    let M = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, -2.0, -1.0, 0.0, 0.0, -3.0, 0.0];

    // TODO 6.2
    // Project triangle (Use the helper functions vec4.transformMat4(out, a, M) and vec3.dehomogenize( v4 ) ).
    // Then render the projected triangle instead of the original triangle!
    let aT = vec4.fromValues(triangle[0][0], triangle[0][1], triangle[0][2], 1);
    vec4.transformMat4(aT, aT, M);
    aT = vec3.dehomogenize(aT);

    let bT = vec4.fromValues(triangle[1][0], triangle[1][1], triangle[1][2], 1);
    vec4.transformMat4(bT, bT, M);
    bT = vec3.dehomogenize(bT);

    let cT = vec4.fromValues(triangle[2][0], triangle[2][1], triangle[2][2], 1);
    vec4.transformMat4(cT, cT, M);
    cT = vec3.dehomogenize(cT);


    // Replace this dummy line!
    drawTriangle(context, canvasWidth, canvasHeight, [aT, bT, cT], ["A'", "B'", "C'"]);
    
    // draw axis
    arrow(context, 15, 285, 15, 255);
    arrow(context, 15, 285, 45, 285);
    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("-Y", 5, 260);
    context.fillText("X", 45, 297);
}


function Basic2b(canvas) {
    let context = canvas.getContext("2d");
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.font = "bold 12px Georgia";
    context.textAlign = "center";
    context.fillText("b)", 10, 16);

    // triangle - in camera space
    let triangle = [[0.0, 0.0, -1.0], [0.0, 2.0, -3.0], [-2.0, -1.0, -3.0]];

    // projection matrix
    let M = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, -2.0, -1.0, 0.0, 0.0, -3.0, 0.0];

    // TODO 6.2
    // 1. Project the triangle.
    let aT = vec4.fromValues(triangle[0][0], triangle[0][1], triangle[0][2], 1);
    vec4.transformMat4(aT, aT, M);
    aT = vec3.dehomogenize(aT);

    let bT = vec4.fromValues(triangle[1][0], triangle[1][1], triangle[1][2], 1);
    vec4.transformMat4(bT, bT, M);
    bT = vec3.dehomogenize(bT);

    let cT = vec4.fromValues(triangle[2][0], triangle[2][1], triangle[2][2], 1);
    vec4.transformMat4(cT, cT, M);
    cT = vec3.dehomogenize(cT);

    let projectedTriangle = [aT, bT, cT];

    // 2. Compute the midpoints of the edges (Use the helper function midPoint defined above!)
    //    and store them in another triangle.
    let innerTriangle = [midPoint(aT, bT), midPoint(aT, cT), midPoint(bT, cT)];

    // 3. Draw the triangles (Leave last argument undefined for inner triangle!).
    drawTriangle(context, canvasWidth, canvasHeight, projectedTriangle, ["A'", "B'", "C'"]);
    drawTriangle(context, canvasWidth, canvasHeight, innerTriangle, undefined);
    // draw axis
    arrow(context, 15, 285, 15, 255);
    arrow(context, 15, 285, 45, 285);
    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("-Y", 5, 260);
    context.fillText("X", 45, 297);
}


function Basic2c(canvas) {
    let context = canvas.getContext("2d");
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.font = "bold 12px Georgia";
    context.textAlign = "center";
    context.fillText("c)", 10, 16);
    // triangle - in camera space
    let triangle = [[0.0, 0.0, -1.0], [0.0, 2.0, -3.0], [-2.0, -1.0, -3.0]];
    let triangleInner = new Array(3);
    for (let i = 0; i < 3; ++i) {
        triangleInner[i] = [0.5 * (triangle[i][0] + triangle[(i + 1) % 3][0]),
                             0.5 * (triangle[i][1] + triangle[(i + 1) % 3][1]),
                             0.5 * (triangle[i][2] + triangle[(i + 1) % 3][2])];
    }
    // projection matrix
    let M = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, -2.0, -1.0, 0.0, 0.0, -3.0, 0.0];
    // TODO 6.2
    // 1. Project the triangle and store it in homogeneous coordinates.
    let aT = vec4.fromValues(triangle[0][0], triangle[0][1], triangle[0][2], 1);
    vec4.transformMat4(aT, aT, M);

    let bT = vec4.fromValues(triangle[1][0], triangle[1][1], triangle[1][2], 1);
    vec4.transformMat4(bT, bT, M);

    let cT = vec4.fromValues(triangle[2][0], triangle[2][1], triangle[2][2], 1);
    vec4.transformMat4(cT, cT, M);

    let projectedHomTriangle = [aT, bT, cT];
    // 2. Compute the mid points, but this time in homogeneous coordinates (Make use of midPoint()!).
    let midTriangle = [midPoint(vec4.fromValues(triangle[0][0], triangle[0][1], triangle[0][2], 1), vec4.fromValues(triangle[1][0], triangle[1][1], triangle[1][2], 1)),
                        midPoint(vec4.fromValues(triangle[0][0], triangle[0][1], triangle[0][2], 1), vec4.fromValues(triangle[2][0], triangle[2][1], triangle[2][2], 1)),
                        midPoint(vec4.fromValues(triangle[1][0], triangle[1][1], triangle[1][2], 1), vec4.fromValues(triangle[2][0], triangle[2][1], triangle[2][2], 1))];

    vec4.transformMat4(midTriangle[0], midTriangle[0], M);
    vec4.transformMat4(midTriangle[1], midTriangle[1], M);
    vec4.transformMat4(midTriangle[2], midTriangle[2], M);
    

    // 3. Dehomogenize the points.
    projectedHomTriangle[0] = vec3.dehomogenize(projectedHomTriangle[0]);
    projectedHomTriangle[1] = vec3.dehomogenize(projectedHomTriangle[1]);
    projectedHomTriangle[2] = vec3.dehomogenize(projectedHomTriangle[2]);

    midTriangle[0] = vec3.dehomogenize(midTriangle[0]);
    midTriangle[1] = vec3.dehomogenize(midTriangle[1]);
    midTriangle[2] = vec3.dehomogenize(midTriangle[2]);
    // 4. Draw the triangles (Leave last argument undefined for inner triangle!).
    drawTriangle(context, canvasWidth, canvasHeight, projectedHomTriangle, ["A'", "B'", "C'"]);
    drawTriangle(context, canvasWidth, canvasHeight, midTriangle, undefined);

    
    // draw axis
    arrow(context, 15, 285, 15, 255);
    arrow(context, 15, 285, 45, 285);
    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("-Y", 5, 260);
    context.fillText("X", 45, 297);
}



/////////////////////////////////////
////////   Drawing Helpers   ////////
/////////////////////////////////////

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

function point(context, x, y, fillStyle, text) {
    if (text == undefined) {
        context.fillStyle = fillStyle;
        context.beginPath();
        context.arc(x, y, 3, 0, 2 * Math.PI);
        context.fill();
    } else {
        let fontTmp = context.font;
        context.font = "bold 12px Georgia";
        context.textAlign = "center";

        context.fillStyle = fillStyle;
        context.beginPath();
        context.arc(x,y, 8, 0, 2 * Math.PI);
        context.fill();

        context.fillStyle = 'rgb(255,255,255)';
        context.fillText(text, x, y + 4);
        context.font = fontTmp;
    }
}

function drawTriangle(context, canvasWidth, canvasHeight, trianglePoints, trianglePointsText) {
    // draw triangle
    context.strokeStyle = 'rgb(0,0,0)';
    context.fillStyle = 'rgb(0,0,0)';
    context.beginPath();
    context.moveTo(canvasWidth * (0.5 - trianglePoints[0][0] / 2.0), canvasHeight * (0.5 - trianglePoints[0][1] / 2.0));
    context.lineTo(canvasWidth * (0.5 - trianglePoints[1][0] / 2.0), canvasHeight * (0.5 - trianglePoints[1][1] / 2.0));
    context.lineTo(canvasWidth * (0.5 - trianglePoints[2][0] / 2.0), canvasHeight * (0.5 - trianglePoints[2][1] / 2.0));
    context.lineTo(canvasWidth * (0.5 - trianglePoints[0][0] / 2.0), canvasHeight * (0.5 - trianglePoints[0][1] / 2.0));
    context.stroke();

    if (trianglePointsText != undefined) {
        point(context, canvasWidth * (0.5 - trianglePoints[0][0] / 2.0), canvasHeight * (0.5 - trianglePoints[0][1] / 2.0), 'rgb(255,0,0)', trianglePointsText[0]);
        point(context, canvasWidth * (0.5 - trianglePoints[1][0] / 2.0), canvasHeight * (0.5 - trianglePoints[1][1] / 2.0), 'rgb(0,255,0)', trianglePointsText[1]);
        point(context, canvasWidth * (0.5 - trianglePoints[2][0] / 2.0), canvasHeight * (0.5 - trianglePoints[2][1] / 2.0), 'rgb(0,0,255)', trianglePointsText[2]);
    } else {
        context.fillStyle = 'rgb(100,100,100)';
        context.fill();
    }
}