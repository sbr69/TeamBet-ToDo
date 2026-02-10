// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ToDo {
    struct Task {
        uint256 id;
        string content;
        address owner;
        string ownerName;
        uint256 stakedAmount;
        uint256 deadline;
        bool isCompleted;
        bool isVerified;
        bytes32 teamCode;
    }

    struct Team {
        bytes32 code;
        string name;
        address lead;
        string leadName;
        address[] members;
        uint256[] taskIds;
        uint256 partyFund;
        bool exists;
    }

    uint256 public nextTaskId;
    uint256 public teamCount;
    uint256 public constant MIN_STAKE = 0.001 ether;

    mapping(uint256 => Task) public tasks;
    mapping(bytes32 => Team) public teams;
    mapping(bytes32 => mapping(address => string)) public memberNames;
    mapping(bytes32 => mapping(address => bool)) public isMember;
    mapping(address => bytes32[]) public userTeams;

    bytes32[] public allTeamCodes;

    event TeamCreated(bytes32 indexed teamCode, string name, address indexed lead, string leadName);
    event MemberJoined(bytes32 indexed teamCode, address indexed member, string memberName);
    event MemberLeft(bytes32 indexed teamCode, address indexed member);
    event TeamDeleted(bytes32 indexed teamCode, address indexed lead);
    event TaskCreated(uint256 indexed taskId, bytes32 indexed teamCode, string content, address indexed owner, string ownerName, uint256 stakedAmount, uint256 deadline);
    event TaskCompleted(uint256 indexed taskId, address indexed owner);
    event TaskVerified(uint256 indexed taskId, address indexed verifier);
    event StakeClaimed(uint256 indexed taskId, address indexed owner, uint256 amount);
    event StakeForfeited(uint256 indexed taskId, uint256 amount);
    event PartyFundWithdrawn(bytes32 indexed teamCode, address indexed to, uint256 amount);
    event TeamLeadTransferred(bytes32 indexed teamCode, address indexed oldLead, address indexed newLead);

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
    error TeamDoesNotExist();
    error AlreadyMember();
    error NotAMember();
    error EmptyName();
    error TeamAlreadyExists();
    error TeamHasActiveTasks();
    error TeamHasFunds();
    error MemberHasPendingTasks();
    error CannotLeaveAsLead();

    modifier onlyTaskOwner(uint256 _taskId) {
        if (tasks[_taskId].owner == address(0)) revert TaskDoesNotExist();
        if (tasks[_taskId].owner != msg.sender) revert NotTaskOwner();
        _;
    }

    modifier onlyTeamLead(bytes32 _teamCode) {
        if (!teams[_teamCode].exists) revert TeamDoesNotExist();
        if (msg.sender != teams[_teamCode].lead) revert NotTeamLead();
        _;
    }

    modifier onlyMember(bytes32 _teamCode) {
        if (!teams[_teamCode].exists) revert TeamDoesNotExist();
        if (!isMember[_teamCode][msg.sender]) revert NotAMember();
        _;
    }

    function createTeam(string memory _teamName, string memory _memberName) external returns (bytes32 teamCode) {
        if (bytes(_teamName).length == 0) revert EmptyName();
        if (bytes(_memberName).length == 0) revert EmptyName();

        teamCode = keccak256(abi.encodePacked(_teamName, msg.sender, block.timestamp, teamCount));

        if (teams[teamCode].exists) revert TeamAlreadyExists();

        Team storage team = teams[teamCode];
        team.code = teamCode;
        team.name = _teamName;
        team.lead = msg.sender;
        team.leadName = _memberName;
        team.exists = true;
        team.members.push(msg.sender);

        memberNames[teamCode][msg.sender] = _memberName;
        isMember[teamCode][msg.sender] = true;
        allTeamCodes.push(teamCode);
        userTeams[msg.sender].push(teamCode);
        teamCount++;

        emit TeamCreated(teamCode, _teamName, msg.sender, _memberName);
    }

    function joinTeam(bytes32 _teamCode, string memory _memberName) external {
        if (!teams[_teamCode].exists) revert TeamDoesNotExist();
        if (isMember[_teamCode][msg.sender]) revert AlreadyMember();
        if (bytes(_memberName).length == 0) revert EmptyName();

        teams[_teamCode].members.push(msg.sender);
        memberNames[_teamCode][msg.sender] = _memberName;
        isMember[_teamCode][msg.sender] = true;
        userTeams[msg.sender].push(_teamCode);

        emit MemberJoined(_teamCode, msg.sender, _memberName);
    }

    function leaveTeam(bytes32 _teamCode) external onlyMember(_teamCode) {
        if (msg.sender == teams[_teamCode].lead) revert CannotLeaveAsLead();

        // Check member has no pending tasks (stakedAmount > 0)
        uint256[] storage taskIds = teams[_teamCode].taskIds;
        for (uint256 i = 0; i < taskIds.length; i++) {
            Task storage task = tasks[taskIds[i]];
            if (task.owner == msg.sender && task.stakedAmount > 0) {
                revert MemberHasPendingTasks();
            }
        }

        // Remove from members array
        address[] storage members = teams[_teamCode].members;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == msg.sender) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }

        isMember[_teamCode][msg.sender] = false;
        delete memberNames[_teamCode][msg.sender];
        _removeUserTeam(msg.sender, _teamCode);

        emit MemberLeft(_teamCode, msg.sender);
    }

    function deleteTeam(bytes32 _teamCode) external onlyTeamLead(_teamCode) {
        Team storage team = teams[_teamCode];

        // Check no active tasks (all stakes must be 0)
        for (uint256 i = 0; i < team.taskIds.length; i++) {
            if (tasks[team.taskIds[i]].stakedAmount > 0) {
                revert TeamHasActiveTasks();
            }
        }

        // Party fund must be 0
        if (team.partyFund > 0) revert TeamHasFunds();

        // Remove team from all members' userTeams
        for (uint256 i = 0; i < team.members.length; i++) {
            address member = team.members[i];
            isMember[_teamCode][member] = false;
            delete memberNames[_teamCode][member];
            _removeUserTeam(member, _teamCode);
        }

        // Remove from allTeamCodes
        for (uint256 i = 0; i < allTeamCodes.length; i++) {
            if (allTeamCodes[i] == _teamCode) {
                allTeamCodes[i] = allTeamCodes[allTeamCodes.length - 1];
                allTeamCodes.pop();
                break;
            }
        }

        delete teams[_teamCode];
        emit TeamDeleted(_teamCode, msg.sender);
    }

    function createTask(bytes32 _teamCode, string memory _content, uint256 _deadline) external payable onlyMember(_teamCode) returns (uint256 taskId) {
        if (bytes(_content).length == 0) revert EmptyContent();
        if (msg.value < MIN_STAKE) revert InsufficientStake();
        if (_deadline <= block.timestamp) revert DeadlineInPast();

        taskId = nextTaskId++;
        string memory ownerName = memberNames[_teamCode][msg.sender];

        tasks[taskId] = Task({
            id: taskId,
            content: _content,
            owner: msg.sender,
            ownerName: ownerName,
            stakedAmount: msg.value,
            deadline: _deadline,
            isCompleted: false,
            isVerified: false,
            teamCode: _teamCode
        });

        teams[_teamCode].taskIds.push(taskId);
        emit TaskCreated(taskId, _teamCode, _content, msg.sender, ownerName, msg.value, _deadline);
    }

    function completeTask(uint256 _taskId) external onlyTaskOwner(_taskId) {
        Task storage task = tasks[_taskId];
        task.isCompleted = true;
        emit TaskCompleted(_taskId, msg.sender);
    }

    function verifyTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        if (task.owner == address(0)) revert TaskDoesNotExist();
        if (!task.isCompleted) revert TaskNotCompleted();
        if (task.isVerified) revert TaskAlreadyVerified();
        if (msg.sender != teams[task.teamCode].lead) revert NotTeamLead();

        task.isVerified = true;
        emit TaskVerified(_taskId, msg.sender);
    }

    function claimStake(uint256 _taskId) external onlyTaskOwner(_taskId) {
        Task storage task = tasks[_taskId];
        if (!task.isVerified) revert TaskNotVerified();
        if (task.stakedAmount == 0) revert StakeAlreadyClaimed();
        if (block.timestamp > task.deadline) revert DeadlineNotPassed();

        uint256 amount = task.stakedAmount;
        task.stakedAmount = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit StakeClaimed(_taskId, msg.sender, amount);
    }

    function forfeitStake(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        if (task.owner == address(0)) revert TaskDoesNotExist();
        if (block.timestamp <= task.deadline) revert DeadlineNotPassed();
        if (task.stakedAmount == 0) revert StakeAlreadyClaimed();

        uint256 amount = task.stakedAmount;
        task.stakedAmount = 0;
        teams[task.teamCode].partyFund += amount;
        emit StakeForfeited(_taskId, amount);
    }

    function withdrawPartyFund(bytes32 _teamCode) external onlyTeamLead(_teamCode) {
        if (teams[_teamCode].partyFund == 0) revert NoFundsToWithdraw();

        uint256 amount = teams[_teamCode].partyFund;
        teams[_teamCode].partyFund = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PartyFundWithdrawn(_teamCode, msg.sender, amount);
    }

    function transferTeamLead(bytes32 _teamCode, address _newLead) external onlyTeamLead(_teamCode) {
        if (!isMember[_teamCode][_newLead]) revert NotAMember();
        address oldLead = teams[_teamCode].lead;
        teams[_teamCode].lead = _newLead;
        teams[_teamCode].leadName = memberNames[_teamCode][_newLead];
        emit TeamLeadTransferred(_teamCode, oldLead, _newLead);
    }

    // Internal helpers
    function _removeUserTeam(address _user, bytes32 _teamCode) internal {
        bytes32[] storage userTeamList = userTeams[_user];
        for (uint256 i = 0; i < userTeamList.length; i++) {
            if (userTeamList[i] == _teamCode) {
                userTeamList[i] = userTeamList[userTeamList.length - 1];
                userTeamList.pop();
                break;
            }
        }
    }

    // View functions
    function getTask(uint256 _taskId) external view returns (Task memory) {
        if (tasks[_taskId].owner == address(0)) revert TaskDoesNotExist();
        return tasks[_taskId];
    }

    function getTeam(bytes32 _teamCode) external view returns (
        string memory name,
        address lead,
        string memory leadName,
        uint256 memberCount,
        uint256 taskCount_,
        uint256 partyFund_
    ) {
        if (!teams[_teamCode].exists) revert TeamDoesNotExist();
        Team storage team = teams[_teamCode];
        return (team.name, team.lead, team.leadName, team.members.length, team.taskIds.length, team.partyFund);
    }

    function getTeamMembers(bytes32 _teamCode) external view returns (address[] memory, string[] memory) {
        if (!teams[_teamCode].exists) revert TeamDoesNotExist();
        address[] memory members = teams[_teamCode].members;
        string[] memory names = new string[](members.length);
        for (uint256 i = 0; i < members.length; i++) {
            names[i] = memberNames[_teamCode][members[i]];
        }
        return (members, names);
    }

    function getTeamTaskIds(bytes32 _teamCode) external view returns (uint256[] memory) {
        if (!teams[_teamCode].exists) revert TeamDoesNotExist();
        return teams[_teamCode].taskIds;
    }

    function getMemberName(bytes32 _teamCode, address _member) external view returns (string memory) {
        return memberNames[_teamCode][_member];
    }

    function isDeadlinePassed(uint256 _taskId) external view returns (bool) {
        return block.timestamp > tasks[_taskId].deadline;
    }

    function getTeamPartyFund(bytes32 _teamCode) external view returns (uint256) {
        if (!teams[_teamCode].exists) revert TeamDoesNotExist();
        return teams[_teamCode].partyFund;
    }

    function getUserTeams(address _user) external view returns (bytes32[] memory) {
        return userTeams[_user];
    }
}
