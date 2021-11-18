/////////////////////////////
////////   Helpers   ////////
/////////////////////////////

/**
 * Compute a perspective transformation
 * that maps the 3D space onto a 2D plane
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
    constructor(){
        this.eye = [0, 50, 100];
        this.fovy = 30.0 / 180.0 * Math.PI;
        this.near = 5;
        this.far = 500;
        this.lookAtPoint = [0, 0, 0];
        this.upVector = [0, 1, 0];

        // the cameraMatrix transforms from world space to camera space
        this.cameraMatrix = mat4.create();
        // projection matrix
        this.projectionMatrix = mat4.create();
        // the cameraMatrixInverse transforms from camera space to world space
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
            vec3.sub(this.eye, this.eye, this.w);
        } else if (dir == 1) {
            let origin = vec3.fromValues(0, 0, 0);
            vec3.rotateY(this.eye, this.eye, origin, -5 * Math.PI / 180);
        } else if (dir == 2) {
            vec3.add(this.eye, this.eye, this.w);
        } else if (dir == 3) {
            let origin = vec3.fromValues(0, 0, 0);
            vec3.rotateY(this.eye, this.eye, origin, 5 * Math.PI / 180);
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

        let first_matrix = mat4.fromValues( this.u[0], this.v[0], this.w[0], 0,
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



/////////////////////////
////////   5.2   ////////
/////////////////////////

function Basic2(canvas) {

    // shader programs
    let shaderProgramTerrain;
    let shaderProgramLight;

    // clear color
    let clearColor = [0.1, 0.1, 0.1];

    // gl buffer data
    let vboTerrain;
    let iboTerrain;
    let iboNTerrain;
    let vboLight;
    let iboLight;
    let iboNLight;

    // camera
    let camera = new Camera3D();

    // global variables for interaction
    let shiny = 100;
    let lightRotation = true;
    let ambient = true;
    let diffuse = false;
    let specular = false;

    let time = 0; // time counter

    ///////////////////////////////////
    //////////   setup web gl   ///////
    ///////////////////////////////////


    // reset the slider and the checkboxes
    let slider = document.getElementById('shiny');
    slider.addEventListener('change',onChangeShiny);
    slider.value = shiny;
    let b_lightRotation = document.getElementsByName('lightRotation');
    b_lightRotation[0].addEventListener('change',()=>{ lightRotation =! lightRotation; } );
    b_lightRotation[0].checked = lightRotation;
    let phongTerms = document.getElementsByName('phongTerm');
    phongTerms[0].addEventListener('change',()=>{ambient =! ambient;});
    phongTerms[0].checked = ambient;
    phongTerms[1].addEventListener('change',()=>{diffuse =! diffuse;});
    phongTerms[1].checked = diffuse;
    phongTerms[2].addEventListener('change',()=>{specular =! specular;});
    phongTerms[2].checked = specular;

    // add event listener
    document.addEventListener('keypress', onKeyPress, false);

    // initialize webGL canvas
    let gl = canvas.getContext("experimental-webgl");
    if(!gl) throw new Error("Could not initialise WebGL, sorry :-(");

    // init scene and shaders
    initScene(gl);

    // set clear color and enable depth test
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
    gl.enable(gl.DEPTH_TEST);

    // start render loop
    renderLoop();
        
    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////

    function onChangeShiny() {
        shiny = this.value;
    }

    function onKeyPress(e) {
        if (e.charCode == 119) { // W
            camera.move(0);
        } else if (e.charCode == 97) { // A
            camera.move(1);
        } else if (e.charCode == 115) { // S
            camera.move(2);
        } else if (e.charCode == 100) { // D
            camera.move(3);
        }
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
        if (lightRotation) {
            time += 1000 / 60;
        }
    }

    //////////////////////////////
    ////////  init scene  ////////
    //////////////////////////////
    function initScene() {

        /////////////////////////////////////////
        ////////  setup geometry - terrain //////
        /////////////////////////////////////////
        
        let img = document.getElementById('height_field');
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        let width = canvas.width;
        let height = canvas.height;

        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        let raw_data = canvas.getContext('2d').getImageData(0, 0, width, height).data;

        let sigmaD = 4.0;
        let kernelRadius = Math.ceil(2.0 * sigmaD);
        let data = new Array(width * height * 4);
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let sumWeight = 0.0;
                let sum = 0.0;
                for (let m_poss = i - kernelRadius; m_poss <= i + kernelRadius; m_poss++) {
                    for (let n_poss = j - kernelRadius; n_poss <= j + kernelRadius; n_poss++) {
                        let m = Math.min(Math.max(0, m_poss), width - 1);
                        let n = Math.min(Math.max(0, n_poss), height - 1);
                        if (m >= 0 && n >= 0 && m < width && n < height) {
                            let weight = Math.exp(-(((m - i) * (m - i) + (n - j) * (n - j)) / (2.0 * sigmaD * sigmaD)));
                            sumWeight += weight;
                            sum += weight * raw_data[(m + n * width) * 4];
                        } 
                    }
                }
                data[(i + j * width) * 4] = sum / sumWeight;
            }
        }


        let x_scale = 0.4;
        let y_scale = 0.1;
        let z_scale = 0.4;

        let v = [];

        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let center = [j, i];
                let neighbours = [[j, i - 1],
                                  [j + 1, i - 1],
                                  [j + 1, i],
                                  [j, i + 1],
                                  [j - 1, i + 1],
                                  [j - 1, i]];
                let A = vec3.fromValues(x_scale * (center[1] - width * 0.5),
                                        y_scale * data[(center[1] + center[0] * width) * 4],
                                        z_scale * (center[0] - height * 0.5));
                let normal = vec3.fromValues(0, 0, 0);
                for (let k = 0; k < 6; k++) {
                    let neighbourB = neighbours[k];
                    let B = vec3.fromValues(x_scale * (neighbourB[1] - width * 0.5),
                                            y_scale * data[(neighbourB[1] + neighbourB[0] * width) * 4],
                                            z_scale * (neighbourB[0] - height * 0.5));
                    let neighbourC = neighbours[(k + 1) % 6];
                    let C = vec3.fromValues(x_scale * (neighbourC[1] - width * 0.5),
                                            y_scale * data[(neighbourC[1] + neighbourC[0] * width) * 4],
                                            z_scale * (neighbourC[0] - height * 0.5));

                    let normalABC = vec3.create();
                    vec3.cross(normalABC, B, C);

                    vec3.add(normal, normal, normalABC);
                }

                v.push(A[0]);
                v.push(A[1]);
                v.push(A[2]);
                v.push(normal[0]);
                v.push(normal[1]);
                v.push(normal[2]);
            }
        }

        let index = [];

        for (let j = 1; j < height - 2; j++) {
            for (let i = 1; i < width - 2; i++) {
                index.push(j * width + i);
                index.push((j + 1) * width + i);
                index.push(j * width + i + 1);
                index.push(j * width + i + 1);
                index.push((j + 1) * width + i);
                index.push((j + 1) * width + i + 1);
            }
        }

        // create vertex buffer on the gpu
        vboTerrain = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboTerrain);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboTerrain = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTerrain);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);

        iboNTerrain = index.length;

        //////////////////////////////////////////////
        ////////  setup geometry - light source //////
        //////////////////////////////////////////////

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

        ///////////////////////////////
        ////////  setup shaders  //////
        ///////////////////////////////
        shaderProgramTerrain = shaderProgram("shader-vs-phong", "shader-fs-phong");

        shaderProgramLight = shaderProgram("shader-vs-light", "shader-fs-light");
    }


    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////

    function drawScene() {

        let modelMatrixTerrain = mat4.create();
        modelMatrixTerrain[13] = -10;
        let modelMatrixLight = mat4.create();
        modelMatrixLight[12] = 20;
        modelMatrixLight[13] = 10;

        let rot = mat4.create();
        mat4.fromRotation(rot, (time * 0.05 % 360) / 360 * 2 * Math.PI, [0, 1, 0]);
        mat4.mul(modelMatrixLight, rot, modelMatrixLight);


        // draw the light source
        drawLight(modelMatrixLight);

        // draw the cube
        drawTerrain(modelMatrixTerrain, [0, 0.8, 0.5], modelMatrixLight);
    }

    function drawTerrain(modelMatrix, color, modelMatrixLight) {

        let normalMatrix = mat4.create();
        mat4.transpose(normalMatrix, modelMatrix);
        mat4.invert(normalMatrix, normalMatrix);

        gl.useProgram(shaderProgramTerrain);
        // enable vertex attributes
        let attrVertexTerrain = gl.getAttribLocation(shaderProgramTerrain, "vVertex");
        gl.enableVertexAttribArray(attrVertexTerrain);
        let attrNormalTerrain = gl.getAttribLocation(shaderProgramTerrain, "vNormal");
        gl.enableVertexAttribArray(attrNormalTerrain);
        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramTerrain, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix);
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramTerrain, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix);
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramTerrain, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix);
        let uniformLocNormalMatrix = gl.getUniformLocation(shaderProgramTerrain, "normalMatrix");
        gl.uniformMatrix4fv(uniformLocNormalMatrix, false, normalMatrix);
        let uniformLocColor = gl.getUniformLocation(shaderProgramTerrain, "color");
        gl.uniform3fv(uniformLocColor, color);
        let lightPosition = vec3.fromValues(0, 0, 0);
        vec3.transformMat4(lightPosition, lightPosition, modelMatrixLight);
        let uniformLocLightPosition = gl.getUniformLocation(shaderProgramTerrain, "lightPosition");
        gl.uniform3fv(uniformLocLightPosition, lightPosition);
        let uniformLocCameraMatrixInverse = gl.getUniformLocation(shaderProgramTerrain, "cameraMatrixInverse");
        gl.uniformMatrix4fv(uniformLocCameraMatrixInverse, false, camera.cameraMatrixInverse);
        let uniformLocShiny = gl.getUniformLocation(shaderProgramTerrain, "shiny");
        gl.uniform1f(uniformLocShiny, shiny);
        let uniformLocAmbient = gl.getUniformLocation(shaderProgramTerrain, "ambient");
        gl.uniform1i(uniformLocAmbient, ambient);
        let uniformLocDiffuse = gl.getUniformLocation(shaderProgramTerrain, "diffuse");
        gl.uniform1i(uniformLocDiffuse, diffuse);
        let uniformLocSpecular = gl.getUniformLocation(shaderProgramTerrain, "specular");
        gl.uniform1i(uniformLocSpecular, specular);
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboTerrain);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTerrain);
        let attrVertex = gl.getAttribLocation(shaderProgramTerrain, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 24, 0);
        let attrNormal = gl.getAttribLocation(shaderProgramTerrain, "vNormal");
        gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, 24, 12);
        // draw
        gl.drawElements(gl.TRIANGLES, iboNTerrain, gl.UNSIGNED_SHORT, 0);
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


    ////////////////////////////////////
    //////////   shader helper   ///////
    ////////////////////////////////////

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
            throw new Error(gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    function shaderProgram(vertexShaderSourceID, fragmentShaderSourceID) {
        let vertexShader = getShader( vertexShaderSourceID);
        let fragmentShader = getShader( fragmentShaderSourceID);

        // create shader program
        let shaderProgram = gl.createProgram();

        // attach shaders
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        // link program
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Could not initialize shaders");
        }
        return shaderProgram;
    }
}
