// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ToDo} from "../src/ToDo.sol";

contract ToDoTest is Test {
    ToDo public todo;
    address public teamLead = makeAddr("teamLead");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    uint256 public constant MIN_STAKE = 0.001 ether;
    uint256 public constant ONE_DAY = 1 days;

    function setUp() public {
        todo = new ToDo(teamLead);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // ============ createTask Tests ============

    function test_CreateTask() public {
        uint256 deadline = block.timestamp + ONE_DAY;
        
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Complete audit", deadline);

        ToDo.Task memory task = todo.getTask(taskId);
        assertEq(task.id, 0);
        assertEq(task.content, "Complete audit");
        assertEq(task.owner, alice);
        assertEq(task.stakedAmount, MIN_STAKE);
        assertEq(task.deadline, deadline);
        assertFalse(task.isCompleted);
        assertFalse(task.isVerified);
    }

    function test_CreateTask_EmitsEvent() public {
        uint256 deadline = block.timestamp + ONE_DAY;

        vm.expectEmit(true, true, false, true);
        emit ToDo.TaskCreated(0, "Test task", alice, MIN_STAKE, deadline);

        vm.prank(alice);
        todo.createTask{value: MIN_STAKE}("Test task", deadline);
    }

    function test_RevertWhen_InsufficientStake() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.InsufficientStake.selector);
        todo.createTask{value: 0.0001 ether}("Task", block.timestamp + ONE_DAY);
    }

    function test_RevertWhen_DeadlineInPast() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.DeadlineInPast.selector);
        todo.createTask{value: MIN_STAKE}("Task", block.timestamp - 1);
    }

    function test_RevertWhen_EmptyContent() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.EmptyContent.selector);
        todo.createTask{value: MIN_STAKE}("", block.timestamp + ONE_DAY);
    }

    // ============ completeTask Tests ============

    function test_CompleteTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        todo.completeTask(taskId);

        ToDo.Task memory task = todo.getTask(taskId);
        assertTrue(task.isCompleted);
    }

    function test_RevertWhen_NonOwnerCompletes() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.prank(bob);
        vm.expectRevert(ToDo.NotTaskOwner.selector);
        todo.completeTask(taskId);
    }

    // ============ verifyTask Tests ============

    function test_VerifyTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        todo.completeTask(taskId);

        vm.prank(teamLead);
        todo.verifyTask(taskId);

        ToDo.Task memory task = todo.getTask(taskId);
        assertTrue(task.isVerified);
    }

    function test_RevertWhen_NonLeadVerifies() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        todo.completeTask(taskId);

        vm.prank(bob);
        vm.expectRevert(ToDo.NotTeamLead.selector);
        todo.verifyTask(taskId);
    }

    function test_RevertWhen_VerifyingIncompleteTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.prank(teamLead);
        vm.expectRevert(ToDo.TaskNotCompleted.selector);
        todo.verifyTask(taskId);
    }

    // ============ claimStake Tests ============

    function test_ClaimStake() public {
        uint256 deadline = block.timestamp + ONE_DAY;
        
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", deadline);

        vm.prank(alice);
        todo.completeTask(taskId);

        vm.prank(teamLead);
        todo.verifyTask(taskId);

        uint256 balanceBefore = alice.balance;
        
        vm.prank(alice);
        todo.claimStake(taskId);

        assertEq(alice.balance, balanceBefore + MIN_STAKE);
        assertEq(todo.getTask(taskId).stakedAmount, 0);
    }

    function test_RevertWhen_ClaimingUnverified() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        todo.completeTask(taskId);

        vm.prank(alice);
        vm.expectRevert(ToDo.TaskNotVerified.selector);
        todo.claimStake(taskId);
    }

    // ============ forfeitStake Tests ============

    function test_ForfeitStake() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        // Warp past deadline
        vm.warp(block.timestamp + ONE_DAY + 1);

        todo.forfeitStake(taskId);

        assertEq(todo.partyFund(), MIN_STAKE);
        assertEq(todo.getTask(taskId).stakedAmount, 0);
    }

    function test_RevertWhen_ForfeitBeforeDeadline() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.expectRevert(ToDo.DeadlineNotPassed.selector);
        todo.forfeitStake(taskId);
    }

    // ============ withdrawPartyFund Tests ============

    function test_WithdrawPartyFund() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);
        todo.forfeitStake(taskId);

        uint256 balanceBefore = teamLead.balance;

        vm.prank(teamLead);
        todo.withdrawPartyFund();

        assertEq(teamLead.balance, balanceBefore + MIN_STAKE);
        assertEq(todo.partyFund(), 0);
    }

    function test_RevertWhen_NonLeadWithdraws() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}("Task", block.timestamp + ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);
        todo.forfeitStake(taskId);

        vm.prank(bob);
        vm.expectRevert(ToDo.NotTeamLead.selector);
        todo.withdrawPartyFund();
    }

    // ============ Full Flow Test ============

    function test_FullSuccessFlow() public {
        // 1. Alice creates task
        uint256 deadline = block.timestamp + ONE_DAY;
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: 0.1 ether}("Build feature", deadline);

        // 2. Alice completes task
        vm.prank(alice);
        todo.completeTask(taskId);

        // 3. Team lead verifies
        vm.prank(teamLead);
        todo.verifyTask(taskId);

        // 4. Alice claims stake
        uint256 aliceBalanceBefore = alice.balance;
        vm.prank(alice);
        todo.claimStake(taskId);

        // Assertions
        assertEq(alice.balance, aliceBalanceBefore + 0.1 ether);
        assertEq(todo.partyFund(), 0);
    }

    function test_FullForfeitFlow() public {
        // 1. Alice creates task
        uint256 deadline = block.timestamp + ONE_DAY;
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: 0.1 ether}("Build feature", deadline);

        // 2. Time passes, deadline expires
        vm.warp(deadline + 1);

        // 3. Anyone forfeits the stake
        todo.forfeitStake(taskId);

        // 4. Team lead withdraws party fund
        uint256 leadBalanceBefore = teamLead.balance;
        vm.prank(teamLead);
        todo.withdrawPartyFund();

        // Assertions
        assertEq(teamLead.balance, leadBalanceBefore + 0.1 ether);
        assertEq(todo.partyFund(), 0);
    }
}
