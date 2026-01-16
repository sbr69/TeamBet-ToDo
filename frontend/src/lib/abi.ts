// ToDo Contract ABI - Generated from contracts/out/ToDo.sol/ToDo.json
export const TODO_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const; // TODO: Replace with deployed address

export const TODO_ABI = [
    {
        type: 'function',
        name: 'completeTask',
        inputs: [{ name: '_taskId', type: 'uint256', internalType: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'createTask',
        inputs: [{ name: '_content', type: 'string', internalType: 'string' }],
        outputs: [{ name: 'taskId', type: 'uint256', internalType: 'uint256' }],
        stateMutability: 'nonpayable',
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
                    { name: 'isCompleted', type: 'bool', internalType: 'bool' },
                ],
            },
        ],
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
        name: 'tasks',
        inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
        outputs: [
            { name: 'id', type: 'uint256', internalType: 'uint256' },
            { name: 'content', type: 'string', internalType: 'string' },
            { name: 'owner', type: 'address', internalType: 'address' },
            { name: 'isCompleted', type: 'bool', internalType: 'bool' },
        ],
        stateMutability: 'view',
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
        name: 'TaskCreated',
        inputs: [
            { name: 'taskId', type: 'uint256', indexed: true, internalType: 'uint256' },
            { name: 'content', type: 'string', indexed: false, internalType: 'string' },
            { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
        ],
        anonymous: false,
    },
    { type: 'error', name: 'EmptyContent', inputs: [] },
    { type: 'error', name: 'NotTaskOwner', inputs: [] },
    { type: 'error', name: 'TaskDoesNotExist', inputs: [] },
] as const;
