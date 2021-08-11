/**
 * @fileoverview Contains all the logic to capture text input via gamepad.
 */

import {ModalManager} from './modal';

/**
 * The ID of the element that contains all of the keyboard markup.
 * @type {string}
 */
const TOP_LEVEL_ELEMENT_ID = 'keyboard';

const KEY_SIZE = 40;
const MARGIN = KEY_SIZE;

/**
 * A popup with a virtual keyboard.
 */
export class TextInputPopup {
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
     * The ID of the modal element used to render this popup.
     * @type {?string}
     * @private
     */
    this.modalId_ = undefined;

    /**
     * Whether or not the popup is visible.
     * @type {boolean}
     * @private
     */
    this.isVisible_ = false;

    /**
     * Invoked when the text input is closed.
     * @type {?function(string):void}
     * @private
     */
    this.textInputCompleteCallback_ = undefined;

    /**
     * Layout of the left partition.
     * @type {string[][]}
     * @private
     */
    this.leftLayout_ = [
      ['q', 'w', 'e', 'r', 't'],
      ['a', 's', 'd', 'f', 'g'],
      ['z', 'x', 'c', 'v'],
    ];

    /**
     * Layout of the right partition.
     * @type {string[][]}
     * @private
     */
    this.rightLayout_ = [
      ['y', 'u', 'i', 'o', 'p'],
      ['h', 'j', 'k', 'l'],
      ['b', 'n', 'm'],
    ];

    /**
     * The current text value.
     * @type {string}
     * @private
     */
    this.value_ = '';

    /**
     * The element that displays the text preview.
     * @type {Text|undefined}
     * @private
     */
    this.textPreviewElement_ = undefined;
  }

  /**
   * Initialize the popup.
   * @param {!ModalManager} modalManager The modal manager to add this popup to.
   */
  init(modalManager) {
    this.modalManager_ = modalManager;
    const modalElement = document.createElement('div');
    this.modalId_ = TOP_LEVEL_ELEMENT_ID;
    modalElement.id = this.modalId_;
    modalElement.style.color = 'white';
    modalElement.style.padding = '12px';
    modalManager.addModal(modalElement);
    this.renderModal_();
  }

  /**
   * Makes the help popup visible if it is not already.
   * @param {string} value The initial value of the text input field.
   * @param {function(string):void} callback Invoked once editing is complete.
   */
  show(value, callback) {
    if (this.isVisible_) {
      return;
    }

    this.value_ = value;
    this.modalManager_.showModal(this.modalId_);
    this.isVisible_ = true;
    this.textInputCompleteCallback_ = callback;
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
    this.textInputCompleteCallback_('blah');
    this.textInputCompleteCallback_ = undefined;
  }

  /**
   * Creates an HTML string that contains the markup for the virtual keyboard.
   * @private
   */
  renderModal_() {
    const textPreview = document.createElement('h2');
    textPreview.innerText = this.value_;

    const keyboardContainer = document.createElement('div');
    const leftPartition = document.createElement('div');
    const rightPartition = document.createElement('div');

    keyboardContainer.style.display = 'flex';
    keyboardContainer.appendChild(leftPartition);
    keyboardContainer.appendChild(rightPartition);
    rightPartition.style.marginLeft = `${MARGIN}px`;

    this.renderKeyboardPartition_(leftPartition, this.leftLayout_);
    this.renderKeyboardPartition_(rightPartition, this.rightLayout_);

    const topLevelElement = document.getElementById(TOP_LEVEL_ELEMENT_ID);
    topLevelElement.appendChild(textPreview);
    topLevelElement.appendChild(keyboardContainer);
  }

  /**
   * Render a partition of the keyboard.
   * @param {HTMLElement} container The element to add all the keys to.
   * @param {Array<Array<string>>} layout An array of rows of keys to render.
   */
  renderKeyboardPartition_(container, layout) {
    for (const row of layout) {
      const rowElement = document.createElement('div');
      rowElement.style.display = 'flex';
      for (const key of row) {
        const keyElement = document.createElement('div');
        keyElement.innerText = key;
        keyElement.style.width = `${KEY_SIZE}px`;
        keyElement.style.height = `${KEY_SIZE}px`;
        keyElement.style.textAlign = 'center';
        keyElement.style.verticalAlign = 'middle';
        keyElement.style.border = '1px solid white';
        keyElement.style.fontSize = `${Math.floor(KEY_SIZE * 0.8)}px`;
        rowElement.appendChild(keyElement);
      }
      container.appendChild(rowElement);
    }
  }
}
