
////////////////////////////////////////////////////////
/////////////////////   HELPER   ///////////////////////
////////////////////////////////////////////////////////

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
 * Determines if two given 2D-vectors are parallel
 * @param {number[]} dir0 - vec2
 * @param {number[]} dir1 - vec2 
 * @returns true if dir0 is parallel to dir1, false otherwise
 */
function isVec2Parallel(dir0, dir1) {
    if (dir0[0] == 0.0 && dir1[0] == 0.0) return true;
    if (dir0[1] == 0.0 && dir1[1] == 0.0) return true;
    if (dir0[0] / dir1[0] == dir0[1] / dir1[1]) return true;
    return false;
}


////////////////////////////////////////////////////////
////////////////////   MATERIAL   //////////////////////
////////////////////////////////////////////////////////

const MaterialType = {
    lightSource: 0,
    perfectMirror: 1,
    perfectDiffuse: 2
};
class Material {
    /**
     * Material description. Parameters color, type, and args are stored unchanged as properties of the object.
     * @param {number[]} color - color triple [r,g,b] each in float range [0, ...] (1 is bright, but >1 is possible)
     * @param {number} type - 1: perfect mirror, 2: perfect diffuse (see MaterialType)
     * @param {*} args - any additional data (stored in this.args)
     */
    constructor(color, type, args) {
        this.color = color;
        this.type = type; // 1: perfect mirror, 2: perfect diffuse
        this.args = args;
    }
}


////////////////////////////////////////////////////////
//////////////   INTERSECTION POINT   //////////////////
////////////////////////////////////////////////////////

class Intersection {
    /**
     * @param {number} t_ray - ray t-value  (point = ray.p0 + t_ray * ray.dir)
     * @param {Material} material - material of intersected surface
     * @param {vec2} normal - surface normal at intersection point
     * @param {vec2} point - intersection point
     */
    constructor(t_ray, material, normal, point) {
        this.t_ray = t_ray;
        this.material = material;
        this.normal = vec2.clone(normal);
        this.point = vec2.clone(point);
    }

    log() {
        console.log("intersection");
        console.log("t: " + this.t_ray);
        console.log("material: " + this.material.type);
        console.log("normal: " + this.normal[0] + ", " + this.normal[1]);
        console.log("point: " + this.point[0] + ", " + this.point[1]);
    }
}


////////////////////////////////////////////////////////
/////////////////////   RAY   //////////////////////////
////////////////////////////////////////////////////////

class Ray {
    /**
     * @param {vec2} p0 - ray start position
     * @param {vec2} dir - ray direction (stored normalized)
     * @param {number} [generation=0] - recursion depth (integer), primary rays:0, secondary rays: [1,2,...], shadow rays:-1
     * @param {number} [t_min=0.0001] - minimal t-value, where intersections are valid
     * @param {number} [t_max=10000.0] - maximal t-value, where intersections are valid
     */
    constructor(p0, dir, generation, t_min, t_max) {
        if (!generation) generation = 0;
        if (!t_min) t_min = 0.0001;
        if (!t_max) t_max = 10000.0;
        this.p0 = vec2.clone(p0);
        this.dir = vec2.clone(dir);
        vec2.normalize(this.dir, this.dir);
        this.generation = generation;
        this.t_min = t_min;
        this.t_max = t_max;
    }

    /**
     * Ray content is cloned to this
     * @param {Ray} ray - ray to be cloned
     */
    clone(ray) {
        this.p0 = vec2.clone(ray.p0);
        this.dir = vec2.clone(ray.dir);
        this.generation = ray.generation;
        this.t_min = ray.t_min;
        this.t_max = ray.t_max;
    }

    /**
     * Get a Point on the ray
     * @param {number} t 
     * @returns {vec2} point at ray.p0 + t * ray.dir;
     */
    eval(t) {
        return vec2.fromValues(this.p0[0] + t * this.dir[0], this.p0[1] + t * this.dir[1]);
    }

