'use client';

import { motion } from 'framer-motion';
import { Clock, User, Coins, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useAccount } from 'wagmi';

export interface Task {
    id: bigint;
    content: string;
    owner: `0x${string}`;
    isCompleted: boolean;
}

interface TaskCardProps {
    task: Task;
    index: number;
    onComplete?: (taskId: bigint) => void;
    isCompleting?: boolean;
}

const statusConfig = {
    pending: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/30',
        icon: Clock,
        label: 'Pending',
    },
    completed: {
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-400/30',
        icon: CheckCircle2,
        label: 'Completed',
    },
};

export function TaskCard({ task, index, onComplete, isCompleting }: TaskCardProps) {
    const { address } = useAccount();
    const status = task.isCompleted ? statusConfig.completed : statusConfig.pending;
    const StatusIcon = status.icon;
    const isOwner = address && address.toLowerCase() === task.owner.toLowerCase();

    const handleComplete = () => {
        if (onComplete && !task.isCompleted && isOwner) {
            onComplete(task.id);
        }
    };

    // Truncate address for display
    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

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
                    status.bg,
                    status.color,
                    status.border,
                    'border'
                )}
            >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
            </div>

            {/* Task ID */}
            <span className="text-xs text-zinc-500 mb-1 block">Task #{task.id.toString()}</span>

            {/* Task Content */}
            <h3 className="text-lg font-semibold text-white pr-28 mb-2 line-clamp-2">
                {task.content}
            </h3>

            {/* Task Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
                <div className="flex items-center gap-2 text-zinc-400">
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[120px]" title={task.owner}>
                        {truncateAddress(task.owner)}
                    </span>
                    {isOwner && (
                        <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                            You
                        </span>
                    )}
                </div>
            </div>

            {/* Complete Button */}
            {!task.isCompleted && isOwner && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className={clsx(
                        'mt-4 w-full py-2.5 rounded-xl font-medium text-sm transition-all',
                        'bg-gradient-to-r from-green-500 to-emerald-600',
                        'hover:from-green-600 hover:to-emerald-700',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'flex items-center justify-center gap-2'
                    )}
                >
                    {isCompleting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Completing...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Complete
                        </>
                    )}
                </motion.button>
            )}

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}
