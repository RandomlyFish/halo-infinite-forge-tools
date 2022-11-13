export class AutoHotKeyUtil {

    /**
     * Generates a command which delays the following commands
     * 
     * @param {number} ms 
     */
    static sleep(ms) {
        return "\n" + "Sleep, " + ms + "\n";
    }

    /**
     * Generates a command which opens an existing window
     * 
     * @param {string} windowName 
     */
    static openWindow(windowName) {
        return "\n" + "WinActivate, " + windowName + "\n";
    }

    /**
     * Generates commands to press and release a given key
     * 
     * @param {string} key 
     */
    static pressKey(key, { times = 1, endDelay = 1 } = {}) {
        let output = "";

        for (let i = 0; i < times; i++) {
            output += `
            Send {${key} Down} 
            Sleep, 1 
            Send {${key} Up} 
            Sleep, ${endDelay}
            `;
        }

        return output;
    }

    /**
     * Generates commands to press and release multiple keys at the same time
     * 
     * @param {string[]} keys
     */
    static pressKeyCombination(keys, { times = 1, endDelay = 1 } = {}) {
        let output = "";

        for (let i = 0; i < times; i++) {
            for (let j = 0; j < keys.length; j++) {
                output += `
                Send {${keys[j]} Down}`;
            }

            output += "\n" + "Sleep, 1";

            for (let j = 0; j < keys.length; j++) {
                output += `
                Send {${keys[j]} Up}`;
            }

            output += "\n" + `Sleep, ${endDelay}`;
        }

        return output;
    }

    /**
     * Generates commands that will enter each character in a string, one by one
     * 
     * @param {string} string 
     */
    static type(string, { endDelay = 1 } = {}) {
        let output = "";

        for (let i = 0; i < string.length; i++) {
            output += `
            Send {${string[i]} Down} 
            Sleep, 1 
            Send {${string[i]} Up} 
            Sleep, 1 
            `;
        }

        output += "\n" + `Sleep, ${endDelay}`

        return output;
    }

    /** 
     * Generates commands for a sequence of keys, where there's a different delay after each key press
     * 
     * @param {string[]} keys array of keys.
     * 
     * If a key includes a colon ':' followed by a number, then the value after the colon is the delay. For example: Enter:100 which adds a 100ms delay after the key press 
     * 
     * If a key includes a plus sign '+' followed by another key, it's then treated as a key combination. For example: Ctrl+v will make it press both Ctrl and v at the same time
     * 
     * If a key is set as curly braces '{}' with a number inbetween, it will reference an argument from args, corresponding to the index between the brackets.
     * It will then input each of the characters from the argument string, one by one.
     * 
     * For example: 
     * 'v:100' (wait 100 miliseconds after release), 
     * 'Ctrl+v' (press both Ctrl and v), 
     * '{0}' (reference the first argument and type it out)
     * 
     * @param {Object.<string, number>} keyToDelayMap
     * @param {string[]} args array of custom arguments that will replace keys. 
     * 
     * For example: if a key is set as '{0}', it will use the first argument.
     */
    static pressKeySequence(keys, keyToDelayMap, args = []) {
        let output = "";

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let delay = keyToDelayMap[key] || 1;

            if (key.includes("{")) {
                let argumentIndex = parseInt(key.split("{")[1].split("}")[0]);
                let argument = args[argumentIndex];
                output += this.type(argument, { endDelay: 50 });
                continue;
            }

            if (key.includes(":")) {
                let parts = key.split(":");
                key = parts[0];
                delay = parseInt(parts[1]);
            }

            if (key.includes("+")) {
                output += this.pressKeyCombination(key.split("+"), { endDelay: delay });
            } else {
                output += this.pressKey(key, { endDelay: delay });
            }
        }

        return output;
    }
}