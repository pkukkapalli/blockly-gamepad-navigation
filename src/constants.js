/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Constants for gamepad navigation.
 */

/**
 * Gamepad navigation states.
 * The different parts of Blockly that the user navigates between.
 * @enum {string}
 * @const
 * @public
 */
export const STATE = {
  WORKSPACE: 'workspace',
  FLYOUT: 'flyout',
  TOOLBOX: 'toolbox',
  HELP: 'help',
  TEXT_INPUT: 'text_input',
};

/**
 * Default gamepad navigation shortcut names.
 * @enum {string}
 * @const
 * @public
 */
export const SHORTCUT_NAMES = {
  PREVIOUS: 'previous',
  NEXT: 'next',
  IN: 'in',
  OUT: 'out',
  INSERT: 'insert',
  MARK: 'mark',
  DISCONNECT: 'disconnect',
  TOOLBOX: 'toolbox',
  EXIT: 'exit',
  TOGGLE_GAMEPAD_NAV: 'toggle_gamepad_nav',
  COPY: 'gamepad_nav_copy',
  CUT: 'gamepad_nav_cut',
  PASTE: 'gamepad_nav_paste',
  DELETE: 'gamepad_nav_delete',
  MOVE_WS_CURSOR_UP: 'workspace_up',
  MOVE_WS_CURSOR_DOWN: 'workspace_down',
  MOVE_WS_CURSOR_LEFT: 'workspace_left',
  MOVE_WS_CURSOR_RIGHT: 'workspace_right',
  SCROLL_WS_UP: 'scroll_workspace_up',
  SCROLL_WS_DOWN: 'scroll_workspace_down',
  SCROLL_WS_LEFT: 'scroll_workspace_left',
  SCROLL_WS_RIGHT: 'scroll_workspace_right',
  OPEN_HELP: 'help',
  SELECT_LEFT_KEYBOARD_CURSOR: 'select_left_keyboard_cursor',
  MOVE_LEFT_KEYBOARD_CURSOR_LEFT: 'move_left_keyboard_cursor_left',
  MOVE_LEFT_KEYBOARD_CURSOR_RIGHT: 'move_left_keyboard_cursor_right',
  MOVE_LEFT_KEYBOARD_CURSOR_UP: 'move_left_keyboard_cursor_up',
  MOVE_LEFT_KEYBOARD_CURSOR_DOWN: 'move_left_keyboard_cursor_down',
  SELECT_RIGHT_KEYBOARD_CURSOR: 'select_right_keyboard_cursor',
  MOVE_RIGHT_KEYBOARD_CURSOR_LEFT: 'move_right_keyboard_cursor_left',
  MOVE_RIGHT_KEYBOARD_CURSOR_RIGHT: 'move_right_keyboard_cursor_right',
  MOVE_RIGHT_KEYBOARD_CURSOR_UP: 'move_right_keyboard_cursor_up',
  MOVE_RIGHT_KEYBOARD_CURSOR_DOWN: 'move_right_keyboard_cursor_down',
};

/**
 * Mapping between shortcuts and their display names.
 * @type {Map<SHORTCUT_NAMES, string>}
 * @const
 * @public
 */
export const SHORTCUT_DISPLAY_NAMES = new Map([
  [SHORTCUT_NAMES.PREVIOUS, 'Move to previous node'],
  [SHORTCUT_NAMES.NEXT, 'Move to next node'],
  [SHORTCUT_NAMES.IN, 'Move into block'],
  [SHORTCUT_NAMES.OUT, 'Move out of block'],
  [SHORTCUT_NAMES.INSERT, 'Insert a block'],
  [SHORTCUT_NAMES.MARK, 'Mark a block'],
  [SHORTCUT_NAMES.DISCONNECT, 'Disconnect two nodes'],
  [SHORTCUT_NAMES.TOOLBOX, 'Toggle toolbox'],
  [SHORTCUT_NAMES.EXIT, 'Exit'],
  [SHORTCUT_NAMES.TOGGLE_GAMEPAD_NAV, 'Toggle gamepad navigation'],
  [SHORTCUT_NAMES.COPY, 'Copy node'],
  [SHORTCUT_NAMES.CUT, 'Cut node'],
  [SHORTCUT_NAMES.PASTE, 'Paste node'],
  [SHORTCUT_NAMES.DELETE, 'Delete node'],
  [SHORTCUT_NAMES.MOVE_WS_CURSOR_UP, 'Move workspace cursor up'],
  [SHORTCUT_NAMES.MOVE_WS_CURSOR_DOWN, 'Move workspace cursor down'],
  [SHORTCUT_NAMES.MOVE_WS_CURSOR_LEFT, 'Move workspace cursor left'],
  [SHORTCUT_NAMES.MOVE_WS_CURSOR_RIGHT, 'Move workspace cursor right'],
  [SHORTCUT_NAMES.SCROLL_WS_UP, 'Scroll workspace up'],
  [SHORTCUT_NAMES.SCROLL_WS_DOWN, 'Scroll workspace down'],
  [SHORTCUT_NAMES.SCROLL_WS_LEFT, 'Scroll workspace left'],
  [SHORTCUT_NAMES.SCROLL_WS_RIGHT, 'Scroll workspace right'],
  [SHORTCUT_NAMES.TOGGLE_HELP, 'Toggle the help screen'],
  [SHORTCUT_NAMES.SELECT_LEFT_KEYBOARD_CURSOR,
    'Select the currently highlighted key on the left keyboard'],
  [SHORTCUT_NAMES.MOVE_LEFT_KEYBOARD_CURSOR_LEFT,
    'Move left keyboard cursor left'],
  [SHORTCUT_NAMES.MOVE_LEFT_KEYBOARD_CURSOR_RIGHT,
    'Move left keyboard cursor right'],
  [SHORTCUT_NAMES.MOVE_LEFT_KEYBOARD_CURSOR_UP,
    'Move left keyboard cursor up'],
  [SHORTCUT_NAMES.MOVE_LEFT_KEYBOARD_CURSOR_DOWN,
    'Move left keyboard cursor down'],
  [SHORTCUT_NAMES.SELECT_RIGHT_KEYBOARD_CURSOR,
    'Select the currently highlighted key on the right keyboard'],
  [SHORTCUT_NAMES.MOVE_RIGHT_KEYBOARD_CURSOR_LEFT,
    'Move right keyboard cursor left'],
  [SHORTCUT_NAMES.MOVE_RIGHT_KEYBOARD_CURSOR_RIGHT,
    'Move right keyboard cursor right'],
  [SHORTCUT_NAMES.MOVE_RIGHT_KEYBOARD_CURSOR_UP,
    'Move right keyboard cursor up'],
  [SHORTCUT_NAMES.MOVE_RIGHT_KEYBOARD_CURSOR_DOWN,
    'Move right keyboard cursor down'],
]);

/**
 * Types of possible messages passed into the loggingCallback in the Navigation
 * class.
 * @enum {string}
 * @const
 * @public
 */
export const LOGGING_MSG_TYPE = {
  ERROR: 'error',
  WARN: 'warn',
  LOG: 'log',
};

/**
 * The different directions.
 * @enum {string}
 * @const
 * @public
 */
export const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down',
};
