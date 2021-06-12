# Design Notes

These are either things that need to be done to change this plugin to a gamepad
plugin, or cleanup the existing code structure to make it easier to work with.

## ~~Gamepad accessibility status~~ DONE!

For the keyboard navigation plugin currently uses a field called
[`WorkspaceSvg.keyboardAccessibilityMode`][keyboardAccessibilityMode] on each
workspace to determine if keyboard navigation is enabled. Obviously we cannot
add new fields to the `WorkspaceSvg` class. Instead, we will create a map in the
`Navigation` class to maintain this bit.

[keyboardAccessibilityMode]:https://developers.google.com/blockly/reference/js/Blockly.WorkspaceSvg#keyboardAccessibilityMode

**Update:** I ended up creating a singleton `AccessibilityStatus` class that
holds this info, and replaces the `keyboardAccessibilityMode` field throughout
the project.

## Registering shortcuts

The keyboard navigation plugin uses a [`ShortcutRegistry`][ShortcutRegistry]
singleton class to maintain list of shortcuts that should be triggered when
there are key events. We need a `GamepadRegistry` singleton that lives in the
`Navigation` class and reacts to gamepad inputs.

[ShortcutRegistry]:https://developers.google.com/blockly/reference/js/Blockly.ShortcutRegistry

## ~~Gamepad shortcut type~~ DONE!

The `NavigationController` uses an interface call
`Blockly.ShortcutRegistry.KeyboardShortcut`. We need an equivalent called
`GamepadShortcut`.

## Shortcut registration cleanup

In the original keyboard navigation plugin, it seems that all of the shortcuts
are registered directly in the `NavigationController`. This makes the
`NavigationController` quite long, and hard to test. Let's move all the
shortcuts out into their own classes with a clean interface.

## ~~Test updates~~ DONE!

All unit tests also need to be updated to account for changes moving forward. To
ensure that the tests are passing moving forward, I will add the tests as a
precommit check.

## No singletons

Singletons make it harder to test changes, and make code less flexible.
Currently, the `AccessibilityStatus` class is a singleton. This is because of
the way the gesture_monkey_patch.js file is written. If you change it to be a
proper instantiable class, then you can also make `AccessibilityStatus` a
non-singleton.

## GamepadButton type needs a new name

The `GamepadButton` button type's name clashes with the `GamepadButton` type
specified in the browser. Coming up with a new name will just cut down on
confusion.

## Documentation of controls

Right now, the commands are undocumented. Ideally, you could overlay the
commands on an image of a gamepad.

## Customizable controls

The controls should be customizable so the user can optimize their workflow.

## Change test_helper.createNavigationWorkspace to use `NavigationController`

Right now, it uses `Navigation`, and enables gamepad navigation directly on the
`Navigation`. This was fine for keyboard navigation, because the controller
never had to enable navigation on anything besides `Navigation`. However, we
also now have `GamepadMonitor`.

This also ties into cleaning up resource management so that test suites are
flatter, and easier to make sense of. Right now, in some cases workspaces are
being disposed twice.

## Investigate skipped test

There is one test that is being skipped no matter what. But, I'm not sure what
test it is.

## Manual testing

Need to some manual testing of all features to make sure they are working as
intended, even though all of the tests are passing.

## Text input

Investigate best ways to input text with a game controller. Maybe a wheel that
lets you quickly jump between letters? Suggest words based on a dictionary?

## Auto-formatting

Add [prettier][prettier] to the project so that code is automatically formatted.
