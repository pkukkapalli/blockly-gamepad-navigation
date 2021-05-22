# Design Notes

These are either things that need to be done to change this plugin to a gamepad
plugin, or cleanup the existing code structure to make it easier to work with.

## Gamepad accessibility status

For the keyboard navigation plugin currently uses a field called
[`WorkspaceSvg.keyboardAccessibilityMode`][keyboardAccessibilityMode] on each
workspace to determine if keyboard navigation is enabled. Obviously we cannot
add new fields to the `WorkspaceSvg` class. Instead, we will create a map in the
`Navigation` class to maintain this bit.

[keyboardAccessibilityMode]:https://developers.google.com/blockly/reference/js/Blockly.WorkspaceSvg#keyboardAccessibilityMode

## Registering shortcuts

The keyboard navigation plugin uses a [`ShortcutRegistry`][ShortcutRegistry]
singleton class to maintain list of shortcuts that should be triggered when
there are key events. We need a `GamepadRegistry` singleton that lives in the
`Navigation` class and reacts to gamepad inputs.

[ShortcutRegistry]:https://developers.google.com/blockly/reference/js/Blockly.ShortcutRegistry

## Gamepad shortcut type

The `NavigationController` uses an interface call
`Blockly.ShortcutRegistry.KeyboardShortcut`. We need an equivalent called
`GamepadShortcut`.

## Shortcut registration cleanup

In the original keyboard navigation plugin, it seems that all of the shortcuts
are registered directly in the `NavigationController`. This makes the
`NavigationController` quite long, and hard to test. Let's move all the
shortcuts out into their own classes with a clean interface.

## Test updates

All unit tests also need to be updated to account for changes moving forward. To
ensure that the tests are passing moving forward, I will add the tests as a
precommit check.
