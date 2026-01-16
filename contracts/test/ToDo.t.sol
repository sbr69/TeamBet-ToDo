// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ToDo} from "../src/ToDo.sol";

contract ToDoTest is Test {
    ToDo public todo;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        todo = new ToDo();
    }

    // ============ createTask Tests ============

    function test_CreateTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask("Complete Solidity audit");

        assertEq(taskId, 0);
        
        ToDo.Task memory task = todo.getTask(taskId);
        assertEq(task.id, 0);
        assertEq(task.content, "Complete Solidity audit");
        assertEq(task.owner, alice);
        assertEq(task.isCompleted, false);
    }

    function test_CreateTask_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit ToDo.TaskCreated(0, "Test task", alice);

        vm.prank(alice);
        todo.createTask("Test task");
    }

    function test_CreateTask_IncrementsId() public {
        vm.startPrank(alice);
        
        uint256 taskId1 = todo.createTask("Task 1");
        uint256 taskId2 = todo.createTask("Task 2");
        uint256 taskId3 = todo.createTask("Task 3");

        assertEq(taskId1, 0);
        assertEq(taskId2, 1);
        assertEq(taskId3, 2);
        assertEq(todo.nextTaskId(), 3);

        vm.stopPrank();
    }

    function test_RevertWhen_CreateTaskWithEmptyContent() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.EmptyContent.selector);
        todo.createTask("");
    }

    // ============ completeTask Tests ============

    function test_CompleteTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask("Task to complete");

        vm.prank(alice);
        todo.completeTask(taskId);

        ToDo.Task memory task = todo.getTask(taskId);
        assertTrue(task.isCompleted);
    }

    function test_CompleteTask_EmitsEvent() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask("Task to complete");

        vm.expectEmit(true, true, false, false);
        emit ToDo.TaskCompleted(taskId, alice);

        vm.prank(alice);
        todo.completeTask(taskId);
    }

    function test_RevertWhen_NonOwnerCompletesTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask("Alice's task");

        vm.prank(bob);
        vm.expectRevert(ToDo.NotTaskOwner.selector);
        todo.completeTask(taskId);
    }

    function test_RevertWhen_CompletingNonExistentTask() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.TaskDoesNotExist.selector);
        todo.completeTask(999);
    }

    // ============ getTask Tests ============

    function test_RevertWhen_GettingNonExistentTask() public {
        vm.expectRevert(ToDo.TaskDoesNotExist.selector);
        todo.getTask(999);
    }
}
