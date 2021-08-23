/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registers all of the gamepad shortcuts that are necessary for
 * navigating blockly using the gamepad.
 */

import './gesture_monkey_patch';

import * as Blockly from 'blockly/core';

import * as Constants from './constants';
import {Navigation} from './navigation';
import {AccessibilityStatus} from './accessibility_status';
import {GamepadShortcut, GamepadShortcutRegistry} from
  './gamepad_shortcut_registry';
import {GamepadMonitor} from './gamepad_monitor';
import {
  GamepadAxisType,
  GamepadButtonType,
  GamepadCombination} from './gamepad';
import {HelpPopup} from './help';
import {ModalManager} from './modal';

const l1AndR1 = new GamepadCombination()
    .addButton(GamepadButtonType.L1)
    .addButton(GamepadButtonType.R1);

const r2AndRightStickUp = new GamepadCombination()
    .addButton(GamepadButtonType.R2)
    .addAxis(GamepadAxisType.RIGHT_VERTICAL_UP);

const r2AndRightStickDown = new GamepadCombination()
    .addButton(GamepadButtonType.R2)
    .addAxis(GamepadAxisType.RIGHT_VERTICAL_DOWN);

const r2AndRightStickLeft = new GamepadCombination()
    .addButton(GamepadButtonType.R2)
    .addAxis(GamepadAxisType.RIGHT_HORIZONTAL_LEFT);

const r2AndRightStickRight = new GamepadCombination()
    .addButton(GamepadButtonType.R2)
    .addAxis(GamepadAxisType.RIGHT_HORIZONTAL_RIGHT);

export const DEFAULT_CONTROLS = new Map([
  [Constants.SHORTCUT_NAMES.PREVIOUS, GamepadCombination.LEFT_STICK_UP],
  [Constants.SHORTCUT_NAMES.NEXT, GamepadCombination.LEFT_STICK_DOWN],
  [Constants.SHORTCUT_NAMES.IN, GamepadCombination.LEFT_STICK_RIGHT],
  [Constants.SHORTCUT_NAMES.OUT, GamepadCombination.LEFT_STICK_LEFT],
  [Constants.SHORTCUT_NAMES.DISCONNECT, GamepadCombination.CIRCLE],
  [Constants.SHORTCUT_NAMES.EXIT, GamepadCombination.CIRCLE],
  [Constants.SHORTCUT_NAMES.INSERT, GamepadCombination.TRIANGLE],
  [Constants.SHORTCUT_NAMES.MARK, GamepadCombination.CROSS],
  [Constants.SHORTCUT_NAMES.TOOLBOX, GamepadCombination.SQUARE],
  [Constants.SHORTCUT_NAMES.TOGGLE_GAMEPAD_NAV, l1AndR1],
  [Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_DOWN,
    GamepadCombination.RIGHT_STICK_DOWN],
  [Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_LEFT,
    GamepadCombination.RIGHT_STICK_LEFT],
  [Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_UP,
    GamepadCombination.RIGHT_STICK_UP],
  [Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_RIGHT,
    GamepadCombination.RIGHT_STICK_RIGHT],
  [Constants.SHORTCUT_NAMES.SCROLL_WS_UP, r2AndRightStickUp],
  [Constants.SHORTCUT_NAMES.SCROLL_WS_DOWN, r2AndRightStickDown],
  [Constants.SHORTCUT_NAMES.SCROLL_WS_LEFT, r2AndRightStickLeft],
  [Constants.SHORTCUT_NAMES.SCROLL_WS_RIGHT, r2AndRightStickRight],
  [Constants.SHORTCUT_NAMES.COPY, GamepadCombination.UP],
  [Constants.SHORTCUT_NAMES.PASTE, GamepadCombination.DOWN],
  [Constants.SHORTCUT_NAMES.CUT, GamepadCombination.RIGHT],
  [Constants.SHORTCUT_NAMES.DELETE, GamepadCombination.LEFT],
  [Constants.SHORTCUT_NAMES.TOGGLE_HELP, GamepadCombination.SELECT],
]);

/**
 * Class for registering shortcuts for gamepad navigation.
 */
