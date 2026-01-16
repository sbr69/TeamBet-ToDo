'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string) => void;
    isCreating: boolean;
    isSuccess: boolean;
    error: Error | null;
    onReset: () => void;
}

export function CreateTaskModal({
    isOpen,
    onClose,
    onSubmit,
    isCreating,
    isSuccess,
    error,
    onReset
}: CreateTaskModalProps) {
    const [content, setContent] = useState('');
    const { showToast, updateToast } = useToast();
    const [toastId, setToastId] = useState<string | null>(null);

    // Handle success
    useEffect(() => {
        if (isSuccess) {
            if (toastId) {
                updateToast(toastId, 'success', 'Task Created!', 'Your task has been added to the blockchain');
            }
            setContent('');
            setToastId(null);
            onReset();
            onClose();
        }
    }, [isSuccess, toastId, updateToast, onReset, onClose]);

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
        if (!content.trim()) return;

        const id = showToast('loading', 'Creating Task...', 'Please confirm in your wallet');
        setToastId(id);
        onSubmit(content);
    };

    const handleClose = () => {
        if (!isCreating) {
            setContent('');
            onClose();
        }
    };

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
                                        rows={4}
                                        disabled={isCreating}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none disabled:opacity-50"
                                    />
                                </div>

                                {/* Info Note */}
                                <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <p className="text-xs text-zinc-400">
                                        This will create a transaction on the Mantle Sepolia network.
                                        You&apos;ll need to confirm the transaction in your wallet.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: isCreating ? 1 : 1.02 }}
                                    whileTap={{ scale: isCreating ? 1 : 0.98 }}
                                    disabled={isCreating || !content.trim()}
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
                                            Create Task
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
