'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Coins, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [stakeAmount, setStakeAmount] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Integrate with smart contract
        console.log({ title, description, stakeAmount, deadline });
        onClose();
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
                        onClick={onClose}
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
                                    onClick={onClose}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                        <FileText className="w-4 h-4" />
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter task title..."
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                        <FileText className="w-4 h-4" />
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the task..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all resize-none"
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
                                        placeholder="0.1"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                    />
                                </div>

                                {/* Deadline */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                        <Calendar className="w-4 h-4" />
                                        Deadline
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                    />
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
                                >
                                    Create & Stake
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
