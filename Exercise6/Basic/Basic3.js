/////////////////////////
////////   6.3   ////////
/////////////////////////

/**
 * compute a perspective transformation
 * that perspectively maps the 3D space onto a 2D plane
 * @param {number[]} out - resulting 4x4 Matrix, column-major, 
 * @param {number} fovy
 * @param {number} near 
 * @param {number} far 
 * @returns out
 */
mat4.perspective = function (out, fovy, near, far) {
    let f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);

    out[0] = f;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;

    return out;
};
/**
 * a camera rendering a 3D scene to a 2D plane
 */
class Camera3D {
    constructor() {
        this.eye = [0, 0, 100];
        this.fovy = 30.0 / 180.0 * Math.PI;
        this.near = 5;
        this.far = 500;
        this.lookAtPoint = [0, 0, 0];
        this.upVector = [0, 1, 0];

        // the cameraMatrix transforms from world space to camera space
        this.cameraMatrix = mat4.create();
        // projection matrix
        this.projectionMatrix = mat4.create();

        this.cameraMatrixInverse = mat4.create();

        // setup matrices
        this.update();
    }

    setMatrices(cameraMatrix, projectionMatrix) {
        this.cameraMatrix = cameraMatrix;
        this.projectionMatrix = projectionMatrix;
    }

    lookAt(point3D) {
        this.lookAtPoint = [point3D[0], point3D[1], point3D[2]];
        this.update();
    }

    setEye(eye3D) {
        this.eye[0] = [eye3D[0], eye3D[1], eye3D[2]];
        this.update();
    }

    setFar(far) {
        this.far = far;
        this.update();
    }

    setFovy(fovy) {
        this.fovy = fovy;
        this.update();
    }

    move(dir) {
        if (dir == 0) {
            if (this.eye[1] < 0) {
                let origin = vec3.fromValues(0, 0, 0);
                vec3.rotateX(this.eye, this.eye, origin, -2 * Math.PI / 180);
            }
        } else if (dir == 1) {
            if (this.eye[2] > 4) {
                let origin = vec3.fromValues(0, 0, 0);
                vec3.rotateX(this.eye, this.eye, origin, 2 * Math.PI / 180);
            }
        }
        this.update();
    }

    update() {
        let e = vec3.fromValues(this.eye[0], this.eye[1], this.eye[2]);
        let g = vec3.fromValues(this.lookAtPoint[0] - this.eye[0],
            this.lookAtPoint[1] - this.eye[1],
            this.lookAtPoint[2] - this.eye[2]);
        let t = vec3.fromValues(this.upVector[0], this.upVector[1], this.upVector[2]);

        this.w = vec3.fromValues(-g[0], -g[1], -g[2]);
        vec3.normalize(this.w, this.w);

        this.u = vec3.create();
        vec3.cross(this.u, t, this.w);
        vec3.normalize(this.u, this.u);

        this.v = vec3.create();
        vec3.cross(this.v, this.w, this.u);

        let first_matrix = mat4.fromValues(this.u[0], this.v[0], this.w[0], 0,
            this.u[1], this.v[1], this.w[1], 0,
            this.u[2], this.v[2], this.w[2], 0,
            0, 0, 0, 1);
        let second_matrix = mat4.fromValues(1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -e[0], -e[1], -e[2], 1);
        mat4.multiply(this.cameraMatrix, first_matrix, second_matrix);

        mat4.invert(this.cameraMatrixInverse, this.cameraMatrix);

        mat4.perspective(this.projectionMatrix, this.fovy, this.near, this.far);
    }
} // end of Camera3D


