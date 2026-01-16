'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, FileText, Loader2, Coins, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string, deadline: bigint, stakeAmount: string) => void;
    isCreating: boolean;
    isSuccess: boolean;
    error: Error | null;
    onReset: () => void;
    minStake: bigint;
}

export function CreateTaskModal({
    isOpen,
    onClose,
    onSubmit,
    isCreating,
    isSuccess,
    error,
    onReset,
    minStake
}: CreateTaskModalProps) {
    const [content, setContent] = useState('');
    const [stakeAmount, setStakeAmount] = useState('0.001');
    const [deadlineDate, setDeadlineDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('');
    const { showToast, updateToast } = useToast();
    const [toastId, setToastId] = useState<string | null>(null);

    // Set default deadline to tomorrow
    useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDeadlineDate(tomorrow.toISOString().split('T')[0]);
            setDeadlineTime('12:00');
        }
    }, [isOpen]);

    // Handle success
    useEffect(() => {
        if (isSuccess) {
            if (toastId) {
                updateToast(toastId, 'success', 'Task Created!', `Staked ${stakeAmount} MNT`);
            }
            setContent('');
            setStakeAmount('0.001');
            setToastId(null);
            onReset();
            onClose();
        }
    }, [isSuccess, toastId, stakeAmount, updateToast, onReset, onClose]);

    // Handle error
    useEffect(() => {
        if (error) {
            if (toastId) {
                updateToast(toastId, 'error', 'Transaction Failed', error.message.slice(0, 50));
            } else {
                showToast('error', 'Transaction Failed', error.message.slice(0, 50));
            }
            setToastId(null);
            onReset();
        }
    }, [error, toastId, updateToast, showToast, onReset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !deadlineDate || !deadlineTime) return;

        // Convert deadline to unix timestamp
        const deadlineStr = `${deadlineDate}T${deadlineTime}`;
        const deadlineTimestamp = BigInt(Math.floor(new Date(deadlineStr).getTime() / 1000));

        const id = showToast('loading', 'Creating Task...', `Staking ${stakeAmount} MNT`);
        setToastId(id);
        onSubmit(content, deadlineTimestamp, stakeAmount);
    };

    const handleClose = () => {
        if (!isCreating) {
            setContent('');
            onClose();
        }
    };

    // Format min stake for display
    const minStakeDisplay = minStake > BigInt(0)
        ? (Number(minStake) / 1e18).toFixed(4)
        : '0.001';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
                    >
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">Create Task</h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={isCreating}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Task Content */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                        <FileText className="w-4 h-4" />
                                        Task Description
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Describe your task..."
                                        rows={3}
                                        disabled={isCreating}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none disabled:opacity-50"
                                    />
                                </div>

                                {/* Stake Amount */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                        <Coins className="w-4 h-4" />
                                        Stake Amount (MNT)
                                    </label>
                                    <input
                                        type="number"
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                        placeholder="0.001"
                                        step="0.001"
                                        min={minStakeDisplay}
                                        disabled={isCreating}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all disabled:opacity-50"
                                    />
                                    <p className="text-xs text-zinc-500">Minimum: {minStakeDisplay} MNT</p>
                                </div>

                                {/* Deadline */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                        <Calendar className="w-4 h-4" />
                                        Deadline
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={deadlineDate}
                                            onChange={(e) => setDeadlineDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            disabled={isCreating}
                                            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all disabled:opacity-50"
                                        />
                                        <input
                                            type="time"
                                            value={deadlineTime}
                                            onChange={(e) => setDeadlineTime(e.target.value)}
                                            disabled={isCreating}
                                            className="w-32 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Info Note */}
                                <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <p className="text-xs text-zinc-400">
                                        💰 Your stake will be returned when the task is verified by the team lead before the deadline.
                                        If not completed in time, it goes to the Party Fund!
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                                    disabled={isCreating || !content.trim() || !deadlineDate || !deadlineTime}
                                    className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Create Task & Stake {stakeAmount} MNT
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
