export class MathUtil {

    /**
     * From: https://gist.github.com/andfaulkner/c4ad12a72d29bcd653eb4b8cca2ae476
     * 
     * Calculate angle between 3 points in 3D space.
     * 
     * Note: assumes we want 1 vector to run from outer1 -> corner, and the other
     * 
     * from outer2 -> corner.
     *
     * @param {{x: number, y: number, z: number}} outer1
     * @param {{x: number, y: number, z: number}} corner
     * @param {{x: number, y: number, z: number}} outer2
     */
    static getCornerAngle(outer1, corner, outer2) {
        // Calculate vector between outer1 and corner
        const v1 = {
            x: outer1.x - corner.x,
            y: outer1.y - corner.y,
            z: outer1.z - corner.z,
        };

        // Calculate vector between outer2 and corner
        const v2 = {
            x: outer2.x - corner.x,
            y: outer2.y - corner.y,
            z: outer2.z - corner.z,
        };

        // The dot product of vectors v1 & v2 is a function of the cosine of the
        // angle between them (it's scaled by the product of their magnitudes).

        // Normalize v1
        const v1norm = this.normalizeVector(v1);

        // Normalize v2
        const v2norm = this.normalizeVector(v2);

        // Calculate the dot products of vectors v1 and v2
        const dotProducts = v1norm.x * v2norm.x + v1norm.y * v2norm.y + v1norm.z * v2norm.z;

        // Extract the angle from the dot products
        const angle = (Math.acos(dotProducts) * 180.0) / Math.PI;

        // Round result to 3 decimal points and return
        // return Math.round(angle * 1000) / 1000; // TODO: Check if rounding makes any difference, otherwise, remove this line
        return angle;
    }

    /** 
     * Gets a 2D point in the direction of the given angle
     * 
     * Example: 0 returns { x: 1, y: 0 }, and 45 returns { x: 0.707, y: 0.707 }
     * 
     * @param {number} angle 
     */
    static angleToPoint(angle) {
        let radians = angle * (Math.PI / 180);
        let sin = Math.sin(radians);
        let cos = Math.cos(radians);
        return { x: cos, y: sin }
    }

    /** 
     * From: https://stackoverflow.com/questions/56536575/how-can-i-calculate-the-3d-angle-between-two-points
     * 
     * Gets an angle in degrees between two points.
     * 
     * For example: { x: 0, y: 0 } and { x: 1, y: 0 } returns 0, { x: 0, y: 0 } and { x: 0.707, y: 0.707 } returns 45
     * 
     * @param {{x: number, y: number}} pointA 
     * @param {{x: number, y: number}} pointB 
     */
    static angleBetweenPoints(pointA, pointB) {
        let dy = pointB.y - pointA.y;
        let dx = pointB.x - pointA.x;
        let theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        return theta;
    }

    /** 
     * From: https://stackoverflow.com/questions/56536575/how-can-i-calculate-the-3d-angle-between-two-points
     * 
     * Normalizes an angle in degrees, from -180 to 180.
     * 
     * For example: 190 becomes -170
     * 
     * @param {number} angle
     */
    static normalizeAngle(angle) {
        if (angle > 180) {
            return angle - 360;
        }
        if (angle < -180) {
            return 360 + angle;
        }
        return angle;
    }

    /** 
     * From: https://dirask.com/posts/JavaScript-calculate-distance-between-two-points-in-3D-space-xpz9aD
     * 
     * Gets the distance between two vectors
     * 
     * @param {{x: number, y: number, z: number}} vectorA 
     * @param {{x: number, y: number, z: number}} vectorB 
     */
    static getDistanceBetweenVectors(vectorA, vectorB) {
        let dx = vectorB.x - vectorA.x;
        let dy = vectorB.y - vectorA.y;
        let dz = vectorB.z - vectorA.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /** 
     * Copied from THREE.js
     * 
     * From: https://github.com/mrdoob/three.js/tree/dev/src/math Euler and Matrix4
     * 
     * Converts a quaternion to an euler angle with YXZ order.
     * 
     * The order is crucial for the angle to work in Halo Infinite.
     * 
     * @param {{x: number, y: number, z: number, w: number}} quaternion 
     */
    static quaternionToYXZ(quaternion) {
        const te = [];
        const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        const sx = 1, sy = 1, sz = 1;

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

        te[12] = 0;
        te[13] = 0;
        te[14] = 0;
        te[15] = 1;

        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];

        const output = { x: 0, y: 0, z: 0 };

        output.x = Math.asin(- this.clamp(m23, -1, 1));

        if (Math.abs(m23) < 0.9999999) {
            output.y = Math.atan2(m13, m33);
            output.z = Math.atan2(m21, m22);
        } else {
            output.y = Math.atan2(- m31, m11);
            output.z = 0;
        }

        // Convert from radians to degrees
        output.x *= 180 / Math.PI;
        output.y *= 180 / Math.PI;
        output.z *= 180 / Math.PI;

        return output;
    }

    /** 
     * Gets the cross product of two vectors
     * 
     * @param {{x: number, y: number, z: number}} vectorA 
     * @param {{x: number, y: number, z: number}} vectorB 
     */
    static getCrossProductOfVectors(vectorA, vectorB) {
        return {
            x: vectorA.y * vectorB.z - vectorA.z * vectorB.y,
            y: vectorA.z * vectorB.x - vectorA.x * vectorB.z,
            z: vectorA.x * vectorB.y - vectorA.y * vectorB.x
        }
    }

    /** 
     * Returns a normalized vector, where the length is 1
     * 
     * @param {{x: number, y: number, z: number}} vector
     */
    static normalizeVector(vector) {
        let length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        return {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        }
    }

    /** 
     * From: http://answers.unity3d.com/questions/467614/what-is-the-source-code-of-quaternionlookrotation.html
     * 
     * Gets the required quaternion angle to rotate an object so that it's facing in the forward direction, with it's up along the up direction
     * 
     * @param {{x: number, y: number, z: number}} forward 
     * @param {{x: number, y: number, z: number}} up 
     */
    static lookRotation(forward, up) {
        forward = this.normalizeVector(forward);
        let right = this.normalizeVector(this.getCrossProductOfVectors(up, forward));
        up = this.normalizeVector(this.getCrossProductOfVectors(forward, right));
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

    /** 
     * Gets the direction between the from and to vector as a normalized vector
     * 
     * @param {{x: number, y: number, z: number}} from 
     * @param {{x: number, y: number, z: number}} to 
     */
    static getDirectionBetweenVectors(from, to) {
        return this.normalizeVector({ x: to.x - from.x, y: to.y - from.y, z: to.z - from.z });
    }

    /** 
     * Gets an interpolated value between from and to, based on progress. 
     * 
     * For example, from=0 to=2 progress=0.5 would return 1
     * 
     * @param {number} from @param {number} to @param {number} progress 
     */
    static lerp(from, to, progress) {
        return from + (to - from) * progress;
    }

    /** 
     * Gets an interpolated vector between from and to, based on progress, just like regular lerp, but for all axes. 
     * 
     * @param {{x: number, y: number, z: number}} from @param {{x: number, y: number, z: number}} to @param {number} progress 
     */
    static lerpVector(from, to, progress) {
        return {
            x: this.lerp(from.x, to.x, progress),
            y: this.lerp(from.y, to.y, progress),
            z: this.lerp(from.z, to.z, progress)
        }
    }

    /** 
     * Gets a value in a range between a minimum and maximum value.
     * 
     * @param {number} value @param {number} min @param {number} max 
     */
    static clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
}