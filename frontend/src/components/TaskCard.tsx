'use client';

import { motion } from 'framer-motion';
import { Clock, User, Coins, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string;
    stakedAmount: string;
    deadline: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

interface TaskCardProps {
    task: Task;
    index: number;
}

const statusConfig = {
    pending: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/30',
        icon: Clock,
        label: 'Pending',
    },
    'in-progress': {
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/30',
        icon: AlertCircle,
        label: 'In Progress',
    },
    completed: {
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-400/30',
        icon: CheckCircle2,
        label: 'Completed',
    },
    failed: {
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/30',
        icon: AlertCircle,
        label: 'Failed',
    },
};

export function TaskCard({ task, index }: TaskCardProps) {
    const status = statusConfig[task.status];
    const StatusIcon = status.icon;

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

            {/* Task Title */}
            <h3 className="text-lg font-semibold text-white pr-28 mb-2">
                {task.title}
            </h3>

            {/* Task Description */}
            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                {task.description}
            </p>

            {/* Task Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[120px]">{task.assignee}</span>
                </div>

                <div className="flex items-center gap-2 text-emerald-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-medium">{task.stakedAmount} MNT</span>
                </div>

                <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4" />
                    <span>{task.deadline}</span>
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}
