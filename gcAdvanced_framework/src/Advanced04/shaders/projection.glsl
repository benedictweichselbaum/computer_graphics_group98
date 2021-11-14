
vec3 projectVertexToPlane(vec3 vertex, vec3 direction, vec3 pointOnPlane, vec3 planeNormal)
{
    vec3 projectedPoint;
    // TODO 4.4 a)
    // Project 'vertex' on the plane defined by 'pointOnPlane' and 'planeNormal'.
    // The projection direction is given by 'direction'.
    float divider = dot(direction, planeNormal);

    float nenner = dot(pointOnPlane - vertex, planeNormal);

    float d = nenner / divider;

    projectedPoint = vertex + (direction * d);


    // vec3 v = vertex - pointOnPlane;
    // vec3 dist = v * planeNormal;
    // projectedPoint = vertex - dist * planeNormal;

    return projectedPoint;
}

