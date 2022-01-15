
--vertex
layout(location = 0) in vec3 in_position;

out vec3 position;

void main() {
    position = vec3(in_position.x,in_position.z,0);
    gl_Position =  vec4(position, 1);
}


--fragment
#define NUM_PLANES 1
#define NUM_SPHERES 4
#define NUM_SPIKE_BALLS 1
#define NUM_CUBES 1

#define NUM_OBJECTS (NUM_PLANES + NUM_SPHERES + NUM_SPIKE_BALLS + NUM_CUBES)

// Object IDs
#define SPHERE_1 0
#define SPHERE_2 1
#define SPHERE_3 2
#define SPHERE_4 3
#define PLANE NUM_SPHERES
#define SPIKEBALL (NUM_SPHERES+NUM_PLANES)
#define CUBE (SPIKEBALL+1)

#include "noise3D.glsl"
#include "rt.h"

#define EPSILON 0.002
#define INFINITY 500
const IntersectionResult noIntersection = IntersectionResult(false, 0,vec3(0),vec3(0),EPSILON);

in vec3 position;

layout (location = 0) uniform vec3 cameraPos = vec3(0,0,0);
layout (location = 1) uniform mat4 projView;
layout (location = 2) uniform vec3 lightDir = normalize(-vec3(-1,5,4));

layout (location = 3) uniform int maxDepth = 5;
layout (location = 4) uniform float shadowFactor = 1;

layout (location = 7) uniform float sunIntensity = 1;
layout (location = 8) uniform float uTime = 0;
layout (location = 9) uniform bool schlick = false;
layout (location = 5) uniform bool reflection = false;
layout (location = 6) uniform bool refraction = false;
layout (location = 10) uniform float airRefractionIndex = 1;
layout (location = 11) uniform int debug = 0;
layout (location = 12) uniform mat4 boxTrans;
// XYZ - center of the sphere
// W - radius of the sphere
layout (location = 20) uniform vec4 objectData[NUM_OBJECTS];
layout (location = 50) uniform Material materials[NUM_OBJECTS];

layout (location = 0) out vec4 out_color;

#include "sky_floor_color.glsl"
#include "intersection_plane_sphere.glsl"
#include "intersection_spikeball.glsl"


float fresnel(float n1, float n2, float cosThetaI)
{
    // TODO 10.2 b)
    // Compute the reflectance with the fresnel equation.
    // Handle total internal reflection!
    return 1;
}


int intersectRayScene(Ray ray, out IntersectionResult result)
{
    int objectId = -1;
    float tMin = INFINITY;
    IntersectionResult tmp;

#if 1
    //compute all intersections
    for (int i = 0; i < NUM_SPHERES; ++i)
    {
        tmp = intersectRaySphere(ray, objectData[i]);
        if (tmp.isIntersection && tmp.tHit < tMin)
        {
            objectId = i;
            result = tmp;
            tMin = tmp.tHit;
        }
    }

    tmp = intersectRayPlane(ray, objectData[PLANE]);
    if (tmp.isIntersection && tmp.tHit < tMin)
    {
        objectId = PLANE;
        result = tmp;
        tMin = tmp.tHit;
    }

    tmp = intersectRaySpikeball(ray, objectData[SPIKEBALL]);
    if (tmp.isIntersection && tmp.tHit < tMin)
    {
        objectId = SPIKEBALL;
        result = tmp;
        tMin = tmp.tHit;
    }
#endif

    ray.origin = vec3(boxTrans * vec4(ray.origin,1));
    ray.direction = normalize(vec3(boxTrans * vec4(ray.direction,0)));
    tmp = intersectRayAabb(ray, vec3(-1),vec3(1));
    if (tmp.isIntersection && tmp.tHit < tMin)
    {
        tmp.normal = normalize(vec3(inverse(boxTrans) * vec4(tmp.normal,0)));
        tmp.hitPosition = (vec3(inverse(boxTrans) * vec4(tmp.hitPosition,1)));
        objectId = CUBE;
        result = tmp;
        tMin = tmp.tHit;

    }

    return objectId;

}



