/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import {createPlayground, toolboxCategories} from '@blockly/dev-tools';
import * as Blockly from 'blockly';

import {
  NavigationController,
  GamepadShortcutRegistry,
  GamepadMonitor,
  Navigation,
  DEFAULT_CONTROLS} from '../src';


let controller;

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);
  controller.addWorkspace(workspace);
  return workspace;
}

/**
 * Dismiss the intro block.
 * @extern
 */
window.dismissIntro = function() {
  const intro = document.getElementById('intro');
  intro.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', function() {
  const gamepadShortcutRegistry = new GamepadShortcutRegistry();
  const gamepadMonitor = new GamepadMonitor(gamepadShortcutRegistry);
  const navigation = new Navigation();
  controller = new NavigationController(
      navigation,
      gamepadShortcutRegistry,
      gamepadMonitor,
      DEFAULT_CONTROLS,
      'help');
  controller.init();
  const defaultOptions = {
    toolbox: toolboxCategories,
  };
  createPlayground(
      document.getElementById('root'), createWorkspace, defaultOptions);
});
