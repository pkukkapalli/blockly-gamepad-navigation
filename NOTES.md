# Design Notes

These are either things that need to be done to change this plugin to a gamepad
plugin, or cleanup the existing code structure to make it easier to work with.

## Functionality

- [x] **Gamepad accessibility status**: for the keyboard navigation plugin
  currently uses a field called
  [`WorkspaceSvg.keyboardAccessibilityMode`][keyboardAccessibilityMode] on each
  workspace to determine if keyboard navigation is enabled. Obviously we cannot
  add new fields to the `WorkspaceSvg` class. Instead, we will create a map in
  the `Navigation` class to maintain this bit. **Update:** I ended up creating a
  singleton `AccessibilityStatus` class that holds this info, and replaces the
  `keyboardAccessibilityMode` field throughout the project.

- [x] **Documentation of controls**: right now, the commands are undocumented.
  Ideally, you could overlay the commands on an image of a gamepad. These
  should be auto-generated based on the controls configured by the plugin user.

- [x] **Customizable controls**: the controls should be customizable so the user
  can optimize their workflow.

- [x] **Add state to control configuration**: currently the configuration is
  just a mapping between shortcuts and gamepad combinations.

- [x] **Scroll workspace**: right now you cannot scroll the workspace easily. R2
  and the right stick should be a good solution.

- [x] **Smooth scrolling**: right now, the scrolling is rather jumpy, because we
  enforce a delay on input activation. Instead different shortcuts should have
  different delays. Scrolling for example should be continuous unlike node
  navigation. Discrete jumps should be delayed, continuous jumps should be
  continuous. Move time considerations from `gamepad_monitor.js` to
  `gamepad_shortcut_registry.js`. It should be map from the shortcut name to the
  timestamp when it was last executed. Then, the registry can activate the
  shortcut if it has passed a given delay. The delay will be defined on each
  `GamepadShortcut`.

- [x] **Better help widget**: the help widget should hover over the screen when
  opened, and also have a diagram of the controller. **Update:** It is now in a
  popup.

- [ ] **Gamepad diagram on help popup**: the help widget should now show the
  gamepad diagram, not just a list of text.

- [ ] **Text input**: investigate best ways to input text with a game
  controller. Maybe a wheel that lets you quickly jump between letters? Suggest
  words based on a dictionary? See [article][gamepad-text] on how to do text
  input. The `NavigationController` class gets a new state, which is
  `TEXT_INPUT` when the virtual keyboard is in focus. Then, all movements during
  this state will be sent to the `VirtualKeyboard` to process, and enter as
  text. In order to actually get the field input to work as expected, i.e. open
  a popup for the controller, you have to override `FieldTextInput` and register
  it.

- [ ] **Update plugin documentation**: the documentation is a bit stale and
  incomplete.

- [ ] **i18n**: help text should be internationalized to the user's locale.

- [ ] **Detect controller**: help text should be updated according to the
  gamepad being used.

- [x] **Better test app**: the test app is quite clunky. The instructions on the
  top take up quite a lot of space, and it also uses a lot of horizontal space,
  which can make using the Chrome developer tools cumbersome. Make the
  instructions and intro dismissable.

- [ ] **Better navigation controls**: the default controls migrated from the
  keyboard navigation plugin are quite cumbersome to use, and not very
  intuitive.

- [ ] **Register macros**: allow the user to register macros using custom key
  combinations. We need a good UI for allowing the user to select operations.
  Perhaps, you start a record sequence, and then you take note of all of the
  operations (anything that can be pushed onto the undo stack). Then after
  recording, you can register a unique key combination. Like a Tekken button
  combo.

- [ ] **Allow free scrolling**: instead of having a cursor that navigates
  through blocks. Allow the user to go around with a free cursor not constrained
  to any block, and allow them to lock onto any block that they are close to.
  The workspace should of course automatically scroll around the cursor.

- [ ] **Control cooldown:** certain commands should not be executed too closely
  together. For example, if I press circle to exit, the plugin should also avoid
  applying disconnect, because it's a different command altogether.

## Code health

- [ ] **Registering shortcuts**: the keyboard navigation plugin uses a
  [`ShortcutRegistry`][ShortcutRegistry] singleton class to maintain list of
  shortcuts that should be triggered when there are key events. We need a
  `GamepadRegistry` singleton that lives in the `Navigation` class and reacts to
  gamepad inputs.

- [x] **Gamepad shortcut type**: the `NavigationController` uses an interface call
`Blockly.ShortcutRegistry.KeyboardShortcut`. We need an equivalent called
`GamepadShortcut`.

- [ ] **Shortcut registration cleanup**: in the original keyboard navigation
  plugin, it seems that all of the shortcuts are registered directly in the
  `NavigationController`. This makes the `NavigationController` quite long, and
  hard to test. Let's move all the shortcuts out into their own classes with a
  clean interface.

- [x] **Make tests pass**: make any code changes necessary to get tests to pass.

- [x] **Unit test presubmit check**: all unit tests also need to be updated to
  account for changes moving forward. To ensure that the tests are passing
  moving forward, I will add the tests as a precommit check.

- [ ] **No singeltons**: singletons make it harder to test changes, and make
  code less flexible. Currently, the `AccessibilityStatus` class is a singleton.
  This is because of the way the gesture_monkey_patch.js file is written. If you
  change it to be a proper instantiable class, then you can also make
  `AccessibilityStatus` a non-singleton.

- [x] **`GamepadButton` type needs a new name**: the `GamepadButton` button
  type's name clashes with the `GamepadButton` type specified in the browser.
  Coming up with a new name will just cut down on confusion. **Update**: renamed
  to `GamepadButtonType`, and renamed `GamepadAxis` to `GamepadAxisType`.

- [ ] **Change `test_helper.createNavigationWorkspace` to use
  `NavigationController`**: right now, it uses `Navigation`, and enables gamepad
  navigation directly on the `Navigation`. This was fine for keyboard
  navigation, because the controller never had to enable navigation on anything
  besides `Navigation`. However, we also now have `GamepadMonitor`. This also
  ties into cleaning up resource management so that test suites are flatter, and
  easier to make sense of. Right now, in some cases workspaces are being
  disposed twice.

- [ ] **Investigate skipped test**: there is one test that is being skipped no
  matter what. But, I'm not sure what test it is.

- [ ] **Manual testing**: need to some manual testing of all features to make
  sure they are working as intended, even though all of the tests are passing.

- [ ] **Auto-formatting**: add [prettier][prettier] to the project so that code
  is automatically formatted.

- [ ] **Optional parameters**: the optional parameters for
  `NavigationController` are all positional right now. It would be better if
  they were packed into an object.

- [ ] **Smaller test files**: right now, `navigation_test.mocha.js` is a
  monolithic test file that verifies most of the functionality. In reality, it
  should be broken up into smaller files.

[keyboardAccessibilityMode]:https://developers.google.com/blockly/reference/js/Blockly.WorkspaceSvg#keyboardAccessibilityMode

[ShortcutRegistry]:https://developers.google.com/blockly/reference/js/Blockly.ShortcutRegistry

[prettier]:https://prettier.io/

[gamepad-text]:https://www.gamasutra.com/blogs/CharlieDeck/20170721/301392/Towards_Better_Gamepad_Text_Input.php
