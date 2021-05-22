/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Overrides methods on Blockly.Gesture in order to allow users
 * to move the cursor to blocks or the workspace using shift click.
 * TODO(pkukkapalli): This is probably not necessary for gamepad navigation, and
 * can be deprecated.
 * TODO(google/blockly#4584): We do not have a way to do this currently without
 * monkey patching Blockly.
 */

import * as Blockly from 'blockly/core';
import {accessbilityStatus} from './accessibility_status';


const oldDoWorkspaceClick = Blockly.Gesture.prototype.doWorkspaceClick_;

/**
 * Execute a workspace click. When in accessibility mode shift clicking will
 * move the cursor.
 * @param {!Event} e A mouse up or touch end event.
 * @this {Blockly.Gesture}
 * @override
 */
Blockly.Gesture.prototype.doWorkspaceClick_ = function(e) {
  oldDoWorkspaceClick.call(this, e);
  const ws = this.creatorWorkspace_;
  if (e.shiftKey && accessbilityStatus.isGamepadAccessibilityEnabled(ws)) {
    const screenCoord = new Blockly.utils.Coordinate(e.clientX, e.clientY);
    const wsCoord = Blockly.utils.screenToWsCoordinates(ws, screenCoord);
    const wsNode = Blockly.ASTNode.createWorkspaceNode(ws, wsCoord);
    ws.getCursor().setCurNode(wsNode);
  }
};

const oldDoBlockClick = Blockly.Gesture.prototype.doBlockClick_;

/**
 * Execute a block click. When in accessibility mode shift clicking will move
 * the cursor to the block.
 * @this {Blockly.Gesture}
 * @override
 */
Blockly.Gesture.prototype.doBlockClick_ = function(e) {
  oldDoBlockClick.call(this, e);
  if (!this.targetBlock_.isInFlyout && this.mostRecentEvent_.shiftKey &&
      accessbilityStatus.isGamepadAccessibilityEnabled(
          this.targetBlock_.workspace)) {
    this.creatorWorkspace_.getCursor().setCurNode(
        Blockly.ASTNode.createTopNode(this.targetBlock_));
  }
};