export class NavigationController {
  /**
   * Constructor used for registering shortcuts.
   * This will register any default shortcuts for gamepad navigation.
   * This is intended to be a singleton.
   * @param {object} o The parameter object with the following properties.
   * @param {!Navigation=} o.optNavigation The class that handles gamepad
   *     navigation shortcuts. (Ex: inserting a block, focusing the flyout).
   * @param {!GamepadShortcutRegistry=} o.optGamepadShortcutRegistry The
   *     shortcut registry to use.
   * @param {!GamepadMonitor=} o.optGamepadMonitor The gamepad monitor to use
   *     for getting input from the gamepad.
   * @param {!Map<Constants.SHORTCUT_NAMES, GamepadCombination>=} o.optControls
   *     A custom control configuration for the plugin.
   * @param {!ModalManager} o.optModalManager The modal manager to initialize
   *     with.
   * @param {!HelpPopup} o.optHelpPopup A custom help popup to use.
   * @param {?AccessibilityStatus} o.optAccessibilityStatus A custom
   *     accessibility status manager.
   */
  constructor({optNavigation,
    optGamepadShortcutRegistry,
    optGamepadMonitor,
    optControls,
    optModalManager,
    optHelpPopup,
    optAccessibilityStatus}) {
    /**
     * The accessibility status manager for all workspaces.
     * @type {!AccessibilityStatus}
     * @protected
     */
    this.accessibilityStatus = optAccessibilityStatus ||
        new AccessibilityStatus();

    /**
     * Handles any gamepad navigation shortcuts.
     * @type {!Navigation}
     * @public
     */
    this.navigation = optNavigation || new Navigation(this.accessibilityStatus);

    /**
     * Registers all of the shortcuts for the gamepad.
     * @type {!GamepadShortcutRegistry}
     * @public
     */
    this.gamepadShortcutRegistry = optGamepadShortcutRegistry ||
        new GamepadShortcutRegistry();

    /**
     * Monitors input from the gamepad and triggers the correct shortcuts.
     * @type {!GamepadMonitor}
     * @public
     */
    this.gamepadMonitor = optGamepadMonitor ||
        new GamepadMonitor(this.gamepadShortcutRegistry);

    /**
     * Manages any modal popups we create.
     * @type {!ModalManager}
     * @public
     */
    this.modalManager = optModalManager || new ModalManager();

    /**
     * A popup to show instructions for using the plugin.
     * @type {!HelpPopup}
     * @public
     */
    this.helpPopup = optHelpPopup || new HelpPopup();

    /**
     * The control configuration for each action.
     * @type {!Map<Constants.SHORTCUT_NAMES, GamepadCombination>}
     * @protected
     */
    this.controls = optControls || DEFAULT_CONTROLS;
  }

  /**
   * Registers the default keyboard shortcuts for keyboard navigation.
   * @public
   */
  init() {
    this.addShortcutHandlers();
    this.registerDefaults();
    this.gamepadMonitor.init();
    this.modalManager.init();
    this.helpPopup.init(this.modalManager, this.controls);
  }

  /**
   * Adds methods to core Blockly components that allows them to handle gamepad
   * shortcuts when in gamepad navigation mode.
   * @protected
   */
  addShortcutHandlers() {
    if (Blockly.FieldColour) {
      Blockly.FieldColour.prototype.onShortcut = this.fieldColourHandler;
    }

    if (Blockly.FieldDropdown) {
      Blockly.FieldDropdown.prototype.onShortcut = this.fieldDropdownHandler;
    }

    if (Blockly.Toolbox) {
      Blockly.Toolbox.prototype.onShortcut = this.toolboxHandler;
    }
  }

  /**
   * Removes methods on core Blockly components that allows them to handle
   * gamepad shortcuts.
   * @protected
   */
  removeShortcutHandlers() {
    if (Blockly.FieldColour) {
      Blockly.FieldColour.prototype.onShortcut = null;
    }

    if (Blockly.FieldDropdown) {
      Blockly.FieldDropdown.prototype.onShortcut = null;
    }

    if (Blockly.Toolbox) {
      Blockly.Toolbox.prototype.onShortcut = null;
    }
  }

