'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { TODO_ABI, TODO_CONTRACT_ADDRESS } from '@/lib/abi';
import { useEffect, useState } from 'react';

export interface Task {
    id: bigint;
    content: string;
    owner: `0x${string}`;
    isCompleted: boolean;
}

export function useToDo() {
    const [tasks, setTasks] = useState<Task[]>([]);

    // Read: Get total task count
    const { data: nextTaskId, refetch: refetchTaskCount } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'nextTaskId',
    });

    // Write: Create Task
    const {
        writeContract: writeCreateTask,
        data: createTxHash,
        isPending: isCreating,
        error: createError,
        reset: resetCreate,
    } = useWriteContract();

    // Write: Complete Task
    const {
        writeContract: writeCompleteTask,
        data: completeTxHash,
        isPending: isCompleting,
        error: completeError,
        reset: resetComplete,
    } = useWriteContract();

    // Wait for create transaction
    const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } =
        useWaitForTransactionReceipt({
            hash: createTxHash,
        });

    // Wait for complete transaction
    const { isLoading: isCompleteConfirming, isSuccess: isCompleteSuccess } =
        useWaitForTransactionReceipt({
            hash: completeTxHash,
        });

    // Fetch all tasks when nextTaskId changes
    useEffect(() => {
        async function fetchTasks() {
            if (!nextTaskId || nextTaskId === BigInt(0)) {
                setTasks([]);
                return;
            }

            const fetchedTasks: Task[] = [];
            for (let i = BigInt(0); i < nextTaskId; i++) {
                // We'll use individual reads - in production, consider multicall
                fetchedTasks.push({
                    id: i,
                    content: '',
                    owner: '0x0000000000000000000000000000000000000000',
                    isCompleted: false,
                });
            }
            setTasks(fetchedTasks);
        }

        fetchTasks();
    }, [nextTaskId]);

    // Refetch on successful transactions
    useEffect(() => {
        if (isCreateSuccess || isCompleteSuccess) {
            refetchTaskCount();
        }
    }, [isCreateSuccess, isCompleteSuccess, refetchTaskCount]);

    // Create task function
    const createTask = (content: string) => {
        writeCreateTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'createTask',
            args: [content],
        });
    };

    // Complete task function
    const completeTask = (taskId: bigint) => {
        writeCompleteTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'completeTask',
            args: [taskId],
        });
    };

    return {
        // Data
        tasks,
        taskCount: nextTaskId ? Number(nextTaskId) : 0,

        // Create Task
        createTask,
        isCreating: isCreating || isCreateConfirming,
        isCreateSuccess,
        createError,
        resetCreate,

        // Complete Task
        completeTask,
        isCompleting: isCompleting || isCompleteConfirming,
        isCompleteSuccess,
        completeError,
        resetComplete,

        // Refetch
        refetch: refetchTaskCount,
    };
}

// Hook to read a single task
export function useTask(taskId: bigint | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'getTask',
        args: taskId !== undefined ? [taskId] : undefined,
        query: {
            enabled: taskId !== undefined,
        },
    });

    return {
        task: data as Task | undefined,
        isLoading,
        error,
        refetch,
    };
}
