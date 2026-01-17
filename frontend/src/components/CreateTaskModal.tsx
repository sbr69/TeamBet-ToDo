'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, FileText, Loader2, Coins, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { DatePicker, TimePicker } from './DateTimePicker';

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
    const [stakeAmount, setStakeAmount] = useState('');
    const [deadlineDate, setDeadlineDate] = useState('');
    const [deadlineTime, setDeadlineTime] = useState('');
    const { showToast, updateToast } = useToast();
    const [toastId, setToastId] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ content?: string; stakeAmount?: string; deadline?: string }>({});
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Set default deadline to tomorrow
    useEffect(() => {
        if (isOpen) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setDeadlineDate(tomorrow.toISOString().split('T')[0]);
            setDeadlineTime('00:00');
        }
    }, [isOpen]);

    // Handle success
    useEffect(() => {
        if (isSuccess) {
            if (toastId) {
                updateToast(toastId, 'success', 'Task Created!', `Staked ${stakeAmount} MNT`);
            }
            setContent('');
            setStakeAmount('');
            setErrors({});
            setHasSubmitted(false);
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

    const validateFields = () => {
        const newErrors: { content?: string; stakeAmount?: string; deadline?: string } = {};

        if (!content.trim()) {
            newErrors.content = 'Task description is required';
        }

        if (!stakeAmount || stakeAmount.trim() === '') {
            newErrors.stakeAmount = 'Stake amount is required';
        } else if (parseFloat(stakeAmount) < 0.1) {
            newErrors.stakeAmount = 'Minimum stake is 0.1 MNT';
        }

        if (!deadlineDate || !deadlineTime) {
            newErrors.deadline = 'Deadline date and time are required';
        }

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mark as submitted to show errors
        setHasSubmitted(true);

        // Validate all fields
        const validationErrors = validateFields();
        setErrors(validationErrors);

        // If there are errors, don't submit
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        // Convert deadline to unix timestamp
        const deadlineStr = `${deadlineDate}T${deadlineTime}`;
        const deadlineTimestamp = BigInt(Math.floor(new Date(deadlineStr).getTime() / 1000));

        const id = showToast('loading', 'Creating Task...', `Staking ${stakeAmount} MNT`);
        setToastId(id);
        onSubmit(content, deadlineTimestamp, stakeAmount);
    };

    const handleClose = () => {
        // If transaction is in progress, cancel it and notify user
        if (isCreating) {
            // Update the loading toast to show cancellation
            if (toastId) {
                updateToast(toastId, 'error', 'Transaction Cancelled', 'Reject in wallet if popup is open');
            }
            onReset();
        }

        // Reset all modal state
        setContent('');
        setStakeAmount('');
        setErrors({});
        setHasSubmitted(false);
        setToastId(null);

        onClose();
    };


    // Always show 0.1 as minimum stake (frontend validation)
    const minStakeDisplay = '0.1';

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
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
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
                                        className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all resize-none disabled:opacity-50 ${hasSubmitted && errors.content
                                            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                            : 'border-zinc-700 focus:ring-green-500/50 focus:border-green-500'
                                            }`}
                                    />
                                    {hasSubmitted && errors.content && (
                                        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                                            {errors.content}
                                        </p>
                                    )}
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
                                        placeholder="0.1"
                                        step="0.01"
                                        min="0.1"
                                        disabled={isCreating}
                                        className={`w-full px-4 py-3 bg-zinc-800 border rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${hasSubmitted && errors.stakeAmount
                                            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                            : 'border-zinc-700 focus:ring-green-500/50 focus:border-green-500'
                                            }`}
                                    />
                                    {hasSubmitted && errors.stakeAmount ? (
                                        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                                            {errors.stakeAmount}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-zinc-500">Minimum: {minStakeDisplay} MNT</p>
                                    )}
                                </div>

                                {/* Deadline */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                        <Calendar className="w-4 h-4" />
                                        Deadline
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <DatePicker
                                                value={deadlineDate}
                                                onChange={setDeadlineDate}
                                                minDate={new Date().toISOString().split('T')[0]}
                                                hasError={hasSubmitted && !!errors.deadline}
                                            />
                                        </div>
                                        <div>
                                            <TimePicker
                                                value={deadlineTime}
                                                onChange={setDeadlineTime}
                                                hasError={hasSubmitted && !!errors.deadline}
                                            />
                                        </div>
                                    </div>
                                    {hasSubmitted && errors.deadline && (
                                        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                            <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                                            {errors.deadline}
                                        </p>
                                    )}
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
                                    disabled={isCreating}
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
                                            Create Task {stakeAmount ? `& Stake ${stakeAmount} MNT` : ''}
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
