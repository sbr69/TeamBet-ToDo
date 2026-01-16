'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListTodo, Coins, Clock, PartyPopper, Wallet, Shield } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
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
  isTeamLead,
  onComplete,
  onVerify,
  onClaim,
  onForfeit,
  isCompleting,
  isVerifying,
  isClaiming,
  isForfeiting
}: {
  taskId: bigint;
  index: number;
  isTeamLead: boolean;
  onComplete: (id: bigint) => void;
  onVerify: (id: bigint) => void;
  onClaim: (id: bigint) => void;
  onForfeit: (taskId: bigint) => void;
  isCompleting: boolean;
  isVerifying: boolean;
  isClaiming: boolean;
  isForfeiting: boolean;
}) {
  const { task, isLoading, refetch } = useTask(taskId);

  // Refetch task data periodically to update status
  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000);
    return () => clearInterval(interval);
  }, [refetch]);

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
      isTeamLead={isTeamLead}
      onComplete={onComplete}
      onVerify={onVerify}
      onClaim={onClaim}
      onForfeit={onForfeit}
      isCompleting={isCompleting}
      isVerifying={isVerifying}
      isClaiming={isClaiming}
      isForfeiting={isForfeiting}
    />
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { showToast, updateToast } = useToast();
  const [actionToastId, setActionToastId] = useState<string | null>(null);

  const {
    taskCount,
    partyFund,
    teamLead,
    minStake,
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
    verifyTask,
    isVerifying,
    isVerifySuccess,
    verifyError,
    resetVerify,
    claimStake,
    isClaiming,
    isClaimSuccess,
    claimError,
    resetClaim,
    forfeitStake,
    isForfeiting,
    isForfeitSuccess,
    forfeitError,
    resetForfeit,
    withdrawPartyFund,
    isWithdrawing,
    isWithdrawSuccess,
    withdrawError,
    resetWithdraw,
  } = useToDo();

  const isTeamLead = address && teamLead && address.toLowerCase() === teamLead.toLowerCase();

  // Handle action success/error
  useEffect(() => {
    if (isCompleteSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Task Completed!', 'Awaiting team lead verification');
      setActionToastId(null);
      resetComplete();
    }
    if (isVerifySuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Task Verified!', 'Owner can now claim their stake');
      setActionToastId(null);
      resetVerify();
    }
    if (isClaimSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Stake Claimed!', 'MNT returned to your wallet');
      setActionToastId(null);
      resetClaim();
    }
    if (isForfeitSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Stake Forfeited!', 'Funds moved to Party Fund');
      setActionToastId(null);
      resetForfeit();
    }
    if (isWithdrawSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Party Fund Withdrawn!', 'Funds sent to your wallet');
      setActionToastId(null);
      resetWithdraw();
    }
  }, [isCompleteSuccess, isVerifySuccess, isClaimSuccess, isForfeitSuccess, isWithdrawSuccess, actionToastId, updateToast, resetComplete, resetVerify, resetClaim, resetForfeit, resetWithdraw]);

  useEffect(() => {
    const error = completeError || verifyError || claimError || forfeitError || withdrawError;
    if (error) {
      if (actionToastId) updateToast(actionToastId, 'error', 'Transaction Failed', error.message.slice(0, 50));
      setActionToastId(null);
      if (completeError) resetComplete();
      if (verifyError) resetVerify();
      if (claimError) resetClaim();
      if (forfeitError) resetForfeit();
      if (withdrawError) resetWithdraw();
    }
  }, [completeError, verifyError, claimError, forfeitError, withdrawError, actionToastId, updateToast, resetComplete, resetVerify, resetClaim, resetForfeit, resetWithdraw]);

  const handleComplete = (taskId: bigint) => {
    const id = showToast('loading', 'Completing Task...', 'Please confirm in your wallet');
    setActionToastId(id);
    completeTask(taskId);
  };

  const handleVerify = (taskId: bigint) => {
    const id = showToast('loading', 'Verifying Task...', 'Please confirm in your wallet');
    setActionToastId(id);
    verifyTask(taskId);
  };

  const handleClaim = (taskId: bigint) => {
    const id = showToast('loading', 'Claiming Stake...', 'Please confirm in your wallet');
    setActionToastId(id);
    claimStake(taskId);
  };

  const handleForfeit = (taskId: bigint) => {
    const id = showToast('loading', 'Forfeiting Stake...', 'Please confirm in your wallet');
    setActionToastId(id);
    forfeitStake(taskId);
  };

  const handleWithdraw = () => {
    const id = showToast('loading', 'Withdrawing Fund...', 'Please confirm in your wallet');
    setActionToastId(id);
    withdrawPartyFund();
  };

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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">Team Dashboard</h1>
            {isTeamLead && (
              <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Team Lead
              </span>
            )}
          </div>
          <p className="text-zinc-400">
            Stake MNT on tasks. Complete before deadline or fund the party!
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
            title="Min Stake"
            value={`${formatEther(minStake)} MNT`}
            subtitle="Per task"
            icon={Coins}
            color="green"
            index={1}
          />
          <StatsCard
            title="Party Fund"
            value={`${formatEther(partyFund)} MNT`}
            subtitle="From missed deadlines"
            icon={PartyPopper}
            color="purple"
            index={2}
          />
          <StatsCard
            title="Status"
            value={isConnected ? 'Connected' : 'Disconnected'}
            subtitle={isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect wallet'}
            icon={Wallet}
            color="yellow"
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

              {isTeamLead && partyFund > BigInt(0) && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="ml-3 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                >
                  <PartyPopper className="w-5 h-5" />
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw Fund'}
                </motion.button>
              )}
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
                  Create your first task and stake some MNT!
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
                    isTeamLead={!!isTeamLead}
                    onComplete={handleComplete}
                    onVerify={handleVerify}
                    onClaim={handleClaim}
                    onForfeit={handleForfeit}
                    isCompleting={isCompleting}
                    isVerifying={isVerifying}
                    isClaiming={isClaiming}
                    isForfeiting={isForfeiting}
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
        minStake={minStake}
      />
    </div>
  );
}
