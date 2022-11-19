import fs from "fs";
import { facesToForgeObjects } from "./facesToForgeObjects.js";
import { AutoHotKeyUtil } from "./autoHotKeyUtil.js";
import { parseObj } from "./parseObj.js";
import { config } from "./config.js";

let commandLineArgumentsList = process.argv.slice(2);
let commandLineArguments = {}
for (let arg of commandLineArgumentsList) {
    let key = arg.split("=")[0];
    let value = arg.split("=")[1];
    commandLineArguments[key] = value;
}

if (commandLineArguments.model === undefined) {
    console.log("Unable to run script, no model file name was provided");
    console.log("For example: 'npm start model=test' will use a file called test.obj in the input folder");
    process.exit(1);
}
if (commandLineArguments.chunks !== undefined && commandLineArguments.chunk === undefined) {
    console.log("Unable to run script, 'chunks' was set, but not 'chunk'");
    process.exit(1);
}
if (commandLineArguments.chunk !== undefined && commandLineArguments.chunks === undefined) {
    console.log("Unable to run script, 'chunk' was set, but not 'chunks'");
    process.exit(1);
}

let modelPath = "input/" + commandLineArguments.model.split(".")[0] + ".obj";
let fileExists = fs.existsSync(modelPath, "utf8");

if (fileExists === false) {
    console.log("Unable to run script, the model file: " + modelPath + " doesn't exist");
    process.exit(1);
}

let faces = parseObj(modelPath);
console.log("Total faces:", faces.length);
let objects = facesToForgeObjects(faces);
console.log("Total objects:", objects.length);

let chunks = commandLineArguments.chunks || 1;
let chunk = commandLineArguments.chunk || 1;
let chunkStartIndex = Math.ceil((chunk - 1) * (objects.length / chunks));
let chunkEndIndex = Math.ceil(chunk * (objects.length / chunks)) - 1;
objects = objects.slice(chunkStartIndex, chunkEndIndex + 1);
console.log(`Objects in chunk: ${(chunkStartIndex + 1)} - ${(chunkEndIndex + 1)}`);

if (commandLineArguments.filter !== undefined) {
    let parts = commandLineArguments.filter.split(",");
    let objectsAtPosition = objects.filter(object => {
        let isSameX = Math.round(object.position.x) === Math.round(parseFloat(parts[0]));
        let isSameY = Math.round(object.position.y) === Math.round(parseFloat(parts[1]));
        let isSameZ = Math.round(object.position.z) === Math.round(parseFloat(parts[2]));
        return isSameX && isSameY && isSameZ;
    });
    objects = objectsAtPosition;
    console.log("Selected objects from filter:");
    console.log(objectsAtPosition.map(object => {
        let output = { ...object }
        output.rotation = {
            x_roll: object.rotation.x,
            y_pitch: object.rotation.y,
            z_yaw: object.rotation.z
        }
        return output;
    }));
}

let estimatedTimeMiliseconds = (3 + objects.length * 4) * 1000;
let estimatedTimeHMS = new Date(estimatedTimeMiliseconds).toISOString().substring(11, 19);
console.log("Estimated time to build (hms):", estimatedTimeHMS, "(with default key press delays)");

let instructions = [];

instructions.push("actionTree.menu");
instructions.push("wait(2000)");

for (let i = 0; i < objects.length; i++) {
    let objectTypeToActionMap = {
        "cube": "actionTree.menu.spawnCube",
        "polygon": "actionTree.menu.spawnPolygon"
    }

    let previousType = i > 0 ? objects[i - 1].type : "";

    if (objects[i].type !== previousType) {
        instructions.push(objectTypeToActionMap[objects[i].type]);
        // instructions.push("actionTree.menu.objectProperties.resize(4,4,0)");
    } else {
        instructions.push("actionTree.menu.objectProperties.duplicate");
    }

    let obj = objects[i];

    instructions.push(
        `actionTree.menu.objectProperties.transform(${obj.position.x},${obj.position.y},${obj.position.z},${obj.rotation.x},${obj.rotation.y},${obj.rotation.z},${obj.size.x},${obj.size.y},${obj.size.z})`
    );
}

instructions.push("actionTree");

let fileData = `
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
`;

fileData += AutoHotKeyUtil.openWindow("Halo Infinite");
fileData += AutoHotKeyUtil.sleep(1000);

let currentPathActions = [config.actionTree];
let currentPathNames = ["actionTree"];

for (let i = 0; i < instructions.length; i++) {
    let instruction = instructions[i];
    let args = [];

    if (instruction.includes("(")) {
        let parts = instruction.split("(");
        instruction = parts[0];
        let argsString = parts[1];
        argsString = argsString.split(")")[0];
        args = argsString.split(",");
    }

    if (instruction.startsWith("wait")) {
        fileData += AutoHotKeyUtil.sleep(args[0]);
        continue;
    }

    let actionNames = instruction.split(".");

    while (actionNames.includes(currentPathNames[currentPathNames.length - 1]) === false) {
        currentPathNames.pop();
        let action = currentPathActions.pop();
        fileData += AutoHotKeyUtil.pressKeySequence(action.exitKeys, config.keyToDelayMap);
    }

    if (actionNames.length > currentPathActions.length) {
        for (let i = currentPathActions.length; i < actionNames.length; i++) {
            let actionName = actionNames[i];
            let lastInPath = currentPathActions[currentPathActions.length - 1];
            let action = lastInPath[actionName];
            fileData += AutoHotKeyUtil.pressKeySequence(action.enterKeys, config.keyToDelayMap);
            currentPathActions.push(action);
            currentPathNames.push(actionName);
        }
    }

    fileData += AutoHotKeyUtil.pressKeySequence(currentPathActions[currentPathActions.length - 1].executeKeys, config.keyToDelayMap, args);
}

if (commandLineArguments.autoSave === "true") {
    fileData += AutoHotKeyUtil.pressKeyCombination(["Ctrl", "s"]);
}

fs.writeFileSync("output/macro.ahk", fileData);

console.log("AutoHotKey macro file saved to: 'output/macro.ahk'");