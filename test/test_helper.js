/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import Blockly from 'blockly';
import sinon from 'sinon';
import {GamepadCombination} from '../src/gamepad';
import {Navigation} from '../src/navigation';
import * as Constants from '../src/constants';

/**
 * Appends a div with the given ID to the document body.
 * @param {string} id The ID to assign to the element.
 */
export function createDiv(id) {
  if (document.getElementById(id)) {
    return;
  }
  const element = document.createElement('div');
  element.id = id;
  document.body.append(element);
}

/**
 * Creates a workspace for testing gamepad navigation.
 * @param {Navigation} navigation Object holding navigation classes.
 * @param {boolean} enableGamepadNav True to enable gamepad navigation, false
 *     otherwise.
 * @param {boolean} readOnly True for a read only workspace, false otherwise.
 * @return {Blockly.WorkspaceSvg} The created workspace.
 */
export function createNavigationWorkspace(
    navigation, enableGamepadNav, readOnly) {
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: `
      <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-categories" style="display: none">
        <category name="First" css-container="something">
          <block type="basic_block">
            <field name="TEXT">FirstCategory-FirstBlock</field>
          </block>
          <block type="basic_block">
            <field name="TEXT">FirstCategory-SecondBlock</field>
          </block>
        </category>
        <category name="Second">
          <block type="basic_block">
            <field name="TEXT">SecondCategory-FirstBlock</field>
          </block>
        </category>
      </xml>
  `,
    readOnly: readOnly,
  });
  if (enableGamepadNav) {
    // TODO(pkukkapalli): replace this with NavigationController for
    // consistency.
    navigation.addWorkspace(workspace);
    navigation.enableGamepadAccessibility(workspace);
    navigation.setState(workspace, Constants.STATE.WORKSPACE);
  }
  return workspace;
}

/**
 * Fires an event to indicate that a gamepad has been connected.
 */
export function connectFakeGamepad() {
  const event = new Event('gamepadconnected');
  event.gamepad = {index: 0};
  window.dispatchEvent(event);
}

/**
 * Fires an event to indicate that a gamepad has been disconnected.
 */
export function disconnectFakeGamepad() {
  const event = new Event('gamepaddisconnected');
  event.gamepad = {index: 0};
  window.dispatchEvent(event);
}

/**
 * Stubs the navigator.getGamepads method to have a gamepad with the given
 * button/axis combination active.
 * @param {!GamepadCombination} gamepadCombination The gamepad combination to
 *     populate the gamepad with.
 * @return {sinon.SinonStub<[], Gamepad[]>} The created stub.
 */
export function createNavigatorGetGamepadsStub(gamepadCombination) {
  return sinon.stub(navigator, 'getGamepads')
      .callsFake(() => [gamepadCombination.asGamepad()]);
}
