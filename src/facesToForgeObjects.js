import { MathUtil } from "./mathUtil.js";

/** @typedef {{ vertexIndexes: number[]; vertices: { x: number; y: number; z: number }[]; normalIndex: number, normal: { x: number; y: number; z: number;}; }} Face */

const round = (value) => {
    return parseFloat(value.toFixed(2))
}

/** @param {{ x: number; y: number; z: number }} vector */
const roundVector = (vector) => {
    return {
        x: parseFloat(vector.x.toFixed(2)),
        y: parseFloat(vector.x.toFixed(2)),
        z: parseFloat(vector.x.toFixed(2))
    }
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

/** @param {Face} face @param {number} vertexIndex */
const getFaceGameRotation = (face, vertexIndex) => {
    let vertex = face.vertices[vertexIndex];
    let nextVertex = getElementAtIndex(face.vertices, vertexIndex + 1);

    let forward = MathUtil.getDirectionBetweenVectors(vertex, nextVertex);
    let lookRotation = MathUtil.lookRotation(forward, face.normal);
    let angle = MathUtil.quaternionToYXZ(lookRotation);
    return convertToGameRotation(angle);
}

/** @param {Face} face @param {number} vertexIndex */
const getFaceGameSize = (face, vertexIndex) => {
    let previousVertex = getElementAtIndex(face.vertices, vertexIndex - 1);
    let nextVertex = getElementAtIndex(face.vertices, vertexIndex + 1);

    return convertToGameSize({
        x: MathUtil.getDistanceBetweenVectors(face.vertices[vertexIndex], previousVertex),
        y: 0,
        z: MathUtil.getDistanceBetweenVectors(face.vertices[vertexIndex], nextVertex)
    });
}

const scaleMultiplier = 3;

/**
 * Returns a valid index from 0 up to (but not including) total, based on the provided index
 * 
 * @param {number} index 
 * @param {number} total 
 */
const getIndexInRange = (index, total) => {
    return (total + index) % total;
}

/**
 * Returns an element from an array, at a valid index from 0 up to (but not including) array.length, based on the provided index
 * 
 * @param {any[]} array 
 * @param {number} index 
 */
const getElementAtIndex = (array, index) => {
    index = getIndexInRange(index, array.length);
    return array[index];
}

/** 
 * Returns a right angled quad, if the two provided faces can form a valid right angled quad
 * 
 * @param {Face} face1 
 * @param {Face} face2 
 * @returns {Face | undefined}
 */
const getRightAngledQuad = (face1, face2) => {
    let connectedVertexIndexes = face1.vertexIndexes.filter(index => face2.vertexIndexes.includes(index));
    if (connectedVertexIndexes.length !== 2) {
        return undefined;
    }

    let roundedNormal1 = roundVector(face1.normal);
    let roundedNormal2 = roundVector(face2.normal);
    if (JSON.stringify(roundedNormal1) !== JSON.stringify(roundedNormal2)) {
        return undefined;
    }

    let face1UniqueVertexIndex = face1.vertexIndexes.findIndex(index => face2.vertexIndexes.includes(index) === false);
    let face1PreviousVertex = getElementAtIndex(face1.vertices, face1UniqueVertexIndex - 1);
    let face1NextVertex = getElementAtIndex(face1.vertices, face1UniqueVertexIndex + 1);
    let face1CornerAngle = MathUtil.getCornerAngle(face1PreviousVertex, face1.vertices[face1UniqueVertexIndex], face1NextVertex);

    if (face1CornerAngle !== 90) {
        return undefined;
    }

    let face2UniqueVertexIndex = face2.vertexIndexes.findIndex(index => face1.vertexIndexes.includes(index) === false);
    let face2PreviousVertex = getElementAtIndex(face2.vertices, face2UniqueVertexIndex - 1);
    let face2NextVertex = getElementAtIndex(face2.vertices, face2UniqueVertexIndex + 1);
    let face2CornerAngle = MathUtil.getCornerAngle(face2PreviousVertex, face2.vertices[face2UniqueVertexIndex], face2NextVertex);

    if (face2CornerAngle !== 90) {
        return undefined;
    }

    let vertexIndexToPositionMap = {}
    for (let i = 0; i < face1.vertices.length; i++) {
        vertexIndexToPositionMap[face1.vertexIndexes[i]] = face1.vertices[i];
    }
    for (let i = 0; i < face2.vertices.length; i++) {
        vertexIndexToPositionMap[face2.vertexIndexes[i]] = face2.vertices[i];
    }

    let vertexIndexes = [
        face1.vertexIndexes[face1UniqueVertexIndex],
        connectedVertexIndexes[0],
        face2.vertexIndexes[face2UniqueVertexIndex],
        connectedVertexIndexes[1]
    ]

    let vertices = vertexIndexes.map(index => vertexIndexToPositionMap[index]);

    return {
        vertexIndexes,
        vertices,
        normalIndex: face1.normalIndex,
        normal: face1.normal
    };
}

/** @param {Face[]} faces */
export const facesToForgeObjects = (faces, forceRightSided = false) => {
    faces = [...faces];

    let objects = [];

    let quads = [];
    for (let i = 0; i < faces.length; i++) {
        let quadFace1 = faces[i];
        let quadFace2 = quadFace1;
        let foundQuad = false;
        for (let j = i + 1; j < faces.length; j++) {
            quadFace2 = faces[j];
            let quad = getRightAngledQuad(quadFace1, quadFace2);
            if (quad !== undefined) {
                quads.push(quad);
                foundQuad = true;
                break;
            }
        }
        if (foundQuad) {
            faces.splice(faces.indexOf(quadFace1), 1);
            faces.splice(faces.indexOf(quadFace2), 1);
            i -= 2;
            continue;
        }
    }

    for (let i = 0; i < quads.length; i++) {
        objects.push({
            type: "cube",
            position: convertToGamePosition(quads[i].vertices[0]),
            rotation: getFaceGameRotation(quads[i], 0),
            size: getFaceGameSize(quads[i], 0)
        });
    }

    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let vertexCount = face.vertices.length;
        let isRightAngled = false;
        let angles = [];

        for (let j = 0; j < vertexCount; j++) {
            let previousVertex = getElementAtIndex(face.vertices, j - 1);
            let nextVertex = getElementAtIndex(face.vertices, j + 1);
            let angle = MathUtil.getCornerAngle(previousVertex, face.vertices[j], nextVertex);

            angles.push(angle);

            if (angle === 90 || (forceRightSided && angle > 89 && angle < 91)) {
                isRightAngled = true;
                objects.push({
                    type: "polygon",
                    position: convertToGamePosition(face.vertices[j]),
                    rotation: getFaceGameRotation(face, j),
                    size: getFaceGameSize(face, j)
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
            let nextIndex = getIndexInRange(j + 1, vertexCount);
            let length = MathUtil.getDistanceBetweenVectors(face.vertices[j], face.vertices[nextIndex]);
            lengths.push(length);
            if (length > longestSideLength) {
                longestSideLength = length;
                longestSideIndex = j;
            }
        }

        let previousVertexIndex = getIndexInRange(longestSideIndex - 1, vertexCount);
        let nextVertexIndex = getIndexInRange(longestSideIndex + 1, vertexCount);
        let previousSideLength = lengths[previousVertexIndex];
        let leftSideAngle = angles[longestSideIndex];
        let leftPolygonBaseSideLength = MathUtil.angleToPoint(leftSideAngle).x * previousSideLength;
        let midPointProgress = leftPolygonBaseSideLength / longestSideLength;
        let midPointVertex = MathUtil.lerpVector(face.vertices[longestSideIndex], face.vertices[nextVertexIndex], midPointProgress);

        /** @type {Face} */
        let leftFace = JSON.parse(JSON.stringify(face));
        /** @type {Face} */
        let rightFace = JSON.parse(JSON.stringify(face));

        leftFace.vertices[nextVertexIndex] = midPointVertex;
        rightFace.vertices[longestSideIndex] = midPointVertex;

        let leftAndRightObjects = facesToForgeObjects([leftFace, rightFace], true);

        objects = [...objects, ...leftAndRightObjects];
    }

    return objects;
}