    /**
     * Create a reflected ray from this ray, depending on the type of the intersection.
     * @param {Intersection} intersection 
     * @returns {Ray|null} reflected ray (if exists)
     */
    reflect(intersection) {

        // TODO 9.1c)   Implement the reflection function for perfect diffuse and perfect reflecting material.
        //              Make use of the attributes of the intersection (see definition above).

        switch (intersection.material.type) {
            case MaterialType.perfectMirror:
                {
                    // TODO: Reflect the ray perfectly!
                    // ...
                    // return new Ray(intersection.point, reflectedDir, this.generation + 1);
                    let reflectedDir = vec2.fromValues(0, 0);
                    let l = vec2.fromValues(0, 0);
                    vec2.normalize(l, vec2.fromValues(-this.dir[0], -this.dir[1]));
                    
                    vec2.scale(reflectedDir, intersection.normal, 2 * vec2.dot(intersection.normal, l));
                    vec2.sub(reflectedDir, reflectedDir, l);
                    vec2.normalize(reflectedDir, reflectedDir);

                    console.log(reflectedDir)

                    return new Ray(intersection.point, reflectedDir, this.generation + 1);
                }
            case MaterialType.perfectDiffuse:
                {
                    // TODO: Reflect the ray to a random direction in the hemisphere around the intersection normal!
                    // Hint: - Use Math.random() to generate a random number.
                    //       - To sample a direction in the hemisphere around the normal,
                    //         you can rotate the normal with a random angle between [-PI/2, +PI/2].
                    //         To do so you can use mat2.fromRotation(...) and vec2.transformMat2(...)!
                    // ...
                    // return new Ray(intersection.point, reflectedDir, this.generation + 1);

                    let rotationAngle = Math.PI * Math.random() - (Math.PI / 2);
                    let rotationMatrix = mat2.create();
                    mat2.fromRotation(rotationMatrix, rotationAngle);
                    let diffuseNormal = vec2.create();
                    vec2.copy(diffuseNormal, intersection.normal);
                    vec2.transformMat2(diffuseNormal, diffuseNormal, rotationMatrix);
                    vec2.normalize(diffuseNormal, diffuseNormal);

                    return new Ray(intersection.point, diffuseNormal, this.generation + 1);
                }
        }


        return null;
    }

    /**
     * Draw a dashed line representing the ray (bound by t_min and t_max) to the context. (shadow rays in yellow (generation==-1), others gray)
     * @param {object} context - 2d canvas context
    */
    draw(context) {
        if (this.generation == -1) {
            context.strokeStyle = 'rgb(240, 240, 0)';
            context.setLineDash([2, 2]);
        }
        else {
            let v = 200;
            context.strokeStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
            context.setLineDash([4, 2]);
        }

        let p0 = this.eval(this.t_min);
        let p1 = this.eval(this.t_max);
        context.beginPath();
        context.moveTo(p0[0], p0[1]);
        context.lineTo(p1[0], p1[1]);
        context.stroke();
    }
}


////////////////////////////////////////////////////////
/////////////   Line - 2D Primitive   //////////////////
////////////////////////////////////////////////////////

class Line {
    /**
     * 2D Primitive Line
     * @param {vec2} p0 - line start point 
     * @param {vec2} p1 - line end point
     * @param {Material} material - line material
     */
    constructor(p0, p1, material) {
        this.p0 = vec2.clone(p0);
        this.p1 = vec2.clone(p1);
        this.material = material;
    }

    /**
     * Draw the line to the context (using its material color)
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        context.setLineDash([1, 0]);
        context.strokeStyle = 'rgb(' + Math.floor(255 * this.material.color[0]) + ',' + Math.floor(255 * this.material.color[1]) + ',' + Math.floor(255 * this.material.color[2]) + ')';
        context.beginPath();
        context.moveTo(this.p0[0], this.p0[1]);
        context.lineTo(this.p1[0], this.p1[1]);
        context.stroke();
    }

    /**
     * @returns {vec2} direction from p0 to p1 (not normalized)
     */
    direction() {
        let lineDir = vec2.create();
        vec2.sub(lineDir, this.p1, this.p0);
        return lineDir;
    }

    /**
     * @returns {vec2} - normal of the line (normalized)
     */
    normal() {
        let lineDir = this.direction();
        vec2.normalize(lineDir, lineDir)
        return [-lineDir[1], lineDir[0]];
    }

