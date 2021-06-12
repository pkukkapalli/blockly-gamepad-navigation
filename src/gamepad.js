/**
 * @fileoverview All of the types necessary to work with gamepads.
 */

/**
 * The buttons available on a universal gamepad.
 * @enum {string}
 */
export const GamepadButton = {
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
 * @type {!Set<GamepadButton>}
 */
export const ALL_BUTTONS = new Set(Object.values(GamepadButton));

/**
 * @type {Map<GamepadButton, number>}
 */
export const GAMEPAD_BUTTON_TO_INDEX = new Map([
  [GamepadButton.CROSS, 0],
  [GamepadButton.CIRCLE, 1],
  [GamepadButton.SQUARE, 2],
  [GamepadButton.TRIANGLE, 3],
  [GamepadButton.L1, 4],
  [GamepadButton.R1, 5],
  [GamepadButton.L2, 6],
  [GamepadButton.R2, 7],
  [GamepadButton.SELECT, 8],
  [GamepadButton.START, 9],
  [GamepadButton.LEFT_STICK, 10],
  [GamepadButton.RIGHT_STICK, 11],
  [GamepadButton.UP, 12],
  [GamepadButton.DOWN, 13],
  [GamepadButton.LEFT, 14],
  [GamepadButton.RIGHT, 15],
]);

/**
 * The axes available on a universal gamepad.
 * @enum {string}
 */
export const GamepadAxis = {
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
 * @type {!Set<GamepadAxis>}
 */
export const ALL_AXES = new Set(Object.values(GamepadAxis));

/**
 * @type {Map<GamepadAxis, number>}
 */
export const GAMEPAD_AXIS_TO_INDEX = new Map([
  [GamepadAxis.LEFT_HORIZONTAL_LEFT, 0],
  [GamepadAxis.LEFT_HORIZONTAL_RIGHT, 0],
  [GamepadAxis.LEFT_VERTICAL_UP, 1],
  [GamepadAxis.LEFT_VERTICAL_DOWN, 1],
  [GamepadAxis.RIGHT_HORIZONTAL_LEFT, 2],
  [GamepadAxis.RIGHT_HORIZONTAL_RIGHT, 2],
  [GamepadAxis.RIGHT_VERTICAL_UP, 3],
  [GamepadAxis.RIGHT_VERTICAL_DOWN, 3],
]);

/**
 * Defines a combination of buttons or axes used to trigger an action.
 */
export class GamepadCombination {
  /**
   * Constructs a combination.
   * @param {Set<GamepadButton|GamepadAxis>=} optCombination Optionally
   *     initialize the sequence with this combination of buttons and axes.
   */
  constructor(optCombination) {
    /**
     * The buttons in the order they should be pressed.
     * @type {!Set<GamepadButton|GamepadAxis>}
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
   * @param {!GamepadAxis} gamepadAxis The axis to add.
   * @return {!GamepadCombination} The combination with just the given axis.
   * @public
   */
  static fromSingleAxis(gamepadAxis) {
    return new GamepadCombination().addAxis(gamepadAxis);
  }

  /**
   * Create a combination from a single button.
   * @param {!GamepadButton} gamepadButton The button to add.
   * @return {!GamepadCombination} The combination with just the given button.
   * @public
   */
  static fromSingleButton(gamepadButton) {
    return new GamepadCombination().addButton(gamepadButton);
  }

  /**
   * Add a button to the combination.
   * @param {!GamepadButton} button The button to add.
   * @return {!GamepadCombination} This instance so you can chain more.
   * @public
   */
  addButton(button) {
    this.combination_.add(button);
    return this;
  }

  /**
   * Add an axis to the combination.
   * @param {GamepadAxis} axis The axis to add.
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
    if (this.combination_.has(GamepadAxis.LEFT_HORIZONTAL_LEFT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.LEFT_HORIZONTAL_LEFT)] = -1.0;
    }
    if (this.combination_.has(GamepadAxis.LEFT_HORIZONTAL_RIGHT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.LEFT_HORIZONTAL_RIGHT)] = 1.0;
    }
    if (this.combination_.has(GamepadAxis.LEFT_VERTICAL_UP)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.LEFT_VERTICAL_UP)] = -1.0;
    }
    if (this.combination_.has(GamepadAxis.LEFT_VERTICAL_DOWN)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.LEFT_VERTICAL_DOWN)] = 1.0;
    }
    if (this.combination_.has(GamepadAxis.RIGHT_HORIZONTAL_LEFT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.RIGHT_HORIZONTAL_LEFT)] = -1.0;
    }
    if (this.combination_.has(GamepadAxis.RIGHT_HORIZONTAL_RIGHT)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.RIGHT_HORIZONTAL_RIGHT)] = 1.0;
    }
    if (this.combination_.has(GamepadAxis.RIGHT_VERTICAL_UP)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.RIGHT_VERTICAL_UP)] = -1.0;
    }
    if (this.combination_.has(GamepadAxis.RIGHT_VERTICAL_DOWN)) {
      axes[GAMEPAD_AXIS_TO_INDEX.get(GamepadAxis.RIGHT_VERTICAL_DOWN)] = 1.0;
    }

    return {axes, buttons};
  }
}

GamepadCombination.LEFT_STICK_UP = GamepadCombination.fromSingleAxis(
    GamepadAxis.LEFT_VERTICAL_UP);
GamepadCombination.LEFT_STICK_LEFT = GamepadCombination.fromSingleAxis(
    GamepadAxis.LEFT_HORIZONTAL_LEFT);
GamepadCombination.LEFT_STICK_DOWN = GamepadCombination.fromSingleAxis(
    GamepadAxis.LEFT_VERTICAL_DOWN);
GamepadCombination.LEFT_STICK_RIGHT = GamepadCombination.fromSingleAxis(
    GamepadAxis.LEFT_HORIZONTAL_RIGHT);

GamepadCombination.RIGHT_STICK_LEFT = GamepadCombination.fromSingleAxis(
    GamepadAxis.RIGHT_HORIZONTAL_LEFT);
GamepadCombination.RIGHT_STICK_RIGHT = GamepadCombination.fromSingleAxis(
    GamepadAxis.RIGHT_HORIZONTAL_RIGHT);
GamepadCombination.RIGHT_STICK_UP = GamepadCombination.fromSingleAxis(
    GamepadAxis.RIGHT_VERTICAL_UP);
GamepadCombination.RIGHT_STICK_DOWN = GamepadCombination.fromSingleAxis(
    GamepadAxis.RIGHT_VERTICAL_DOWN);

GamepadCombination.TRIANGLE = GamepadCombination.fromSingleButton(
    GamepadButton.TRIANGLE);
GamepadCombination.CROSS = GamepadCombination.fromSingleButton(
    GamepadButton.CROSS);
GamepadCombination.CIRCLE = GamepadCombination.fromSingleButton(
    GamepadButton.CIRCLE);
GamepadCombination.SQUARE = GamepadCombination.fromSingleButton(
    GamepadButton.SQUARE);

GamepadCombination.UP = GamepadCombination.fromSingleButton(GamepadButton.UP);
GamepadCombination.DOWN = GamepadCombination.fromSingleButton(
    GamepadButton.DOWN);
GamepadCombination.LEFT = GamepadCombination.fromSingleButton(
    GamepadButton.LEFT);
GamepadCombination.RIGHT = GamepadCombination.fromSingleButton(
    GamepadButton.RIGHT);
