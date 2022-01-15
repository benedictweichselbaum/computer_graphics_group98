let showAABB = true;
let useTree = false;
let showIntersections = false;

////////////////////////////////////////////////////////
/////////////////////   HELPER   ///////////////////////
////////////////////////////////////////////////////////

let deterministicRandomState = -17;
function deterministicRandomResetState() { deterministicRandomState = -17; }
/**
 * Deterministic random Function
 * @returns {number} pseudo random number in [0,1]
 */
function deterministicRandom() {
    let x = Math.sin(deterministicRandomState++) * 10000;
    return x - Math.floor(x);
}

/**
 * Sort objects by the x-coordinate of the center of their aabb
 * @param {Object2D[]} objects - array of objects bound by an aabb
 * @returns {Object2D[]} - sorted copy of the input array
 */
function sort_along_x(objects) {
    let objects_copy = objects.slice();
    objects_copy.sort(function (a, b) { return (a.aabb[0][0] + a.aabb[1][0]) / 2 - (b.aabb[0][0] + b.aabb[1][0]) / 2; });
    return objects_copy;
}

/**
 * Sort objects by the y-coordinate of the center of their aabb
 * @param {Object2D[]} objects - array of objects bound by an aabb
 * @returns {Object2D[]} - sorted copy of the input array
 */
function sort_along_y(objects) {
    let objects_copy = objects.slice();
    objects_copy.sort(function (a, b) { return (a.aabb[0][1] + a.aabb[1][1]) / 2 - (b.aabb[0][1] + b.aabb[1][1]) / 2; });
    return objects_copy;
}

/**
 * Determine if two objects overlap (based on their aabb)
 * @param {Object2D} first 
 * @param {Object2D} second 
 * @returns {boolean} - true if aabbs of the objects overlap
 */
function overlaps(first, second) {
    let f_min_x = 1000;
    let f_min_y = 1000;
    let f_max_x = 0;
    let f_max_y = 0;
    let s_min_x = 1000;
    let s_min_y = 1000;
    let s_max_x = 0;
    let s_max_y = 0;
    for (let i = 0; i < first.primitives.length; i++) {
        let point = first.primitives[i].p0;
        if (point[0] < f_min_x) f_min_x = point[0];
        if (point[1] < f_min_y) f_min_y = point[1];
        if (point[0] > f_max_x) f_max_x = point[0];
        if (point[1] > f_max_y) f_max_y = point[1];
    }
    for (let i = 0; i < second.primitives.length; i++) {
        let point = second.primitives[i].p0;
        if (point[0] < s_min_x) s_min_x = point[0];
        if (point[1] < s_min_y) s_min_y = point[1];
        if (point[0] > s_max_x) s_max_x = point[0];
        if (point[1] > s_max_y) s_max_y = point[1];
    }
    if (f_min_x > s_max_x) return false; // min x
    if (f_max_x < s_min_x) return false; // max x
    if (f_min_y > s_max_y) return false; // min y
    if (f_max_y < s_min_y) return false; // max y
    return true;
}

//////////////////////////////////////
/////////////   Ray   ////////////////
//////////////////////////////////////

class Ray{
    constructor(from, to){
        this.pos = vec2.clone(from);
        this.dir = vec2.create();
        vec2.sub(this.dir, to, this.pos);
        vec2.normalize(this.dir, this.dir);
    }

    /**
     * Test intersection of ray with aabb
     * @param {number[][]} aabb - axis aligned bounding box in the form [[min_x,min_y],[max_x,max_y]]
     * @param {object} context - 2d canvas context, the intersection is logged to
     * @returns 
     */
    intersect(aabb, context){
        let tminx = (aabb[0][0]-this.pos[0]) / this.dir[0];
        let tmaxx = (aabb[1][0]-this.pos[0]) / this.dir[0];
        let tminy = (aabb[0][1]-this.pos[1]) / this.dir[1];
        let tmaxy = (aabb[1][1]-this.pos[1]) / this.dir[1];
        let enter = Math.max(Math.min(tminx,tmaxx), Math.min(tminy,tmaxy));
        let exit = Math.min(Math.max(tminx,tmaxx), Math.max(tminy,tmaxy));

        if(enter < exit && exit>0){
            return new Intersection(this, Math.max(0,enter));
        }
        return null;
    }
}

class Intersection{
    constructor(ray, ray_t){
        this.ray = ray;
        this.ray_t = ray_t;
        this.point = vec2.create();
        vec2.scaleAndAdd(this.point, ray.pos, ray.dir, ray_t);
    }
}

