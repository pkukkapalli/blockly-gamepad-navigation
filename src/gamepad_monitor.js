/**
 * @fileoverview Everything needed to monitors the state of the gamepad.
 */

import Blockly from 'blockly';
import {
  GamepadAxisType,
  GAMEPAD_AXIS_TO_INDEX,
  GAMEPAD_BUTTON_TO_INDEX,
  GamepadCombination} from './gamepad';
import {GamepadShortcutRegistry} from './gamepad_shortcut_registry';

const DEFAULT_DELAY_BETWEEN_COMBINATIONS_MILLISECONDS = 200;
const DEFAULT_AXIS_ACTIVATION_THRESHOLD = 0.4;

/**
 * Monitors the connected gamepads, and listens for events.
 */
export class GamepadMonitor {
  /**
   * Constructs a gamepad monitor.
   * @param {GamepadShortcutRegistry=} optShortcutRegistry The shortcut
   *     registry to trigger when buttons or axes are activated.
   * @param {number=} optDelayBetweenCombinations The delay between when each
   *     button combination is handled in milliseconds.
   * @param {number=} optAxisActivationThreshold The degree, on a scale of 0.0
   *     to 1.0, of when an axis can be considered as activated.
   */
  constructor(optShortcutRegistry, optDelayBetweenCombinations,
      optAxisActivationThreshold) {
    /**
     * The shortcut registry that will be triggered when buttons or axes are
     * activated.
     * @type {!GamepadShortcutRegistry}
     * @private
     */
    this.registry_ = optShortcutRegistry || new GamepadShortcutRegistry();

    /**
     * The indexes of all currently connected gamepads.
     * @type {!Set<number>}
     * @private
     */
    this.connectedGamepadIndexes_ = new Set();

    /**
     * The delay between when each button combination is handled in
     * milliseconds.
     * @type {number}
     * @private
     */
    this.delayBetweenCombinations_ = optDelayBetweenCombinations ||
      DEFAULT_DELAY_BETWEEN_COMBINATIONS_MILLISECONDS;

    /**
     * The amount that an axis should be moved in either direction before it is
     * considered activated, on a scale of 0.0 to 1.0.
     * @type {number}
     * @private
     */
    this.axisActivationThreshold_ = optAxisActivationThreshold ||
      DEFAULT_AXIS_ACTIVATION_THRESHOLD;

    /**
     * The time since the last command was handled by the monitor. This is to
     * be used in conjunction with delayBetweenCombinations_ to ensure that
     * commands are not handled too frequently.
     * @type {number}
     * @private
     */
    this.timeSinceLastCommandHandled_ = Number.NEGATIVE_INFINITY;

    /**
     * The workspaces that we are monitoring input for.
     * @type {!Array<Blockly.WorkspaceSvg>}
     * @private
     */
    this.workspaces_ = [];

    /**
     * Handle a gamepadconnected event.
     * @type {function(GamepadEvent):void}
     * @private
     */
    this.gamepadConnectedHandler_ = this.handleGamepadConnected_.bind(this);

    /**
     * Handle a gamepaddisonnected event.
     * @type {function(GamepadEvent):void}
     * @private
     */
    this.gamepadDisconnectedHandler_ =
        this.handleGamepadDisconnected_.bind(this);

    /**
     * Whether this monitor has been disposed.
     * @type {boolean}
     * @private
     */
    this.disposed_ = false;
  }

  /**
   * Add necessary event listeners.
   * @public
   */
  init() {
    addEventListener('gamepadconnected', this.gamepadConnectedHandler_);
    addEventListener('gamepaddisconnected',
        this.gamepadDisconnectedHandler_);
    requestAnimationFrame(
        (timestamp) => this.handleAnimationFrame_(timestamp));
  }

  /**
   * Dispose all event listeners.
   * @public
   */
  dispose() {
    removeEventListener('gamepadconnected',
        this.gamepadConnectedHandler_);
    removeEventListener('gamepaddisconnected',
        this.gamepadDisconnectedHandler_);
    this.disposed_ = true;
  }

  /**
   * Handle a gamepadconnected event.
   * @param {GamepadEvent} event The event to handle.
   * @private
   */
  handleGamepadConnected_(event) {
    this.connectedGamepadIndexes_.add(event.gamepad.index);
  }