    /**
     * Compute the intersection of the line with a ray
     * @param {Ray} ray -
     * @returns {Intersection|null} - depending on if intersection btw. line and ray exists (in the specified ray bounds t_min t_max)
     */
    intersect(ray) {
        let result = null;

        let lineDir = this.direction();
        if (!isVec2Parallel(lineDir, ray.dir)) {

            // TODO 9.1b)   Intersect the ray with the line.
            //              If there is an intersection, return an Intersection "object",
            //              e.g. result = new Intersection(t_intersect, this.material, this.normal(), intersectionPoint);!
            //              Only handle the case where you have a single intersection or no intersection (ray is not parallel to line).
            //              Also be sure to check whether the distance of the intersection lies between t_min and t_max.

            let denominatorT = vec2.fromValues(0, 0);
            vec2.sub(denominatorT, this.p0, ray.p0);
            denominatorT = vec2.cross(vec3.fromValues(0, 0, 0), denominatorT, lineDir)[2];

            let dividerT = vec2.cross(vec3.fromValues(0, 0, 0), ray.dir, lineDir)[2];
            let t = denominatorT / dividerT;

            if (t < ray.t_min || t > ray.t_max) return result;


            let denominatorU = vec2.fromValues(0, 0);
            vec2.sub(denominatorU, ray.p0, this.p0);
            denominatorU = vec2.cross(vec3.fromValues(0, 0, 0), denominatorU, ray.dir)[2];

            let dividerU = vec2.cross(vec3.fromValues(0, 0, 0), lineDir, ray.dir)[2];

            let u = denominatorU / dividerU;

            if (u < 0 || u > 1) return result;

            let intersectionPoint = vec2.fromValues(ray.p0[0], ray.p0[1]);
            let addVec = vec2.fromValues(0, 0);
            vec2.scale(addVec, ray.dir, t);
            vec2.add(intersectionPoint, intersectionPoint, addVec);

            result = new Intersection(t, this.material, this.normal(), intersectionPoint);

        }

        return result;
    }
}


////////////////////////////////////////////////////////
/////////////   Circle - 2D Primitive   ////////////////
////////////////////////////////////////////////////////

class Circle {
    /**
     * Circle Primitive
     * @param {vec2} mid - circle center
     * @param {number} radius 
     * @param {Material} material 
     */
    constructor(mid, radius, material) {
        this.mid = vec2.clone(mid);
        this.radius = radius;
        this.material = material;
    }

    /**
     * Draw the circle to the context (in color of the material)
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        context.setLineDash([1, 0]);
        context.strokeStyle = 'rgb(' + Math.floor(255 * this.material.color[0]) + ',' + Math.floor(255 * this.material.color[1]) + ',' + Math.floor(255 * this.material.color[2]) + ')';
        context.fillStyle = 'rgb(' + Math.floor(255 * this.material.color[0]) + ',' + Math.floor(255 * this.material.color[1]) + ',' + Math.floor(255 * this.material.color[2]) + ')';
        context.beginPath();
        context.arc(this.mid[0], this.mid[1], this.radius, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    }

    /**
     * Compute intersection of the ray with the circle
     * @param {Ray} ray 
     * @returns {Intersection|null} - intersection object (if an intersection of ray and circle exist in the ray bounds)
     */
    intersect(ray) {
        let result = null;

        if (ray.generation == -1) return null;

        let b_vec = vec2.create();
        vec2.sub(b_vec, ray.p0, this.mid);

        let a = vec2.dot(ray.dir, ray.dir);
        let b = 2.0 * vec2.dot(ray.dir, b_vec);
        let c = vec2.dot(b_vec, b_vec) - this.radius * this.radius;

        let t;
        if (a == 0.0) {
            t = -c / b;
        } else {
            let d = b * b / (4 * a * a) - c / a;
            if (d > 0.0) t = -b / (2.0 * a) - Math.sqrt(d);
        }

        if (t) {
            if (t > 0) {
                let p = [ray.p0[0] + t * ray.dir[0], ray.p0[1] + t * ray.dir[1]];
                let normal = vec2.create();
                vec2.sub(normal, p, this.mid);
                vec2.normalize(normal, normal);
                result = new Intersection(t, this.material, normal, p);
            }
        }

        return result;
    }
}


////////////////////////////////////////////////////////
//////////////////   2D Object   ///////////////////////
////////////////////////////////////////////////////////

class Object2D {
    /**
     * 2D Object (collection of primitives (lines))
     * @param {Line[]} primitives - lines the object consists of
     */
    constructor(primitives) {
        this.primitives = primitives;
    }

    /**
     * Compute an intersection with the object (i.e. the closest intersection of all its primitives)
     * @param {Ray} ray 
     * @returns {Intersection|null} - closest (smallest t_ray) intersection if it exists
     */
    intersect(ray) {
        let result = null;

        for (let i = 0; i < this.primitives.length; ++i) {
            let intersection = this.primitives[i].intersect(ray);
            if (intersection) {
                if (!result) result = intersection;
                else if (result.t_ray > intersection.t_ray) result = intersection;
            }
        }

        return result;
    }