////////////////////////////////////////////////////////
/////////////   Line - 2D Primitive   //////////////////
////////////////////////////////////////////////////////

class Line {
    /**
     * 2D Line Primitive
     * @param {vec2} p0 - line start point
     * @param {vec2} p1 - line end point
     * @param {number[]} color - color triple [r,g,b]
     */
    constructor(p0, p1, color) {
        this.p0 = vec2.clone(p0);
        this.p1 = vec2.clone(p1);
        this.color = color;
    }

    /**
     * Draw the line to the context (using its color)
     * @param {object} context - 2d canvas context
     * @param {bool} debug - use yellow color
     */
    draw(context, debug) {
        context.setLineDash([1, 0]);
        context.strokeStyle = 'rgba(' + Math.floor(255 * this.color[0]) + ',' + Math.floor(255 * this.color[1]) + ',' + Math.floor(255 * this.color[2]) + ', 0.75)';
        if(debug) context.strokeStyle = 'rgba(255,255,0,0.75)';
        context.beginPath();
        context.moveTo(this.p0[0], this.p0[1]);
        context.lineTo(this.p1[0], this.p1[1]);
        context.stroke();
    }

    /**
     * Compute Intersection of line with ray
     * @param {Ray} ray
     * @param {object} context - 2d canvas context, the intersection is logged to
     * @returns {Intersection|null} - intersection if exists
     */
    intersect(ray, context){
        if(showIntersections) this.draw(context, true);
        let lineDir = vec3.create();
        vec2.sub(lineDir, this.p1, this.p0);
        let b = vec2.create();
        vec2.sub(b, this.p1, ray.pos);
        let A = mat2.fromValues(lineDir[0], lineDir[1], ray.dir[0], ray.dir[1]);
        let A_INV = mat2.create();
        mat2.invert(A_INV, A);
        let x = vec2.create();
        vec2.transformMat2(x, b, A_INV);
        const t_max = Number.POSITIVE_INFINITY;
        if (x[0] >= 0 && x[0] <= 1.0 && x[1] >= 0 && x[1] <= t_max) {
            return new Intersection(ray, x[1]);
        }
        return null;
    }
}


////////////////////////////////////////////////////////
//////////////////   2D Object   ///////////////////////
////////////////////////////////////////////////////////

class Object2D {
    /**
     * 2D Object (i.e. collection of line-primitives)
     * @param {Line[]} primitives - 2D lines, the object consists of
     * @property {number[][]} aabb - Axis aligned bounding box [[min_x,min_y],[max_x,max_y]] (generated based on primitives)
     * @property {Line[]} aabb_primitives - Visual representation of aabb (4 Lines) (generated based on aabb)
     */
    constructor(primitives) {
        this.primitives = primitives;

        // TODO 10.1 a)     Compute the axis-aligned bounding box
        //                  for the object. The box should be defined by 
        //                  its bottom left (smallest x- and y-value) and
        //                  its top right corner (highest x- and y-value).

        // 1. Compute the axis-aligned bounding box!
        //    Replace the following dummy line.
        let min_x, min_y, max_x, max_y;

        for (let primitive of primitives) {
            if (primitive.p0[0] < min_x || !min_x) {
                min_x = primitive.p0[0];
            }
            if (primitive.p1[0] < min_x || !min_x) {
                min_x = primitive.p1[0];
            }
            if (primitive.p0[0] > max_x || !max_x) {
                max_x = primitive.p0[0];
            }
            if (primitive.p1[0] > max_x || !max_x) {
                max_x = primitive.p1[0];
            }

            if (primitive.p0[1] < min_y || !min_y) {
                min_y = primitive.p0[1];
            }
            if (primitive.p1[1] < min_y || !min_y) {
                min_y = primitive.p1[1];
            }
            if (primitive.p0[1] > max_y || !max_y) {
                max_y = primitive.p0[1];
            }
            if (primitive.p1[1] > max_y || !max_y) {
                max_y = primitive.p1[1];
            }
        }
        this.aabb = [[min_x, min_y], [max_x, max_y]]; // should be in this format: [[min_x, min_y],[max_x, max_y]]


        // 2. Compute the primitives to graphically represent the
        //    bounding box as "Line"s. Use the given color.
        let color = [0.1, 0.1, 0.1];
        this.aabb_primitives = [
            new Line([min_x, max_y], [max_x, max_y], color),
            new Line([min_x, min_y], [max_x, min_y], color),
            new Line([max_x, min_y], [max_x, max_y], color),
            new Line([min_x, min_y], [min_x, max_y], color)
        ];

    }

