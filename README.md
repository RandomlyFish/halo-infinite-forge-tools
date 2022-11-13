# halo-infinite-forge-tools

This currently only includes one tool, which allows you to take an obj file and have it automatically built inside forge.

Note: this is work in progress. The goal is to create an executable program to make it more accessible. However, for the time being, it's just a node app.

## Setup
1. Download the files in this repository as a zip. Alternatively, you can clone the repository
2. Download and install Node: https://nodejs.org/en/
3. Download and install the current version of AutoHotKey: https://www.autohotkey.com/

## How to generate the macro
1. Open the directory from step 1 of Setup, in the terminal
2. Run the following command: npm start model=quad

To use a different file in the input folder, change 'quad' to the name of the file you want to use

## How to use the macro
The macro is just a sequence of different keyboard keys, it has no information about the state of the game. So, before running the macro, the forge menu has to be in the correct state.

1. Make sure that all the options on the 'object browser' tab are collapsed (the scrollbar should not be visible)
2. Go to the object properties tab and expand 'general', 'object mode', 'transform', 'position' and 'rotation'
3. Switch back to the 'object browser' tab

If done correctly, the scrollbar should be at the top of the 'object properties' tab when you switch to it, so that you see 'general' at the top and 'roll' at the bottom.

4. Double click the 'macro.ahk' file in the output folder
5. Click on the game before 3 seconds have passed
6. Leave the game open and don't touch anything until it's done

By the time the macro is done, the forge menu will be reset to the correct state. So, unless you interact with the menu after it's done, you won't have to repeat step 1-3.

## Known issues
* The time between key presses can sometimes be too short, causing unintended interactions in the forge menu
* It currently doesn't work with model faces that uses more than 3 vertices
* Due to the minimum size limit of objects, it can't create triangles smaller than 0.5 in game units