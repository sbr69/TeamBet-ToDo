'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { TODO_ABI, TODO_CONTRACT_ADDRESS } from '@/lib/abi';
import { useEffect } from 'react';

export interface Task {
    id: bigint;
    content: string;
    owner: `0x${string}`;
    ownerName: string;
    stakedAmount: bigint;
    deadline: bigint;
    isCompleted: boolean;
    isVerified: boolean;
    teamCode: `0x${string}`;
}

export interface TeamInfo {
    name: string;
    lead: `0x${string}`;
    leadName: string;
    memberCount: number;
    taskCount: number;
    partyFund: bigint;
}

export function useTeam(teamCode: `0x${string}` | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'getTeam',
        args: teamCode ? [teamCode] : undefined,
        query: { enabled: !!teamCode },
    });

    const { data: partyFund, refetch: refetchPartyFund } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'getTeamPartyFund',
        args: teamCode ? [teamCode] : undefined,
        query: { enabled: !!teamCode },
    });

    const { data: taskIds, refetch: refetchTaskIds } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'getTeamTaskIds',
        args: teamCode ? [teamCode] : undefined,
        query: { enabled: !!teamCode },
    });

    const { data: membersData, refetch: refetchMembers } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'getTeamMembers',
        args: teamCode ? [teamCode] : undefined,
        query: { enabled: !!teamCode },
    });

    const team: TeamInfo | undefined = data ? {
        name: (data as any)[0] as string,
        lead: (data as any)[1] as `0x${string}`,
        leadName: (data as any)[2] as string,
        memberCount: Number((data as any)[3]),
        taskCount: Number((data as any)[4]),
        partyFund: (data as any)[5] as bigint,
    } : undefined;

    const members = membersData ? {
        addresses: (membersData as any)[0] as `0x${string}`[],
        names: (membersData as any)[1] as string[],
    } : undefined;

    return {
        team,
        members,
        taskIds: (taskIds as bigint[]) ?? [],
        partyFund: (partyFund as bigint) ?? BigInt(0),
        isLoading,
        error,
        refetch: () => {
            refetch();
            refetchPartyFund();
            refetchTaskIds();
            refetchMembers();
        },
    };
}

export function useIsMember(teamCode: `0x${string}` | undefined, address: `0x${string}` | undefined) {
    const { data, isLoading } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'isMember',
        args: teamCode && address ? [teamCode, address] : undefined,
        query: { enabled: !!teamCode && !!address },
    });

    return { isMember: data as boolean | undefined, isLoading };
}

export function useUserTeams(address: `0x${string}` | undefined) {
    const { data, isLoading, refetch } = useReadContract({
        address: TODO_CONTRACT_ADDRESS,
        abi: TODO_ABI,
        functionName: 'getUserTeams',
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    return {
        teamCodes: (data as `0x${string}`[]) ?? [],
        isLoading,
        refetch,
    };
}

export function useTeamActions() {
    const {
        writeContract: writeCreateTeam,
        data: createTeamTxHash,
        isPending: isCreatingTeam,
        error: createTeamError,
        reset: resetCreateTeam,
    } = useWriteContract();

    const {
        writeContract: writeJoinTeam,
        data: joinTeamTxHash,
        isPending: isJoiningTeam,
        error: joinTeamError,
        reset: resetJoinTeam,
    } = useWriteContract();

    const {
        writeContract: writeLeaveTeam,
        data: leaveTeamTxHash,
        isPending: isLeavingTeam,
        error: leaveTeamError,
        reset: resetLeaveTeam,
    } = useWriteContract();

    const {
        writeContract: writeDeleteTeam,
        data: deleteTeamTxHash,
        isPending: isDeletingTeam,
        error: deleteTeamError,
        reset: resetDeleteTeam,
    } = useWriteContract();

    const { isLoading: isCreateTeamConfirming, isSuccess: isCreateTeamSuccess, data: createTeamReceipt } =
        useWaitForTransactionReceipt({ hash: createTeamTxHash });

    const { isLoading: isJoinTeamConfirming, isSuccess: isJoinTeamSuccess } =
        useWaitForTransactionReceipt({ hash: joinTeamTxHash });

    const { isLoading: isLeaveTeamConfirming, isSuccess: isLeaveTeamSuccess } =
        useWaitForTransactionReceipt({ hash: leaveTeamTxHash });

    const { isLoading: isDeleteTeamConfirming, isSuccess: isDeleteTeamSuccess } =
        useWaitForTransactionReceipt({ hash: deleteTeamTxHash });

    const createTeam = (teamName: string, memberName: string) => {
        writeCreateTeam({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'createTeam',
            args: [teamName, memberName],
        });
    };

    const joinTeam = (teamCode: `0x${string}`, memberName: string) => {
        writeJoinTeam({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'joinTeam',
            args: [teamCode, memberName],
        });
    };

    const leaveTeam = (teamCode: `0x${string}`) => {
        writeLeaveTeam({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'leaveTeam',
            args: [teamCode],
        });
    };

    const deleteTeam = (teamCode: `0x${string}`) => {
        writeDeleteTeam({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'deleteTeam',
            args: [teamCode],
        });
    };

    return {
        createTeam,
        isCreatingTeam: isCreatingTeam || isCreateTeamConfirming,
        isCreateTeamSuccess,
        createTeamError,
        createTeamReceipt,
        resetCreateTeam,

        joinTeam,
        isJoiningTeam: isJoiningTeam || isJoinTeamConfirming,
        isJoinTeamSuccess,
        joinTeamError,
        resetJoinTeam,

        leaveTeam,
        isLeavingTeam: isLeavingTeam || isLeaveTeamConfirming,
        isLeaveTeamSuccess,
        leaveTeamError,
        resetLeaveTeam,

        deleteTeam,
        isDeletingTeam: isDeletingTeam || isDeleteTeamConfirming,
        isDeleteTeamSuccess,
        deleteTeamError,
        resetDeleteTeam,
    };
}

export function useToDo(teamCode: `0x${string}` | undefined) {
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
    const { isLoading: isCompleteConfirming, isSuccess: isCompleteSuccess } = useWaitForTransactionReceipt({ hash: completeTxHash });
    const { isLoading: isVerifyConfirming, isSuccess: isVerifySuccess } = useWaitForTransactionReceipt({ hash: verifyTxHash });
    const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimTxHash });
    const { isLoading: isForfeitConfirming, isSuccess: isForfeitSuccess } = useWaitForTransactionReceipt({ hash: forfeitTxHash });
    const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawTxHash });

    const createTask = (content: string, deadline: bigint, stakeAmount: string) => {
        if (!teamCode) return;
        writeCreateTask({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'createTask',
            args: [teamCode, content, deadline],
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
        if (!teamCode) return;
        writeWithdrawPartyFund({
            address: TODO_CONTRACT_ADDRESS,
            abi: TODO_ABI,
            functionName: 'withdrawPartyFund',
            args: [teamCode],
        });
    };

    return {
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
