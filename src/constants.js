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
};

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
