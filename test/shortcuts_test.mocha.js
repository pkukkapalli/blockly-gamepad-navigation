/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import sinon from 'sinon';
import FakeTimers from '@sinonjs/fake-timers';

import Blockly from 'blockly';

import {NavigationController, Navigation, GamepadMonitor}
  from '../src/index';
import {
  connectFakeGamepad,
  createDiv,
  createNavigationWorkspace,
  createNavigatorGetGamepadsStub,
  disconnectFakeGamepad}
  from './test_helper';
import {GamepadCombination} from '../src/gamepad';
import {GamepadShortcutRegistry} from '../src/gamepad_shortcut_registry';

suite('Shortcut Tests', function() {
  /**
   * Creates a test for not running gamepad input when the workspace is in read
   * only mode.
   * @param {string} testCaseName The name of the test case.
   * @param {GamepadCombination} gamepadCombination Gamepad combination to try.
   */
  function runReadOnlyTest(testCaseName, gamepadCombination) {
    test(testCaseName, function() {
      this.workspace.options.readOnly = true;
      const hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not runnin a shortcut when a gesture is in progress.
   * @param {string} testCaseName The name of the test case.
   * @param {GamepadCombination} gamepadCombination Gamepad combination to try.
   */
  function testGestureInProgress(testCaseName, gamepadCombination) {
    test(testCaseName, function() {
      sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();
      const hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
      const copySpy = sinon.spy(Blockly, 'copy');
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not running a shortcut when a the cursor is not on a
   * block.
   * @param {string} testCaseName The name of the test case.
   * @param {GamepadCombination} gamepadCombination Gamepad combination to try.
   */
  function testCursorOnShadowBlock(testCaseName, gamepadCombination) {
    test(testCaseName, function() {
      const hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
      const copySpy = sinon.spy(Blockly, 'copy');
      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not running a shortcut when the block is not deletable.
   * @param {string} testCaseName The name of the test case.
   * @param {GamepadCombination} gamepadCombination Gamepad combination to try.
   */
  function testBlockIsNotDeletable(testCaseName, gamepadCombination) {
    test(testCaseName, function() {
      sinon.stub(this.basicBlock, 'isDeletable').returns(false);
      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();
      const hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
      const copySpy = sinon.spy(Blockly, 'copy');
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not running a shortcut when the cursor is not on a
   * block.
   * @param {string} testCaseName The name of the test case.
   * @param {GamepadCombination} gamepadCombination Gamepad combination to try.
   */
  function testCursorIsNotOnBlock(testCaseName, gamepadCombination) {
    test(testCaseName, function() {
      const hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
      const copySpy = sinon.spy(Blockly, 'copy');
      createNavigatorGetGamepadsStub(gamepadCombination);
      this.clock.runToFrame();
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  setup(function() {
    /** @type {FakeTimers.Clock} */
    this.clock = FakeTimers.install();

    createDiv('blocklyDiv');
    Blockly.utils.dom.getFastTextWidthWithSizeString = function() {
      return 10;
    };
    Blockly.defineBlocksWithJsonArray([{
      'type': 'basic_block',
      'message0': '',
      'previousStatement': null,
      'nextStatement': null,
    }]);

    /** @type {Navigation} */
    this.navigation = new Navigation();

    const gamepadShortcutRegistry = new GamepadShortcutRegistry();

    /** @type {GamepadMonitor} */
    this.gamepadMonitor = new GamepadMonitor(gamepadShortcutRegistry);

    /** @type {NavigationController} */
    this.controller = new NavigationController(
        this.navigation, gamepadShortcutRegistry, this.gamepadMonitor);
    this.controller.init();

    /** @type {Blockly.WorkspaceSvg} */
    this.workspace = createNavigationWorkspace(/* readOnly= */ true);
    this.controller.addWorkspace(this.workspace);
    this.controller.enable(this.workspace);

    /** @type {Blockly.Block} */
    this.basicBlock = this.workspace.newBlock('basic_block');

    connectFakeGamepad();
  });

  teardown(function() {
    disconnectFakeGamepad();
    this.controller.dispose();
    delete Blockly.Blocks['basic_block'];
    this.workspace.dispose();
    this.clock.uninstall();
  });

  suite('Copy', function() {
    teardown(function() {
      sinon.restore();
    });

    const testCases = [['Up', GamepadCombination.UP]];

    // Copy a block.
    suite('Simple', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });

      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        test(testCaseName, function() {
          const hideChaffSpy = sinon.spy(Blockly, 'hideChaff');
          const copySpy = sinon.spy(Blockly, 'copy');
          createNavigatorGetGamepadsStub(gamepadCombination);
          this.clock.runToFrame();
          sinon.assert.calledOnce(copySpy);
          sinon.assert.calledOnce(hideChaffSpy);
        });
      });
    });

    // Do not copy the block if the cursor is on the workspace.
    suite('Cursor is not on a block', function() {
      setup(function() {
        const workspaceNode = Blockly.ASTNode.createWorkspaceNode(
            this.workspace, new Blockly.utils.Coordinate(100, 100));
        this.workspace.getCursor().setCurNode(workspaceNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testCursorIsNotOnBlock(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if the block is a shadow block
    suite('Cursor is on a shadow block', function() {
      setup(function() {
        this.basicBlock.setShadow(true);
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testCursorOnShadowBlock(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if a workspace is in readonly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        runReadOnlyTest(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if a gesture is in progress.
    suite('Gesture in progress', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testGestureInProgress(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if is is not deletable.
    suite('Block is not deletable', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testBlockIsNotDeletable(testCaseName, gamepadCombination);
      });
    });
  });

  suite('Delete Block', function() {
    setup(function() {
      const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
      this.workspace.getCursor().setCurNode(blockNode);
    });

    teardown(function() {
      sinon.restore();
    });

    const testCases = [['Left', GamepadCombination.LEFT]];

    // Delete a block.
    suite('Simple', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        test(testCaseName, function() {
          const deleteSpy = sinon.spy(Blockly, 'deleteBlock');
          const moveCursorSpy =
              sinon.spy(this.navigation, 'moveCursorOnBlockDelete');
          createNavigatorGetGamepadsStub(gamepadCombination);
          this.clock.runToFrame();
          sinon.assert.calledOnce(moveCursorSpy);
          sinon.assert.calledOnce(deleteSpy);
        });
      });
    });
    // Do not delete a block if workspace is in readOnly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        runReadOnlyTest(testCaseName, gamepadCombination);
      });
    });
  });

  suite('Cut', function() {
    const testCases = [['Right', GamepadCombination.RIGHT]];

    teardown(function() {
      sinon.restore();
    });

    // Cut block.
    suite('Cursor is not on a block', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        test(testCaseName, function() {
          const deleteSpy = sinon.spy(Blockly, 'deleteBlock');
          const copySpy = sinon.spy(Blockly, 'copy');
          const moveCursorSpy =
              sinon.spy(this.navigation, 'moveCursorOnBlockDelete');
          createNavigatorGetGamepadsStub(gamepadCombination);
          this.clock.runToFrame();
          sinon.assert.calledOnce(copySpy);
          sinon.assert.calledOnce(deleteSpy);
          sinon.assert.calledOnce(moveCursorSpy);
        });
      });
    });

    // Do not copy the block if the cursor is on the workspace.
    suite('Cursor is not on a block', function() {
      setup(function() {
        const workspaceNode = Blockly.ASTNode.createWorkspaceNode(
            this.workspace, new Blockly.utils.Coordinate(100, 100));
        this.workspace.getCursor().setCurNode(workspaceNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testCursorIsNotOnBlock(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if the block is a shadow block
    suite('Cursor is on a shadow block', function() {
      setup(function() {
        this.basicBlock.setShadow(true);
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testCursorOnShadowBlock(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if a workspace is in readonly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        runReadOnlyTest(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if a gesture is in progress.
    suite('Gesture in progress', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testGestureInProgress(testCaseName, gamepadCombination);
      });
    });

    // Do not copy a block if is is not deletable.
    suite('Block is not deletable', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        testBlockIsNotDeletable(testCaseName, gamepadCombination);
      });
    });
  });

  suite('Paste', function() {
    const testCases = [['Down', GamepadCombination.DOWN]];

    teardown(function() {
      sinon.restore();
    });

    // Paste block.
    suite('Simple', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const gamepadCombination = testCase[1];
        test(testCaseName, function() {
          const pasteSpy = sinon.stub(this.navigation, 'paste');
          createNavigatorGetGamepadsStub(gamepadCombination);
          this.clock.runToFrame();
          sinon.assert.calledOnce(pasteSpy);
        });
      });
    });
  });
});