  /**
   * Handles the given gamepad shortcut.
   * This is only triggered when gamepad accessibility mode is enabled.
   * @param {!GamepadShortcut} shortcut The shortcut to be handled.
   * @return {boolean} True if the field handled the shortcut,
   *     false otherwise.
   * @this {Blockly.FieldColour}
   * @protected
   */
  fieldColourHandler(shortcut) {
    if (this.picker_) {
      switch (shortcut.name) {
        case Constants.SHORTCUT_NAMES.PREVIOUS:
          this.moveHighlightBy_(0, -1);
          return true;
        case Constants.SHORTCUT_NAMES.NEXT:
          this.moveHighlightBy_(0, 1);
          return true;
        case Constants.SHORTCUT_NAMES.OUT:
          this.moveHighlightBy_(-1, 0);
          return true;
        case Constants.SHORTCUT_NAMES.IN:
          this.moveHighlightBy_(1, 0);
          return true;
        default:
          return false;
      }
    }
    return Blockly.FieldColour.superClass_.onShortcut.call(this, shortcut);
  }

  /**
   * Handles the given gamepad shortcut.
   * This is only triggered when gamepad accessibility mode is enabled.
   * @param {!GamepadShortcut} shortcut The shortcut to be handled.
   * @return {boolean} True if the field handled the shortcut,
   *     false otherwise.
   * @this {Blockly.FieldDropdown}
   * @protected
   */
  fieldDropdownHandler(shortcut) {
    if (this.menu_) {
      switch (shortcut.name) {
        case Constants.SHORTCUT_NAMES.PREVIOUS:
          this.menu_.highlightPrevious();
          return true;
        case Constants.SHORTCUT_NAMES.NEXT:
          this.menu_.highlightNext();
          return true;
        default:
          return false;
      }
    }
    return Blockly.FieldDropdown.superClass_.onShortcut.call(this, shortcut);
  }

  /**
   * Handles the given gamepad shortcut.
   * This is only triggered when gamepad accessibility mode is enabled.
   * @param {!GamepadShortcut} shortcut The shortcut to be handled.
   * @return {boolean} True if the toolbox handled the shortcut,
   *     false otherwise.
   * @this {Blockly.Toolbox}
   * @protected
   */
  toolboxHandler(shortcut) {
    if (!this.selectedItem_) {
      return false;
    }
    switch (shortcut.name) {
      case Constants.SHORTCUT_NAMES.PREVIOUS:
        return this.selectPrevious_();
      case Constants.SHORTCUT_NAMES.OUT:
        return this.selectParent_();
      case Constants.SHORTCUT_NAMES.NEXT:
        return this.selectNext_();
      case Constants.SHORTCUT_NAMES.IN:
        return this.selectChild_();
      default:
        return false;
    }
  }

  /**
   * Adds all necessary event listeners and markers to a workspace for gamepad
   * navigation to work. This must be called for gamepad navigation to work
   * on a workspace.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to add gamepad
   *     navigation to.
   * @public
   */
  addWorkspace(workspace) {
    this.navigation.addWorkspace(workspace);
    this.gamepadMonitor.addWorkspace(workspace);
  }

  /**
   * Removes all necessary event listeners and markers to a workspace for
   * gamepad navigation to work.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to remove gamepad
   *     navigation from.
   * @public
   */
  removeWorkspace(workspace) {
    this.navigation.removeWorkspace(workspace);
    this.gamepadMonitor.removeWorkspace(workspace);
  }

  /**
   * Turns on gamepad navigation.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to turn on gamepad
   *     navigation for.
   * @public
   */
  enable(workspace) {
    this.navigation.enableGamepadAccessibility(workspace);
  }

  /**
   * Turns off gamepad navigation.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to turn off gamepad
   *     navigation on.
   * @public
   */
  disable(workspace) {
    this.navigation.disableGamepadAccessibility(workspace);
  }

  /**
   * Gives the cursor to the field to handle if the cursor is on a field.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to check.
   * @param {!GamepadShortcut} shortcut The shortcut to give to the field.
   * @return {boolean} True if the shortcut was handled by the field, false
   *     otherwise.
   * @protected
   */
  fieldShortcutHandler(workspace, shortcut) {
    const cursor = workspace.getCursor();
    if (!cursor || !cursor.getCurNode()) {
      return;
    }
    const curNode = cursor.getCurNode();
    if (curNode.getType() === Blockly.ASTNode.types.FIELD) {
      return (/** @type {!Blockly.Field} */ (curNode.getLocation()))
          .onShortcut(shortcut);
    }
    return false;
  }

