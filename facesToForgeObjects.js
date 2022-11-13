import { MathUtil } from "./mathUtil.js";

/** @typedef {{ vertexIndexes: number[]; vertices: { x: number; y: number; z: number }[]; normal: { x: number; y: number; z: number;}; center: { x: number; y: number; z: number; }; }} Polygon */

const round = (value) => {
    return parseFloat(value.toFixed(2))
}

/** @param {{ x: number; y: number; z: number }} vector */
const convertToGamePosition = (vector) => {
    return {
        x: round(vector.z * scaleMultiplier),
        y: round(vector.x * scaleMultiplier),
        z: round(vector.y * scaleMultiplier + 600)
    }
}

/** @param {{ x: number; y: number; z: number }} vector */
const convertToGameRotation = (vector) => {
    return {
        x: MathUtil.normalizeAngle(round(-vector.z)),
        y: MathUtil.normalizeAngle(round(vector.x)),
        z: MathUtil.normalizeAngle(round(vector.y))
    }
}

/** @param {{ x: number; y: number; z: number }} vector */
const convertToGameRotation2 = (vector) => {
    return {
        x: MathUtil.normalizeAngle(round(-vector.y)),
        y: MathUtil.normalizeAngle(round(vector.z)),
        z: MathUtil.normalizeAngle(round(vector.x))
    }
}

/** @param {{ x: number; y: number; z: number }} vector */
const convertToGameRotation3 = (vector) => {
    return {
        x: MathUtil.normalizeAngle(round(vector.z)),
        y: -MathUtil.normalizeAngle(round(vector.x)),
        z: MathUtil.normalizeAngle(round(vector.y))
    }
}

/** @param {{ x: number; y: number; z: number }} vector */
const convertToGameSize = (vector) => {
    return {
        x: round(vector.z * scaleMultiplier),
        y: round(vector.x * scaleMultiplier),
        z: round(vector.y * scaleMultiplier)
    }
}

const scaleMultiplier = 3;

/** @param {Polygon[]} faces */
export const facesToForgeObjects = (faces, forceRightSided = false) => {
    let objects = [];

    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let vertexCount = face.vertices.length;
        let isRightAngled = false;
        let angles = [];

        for (let j = 0; j < vertexCount; j++) {
            let previousIndex = (vertexCount + j - 1) % vertexCount;
            let nextIndex = (vertexCount + j + 1) % vertexCount;
            let angle = MathUtil.angleBetween3DCoords(face.vertices[previousIndex], face.vertices[j], face.vertices[nextIndex]);

            angles.push(angle);

            if (angle === 90 || (forceRightSided && angle > 89 && angle < 91)) {
                isRightAngled = true;
                let forward = MathUtil.getDirectionBetweenVectors(face.vertices[j], face.vertices[nextIndex]);
                let lookRotation = MathUtil.lookRotation(forward, face.normal);
                // console.log("Look Rotation:", lookRotation);
                // console.log("angle a:", MathUtil.quaternionToEulerAngles(lookRotation));
                // console.log("angle b:", MathUtil.quaternionToXYZ(lookRotation));
                // console.log("angle c:", MathUtil.quaternionToEulerAngles2(lookRotation));
                // console.log("angle d:", MathUtil.quaternionToYXZ(lookRotation));

                // let angle = convertToGameRotation(MathUtil.quaternionToEulerAngles(lookRotation));
                // if (angle.x !== 0 && angle.y !== 0 && angle.z !== 0) {
                //     angle = convertToGameRotation2(MathUtil.quaternionToXYZ(lookRotation));
                // }

                let angle = MathUtil.quaternionToYXZ(lookRotation);

                let position = convertToGamePosition(face.vertices[j]);
                let rotation = convertToGameRotation3(angle);
                let size = convertToGameSize({
                    x: MathUtil.getDistanceBetweenVertices(face.vertices[j], face.vertices[previousIndex]),
                    y: 0,
                    z: MathUtil.getDistanceBetweenVertices(face.vertices[j], face.vertices[nextIndex])
                });

                // console.log("picked rotation:", rotation);

                // TODO: Remove this if not needed for upside down polygons
                // if (face.normal.y < 0) {
                //     rotation.y = MathUtil.normalizeAngle(180 - rotation.y);
                // }

                objects.push({
                    position,
                    rotation,
                    size
                });
                break;
            }
        }

        if (isRightAngled) {
            continue;
        }

        let lengths = [];
        let longestSideLength = -1;
        let longestSideIndex = -1;

        for (let j = 0; j < vertexCount; j++) {
            let nextIndex = (vertexCount + j + 1) % vertexCount;
            let length = MathUtil.getDistanceBetweenVertices(face.vertices[j], face.vertices[nextIndex]);
            lengths.push(length);
            if (length > longestSideLength) {
                longestSideLength = length;
                longestSideIndex = j;
            }
        }

        let previousVertexIndex = (vertexCount + longestSideIndex - 1) % vertexCount;
        let nextVertexIndex = (vertexCount + longestSideIndex + 1) % vertexCount;
        let previousSideLength = lengths[previousVertexIndex];
        let leftSideAngle = angles[longestSideIndex];
        let leftPolygonBaseSideLength = MathUtil.angleToPoint(leftSideAngle).x * previousSideLength;
        let midPointProgress = leftPolygonBaseSideLength / longestSideLength;
        let midPointVertex = MathUtil.lerpVector(face.vertices[longestSideIndex], face.vertices[nextVertexIndex], midPointProgress);

        /** @type {Polygon} */
        let leftFace = JSON.parse(JSON.stringify(face));
        /** @type {Polygon} */
        let rightFace = JSON.parse(JSON.stringify(face));

        // console.log()
        // console.log("Normal of face:", face.normal);
        // console.log(leftFace.normal);
        // console.log(rightFace.normal);
        // console.log("vertex index: " + longestSideIndex);

        leftFace.vertices[nextVertexIndex] = midPointVertex;
        rightFace.vertices[longestSideIndex] = midPointVertex;

        let leftAndRightObjects = facesToForgeObjects([leftFace, rightFace], true);

        objects = [...objects, ...leftAndRightObjects];

        // console.log(leftAndRightObjects[0].rotation);
    }

    return objects;
}