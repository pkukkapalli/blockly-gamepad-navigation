/**
 * @fileoverview All of the types necessary to work with gamepads.
 */

/**
 * The buttons available on a universal gamepad.
 * @enum {string}
 */
export const GamepadButtonType = {
  CROSS: 'cross',
  CIRCLE: 'circle',
  SQUARE: 'square',
  TRIANGLE: 'triangle',
  L1: 'l1',
  R1: 'r1',
  L2: 'l2',
  R2: 'r2',
  SELECT: 'select',
  START: 'start',
  LEFT_STICK: 'left_stick',
  RIGHT_STICK: 'right_stick',
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

/**
 * All possible buttons.
 * @type {!Set<GamepadButtonType>}
 */
export const ALL_BUTTONS = new Set(Object.values(GamepadButtonType));

/**
 * @type {Map<GamepadButtonType, number>}
 */
export const GAMEPAD_BUTTON_TO_INDEX = new Map([
  [GamepadButtonType.CROSS, 0],
  [GamepadButtonType.CIRCLE, 1],
  [GamepadButtonType.SQUARE, 2],
  [GamepadButtonType.TRIANGLE, 3],
  [GamepadButtonType.L1, 4],
  [GamepadButtonType.R1, 5],
  [GamepadButtonType.L2, 6],
  [GamepadButtonType.R2, 7],
  [GamepadButtonType.SELECT, 8],
  [GamepadButtonType.START, 9],
  [GamepadButtonType.LEFT_STICK, 10],
  [GamepadButtonType.RIGHT_STICK, 11],
  [GamepadButtonType.UP, 12],
  [GamepadButtonType.DOWN, 13],
  [GamepadButtonType.LEFT, 14],
  [GamepadButtonType.RIGHT, 15],
]);

/**
 * The axes available on a universal gamepad.
 * @enum {string}
 */
export const GamepadAxisType = {
  LEFT_HORIZONTAL_LEFT: 'left_horizontal_left',
  LEFT_HORIZONTAL_RIGHT: 'left_horizontal_right',
  LEFT_VERTICAL_UP: 'left_vertical_up',
  LEFT_VERTICAL_DOWN: 'left_vertical_down',
  RIGHT_HORIZONTAL_LEFT: 'right_horizontal_left',
  RIGHT_HORIZONTAL_RIGHT: 'right_horizontal_right',
  RIGHT_VERTICAL_UP: 'right_vertical_up',
  RIGHT_VERTICAL_DOWN: 'right_vertical_down',
};

/**
 * All possible axes.
 * @type {!Set<GamepadAxisType>}
 */
export const ALL_AXES = new Set(Object.values(GamepadAxisType));

/**
 * @type {Map<GamepadAxisType, number>}
 */
export const GAMEPAD_AXIS_TO_INDEX = new Map([
  [GamepadAxisType.LEFT_HORIZONTAL_LEFT, 0],
  [GamepadAxisType.LEFT_HORIZONTAL_RIGHT, 0],
  [GamepadAxisType.LEFT_VERTICAL_UP, 1],
  [GamepadAxisType.LEFT_VERTICAL_DOWN, 1],
  [GamepadAxisType.RIGHT_HORIZONTAL_LEFT, 2],
  [GamepadAxisType.RIGHT_HORIZONTAL_RIGHT, 2],
  [GamepadAxisType.RIGHT_VERTICAL_UP, 3],
  [GamepadAxisType.RIGHT_VERTICAL_DOWN, 3],
]);

/**
 * @type {Map<GamepadButtonType|GamepadAxisType,string>}
 */
const BUTTON_AND_AXIS_DISPLAY_NAMES = new Map([
  [GamepadButtonType.CROSS, 'Cross'],
  [GamepadButtonType.CIRCLE, 'Circle'],
  [GamepadButtonType.SQUARE, 'Square'],
  [GamepadButtonType.TRIANGLE, 'Triangle'],
  [GamepadButtonType.L1, 'L1'],
  [GamepadButtonType.R1, 'R1'],
  [GamepadButtonType.L2, 'L2'],
  [GamepadButtonType.R2, 'R2'],
  [GamepadButtonType.SELECT, 'Select'],
  [GamepadButtonType.START, 'Start'],
  [GamepadButtonType.LEFT_STICK, 'Press left stick'],
  [GamepadButtonType.RIGHT_STICK, 'Press right stick'],
  [GamepadButtonType.UP, 'D-pad up'],
  [GamepadButtonType.DOWN, 'D-pad down'],
  [GamepadButtonType.LEFT, 'D-pad left'],
  [GamepadButtonType.RIGHT, 'D-pad right'],
  [GamepadAxisType.LEFT_HORIZONTAL_LEFT, 'Left stick left'],
  [GamepadAxisType.LEFT_HORIZONTAL_RIGHT, 'Left stick right'],
  [GamepadAxisType.LEFT_VERTICAL_UP, 'Left stick up'],
  [GamepadAxisType.LEFT_VERTICAL_DOWN, 'Left stick down'],
  [GamepadAxisType.RIGHT_HORIZONTAL_LEFT, 'Right stick left'],
  [GamepadAxisType.RIGHT_HORIZONTAL_RIGHT, 'Right stick right'],
  [GamepadAxisType.RIGHT_VERTICAL_UP, 'Right stick up'],
  [GamepadAxisType.RIGHT_VERTICAL_DOWN, 'Right stick down'],
]);

/**
 * Defines a combination of buttons or axes used to trigger an action.
 */
export class GamepadCombination {
  /**
   * Constructs a combination.
   * @param {Set<GamepadButtonType|GamepadAxisType>=} optCombination Optionally
   *     initialize the sequence with this combination of buttons and axes.
   */
  constructor(optCombination) {
    /**
     * The buttons in the order they should be pressed.
     * @type {!Set<GamepadButtonType|GamepadAxisType>}
     * @private
     */
    this.combination_ = optCombination || new Set();
  }

  /**
   * The inverse of the serialize method.
   * @param {string} serialization The string to deserialize.
   * @throws {Error} If the serialization is invalid.
   * @return {!GamepadCombination} The sequence represented by the
   *     serialization.
   * @public
   */
  static deserialize(serialization) {
    const sequence = serialization.split('+');
    for (const buttonOrAxis of sequence) {
      if (!ALL_BUTTONS.has(buttonOrAxis) && !ALL_AXES.has(buttonOrAxis)) {
        throw new Error(
            `Neither a valid button nor an axis ${buttonOrAxis}.`);
      }
    }
    return new GamepadCombination(new Set(sequence.sort()));
  }

  /**
   * Create a combination from a single axis.
   * @param {!GamepadAxisType} gamepadAxis The axis to add.
   * @return {!GamepadCombination} The combination with just the given axis.
   * @public
   */
  static fromSingleAxis(gamepadAxis) {
    return new GamepadCombination().addAxis(gamepadAxis);
  }

  /**
   * Create a combination from a single button.
   * @param {!GamepadButtonType} gamepadButton The button to add.
   * @return {!GamepadCombination} The combination with just the given button.
   * @public
   */
  static fromSingleButton(gamepadButton) {
    return new GamepadCombination().addButton(gamepadButton);
  }

  /**
   * Add a button to the combination.
   * @param {!GamepadButtonType} button The button to add.
   * @return {!GamepadCombination} This instance so you can chain more.
   * @public
   */
  addButton(button) {
    this.combination_.add(button);
    return this;
  }

  /**
   * Add an axis to the combination.
   * @param {GamepadAxisType} axis The axis to add.
   * @return {!GamepadCombination} This instance so you can chain more.
   * @public
   */
  addAxis(axis) {
    this.combination_.add(axis);
    return this;
  }

  /**
   * Serialize this sequence into a string, which can be used as a Map key.
   * @return {string} The serialization.
   * @public
   */
  serialize() {
    return Array.from(this.combination_).sort().join('+');
  }

  /**
   * Gets the display text of this combination, which can be used for rendering
   * help text.
   * @return {string} The display text.
   * @public
   */
  displayText() {
    return Array.from(this.combination_)
        .map((axisOrButton) => BUTTON_AND_AXIS_DISPLAY_NAMES.get(axisOrButton))
        .join(' + ');
  }

  /**
   * Checks whether there are any buttons or axes activated.
   * @return {boolean} True if there are no buttons or axes activated. False
   *     otherwise.
   * @public
   */
  isEmpty() {
    return this.combination_.size === 0;
  }

  /**
   * Translate this combination into a Gamepad object.
   * @return {!Gamepad} A gamepad representing this gamepad combination.
   * @public
   */
  asGamepad() {
    const buttons = [];
    for (const [gamepadButton, index] of GAMEPAD_BUTTON_TO_INDEX.entries()) {
      if (this.combination_.has(gamepadButton)) {
        buttons[index] = {value: 1.0, pressed: true};
      } else {
        buttons[index] = {value: 0.0, pressed: false};
      }
    }

    const axes = [];
    if (this.combination_.has(GamepadAxisType.LEFT_HORIZONTAL_LEFT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(
          GamepadAxisType.LEFT_HORIZONTAL_LEFT)]= -1.0;
    }
    if (this.combination_.has(GamepadAxisType.LEFT_HORIZONTAL_RIGHT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(
          GamepadAxisType.LEFT_HORIZONTAL_RIGHT)] = 1.0;
    }
    if (this.combination_.has(GamepadAxisType.LEFT_VERTICAL_UP)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxisType.LEFT_VERTICAL_UP)] = -1.0;
    }
    if (this.combination_.has(GamepadAxisType.LEFT_VERTICAL_DOWN)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxisType.LEFT_VERTICAL_DOWN)] = 1.0;
    }
    if (this.combination_.has(GamepadAxisType.RIGHT_HORIZONTAL_LEFT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(
          GamepadAxisType.RIGHT_HORIZONTAL_LEFT)] = -1.0;
    }
    if (this.combination_.has(GamepadAxisType.RIGHT_HORIZONTAL_RIGHT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(
          GamepadAxisType.RIGHT_HORIZONTAL_RIGHT)] = 1.0;
    }
    if (this.combination_.has(GamepadAxisType.RIGHT_VERTICAL_UP)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxisType.RIGHT_VERTICAL_UP)] = -1.0;
    }
    if (this.combination_.has(GamepadAxisType.RIGHT_VERTICAL_DOWN)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(
          GamepadAxisType.RIGHT_VERTICAL_DOWN)] = 1.0;
    }

    return {axes, buttons};
  }
}

