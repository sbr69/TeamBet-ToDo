// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ToDo
 * @author TeamBet-ToDo
 * @notice A micro-incentive task management contract where team members stake MNT on tasks.
 * @dev Tasks that are not completed before deadline forfeit stakes to the team party fund.
 */
contract ToDo {
    // ============ Structs ============

    struct Task {
        uint256 id;
        string content;
        address owner;
        bool isCompleted;
    }

    // ============ State Variables ============

    /// @notice Counter for generating unique task IDs
    uint256 public nextTaskId;

    /// @notice Mapping from task ID to Task struct
    mapping(uint256 => Task) public tasks;

    // ============ Events ============

    /// @notice Emitted when a new task is created
    /// @param taskId The unique identifier of the task
    /// @param content The description/content of the task
    /// @param owner The address of the task creator
    event TaskCreated(uint256 indexed taskId, string content, address indexed owner);

    /// @notice Emitted when a task is marked as completed
    /// @param taskId The unique identifier of the completed task
    /// @param owner The address of the task owner
    event TaskCompleted(uint256 indexed taskId, address indexed owner);

    // ============ Errors ============

    /// @notice Thrown when a non-owner tries to modify a task
    error NotTaskOwner();

    /// @notice Thrown when trying to access a non-existent task
    error TaskDoesNotExist();

    /// @notice Thrown when task content is empty
    error EmptyContent();

    // ============ Modifiers ============

    /// @notice Ensures the caller is the owner of the specified task
    /// @param _taskId The ID of the task to check ownership
    modifier onlyTaskOwner(uint256 _taskId) {
        if (tasks[_taskId].owner == address(0)) revert TaskDoesNotExist();
        if (tasks[_taskId].owner != msg.sender) revert NotTaskOwner();
        _;
    }

    // ============ External Functions ============

    /**
     * @notice Creates a new task with the given content
     * @param _content The description/content of the task
     * @return taskId The unique identifier assigned to the new task
     */
    function createTask(string memory _content) external returns (uint256 taskId) {
        if (bytes(_content).length == 0) revert EmptyContent();

        taskId = nextTaskId++;

        tasks[taskId] = Task({
            id: taskId,
            content: _content,
            owner: msg.sender,
            isCompleted: false
        });

        emit TaskCreated(taskId, _content, msg.sender);
    }

    /**
     * @notice Marks a task as completed
     * @dev Only the task owner can complete their task
     * @param _taskId The ID of the task to complete
     */
    function completeTask(uint256 _taskId) external onlyTaskOwner(_taskId) {
        tasks[_taskId].isCompleted = true;

        emit TaskCompleted(_taskId, msg.sender);
    }

    // ============ View Functions ============

    /**
     * @notice Retrieves a task by its ID
     * @param _taskId The ID of the task to retrieve
     * @return The Task struct containing task details
     */
    function getTask(uint256 _taskId) external view returns (Task memory) {
        if (tasks[_taskId].owner == address(0)) revert TaskDoesNotExist();
        return tasks[_taskId];
    }
}
