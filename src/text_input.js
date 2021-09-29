/**
 * @fileoverview Contains all the logic to capture text input via gamepad.
 */

import {DIRECTION} from './constants';
import {ModalManager} from './modal';

/**
 * The ID of the element that contains all of the keyboard markup.
 * @type {string}
 */
const TOP_LEVEL_ELEMENT_ID = 'keyboard';
const LEFT_PARTITION_ELEMENT_ID = 'keyboard-partition-left';
const RIGHT_PARTITION_ELEMENT_ID = 'keyboard-partition-right';
const KEYBOARD_KEY_CLASS = 'keyboard-key';
const TEXT_PREVIEW_ELEMENT_ID = 'keyboard-text-preview';

const KEY_SIZE = 40;
const MARGIN = KEY_SIZE;

const CURSOR_TRANSFORMS = new Map([
  [DIRECTION.LEFT, ([row, column]) => [row, column - 1]],
  [DIRECTION.RIGHT, ([row, column]) => [row, column + 1]],
  [DIRECTION.UP, ([row, column]) => [row - 1, column]],
  [DIRECTION.DOWN, ([row, column]) => [row + 1, column]],
]);

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

    /**
     * The location of the left cursor.
     * @type {number[]}
     * @private
     */
    this.leftCursor_ = [0, 0];

    /**
     * The location of the right cursor.
     * @type {number[]}
     * @private
     */
    this.rightCursor_ = [0, 0];
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
    this.updateViewForLeftCursor_();
    this.updateViewForRightCursor_();
    this.updateViewForValue_();
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
    this.updateViewForValue_();
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
    this.textInputCompleteCallback_(this.value_);
    this.textInputCompleteCallback_ = undefined;
  }

  /**
   * Moves the left keyboard cursor in the given direction.
   * @param {DIRECTION} direction The direction to move the cursor.
   */
  moveLeftCursor(direction) {
    const transformed = this.clampCursor_(this.leftLayout_,
        CURSOR_TRANSFORMS.get(direction)(this.leftCursor_));
    this.leftCursor_ = transformed;
    this.updateViewForLeftCursor_();
  }

  /**
   * Moves the right keyboard cursor in the given direction.
   * @param {DIRECTION} direction The direction to move the cursor.
   */
  moveRightCursor(direction) {
    const transformed = this.clampCursor_(this.rightLayout_,
        CURSOR_TRANSFORMS.get(direction)(this.rightCursor_));
    this.rightCursor_ = transformed;
    this.updateViewForRightCursor_();
  }

  /**
   * Clamp the given cursor to the bounds of the given layout.
   * @param {Array<Array<string>>} layout The layout where the cursor lives.
   * @param {number[]} cursor The cursor to check.
   * @return {number[]} A cursor adjusted to the bounds of layout.
   * @private
   */
  clampCursor_(layout, [row, column]) {
    let finalRow = Math.max(0, row);
    finalRow = Math.min(finalRow, layout.length - 1);

    let finalColumn = Math.max(0, column);
    finalColumn = Math.min(finalColumn, layout[finalRow].length - 1);

    return [finalRow, finalColumn];
  }

  /**
   * Update the key elements to reflect the location of the left cursor.
   * @private
   */
  updateViewForLeftCursor_() {
    const keyboardKeyElements = document.querySelectorAll(
        `#${LEFT_PARTITION_ELEMENT_ID} .${KEYBOARD_KEY_CLASS}`);
    for (const element of keyboardKeyElements) {
      const [row, column] = this.leftCursor_;
      if (parseInt(element.dataset.row) === row &&
          parseInt(element.dataset.column) === column) {
        element.style.backgroundColor = 'white';
        element.style.color = 'black';
      } else {
        element.style.backgroundColor = 'transparent';
        element.style.color = 'white';
      }
    }
  }

  /**
   * Update the key elements to reflect the location of the right cursor.
   * @private
   */
  updateViewForRightCursor_() {
    const keyboardKeyElements = document.querySelectorAll(
        `#${RIGHT_PARTITION_ELEMENT_ID} .${KEYBOARD_KEY_CLASS}`);
    for (const element of keyboardKeyElements) {
      const [row, column] = this.rightCursor_;
      if (parseInt(element.dataset.row) === row &&
          parseInt(element.dataset.column) === column) {
        element.style.backgroundColor = 'white';
        element.style.color = 'black';
      } else {
        element.style.backgroundColor = 'transparent';
        element.style.color = 'white';
      }
    }
  }

  /**
   * Add the character being highlighted by the left cursor.
   * @public
   */
  selectElementOnLeftCursor() {
    const [row, column] = this.leftCursor_;
    this.value_ += this.leftLayout_[row][column];
    this.updateViewForValue_();
  }

  /**
   * Add the character being highlighted by the right cursor.
   * @public
   */
  selectElementOnRightCursor() {
    const [row, column] = this.rightCursor_;
    this.value_ += this.rightLayout_[row][column];
    this.updateViewForValue_();
  }

  /**
   * Updates the value of the text preview.
   * @private
   */
  updateViewForValue_() {
    const textPreview = document.getElementById(TEXT_PREVIEW_ELEMENT_ID);
    textPreview.innerText = this.value_;
  }

  /**
   * Creates an HTML string that contains the markup for the virtual keyboard.
   * @private
   */
  renderModal_() {
    const textPreview = document.createElement('h2');
    textPreview.id = TEXT_PREVIEW_ELEMENT_ID;
    textPreview.innerText = this.value_;

    const keyboardContainer = document.createElement('div');
    const leftPartition = document.createElement('div');
    leftPartition.id = LEFT_PARTITION_ELEMENT_ID;
    const rightPartition = document.createElement('div');
    rightPartition.id = RIGHT_PARTITION_ELEMENT_ID;

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
    for (const [rowIndex, row] of layout.entries()) {
      const rowElement = document.createElement('div');
      rowElement.style.display = 'flex';
      for (const [columnIndex, key] of row.entries()) {
        const keyElement = document.createElement('div');
        keyElement.classList.add(KEYBOARD_KEY_CLASS);
        keyElement.dataset.row = rowIndex;
        keyElement.dataset.column = columnIndex;
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
