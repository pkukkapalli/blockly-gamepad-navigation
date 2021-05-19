# blockly-gamepad-navigation [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds gamepad 
navigation to Blockly. This allows users to use the gamepad to navigate the
toolbox and the blocks.

This is a fork of the official Blockly [keyboard-navigation](https://developers.google.com/blockly/guides/configure/web/keyboard-nav)
plugin.

## Installation

### Yarn
```
yarn add blockly-gamepad-navigation
```

### npm
```
npm install blockly-gamepad-navigation --save
```

## Usage
```js
import * as Blockly from 'blockly';
import {NavigationController} from 'blockly-gamepad-navigation';
// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});
// Initialize plugin.
const navigationController = new NavigationController();
navigationController.init();
navigationController.addWorkspace(workspace);
// Turns on keyboard navigation.
navigationController.enable(workspace);
```

## API
This plugin exports the following classes:
- `NavigationController`: Class in charge of registering all gamepad shortcuts.
- `Navigation`: This holds all the functions necessary to navigate around Blockly using the gamepad.
- `FlyoutCursor`: Cursor in charge of navigating the flyout.
- `LineCursor`: Alternative cursor that tries to navigate blocks like lines of code.

You should only need to use these if you plan on changing the default functionality.

## License
Apache 2.0