    /**
     * Draw the object to the context (i.e. draw its primitives (and its aabb))
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        for (let i = 0; i < this.primitives.length; ++i) {
            this.primitives[i].draw(context);
        }
        if (showAABB) {
            for (let i = 0; i < this.aabb_primitives.length; i++) {
                this.aabb_primitives[i].draw(context);
            }
        }
    }

    /**
     * Compute Intersection of object with ray (i.e. closest intersection with one of its primitives)
     * @param {Ray} ray
     * @param {object} context - 2d canvas context, the intersection is logged to
     * @returns {Intersection|null} - intersection if exists
     */
    intersect(ray, context){
        // here one part of the optimization takes place
        let aabbIntersection = null;
        if(this.aabb[0]){
            if(showIntersections){
                for(let p of this.aabb_primitives) p.draw(context, true);
            }
            aabbIntersection = ray.intersect(this.aabb, context);
        }
        if(this.aabb[0] && !aabbIntersection){
            return null;
        } else {
            // only test primitives for intersection, if aabb is intersected
            let result = null;
            for(let p of this.primitives){
                let i = p.intersect(ray, context);
                if(i && (!result || result.ray_t>i.ray_t)) result = i;
            }
            return result;
        }
    }
}


////////////////////////////////////////////////////////
///////////////////   2D Scene   ///////////////////////
////////////////////////////////////////////////////////

class Scene {
    /**
     * 2D Scene (i.e. collection of objects)
     * @param {Object2D[]} objects - the objects forming the scene
     * @property {KDTree} kdTree - Kd-tree object hierarchy (generated based on objects aabbs)
     */
    constructor(objects) {
        this.objects = objects;
        this.kdTree = new KDTree(objects);
    }

    /**
     * Draw the scene to the context (i.e. draw its objects and the kdTree)
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        if (!useTree) { // simply draw the objects
            for (let i = 0; i < this.objects.length; ++i) {
                this.objects[i].draw(context);
            }
        } else { // draw the kdTree and the contained objects
            this.kdTree.draw(context);
        }
    }

    /**
     * Compute Intersection of scene with ray (i.e. closest intersection with one of its objects)
     * @param {Ray} ray
     * @param {object} context - 2d canvas context, the intersection is logged to
     * @returns {Intersection|null} - intersection if exists
     */
    intersect(ray, context){
        let result = null;
        if(!useTree){
            // Not optimized intersection test
            for(let p of this.objects){
                let i = p.intersect(ray, context);
                if(i && (!result || result.ray_t>i.ray_t)) result = i;
            }
        }else{
            // optimized hierarchical intersection test
            result = this.kdTree.intersect(ray, context);
        }
        return result;
    }
}

////////////////////////////////////////////////////////
//////////////   Kd tree and its nodes   ///////////////
////////////////////////////////////////////////////////

class KdNode {
    /**
     * Node of the Kd tree
     * @param {boolean} isInner 
     * - true: it is an inner node (storing aabb, children-nodes, splitAxis and splitPosition)
     * - false: it is a leaf node  (storing aabb and children-objects)
     * @param {number[][]} aabb - axis aligned bounding box of the node [[min_x,min_y],[max_x,max_y]]
     * @param {(KdNode[]|Object2D[])} children 
     * - (if inner node) two-element array holding left and right (or top and bottom) children.
     * - (if leaf node)   array holding the objects
     * @param {string} splitAxis - (only inner node) "x": split along x-axis, "y": split along y-axis
     * @param {number} splitPosition - (only inner node) 1D position of the split in world-coordinates (along the axis defined by splitAxis)
     */
    constructor(isInner, aabb, children, splitAxis, splitPosition) {
        this.isInner = isInner;      
        this.aabb = aabb;                
        this.children = children;
        this.splitAxis = splitAxis;
        this.splitPosition = splitPosition;
    }

