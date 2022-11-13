export class MathUtil {

    /**
     * From: https://gist.github.com/andfaulkner/c4ad12a72d29bcd653eb4b8cca2ae476
     * Calculate angle between 3 points in 3D space.
     * Note: assumes we want 1 vector to run from coord1 -> coord2, and the other
     * from coord3 -> coord2.
     *
     * @param {x: number; y: number; z: number} coord1 1st (3D) coordinate
     * @param {x: number; y: number; z: number} coord2 2nd (3D) coordinate
     * @param {x: number; y: number; z: number} coord3 3rd (3D) coordinate
     *
     * @return {number} Angle between the 3 points
     */
    static angleBetween3DCoords(coord1, coord2, coord3) {
        // Calculate vector between points 1 and 2
        const v1 = {
            x: coord1.x - coord2.x,
            y: coord1.y - coord2.y,
            z: coord1.z - coord2.z,
        };

        // Calculate vector between points 2 and 3
        const v2 = {
            x: coord3.x - coord2.x,
            y: coord3.y - coord2.y,
            z: coord3.z - coord2.z,
        };

        // The dot product of vectors v1 & v2 is a function of the cosine of the
        // angle between them (it's scaled by the product of their magnitudes).

        // Normalize v1
        const v1mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const v1norm = {
            x: v1.x / v1mag,
            y: v1.y / v1mag,
            z: v1.z / v1mag,
        };

        // Normalize v2
        const v2mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
        const v2norm = {
            x: v2.x / v2mag,
            y: v2.y / v2mag,
            z: v2.z / v2mag,
        };

        // Calculate the dot products of vectors v1 and v2
        const dotProducts = v1norm.x * v2norm.x + v1norm.y * v2norm.y + v1norm.z * v2norm.z;

        // Extract the angle from the dot products
        const angle = (Math.acos(dotProducts) * 180.0) / Math.PI;

        // Round result to 3 decimal points and return
        return Math.round(angle * 1000) / 1000;
    }

    static angleToPoint(angle) {
        let radians = angle * (Math.PI / 180);
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);
        return { x: cos, y: sin }
    }

    // From: https://stackoverflow.com/questions/56536575/how-can-i-calculate-the-3d-angle-between-two-points
    /** @param {number} angle */
    static normalizeAngle(angle) {
        if (angle > 180) {
            return angle - 360;
        }
        if (angle < -180) {
            return 360 + angle;
        }
        return angle;
    }

    // From: https://stackoverflow.com/questions/56536575/how-can-i-calculate-the-3d-angle-between-two-points
    /** @param {{x: number, y: number}} a @param {{x: number, y: number}} b */
    static getAngleBetweenPoints(a, b) {
        let dy = b.y - a.y;
        let dx = b.x - a.x;
        let theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        return theta;
    }

    // From: https://stackoverflow.com/questions/56536575/how-can-i-calculate-the-3d-angle-between-two-points
    /** @param {{x: number, y: number, z: number}} vert1 @param {{x: number, y: number, z: number}} vert2 */
    static getAngleBetweenVertices(vert1, vert2) {
        let offset = MathUtil.getOffsetBetweenVertices(vert1, vert2);

        // let yawAngle = this.normalizeAngle(this.getAngleBetweenPoints({ x: 0, y: 0 }, { x: offset.z, y: offset.x })); // Calculated by looking at the offset from above
        // let rotated = this.rotatePointAround({ x: offset.x, y: offset.z }, yawAngle, { x: 0, y: 0 });
        // offset = { x: rotated.x, y: offset.y, z: rotated.y };

        // let pitchAngle = this.normalizeAngle(this.getAngleBetweenPoints({ x: 0, y: 0 }, { x: offset.z, y: offset.y })); // Calculated by looking at the offset from the side
        // rotated = this.rotatePointAround({ x: offset.z, y: offset.y }, pitchAngle, { x: 0, y: 0 });
        // offset = { x: offset.x, y: rotated.y, z: rotated.y };

        // return {
        //     x: pitchAngle,
        //     y: 0,
        //     z: 0
        // }

        let topViewOffset = Math.hypot(offset.x, offset.z);
        let pitchAngle = this.normalizeAngle(this.getAngleBetweenPoints({ x: 0, y: 0 }, { x: topViewOffset, y: offset.y })); // Calculated by looking at the offset from the side
        let yawAngle = 0;

        if (offset.x === 0 && offset.z === 0) {
            yawAngle = this.normalizeAngle(this.getAngleBetweenPoints({ x: 0, y: 0 }, { x: -offset.y, y: topViewOffset })); // Calculated by looking at the offset from the side
        } else {
            yawAngle = this.normalizeAngle(this.getAngleBetweenPoints({ x: 0, y: 0 }, { x: offset.z, y: offset.x })); // Calculated by looking at the offset from above
        }

        return {
            x: pitchAngle,
            y: yawAngle,
            z: 0
        }
    }

    // From: https://dirask.com/posts/JavaScript-calculate-distance-between-two-points-in-3D-space-xpz9aD
    /** @param {{x: number, y: number, z: number}} vert1 @param {{x: number, y: number, z: number}} vert2 */
    static getDistanceBetweenVertices(vert1, vert2) {
        let a = vert2.x - vert1.x;
        let b = vert2.y - vert1.y;
        let c = vert2.z - vert1.z;

        return Math.sqrt(a * a + b * b + c * c);
    }

    static rotatePointAround(point, angle, around = { x: 0, y: 0 }) {
        let radians = angle * (Math.PI / 180);
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);

        point = { ...point };
        point.x -= around.x;
        point.y -= around.y;

        return {
            x: around.x + (point.x * cos) - (point.y * sin),
            y: around.y + (point.x * sin) + (point.y * cos)
        };
    }

    /** @param {{x: number, y: number, z: number}} vert1 @param {{x: number, y: number, z: number}} vert2 */
    static getOffsetBetweenVertices(vert1, vert2) {
        return {
            x: vert2.x - vert1.x,
            y: vert2.y - vert1.y,
            z: vert2.z - vert1.z
        }
    }

    /** @param {{x: number, y: number, z: number}} a @param {{x: number, y: number, z: number}} b */
    static addVector3(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        }
    }

    /** @param {{x: number, y: number, z: number}} vector @param {number} scale */
    static scaleVector3(vector, scale) {
        return {
            x: vector.x * scale,
            y: vector.y * scale,
            z: vector.z * scale
        }
    }

    // From: https://schteppe.github.io/cannon.js/docs/files/src_math_Quaternion.js.html#l288
    /** @param {{x: number, y: number, z: number, w: number}} quaternion @returns Euler Angle with YZX order */
    static quaternionToEulerAngles(quaternion) {
        var yaw, pitch, roll;
        var x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;

        var test = x * y + z * w;
        if (test > 0.499) { // singularity at north pole
            yaw = 2 * Math.atan2(x, w);
            pitch = Math.PI / 2;
            roll = 0;
        }
        if (test < -0.499) { // singularity at south pole
            yaw = -2 * Math.atan2(x, w);
            pitch = - Math.PI / 2;
            roll = 0;
        }
        if (isNaN(yaw)) {
            var sqx = x * x;
            var sqy = y * y;
            var sqz = z * z;
            yaw = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
            pitch = Math.asin(2 * test);
            roll = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);
        }

        return {
            x: pitch * (180 / Math.PI),
            y: yaw * (180 / Math.PI),
            z: roll * (180 / Math.PI)
        }
    }

    static quaternionToXYZ(q) {
        // var angles = new Vector3();
        let angles = { x: 0, y: 0, z: 0 };

        // roll / x
        // double sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        let sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        // double cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        let cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        // angles.x = (float)Math.Atan2(sinr_cosp, cosr_cosp);
        angles.x = Math.atan2(sinr_cosp, cosr_cosp);

        // pitch / y
        // float sinp = 2 * (q.w * q.y - q.z * q.x);
        let sinp = 2 * (q.w * q.y - q.z * q.x);
        if (Math.abs(sinp) >= 1) {
            // angles.y = (float)((sinp < 0 ? -1 : 1) * Math.PI / 2);
            angles.y = (sinp < 0 ? -1 : 1) * Math.PI / 2;
        } else {
            // angles.y = (float)Math.Asin(sinp);
            angles.y = Math.asin(sinp);
        }

        // yaw / z
        // double siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        let siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        // double cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        let cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        // angles.z = (float)Math.Atan2(siny_cosp, cosy_cosp);
        angles.z = Math.atan2(siny_cosp, cosy_cosp);

        // return angles * 180 / (float)Math.PI;
        return {
            x: angles.x * 180 / Math.PI,
            y: angles.y * 180 / Math.PI,
            z: angles.z * 180 / Math.PI
        }
    }

    /** @param {{x: number, y: number, z: number, w: number}} quaternion @returns Euler Angle with unknown order */
    static quaternionToEulerAngles2(quaternion) {
        let x = quaternion.x;
        let y = quaternion.y;
        let z = quaternion.z;
        let w = quaternion.w;

        let t0 = 2 * (w * x + y * z)
        let t1 = 1 - 2 * (x * x + y * y)
        let roll = Math.atan2(t0, t1)

        let t2 = 2 * (w * y - z * x)
        // t2 = +1.0 if t2 > +1.0 else t2
        t2 = t2 > 1 ? 1 : t2;
        // t2 = -1.0 if t2 < -1.0 else t2
        t2 = t2 < -1 ? -1 : t2;
        let pitch = Math.asin(t2);
        let t3 = 2 * (w * z + x * y);
        let t4 = 1 - 2 * (y * y + z * z);
        let yaw = Math.atan2(t3, t4);
        // return [yaw, pitch, roll];
        return {
            x: pitch * (180 / Math.PI),
            y: yaw * (180 / Math.PI),
            z: roll * (180 / Math.PI)
        }
    }

    // From THREE.js implementation
    /** @param {{x: number, y: number, z: number, w: number}} quaternion @returns Euler Angle with YXZ order */
    static quaternionToYXZ(quaternion) {
        // _matrix.makeRotationFromQuaternion( quaternion );
        // return this.setFromRotationMatrix( _matrix, order, update );

        // THREE.js, with zero and one being vector3
        // makeRotationFromQuaternion(q) = _matrix = this.compose( _zero, q, _one );

        // THREE.js, Matrix4.makeRotationFromQuaternion v
        const position = { x: 0, y: 0, z: 0 }; // _zero
        const scale = { x: 1, y: 1, z: 1 }; // _one

        // THREE.js, Matrix4 array with 16 elements
        // const te = this.elements;
        const te = [];

        // const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
        const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        const sx = scale.x, sy = scale.y, sz = scale.z;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;

        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        // THREE.js, returns the Matrix4 here
        // return this;

        // THREE.js, EULER.setFromRotationMatrix v
        // const te = m.elements;
        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];

        const output = { x: 0, y: 0, z: 0 };

        // THREE.js, case "YXZ"
        output.x = Math.asin(- this.clamp(m23, -1, 1));

        if (Math.abs(m23) < 0.9999999) {
            output.y = Math.atan2(m13, m33);
            output.z = Math.atan2(m21, m22);
        } else {
            output.y = Math.atan2(- m31, m11);
            output.z = 0;
        }

        output.x *= 180 / Math.PI;
        output.y *= 180 / Math.PI;
        output.z *= 180 / Math.PI;

        return output;
    }

    /** @param {{x: number, y: number, z: number}} a @param {{x: number, y: number, z: number}} b */
    static cross3D(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        }
    }

    /** @param {{x: number, y: number, z: number}} vector */
    static normalizeVector(vector) {
        let length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        return {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        }
    }

    // From: http://answers.unity3d.com/questions/467614/what-is-the-source-code-of-quaternionlookrotation.html
    /** @param {{x: number, y: number, z: number}} forward @param {{x: number, y: number, z: number}} up */
    static lookRotation(forward, up) {
        forward = this.normalizeVector(forward);
        let right = this.normalizeVector(this.cross3D(up, forward));
        up = this.normalizeVector(this.cross3D(forward, right));
        var m00 = right.x;
        var m01 = right.y;
        var m02 = right.z;
        var m10 = up.x;
        var m11 = up.y;
        var m12 = up.z;
        var m20 = forward.x;
        var m21 = forward.y;
        var m22 = forward.z;

        let num8 = (m00 + m11) + m22;
        var quaternion = { x: 0, y: 0, z: 0, w: 0 };
        if (num8 > 0) {
            var num = Math.sqrt(num8 + 1);
            quaternion.w = num * 0.5;
            num = 0.5 / num;
            quaternion.x = (m12 - m21) * num;
            quaternion.y = (m20 - m02) * num;
            quaternion.z = (m01 - m10) * num;
            return quaternion;
        }
        if ((m00 >= m11) && (m00 >= m22)) {
            var num7 = Math.sqrt(((1 + m00) - m11) - m22);
            var num4 = 0.5 / num7;
            quaternion.x = 0.5 * num7;
            quaternion.y = (m01 + m10) * num4;
            quaternion.z = (m02 + m20) * num4;
            quaternion.w = (m12 - m21) * num4;
            return quaternion;
        }
        if (m11 > m22) {
            var num6 = Math.sqrt(((1 + m11) - m00) - m22);
            var num3 = 0.5 / num6;
            quaternion.x = (m10 + m01) * num3;
            quaternion.y = 0.5 * num6;
            quaternion.z = (m21 + m12) * num3;
            quaternion.w = (m20 - m02) * num3;
            return quaternion;
        }
        var num5 = Math.sqrt(((1 + m22) - m00) - m11);
        var num2 = 0.5 / num5;
        quaternion.x = (m20 + m02) * num2;
        quaternion.y = (m21 + m12) * num2;
        quaternion.z = 0.5 * num5;
        quaternion.w = (m01 - m10) * num2;
        return quaternion;
    }

    /** @param {{x: number, y: number, z: number}} a @param {{x: number, y: number, z: number}} b */
    static getDirectionBetweenVectors(a, b) {
        return this.normalizeVector({ x: b.x - a.x, y: b.y - a.y, z: b.z - a.z });
    }

    /** @param {number} from @param {number} to @param {number} progress */
    static lerp(from, to, progress) {
        return from + (to - from) * progress;
    }

    /** @param {{x: number, y: number, z: number}} from @param {{x: number, y: number, z: number}} to @param {number} progress */
    static lerpVector(from, to, progress) {
        return {
            x: this.lerp(from.x, to.x, progress),
            y: this.lerp(from.y, to.y, progress),
            z: this.lerp(from.z, to.z, progress)
        }
    }

    /** @param {number} value @param {number} min @param {number} max */
    static clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
}