    /**
     * Draw the object to the context (i.e. draw all its primitives)
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        for (let i = 0; i < this.primitives.length; ++i) {
            this.primitives[i].draw(context);
        }
    }
}


////////////////////////////////////////////////////////
/////////////////   Light Source   /////////////////////
////////////////////////////////////////////////////////

class LightSource {
    /**
     * @param {object[]} primitives - Lines or Circles, the light-geometry consists of
     * @param {number} type - integer type of the light source, point light: 0
     * @param {*[]} args array of any additional data stored in this.args
     */
    constructor(primitives, type, args) {
        this.primitives = primitives;
        this.type = type; // 0 : point light source
        this.args = args;
    }

    /**
     * Compute an intersection with the light source (i.e. closest intersection of all its primitives)
     * @param {Ray} ray 
     * @returns {Intersection|null} - closest (smallest t_ray) intersection if it exists
     */
    intersect(ray) {
        let result = null;
        for (let i = 0; i < this.primitives.length; ++i) {
            let intersection = this.primitives[i].intersect(ray);
            if (intersection) {
                if (!result) result = intersection;
                else if (result.t_ray > intersection.t_ray) result = intersection;
            }
        }
        return result;
    }

    /**
     * Draw the light to the context (i.e. draw all its primitives)
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        for (let i = 0; i < this.primitives.length; ++i) {
            this.primitives[i].draw(context);
        }
    }

    /**
     * Sample one point on the light source.
     * i.e. always the light-center for point-light-sources
     * @returns {vec2} sample point
     */
    sample() {
        switch (this.type) {
            case 0: return vec2.fromValues(this.args[0], this.args[1]); // point light source
            default: return vec2.fromValues(this.args[0], this.args[1]);
        }
    }
}


////////////////////////////////////////////////////////
///////////////////   2D Scene   ///////////////////////
////////////////////////////////////////////////////////

class Scene {
    /**
     * Scene description (i.e. list of objects and light sources) (parameters stored directly in object)
     * @param {Object2D[]} objects 
     * @param {LightSource[]} lightSources 
     */
    constructor(objects, lightSources) {
        this.objects = objects;
        this.lightSources = lightSources;
    }

    /**
     * Compute an intersection with the Scene (i.e. closest intersection of all its Objects and LightSources)
     * @param {Ray} ray 
     * @returns {Intersection|null} - closest (smallest t_ray) intersection if it exists
     */
    intersect(ray) {
        let result = null;

        // intersect objects
        for (let i = 0; i < this.objects.length; ++i) {
            let intersection = this.objects[i].intersect(ray);
            if (intersection) {
                if (!result) result = intersection;
                else if (result.t_ray > intersection.t_ray) result = intersection;
            }
        }

        // intersect light sources
        for (let i = 0; i < this.lightSources.length; ++i) {
            let intersection = this.lightSources[i].intersect(ray);
            if (intersection) {
                if (!result) result = intersection;
                else if (result.t_ray > intersection.t_ray) result = intersection;
            }
        }

        return result;
    }

    /**
     * Draw the Scene (i.e. draw all its Objects and LightSources) to the context
     * @param {object} context - 2d canvas context
     */
    draw(context) {
        // draw objects
        for (let i = 0; i < this.objects.length; ++i) {
            this.objects[i].draw(context);
        }
        // draw lightSources
        for (let i = 0; i < this.lightSources.length; ++i) {
            this.lightSources[i].draw(context);
        }
    }
}


/////////////////////////////////////////////////
////////////////   Basic 9.1   //////////////////
/////////////////////////////////////////////////


