/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';


import chai from 'chai';
import chaiDom from 'chai-dom';
import sinon from 'sinon';
import FakeTimers from '@sinonjs/fake-timers';

import Blockly from 'blockly';
import {NavigationController, Navigation,
  GamepadMonitor, Constants}
  from '../src/index';
import {GamepadShortcutRegistry} from '../src/gamepad_shortcut_registry';
import {
  createNavigationWorkspace,
  createNavigatorGetGamepadsStub,
  createDiv,
  connectFakeGamepad,
  disconnectFakeGamepad} from './test_helper';
import {
  GamepadCombination,
  GamepadButtonType,
  GamepadAxisType} from '../src/gamepad';
import {ModalManager} from '../src/modal';
import {AccessibilityStatus} from '../src/accessibility_status';

chai.use(chaiDom);

suite('Navigation', function() {
  setup(function() {
    /** @type {FakeTimers.Clock} */
    this.clock = FakeTimers.install();

    createDiv('blocklyDiv');
    createDiv('modalContainer');
    Blockly.utils.dom.getFastTextWidthWithSizeString = function() {
      return 10;
    };

    /** @type {AccessibilityStatus} */
    this.accessibilityStatus = new AccessibilityStatus();

    /** @type {NavigationController} */
    this.navigation = new Navigation(this.accessibilityStatus);

    /** @type {GamepadShortcutRegistry} */
    this.gamepadShortcutRegistry = new GamepadShortcutRegistry();

    /** @type {GamepadMonitor} */
    this.gamepadMonitor = new GamepadMonitor(this.gamepadShortcutRegistry);

    /** @type {ModalManager} */
    this.modalManager = new ModalManager('modalContainer');

    /** @type {NavigationController} */
    this.controller = new NavigationController({
      optNavigation: this.navigation,
      optGamepadShortcutRegistry: this.gamepadShortcutRegistry,
      optGamepadMonitor: this.gamepadMonitor,
      optModalManager: this.modalManager,
      optAccessibilityStatus: this.accessibilityStatus,
    });
    this.controller.init();

    connectFakeGamepad();
  });

  teardown(function() {
    disconnectFakeGamepad();
    this.controller.dispose();
    this.clock.uninstall();
  });

  // Test that toolbox handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests toolbox input', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'TEXT',
            'text': 'default',
          },
        ],
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
      this.navigation.focusToolbox(this.workspace);
    });

    teardown(function() {
      this.controller.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    const testCases = [
      [
        'Calls toolbox selectNext',
        GamepadCombination.LEFT_STICK_DOWN,
        'selectNext_',
      ],
      [
        'Calls toolbox selectPrevious',
        GamepadCombination.LEFT_STICK_UP,
        'selectPrevious_',
      ],
      [
        'Calls toolbox selectParent',
        GamepadCombination.LEFT_STICK_RIGHT,
        'selectChild_',
      ],
      [
        'Calls toolbox selectChild',
        GamepadCombination.LEFT_STICK_LEFT,
        'selectParent_',
      ],
    ];

    for (const [testCaseName, gamepadCombination, stubName] of testCases) {
      test(testCaseName, function() {
        const toolbox = this.workspace.getToolbox();
        const selectStub = sinon.stub(toolbox, stubName);
        toolbox.selectedItem_ = toolbox.contents_[0];

        createNavigatorGetGamepadsStub(gamepadCombination);
        this.clock.runToFrame();

        sinon.assert.called(selectStub);
      });
    }

    test('Go to flyout', function() {
      const navigation = this.navigation;
      const gamepadCombination = GamepadCombination.LEFT_STICK_RIGHT;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          navigation.getState(this.workspace), Constants.STATE.FLYOUT);

      const flyoutCursor = navigation.getFlyoutCursor(this.workspace);
      chai.assert.equal(
          flyoutCursor.getCurNode().getLocation().getFieldValue('TEXT'),
          'FirstCategory-FirstBlock');
    });

    test('Focuses workspace from toolbox (Circle)', function() {
      const navigation = this.navigation;
      navigation.setState(this.workspace, Constants.STATE.TOOLBOX);
      const gamepadCombination = GamepadCombination.CIRCLE;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
  });

  // Test that flyout key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests flyout keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'TEXT',
            'text': 'default',
          },
        ],
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
      this.navigation.focusToolbox(this.workspace);
      this.navigation.focusFlyout(this.workspace);
    });

    teardown(function() {
      this.controller.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    // Should be a no-op
    test('Previous at beginning', function() {
      const gamepadCombination = GamepadCombination.LEFT_STICK_UP;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      chai.assert.equal(
          this.navigation.getFlyoutCursor(this.workspace)
              .getCurNode()
              .getLocation()
              .getFieldValue('TEXT'),
          'FirstCategory-FirstBlock');
    });

    test('Previous', function() {
      const flyoutBlocks =
          this.workspace.getFlyout().getWorkspace().getTopBlocks();
      this.navigation.getFlyoutCursor(this.workspace)
          .setCurNode(Blockly.ASTNode.createStackNode(flyoutBlocks[1]));
      let flyoutBlock = this.navigation.getFlyoutCursor(this.workspace)
          .getCurNode()
          .getLocation();
      chai.assert.equal(
          flyoutBlock.getFieldValue('TEXT'), 'FirstCategory-SecondBlock');

      const gamepadCombination = GamepadCombination.LEFT_STICK_UP;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      flyoutBlock = this.navigation.getFlyoutCursor(this.workspace)
          .getCurNode()
          .getLocation();
      chai.assert.equal(
          flyoutBlock.getFieldValue('TEXT'), 'FirstCategory-FirstBlock');
    });

    test('Next', function() {
      const gamepadCombination = GamepadCombination.LEFT_STICK_DOWN;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      const flyoutBlock = this.navigation.getFlyoutCursor(this.workspace)
          .getCurNode()
          .getLocation();
      chai.assert.equal(
          flyoutBlock.getFieldValue('TEXT'), 'FirstCategory-SecondBlock');
    });

    test('Out', function() {
      const gamepadCombination = GamepadCombination.LEFT_STICK_LEFT;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.TOOLBOX);
    });

    test('Mark', function() {
      const gamepadCombination = GamepadCombination.CROSS;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
      chai.assert.equal(this.workspace.getTopBlocks().length, 1);
    });

    test('Mark - Disabled Block', function() {
      this.navigation.loggingCallback = function(type, msg) {
        chai.assert.equal(msg, 'Can\'t insert a disabled block.');
      };
      const flyout = this.workspace.getFlyout();
      const topBlock = flyout.getWorkspace().getTopBlocks()[0];
      topBlock.setEnabled(false);
      const gamepadCombination = GamepadCombination.CROSS;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      chai.assert.equal(this.workspace.getTopBlocks().length, 0);
      this.navigation.loggingCallback = null;
    });

    test('Exit', function() {
      const gamepadCombination = GamepadCombination.CIRCLE;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
  });

  // Test that workspace key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests workspace keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'TEXT',
            'text': 'default',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
      this.basicBlock = this.workspace.newBlock('basic_block');
    });

    teardown(function() {
      this.controller.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    test('Previous', function() {
      const prevSpy = sinon.spy(this.workspace.getCursor(), 'prev');
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const gamepadCombination = GamepadCombination.LEFT_STICK_UP;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      sinon.assert.calledOnce(prevSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Next', function() {
      const nextSpy = sinon.spy(this.workspace.getCursor(), 'next');
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const gamepadCombination = GamepadCombination.LEFT_STICK_DOWN;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      sinon.assert.calledOnce(nextSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Out', function() {
      const outSpy = sinon.spy(this.workspace.getCursor(), 'out');
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const gamepadCombination = GamepadCombination.LEFT_STICK_LEFT;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      sinon.assert.calledOnce(outSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('In', function() {
      const inSpy = sinon.spy(this.workspace.getCursor(), 'in');
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const gamepadCombination = GamepadCombination.LEFT_STICK_RIGHT;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      sinon.assert.calledOnce(inSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Insert', function() {
      const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
      this.navigation.getMarker(this.workspace).setCurNode(blockNode);
      // Stub modify as we are not testing its behavior, only if it was called.
      // Otherwise, there is a warning because there is no marked node.
      const modifyStub =
          sinon.stub(this.navigation, 'tryToConnectMarkerAndCursor')
              .returns(true);
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const gamepadCombination = GamepadCombination.TRIANGLE;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      sinon.assert.calledOnce(modifyStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Mark', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(
              this.basicBlock.previousConnection));
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const gamepadCombination = GamepadCombination.CROSS;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      const markedNode =
          this.workspace.getMarker(this.navigation.MARKER_NAME).getCurNode();
      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          markedNode.getLocation(), this.basicBlock.previousConnection);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Toolbox', function() {
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const gamepadCombination = GamepadCombination.SQUARE;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      const firstCategory = this.workspace.getToolbox().contents_[0];
      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.equal(
          this.workspace.getToolbox().getSelectedItem(), firstCategory);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.TOOLBOX);
    });
  });

  suite('Test key press', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_dropdown',
            'name': 'OP',
            'options': [
              ['%{BKY_MATH_ADDITION_SYMBOL}', 'ADD'],
              ['%{BKY_MATH_SUBTRACTION_SYMBOL}', 'MINUS'],
              ['%{BKY_MATH_MULTIPLICATION_SYMBOL}', 'MULTIPLY'],
              ['%{BKY_MATH_DIVISION_SYMBOL}', 'DIVIDE'],
              ['%{BKY_MATH_POWER_SYMBOL}', 'POWER'],
            ],
          },
        ],
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
      this.workspace.getCursor().drawer_ = null;
      this.basicBlock = this.workspace.newBlock('basic_block');
    });
    teardown(function() {
      this.controller.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });


    test('Action does not exist', function() {
      const block = this.workspace.getTopBlocks()[0];
      const field = block.inputList[0].fieldRow[0];
      const fieldSpy = sinon.spy(field, 'onShortcut');
      const gamepadCombination = new GamepadCombination()
          .addButton(GamepadButtonType.LEFT_STICK);
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createFieldNode(field));

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isFalse(onActivateSpy.returned(true));
      sinon.assert.notCalled(fieldSpy);
    });

    test('Action exists - field handles action', function() {
      const block = this.workspace.getTopBlocks()[0];
      const field = block.inputList[0].fieldRow[0];
      const gamepadCombination = GamepadCombination.LEFT_STICK_LEFT;
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      const fieldSpy = sinon.stub(field, 'onShortcut').returns(true);
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createFieldNode(field));

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      sinon.assert.calledOnce(fieldSpy);
    });

    test('Action exists - field does not handle action', function() {
      const block = this.workspace.getTopBlocks()[0];
      const field = block.inputList[0].fieldRow[0];
      const gamepadCombination = GamepadCombination.LEFT_STICK_LEFT;
      const fieldSpy = sinon.spy(field, 'onShortcut');
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createFieldNode(field));

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      sinon.assert.calledOnce(fieldSpy);
    });

    test('Toggle Action Off', function() {
      const gamepadCombination = new GamepadCombination()
          .addButton(GamepadButtonType.L1)
          .addButton(GamepadButtonType.R1);
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      this.accessibilityStatus.enableGamepadAccessibility(this.workspace);

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.isFalse(this.accessibilityStatus
          .isGamepadAccessibilityEnabled(this.workspace));
    });

    test('Toggle Action On', function() {
      const gamepadCombination = new GamepadCombination()
          .addButton(GamepadButtonType.L1)
          .addButton(GamepadButtonType.R1);
      const onActivateSpy = sinon.spy(
          this.gamepadShortcutRegistry, 'onActivate');
      this.accessibilityStatus.disableGamepadAccessibility(this.workspace);

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      chai.assert.isTrue(onActivateSpy.returned(true));
      chai.assert.isTrue(this.accessibilityStatus
          .isGamepadAccessibilityEnabled(this.workspace));
    });

    suite('Test key press in read only mode', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([{
          'type': 'field_block',
          'message0': '%1 %2',
          'args0': [
            {
              'type': 'field_dropdown',
              'name': 'NAME',
              'options': [
                [
                  'a',
                  'optionA',
                ],
              ],
            },
            {
              'type': 'input_value',
              'name': 'NAME',
            },
          ],
          'previousStatement': null,
          'nextStatement': null,
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        }]);
        this.workspace = createNavigationWorkspace(this.navigation, true, true);
        this.controller.addWorkspace(this.workspace);

        Blockly.mainWorkspace = this.workspace;
        this.workspace.getCursor().drawer_ = null;

        this.fieldBlock1 = this.workspace.newBlock('field_block');
      });

      teardown(function() {
        this.controller.removeWorkspace(this.workspace);
        this.workspace.dispose();
        sinon.restore();
        delete Blockly.Blocks['field_block'];
      });

      test('Perform valid action for read only', function() {
        const astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        const gamepadCombination = GamepadCombination.LEFT_STICK_DOWN;
        this.workspace.getCursor().setCurNode(astNode);
        const onActivateSpy = sinon.spy(
            this.gamepadShortcutRegistry, 'onActivate');

        createNavigatorGetGamepadsStub(gamepadCombination);
        this.clock.runToFrame();

        chai.assert.isTrue(onActivateSpy.returned(true));
      });

      test('Perform invalid action for read only', function() {
        const astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        const gamepadCombination = GamepadCombination.TRIANGLE;
        this.workspace.getCursor().setCurNode(astNode);
        const onActivateSpy = sinon.spy(
            this.gamepadShortcutRegistry, 'onActivate');

        createNavigatorGetGamepadsStub(gamepadCombination);
        this.clock.runToFrame();

        chai.assert.isTrue(onActivateSpy.returned(false));
      });

      test('Try to perform action on a field', function() {
        const field = this.fieldBlock1.inputList[0].fieldRow[0];
        const astNode = Blockly.ASTNode.createFieldNode(field);
        const gamepadCombination = GamepadCombination.CROSS;
        this.workspace.getCursor().setCurNode(astNode);
        const onActivateSpy = sinon.spy(
            this.gamepadShortcutRegistry, 'onActivate');

        createNavigatorGetGamepadsStub(gamepadCombination);
        this.clock.runToFrame();

        chai.assert.isTrue(onActivateSpy.returned(false));
      });
    });
  });
  suite('Insert Functions', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'TEXT',
            'text': 'default',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      }]);

      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);

      const basicBlock = this.workspace.newBlock('basic_block');
      const basicBlock2 = this.workspace.newBlock('basic_block');

      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
    });

    teardown(function() {
      this.controller.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    test('Insert from flyout with a valid connection marked', function() {
      const previousConnection = this.basicBlock.previousConnection;
      const prevNode = Blockly.ASTNode.createConnectionNode(previousConnection);
      this.workspace.getMarker(this.navigation.MARKER_NAME)
          .setCurNode(prevNode);

      this.navigation.focusToolbox(this.workspace);
      this.navigation.focusFlyout(this.workspace);
      this.navigation.insertFromFlyout(this.workspace);

      const insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isTrue(insertedBlock !== null);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Insert Block from flyout without marking a connection', function() {
      this.navigation.focusToolbox(this.workspace);
      this.navigation.focusFlyout(this.workspace);
      this.navigation.insertFromFlyout(this.workspace);

      const numBlocks = this.workspace.getTopBlocks().length;

      // Make sure the block was not connected to anything
      chai.assert.isNull(this.basicBlock.previousConnection.targetConnection);
      chai.assert.isNull(this.basicBlock.nextConnection.targetConnection);

      // Make sure that the block was added to the workspace
      chai.assert.equal(numBlocks, 3);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Connect two blocks that are on the workspace', function() {
      const targetNode = Blockly.ASTNode.createConnectionNode(
          this.basicBlock.previousConnection);
      const sourceNode =
          Blockly.ASTNode.createConnectionNode(this.basicBlock2.nextConnection);

      this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, targetNode, sourceNode);
      const insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isNotNull(insertedBlock);
    });
  });
  suite('Connect Blocks', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'basic_block',
          'message0': '',
          'previousStatement': null,
          'nextStatement': null,
        },
        {
          'type': 'inline_block',
          'message0': '%1 %2',
          'args0': [
            {
              'type': 'input_value',
              'name': 'NAME',
            },
            {
              'type': 'input_value',
              'name': 'NAME',
            },
          ],
          'inputsInline': true,
          'output': null,
          'tooltip': '',
          'helpUrl': '',
        },
      ]);

      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);

      const basicBlock = this.workspace.newBlock('basic_block');
      const basicBlock2 = this.workspace.newBlock('basic_block');
      const basicBlock3 = this.workspace.newBlock('basic_block');
      const basicBlock4 = this.workspace.newBlock('basic_block');

      const inlineBlock1 = this.workspace.newBlock('inline_block');
      const inlineBlock2 = this.workspace.newBlock('inline_block');
      const inlineBlock3 = this.workspace.newBlock('inline_block');


      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
      this.basicBlock3 = basicBlock3;
      this.basicBlock4 = basicBlock4;

      this.inlineBlock1 = inlineBlock1;
      this.inlineBlock2 = inlineBlock2;
      this.inlineBlock3 = inlineBlock3;

      this.basicBlock.nextConnection.connect(
          this.basicBlock2.previousConnection);

      this.basicBlock3.nextConnection.connect(
          this.basicBlock4.previousConnection);

      this.inlineBlock1.inputList[0].connection.connect(
          this.inlineBlock2.outputConnection);
    });

    teardown(function() {
      this.controller.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
      delete Blockly.Blocks['inline_block'];
    });

    test('Connect cursor on previous into stack', function() {
      const markedLocation = this.basicBlock2.previousConnection;
      const cursorLocation = this.basicBlock3.previousConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock.nextConnection.targetBlock(), this.basicBlock3);
      chai.assert.equal(
          this.basicBlock2.previousConnection.targetBlock(), this.basicBlock4);
    });

    test('Connect marker on previous into stack', function() {
      const markedLocation = this.basicBlock3.previousConnection;
      const cursorLocation = this.basicBlock2.previousConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock.nextConnection.targetBlock(), this.basicBlock3);
      chai.assert.equal(
          this.basicBlock2.previousConnection.targetBlock(), this.basicBlock4);
    });

    test('Connect cursor on next into stack', function() {
      const markedLocation = this.basicBlock2.previousConnection;
      const cursorLocation = this.basicBlock4.nextConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock.nextConnection.targetBlock(), this.basicBlock4);
      chai.assert.isNull(this.basicBlock3.nextConnection.targetConnection);
    });

    test('Connect cursor with parents', function() {
      const markedLocation = this.basicBlock3.previousConnection;
      const cursorLocation = this.basicBlock2.nextConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock3.previousConnection.targetBlock(), this.basicBlock2);
    });

    test('Try to connect input that is descendant of output', function() {
      const markedLocation = this.inlineBlock2.inputList[0].connection;
      const cursorLocation = this.inlineBlock1.outputConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.isNull(this.inlineBlock2.outputConnection.targetBlock());
      chai.assert.equal(
          this.inlineBlock1.outputConnection.targetBlock(), this.inlineBlock2);
    });
    test.skip('Do not connect a shadow block', function() {
      // TODO(https://github.com/google/blockly-samples/issues/538): Update
      // tests after this bug is fixed.
      this.inlineBlock2.setShadow(true);

      const markedLocation = this.inlineBlock2.outputConnection;
      const cursorLocation = this.inlineBlock3.inputList[0].connection;
      const didConnect =
          this.navigation.connect(cursorLocation, markedLocation);
      chai.assert.isFalse(didConnect);
      chai.assert.isNull(this.inlineBlock2.outputConnection.targetBlock());
      chai.assert.equal(
          this.inlineBlock1.outputConnection.targetBlock(), this.inlineBlock2);
    });
  });

  suite('Test cursor move on block delete', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '',
        'previousStatement': null,
        'nextStatement': null,
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);

      this.basicBlockA = this.workspace.newBlock('basic_block');
      this.basicBlockB = this.workspace.newBlock('basic_block');
    });

    teardown(function() {
      this.controller.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    test('Delete block - has parent ', function() {
      this.basicBlockA.nextConnection.connect(
          this.basicBlockB.previousConnection);
      const astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      // Set the cursor to be on the child block
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the child block
      const gamepadCombination = GamepadCombination.LEFT;

      // Actions that happen when a block is deleted were causing problems.
      // Since this is not what we are trying to test and does not effect the
      // feature, disable events.
      Blockly.Events.disable();
      createNavigatorGetGamepadsStub(gamepadCombination);
      Blockly.Events.enable();
      this.clock.runToFrame();

      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.NEXT);
    });

    test('Delete block - no parent ', function() {
      const astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      this.workspace.getCursor().setCurNode(astNode);

      const gamepadCombination = GamepadCombination.LEFT;

      // Actions that happen when a block is deleted were causing problems.
      // Since this is not what we are trying to test and does not effect the
      // feature, disable events.
      Blockly.Events.disable();
      createNavigatorGetGamepadsStub(gamepadCombination);
      Blockly.Events.enable();
      this.clock.runToFrame();

      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });

    test('Delete parent block', function() {
      this.basicBlockA.nextConnection.connect(
          this.basicBlockB.previousConnection);
      const astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      const mockDeleteBlockEvent = {
        'blockId': this.basicBlockA,
        'ids': [
          this.basicBlockA.id,
          this.basicBlockB.id,
        ],
      };
      // Set the cursor to be on the child block
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the parent block
      this.navigation.handleBlockDeleteByDrag(
          this.workspace, mockDeleteBlockEvent);
      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });

    test('Delete top block in stack', function() {
      this.basicBlockA.nextConnection.connect(
          this.basicBlockB.previousConnection);
      const astNode = Blockly.ASTNode.createStackNode(this.basicBlockA);
      const mockDeleteBlockEvent = {
        'blockId': this.basicBlockA.id,
        'ids': [
          this.basicBlockA.id,
          this.basicBlockB.id,
        ],
      };
      // Set the cursor to be on the stack
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the top block in the stack
      this.navigation.handleBlockDeleteByDrag(
          this.workspace, mockDeleteBlockEvent);
      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });
  });

  suite('Test workspace listener', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'TEXT',
            'text': 'default',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
      this.workspaceChangeListener = this.navigation.wsChangeWrapper;
      this.basicBlockA = this.workspace.newBlock('basic_block');
    });

    teardown(function() {
      // this.controller.removeWorkspace(this.workspace);
      delete Blockly.Blocks['basic_block'];
      sinon.restore();
    });

    test('Handle block mutation', function() {
      const e = {
        type: Blockly.Events.BLOCK_CHANGE,
        element: 'mutation',
        blockId: this.basicBlockA.id,
        workspaceId: this.workspace.id,
      };
      const cursor = this.workspace.getCursor();
      const nextNode =
          Blockly.ASTNode.createConnectionNode(this.basicBlockA.nextConnection);
      cursor.setCurNode(nextNode);
      this.workspaceChangeListener(e);
      chai.assert.equal(
          cursor.getCurNode().getType(), Blockly.ASTNode.types.BLOCK);
    });
    test('Handle workspace click', function() {
      const e = {
        type: Blockly.Events.CLICK,
        workspaceId: this.workspace.id,
      };
      this.navigation.focusFlyout(this.workspace);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);

      this.workspaceChangeListener(e);

      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
    test('Focus toolbox if category clicked', function() {
      const e = {
        type: Blockly.Events.TOOLBOX_ITEM_SELECT,
        workspaceId: this.workspace.id,
        newItem: true,
      };
      const toolboxFocusStub = sinon.spy(this.navigation, 'focusToolbox');

      this.navigation.focusWorkspace(this.workspace);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);

      this.workspaceChangeListener(e);

      sinon.assert.calledOnce(toolboxFocusStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.TOOLBOX);
    });
    test('Focus workspace if toolbox is unselected', function() {
      const e = {
        type: Blockly.Events.TOOLBOX_ITEM_SELECT,
        workspaceId: this.workspace.id,
        newItem: false,
      };
      const resetFlyoutStub = sinon.spy(this.navigation, 'resetFlyout');
      this.navigation.setState(this.workspace, Constants.STATE.TOOLBOX);

      this.workspaceChangeListener(e);

      sinon.assert.calledOnce(resetFlyoutStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
    test('Focus workspace when block created on workspace', function() {
      const e = {
        type: Blockly.Events.BLOCK_CREATE,
        workspaceId: this.workspace.id,
      };
      const resetFlyoutStub = sinon.spy(this.navigation, 'resetFlyout');
      // Only works when someone is in the flyout.
      this.navigation.setState(this.workspace, Constants.STATE.FLYOUT);

      this.workspaceChangeListener(e);

      sinon.assert.calledOnce(resetFlyoutStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
  });

  suite('Test simple flyout listener', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'TEXT',
            'text': 'default',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
      this.flyoutChangeListener = this.navigation.flyoutChangeWrapper;
      this.basicBlockA = this.workspace.newBlock('basic_block');

      this.navigation.focusToolbox(this.workspace);
      this.workspace.getFlyout().autoClose = false;
    });

    teardown(function() {
      // this.controller.removeWorkspace(this.workspace);
      delete Blockly.Blocks['basic_block'];
      sinon.restore();
    });
    test('Handle block click in flyout - click event', function() {
      const flyout = this.workspace.getFlyout();
      const flyoutWorkspace = flyout.getWorkspace();
      const firstFlyoutBlock = flyoutWorkspace.getTopBlocks()[0];
      const e = {
        type: Blockly.Events.CLICK,
        workspaceId: flyoutWorkspace.id,
        targetType: 'block',
        blockId: firstFlyoutBlock.id,
      };
      const flyoutCursor = flyoutWorkspace.getCursor();
      this.navigation.focusWorkspace(this.workspace);

      this.flyoutChangeListener(e);

      chai.assert.equal(
          flyoutCursor.getCurNode().getType(), Blockly.ASTNode.types.STACK);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
    });
    test('Handle block click in flyout - select event', function() {
      const flyout = this.workspace.getFlyout();
      const flyoutWorkspace = flyout.getWorkspace();
      const firstFlyoutBlock = flyoutWorkspace.getTopBlocks()[0];
      const e = {
        type: Blockly.Events.SELECTED,
        workspaceId: flyoutWorkspace.id,
        newElementId: firstFlyoutBlock.id,
      };
      const flyoutCursor = flyoutWorkspace.getCursor();
      this.navigation.focusWorkspace(this.workspace);

      this.flyoutChangeListener(e);

      chai.assert.equal(
          flyoutCursor.getCurNode().getType(), Blockly.ASTNode.types.STACK);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
    });
  });

  suite('Test clean up methods', function() {
    setup(function() {
      this.workspace = createNavigationWorkspace(this.navigation, true);
    });
    test('All listeners and markers removed', function() {
      const numListeners = this.workspace.listeners_.length;
      const markerName = this.navigation.MARKER_NAME;
      this.navigation.removeWorkspace(this.workspace);
      chai.assert.equal(this.workspace.listeners_.length, numListeners - 1);

      const marker = this.workspace.getMarkerManager().markers_[markerName];
      chai.assert.isUndefined(marker);
    });
    test('Gampead accessibility mode can not be enabled', function() {
      this.navigation.removeWorkspace(this.workspace);
      this.navigation.enableGamepadAccessibility(this.workspace);
      chai.assert.isFalse(this.accessibilityStatus
          .isGamepadAccessibilityEnabled(this.workspace));
    });
    test('Dispose', function() {
      const numListeners = this.workspace.listeners_.length;
      const flyout = this.workspace.getFlyout();
      const numFlyoutListeners = flyout.getWorkspace().listeners_.length;
      this.navigation.dispose();
      chai.assert.equal(this.workspace.listeners_.length, numListeners - 1);
      chai.assert.equal(
          flyout.getWorkspace().listeners_.length, numFlyoutListeners - 1);
    });
  });

  suite('Help text', function() {
    setup(function() {
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
    });

    teardown(function() {
      sinon.restore();
    });

    test('Default controls are shown when activated', function() {
      const gamepadCombination = GamepadCombination.SELECT;

      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();

      const instructions = document.querySelector('#help-popup').innerText
          .split('\n');
      chai.assert.sameDeepOrderedMembers(instructions, [
        'Navigation',
        'Move to previous node: Left stick up',
        'Move to next node: Left stick down',
        'Move into block: Left stick right',
        'Move out of block: Left stick left',
        'Block manipulation',
        'Disconnect two nodes: Circle',
        'Insert a block: Triangle',
        'Mark a block: Cross',
        'Copy node: D-pad up',
        'Paste node: D-pad down',
        'Cut node: D-pad right',
        'Delete node: D-pad left',
        'Workspace movement',
        'Move workspace cursor left: Right stick left',
        'Move workspace cursor right: Right stick right',
        'Move workspace cursor up: Right stick up',
        'Move workspace cursor down: Right stick down',
        'Scroll workspace left: R2 + Right stick left',
        'Scroll workspace right: R2 + Right stick right',
        'Scroll workspace up: R2 + Right stick up',
        'Scroll workspace down: R2 + Right stick down',
        'Text Input',
        'Move the left cursor: Left stick',
        'Move the right cursor: Right stick',
        'Select the currently highlighted key on the left keyboard: L1',
        'Select the currently highlighted key on the right keyboard: R1',
        'Other',
        'Toggle toolbox: Square',
        'Exit: Circle',
        'Toggle gamepad navigation: L1 + R1',
        'Toggle the help screen: Select',
      ]);
    });
  });

  suite('Workspace scrolling', function() {
    setup(function() {
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.controller.addWorkspace(this.workspace);
      this.workspace.scrollCenter();
    });

    teardown(function() {
      sinon.restore();
    });

    const testCases = [
      {
        name: 'Left',
        combination: new GamepadCombination()
            .addButton(GamepadButtonType.R2)
            .addAxis(GamepadAxisType.RIGHT_HORIZONTAL_LEFT),
        diffX: 10,
        diffY: 0,
      },
      {
        name: 'Right',
        combination: new GamepadCombination()
            .addButton(GamepadButtonType.R2)
            .addAxis(GamepadAxisType.RIGHT_HORIZONTAL_RIGHT),
        diffX: -10,
        diffY: 0,
      },
      {
        name: 'Up',
        combination: new GamepadCombination()
            .addButton(GamepadButtonType.R2)
            .addAxis(GamepadAxisType.RIGHT_VERTICAL_UP),
        diffX: 0,
        diffY: 10,
      },
      {
        name: 'Down',
        combination: new GamepadCombination()
            .addButton(GamepadButtonType.R2)
            .addAxis(GamepadAxisType.RIGHT_VERTICAL_DOWN),
        diffX: 0,
        diffY: -10,
      },
    ];

    for (const {name, combination, diffX, diffY} of testCases) {
      test(name, function() {
        const originalX = this.workspace.scrollX;
        const originalY = this.workspace.scrollY;

        createNavigatorGetGamepadsStub(combination);
        this.clock.runToFrame();

        chai.assert.equal(this.workspace.scrollY - originalY, diffY);
        chai.assert.equal(this.workspace.scrollX - originalX, diffX);
      });
    }
  });
});