    /**
     * Draw the Node to the context (i.e. draw all its children and a split axis (horizontal red, vertical blue) for inner nodes)
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        if (this.isInner) {
            let line;
            if (this.splitAxis == 'x') {
                let color = [0, 0, 1]; // vertical splitting lines: blue
                line = new Line([this.splitPosition, this.aabb[0][1]], [this.splitPosition, this.aabb[1][1]], color);
            } else {
                let color = [1, 0, 0]; // horizontal splitting lines: red
                line = new Line([this.aabb[0][0], this.splitPosition], [this.aabb[1][0], this.splitPosition], color);
            }
            line.draw(context);
        }
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw(context); // draw exists for both objects and nodes
        }
    }

    /**
     * Compute Intersection of node with ray (i.e. closest intersection with one of its children)
     * @param {Ray} ray
     * @param {object} context - 2d canvas context, the intersection is logged to
     * @returns {Intersection|null} - intersection if exists
     */
    intersect(ray, context){
        if(showIntersections){
            context.beginPath();
            context.strokeStyle="rgba(255,255,0,0.75)";
            context.moveTo(this.aabb[0][0],this.aabb[0][1]);
            context.lineTo(this.aabb[1][0],this.aabb[0][1]);
            context.lineTo(this.aabb[1][0],this.aabb[1][1]);
            context.lineTo(this.aabb[0][0],this.aabb[1][1]);
            context.lineTo(this.aabb[0][0],this.aabb[0][1]);
            context.stroke();
        }

        //Here, the optimization takes place
        let aabbIntersection = ray.intersect(this.aabb, context);
        if(!aabbIntersection){
            return null;
        } else {
            // only test children for intersection, if aabb is hit
            let result = null;
            for(let p of this.children){
                let i = p.intersect(ray, context);
                if(i && (!result || result.ray_t>i.ray_t)) result = i;
            }
            return result;
        }
    }
}

class KDTree {
    /**
     * Kd Tree (hierarchy of KdNodes)
     * @param {Object2D[]} objects - objects to create a Kd-Tree hierarchy for.
     */
    constructor(objects) {
        this.objects = objects;

        // This creates the root node as a single leaf node containing the whole canvas size
        // and all objects. The first axis to split along is the x axis.
        this.root = new KdNode(false, [[0, 0], [600, 300]], this.objects, 'x');

        // The root node is put onto the stack for further examination.
        // In the following, the stack contains all leaf nodes which might
        // be split into inner nodes afterwards.
        let stack = [];
        stack.push(this.root);

        // As long as the stack is not empty, this loop pops nodes 
        // from the stack.
        let i = 20;
        while (stack.length != 0) {
            let node = stack.pop();

            // TODO 10.1 b)     Build the kd-tree structure by
            //                  splitting nodes which contain 
            //                  too many triangles.          

            if (node.children.length > 3) { // The node needs to be split.

                // This node should be an inner node from now on.
                node.isInner = true;

                // 1. Compute the split position (x value for split along x axis,
                //    y value for split along y axis). 
                //    You can use the functions sort_along_x() and sort_along_y() 
                //    in order to get a sorted copy of the objects in the node.
                //    Use the objects' bounding boxes to choose the right split 
                //    position!
                let splitNumber;
                let sortedObjects;
                let splitPosition;
                if (node.splitAxis == 'x') {
                    sortedObjects = sort_along_x(node.children);
                    splitNumber = Math.floor(sortedObjects.length / 2) - 1;
                    splitPosition = (sortedObjects[splitNumber].aabb[1][0] + sortedObjects[splitNumber + 1].aabb[0][0]) / 2;
                } else {
                    sortedObjects = sort_along_y(node.children);
                    splitNumber = Math.floor(sortedObjects.length / 2) - 1;
                    splitPosition = (sortedObjects[splitNumber].aabb[1][1] + sortedObjects[splitNumber + 1].aabb[0][1]) / 2;
                }

                node.splitPosition = splitPosition;

                // 2. Iterate over the objects in the node and assign them to
                //    one of the two or even both arrays (via .push()), depending on their
                //    relative position to the split position.
                //    Use the objects' bounding boxes to decide!
                let objectsLeft = [];
                let objectsRight = [];
                for (let i = 0; i < node.children.length; i++) {
                    let obj = node.children[i];
                    if (node.splitAxis == 'x') {
                        if (obj.aabb[0][0] <= splitPosition) {
                            objectsLeft.push(obj);
                        }
                        if (obj.aabb[1][0] >= splitPosition) {
                            objectsRight.push(obj);
                        }
                    } else {
                        if (obj.aabb[0][1] <= splitPosition) {
                            objectsLeft.push(obj);
                        }
                        if (obj.aabb[1][1] >= splitPosition) {
                            objectsRight.push(obj);
                        }
                    }
                }

                // 3. Create two new leafs with the appropriate objects, aabb and splitAxis.
                //    Afterwards, assign them as the current node's children and push them on
                //    the stack for further splitting.
                let leftChild;
                let rightChild;
                if (node.splitAxis == 'x') {
                    leftChild = new KdNode(false, [[node.aabb[0][0], node.aabb[0][1]], [splitPosition, node.aabb[1][1]]], objectsLeft, 'y');
                    rightChild = new KdNode(false, [[splitPosition, node.aabb[0][1]], [node.aabb[1][0], node.aabb[1][1]]], objectsRight, 'y');
                } else {
                    leftChild = new KdNode(false, [[node.aabb[0][0], node.aabb[0][1]], [node.aabb[1][0], splitPosition]], objectsLeft, 'x');
                    rightChild = new KdNode(false, [[node.aabb[0][0], splitPosition], [node.aabb[1][0], node.aabb[1][1]]], objectsRight, 'x');
                }
                node.children = [leftChild, rightChild];
                stack.push(leftChild);
                stack.push(rightChild);
            }
        }

        console.log(this.root);
    }

