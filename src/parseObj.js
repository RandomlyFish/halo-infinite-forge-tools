import fs from "fs";
import { MathUtil } from "./mathUtil.js";

const VERTEX_PREFIX = "v ";
const VERTEX_NORMAL_PREFIX = "vn ";
const FACE_PREFIX = "f ";

/** 
 * Takes an obj file and outputs information about each face
 */
export const parseObj = (file) => {
    let data = "";

    try {
        data = fs.readFileSync(file, "utf8");
    } catch (err) {
        console.error(err);
    }

    let lines = data.split("\n");
    let faceLines = [];
    /** @type {{ x: number; y: number; z: number }[]} */
    let vertices = [];
    let normals = [];
    let faces = [];

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(VERTEX_PREFIX)) {
            let parts = lines[i].split(" ");
            // In case there are more than 1 space between each part, like how 3DSMax exports it
            parts = parts.filter(part => part.length > 0);
            vertices.push({ x: parseFloat(parts[1]), y: parseFloat(parts[2]), z: parseFloat(parts[3]) });
        }
        if (lines[i].startsWith(VERTEX_NORMAL_PREFIX)) {
            let parts = lines[i].split(" ");
            parts = parts.filter(part => part.length > 0);
            normals.push({ x: parseFloat(parts[1]), y: parseFloat(parts[2]), z: parseFloat(parts[3]) });
        }
        if (lines[i].startsWith(FACE_PREFIX)) {
            faceLines.push(lines[i]);
        }
    }

    for (let i = 0; i < faceLines.length; i++) {
        let parts = faceLines[i].split(" ");

        let vertexIndexes = [];
        let normalIndex = -1;

        for (let j = 1; j < parts.length; j++) {
            // If the part only consists of whitespace, such as \r or \n, we know that there are no more valid parts
            if (parts[j].trim().length === 0) {
                break;
            }
            // parts[j] is formated like this #/#/#, #1: vertex index, #2: vertex uv index (optional), #3: vertex normal index (optional)
            let vertexInfoParts = parts[j].split("/");
            vertexIndexes.push(parseInt(vertexInfoParts[0]) - 1);
            normalIndex = parseInt(vertexInfoParts[2] - 1);
        }

        let faceVertices = vertexIndexes.map(index => vertices[index]);
        
        let direction1 = MathUtil.getDirectionBetweenVectors(faceVertices[0], faceVertices[1]);
        let direction2 = MathUtil.getDirectionBetweenVectors(faceVertices[0], faceVertices[2]);
        let normal = MathUtil.getCrossProductOfVectors(direction1, direction2);

        faces.push({
            vertexIndexes,
            vertices: faceVertices,
            normalIndex,
            normal
            // normal: normals[normalIndex] // Old way of getting normal, keep just in case
        });
    }

    return faces;
}