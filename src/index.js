import fs from "fs";
import { facesToForgeObjects } from "./facesToForgeObjects.js";
import { AutoHotKeyUtil } from "./autoHotKeyUtil.js";
import { readObj } from "./readObj.js";

let argList = process.argv.slice(2);
let args = {}
for (let arg of argList) {
    let key = arg.split("=")[0];
    let value = arg.split("=")[1];
    args[key] = value;
}

if (args.model === undefined) {
    console.log("Unable to run script, no model file name was provided");
    console.log("For example: 'npm start model=test' will use a file called test.obj in the input folder");
    process.exit(1);
}

let actionTree = {
    enterKeys: [],
    executeKeys: [],
    exitKeys: [],
    menu: {
        enterKeys: ["BackSpace", "BackSpace", "r", "PgUp"],
        executeKeys: [],
        exitKeys: ["BackSpace", "BackSpace"],
        spawnPrimitiveBlock: {
            enterKeys: ["w", "w", "w", "Enter", "s", "Enter", "s"],
            executeKeys: ["Enter", "r"],
            exitKeys: ["PgUp", "Escape", "w", "Enter", "PgUp"]
        },
        spawnPolygon: {
            enterKeys: ["PgDn", "w", "w", "w", "w", "Enter", "PgDn", "PgDn", "PgDn", "PgUp", "Enter"],
            executeKeys: ["Enter", "r"],
            exitKeys: ["Escape", "PgUp", "s", "s", "s", "s", "Enter", "PgUp"]
        },
        objectProperties: {
            enterKeys: ["e", "PgUp"],
            executeKeys: [],
            exitKeys: ["q"],
            move: {
                enterKeys: ["PgDn", "w", "w", "w", "w"],
                executeKeys: ["Enter", "{2}", "Enter", "w", "Enter", "{1}", "Enter", "w", "Enter", "{0}", "Enter", "s", "s"],
                exitKeys: ["PgUp"]
            },
            rotate: {
                enterKeys: ["PgDn", "w", "w"],
                executeKeys: ["Enter", "{2}", "Enter", "s", "Enter", "{0}", "Enter", "s", "Enter", "{1}", "Enter", "w", "w"],
                exitKeys: ["PgUp"]
            },
            resize: {
                enterKeys: ["s", "s", "s", "s"],
                executeKeys: ["Enter", "{0}", "Enter", "s", "Enter", "{1}", "Enter", "s", "Enter", "{2}", "Enter", "w", "w"],
                exitKeys: ["PgUp"]
            },
            resizeXY: {
                enterKeys: ["s", "s", "s", "s"],
                executeKeys: ["Enter", "{0}", "Enter", "s", "Enter", "{1}", "Enter", "w"],
                exitKeys: ["PgUp"]
            },
            transform: {
                enterKeys: [],
                executeKeys: [
                    "s", "s", "s", "s", // Go down to size X
                    "Enter", "{6}", "Enter", "s", "Enter", "{7}", "Enter", // Enter size (skipping Z)
                    "s", "s", "s", "s", "s", // Go down to position X
                    "Enter", "{0}", "Enter", "s", "Enter", "{1}", "Enter", "s", "Enter", "{2}", "Enter", // Enter position
                    "s", "s", // Go down to rotation Yaw
                    // "Enter", "{5}", "Enter", "s", "Enter", "{3}", "Enter", "s", "Enter", "{4}", "Enter", // Enter rotation
                    "Enter", "{5}", "Enter", "s", "Enter", "{4}", "Enter", "s", "Enter", "{3}", "Enter", // Enter rotation
                    "PgUp" // Go back to top
                ],
                exitKeys: []
            },
            duplicate: {
                enterKeys: ["Escape"],
                executeKeys: ["Ctrl+d"],
                exitKeys: ["r", "PgUp"],
            }
        }
    },
    focusObject: {
        enterKeys: [],
        executeKeys: ["f"],
        exitKeys: []
    }
}

let modelPath = "input/" + args.model.split(".")[0] + ".obj";
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

for (let i = 0; i < objects.length; i++) {
    if (i === 0) {
        instructions.push("actionTree.menu.spawnPolygon");
        instructions.push("actionTree.menu.objectProperties.resize(4,4,0)");
    } else {
        instructions.push("actionTree.menu.objectProperties.duplicate");
    }

    let obj = objects[i];

    // instructions.push(`actionTree.menu.objectProperties.move(${obj.position.x},${obj.position.y},${obj.position.z})`);
    // instructions.push(`actionTree.menu.objectProperties.rotate(${obj.rotation.x},${obj.rotation.y},${obj.rotation.z})`);
    // instructions.push(`actionTree.menu.objectProperties.resizeXY(${obj.size.x},${obj.size.y})`);
    if (Math.abs(obj.rotation.x) > 180 || Math.abs(obj.rotation.y) > 180 || Math.abs(obj.rotation.z) > 180) {
        console.log(obj.rotation, " Is an invalid rotation");
    }
    instructions.push(`actionTree.menu.objectProperties.transform(${obj.position.x},${obj.position.y},${obj.position.z},${obj.rotation.x},${obj.rotation.y},${obj.rotation.z},${obj.size.x},${obj.size.y},${obj.size.z})`);
}

instructions.push("actionTree");

let fileData = `
#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
`;

fileData += AutoHotKeyUtil.sleep(3000);

let currentPathActions = [actionTree];
let currentPathNames = ["actionTree"];

for (let i = 0; i < instructions.length; i++) {
    let instruction = instructions[i];
    let executeKeyArgs = [];

    if (instruction.includes("(")) {
        let parts = instruction.split("(");
        instruction = parts[0];
        let argsString = parts[1];
        argsString = argsString.split(")")[0];
        executeKeyArgs = argsString.split(",");
    }

    let actionNames = instruction.split(".");

    while (actionNames.includes(currentPathNames[currentPathNames.length - 1]) === false) {
        currentPathNames.pop();
        let action = currentPathActions.pop();
        fileData += AutoHotKeyUtil.pressKeySequence(action.exitKeys);
    }

    if (actionNames.length > currentPathActions.length) {
        for (let i = currentPathActions.length; i < actionNames.length; i++) {
            let actionName = actionNames[i];
            let lastInPath = currentPathActions[currentPathActions.length - 1];
            let action = lastInPath[actionName];
            fileData += AutoHotKeyUtil.pressKeySequence(action.enterKeys);
            currentPathActions.push(action);
            currentPathNames.push(actionName);
        }
    }

    fileData += AutoHotKeyUtil.pressKeySequence(currentPathActions[currentPathActions.length - 1].executeKeys, executeKeyArgs);
}

fs.writeFileSync("output/macro.ahk", fileData);

console.log("AutoHotKey macro file saved to: 'output/macro.ahk'");