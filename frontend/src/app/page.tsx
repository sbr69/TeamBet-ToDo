'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListTodo, Coins, Clock, PartyPopper, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { TaskCard, Task } from '@/components/TaskCard';
import { StatsCard } from '@/components/StatsCard';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useToDo, useTask } from '@/hooks/useToDo';
import { useToast } from '@/components/Toast';

// Component to fetch and display a single task
function TaskCardWithData({
  taskId,
  index,
  onComplete,
  isCompleting
}: {
  taskId: bigint;
  index: number;
  onComplete: (id: bigint) => void;
  isCompleting: boolean;
}) {
  const { task, isLoading } = useTask(taskId);

  if (isLoading || !task) {
    return (
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    );
  }

  return (
    <TaskCard
      task={task}
      index={index}
      onComplete={onComplete}
      isCompleting={isCompleting}
    />
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { showToast, updateToast } = useToast();
  const [completeToastId, setCompleteToastId] = useState<string | null>(null);

  const {
    tasks,
    taskCount,
    createTask,
    isCreating,
    isCreateSuccess,
    createError,
    resetCreate,
    completeTask,
    isCompleting,
    isCompleteSuccess,
    completeError,
    resetComplete,
  } = useToDo();

  // Handle complete success
  useEffect(() => {
    if (isCompleteSuccess) {
      if (completeToastId) {
        updateToast(completeToastId, 'success', 'Task Completed!', 'Your task has been marked as done');
      }
      setCompleteToastId(null);
      resetComplete();
    }
  }, [isCompleteSuccess, completeToastId, updateToast, resetComplete]);

  // Handle complete error
  useEffect(() => {
    if (completeError) {
      if (completeToastId) {
        updateToast(completeToastId, 'error', 'Failed to Complete', completeError.message.slice(0, 50));
      }
      setCompleteToastId(null);
      resetComplete();
    }
  }, [completeError, completeToastId, updateToast, resetComplete]);

  const handleComplete = (taskId: bigint) => {
    const id = showToast('loading', 'Completing Task...', 'Please confirm in your wallet');
    setCompleteToastId(id);
    completeTask(taskId);
  };

  // Calculate stats
  const pendingTasks = tasks.filter(t => !t.isCompleted).length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none" />

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Team Dashboard
          </h1>
          <p className="text-zinc-400">
            Track tasks, manage stakes, and keep your team accountable.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard
            title="Total Tasks"
            value={taskCount}
            subtitle="On blockchain"
            icon={ListTodo}
            color="blue"
            index={0}
          />
          <StatsCard
            title="Pending"
            value={pendingTasks}
            subtitle="Tasks to complete"
            icon={Clock}
            color="yellow"
            index={1}
          />
          <StatsCard
            title="Completed"
            value={taskCount - pendingTasks}
            subtitle="Tasks done"
            icon={Coins}
            color="green"
            index={2}
          />
          <StatsCard
            title="Party Fund"
            value="0.00 MNT"
            subtitle="From missed deadlines"
            icon={PartyPopper}
            color="purple"
            index={3}
          />
        </div>

        {/* Not Connected State */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/50"
          >
            <Wallet className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Connect your wallet to view and create tasks on the Mantle Sepolia network.
            </p>
          </motion.div>
        )}

        {/* Task List Section */}
        {isConnected && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl font-semibold text-white"
              >
                Active Tasks
              </motion.h2>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
              >
                <Plus className="w-5 h-5" />
                Create Task
              </motion.button>
            </div>

            {/* Empty State */}
            {taskCount === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 px-4 rounded-2xl border border-dashed border-zinc-700"
              >
                <ListTodo className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-1">No tasks yet</h3>
                <p className="text-zinc-400 text-sm">
                  Create your first task to get started!
                </p>
              </motion.div>
            )}

            {/* Task Cards Grid */}
            {taskCount > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: taskCount }, (_, i) => (
                  <TaskCardWithData
                    key={i}
                    taskId={BigInt(i)}
                    index={i}
                    onComplete={handleComplete}
                    isCompleting={isCompleting}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createTask}
        isCreating={isCreating}
        isSuccess={isCreateSuccess}
        error={createError}
        onReset={resetCreate}
      />
    </div>
  );
}