function Basic3(canvas) {
    // shader programs
    let shaderProgramPlane;
    let shaderProgramLight;

    // clear color
    let clearColor = [0.1, 0.1, 0.5];

    // gl buffer data
    let vboPlane;
    let iboPlane;
    let iboNPlane;
    let vboLight;
    let iboLight;
    let iboNLight;

    // camera
    let camera = new Camera3D();

    // texture
    let textureCheckerboard;
    let textureCobblestone;

    // global variables for interaction
    let cobblestone = false;
    let mipmapping = false;
    let repeat = false;

    // width and height of the plane
    let width = 50;
    let height = 50;


    let gl; // webGL context
    let time = 0; // time counter

    //////////////////////////////////
    //////////   setup webGl   ///////
    //////////////////////////////////

    // add event listener
    document.addEventListener('keypress', onKeyPress, false);

    // reset the checkboxes and radio buttons
    let textures = document.getElementsByName('texture');
    textures[0].checked = true;
    textures[1].checked = false;
    textures[0].addEventListener("change",()=>{cobblestone=false;});
    textures[1].addEventListener("change",()=>{cobblestone=true;});

    let mipmapping_box = document.getElementById('mipmap');
    mipmapping_box.addEventListener("change", onChangeMipmap);
    mipmapping_box.checked = false;

    let repeat_box = document.getElementById('repeat');
    repeat_box.addEventListener("change", onChangeRepeat);
    repeat_box.checked = false;


    // initialize webGL canvas
    gl = canvas.getContext("experimental-webgl");
    if (!gl) throw new Error("Could not initialise WebGL, sorry :-(");

    // init scene and shaders
    initScene();

    // set clear color and enable depth test
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
    gl.enable(gl.DEPTH_TEST);

    // start render loop
    renderLoop();

    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////

    function onKeyPress(e) {
        if (e.charCode == 119) { // W
            camera.move(0);
        } else if (e.charCode == 115) { // S
            camera.move(1);
        }
    }

    

    function onChangeMipmap() {
        mipmapping = !mipmapping;
        let minFilterMode = mipmapping ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilterMode);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function onChangeRepeat() {
        repeat = !repeat;
        let wrapMode = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }


    /////////////////////////////
    ///////   Render Loop   /////
    /////////////////////////////

    function renderLoop() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // draw scene
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        drawScene();

        // wait
        window.setTimeout(renderLoop, 1000 / 60);

        // update time
        time += 1000 / 60;
    }

    //////////////////////////////////
    ////////  shader loading  ////////
    //////////////////////////////////

    // shader from java script block
    function getShader(id) {
        let shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        let str = "";
        let k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        let shader;
        if (shaderScript.type == "--fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else if (shaderScript.type == "--vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else return null;

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function shaderProgram(vertexShaderSourceID, fragmentShaderSourceID) {
        let vertexShader = getShader(vertexShaderSourceID);
        let fragmentShader = getShader(fragmentShaderSourceID);

        // create shader program
        let shaderProgram = gl.createProgram();

        // attach shaders
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        // link program
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Could not initialise shaders");
        }
        return shaderProgram;
    }

    //////////////////////////////
    ////////  init scene  ////////
    //////////////////////////////
    function initScene() {

        //////////////////////////////////////////
        ////////  set up geometry - plane ////////
        //////////////////////////////////////////

        let vPlane = [];

        for (let j = height - 1; j >= 0; j--) {
            for (let i = 0; i < width; i++) {
                let A = vec3.fromValues(i - (width - 1) * 0.5,
                    height - 1 - j - (height - 1) * 0.5,
                    0);
                // push the vertex coordinates
                vPlane.push(A[0]);
                vPlane.push(A[1]);
                vPlane.push(A[2]);
                // push the normal coordinates
                vPlane.push(0);
                vPlane.push(0);
                vPlane.push(1);
                vPlane.push(i);
                vPlane.push(j);
            }
        }

        let iPlane = [];

        for (let j = 0; j < height - 1; j++) {
            for (let i = 0; i < width - 1; i++) {
                iPlane.push(j * width + i);
                iPlane.push((j + 1) * width + i);
                iPlane.push(j * width + i + 1);
                iPlane.push(j * width + i + 1);
                iPlane.push((j + 1) * width + i);
                iPlane.push((j + 1) * width + i + 1);
            }
        }

        // create vertex buffer on the gpu
        vboPlane = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboPlane);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPlane), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboPlane = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboPlane);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iPlane), gl.STATIC_DRAW);

        iboNPlane = iPlane.length;

        ///////////////////////////////////////////////
        ////////  set up geometry - light source //////
        ///////////////////////////////////////////////

        let vLight = [0.0, 0.0, 0.0];

        let iLight = [0];

        // create vertex buffer on the gpu
        vboLight = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLight);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vLight), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboLight = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLight);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iLight), gl.STATIC_DRAW);

        iboNLight = iLight.length;

        ////////////////////////////////
        ////////  set up shaders  //////
        ////////////////////////////////
        shaderProgramPlane = shaderProgram("shader-vs-phong", "shader-fs-phong");
        shaderProgramLight = shaderProgram("shader-vs-light", "shader-fs-light");

        /////////////////////////////////
        ////////  set up textures  //////
        /////////////////////////////////
        let image = document.getElementById('checkerboard');
        textureCheckerboard = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);


        // TODO 6.3a):  Set up the texture containing the checkerboard
        //              image. Have a look at the functions gl.bindTexture(),
        //              gl.texImage2D() and gl.texParameteri(). Also do not
        //              forget to generate the mipmap pyramid using 
        //              gl.generateMipmap(). Note: Both format and internal
        //              format parameter should be gl.RGBA, the data type
        //              used should be gl.UNSIGNED_BYTE.



        image = document.getElementById('cobblestone');
        textureCobblestone = gl.createTexture();

        // TODO 6.3b):  Set up the texture containing the cobblestone
        //              image, also using gl.bindTexture() and gl.texImage2D().
        //              We do not need mipmapping here, so do not forget to 
        //              use gl.texParameteri() to set the minification filter 
        //              to gl.LINEAR. Format, internal format and type should
        //              be the same as for the checkerboard texture.



    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////

    function drawScene() {

        let modelMatrixPlane = mat4.create();
        let modelMatrixLight = mat4.create();
        modelMatrixLight[12] = 10;
        modelMatrixLight[14] = 5;

        let rot = mat4.create();
        mat4.fromRotation(rot, (time * 0.05 % 360) / 360 * 2 * Math.PI, [0, 0, 1]);
        mat4.mul(modelMatrixLight, rot, modelMatrixLight);

        // draw the light source
        drawLight(modelMatrixLight);

        // draw the plane
        drawPlane(modelMatrixPlane, [0, 0.8, 0.5], modelMatrixLight);
    }

    function drawPlane(modelMatrix, color, modelMatrixLight) {

        let normalMatrix = mat4.create();
        mat4.transpose(normalMatrix, modelMatrix);
        mat4.invert(normalMatrix, normalMatrix);

        gl.useProgram(shaderProgramPlane);
        // enable vertex attributes
        let attrVertexPlane = gl.getAttribLocation(shaderProgramPlane, "vVertex");
        gl.enableVertexAttribArray(attrVertexPlane);
        let attrNormalPlane = gl.getAttribLocation(shaderProgramPlane, "vNormal");
        gl.enableVertexAttribArray(attrNormalPlane);
        let attrTexCoordPlane = gl.getAttribLocation(shaderProgramPlane, "vTexCoord");
        gl.enableVertexAttribArray(attrTexCoordPlane);

        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramPlane, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix);
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramPlane, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix);
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramPlane, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix);
        let uniformLocNormalMatrix = gl.getUniformLocation(shaderProgramPlane, "normalMatrix");
        gl.uniformMatrix4fv(uniformLocNormalMatrix, false, normalMatrix);
        let lightPosition = vec3.fromValues(0, 0, 0);
        vec3.transformMat4(lightPosition, lightPosition, modelMatrixLight);
        let uniformLocLightPosition = gl.getUniformLocation(shaderProgramPlane, "lightPosition");
        gl.uniform3fv(uniformLocLightPosition, lightPosition);
        let uniformLocCameraMatrixInverse = gl.getUniformLocation(shaderProgramPlane, "cameraMatrixInverse");
        gl.uniformMatrix4fv(uniformLocCameraMatrixInverse, false, camera.cameraMatrixInverse);
        let uniformLocCobblestone = gl.getUniformLocation(shaderProgramPlane, "cobblestone");
        gl.uniform1i(uniformLocCobblestone, cobblestone);
        let uniformLocPlaneSize = gl.getUniformLocation(shaderProgramPlane, "planeSize");
        gl.uniform2f(uniformLocPlaneSize, width, height);

        // bind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        let uniformLocTexture = gl.getUniformLocation(shaderProgramPlane, "checkerboardTexture");
        gl.uniform1i(uniformLocTexture, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureCobblestone);
        uniformLocTexture = gl.getUniformLocation(shaderProgramPlane, "cobblestoneTexture");
        gl.uniform1i(uniformLocTexture, 1);


        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboPlane);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboPlane);
        let attrVertex = gl.getAttribLocation(shaderProgramPlane, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 32, 0);
        let attrNormal = gl.getAttribLocation(shaderProgramPlane, "vNormal");
        gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, 32, 12);
        let attrTexCoord = gl.getAttribLocation(shaderProgramPlane, "vTexCoord");
        gl.vertexAttribPointer(attrTexCoord, 2, gl.FLOAT, false, 32, 24);


        // draw
        gl.drawElements(gl.TRIANGLES, iboNPlane, gl.UNSIGNED_SHORT, 0);
    }

    function drawLight(modelMatrix) {
        gl.useProgram(shaderProgramLight);
        // enable vertex attributes
        let attrVertexLight = gl.getAttribLocation(shaderProgramLight, "vVertex");
        gl.enableVertexAttribArray(attrVertexLight);
        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramLight, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix);
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramLight, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix);
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramLight, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix);
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLight);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLight);
        let attrVertex = gl.getAttribLocation(shaderProgramLight, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 12, 0);
        // draw
        gl.drawElements(gl.POINTS, iboNLight, gl.UNSIGNED_SHORT, 0);
    }
}
