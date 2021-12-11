#include "quaternion.h"


Quaternion::Quaternion()
{
    real = 1;
    img = vec3(0);
}

Quaternion::Quaternion(vec3 axis, float angle)
{
    // TODO 7.3 a)
    // Initialize with classic axis angle rotation as defined in the lecture.
	// Change the following two lines!
	real = glm::cos(angle / 2);
	img = glm::sin(angle / 2) * axis;
}



mat3 Quaternion::toMat3()
{
    // Conversion Quaternion -> mat3
    // You won't have to implement it this year :).
    mat3 Result;
    float qxx(img.x * img.x);
    float qyy(img.y * img.y);
    float qzz(img.z * img.z);
    float qxz(img.x * img.z);
    float qxy(img.x * img.y);
    float qyz(img.y * img.z);
    float qwx(real * img.x);
    float qwy(real * img.y);
    float qwz(real * img.z);

    Result[0][0] = float(1) - float(2) * (qyy +  qzz);
    Result[0][1] = float(2) * (qxy + qwz);
    Result[0][2] = float(2) * (qxz - qwy);

    Result[1][0] = float(2) * (qxy - qwz);
    Result[1][1] = float(1) - float(2) * (qxx +  qzz);
    Result[1][2] = float(2) * (qyz + qwx);

    Result[2][0] = float(2) * (qxz + qwy);
    Result[2][1] = float(2) * (qyz - qwx);
    Result[2][2] = float(1) - float(2) * (qxx +  qyy);
    return Result;
}

mat4 Quaternion::toMat4()
{
    return mat4(toMat3());
}


float Quaternion::norm() const
{
    // TODO 7.3 b)
    // Compute the L2 norm of this vector.
    return glm::sqrt(dot(*this, *this));
}

Quaternion Quaternion::normalize()
{
    // TODO 7.3 b)
    // Normalize this quaternion.
    float absQ = glm::sqrt(this->real * this->real + this->img.x * this->img.x + this->img.y * this->img.y + this->img.z * this->img.z);
    Quaternion result = Quaternion();
    result.real = this->real / absQ;
    result.img = vec3(this->img.x / absQ, this->img.y / absQ, this->img.z / absQ);
    return result;
}

Quaternion Quaternion::conjugate() const
{
    // TODO 7.3 b)
	// Return the conjugate of this quaternion.
    Quaternion result = Quaternion();
    result.real = this->real;
    result.img = vec3(-this->img.x, -this->img.y, -this->img.z);
    return result;
}

Quaternion Quaternion::inverse() const
{
    // TODO 7.3 b)
	// Return the inverse of this quaternion.
    Quaternion result = Quaternion();
    float sqrNorm = this->norm() * this->norm();
    Quaternion conj = conjugate();
    result.real = conj.real / sqrNorm;
    result.img = vec3(conj.img.x / sqrNorm, conj.img.y / sqrNorm, conj.img.z / sqrNorm);
    return result;
}



float dot(Quaternion x, Quaternion y)
{
    // TODO 7.3 b)
	// Compute the dot product of x and y.
    return x.real * y.real + glm::dot(x.img, y.img);
}



Quaternion operator*(Quaternion l, Quaternion r)
{
    // TODO 7.3 c)
    // Perform quaternion-quaternion multiplication as defined in the lecture.
	// Hint: You can use the glm function for vector products.
    Quaternion result = Quaternion();
    result.real = l.real * r.real - l.img.x * r.img.x - l.img.y * r.img.y - l.img.z * r.img.z;
    result.img = vec3(
        l.real * r.img.x + r.real * l.img.x + l.img.y * r.img.z - r.img.y * l.img.z,
        l.real * r.img.y + r.real * l.img.y + l.img.z * r.img.x - r.img.z * l.img.x,
        l.real * r.img.z + r.real * l.img.z + l.img.x * r.img.y - r.img.x * l.img.y
    );
    return result;
}

vec3 operator*(Quaternion l, vec3 r)
{
    // TODO 7.3 c)
    // Rotate the vector 'r' with the quaternion 'l'.
    Quaternion v = Quaternion();
    v.real = 0;
    v.img = r;
    return (l.normalize() * v * l.normalize().inverse()).img;
}

Quaternion operator*(Quaternion l, float r)
{
    // TODO 7.3 c)
    // Perform quaternion-scalar multiplication.
    Quaternion result = Quaternion();
    result.real = l.real * r;
    result.img = r * l.img;
    return result;
}

Quaternion operator+(Quaternion l, Quaternion r)
{
    // TODO 7.3 c)
	// Return the sum of the two quaternions.
    Quaternion result = Quaternion();
    result.real = l.real + r.real;
    result.img = vec3(l.img.x + r.img.x, l.img.y + r.img.y, l.img.z + r.img.z);
    return result;
}



Quaternion slerp(Quaternion x, Quaternion y, float t)
{
	float epsilon = 0.00001;

    // TODO 7.3 d)
    // Spherical linear interpolation (slerp) of quaternions.
    Quaternion result;

    float slerpTest = dot(x, y);
    if (slerpTest <= 1 - epsilon) {
        float omega = glm::acos(dot(x, y));
        result = (x * (glm::sin((1 - t) * omega) / glm::sin(omega))) + (y * (glm::sin(t * omega) / glm::sin(omega)));
    } else {
        vec4 xV = vec4(x.real, x.img.x, x.img.y, x.img.z);
        vec4 yV = vec4(y.real, y.img.x, y.img.y, y.img.z);
        vec4 interpolation = glm::mix(xV, yV, t);
        result.real = interpolation.x;
        result.img = vec3(interpolation.y, interpolation.z, interpolation.w);
    }
    // Compute the interpolated quaternion and return it normalized.
	
    return result;
}

std::ostream& operator<<(std::ostream &str, Quaternion r)
{
    str << "( " << r.real << "," << r.img.x << "," << r.img.y << "," << r.img.z << " )";
        return str;
}