GamepadCombination.LEFT_STICK_UP = GamepadCombination.fromSingleAxis(
    GamepadAxisType.LEFT_VERTICAL_UP);
GamepadCombination.LEFT_STICK_LEFT = GamepadCombination.fromSingleAxis(
    GamepadAxisType.LEFT_HORIZONTAL_LEFT);
GamepadCombination.LEFT_STICK_DOWN = GamepadCombination.fromSingleAxis(
    GamepadAxisType.LEFT_VERTICAL_DOWN);
GamepadCombination.LEFT_STICK_RIGHT = GamepadCombination.fromSingleAxis(
    GamepadAxisType.LEFT_HORIZONTAL_RIGHT);

GamepadCombination.RIGHT_STICK_LEFT = GamepadCombination.fromSingleAxis(
    GamepadAxisType.RIGHT_HORIZONTAL_LEFT);
GamepadCombination.RIGHT_STICK_RIGHT = GamepadCombination.fromSingleAxis(
    GamepadAxisType.RIGHT_HORIZONTAL_RIGHT);
GamepadCombination.RIGHT_STICK_UP = GamepadCombination.fromSingleAxis(
    GamepadAxisType.RIGHT_VERTICAL_UP);
GamepadCombination.RIGHT_STICK_DOWN = GamepadCombination.fromSingleAxis(
    GamepadAxisType.RIGHT_VERTICAL_DOWN);

GamepadCombination.TRIANGLE = GamepadCombination.fromSingleButton(
    GamepadButtonType.TRIANGLE);
GamepadCombination.CROSS = GamepadCombination.fromSingleButton(
    GamepadButtonType.CROSS);
GamepadCombination.CIRCLE = GamepadCombination.fromSingleButton(
    GamepadButtonType.CIRCLE);
GamepadCombination.SQUARE = GamepadCombination.fromSingleButton(
    GamepadButtonType.SQUARE);

GamepadCombination.UP = GamepadCombination.fromSingleButton(
    GamepadButtonType.UP);
GamepadCombination.DOWN = GamepadCombination.fromSingleButton(
    GamepadButtonType.DOWN);
GamepadCombination.LEFT = GamepadCombination.fromSingleButton(
    GamepadButtonType.LEFT);
GamepadCombination.RIGHT = GamepadCombination.fromSingleButton(
    GamepadButtonType.RIGHT);

GamepadCombination.SELECT = GamepadCombination.fromSingleButton(
    GamepadButtonType.SELECT);

GamepadCombination.L1 = GamepadCombination.fromSingleButton(
    GamepadButtonType.L1);
GamepadCombination.R1 = GamepadCombination.fromSingleButton(
    GamepadButtonType.R1);
