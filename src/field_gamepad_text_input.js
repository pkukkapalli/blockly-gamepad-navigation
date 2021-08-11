import * as Blockly from 'blockly/core';
import {TextInputPopup} from './text_input';
import {Navigation} from './navigation';
import * as Constants from './constants';

/**
 * Creates a custom field for entering text using the gamepad.
 * @param {!Navigation} navigation The navigation class that manages the state.
 * @param {!TextInputPopup} textInputPopup The popup to show.
 * @return {Blockly.FieldTextInput} A class that overrides showEditor_.
 */
export function gamepadFieldTextInputFactory(navigation, textInputPopup) {
  return class GamepadTextInput extends Blockly.FieldTextInput {
    /**
     * Constructor.
     * @param {string=} optValue The initial value.
     * @param {?Function=} optValidator Validator.
     * @param {Object=} optConfig Config.
     */
    constructor(optValue, optValidator, optConfig) {
      super(optValue, optValidator, optConfig);
    }

    /**
     * Construct from JSON.
     * @param {!Object} options A JSON object with options (text, and
     *     spellcheck).
     * @return {!Blockly.FieldTextInput} The new field instance.
     */
    static fromJson(options) {
      const text = Blockly.utils.replaceMessageReferences(options['text']);
      return new GamepadTextInput(text, undefined, options);
    }

    /**
     * Overriden version that just opens the given popup.
     * @inherit
     */
    showEditor() {
      this.workspace_ =
        (/** @type {!Blockly.BlockSvg} */ (this.sourceBlock_)).workspace;
      navigation.setState(this.workspace_, Constants.STATE.TEXT_INPUT);
      textInputPopup.show(this.value_, (function(text) {
        this.setValue(text);
      }).bind(this));
    }
  };
}
