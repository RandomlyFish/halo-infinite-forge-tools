export const config = {

    /**
     * The number of miliseconds to wait after a key or combination of keys have been pressed
     * 
     * @type {Object.<string, number>}
     */
    keyToDelayMap: {
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
    },

    /** 
     * Contains information about what keys to press to navigate the forge menus 
     * 
     * For example: 
     * going from the root to "actionTree.menu.spawnPolygon", it will need to press enterKeys for both menu and spawnPolygon.
     * 
     * Then going back to the root, it will need to press the exit keys for both spawnPolygon and menu (in that order).
     */
    actionTree: {
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
}