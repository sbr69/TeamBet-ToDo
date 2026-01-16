// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ToDo
 * @author TeamBet-ToDo
 * @notice Micro-incentive task management - stake MNT, complete before deadline, or fund the party!
 */
contract ToDo {
    struct Task {
        uint256 id;
        string content;
        address owner;
        uint256 stakedAmount;
        uint256 deadline;
        bool isCompleted;
        bool isVerified;
    }

    // ============ State Variables ============

    uint256 public nextTaskId;
    mapping(uint256 => Task) public tasks;
    
    address public teamLead;
    uint256 public partyFund;
    
    uint256 public constant MIN_STAKE = 0.001 ether; // 0.001 MNT

    // ============ Events ============

    event TaskCreated(
        uint256 indexed taskId,
        string content,
        address indexed owner,
        uint256 stakedAmount,
        uint256 deadline
    );
    event TaskCompleted(uint256 indexed taskId, address indexed owner);
    event TaskVerified(uint256 indexed taskId, address indexed verifier);
    event StakeClaimed(uint256 indexed taskId, address indexed owner, uint256 amount);
    event StakeForfeited(uint256 indexed taskId, uint256 amount);
    event PartyFundWithdrawn(address indexed to, uint256 amount);
    event TeamLeadTransferred(address indexed oldLead, address indexed newLead);

    // ============ Errors ============

    error NotTaskOwner();
    error NotTeamLead();
    error TaskDoesNotExist();
    error EmptyContent();
    error InsufficientStake();
    error DeadlineInPast();
    error TaskNotCompleted();
    error TaskAlreadyVerified();
    error TaskNotVerified();
    error DeadlineNotPassed();
    error StakeAlreadyClaimed();
    error NoFundsToWithdraw();
    error TransferFailed();

    // ============ Modifiers ============

    modifier onlyTaskOwner(uint256 _taskId) {
        if (tasks[_taskId].owner == address(0)) revert TaskDoesNotExist();
        if (tasks[_taskId].owner != msg.sender) revert NotTaskOwner();
        _;
    }

    modifier onlyTeamLead() {
        if (msg.sender != teamLead) revert NotTeamLead();
        _;
    }

    // ============ Constructor ============

    constructor(address _teamLead) {
        teamLead = _teamLead;
    }

    // ============ External Functions ============

    /**
     * @notice Creates a new task with staked MNT
     * @param _content Task description
     * @param _deadline Unix timestamp for deadline
     */
    function createTask(string memory _content, uint256 _deadline) external payable returns (uint256 taskId) {
        if (bytes(_content).length == 0) revert EmptyContent();
        if (msg.value < MIN_STAKE) revert InsufficientStake();
        if (_deadline <= block.timestamp) revert DeadlineInPast();

        taskId = nextTaskId++;

        tasks[taskId] = Task({
            id: taskId,
            content: _content,
            owner: msg.sender,
            stakedAmount: msg.value,
            deadline: _deadline,
            isCompleted: false,
            isVerified: false
        });

        emit TaskCreated(taskId, _content, msg.sender, msg.value, _deadline);
    }

    /**
     * @notice Owner marks task as completed (awaiting team lead verification)
     * @param _taskId Task ID to complete
     */
    function completeTask(uint256 _taskId) external onlyTaskOwner(_taskId) {
        Task storage task = tasks[_taskId];
        task.isCompleted = true;

        emit TaskCompleted(_taskId, msg.sender);
    }

    /**
     * @notice Team lead verifies a completed task
     * @param _taskId Task ID to verify
     */
    function verifyTask(uint256 _taskId) external onlyTeamLead {
        Task storage task = tasks[_taskId];
        if (task.owner == address(0)) revert TaskDoesNotExist();
        if (!task.isCompleted) revert TaskNotCompleted();
        if (task.isVerified) revert TaskAlreadyVerified();

        task.isVerified = true;

        emit TaskVerified(_taskId, msg.sender);
    }

    /**
     * @notice Owner claims stake back after verification (must be before deadline)
     * @param _taskId Task ID to claim stake from
     */
    function claimStake(uint256 _taskId) external onlyTaskOwner(_taskId) {
        Task storage task = tasks[_taskId];
        if (!task.isVerified) revert TaskNotVerified();
        if (task.stakedAmount == 0) revert StakeAlreadyClaimed();
        if (block.timestamp > task.deadline) revert DeadlineNotPassed(); // Can't claim if past deadline

        uint256 amount = task.stakedAmount;
        task.stakedAmount = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit StakeClaimed(_taskId, msg.sender, amount);
    }

    /**
     * @notice Forfeit expired task stake to party fund (anyone can call)
     * @param _taskId Task ID to forfeit
     */
    function forfeitStake(uint256 _taskId) external {
        Task storage task = tasks[_taskId]; 
        if (task.owner == address(0)) revert TaskDoesNotExist();
        if (block.timestamp <= task.deadline) revert DeadlineNotPassed();
        if (task.stakedAmount == 0) revert StakeAlreadyClaimed();
        // Only forfeit if NOT verified before deadline
        // If verified, the owner should claim; if they didn't, it still goes to party fund
        
        uint256 amount = task.stakedAmount;
        task.stakedAmount = 0;
        partyFund += amount;

        emit StakeForfeited(_taskId, amount);
    }

    /**
     * @notice Team lead withdraws party fund
     */
    function withdrawPartyFund() external onlyTeamLead {
        if (partyFund == 0) revert NoFundsToWithdraw();

        uint256 amount = partyFund;
        partyFund = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PartyFundWithdrawn(msg.sender, amount);
    }

    /**
     * @notice Transfer team lead role
     * @param _newLead New team lead address
     */
    function transferTeamLead(address _newLead) external onlyTeamLead {
        address oldLead = teamLead;
        teamLead = _newLead;

        emit TeamLeadTransferred(oldLead, _newLead);
    }

    // ============ View Functions ============

    function getTask(uint256 _taskId) external view returns (Task memory) {
        if (tasks[_taskId].owner == address(0)) revert TaskDoesNotExist();
        return tasks[_taskId];
    }

    function isDeadlinePassed(uint256 _taskId) external view returns (bool) {
        return block.timestamp > tasks[_taskId].deadline;
    }
}