#define MAX_STACK_SIZE 32
#define INTENSITY_EPSILON 0.001


#define push(X) stack[stackSize++] = (X)
#define pop(X) stack[--stackSize]

struct TraceNode
{
    Ray ray;
    float intensity;
    int depth;
};

vec3 trace(Ray primaryRay)
{
    vec3 color = vec3(0.0);

    int stackSize = 0;
    TraceNode stack[MAX_STACK_SIZE];

    // TODO
    // Push primaryRay to stack

    // Process all nodes on the stack
    while(stackSize > 0)
    {
        // TODO
        // Pop top node from stack
        TraceNode node;

        // TODO 10.2 a)
        // Already termination
        // - if intensity < INTENSITY_EPSILON
        // - if depth > maxDepth

        // Compute intersection of the current ray
        IntersectionResult inter;
        int objectId = intersectRayScene(node.ray, inter);

        if(objectId == -1)
        {
            // The ray has hit the sky!
            color += node.intensity * vec3(skyColor(node.ray));
            continue;
        }
        
        // The ray has hit an object!
        Material m = materials[objectId];
        //some special handling for the plane to create the checkerboard pattern
        if(objectId == PLANE) m.color = floorColor(m.color,inter.hitPosition);

        // The refraction indices
        float n1 = airRefractionIndex;
        float n2 = m.refractionN;

        vec3 N = normalize(inter.normal);

        // TODO 10.2 c)
        // - Compute cosTheta
        // - Check for an inner collision and handle it accordingly
        float cosTheta;


        // TODO 10.2 d)
        // Compute the weights R, T, and D
        // Use the function "fresnel".
        // Note: The glass coefficient is stored in the material "m.glass"

        float R = 0;
        float T = 0;
        float D = 1;


        // Debugging of the first tree layer
        // Enable a debug mode in the GUI
        if(debug == 1) return vec3(R);
        if(debug == 2) return vec3(T);
        if(debug == 3) return vec3(D);

        // More debugging stuff to disable reflections or refractions in the GUI
        if(!reflection){ D += R; R = 0;}
        if(!refraction){ D += T; T = 0;}

        //======= Reflection ========
        // TODO 10.2 e)
        // Compute reflected ray.
        // Create a "TraceNode" and push it on the stack

        //======== Refraction ========
        // TODO 10.2 f)
        // Compute refracted ray.
        // Create a "TraceNode" and push it on the stack

        //======= Diffuse =======
        {
            float diffuseCoefficient = max(0.0, dot(N, -lightDir));

            Ray shadowRay = Ray(inter.hitPosition + 0.01 * N, -lightDir);
            IntersectionResult inter2;
            float s = intersectRayScene(shadowRay,inter2) == -1 ? 1.0 : (1-shadowFactor);

            vec3 N = normalize(inter.normal);
            vec3 l = -normalize(lightDir);
            vec3 v = normalize(cameraPos - inter.hitPosition);
            vec3 r = normalize(2.0 * dot(N, l) * N - l);

            vec3 diff = max(0.0, dot(N, l)) * m.color;
            vec3 spec = 0.3 * pow(max(0.0, dot(v, r)), 40)* vec3(1) ;
            vec3 amb = m.color * 0.1;

            color += ((diff +  spec)*s + amb) * sunIntensity * D * node.intensity;

        }
    }
    return color;
}


void main() {

    // Setup primary ray
    vec4 wp = inverse(projView) * vec4(position,1);
    wp = wp / wp.w;
    Ray primaryRay;
    primaryRay.origin = cameraPos;
    primaryRay.direction = normalize( vec3(wp) - cameraPos );

    // Trace Primary Ray
    out_color = vec4(trace(primaryRay),1);
    return;

}
