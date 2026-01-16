'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { TODO_ABI, TODO_CONTRACT_ADDRESS } from '@/lib/abi';
import { useEffect } from 'react';

export interface Task {
    id: bigint;
    content: string;
    owner: `0x${string}`;
    stakedAmount: bigint;
    deadline: bigint;
    isCompleted: boolean;
    isVerified: boolean;
}

// Main hook for ToDo contract interactions
export function useToDo() {
    // Read: Get total task count
    const { data: nextTaskId, refetch: refetchTaskCount } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'nextTaskId',
    });

    // Read: Get party fund
    const { data: partyFund, refetch: refetchPartyFund } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'partyFund',
    });

    // Read: Get team lead
    const { data: teamLead } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'teamLead',
    });

    // Read: Get min stake
    const { data: minStake } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'MIN_STAKE',
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

    // Write: Verify Task
    const {
        writeContract: writeVerifyTask,
        data: verifyTxHash,
        isPending: isVerifying,
        error: verifyError,
        reset: resetVerify,
    } = useWriteContract();

    // Write: Claim Stake
    const {
        writeContract: writeClaimStake,
        data: claimTxHash,
        isPending: isClaiming,
        error: claimError,
        reset: resetClaim,
    } = useWriteContract();

    // Write: Forfeit Stake
    const {
        writeContract: writeForfeitStake,
        data: forfeitTxHash,
        isPending: isForfeiting,
        error: forfeitError,
        reset: resetForfeit,
    } = useWriteContract();

    // Write: Withdraw Party Fund
    const {
        writeContract: writeWithdrawPartyFund,
        data: withdrawTxHash,
        isPending: isWithdrawing,
        error: withdrawError,
        reset: resetWithdraw,
    } = useWriteContract();

    // Transaction receipts
    const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } =
        useWaitForTransactionReceipt({ hash: createTxHash });

    const { isLoading: isCompleteConfirming, isSuccess: isCompleteSuccess } =
        useWaitForTransactionReceipt({ hash: completeTxHash });

    const { isLoading: isVerifyConfirming, isSuccess: isVerifySuccess } =
        useWaitForTransactionReceipt({ hash: verifyTxHash });

    const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } =
        useWaitForTransactionReceipt({ hash: claimTxHash });

    const { isLoading: isForfeitConfirming, isSuccess: isForfeitSuccess } =
        useWaitForTransactionReceipt({ hash: forfeitTxHash });

    const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } =
        useWaitForTransactionReceipt({ hash: withdrawTxHash });

    // Refetch on successful transactions
    useEffect(() => {
        if (isCreateSuccess || isCompleteSuccess || isVerifySuccess || isClaimSuccess || isForfeitSuccess || isWithdrawSuccess) {
            refetchTaskCount();
            refetchPartyFund();
        }
    }, [isCreateSuccess, isCompleteSuccess, isVerifySuccess, isClaimSuccess, isForfeitSuccess, isWithdrawSuccess, refetchTaskCount, refetchPartyFund]);

    // Create task function (payable)
    const createTask = (content: string, deadline: bigint, stakeAmount: string) => {
        writeCreateTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'createTask',
            args: [content, deadline],
            value: parseEther(stakeAmount),
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

    // Verify task function (team lead only)
    const verifyTask = (taskId: bigint) => {
        writeVerifyTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'verifyTask',
            args: [taskId],
        });
    };

    // Claim stake function
    const claimStake = (taskId: bigint) => {
        writeClaimStake({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'claimStake',
            args: [taskId],
        });
    };

    // Forfeit stake function
    const forfeitStake = (taskId: bigint) => {
        writeForfeitStake({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'forfeitStake',
            args: [taskId],
        });
    };

    // Withdraw party fund function
    const withdrawPartyFund = () => {
        writeWithdrawPartyFund({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'withdrawPartyFund',
        });
    };

    return {
        // Data
        taskCount: nextTaskId ? Number(nextTaskId) : 0,
        partyFund: partyFund ?? BigInt(0),
        teamLead: teamLead as `0x${string}` | undefined,
        minStake: minStake ?? BigInt(0),

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

        // Verify Task
        verifyTask,
        isVerifying: isVerifying || isVerifyConfirming,
        isVerifySuccess,
        verifyError,
        resetVerify,

        // Claim Stake
        claimStake,
        isClaiming: isClaiming || isClaimConfirming,
        isClaimSuccess,
        claimError,
        resetClaim,

        // Forfeit Stake
        forfeitStake,
        isForfeiting: isForfeiting || isForfeitConfirming,
        isForfeitSuccess,
        forfeitError,
        resetForfeit,

        // Withdraw Party Fund
        withdrawPartyFund,
        isWithdrawing: isWithdrawing || isWithdrawConfirming,
        isWithdrawSuccess,
        withdrawError,
        resetWithdraw,

        // Refetch
        refetch: () => {
            refetchTaskCount();
            refetchPartyFund();
        },
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
