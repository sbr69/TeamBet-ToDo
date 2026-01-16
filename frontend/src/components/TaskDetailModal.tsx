'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Coins, CheckCircle2, AlertCircle, Shield, Timer, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { formatEther } from 'viem';
import { Task } from './TaskCard';
import { useEffect } from 'react';

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    isTeamLead?: boolean;
    isOwner?: boolean;
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
        year: 'numeric',
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

export function TaskDetailModal({
    task,
    isOpen,
    onClose,
    isTeamLead = false,
    isOwner = false,
    onComplete,
    onVerify,
    onClaim,
    onForfeit,
    isCompleting,
    isVerifying,
    isClaiming,
    isForfeiting
}: TaskDetailModalProps) {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            return () => {
                // Restore scroll position
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    if (!task) return null;

    const isDeadlinePassed = Date.now() > Number(task.deadline) * 1000;
    const status = getTaskStatus(task, isDeadlinePassed);
    const StatusIcon = status.icon;

    const canComplete = isOwner && !task.isCompleted && !isDeadlinePassed;
    const canVerify = isTeamLead && task.isCompleted && !task.isVerified;
    const canClaim = isOwner && task.isVerified && task.stakedAmount > BigInt(0) && !isDeadlinePassed;
    const canForfeit = isDeadlinePassed && !task.isVerified && task.stakedAmount > BigInt(0);
    const hasActions = canComplete || canVerify || canClaim || canForfeit;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container - Full screen on mobile, centered on larger screens */}
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={clsx(
                                'relative w-full bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden flex flex-col',
                                // Mobile: bottom sheet style
                                'max-h-[90vh] rounded-t-3xl border-t border-x',
                                // Tablet and up: centered modal
                                'sm:max-w-lg sm:max-h-[85vh] sm:rounded-2xl sm:border sm:mx-4',
                                // Large screens
                                'lg:max-w-xl'
                            )}
                        >
                            {/* Drag Handle for Mobile */}
                            <div className="sm:hidden flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-zinc-600 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10 px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-zinc-500">Task #{task.id.toString()}</span>
                                            <div
                                                className={clsx(
                                                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                                                    status.bg, status.color, status.border, 'border'
                                                )}
                                            >
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="shrink-0 p-2 -mr-2 rounded-xl hover:bg-zinc-800 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-zinc-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4 pb-6">
                                {/* Full Task Description */}
                                <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
                                    <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Task Description</h3>
                                    <p className="text-white text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">
                                        {task.content}
                                    </p>
                                </div>

                                {/* Quick Stats Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Staked Amount */}
                                    <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-xs text-zinc-500">Stake</span>
                                        </div>
                                        <span className="text-lg sm:text-xl font-bold text-emerald-400">
                                            {formatEther(task.stakedAmount)}
                                        </span>
                                        <span className="text-xs text-emerald-400/70 ml-1">MNT</span>
                                    </div>

                                    {/* Time Remaining */}
                                    <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Clock className={clsx('w-3.5 h-3.5', isDeadlinePassed ? 'text-red-400' : 'text-zinc-400')} />
                                            <span className="text-xs text-zinc-500">Time</span>
                                        </div>
                                        <span className={clsx(
                                            'text-lg sm:text-xl font-bold',
                                            isDeadlinePassed ? 'text-red-400' : 'text-white'
                                        )}>
                                            {getTimeRemaining(task.deadline)}
                                        </span>
                                    </div>
                                </div>

                                {/* Owner Info */}
                                <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-zinc-400" />
                                            <span className="text-sm text-zinc-400">Owner</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white font-mono">
                                                {task.owner.slice(0, 6)}...{task.owner.slice(-4)}
                                            </span>
                                            {isOwner && (
                                                <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div className="p-3 rounded-xl bg-zinc-800/30 border border-zinc-700/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-4 h-4 text-zinc-400" />
                                        <span className="text-sm text-zinc-400">Deadline</span>
                                    </div>
                                    <span className="text-sm text-white">
                                        {formatDeadline(task.deadline)}
                                    </span>
                                </div>
                            </div>

                            {/* Sticky Action Buttons */}
                            {hasActions && (
                                <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                        {canComplete && (
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onComplete?.(task.id)}
                                                disabled={isCompleting}
                                                className="flex-1 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-blue-500 to-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {isCompleting ? 'Completing...' : 'Mark Done'}
                                            </motion.button>
                                        )}

                                        {canVerify && (
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onVerify?.(task.id)}
                                                disabled={isVerifying}
                                                className="flex-1 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-500 to-pink-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <Shield className="w-4 h-4" />
                                                {isVerifying ? 'Verifying...' : 'Verify'}
                                            </motion.button>
                                        )}

                                        {canClaim && (
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onClaim?.(task.id)}
                                                disabled={isClaiming}
                                                className="flex-1 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <Coins className="w-4 h-4" />
                                                {isClaiming ? 'Claiming...' : 'Claim Stake'}
                                            </motion.button>
                                        )}

                                        {canForfeit && (
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => onForfeit?.(task.id)}
                                                disabled={isForfeiting}
                                                className="flex-1 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-red-500 to-rose-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                {isForfeiting ? 'Forfeiting...' : 'Forfeit'}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
