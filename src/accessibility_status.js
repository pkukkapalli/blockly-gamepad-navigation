/**
 * @fileoverview Holds the information on whether or not a workspace has
 * gamepad accessbility enabled.
 */

import * as Blockly from 'blockly/core';

/**
 * Contains the set of workspaces that have gamepad accessbility enabled.
 */
export class AccessibilityStatus {
  /**
   * Constructor for accessibility status.
   */
  constructor() {
    /**
     * The IDs of the workspaces that are enabled.
     * @type {!Set<string>}
     * @private
     */
    this.enabledWorkspaceIds_ = new Set();
  }

  /**
   * Checks whether the given workspace has gamepad accessibility enabled.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to check.
   * @return {boolean} True if workspace is enabled, false otherwise.
   * @public
   */
  isGamepadAccessibilityEnabled(workspace) {
    return this.enabledWorkspaceIds_.has(workspace.id);
  }

  /**
   * Enable gamepad accessibility for the given workspace.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to enable.
   * @public
   */
  enableGamepadAccessibility(workspace) {
    this.enabledWorkspaceIds_.add(workspace.id);
  }

  /**
   * Disable gamepad accessbility for the given workspace.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to disable.
   */
  disableGamepadAccessibility(workspace) {
    this.enabledWorkspaceIds_.delete(workspace.id);
  }
}

/**
 * Singleton instance of the AccessbilityStatus class. Rather than
 * instantiating your own, this should be used.
 */
export const accessibilityStatus = new AccessibilityStatus();
