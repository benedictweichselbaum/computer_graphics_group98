

IntersectionResult intersectRayPlane(Ray ray, vec4 planeData) {
    vec3 n = planeData.xyz;
    float k = planeData.w;

    // TODO 9.2 b)
    // Ray-Plane Intersection
	// Have a look at the definition of struct "IntersectionResult" in rt.h.
	// You can use "EPSILON" defined in rt.glsl.
    float denom = dot(n, normalize(ray.direction));
    if (denom == 0) return noIntersection;

    float t = (k - dot(n, ray.origin)) / denom;

    if (t < 0) return noIntersection;

    vec3 hit = t * normalize(ray.direction) + ray.origin;

    return IntersectionResult(true, t, n, hit, EPSILON);  
}



IntersectionResult intersectRaySphere(Ray ray, vec4 sphereData) {
    vec3 c = sphereData.xyz;
    float r = sphereData.w;

    // TODO 9.2 c)
    // Ray-Sphere Intersection
	// You can use "noIntersection" defined in rt.glsl.
	// Note that t has to be positive for the sphere to be in front of the camera:
	// Make sure that you cannot see objects behind the camera.

    float b = dot(2 * normalize(ray.direction), ray.origin - c);
    float cd = dot(ray.origin - c, ray.origin - c) - r * r;

    float dis = b * b - 4 * cd;

    if (dis < 0) return noIntersection;
    else if (dis == 0) {
        float t = (-b + sqrt(dis)) / 2;

        if (t > 0) {
            vec3 hit = normalize(ray.direction) * t + ray.origin;
            return IntersectionResult(true, t, normalize(hit - c), hit, EPSILON);
        } else return noIntersection;
    } else {
        float t1 = (-b + sqrt(dis)) / 2;
        float t2 = (-b - sqrt(dis)) / 2;

        vec3 hit1 = normalize(ray.direction) * t1 + ray.origin;
        vec3 hit2 = normalize(ray.direction) * t2 + ray.origin;

        if (t1 > t2) {
            if (t2 > 0) return IntersectionResult(true, t2, normalize(hit2 - c), hit2, EPSILON);
            else return noIntersection;
        } else {
            if (t1 > 0) return IntersectionResult(true, t1, normalize(hit1 - c), hit1, EPSILON);
            else return noIntersection;
        }
    }

    return noIntersection;
}
