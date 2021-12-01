vec2 cartesianToSpherical(vec3 n)
{
    // TODO 6.4 a)
    // Convert cartesian coordinates to spherical coordinates. 
    // For computing the inverse tangent, use the two-argument
    // version of atan().
    float theta = atan(n.z, n.x);
    float phi = acos(n.y);
    return vec2(theta, phi);
}

vec3 sphericalToCartesian(vec2 a)
{
    float theta = a.x;
    float phi = a.y;

    // TODO 6.4 a)
    // Convert spherical coordinates to cartesian coordinates.
    return vec3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta));
}


vec2 sphericalToTexture(vec2 a)
{
    const float PI = 3.14159265;
    float theta = a.x; //in range [-PI,PI]
    float phi = a.y; // in range [0,PI]

    // TODO 6.4 a)
    // Compute texture coordinates from spherical coordinates.
	// Do not forget to mirror both coordinates to have the north pole at the top 
	// and France located west of Germany! ;)
    float u = (theta / (2.0 * PI)) + 0.5;
    float v = (phi / PI);

    return vec2(1 - u, 1- v);
}

