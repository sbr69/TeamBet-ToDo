'use client';

import { motion } from 'framer-motion';
import { Clock, User, Coins, CheckCircle2, AlertCircle, Loader2, Shield, Timer } from 'lucide-react';
import { clsx } from 'clsx';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

export interface Task {
    id: bigint;
    content: string;
    owner: `0x${string}`;
    stakedAmount: bigint;
    deadline: bigint;
    isCompleted: boolean;
    isVerified: boolean;
}

interface TaskCardProps {
    task: Task;
    index: number;
    isTeamLead?: boolean;
    onComplete?: (taskId: bigint) => void;
    onVerify?: (taskId: bigint) => void;
    onClaim?: (taskId: bigint) => void;
    onForfeit?: (taskId: bigint) => void;
    isCompleting?: boolean;
    isVerifying?: boolean;
    isClaiming?: boolean;
    isForfeiting?: boolean;
}

function getTaskStatus(task: Task, isDeadlinePassed: boolean) {
    if (task.isVerified) {
        return {
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            border: 'border-green-400/30',
            icon: CheckCircle2,
            label: 'Verified',
        };
    }
    if (task.isCompleted) {
        return {
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/30',
            icon: Clock,
            label: 'Awaiting Verification',
        };
    }
    if (isDeadlinePassed) {
        return {
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            border: 'border-red-400/30',
            icon: AlertCircle,
            label: 'Expired',
        };
    }
    return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/30',
        icon: Timer,
        label: 'In Progress',
    };
}

function formatDeadline(deadline: bigint): string {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getTimeRemaining(deadline: bigint): string {
    const now = Date.now();
    const deadlineMs = Number(deadline) * 1000;
    const diff = deadlineMs - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h left`;
    if (hours > 0) return `${hours}h left`;

    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m left`;
}

export function TaskCard({
    task,
    index,
    isTeamLead = false,
    onComplete,
    onVerify,
    onClaim,
    onForfeit,
    isCompleting,
    isVerifying,
    isClaiming,
    isForfeiting
}: TaskCardProps) {
    const { address } = useAccount();
    const isOwner = address && address.toLowerCase() === task.owner.toLowerCase();
    const isDeadlinePassed = Date.now() > Number(task.deadline) * 1000;
    const status = getTaskStatus(task, isDeadlinePassed);
    const StatusIcon = status.icon;

    const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const canComplete = isOwner && !task.isCompleted && !isDeadlinePassed;
    const canVerify = isTeamLead && task.isCompleted && !task.isVerified;
    const canClaim = isOwner && task.isVerified && task.stakedAmount > BigInt(0) && !isDeadlinePassed;
    const canForfeit = isDeadlinePassed && !task.isVerified && task.stakedAmount > BigInt(0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={clsx(
                'group relative p-5 rounded-2xl border transition-all duration-300',
                'bg-zinc-900/50 backdrop-blur-sm border-zinc-800',
                'hover:border-zinc-700 hover:bg-zinc-900/80'
            )}
        >
            {/* Status Badge */}
            <div
                className={clsx(
                    'absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                    status.bg, status.color, status.border, 'border'
                )}
            >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
            </div>

            {/* Task ID */}
            <span className="text-xs text-zinc-500 mb-1 block">Task #{task.id.toString()}</span>

            {/* Task Content */}
            <h3 className="text-lg font-semibold text-white pr-28 mb-3 line-clamp-2">
                {task.content}
            </h3>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-zinc-400">
                    <User className="w-4 h-4" />
                    <span>{truncateAddress(task.owner)}</span>
                    {isOwner && <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">You</span>}
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-medium">{formatEther(task.stakedAmount)} MNT</span>
                </div>

                <div className={clsx('flex items-center gap-1.5', isDeadlinePassed ? 'text-red-400' : 'text-zinc-400')}>
                    <Clock className="w-4 h-4" />
                    <span>{isDeadlinePassed ? 'Expired' : getTimeRemaining(task.deadline)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
                {/* Complete Button - Owner only, before completion */}
                {canComplete && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onComplete?.(task.id)}
                        disabled={isCompleting}
                        className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {isCompleting ? 'Completing...' : 'Mark Done'}
                    </motion.button>
                )}

                {/* Verify Button - Team lead only */}
                {canVerify && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onVerify?.(task.id)}
                        disabled={isVerifying}
                        className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        {isVerifying ? 'Verifying...' : 'Verify'}
                    </motion.button>
                )}

                {/* Claim Stake Button - Owner only, after verification */}
                {canClaim && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onClaim?.(task.id)}
                        disabled={isClaiming}
                        className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                        {isClaiming ? 'Claiming...' : 'Claim Stake'}
                    </motion.button>
                )}

                {/* Forfeit Stake Button - Anyone, after deadline */}
                {canForfeit && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onForfeit?.(task.id)}
                        disabled={isForfeiting}
                        className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isForfeiting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                        {isForfeiting ? 'Forfeiting...' : 'Forfeit Stake'}
                    </motion.button>
                )}
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}
