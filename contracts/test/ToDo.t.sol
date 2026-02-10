// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ToDo} from "../src/ToDo.sol";

contract ToDoTest is Test {
    ToDo public todo;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    uint256 public constant MIN_STAKE = 0.001 ether;
    uint256 public constant ONE_DAY = 1 days;

    bytes32 public teamCode;

    function setUp() public {
        todo = new ToDo();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);

        vm.prank(alice);
        teamCode = todo.createTeam("Alpha Squad", "Alice");

        vm.prank(bob);
        todo.joinTeam(teamCode, "Bob");
    }

    // ============ Team Tests ============

    function test_CreateTeam() public view {
        (string memory name, address lead, string memory leadName, uint256 memberCount, , ) = todo.getTeam(teamCode);
        assertEq(name, "Alpha Squad");
        assertEq(lead, alice);
        assertEq(leadName, "Alice");
        assertEq(memberCount, 2);
    }

    function test_JoinTeam() public view {
        assertTrue(todo.isMember(teamCode, bob));
        assertEq(todo.getMemberName(teamCode, bob), "Bob");
    }

    function test_RevertWhen_JoinWithEmptyName() public {
        vm.prank(charlie);
        vm.expectRevert(ToDo.EmptyName.selector);
        todo.joinTeam(teamCode, "");
    }

    function test_RevertWhen_AlreadyMember() public {
        vm.prank(bob);
        vm.expectRevert(ToDo.AlreadyMember.selector);
        todo.joinTeam(teamCode, "Bob2");
    }

    function test_RevertWhen_JoinNonExistentTeam() public {
        vm.prank(charlie);
        vm.expectRevert(ToDo.TeamDoesNotExist.selector);
        todo.joinTeam(bytes32(uint256(999)), "Charlie");
    }

    // ============ getUserTeams Tests ============

    function test_GetUserTeams() public view {
        bytes32[] memory aliceTeams = todo.getUserTeams(alice);
        assertEq(aliceTeams.length, 1);
        assertEq(aliceTeams[0], teamCode);

        bytes32[] memory bobTeams = todo.getUserTeams(bob);
        assertEq(bobTeams.length, 1);
        assertEq(bobTeams[0], teamCode);
    }

    function test_GetUserTeams_Multiple() public {
        vm.prank(alice);
        bytes32 teamCode2 = todo.createTeam("Bravo Squad", "Alice");

        bytes32[] memory aliceTeams = todo.getUserTeams(alice);
        assertEq(aliceTeams.length, 2);
        assertEq(aliceTeams[0], teamCode);
        assertEq(aliceTeams[1], teamCode2);
    }

    // ============ leaveTeam Tests ============

    function test_LeaveTeam() public {
        vm.prank(bob);
        todo.leaveTeam(teamCode);

        assertFalse(todo.isMember(teamCode, bob));

        bytes32[] memory bobTeams = todo.getUserTeams(bob);
        assertEq(bobTeams.length, 0);

        (, , , uint256 memberCount, , ) = todo.getTeam(teamCode);
        assertEq(memberCount, 1);
    }

    function test_RevertWhen_LeadTriesToLeave() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.CannotLeaveAsLead.selector);
        todo.leaveTeam(teamCode);
    }

    function test_RevertWhen_LeaveWithPendingTask() public {
        vm.prank(bob);
        todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(bob);
        vm.expectRevert(ToDo.MemberHasPendingTasks.selector);
        todo.leaveTeam(teamCode);
    }

    function test_LeaveTeam_AfterClaimingStake() public {
        vm.prank(bob);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(bob);
        todo.completeTask(taskId);

        vm.prank(alice);
        todo.verifyTask(taskId);

        vm.prank(bob);
        todo.claimStake(taskId);

        // Now bob can leave since stake is 0
        vm.prank(bob);
        todo.leaveTeam(teamCode);

        assertFalse(todo.isMember(teamCode, bob));
    }

    // ============ deleteTeam Tests ============

    function test_DeleteTeam() public {
        // Remove bob first so only alice remains (or delete with both)
        vm.prank(alice);
        todo.deleteTeam(teamCode);

        bytes32[] memory aliceTeams = todo.getUserTeams(alice);
        assertEq(aliceTeams.length, 0);

        bytes32[] memory bobTeams = todo.getUserTeams(bob);
        assertEq(bobTeams.length, 0);

        assertFalse(todo.isMember(teamCode, alice));
        assertFalse(todo.isMember(teamCode, bob));
    }

    function test_RevertWhen_NonLeadDeletesTeam() public {
        vm.prank(bob);
        vm.expectRevert(ToDo.NotTeamLead.selector);
        todo.deleteTeam(teamCode);
    }

    function test_RevertWhen_DeleteTeamWithActiveTasks() public {
        vm.prank(bob);
        todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        vm.expectRevert(ToDo.TeamHasActiveTasks.selector);
        todo.deleteTeam(teamCode);
    }

    function test_RevertWhen_DeleteTeamWithPartyFund() public {
        vm.prank(bob);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);
        todo.forfeitStake(taskId);

        vm.prank(alice);
        vm.expectRevert(ToDo.TeamHasFunds.selector);
        todo.deleteTeam(teamCode);
    }

    function test_DeleteTeam_AfterAllSettled() public {
        vm.prank(bob);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);
        todo.forfeitStake(taskId);

        vm.prank(alice);
        todo.withdrawPartyFund(teamCode);

        // Now can delete
        vm.prank(alice);
        todo.deleteTeam(teamCode);

        assertFalse(todo.isMember(teamCode, alice));
    }

    // ============ createTask Tests ============

    function test_CreateTask() public {
        uint256 deadline = block.timestamp + ONE_DAY;

        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Complete audit", deadline);

        ToDo.Task memory task = todo.getTask(taskId);
        assertEq(task.id, 0);
        assertEq(task.content, "Complete audit");
        assertEq(task.owner, alice);
        assertEq(keccak256(bytes(task.ownerName)), keccak256(bytes("Alice")));
        assertEq(task.stakedAmount, MIN_STAKE);
        assertEq(task.deadline, deadline);
        assertFalse(task.isCompleted);
        assertFalse(task.isVerified);
        assertEq(task.teamCode, teamCode);
    }

    function test_RevertWhen_NonMemberCreatesTask() public {
        vm.prank(charlie);
        vm.expectRevert(ToDo.NotAMember.selector);
        todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);
    }

    function test_RevertWhen_InsufficientStake() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.InsufficientStake.selector);
        todo.createTask{value: 0.0001 ether}(teamCode, "Task", block.timestamp + ONE_DAY);
    }

    function test_RevertWhen_DeadlineInPast() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.DeadlineInPast.selector);
        todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp - 1);
    }

    function test_RevertWhen_EmptyContent() public {
        vm.prank(alice);
        vm.expectRevert(ToDo.EmptyContent.selector);
        todo.createTask{value: MIN_STAKE}(teamCode, "", block.timestamp + ONE_DAY);
    }

    // ============ completeTask Tests ============

    function test_CompleteTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        todo.completeTask(taskId);

        ToDo.Task memory task = todo.getTask(taskId);
        assertTrue(task.isCompleted);
    }

    function test_RevertWhen_NonOwnerCompletes() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(bob);
        vm.expectRevert(ToDo.NotTaskOwner.selector);
        todo.completeTask(taskId);
    }

    // ============ verifyTask Tests ============

    function test_VerifyTask() public {
        vm.prank(bob);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(bob);
        todo.completeTask(taskId);

        vm.prank(alice);
        todo.verifyTask(taskId);

        ToDo.Task memory task = todo.getTask(taskId);
        assertTrue(task.isVerified);
    }

    function test_RevertWhen_NonLeadVerifies() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        todo.completeTask(taskId);

        vm.prank(bob);
        vm.expectRevert(ToDo.NotTeamLead.selector);
        todo.verifyTask(taskId);
    }

    function test_RevertWhen_VerifyingIncompleteTask() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        vm.expectRevert(ToDo.TaskNotCompleted.selector);
        todo.verifyTask(taskId);
    }

    // ============ claimStake Tests ============

    function test_ClaimStake() public {
        uint256 deadline = block.timestamp + ONE_DAY;

        vm.prank(bob);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", deadline);

        vm.prank(bob);
        todo.completeTask(taskId);

        vm.prank(alice);
        todo.verifyTask(taskId);

        uint256 balanceBefore = bob.balance;

        vm.prank(bob);
        todo.claimStake(taskId);

        assertEq(bob.balance, balanceBefore + MIN_STAKE);
        assertEq(todo.getTask(taskId).stakedAmount, 0);
    }

    function test_RevertWhen_ClaimingUnverified() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.prank(alice);
        todo.completeTask(taskId);

        vm.prank(alice);
        vm.expectRevert(ToDo.TaskNotVerified.selector);
        todo.claimStake(taskId);
    }

    // ============ forfeitStake Tests ============

    function test_ForfeitStake() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);

        todo.forfeitStake(taskId);

        assertEq(todo.getTeamPartyFund(teamCode), MIN_STAKE);
        assertEq(todo.getTask(taskId).stakedAmount, 0);
    }

    function test_RevertWhen_ForfeitBeforeDeadline() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.expectRevert(ToDo.DeadlineNotPassed.selector);
        todo.forfeitStake(taskId);
    }

    // ============ withdrawPartyFund Tests ============

    function test_WithdrawPartyFund() public {
        vm.prank(bob);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);
        todo.forfeitStake(taskId);

        uint256 balanceBefore = alice.balance;

        vm.prank(alice);
        todo.withdrawPartyFund(teamCode);

        assertEq(alice.balance, balanceBefore + MIN_STAKE);
        assertEq(todo.getTeamPartyFund(teamCode), 0);
    }

    function test_RevertWhen_NonLeadWithdraws() public {
        vm.prank(alice);
        uint256 taskId = todo.createTask{value: MIN_STAKE}(teamCode, "Task", block.timestamp + ONE_DAY);

        vm.warp(block.timestamp + ONE_DAY + 1);
        todo.forfeitStake(taskId);

        vm.prank(bob);
        vm.expectRevert(ToDo.NotTeamLead.selector);
        todo.withdrawPartyFund(teamCode);
    }

    // ============ Full Flow Tests ============

    function test_FullSuccessFlow() public {
        uint256 deadline = block.timestamp + ONE_DAY;
        vm.prank(bob);
        uint256 taskId = todo.createTask{value: 0.1 ether}(teamCode, "Build feature", deadline);

        vm.prank(bob);
        todo.completeTask(taskId);

        vm.prank(alice);
        todo.verifyTask(taskId);

        uint256 bobBalanceBefore = bob.balance;
        vm.prank(bob);
        todo.claimStake(taskId);

        assertEq(bob.balance, bobBalanceBefore + 0.1 ether);
        assertEq(todo.getTeamPartyFund(teamCode), 0);
    }

    function test_FullForfeitFlow() public {
        uint256 deadline = block.timestamp + ONE_DAY;
        vm.prank(bob);
        uint256 taskId = todo.createTask{value: 0.1 ether}(teamCode, "Build feature", deadline);

        vm.warp(deadline + 1);
        todo.forfeitStake(taskId);

        uint256 leadBalanceBefore = alice.balance;
        vm.prank(alice);
        todo.withdrawPartyFund(teamCode);

        assertEq(alice.balance, leadBalanceBefore + 0.1 ether);
        assertEq(todo.getTeamPartyFund(teamCode), 0);
    }

    // ============ View Tests ============

    function test_GetTeamMembers() public {
        vm.prank(charlie);
        todo.joinTeam(teamCode, "Charlie");

        (address[] memory members, string[] memory names) = todo.getTeamMembers(teamCode);
        assertEq(members.length, 3);
        assertEq(members[0], alice);
        assertEq(members[1], bob);
        assertEq(members[2], charlie);
        assertEq(keccak256(bytes(names[0])), keccak256(bytes("Alice")));
        assertEq(keccak256(bytes(names[1])), keccak256(bytes("Bob")));
        assertEq(keccak256(bytes(names[2])), keccak256(bytes("Charlie")));
    }

    function test_GetTeamTaskIds() public {
        vm.prank(alice);
        todo.createTask{value: MIN_STAKE}(teamCode, "Task 1", block.timestamp + ONE_DAY);

        vm.prank(bob);
        todo.createTask{value: MIN_STAKE}(teamCode, "Task 2", block.timestamp + ONE_DAY);

        uint256[] memory taskIds = todo.getTeamTaskIds(teamCode);
        assertEq(taskIds.length, 2);
        assertEq(taskIds[0], 0);
        assertEq(taskIds[1], 1);
    }
}