  /**
   * Handle a gamepaddisconnected event.
   * @param {GamepadEvent} event The event to handle.
   * @private
   */
  handleGamepadDisconnected_(event) {
    this.connectedGamepadIndexes_.delete(event.gamepad.index);
  }

  /**
   * Make sure that changes are sent to the given workspace.
   * @param {!Blockly.WorkspaceSvg} workspace A workspace to monitor input for.
   * @public
   */
  addWorkspace(workspace) {
    this.workspaces_.push(workspace);
  }

  /**
   * Removes the given workspace from any future updates.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to remove.
   * @public
   */
  removeWorkspace(workspace) {
    const workspaceIdx = this.workspaces_.indexOf(workspace);
    if (workspaceIdx > -1) {
      this.workspaces_.splice(workspaceIdx, 1);
    }
  }

  /**
   * Handle input from the gamepad during an animation frame.
   * TODO(pkukkapalli): change to wait for the button to be held a certain
   * amount of time, instead of delaying between inputs?
   * @param {number} timestamp The timestamp of this animation frame.
   * @private
   */
  handleAnimationFrame_(timestamp) {
    if (this.disposed_) {
      return;
    }

    if (this.connectedGamepadIndexes_.size === 0) {
      requestAnimationFrame(
          (timestamp) => this.handleAnimationFrame_(timestamp));
      return;
    }

    const elapsedTime =
        Math.floor(timestamp) - this.timeSinceLastCommandHandled_;
    if (elapsedTime <= DEFAULT_DELAY_BETWEEN_COMBINATIONS_MILLISECONDS) {
      requestAnimationFrame(
          (timestamp) => this.handleAnimationFrame_(timestamp));
      return;
    }

    let isHandled = false;
    const gamepads = navigator.getGamepads();
    for (const gamepadIndex of this.connectedGamepadIndexes_) {
      const gamepad = gamepads[gamepadIndex];
      const combination = this.currentCombination_(gamepad);
      for (const workspace of this.workspaces_) {
        isHandled = this.registry_.onActivate(workspace, combination) ||
            isHandled;
      }
    }

    if (isHandled) {
      this.timeSinceLastCommandHandled_ = Math.floor(timestamp);
    }

    requestAnimationFrame(
        (timestamp) => this.handleAnimationFrame_(timestamp));
  }

  /**
   * Get the current combination entered on the given gamepad, if there is any.
   * @param {Gamepad} gamepad The gamepad to examine.
   * @return {GamepadCombination} The combination currently entered by the
   *     gamepad.
   * @private
   */
  currentCombination_(gamepad) {
    const combination = new GamepadCombination();

    for (const [gamepadButton, index] of GAMEPAD_BUTTON_TO_INDEX.entries()) {
      if (gamepad.buttons[index].pressed) {
        combination.addButton(gamepadButton);
      }
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.LEFT_HORIZONTAL_LEFT) <
        -this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.LEFT_HORIZONTAL_LEFT);
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.LEFT_HORIZONTAL_RIGHT) >
        this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.LEFT_HORIZONTAL_RIGHT);
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.LEFT_VERTICAL_UP) <
        -this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.LEFT_VERTICAL_UP);
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.LEFT_VERTICAL_DOWN) >
        this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.LEFT_VERTICAL_DOWN);
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.RIGHT_HORIZONTAL_LEFT) <
        -this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.RIGHT_HORIZONTAL_LEFT);
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.RIGHT_HORIZONTAL_RIGHT) >
        this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.RIGHT_HORIZONTAL_RIGHT);
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.RIGHT_VERTICAL_UP) <
        -this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.RIGHT_VERTICAL_UP);
    }

    if (this.getAxisValue_(gamepad, GamepadAxisType.RIGHT_VERTICAL_DOWN) >
        this.axisActivationThreshold_) {
      combination.addAxis(GamepadAxisType.RIGHT_VERTICAL_DOWN);
    }

    return combination;
  }

  /**
   * Get the value of the given axis.
   * @param {Gamepad} gamepad The gamepad to examine.
   * @param {GamepadAxisType} gamepadAxis The axis to check for.
   * @return {number} The value of the axis on a scale of -1 to 1.
   * @private
   */
  getAxisValue_(gamepad, gamepadAxis) {
    return gamepad.axes[GAMEPAD_AXIS_TO_INDEX.get(gamepadAxis)];
  }
}
