// ToDo Contract ABI - Generated from contracts/out/ToDo.sol/ToDo.json
// Enhanced version with staking, deadlines, team lead, and party fund

export const TODO_CONTRACT_ADDRESS = '0x13F13f18630af4780A46CB5F9c34Fc9202b4b31d' as const; // Deployed on Mantle Sepolia

export const TODO_ABI = [
    // Constructor (for reference)
    {
        type: 'constructor',
        inputs: [{ name: '_teamLead', type: 'address', internalType: 'address' }],
        stateMutability: 'nonpayable',
    },
    // Read Functions
    {
        type: 'function',
        name: 'MIN_STAKE',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'nextTaskId',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'partyFund',
        inputs: [],
        outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'teamLead',
        inputs: [],
        outputs: [{ name: '', type: 'address', internalType: 'address' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getTask',
        inputs: [{ name: '_taskId', type: 'uint256', internalType: 'uint256' }],
        outputs: [
            {
                name: '',
                type: 'tuple',
                internalType: 'struct ToDo.Task',
                components: [
                    { name: 'id', type: 'uint256', internalType: 'uint256' },
                    { name: 'content', type: 'string', internalType: 'string' },
                    { name: 'owner', type: 'address', internalType: 'address' },
                    { name: 'stakedAmount', type: 'uint256', internalType: 'uint256' },
                    { name: 'deadline', type: 'uint256', internalType: 'uint256' },
                    { name: 'isCompleted', type: 'bool', internalType: 'bool' },
                    { name: 'isVerified', type: 'bool', internalType: 'bool' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isDeadlinePassed',
        inputs: [{ name: '_taskId', type: 'uint256', internalType: 'uint256' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'tasks',
        inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        outputs: [
            { name: 'id', type: 'uint256', internalType: 'uint256' },
            { name: 'content', type: 'string', internalType: 'string' },
            { name: 'owner', type: 'address', internalType: 'address' },
            { name: 'stakedAmount', type: 'uint256', internalType: 'uint256' },
            { name: 'deadline', type: 'uint256', internalType: 'uint256' },
            { name: 'isCompleted', type: 'bool', internalType: 'bool' },
            { name: 'isVerified', type: 'bool', internalType: 'bool' },
        ],
        stateMutability: 'view',
    },
    // Write Functions
    {
        type: 'function',
        name: 'createTask',
        inputs: [
            { name: '_content', type: 'string', internalType: 'string' },
            { name: '_deadline', type: 'uint256', internalType: 'uint256' },
        ],
        outputs: [{ name: 'taskId', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'completeTask',
        inputs: [{ name: '_taskId', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'verifyTask',
        inputs: [{ name: '_taskId', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'claimStake',
        inputs: [{ name: '_taskId', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'forfeitStake',
        inputs: [{ name: '_taskId', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'withdrawPartyFund',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'transferTeamLead',
        inputs: [{ name: '_newLead', type: 'address', internalType: 'address' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    // Events
    {
        type: 'event',
        name: 'TaskCreated',
        inputs: [
            { name: 'taskId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'content', type: 'string', indexed: false, internalType: 'string' },
            { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
            { name: 'stakedAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
            { name: 'deadline', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'TaskCompleted',
        inputs: [
            { name: 'taskId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'TaskVerified',
        inputs: [
            { name: 'taskId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'verifier', type: 'address', indexed: true, internalType: 'address' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'StakeClaimed',
        inputs: [
            { name: 'taskId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
            { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'StakeForfeited',
        inputs: [
            { name: 'taskId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'PartyFundWithdrawn',
        inputs: [
            { name: 'to', type: 'address', indexed: true, internalType: 'address' },
            { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
        ],
        anonymous: false,
    },
    {
        type: 'event',
        name: 'TeamLeadTransferred',
        inputs: [
            { name: 'oldLead', type: 'address', indexed: true, internalType: 'address' },
            { name: 'newLead', type: 'address', indexed: true, internalType: 'address' },
        ],
        anonymous: false,
    },
    // Errors
    { type: 'error', name: 'DeadlineInPast', inputs: [] },
    { type: 'error', name: 'DeadlineNotPassed', inputs: [] },
    { type: 'error', name: 'EmptyContent', inputs: [] },
    { type: 'error', name: 'InsufficientStake', inputs: [] },
    { type: 'error', name: 'NoFundsToWithdraw', inputs: [] },
    { type: 'error', name: 'NotTaskOwner', inputs: [] },
    { type: 'error', name: 'NotTeamLead', inputs: [] },
    { type: 'error', name: 'StakeAlreadyClaimed', inputs: [] },
    { type: 'error', name: 'TaskAlreadyVerified', inputs: [] },
    { type: 'error', name: 'TaskDoesNotExist', inputs: [] },
    { type: 'error', name: 'TaskNotCompleted', inputs: [] },
    { type: 'error', name: 'TaskNotVerified', inputs: [] },
    { type: 'error', name: 'TransferFailed', inputs: [] },
] as const;

// Minimum stake constant (0.001 MNT = 1e15 wei)
export const MIN_STAKE = BigInt('1000000000000000'); // 0.001 ether