  /**
   * Gampead shortcut to go to the previous location when in gamepad
   * navigation mode.
   * @protected
   */
  registerPrevious() {
    /** @type {!GamepadShortcut} */
    const previousShortcut = {
      name: Constants.SHORTCUT_NAMES.PREVIOUS,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace, combination, shortcut) => {
        const flyout = workspace.getFlyout();
        const toolbox = workspace.getToolbox();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().prev();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.FLYOUT:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              flyout.getWorkspace().getCursor().prev();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.TOOLBOX:
            return toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(previousShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.PREVIOUS),
        previousShortcut.name);
  }

  /**
   * Gamepad shortcut to turn gamepad navigation on or off.
   * @protected
   */
  registerToggleGamepadNav() {
    /** @type {!GamepadShortcut} */
    const toggleGamepadNavShortcut = {
      name: Constants.SHORTCUT_NAMES.TOGGLE_GAMEPAD_NAV,
      callback: (workspace) => {
        if (this.accessibilityStatus.isGamepadAccessibilityEnabled(workspace)) {
          this.navigation.disableGamepadAccessibility(workspace);
        } else {
          this.navigation.enableGamepadAccessibility(workspace);
        }
        return true;
      },
    };

    this.gamepadShortcutRegistry.register(toggleGamepadNavShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.TOGGLE_GAMEPAD_NAV),
        toggleGamepadNavShortcut.name);
  }

  /**
   * Gamepad shortcut to go to the out location when in gamepad navigation
   * mode.
   * @protected
   */
  registerOut() {
    /** @type {!GamepadShortcut} */
    const outShortcut = {
      name: Constants.SHORTCUT_NAMES.OUT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace, combination, shortcut) => {
        const toolbox = workspace.getToolbox();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().out();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.FLYOUT:
            this.navigation.focusToolbox(workspace);
            return true;
          case Constants.STATE.TOOLBOX:
            return toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(outShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.OUT), outShortcut.name);
  }

  /**
   * Gamepad shortcut to go to the next location when in gamepad navigation
   * mode.
   * @protected
   */
  registerNext() {
    /** @type {!GamepadShortcut} */
    const nextShortcut = {
      name: Constants.SHORTCUT_NAMES.NEXT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace, combination, shortcut) => {
        const toolbox = workspace.getToolbox();
        const flyout = workspace.getFlyout();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().next();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.FLYOUT:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              flyout.getWorkspace().getCursor().next();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.TOOLBOX:
            return toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(nextShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.NEXT), nextShortcut.name);
  }

  /**
   * Gamepad shortcut to go to the in location when in gamepad navigation
   * mode.
   * @protected
   */
  registerIn() {
    /** @type {!GamepadShortcut} */
    const inShortcut = {
      name: Constants.SHORTCUT_NAMES.IN,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace, combination, shortcut) => {
        const toolbox = workspace.getToolbox();
        let isHandled = false;
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            isHandled = this.fieldShortcutHandler(workspace, shortcut);
            if (!isHandled) {
              workspace.getCursor().in();
              isHandled = true;
            }
            return isHandled;
          case Constants.STATE.TOOLBOX:
            isHandled = toolbox && typeof toolbox.onShortcut == 'function' ?
                toolbox.onShortcut(shortcut) :
                false;
            if (!isHandled) {
              this.navigation.focusFlyout(workspace);
            }
            return true;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(inShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.IN), inShortcut.name);
  }

  /**
   * Gamepad shortcut to connect a block to a marked location when in gamepad
   * navigation mode.
   * @protected
   */
  registerInsert() {
    /** @type {!GamepadShortcut} */
    const insertShortcut = {
      name: Constants.SHORTCUT_NAMES.INSERT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            return this.navigation.connectMarkerAndCursor(workspace);
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(insertShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.INSERT),
        insertShortcut.name);
  }

  /**
   * Gamepad shortcut to mark a location when in gamepad navigation mode.
   * @protected
   */
  registerMark() {
    /** @type {!GamepadShortcut} */
    const markShortcut = {
      name: Constants.SHORTCUT_NAMES.MARK,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            this.navigation.handleEnterForWS(workspace);
            return true;
          case Constants.STATE.FLYOUT:
            this.navigation.insertFromFlyout(workspace);
            return true;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(markShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.MARK), markShortcut.name);
  }

  /**
   * Gamepad shortcut to disconnect two blocks when in gamepad navigation
   * mode.
   * @protected
   */
  registerDisconnect() {
    /** @type {!GamepadShortcut} */
    const disconnectShortcut = {
      name: Constants.SHORTCUT_NAMES.DISCONNECT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly &&
            this.navigation.getState(workspace) === Constants.STATE.WORKSPACE;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            this.navigation.disconnectBlocks(workspace);
            return true;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(disconnectShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.DISCONNECT),
        disconnectShortcut.name);
  }

  /**
   * Gamepad shortcut to focus on the toolbox when in gamepad navigation
   * mode.
   * @protected
   */
  registerToolboxFocus() {
    /** @type {!GamepadShortcut} */
    const focusToolboxShortcut = {
      name: Constants.SHORTCUT_NAMES.TOOLBOX,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.WORKSPACE:
            if (!workspace.getToolbox()) {
              this.navigation.focusFlyout(workspace);
            } else {
              this.navigation.focusToolbox(workspace);
            }
            return true;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(focusToolboxShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.TOOLBOX),
        focusToolboxShortcut.name);
  }

  /**
   * Gamepad shortcut to exit the current location and focus on the workspace
   * when in gamepad navigation mode.
   * @protected
   */
  registerExit() {
    /** @type {!GamepadShortcut} */
    const exitShortcut = {
      name: Constants.SHORTCUT_NAMES.EXIT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace) => {
        switch (this.navigation.getState(workspace)) {
          case Constants.STATE.FLYOUT:
            this.navigation.focusWorkspace(workspace);
            return true;
          case Constants.STATE.TOOLBOX:
            this.navigation.focusWorkspace(workspace);
            return true;
          case Constants.STATE.HELP:
            this.helpPopup.hide();
            this.navigation.focusWorkspace(workspace);
            return true;
          default:
            return false;
        }
      },
    };

    this.gamepadShortcutRegistry.register(
        exitShortcut, /* optAllowOverrides= */ true);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.EXIT), exitShortcut.name,
        /* optAllowCollision= */ true);
  }

  /**
   * Gamepad shortcut to move the cursor on the workspace to the left when in
   * gamepad navigation mode.
   * @protected
   */
  registerWorkspaceMoveLeft() {
    /** @type {!GamepadShortcut} */
    const wsMoveLeftShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_LEFT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, -1, 0);
      },
    };

    this.gamepadShortcutRegistry.register(wsMoveLeftShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_LEFT),
        wsMoveLeftShortcut.name);
  }

  /**
   * Gamepad shortcut to move the cursor on the workspace to the right when in
   * gamepad navigation mode.
   * @protected
   */
  registerWorkspaceMoveRight() {
    /** @type {!GamepadShortcut} */
    const wsMoveRightShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_RIGHT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, 1, 0);
      },
    };

    this.gamepadShortcutRegistry.register(wsMoveRightShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_RIGHT),
        wsMoveRightShortcut.name);
  }

  /**
   * Gamepad shortcut to move the cursor on the workspace up when in gamepad
   * navigation mode.
   * @protected
   */
  registerWorkspaceMoveUp() {
    /** @type {!GamepadShortcut} */
    const wsMoveUpShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_UP,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, 0, -1);
      },
    };

    this.gamepadShortcutRegistry.register(wsMoveUpShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_UP),
        wsMoveUpShortcut.name);
  }

  /**
   * Gamepad shortcut to move the cursor on the workspace down when in
   * gamepad navigation mode.
   * @protected
   */
  registerWorkspaceMoveDown() {
    /** @type {!GamepadShortcut} */
    const wsMoveDownShortcut = {
      name: Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_DOWN,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly;
      },
      callback: (workspace) => {
        return this.navigation.moveWSCursor(workspace, 0, 1);
      },
    };

    this.gamepadShortcutRegistry.register(wsMoveDownShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_DOWN),
        wsMoveDownShortcut.name);
  }

  /**
   * Gamepad shortcut to scroll the entire workspace left.
   * @protected
   */
  registerWorkspaceScrollLeft() {
    /** @type {!GamepadShortcut} */
    const shortcut = {
      name: Constants.SHORTCUT_NAMES.SCROLL_WS_LEFT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace) => {
        return this.navigation.scrollWS(workspace, 1, 0);
      },
      delay: 0,
    };

    this.gamepadShortcutRegistry.register(shortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(shortcut.name),
        shortcut.name);
  }

  /**
   * Gamepad shortcut to scroll the entire workspace right.
   * @protected
   */
  registerWorkspaceScrollRight() {
    /** @type {!GamepadShortcut} */
    const shortcut = {
      name: Constants.SHORTCUT_NAMES.SCROLL_WS_RIGHT,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace) => {
        return this.navigation.scrollWS(workspace, -1, 0);
      },
      delay: 0,
    };

    this.gamepadShortcutRegistry.register(shortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(shortcut.name),
        shortcut.name);
  }

  /**
   * Gamepad shortcut to scroll the entire workspace up.
   * @protected
   */
  registerWorkspaceScrollUp() {
    /** @type {!GamepadShortcut} */
    const shortcut = {
      name: Constants.SHORTCUT_NAMES.SCROLL_WS_UP,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace) => {
        return this.navigation.scrollWS(workspace, 0, 1);
      },
      delay: 0,
    };

    this.gamepadShortcutRegistry.register(shortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(shortcut.name),
        shortcut.name);
  }

  /**
   * Gamepad shortcut to scroll the entire workspace down.
   * @protected
   */
  registerWorkspaceScrollDown() {
    /** @type {!GamepadShortcut} */
    const shortcut = {
      name: Constants.SHORTCUT_NAMES.SCROLL_WS_DOWN,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace) => {
        return this.navigation.scrollWS(workspace, 0, -1);
      },
      delay: 0,
    };

    this.gamepadShortcutRegistry.register(shortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(shortcut.name),
        shortcut.name);
  }

  /**
   * Gamepad shortcut to copy the block the cursor is currently on.
   * @protected
   */
  registerCopy() {
    /** @type {!GamepadShortcut} */
    const copyShortcut = {
      name: Constants.SHORTCUT_NAMES.COPY,
      preconditionFn: (workspace) => {
        if (this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly) {
          const curNode = workspace.getCursor().getCurNode();
          if (curNode && curNode.getSourceBlock()) {
            const sourceBlock = curNode.getSourceBlock();
            return !Blockly.Gesture.inProgress() && sourceBlock &&
                sourceBlock.isDeletable() && sourceBlock.isMovable();
          }
        }
        return false;
      },
      callback: (workspace) => {
        const sourceBlock = workspace.getCursor().getCurNode().getSourceBlock();
        Blockly.hideChaff();
        Blockly.copy(sourceBlock);
      },
    };

    this.gamepadShortcutRegistry.register(copyShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.COPY), copyShortcut.name);
  }

  /**
   * Register shortcut to paste the copied block to the marked location.
   * @protected
   */
  registerPaste() {
    /** @type {!GamepadShortcut} */
    const pasteShortcut = {
      name: Constants.SHORTCUT_NAMES.PASTE,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly && !Blockly.Gesture.inProgress();
      },
      callback: () => {
        return this.navigation.paste();
      },
    };

    this.gamepadShortcutRegistry.register(pasteShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.PASTE), pasteShortcut.name);
  }

  /**
   * Gamepad shortcut to copy and delete the block the cursor is on.
   * @protected
   */
  registerCut() {
    /** @type {!GamepadShortcut} */
    const cutShortcut = {
      name: Constants.SHORTCUT_NAMES.CUT,
      preconditionFn: (workspace) => {
        if (this.accessibilityStatus.isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly) {
          const curNode = workspace.getCursor().getCurNode();
          if (curNode && curNode.getSourceBlock()) {
            const sourceBlock = curNode.getSourceBlock();
            return !Blockly.Gesture.inProgress() && sourceBlock &&
                sourceBlock.isDeletable() && sourceBlock.isMovable() &&
                !sourceBlock.workspace.isFlyout;
          }
        }
        return false;
      },
      callback: (workspace) => {
        const sourceBlock = workspace.getCursor().getCurNode().getSourceBlock();
        Blockly.copy(sourceBlock);
        this.navigation.moveCursorOnBlockDelete(workspace, sourceBlock);
        Blockly.deleteBlock(sourceBlock);
        return true;
      },
    };

    this.gamepadShortcutRegistry.register(cutShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.CUT), cutShortcut.name);
  }

  /**
   * Registers shortcut to delete the block the cursor is on.
   * @protected
   */
  registerDelete() {
    /** @type {!GamepadShortcut} */
    const deleteShortcut = {
      name: Constants.SHORTCUT_NAMES.DELETE,
      preconditionFn: (workspace) => {
        if (this.accessibilityStatus.isGamepadAccessibilityEnabled(workspace) &&
            !workspace.options.readOnly) {
          const curNode = workspace.getCursor().getCurNode();
          if (curNode && curNode.getSourceBlock()) {
            const sourceBlock = curNode.getSourceBlock();
            return sourceBlock && sourceBlock.isDeletable();
          }
        }
        return false;
      },
      callback: (workspace) => {
        const sourceBlock = workspace.getCursor().getCurNode().getSourceBlock();
        // Don't delete while dragging.  Jeez.
        if (Blockly.Gesture.inProgress()) {
          return false;
        }
        this.navigation.moveCursorOnBlockDelete(workspace, sourceBlock);
        Blockly.deleteBlock(sourceBlock);
        return true;
      },
    };

    this.gamepadShortcutRegistry.register(deleteShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.DELETE),
        deleteShortcut.name);
  }

  /**
   * Registers shortcut to show help dialog.
   * @protected
   */
  registerOpenHelp() {
    /** @type {!GamepadShortcut} */
    const toggleHelpShortcut = {
      name: Constants.SHORTCUT_NAMES.OPEN_HELP,
      preconditionFn: (workspace) => {
        return this.accessibilityStatus
            .isGamepadAccessibilityEnabled(workspace);
      },
      callback: (workspace) => {
        this.helpPopup.show();
        this.navigation.setState(workspace, Constants.STATE.HELP);
        return true;
      },
    };

    this.gamepadShortcutRegistry.register(toggleHelpShortcut);
    this.gamepadShortcutRegistry.addCombinationMapping(
        this.controls.get(Constants.SHORTCUT_NAMES.TOGGLE_HELP),
        toggleHelpShortcut.name);
  }

  /**
   * Registers all default gamepad shortcut items for gamepad navigation. This
   * should be called once per instance of GamepadShortcutRegistry.
   * @protected
   */
  registerDefaults() {
    this.registerPrevious();
    this.registerNext();
    this.registerIn();
    this.registerOut();

    this.registerDisconnect();
    this.registerExit();
    this.registerInsert();
    this.registerMark();
    this.registerToolboxFocus();
    this.registerToggleGamepadNav();

    this.registerWorkspaceMoveDown();
    this.registerWorkspaceMoveLeft();
    this.registerWorkspaceMoveUp();
    this.registerWorkspaceMoveRight();

    this.registerWorkspaceScrollDown();
    this.registerWorkspaceScrollUp();
    this.registerWorkspaceScrollLeft();
    this.registerWorkspaceScrollRight();

    this.registerCopy();
    this.registerPaste();
    this.registerCut();
    this.registerDelete();

    this.registerOpenHelp();
  }

  /**
   * Removes all the gamepad navigation shortcuts.
   * @public
   */
  dispose() {
    const shortcutNames = Object.values(Constants.SHORTCUT_NAMES);
    for (const name of shortcutNames) {
      this.gamepadShortcutRegistry.unregister(name);
    }
    this.removeShortcutHandlers();
    this.navigation.dispose();
    this.gamepadMonitor.dispose();
    this.modalManager.dispose();
  }
}
