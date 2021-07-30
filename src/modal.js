/**
 * @fileoverview Contains all of the logic for opening and managing modals.
 */

import * as Constants from './constants';

/**
 * Manages the modals that can be shown by the plugin.
 */
export class ModalManager {
  /**
   * Create a modal manager. It is not yet initialized with an element to hold
   * the modals though.
   * @param {string=} optModalContainerElementId The ID of the element to host
   *     all modals on.
   */
  constructor(optModalContainerElementId) {
    /**
     * The element that will contain all modals.
     * @type {string}
     * @private
     */
    this.modalContainerElementId_ = optModalContainerElementId ||
        'modal-container';

    /**
     * The IDs of the modal elements currently being managed.
     * @type {Set<string>}
     * @private
     */
    this.modalElementIds_ = new Set();

    /**
     * Currently open modal ID.
     * @type {string|undefined}
     * @private
     */
    this.currentlyOpenModalId_ = undefined;

    /**
     * The callback that handles all logging messages.
     * @type {function(Constants.LOGGING_MSG_TYPE, *):void}
     * @private
     */
    this.loggingCallback_ = this.log_.bind(this);
  }

  /**
   * Initialize the modal manager with the given modal container ID.
   */
  init() {
    const modalContainer = document.getElementById(
        this.modalContainerElementId_);
    modalContainer.style.zIndex = 1000;
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = 0;
    modalContainer.style.left = 0;
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.display = 'none';
  }

  /**
   * Dispose of all modals.
   */
  dispose() {
    const modalContainer = document.getElementById(
        this.modalContainerElementId_);
    modalContainer.innerHTML = '';
  }

  /**
   * Append a modal element.
   * @param {HTMLElement} modal The modal element to add. Hidden by default. It
   *     must have an ID set.
   */
  addModal(modal) {
    if (!modal.id) {
      this.loggingCallback_(Constants.LOGGING_MSG_TYPE.ERROR,
          'All modals must have an ID.');
      return;
    }

    if (!this.modalContainerElementId_) {
      this.loggingCallback_(Constants.LOGGING_MSG_TYPE.ERROR,
          'The ModalManager has not been initialized.');
      return;
    }

    const container = document.getElementById(this.modalContainerElementId_);
    container.appendChild(modal);
    this.modalElementIds_.add(modal.id);

    // Hide the element.
    modal.style.display = 'none';
  }

  /**
   * Show the modal with the given ID.
   * @param {string} id The ID of the modal to show.
   */
  showModal(id) {
    if (!this.modalElementIds_.has(id)) {
      this.loggingCallback_(Constants.LOGGING_MSG_TYPE.ERROR,
          `Modal with ID ${id} is not managed by us.`);
      return;
    }

    if (this.currentlyOpenModalId_) {
      const modal = document.getElementById(this.currentlyOpenModalId_);
      modal.style.display = 'none';
    }

    const modalContainer = document.getElementById(
        this.modalContainerElementId_);
    const modal = document.getElementById(id);
    modalContainer.style.display = 'block';
    modal.style.display = 'block';
    this.currentlyOpenModalId_ = id;
  }

  /**
   * Hide the currently open modal if there is one.
   * @param {string} id The ID of the modal to hide.
   */
  hideModal(id) {
    if (id !== this.currentlyOpenModalId_) {
      this.loggingCallback_(Constants.LOGGING_MSG_TYPE.WARN,
          `Modal with ID ${id} is not currently open.`);
      return;
    }

    const modal = document.getElementById(id);
    modal.style.display = 'none';
    const modalContainer = document.getElementById(
        this.modalContainerElementId_);
    modalContainer.style.display = 'none';
  }

  /**
   * Default logging callback, can be overriden by setting loggingCallback.
   * @param {Constants.LOGGING_MSG_TYPE} level The desisred log level.
   * @param {*} msg The message to log.
   */
  log_(level, msg) {
    switch (level) {
      case Constants.LOGGING_MSG_TYPE.LOG:
        console.log(msg);
        break;
      case Constants.LOGGING_MSG_TYPE.WARN:
        console.warn(msg);
        break;
      case Constants.LOGGING_MSG_TYPE.ERROR:
        console.error(msg);
        break;
    }
  }

  /**
   * Set the logging callback.
   * @param {function(Constants.LOGGING_MSG_TYPE, *):void} callback The
   *     callback to use.
   */
  setLoggingCallback(callback) {
    this.loggingCallback_ = callback;
  }

  /**
   * Resets the logging callback back to the result.
   */
  resetLoggingCallback() {
    this.loggingCallback_ = this.log_.bind(this);
  }
}
