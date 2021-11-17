

function arrow(context, fromx, fromy, tox, toy) {
    // http://stuff.titus-c.ch/arrow.html
    let headlen = 10;   // length of head in pixels
    let angle = Math.atan2(toy - fromy, tox - fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
}

///////////////////////////
////////   4.1a)   ////////
///////////////////////////

function Basic1_1(canvas) {
    
    /**
     * @param {number[]} point2D - 2D point [x,z], point to be projected
     * @returns {number} - projected x-coordinate
     */
    function OrthogonalProjection2D(point2D) {
        // TODO 4.1a)   Implement the orthogonal projection.
        //              The camera orientation is aligned with 
        //              the global coordinate system, the view 
        //              direction is the z axis. Note that point2D[0] 
        //              is the x component and point2D[1] is the z 
        //              component (Hint: have a look at the bottom left 
        //              of the output image, there you will see the x-z axis).
        return point2D[0];
    }

    ////////////////////////////////////
    // show results of the projection //
    ////////////////////////////////////

    let context = canvas.getContext("2d");
    context.clearRect(0, 0, 600, 300);
    context.font = "bold 12px Georgia";
    context.textAlign = "center";

    // polygon - in world space
    let color = [0, 255, 0];
    let polygon = [[100, 400], [100, 500], [200, 500], [200, 400]];

    // draw polygon
    context.strokeStyle = 'rgb(0,0,0)';
    context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    context.beginPath();
    context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
    for (let i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
    context.fill();
    context.stroke();

    // draw image plane
    let imagePlane = 150;
    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("image plane", imagePlane, 290);
    context.strokeStyle = 'rgb(100,100,100)';
    context.beginPath();
    context.moveTo(imagePlane, 0);
    context.lineTo(imagePlane, 270);
    context.stroke();

    // project polygon onto the image plane
    let polygonProjected = new Array();
    for (let i = 0; i < polygon.length; ++i) polygonProjected.push(OrthogonalProjection2D(polygon[i]));

    // draw projected polygon
    context.strokeStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    context.beginPath();
    context.moveTo(imagePlane, polygonProjected[polygonProjected.length - 1]);
    for (let i = 0; i < polygonProjected.length; ++i) context.lineTo(imagePlane, polygonProjected[i]);
    context.stroke();

    // draw projection lines
    context.setLineDash([3, 3]);
    context.strokeStyle = 'rgb(100,100,100)';
    context.beginPath();
    for (let i = 0; i < polygonProjected.length; ++i) {
        context.moveTo(polygon[i][1], polygon[i][0]);
        context.lineTo(imagePlane, polygonProjected[i]);
    }
    context.stroke();
    context.setLineDash([1, 0]);

    // draw axis
    arrow(context, 15, 285, 15, 255);
    arrow(context, 15, 285, 45, 285);
    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("X", 5, 260);
    context.fillText("Z", 45, 297);    
}

///////////////////////////
////////   4.1b)   ////////
///////////////////////////

function Basic1_2(canvas) {

    /**
     * @param {number[]} eye - 2D point [x,z], center of camera
     * @param {number} imagePlane - z value of image plane
     * @param {number[]} point2D - 2D point [x,z], point to be projected
     * @returns {number} - projected x-coordinate
     */
    function PerspectiveProjection2D(eye, imagePlane, point2D) {
        
        // TODO 4.1b)   Implement the perspective projection assuming 
        //              the center of the camera lies in (eye[0], eye[1]).
        //              The camera orientation is aligned with the global 
        //              coordinate system. Note that eye, point2D, imagePlane 
        //              are all in world space. You first have to transform 
        //              everything to camera space. The variable 'imagePlane'
        //              gives you the z value of the image plane (You also have 
        //              to transform it to camera space coordinates.).
        let point2D_camera_system = [point2D[0] - eye[0], point2D[1] - eye[1]];
        return imagePlane * point2D_camera_system[0] / point2D_camera_system[1];
        
    }

    ////////////////////////////////////
    // show results of the projection //
    ////////////////////////////////////

    let context = canvas.getContext("2d");
    context.clearRect(0, 0, 600, 300);
    context.font = "bold 12px Georgia";
    context.textAlign = "center";

    // polygon - in world space
    let color = [0, 255, 0];
    let polygon = [[100, 400], [100, 500], [200, 500], [200, 400]];

    // draw polygon
    context.strokeStyle = 'rgb(0,0,0)';
    context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    context.beginPath();
    context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
    for (let i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
    context.fill();
    context.stroke();

    // draw image plane
    let eye = [150, 10];
    let imagePlane = 150 + 50;
    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("image plane", imagePlane, 290);
    context.strokeStyle = 'rgb(100,100,100)';
    context.beginPath();
    context.moveTo(imagePlane, 0);
    context.lineTo(imagePlane, 270);
    context.stroke();
    context.beginPath();
    context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
    context.fill();

    // project polygon onto the image plane
    let polygonProjected = new Array();
    for (let i = 0; i < polygon.length; ++i) polygonProjected.push(PerspectiveProjection2D(eye, imagePlane, polygon[i]));

    // draw projected polygon
    context.strokeStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
    context.beginPath();
    context.moveTo(imagePlane, polygonProjected[polygonProjected.length - 1] + eye[0]);
    for (let i = 0; i < polygonProjected.length; ++i) context.lineTo(imagePlane, polygonProjected[i] + eye[0]);
    context.stroke();

    // draw projection lines
    context.setLineDash([3, 3]);
    context.strokeStyle = 'rgb(100,100,100)';
    context.beginPath();
    for (let i = 0; i < polygonProjected.length; ++i) {
        context.moveTo(polygon[i][1], polygon[i][0]);
        context.lineTo(imagePlane, polygonProjected[i] + eye[0]);
    }
    context.stroke();
    context.setLineDash([1, 0]);

    // draw axis
    arrow(context, eye[1], eye[0], eye[1], eye[0] - 30);
    arrow(context, eye[1], eye[0], eye[1] + 30, eye[0]);
    context.fillStyle = 'rgb(0,0,0)';
    context.fillText("X", eye[1], eye[0] - 35);
    context.fillText("Z", eye[1] + 35, eye[0]);
}


///////////////////////////
////////   4.1c)   ////////
///////////////////////////

/**
 * compute a perspective transformation
 * that perspectively maps the 2D space onto a 1D line
 * @param {number[]} out - resulting 3x3 Matrix, column-major, 
 * @param {number} fovy
 * @param {number} near 
 * @param {number} far 
 * @returns out
 */
mat3.perspective = function (out, fovy, near, far) {
    // TODO 4.1c)   Set up the projection matrix, parameterized 
    //              with the variables fovy, near and far.
    //              Use the OpenGL style to set up the matrix 
    //              (as in the lecture), i.e. the camera looks 
    //              into the negative view direction.
    //              Use column-major order!
    let r = near * Math.tan(fovy / 2);
    let l = -r;

    out[0] = 2 * near / (r-l);
    out[1] = 0;
    out[2] = 0;

    out[3] = (r+l) / (r-l);
    out[4] = -(far+near) / (far-near);
    out[5] = -1;

    out[6] = 0;
    out[7] = -2*far*near / (far-near);
    out[8] = 0;

    return out;
    
};

mat3.getCameraMatrix = function (out, u, w, e) {
    out[0] = u[0];
    out[1] = w[0];
    out[2] = 0;

    out[3] = u[1];
    out[4] = w[1];
    out[5] = 0;

    out[6] = -u[0]*e[0] - u[1]*e[1];
    out[7] = -w[0]*e[0] - w[1]*e[1];
    out[8] = 1;

    return out
};


mat3.getCameraMatrixInverse = function (out, u, w, e) {
    out[0] = u[0];
    out[1] = u[1];
    out[2] = 0;

    out[3] = w[0];
    out[4] = w[1];
    out[5] = 0;

    out[6] = e[0];
    out[7] = e[1];
    out[8] = 1;

    return out

};


/**
 * a camera rendering a 2D scene to a 1D line
 */
class Camera {
    constructor(){
        this.eye = [150, 10];
        this.fovy = 30.0 / 180.0 * Math.PI;
        this.near = 150;
        this.far = 500;
        this.lookAtPoint = [150, 450];

        // the cameraMatrix transforms from world space to camera space
        this.cameraMatrix = mat3.create();
        // the cameraMatrixInverse transforms from camera space to world space
        this.cameraMatrixInverse = mat3.create();
        // projection matrix
        this.projectionMatrix = mat3.create();

        // setup matrices
        this.update();
    }

    lookAt(point2D) {
        this.lookAtPoint = [point2D[0], point2D[1]];
        this.update();
    }

    setEye(eye2D) {
        this.eye = [eye2D[0], eye2D[1]];
        this.update();
    }

    /**
     * setup matrices
     */
    update() {
        // note: opengl looks into the negative viewDir!
        let negViewDir = vec2.create();
        negViewDir[0] = this.eye[0] - this.lookAtPoint[0];
        negViewDir[1] = this.eye[1] - this.lookAtPoint[1];
        vec2.normalize(negViewDir, negViewDir);

        // TODO 4.1c)   Set up the camera matrix and the inverse camera matrix.
        //              The cameraMatrix transforms from world space to camera space.
        //              The cameraMatrixInverse transforms from camera space to world space.
        //              You can use gl-matrix.js where necessary. Use column-major order!
        //              It can be handy to compute the inverted matrix first.
        const u = [negViewDir[1], -negViewDir[0]];
        mat3.getCameraMatrix(this.cameraMatrix, u, negViewDir, this.eye);
        mat3.getCameraMatrixInverse(this.cameraMatrixInverse, u, negViewDir, this.eye);

        // TODO 4.1c)   Set up the projection matrix using mat3.perspective(...), 
        //              which has to be implemented!
        mat3.perspective(this.projectionMatrix, this.fovy, this.near, this.far);
    }

    /**
     * projects a point form world space coordinates to the canonical viewing volume
     * @param {number[]} point2D 
     * @returns {number[]} projected point2D
     */
    projectPoint(point2D) {

        // TODO 4.1c)   Use this.cameraMatrix to transform the point to 
        //              camera space (Use homogeneous coordinates!). Then,
        //              use this.projectionMatrix to apply the projection.
        //              Don't forget to dehomogenize the projected point 
        //              before returning it! You can use gl-matrix.js where
        //              necessary.
        let combined_projection = mat3.create();
        mat3.multiply(combined_projection, this.projectionMatrix, this.cameraMatrix);
        const point_in_camera_frame = [combined_projection[0] * point2D[0] + combined_projection[3] * point2D[1] + combined_projection[6],
                                       combined_projection[1] * point2D[0] + combined_projection[4] * point2D[1] + combined_projection[7],
                                       combined_projection[2] * point2D[0] + combined_projection[5] * point2D[1] + combined_projection[8]];
        return [point_in_camera_frame[0]/ point_in_camera_frame[2], point_in_camera_frame[1]/ point_in_camera_frame[2]];
    }

    render(context) {
        // near plane
        let p_near_0 = vec3.create();
        vec3.transformMat3(p_near_0, [this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
        let p_near_1 = vec3.create();
        vec3.transformMat3(p_near_1, [-this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
        // far plane
        let p_far_0 = vec3.create();
        vec3.transformMat3(p_far_0, [this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);
        let p_far_1 = vec3.create();
        vec3.transformMat3(p_far_1, [-this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);

        // render frustum
        context.fillStyle = 'rgb(0,0,0)';
        context.lineWidth = 1;
        context.fillText("near plane", p_near_1[1], p_near_1[0]+20);
        context.fillText("far plane", p_far_1[1], p_far_1[0]+20);
        context.strokeStyle = 'rgb(100,100,100)';
        context.fillStyle = 'rgb(240,240,240)';
        context.beginPath();
        context.moveTo(p_near_0[1], p_near_0[0]);
        context.lineTo(p_near_1[1], p_near_1[0]);
        context.lineTo(p_far_1[1],  p_far_1[0]);
        context.lineTo(p_far_0[1],  p_far_0[0]);
        context.lineTo(p_near_0[1], p_near_0[0]);
        context.fill();
        context.stroke();

        // render eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("eye", this.eye[1], this.eye[0] + 20);
        context.arc(this.eye[1], this.eye[0], 4, 0, 2 * Math.PI);
        context.arc(this.lookAtPoint[1], this.lookAtPoint[0], 4, 0, 2 * Math.PI);
        context.fill();
    }

    enableFrustumClipping(context) {
        // near plane
        let p_near_0 = vec3.create();
        vec3.transformMat3(p_near_0, [this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
        let p_near_1 = vec3.create();
        vec3.transformMat3(p_near_1, [-this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
        // far plane
        let p_far_0 = vec3.create();
        vec3.transformMat3(p_far_0, [this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);
        let p_far_1 = vec3.create();
        vec3.transformMat3(p_far_1, [-this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);

        context.save();
        context.lineWidth = 1;
        context.strokeStyle = 'rgb(100,100,100)';
        context.beginPath();
        context.moveTo(p_near_0[1], p_near_0[0]);
        context.lineTo(p_near_1[1], p_near_1[0]);
        context.lineTo(p_far_1[1], p_far_1[0]);
        context.lineTo(p_far_0[1], p_far_0[0]);
        context.lineTo(p_near_0[1], p_near_0[0]);
        context.stroke();
        context.clip();
    }

    disableFrustumClipping(context) {
        context.restore();
    }

    getWorldPointOnScreen(screenCoordinate) {
        let inverse = this.cameraMatrixInverse;
        // near plane
        let p_near_0 = vec3.create();
        vec3.transformMat3(p_near_0, [this.near * Math.sin(this.fovy/2), -this.near, 1.0], inverse);
        let p_near_1 = vec3.create();
        vec3.transformMat3(p_near_1, [-this.near * Math.sin(this.fovy/2), -this.near, 1.0], inverse);

        let alpha = screenCoordinate / 2.0 + 0.5;

        return [alpha * p_near_0[0] + (1.0-alpha) * p_near_1[0],
                alpha * p_near_0[1] + (1.0-alpha) * p_near_1[1]];
    }
} //end of class Camera


function Basic1_3(canvas) {
    
    // initialize
    let camera = new Camera();
    canvas.addEventListener('mousedown', onMouseDown, false);
    showResults();

    function onMouseDown(e) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if (e.ctrlKey) {
            camera.lookAt([y, x]);
        } else {
            camera.setEye([y, x]);
        }

        showResults();
    }

    function showResults(){
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "bold 12px Georgia";
        context.textAlign = "center";

        // polygon - coordinates in world space
        let color = [0, 255, 0];
        let polygon = [[100, 400], [100, 500], [200, 500], [200, 400]];

        // draw camera
        camera.render(context);

        // draw polygon
        context.strokeStyle = 'rgb(0,0,0)';
        context.fillStyle = 'rgb(255,0,0)';
        context.beginPath();
        context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
        for (let i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
        context.fill();
        context.stroke();

        camera.enableFrustumClipping(context);
        context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        context.beginPath();
        context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
        for (let i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
        context.fill();
        context.stroke();
        camera.disableFrustumClipping(context);

        // project polygon onto the image plane
        let polygonProjected = new Array();
        for (let i = 0; i < polygon.length; ++i)
            polygonProjected.push(camera.projectPoint(polygon[i]));

        // draw projected polygon
        context.strokeStyle = 'rgb(255, 0, 0)';
        context.beginPath();
        let pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[polygonProjected.length - 1][0]);
        context.moveTo(pointOnScreen1D[1], pointOnScreen1D[0]);
        for (let i = 0; i < polygonProjected.length; ++i) {
            pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[i][0]);
            context.lineTo(pointOnScreen1D[1], pointOnScreen1D[0]);
        }
        context.stroke();

        camera.enableFrustumClipping(context);
        context.lineWidth = 4;
        context.strokeStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        context.beginPath();
        pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[polygonProjected.length - 1][0]);
        context.moveTo(pointOnScreen1D[1], pointOnScreen1D[0]);
        for (let i = 0; i < polygonProjected.length; ++i) {
            pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[i][0]);
            context.lineTo(pointOnScreen1D[1], pointOnScreen1D[0]);
        }
        context.stroke();
        camera.disableFrustumClipping(context);
        context.lineWidth = 1;

        // draw projection lines
        context.setLineDash([3, 3]);
        context.strokeStyle = 'rgb(100,100,100)';
        context.beginPath();
        for (let i = 0; i < polygonProjected.length; ++i) {
            context.moveTo(polygon[i][1], polygon[i][0]);
            pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[i][0]);
            context.lineTo(pointOnScreen1D[1], pointOnScreen1D[0]);

            // debug code to see the projection lines from vertex to eye
            // these lines should coincide with the projection lines ending at the image plane
            //context.moveTo(polygon[i][1], polygon[i][0]);
            //context.lineTo(camera.eye[1], camera.eye[0]);
        }
        context.stroke();
        context.setLineDash([1, 0]);

        // draw homogeneous coordinate system
        let offset = [0, 0];
        let dim = [120, 120];
        context.save();
        context.beginPath();
        context.rect(offset[1], offset[0], dim[1], dim[0]);
        context.clip();
        context.strokeStyle = 'rgb(100,100,100)';
        context.fillStyle = 'rgb(240,240,240)';
        context.beginPath();
        context.rect(offset[1], offset[0], dim[1], dim[0]);
        context.fill();
        context.stroke();
        context.beginPath();
        context.strokeStyle = 'rgb(0,0,0)';
        context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        let p = [   (-polygonProjected[polygonProjected.length - 1][0] / 2 + 0.5) * dim[0] + offset[0],
                    (polygonProjected[polygonProjected.length - 1][1] / 2 + 0.5) * dim[1] + offset[1]];
        context.moveTo(p[1], p[0]);
        for (let i = 0; i < polygonProjected.length; ++i) {
            p = [   (-polygonProjected[i][0] / 2 + 0.5) * dim[0] + offset[0],
                    (polygonProjected[i][1] / 2 + 0.5) * dim[1] + offset[1]];
            context.lineTo(p[1], p[0]);
        }
        context.fill();
        context.stroke();
        context.fillStyle = 'rgb(0,0,0)';
        context.fillText("Canonical Volume", offset[1] + dim[1] / 2, offset[0] + dim[0] - 4);
        context.restore();

        // draw axis
        arrow(context, 15, 285, 15, 255);
        arrow(context, 15, 285, 45, 285);
        context.fillStyle = 'rgb(0,0,0)';
        context.fillText("X", 5, 260);
        context.fillText("Z", 45, 297);
    }
}
