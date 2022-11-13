export class GenerateAHK {
    static sleep(ms) {
        return "\n" + "Sleep, " + ms + "\n\n";
    }

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
     * @param {string[]} keys array of keys, if the key includes a colon and a number, then the value after the colon is the delay. For example: Enter:100 which adds a 100ms delay after the key press 
     * @param {string[]} args array of custom arguments that will replace keys. For example: the key {0}, will use the first argument
     */
    static pressKeySequence(keys, args = []) {
        let keyToDelayMap = {
            "Enter": 50,
            "Ctrl+d": 50,
            "r": 50,
            "PgUp": 1,
            "PgDn": 1,
            "q": 10,
            "e": 10,
            "w": 1,
            "s": 1,
            "Escape": 50
        }

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