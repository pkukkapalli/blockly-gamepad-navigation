/**
 * @fileoverview Holds all of the shortcuts for gamepad accessibility.
 */

import * as Blockly from 'blockly/core';
import cloneDeep from 'lodash.clonedeep';
import {GamepadCombination} from './gamepad';

/**
 * Class for the registry of gamepad shortcuts. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from gamepadShortcutRegistry.
 */
export class GamepadShortcutRegistry {
  /**
   * Constructs a shortcut registry.
   */
  constructor() {
    /**
     * Registry of all gamepad shortcuts, keyed by name of shortcut.
     * @type {!Map<string, GamepadShortcut>}
     * @private
     */
    this.registry_ = new Map();

    /**
     * Map of button combinations to a set of shortcut names.
     * @type {!Map<string, Set<string>>}
     * @private
     */
    this.combinationMap_ = new Map();
  }

  /**
   * Registers a gamepad shortcut.
   * @param {!GamepadShortcut} shortcut The shortcut
   *     for this button code.
   * @param {boolean=} optAllowOverrides True to prevent a warning when
   *     overriding an already registered item.
   * @throws {Error} If a shortcut with the same name already exists.
   * @public
   */
  register(shortcut, optAllowOverrides) {
    if (this.registry_.has(shortcut.name) && !optAllowOverrides) {
      throw new Error(`Shortcut with name ${shortcut.name} already exists.`);
    }
    this.registry_.set(shortcut.name, shortcut);
  }

  /**
   * Unregisters a gamepad shortcut registered with the given button code. This
   * will also remove any button mappings that reference this shortcut.
   * @param {string} shortcutName The name of the shortcut to unregister.
   * @return {boolean} True if an item was unregistered, false otherwise.
   * @public
   */
  unregister(shortcutName) {
    if (!this.registry_.has(shortcutName)) {
      console.warn(`Gamepad shortcut with name ${shortcutName} not found.`);
      return false;
    }

    this.removeAllCombinationMappings(shortcutName);

    this.registry_.delete(shortcutName);
    return true;
  }

  /**
   * Adds a mapping between a button combination and a shortcut.
   * @param {!GamepadCombination} combination The gamepad combination for the
   *     shortcut.
   * @param {string} shortcutName The name of the shortcut to execute when the
   *     given combination is activated.
   * @param {boolean=} optAllowCollision True to prevent an error when adding a
   *     shortcut to a combination that is already mapped to a shortcut.
   * @throws {Error} If the given combination is already mapped a shortcut.
   * @public
   */
  addCombinationMapping(combination, shortcutName, optAllowCollision) {
    const serializedCombination = combination.serialize();
    if (this.combinationMap_.has(serializedCombination) && !optAllowCollision) {
      throw new Error(
          `Shortcut with name ${shortcutName} collides with shortcuts 
          ${Array.from(this.combinationMap_.get(serializedCombination))} for
          combination ${combination.serialize()}`);
    } else if (this.combinationMap_.has(serializedCombination) &&
               optAllowCollision) {
      this.combinationMap_.get(serializedCombination).add(shortcutName);
    } else {
      this.combinationMap_.set(serializedCombination, new Set([shortcutName]));
    }
  }

  /**
   * Removes a mapping between a button combination and a shortcut.
   * @param {!GamepadCombination} combination The gamepad combination for the
   *     shortcut.
   * @param {string} shortcutName The name of the shortcut to execute when the
   *     given combination is activated.
   * @param {boolean=} optQuiet True to not console warn when there is no
   *     shortcut to remove.
   * @return {boolean} True if a mapping was removed, false otherwise.
   * @public
   */
  removeCombinationMapping(combination, shortcutName, optQuiet) {
    const serializedCombination = combination.serialize();
    if (!this.combinationMap_.has(serializedCombination)) {
      if (!optQuiet) {
        console.warn(
            `No gamepad shortcut with name ${shortcutName}
            registered with combination ${serializedCombination}`);
      }
      return false;
    }

    const shortcutNames = this.combinationMap_.get(serializedCombination);
    if (shortcutNames.size === 0) {
      this.combinationMap_.delete(serializedCombination);
      if (!optQuiet) {
        console.warn(
            `No gamepad shortcut with name ${shortcutName}
            registered with combination ${serializedCombination}`);
      }
      return false;
    }

    if (!shortcutNames.has(serializedCombination)) {
      if (!optQuiet) {
        console.warn(
            `No gamepad shortcut with name ${shortcutName}
            registered with combination ${serializedCombination}`);
      }
      return false;
    }

    shortcutNames.delete(shortcutName);
    if (shortcutNames.size === 0) {
      this.combinationMap_.delete(serializedCombination);
    }
    return true;
  }

