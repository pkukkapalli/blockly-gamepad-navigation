# Text input

This is a design document that outlines how text input will be implemented in
this plugin.

## Navigation state

You need a new state to capture the text input state. Sidenote: we probably also
need a proper state for the help screen.

## Field Input

Blockly has a class called [`FieldTextInput`][FieldTextInput]. This class
handles all text input "holes" in any block. By default, it accepts keys from
the keyboard, or on mobile opens a popup using
[`Blockly.prompt`][Blockly.prompt]. So, we should override the
[`showEditor_`][showEditor_] method, and make sure that it opens our custom
modal editor, which will be described in the following sections.

## Capturing text

We essentially want to implement the method demonstrated by this
[article][gamepad-text]. To do this, we will have a modal that displays a
virtual keyboard. This modal will open whenever `showEditor_` is invoked. We
then change the navigation state to `TEXT_INPUT`.

## Revamping shortcuts

We want to split the QWERTY keyboard into two halves. Each stick on the gamepad
controls each half. Then, on each stick, we want to map different regions of the
stick to a key. Representing the different regions of the stick is the difficult
part of this implementation. Unfortunately, the [article][gamepad-text] does not
show the regions of the stick were represented. However, this can be quite
complicated, so as a first step, we will start with an extremely naive
controller setup. The cursor is sticky, and just moves in the cardinal
directions.

[FieldTextInput]:https://github.com/google/blockly/blob/master/core/field_textinput.js
[Blockly.prompt]:https://github.com/google/blockly/blob/master/core/blockly.js#L362
[showEditor_]:https://github.com/google/blockly/blob/master/core/field_textinput.js#L293
[gamepad-text]:https://www.gamasutra.com/blogs/CharlieDeck/20170721/301392/Towards_Better_Gamepad_Text_Input.php
