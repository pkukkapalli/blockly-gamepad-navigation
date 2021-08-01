/**
 * @fileoverview Contains all the logic to render and open the help screen in a
 * modal.
 */

import * as Constants from './constants';
import {GamepadCombination} from './gamepad';
import {ModalManager} from './modal';

/**
 * A popup that display help text for the plugin.
 */
export class HelpPopup {
  /**
   * Create a popup with the default key mappings.
   */
  constructor() {
    /**
     * The modal manager that hosts this popup.
     * @type {?ModalManager}
     * @private
     */
    this.modalManager_ = undefined;

    /**
     * The control configuration for each action.
     * @type {?Map<Constants.SHORTCUT_NAMES, GamepadCombination>}
     * @private
     */
    this.controls_ = undefined;

    /**
     * The ID of the modal element used to render this popup.
     * @type {?string}
     * @private
     */
    this.modalId_ = undefined;

    /**
     * Whether or not the help popup is visible.
     * @type {boolean}
     * @private
     */
    this.isVisible_ = false;
  }

  /**
   * Initialize the help popup with the controls to show.
   * @param {!ModalManager} modalManager The modal manager to add this popup to.
   * @param {Map<Constants.SHORTCUT_NAMES, GamepadCombination>} controls The
   *     controls to render.
   */
  init(modalManager, controls) {
    this.controls_ = controls;
    this.modalManager_ = modalManager;
    const modalElement = document.createElement('div');
    this.modalId_ = 'help-popup';
    modalElement.id = this.modalId_;
    modalElement.innerHTML = this.renderModal_();
    modalElement.style.color = 'white';
    modalElement.style.padding = '12px';
    modalManager.addModal(modalElement);
  }

  /**
   * Makes the help popup visible if it is not already.
   */
  show() {
    if (this.isVisible_) {
      return;
    }

    this.modalManager_.showModal(this.modalId_);
    this.isVisible_ = true;
  }

  /**
   * Hides the help popup if it is visible.
   */
  hide() {
    if (!this.isVisible_) {
      return;
    }

    this.modalManager_.hideModal(this.modalId_);
    this.isVisible_ = false;
  }

  /**
   * Creates an HTML string that contains all of the instructions.
   * @return {string} The HTML for the modal.
   * @private
   */
  renderModal_() {
    return `
      <h1>Navigation</h1>
      <ul>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.PREVIOUS)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.NEXT)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.IN)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.OUT)}</li>
      </ul>

      <h1>Block manipulation</h1>
      <ul>
        <li>
          ${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.DISCONNECT)}
        </li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.INSERT)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.MARK)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.COPY)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.PASTE)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.CUT)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.DELETE)}</li>
      </ul>

      <h1>Workspace movement</h1>
      <ul>
        <li>
          ${this.helpTextForShortcut_(
      Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_LEFT)}
        </li>
        <li>
          ${this.helpTextForShortcut_(
      Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_RIGHT)}
        </li>
        <li>
          ${this.helpTextForShortcut_(
      Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_UP)}
        </li>
        <li>
          ${this.helpTextForShortcut_(
      Constants.SHORTCUT_NAMES.MOVE_WS_CURSOR_DOWN)}
        </li>
        <li>
          ${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.SCROLL_WS_LEFT)}
        </li>
        <li>
          ${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.SCROLL_WS_RIGHT)}
        </li>
        <li>
          ${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.SCROLL_WS_UP)}
        </li>
        <li>
          ${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.SCROLL_WS_DOWN)}
        </li>
      </ul>

      <h1>Other</h1>
      <ul>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.TOOLBOX)}</li>
        <li>${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.EXIT)}</li>
        <li>
          ${this.helpTextForShortcut_(
      Constants.SHORTCUT_NAMES.TOGGLE_GAMEPAD_NAV)}
        </li>
        <li>
          ${this.helpTextForShortcut_(Constants.SHORTCUT_NAMES.TOGGLE_HELP)}
        </li>
      </ul>
    `;
  }

  /**
   * Renders the help text for activating the given shortcut.
   * @param {Constants.SHORTCUT_NAMES} shortcutName The name of the shortcut to
   *     render help text for.
   * @return {string} The help text.
   * @private
   */
  helpTextForShortcut_(shortcutName) {
    const shortcutDisplayName =
        Constants.SHORTCUT_DISPLAY_NAMES.get(shortcutName);
    const combinationText = this.controls_.get(shortcutName).displayText();
    return `<b>${shortcutDisplayName}:</b> ${combinationText}`;
  }
}