    /**
     * Draw the KdTree to the canvas (i.e. draw its nodes recursively starting with the root-node)
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        this.root.draw(context);
    }

    /**
     * Compute Intersection of KdTree with ray (i.e. intersection with the root node)
     * @param {Ray} ray
     * @param {object} context - 2d canvas context, the intersection is logged to
     * @returns {Intersection|null} - intersection if exists
     */
    intersect(ray, context){
        return this.root.intersect(ray, context);
    }
}



function Basic1(canvas) {
    let context = canvas.getContext("2d");
    let nPolygons = 10;
    let scene = initScene();
    let raySource = [0,150];
    let rayTarget = [200,200];

    ///////// Setup Interaction

    let slider = document.getElementById('nPolygons');
    slider.addEventListener("change",function() {
        nPolygons = this.value;
        scene = initScene();
        Render();
    });
    slider.value = 10;
    let checkbox1 = document.getElementById('box');
    checkbox1.addEventListener("change",()=>{
        showAABB = !showAABB;
        Render();
    });
    checkbox1.checked = true;
    let checkbox2 = document.getElementById('tree');
    checkbox2.addEventListener("change",()=>{
        useTree = !useTree;
        Render();
    })
    checkbox2.checked = false;

    let checkbox3 = document.getElementById('tests');
    checkbox3.addEventListener("change",()=>{
        showIntersections = !showIntersections;
        Render();
    })
    checkbox3.checked = false;

    canvas.addEventListener('mousedown', onMouseDown, false);
    function onMouseDown(e) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if (e.ctrlKey) {
            raySource = [x,y];
        } else {
            rayTarget = [x,y];
        }
        Render();
    }

    //////// Render

    Render();
    function Render(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        scene.draw(context);
        let ray = new Ray(raySource, rayTarget);
        let intersection = scene.intersect(ray, context);
        context.strokeStyle="rgba(0,0,0,0.3)";
        context.beginPath();
        context.setLineDash([3, 3]);
        context.moveTo(ray.pos[0],ray.pos[1]);
        context.lineTo(ray.pos[0]+100000*ray.dir[0],ray.pos[1]+100000*ray.dir[1]);
        context.stroke();
        if(intersection){
            context.fillStyle="rgb(0,0,0)";
            context.beginPath();
            context.arc(intersection.point[0], intersection.point[1], 3, 0, 2 * Math.PI);
            context.fill();
            context.strokeStyle="rgb(0,0,0)";
            context.beginPath();
            context.setLineDash([3, 3]);
            context.moveTo(ray.pos[0],ray.pos[1]);
            context.lineTo(intersection.point[0],intersection.point[1]);
            context.stroke();
        }
    }

    // init 2d scene
    function initScene() {
        deterministicRandomResetState();

        let objects = new Array();
        let border = 50.0;

        while (objects.length < nPolygons) {
            let color = [deterministicRandom(), deterministicRandom(), deterministicRandom()];
            let numPoints = Math.floor(deterministicRandom() * 7) + 3;
            let points = new Array(numPoints);
            let middle = [border + deterministicRandom() * (600.0 - 2 * border), border + deterministicRandom() * (300.0 - 2 * border)];
            let deltaPhi = 2 * Math.PI / numPoints;
            for (let i = 0; i < numPoints; i++) {
                let radius = (deterministicRandom()) * border;
                points[i] = [middle[0] + radius * Math.cos(i * deltaPhi), middle[1] + radius * Math.sin(i * deltaPhi)];
            }
            let lines = new Array(numPoints);
            for (let i = 0; i < numPoints; i++) {
                lines[i] = new Line(points[i], points[(i + 1) % numPoints], color);
            }
            let polygon = new Object2D(lines);
            let overlapping = false;
            for (let i = 0; i < objects.length; i++) {
                if (overlaps(polygon, objects[i])) {
                    overlapping = true;
                    break;
                }
            }
            if (!overlapping) {
                objects.push(polygon);
            }
        }
        return new Scene(objects);
    }
}
