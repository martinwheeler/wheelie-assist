# Requirements

## React Native


## Arduino

- Need unique name for each device that we build
    - Hash based on current time stamp + the entire .ino code base


# App Flow

## React Native

1. Open device scanning screen to choose your device
    - Need to save device name to the phones storage somehow
    - Skips this if the user has picked a device before
2. Open a screen to show the current angle
    - Requires connecting to a device first
    - Checks to see if we have been provided a device or if we have on in storage somewhere