  /**
   * Removes all the combination mappings for a shortcut with the given name.
   * Useful when changing the default mappings and the combinations registered
   * to the shortcut are unknown.
   * @param {string} shortcutName The name of the shortcut to remove from the
   *     map.
   * @public
   */
  removeAllCombinationMappings(shortcutName) {
    for (const serializedCombination of this.combinationMap_.keys()) {
      this.removeCombinationMapping(
          GamepadCombination.deserialize(serializedCombination),
          shortcutName, /* optQuiet= */ true);
    }
  }

  /**
   * Sets the combination map. Setting the combination map will override any
   * default combination mappings.
   * @param {!Map<string, Set<string>>} combinationMap The map with combination
   *     to shortcut names.
   * @public
   */
  setCombinationMap(combinationMap) {
    this.combinationMap_ = combinationMap;
  }

  /**
   * Gets the current combination map.
   * @return {!Map<string, Set<string>>} The map holding combinations to
   *     shortcut names.
   */
  getCombinationMap() {
    return cloneDeep(this.combinationMap_);
  }

  /**
   * Gets the registry of gamepad shortcuts.
   * @return {!Map<string, !GamepadShortcut>} The
   *     registry of gamepad shortcuts.
   * @public
   */
  getRegistry() {
    return cloneDeep(this.registry_);
  }

  /**
   * Handles gamepad buttons and axes being activated.
   * @param {!Blockly.Workspace} workspace The active workspace to apply the
   *     operation to.
   * @param {!GamepadCombination} combination The combination pressed.
   * @return {boolean} True if the combination was handled, false otherwise.
   * @public
   */
  onActivate(workspace, combination) {
    if (combination.isEmpty()) {
      return false;
    }

    const shortcutNames = this.getShortcutNamesByCombination(combination);
    for (const shortcutName of shortcutNames) {
      if (!this.registry_.has(shortcutName)) {
        console.warn(`Invalid shortcut name used ${shortcutName}.`);
        continue;
      }

      const shortcut = this.registry_.get(shortcutName);
      if (shortcut.preconditionFn && !shortcut.preconditionFn(workspace)) {
        continue;
      }
      // If the combination has been handled, stop processing shortcuts.
      if (shortcut.callback &&
        shortcut.callback(workspace, combination, shortcut)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the shortcuts registered to the given combination.
   * @param {!GamepadCombination} combination The combination to look up.
   * @return {!Array<string>} The set of shortcuts to call when the given
   *     combination is used.
   * @public
   */
  getShortcutNamesByCombination(combination) {
    if (!this.combinationMap_.has(combination.serialize())) {
      return [];
    }
    return Array.from(this.combinationMap_.get(combination.serialize()));
  }

  /**
   * Gets the combinations that the shortcut with the given name is registered
   * under.
   * @param {string} shortcutName The name of the shortcut.
   * @return {!Array<string>} A set of all the combinations the shortcut is
   *     registered under.
   */
  getCombinationsByShortcutName(shortcutName) {
    const combinations = [];
    for (const [serializedCombination, shortcutNames] of
      this.combinationMap_.entries()) {
      const combination = GamepadCombination.deserialize(serializedCombination);
      if (shortcutNames.has(shortcutName)) {
        combinations.push(combination);
      }
    }
    return combinations;
  }
}

/**
 * A gamepad shortcut.
 * @typedef {{
 *    callback: ((function(!Blockly.Workspace, GamepadCombination,
 * GamepadShortcut):boolean)|undefined),
 *    name: string,
 *    preconditionFn: ((function(!Blockly.Workspace):boolean)|undefined),
 *    metadata: (Object|undefined)
 * }}
 */
export const GamepadShortcut = {};
