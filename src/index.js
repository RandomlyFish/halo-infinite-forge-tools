import fs from "fs";
import { facesToForgeObjects } from "./facesToForgeObjects.js";
import { AutoHotKeyUtil } from "./autoHotKeyUtil.js";
import { readObj } from "./readObj.js";
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

let modelPath = "input/" + commandLineArguments.model.split(".")[0] + ".obj";
let fileExists = fs.existsSync(modelPath, "utf8");

if (fileExists === false) {
    console.log("Unable to run script, the model file: " + modelPath + " doesn't exist");
    process.exit(1);
}

let faces = readObj(modelPath);
console.log("Total faces:", faces.length);
let objects = facesToForgeObjects(faces);
console.log("Total objects:", objects.length);
console.log("Estimated time to build (minutes):", (objects.length * 5) / 60);

let instructions = [];

instructions.push("actionTree.menu");
instructions.push("wait(2000)");

for (let i = 0; i < objects.length; i++) {
    if (i === 0) {
        instructions.push("actionTree.menu.spawnPolygon");
        instructions.push("actionTree.menu.objectProperties.resize(4,4,0)");
    } else {
        instructions.push("actionTree.menu.objectProperties.duplicate");
    }

    let obj = objects[i];

    // if (Math.abs(obj.rotation.x) > 180 || Math.abs(obj.rotation.y) > 180 || Math.abs(obj.rotation.z) > 180) {
    //     console.log(obj.rotation, " Is an invalid rotation");
    // }
    instructions.push(`actionTree.menu.objectProperties.transform(${obj.position.x},${obj.position.y},${obj.position.z},${obj.rotation.x},${obj.rotation.y},${obj.rotation.z},${obj.size.x},${obj.size.y},${obj.size.z})`);
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

fs.writeFileSync("output/macro.ahk", fileData);

console.log("AutoHotKey macro file saved to: 'output/macro.ahk'");