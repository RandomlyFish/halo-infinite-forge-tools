# halo-infinite-forge-tools

This currently only includes one tool, which allows you to take an obj file and have it automatically built inside forge.

Note: this is work in progress. The goal is to create an executable program to make it more accessible. However, for the time being, it's just a node app.

## Setup
1. Download the files in this repository as a zip. Alternatively, you can clone the repository
2. Download and install Node: https://nodejs.org/en/
3. Download and install the current version of AutoHotKey: https://www.autohotkey.com/

## How to generate the macro
1. Open the directory from step 1 of Setup, in the terminal
2. Run the following command: npm start model=test

To use a different file in the input folder, change 'test' to the name of the file you want to use

## How to use the macro
The macro is just a sequence of different keyboard keys, it has no information about the state of the game. So, before running the macro, the forge menu has to be in the correct state.

1. Open the 'tool settings' menu and set 'movement direction' to 'world' and 'rotation pivot' to 'origin'
2. Make sure that all the options on the 'object browser' tab are collapsed (the scrollbar should not be visible)
3. Go to the object properties tab and expand 'general', 'object mode', 'transform', 'position' and 'rotation'
4. Switch back to the 'object browser' tab

If done correctly, the scrollbar should be at the top of the 'object properties' tab when you switch to it, so that you see 'general' at the top and 'roll' at the bottom.

4. Double click the 'macro.ahk' file in the output folder
5. Leave the game open and don't touch anything until it's done

By the time the macro is done, the forge menu will be reset to the correct state. So, unless you interact with the menu after it's done, you won't have to repeat step 1-4.

## How to stop the macro
On the bottom right of the windows taskbar, in the popup menu left of the volume icon, you should see the AutoHotKey icon. Right click it and select Exit. Don't forget to reset the forge menu if you plan to run it again.

## How to configure key press delays
If it starts doing unintended actions in the forge menu, you may need to increase the delay between key presses.

In the 'src' folder, you will find 'config.js'. In that file, look for 'keyToDelayMap'. Each of those keys corresponds to an action in the forge menu. For example, the 'r' key toggles the menu, so if would like to increase the wait after it opens the forge menu, you can increase the value for that key.

Once you have made changes, you will have to generate the macro again.

## Command line arguments

Here's an example of a command including all command line arguments: npm start model=test chunks=2 chunk=1 filter=-6.08,3,614.55 autoSave=true

### model (required)
Used to specify the obj file to load, by name. 

Example: model=test.

This will make it read a file called test.obj in the input folder.

### chunks and chunk
Used in combination for specifying how many objects to spawn in the generated macro.

Example: chunks=4 chunk=1.

That will make the macro spawn the first 25% of all objects.

You should then increase chunk by 1 to spawn the next 25%.

### filter
Used to filter out objects from the macro, keeping only objects at the provided position.

Example: filter=0.1,2,3.4

This will make it keep any objects at position: x 0.1, y: 2 and z: 3.4

Useful incase it messed up with the rotation or size of an object.

### autoSave
Used to make it save the map as soon as the macro is done.

Example: autoSave=true

## Known issues
* The time between key presses can sometimes be too short, causing unintended interactions in the forge menu. However, it can be configured
* It currently doesn't work with model faces that uses more than 3 vertices
* Due to the minimum size limit of objects, it can't create triangles smaller than 0.5 in game units
