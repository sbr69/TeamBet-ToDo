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

export function useToDo() {
    const { data: nextTaskId, refetch: refetchTaskCount } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'nextTaskId',
    });

    const { data: partyFund, refetch: refetchPartyFund } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'partyFund',
    });

    const { data: teamLead } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'teamLead',
    });

    const { data: minStake } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'MIN_STAKE',
    });

    const {
        writeContract: writeCreateTask,
        data: createTxHash,
        isPending: isCreating,
        error: createError,
        reset: resetCreate,
    } = useWriteContract();

    const {
        writeContract: writeCompleteTask,
        data: completeTxHash,
        isPending: isCompleting,
        error: completeError,
        reset: resetComplete,
    } = useWriteContract();

    const {
        writeContract: writeVerifyTask,
        data: verifyTxHash,
        isPending: isVerifying,
        error: verifyError,
        reset: resetVerify,
    } = useWriteContract();

    const {
        writeContract: writeClaimStake,
        data: claimTxHash,
        isPending: isClaiming,
        error: claimError,
        reset: resetClaim,
    } = useWriteContract();

    const {
        writeContract: writeForfeitStake,
        data: forfeitTxHash,
        isPending: isForfeiting,
        error: forfeitError,
        reset: resetForfeit,
    } = useWriteContract();

    const {
        writeContract: writeWithdrawPartyFund,
        data: withdrawTxHash,
        isPending: isWithdrawing,
        error: withdrawError,
        reset: resetWithdraw,
    } = useWriteContract();

    const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ hash: createTxHash });

    const { isLoading: isCompleteConfirming, isSuccess: isCompleteSuccess } =
        useWaitForTransactionReceipt({ hash: completeTxHash });

    const { isLoading: isVerifyConfirming, isSuccess: isVerifySuccess } =
        useWaitForTransactionReceipt({ hash: verifyTxHash });

    const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } =
        useWaitForTransactionReceipt({ hash: claimTxHash });

    const { isLoading: isForfeitConfirming, isSuccess: isForfeitSuccess } =
        useWaitForTransactionReceipt({ hash: forfeitTxHash });

    const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash });

    useEffect(() => {
        if (isCreateSuccess || isCompleteSuccess || isVerifySuccess || isClaimSuccess || isForfeitSuccess || isWithdrawSuccess) {
            refetchTaskCount();
            refetchPartyFund();
        }
    }, [isCreateSuccess, isCompleteSuccess, isVerifySuccess, isClaimSuccess, isForfeitSuccess, isWithdrawSuccess, refetchTaskCount, refetchPartyFund]);

    const createTask = (content: string, deadline: bigint, stakeAmount: string) => {
        writeCreateTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'createTask',
            args: [content, deadline],
            value: parseEther(stakeAmount),
        });
    };

    const completeTask = (taskId: bigint) => {
        writeCompleteTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'completeTask',
            args: [taskId],
        });
    };

    const verifyTask = (taskId: bigint) => {
        writeVerifyTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'verifyTask',
            args: [taskId],
        });
    };

    const claimStake = (taskId: bigint) => {
        writeClaimStake({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'claimStake',
            args: [taskId],
        });
    };

    const forfeitStake = (taskId: bigint) => {
        writeForfeitStake({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'forfeitStake',
            args: [taskId],
        });
    };

    const withdrawPartyFund = () => {
        writeWithdrawPartyFund({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'withdrawPartyFund',
        });
    };

    return {
        taskCount: nextTaskId ? Number(nextTaskId) : 0,
        partyFund: partyFund ?? BigInt(0),
        teamLead: teamLead as `0x${string}` | undefined,
        minStake: minStake ?? BigInt(0),

        createTask,
        isCreating: isCreating || isCreateConfirming,
        isCreateSuccess,
        createError,
        resetCreate,

        completeTask,
        isCompleting: isCompleting || isCompleteConfirming,
        isCompleteSuccess,
        completeError,
        resetComplete,

        verifyTask,
        isVerifying: isVerifying || isVerifyConfirming,
        isVerifySuccess,
        verifyError,
        resetVerify,

        claimStake,
        isClaiming: isClaiming || isClaimConfirming,
        isClaimSuccess,
        claimError,
        resetClaim,

        forfeitStake,
        isForfeiting: isForfeiting || isForfeitConfirming,
        isForfeitSuccess,
        forfeitError,
        resetForfeit,

        withdrawPartyFund,
        isWithdrawing: isWithdrawing || isWithdrawConfirming,
        isWithdrawSuccess,
        withdrawError,
        resetWithdraw,

        refetch: () => {
            refetchTaskCount();
            refetchPartyFund();
        },
    };
}

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