function Basic1(canvas) {
    let context = canvas.getContext("2d");
    let scene = initScene();

    // ray tracing parameters
    let maxRecursionDepth = 1;
    let nPixels = 4;
    let nBRDFSamples = 2;
    let showRays = true;

    // Interaction
    let depth = document.getElementById("nDepth")
    depth.addEventListener("change",function(){
        maxRecursionDepth = this.value;
        Render();
    });
    depth.value = "1";

    let pixels = document.getElementById("nPixels")
    pixels.addEventListener("change",function(){
        nPixels = this.value;
        Render();
    },)
    pixels.value = "4";

    let samples = document.getElementById("nSamples")
    samples.addEventListener("change",function(){
        nBRDFSamples = this.value;
        Render();
    });
    samples.value = "2";

    document.getElementById("showRays")
        .addEventListener("change",()=>{
        showRays=!showRays;
        Render();
    });

    Render();


    // init 2d scene
    function initScene() {
        let material_grayMirror = new Material([0.8, 0.8, 0.8], MaterialType.perfectMirror, []);
        let box_grayMirror = new Object2D([
            new Line([200.0, 270.0], [100.0, 290.0], material_grayMirror),
            new Line([100.0, 290.0], [250.0, 290.0], material_grayMirror),
            new Line([250.0, 290.0], [250.0, 270.0], material_grayMirror),
            new Line([250.0, 270.0], [200.0, 270.0], material_grayMirror),
        ]);

        let material_greenDiffuse = new Material([0.0, 1.0, 0.0], MaterialType.perfectDiffuse, []);
        let box_greenDiffuse = new Object2D([
            new Line([280.0, 10.0], [280.0, 60.0], material_greenDiffuse),
            new Line([280.0, 60.0], [330.0, 60.0], material_greenDiffuse),
            new Line([330.0, 60.0], [330.0, 10.0], material_greenDiffuse),
            new Line([330.0, 10.0], [280.0, 10.0], material_greenDiffuse)
        ]);
        
        let material_redDiffuse = new Material([1.0, 0.0, 0.0], MaterialType.perfectDiffuse, []);
        let box_redDiffuse = new Object2D([
            new Line([100.0, 10.0], [100.0, 100.0], material_redDiffuse),
            new Line([100.0, 100.0], [190.0, 100.0], material_redDiffuse),
            new Line([190.0, 100.0], [190.0, 10.0], material_redDiffuse),
            new Line([190.0, 10.0], [100.0, 10.0], material_redDiffuse)
        ]);


        let material_darkDiffuse = new Material([0.5, 0.5, 0.5], MaterialType.perfectDiffuse, []);
        let box_sceneBounds = new Object2D([
            new Line([0.0, 300.0], [0.0, 0.0], material_darkDiffuse),
            new Line([600.0, 300.0], [0.0, 300.0], material_darkDiffuse),
            new Line([600.0, 0.0], [600.0, 300.0], material_darkDiffuse),
            new Line([0.0, 0.0], [600.0, 0.0], material_darkDiffuse)
        ]);


        let material_yellowLight = new Material([3.0, 3.0, 0.0], MaterialType.lightSource, []);
        let light = new LightSource([new Circle([500.0, 200.0], 5.0, material_yellowLight)], 0, [500.0, 200.0]);

        return new Scene(
            [   box_grayMirror,
                box_redDiffuse,
                box_greenDiffuse,
                box_sceneBounds],
            [   light]
        );
    }

    /**
     * Recursive ray tracing
     * @param {Ray} ray -
     * @param {number} iter - recursive call depth (primary rays: 0 )
     * @param {number} weightRay - contribution of the current ray light to the final result
     * @returns {number[]} - color triple [r,g,b] of estimated light coming from the ray direction
     */
    function traceRay(ray, iter, weightRay) {
        if (iter >= maxRecursionDepth) return; // max recursion depth
        if (weightRay < 0.01) return; // result does not contribute much to the final color -> break to save performance

        // intersect ray with geometry
        let intersection = scene.intersect(ray);
        if (!intersection) {
            if (showRays) ray.draw(context);
            return null;
        } else {
            ray.t_max = intersection.t_ray;

            // draw ray
            if (showRays) ray.draw(context);

            if (intersection.material.type == MaterialType.lightSource) {
                return intersection.material.color;
            }

            // compute indirect light
            let L_indirect = [0.0, 0.0, 0.0];
            let nSamples = nBRDFSamples;
            if (intersection.material.type == MaterialType.perfectMirror) nSamples = 1;
            for (let s = 0; s < nSamples; ++s) {
                let secondary_ray = ray.reflect(intersection);
                if (secondary_ray) {
                    let weight = vec2.dot(intersection.normal, secondary_ray.dir);

                    // recursive call
                    let L_indirect_sample = traceRay(secondary_ray, iter + 1, weightRay * weight);
                    if (L_indirect_sample) vec3.scaleAndAdd(L_indirect, L_indirect, L_indirect_sample, weight);
                }
            }
            L_indirect = [L_indirect[0] / nSamples, L_indirect[1] / nSamples, L_indirect[2] / nSamples];

            // compute direct light
            let L_direct = [0.0, 0.0, 0.0];
            if (intersection.material.type != MaterialType.perfectMirror) {
                for (let i = 0; i < scene.lightSources.length; ++i) {
                    let nSamplesLight = 1;
                    let light = scene.lightSources[i];
                    for (let s = 0; s < nSamplesLight; ++s) {
                        // sample point light source
                        let sample = light.sample();

                        let dir = vec2.create();
                        vec2.sub(dir, sample, intersection.point);
                        let dist = vec2.length(dir);
                        if (vec2.dot(dir, intersection.normal) > 0.0) {
                            let light_ray = new Ray(intersection.point, dir, -1, 0.001, dist - 0.001);
                            if (!scene.intersect(light_ray)) {
                                let weight = vec2.dot(intersection.normal, light_ray.dir);
                                vec3.scaleAndAdd(L_direct, L_direct, light.primitives[0].material.color, weight);
                                // draw rays to light source
                                light_ray.t_max = dist;
                                if (showRays)
                                    light_ray.draw(context);
                            }
                        }
                    }
                }
            }

            let L = vec3.create();
            vec3.add(L, L_direct, L_indirect);

            let result = [intersection.material.color[0] * L[0],
            intersection.material.color[1] * L[1],
            intersection.material.color[2] * L[2]]

            // draw intersection point with light information
            {
                setFillStyle(context, result);
                context.beginPath();
                context.arc(intersection.point[0], intersection.point[1], 4 * weightRay, 0, 2 * Math.PI);
                context.fill();
            }

            return result;
        }
    }

    /**
     * Draw the scene,
     * start ray trace recursion with primary rays for each sensor pixel 
     * and draw the tracing result-colors
     */
    function Render() {
        context.clearRect(0, 0, 600, 300);
        context.font = "bold 12px Georgia";

        // draw scene
        scene.draw(context);

        // draw text
        context.fillStyle = 'rgb(0,0,0)';
        context.fillText("diffuse", 125, 60);
        context.fillText("diffuse", 283, 40);
        context.fillText("mirror", 200, 285);
        context.fillText("sensor", 2, 190);
        context.fillText("point light", 510, 210);

        // camera parameters
        let nearPlane = 20; // in world space units
        let sensorHeight = 50.0; // in world space units
        let eye = vec2.fromValues(0.0, 150.0); // camera origin
        let viewDir = vec2.fromValues(1.0, 0.0); // has to be normalized
        let pixelSize = sensorHeight / nPixels;
        let sensorSpan = vec2.fromValues(-viewDir[1], viewDir[0]);
        let backgroundColor = [0.0, 0.0, 0.0];
        let pixelColors = [];

        // iterate over all pixels of the virtual sensor
        for (let pixelIdx = 0; pixelIdx < nPixels; ++pixelIdx) {
            // compute pixel position in world space
            let y = pixelSize * (pixelIdx - nPixels / 2.0 + 0.5);
            let pixelPos = vec2.fromValues(
                eye[0] + nearPlane * viewDir[0] + sensorSpan[0] * y,
                eye[1] + nearPlane * viewDir[1] + sensorSpan[1] * y);

            let ray;
            // TODO 9.1a)   Set up primary ray based on the camera origin (eye) and the current pixel position (pixelPos).
            //              ray = new Ray(p0, dir);
            let d = vec2.fromValues(pixelPos[0] - eye[0], pixelPos[1] - eye[1]);
            vec2.normalize(d, d);
            ray = new Ray(eye, d);


            let pixelColor;
            // TODO 9.1a)   Start ray tracing.
            //              Use the global variable maxRecursionDepth and a initial weight of 1.0.
            //              pixelColor = traceRay(...);

            pixelColor = traceRay(ray, 0, 1.0);

            if (pixelColor) pixelColors.push(pixelColor);
            else pixelColors.push(backgroundColor);
        }

        // draw pixels
        for (let pixelIdx = 0; pixelIdx < nPixels; ++pixelIdx) {
            // compute pixel position in world space
            let y = pixelSize * (pixelIdx - nPixels / 2.0);
            let pixelPos = vec2.fromValues(
                eye[0] + nearPlane * viewDir[0] + sensorSpan[0] * y,
                eye[1] + nearPlane * viewDir[1] + sensorSpan[1] * y);
            // draw pixel
            context.setLineDash([1, 0]);
            setFillStyle(context, pixelColors[pixelIdx]);
            context.beginPath();
            context.rect(pixelPos[0], pixelPos[1], 3, pixelSize);
            context.fill();
        }
    }
}
