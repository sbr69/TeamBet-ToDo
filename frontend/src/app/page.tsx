'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListTodo, Coins, PartyPopper, Wallet, Shield, Filter, RefreshCw, Users, Copy, Check, LogOut, Crown, UserPlus, Hash } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { Navbar } from '@/components/Navbar';
import { TaskCard, Task } from '@/components/TaskCard';
import { StatsCard } from '@/components/StatsCard';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { useToDo, useTask, useTeam, useTeamActions, useIsMember, useUserTeams } from '@/hooks/useToDo';
import { useToast } from '@/components/Toast';

function TeamListItem({ code, onSelect }: { code: `0x${string}`; onSelect: (code: `0x${string}`) => void }) {
  const { team } = useTeam(code);
  const { address } = useAccount();

  if (!team) return (
    <div className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 animate-pulse flex items-center justify-between">
      <div className="h-4 bg-zinc-800 rounded w-1/3" />
      <div className="h-3 bg-zinc-800 rounded w-8" />
    </div>
  );

  const isLead = address && team.lead.toLowerCase() === address.toLowerCase();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        localStorage.setItem('teamCode', code);
        onSelect(code);
      }}
      className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isLead ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
          <Users className="w-4 h-4" />
        </div>
        <div className="text-left">
          <h4 className="text-white font-medium group-hover:text-green-400 transition-colors">{team.name}</h4>
          <p className="text-xs text-zinc-500">{team.memberCount.toString()} Members</p>
        </div>
      </div>
      <div className="text-xs text-zinc-600 font-mono">
        {code.slice(0, 6)}...
      </div>
    </motion.button>
  );
}

type TaskStatus = 'in-progress' | 'verified' | 'failed';

function getTaskStatus(task: Task): TaskStatus {
  const isDeadlinePassed = Date.now() > Number(task.deadline) * 1000;
  if (task.isVerified) return 'verified';
  if (isDeadlinePassed) return 'failed';
  return 'in-progress';
}

function sortAndFilterTasks(
  tasks: Task[],
  filter: 'all' | TaskStatus
): Task[] {
  let filtered = filter === 'all' ? tasks : tasks.filter(task => getTaskStatus(task) === filter);

  const sortedByDeadline = [...filtered].sort((a, b) => Number(a.deadline) - Number(b.deadline));

  if (filter === 'all') {
    const inProgress = sortedByDeadline.filter(t => getTaskStatus(t) === 'in-progress');
    const verified = sortedByDeadline.filter(t => getTaskStatus(t) === 'verified');
    const failed = sortedByDeadline.filter(t => getTaskStatus(t) === 'failed');
    return [...inProgress, ...verified, ...failed];
  }

  return sortedByDeadline;
}

function TaskCardWithData({
  taskId,
  index,
  isTeamLead,
  onClick,
  onComplete,
  onVerify,
  onClaim,
  onForfeit,
  isCompleting,
  isVerifying,
  isClaiming,
  isForfeiting,
  onTaskLoaded
}: {
  taskId: bigint;
  index: number;
  isTeamLead: boolean;
  onClick: (task: Task) => void;
  onComplete: (id: bigint) => void;
  onVerify: (id: bigint) => void;
  onClaim: (id: bigint) => void;
  onForfeit: (taskId: bigint) => void;
  isCompleting: boolean;
  isVerifying: boolean;
  isClaiming: boolean;
  isForfeiting: boolean;
  onTaskLoaded?: (task: Task) => void;
}) {
  const { task, isLoading, refetch } = useTask(taskId);

  useEffect(() => {
    const interval = setInterval(refetch, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (task && onTaskLoaded) onTaskLoaded(task);
  }, [task?.id, task?.isCompleted, task?.isVerified, task?.deadline, onTaskLoaded]);

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
      onClick={() => onClick(task)}
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

function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  canConfirm = true,
  reason
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  canConfirm?: boolean;
  reason?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm mb-4">{message}</p>

              {!canConfirm && reason && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-red-400 mt-0.5" />
                    <p className="text-xs text-red-300">{reason}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {cancelText}
                </button>
                {canConfirm && (
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2
                      ${isDestructive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                  >
                    {isLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                    {confirmText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TeamListModal({
  isOpen,
  onClose,
  teamCodes,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  teamCodes: `0x${string}`[];
  onSelect: (code: `0x${string}`) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Your Teams</h3>
              <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
                <div className="rotate-45">
                  <Plus className="w-5 h-5 text-zinc-400" />
                </div>
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2">
              {teamCodes.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  You haven&apos;t joined any teams yet.
                </div>
              ) : (
                teamCodes.map((code) => (
                  <TeamListItem key={code} code={code} onSelect={onSelect} />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================
// Team Entry Screen (Create / Join)
// =============================================
function TeamEntryScreen({
  onTeamReady
}: {
  onTeamReady: (teamCode: `0x${string}`) => void;
}) {
  const [mode, setMode] = useState<'choose' | 'create' | 'join' | 'list'>('choose');
  const [teamName, setTeamName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [teamCodeInput, setTeamCodeInput] = useState('');
  const { showToast, updateToast } = useToast();
  const [toastId, setToastId] = useState<string | null>(null);
  const { address } = useAccount();
  const { teamCodes, isLoading: isLoadingTeams } = useUserTeams(address);

  const {
    createTeam, isCreatingTeam, isCreateTeamSuccess, createTeamError, createTeamReceipt, resetCreateTeam,
    joinTeam, isJoiningTeam, isJoinTeamSuccess, joinTeamError, resetJoinTeam,
  } = useTeamActions();

  // Handle create success
  useEffect(() => {
    if (isCreateTeamSuccess && createTeamReceipt) {
      if (toastId) updateToast(toastId, 'success', 'Team Created!', 'You are the team lead');
      setToastId(null);
      // Extract team code from logs
      const log = createTeamReceipt.logs[0];
      if (log && log.topics[1]) {
        const code = log.topics[1] as `0x${string}`;
        // Store the team code + name in localStorage
        localStorage.setItem('teamCode', code);
        localStorage.setItem('memberName', memberName);
        onTeamReady(code);
      }
      resetCreateTeam();
    }
  }, [isCreateTeamSuccess, createTeamReceipt, toastId, updateToast, resetCreateTeam, memberName, onTeamReady]);

  // Handle join success
  useEffect(() => {
    if (isJoinTeamSuccess) {
      if (toastId) updateToast(toastId, 'success', 'Joined Team!', 'Welcome aboard');
      setToastId(null);
      const code = teamCodeInput.startsWith('0x') ? teamCodeInput as `0x${string}` : `0x${teamCodeInput}` as `0x${string}`;
      localStorage.setItem('teamCode', code);
      localStorage.setItem('memberName', memberName);
      onTeamReady(code);
      resetJoinTeam();
    }
  }, [isJoinTeamSuccess, toastId, updateToast, resetJoinTeam, teamCodeInput, memberName, onTeamReady]);

  // Handle errors
  useEffect(() => {
    const error = createTeamError || joinTeamError;
    if (error) {
      if (toastId) updateToast(toastId, 'error', 'Transaction Failed', error.message.slice(0, 60));
      else showToast('error', 'Transaction Failed', error.message.slice(0, 60));
      setToastId(null);
      if (createTeamError) resetCreateTeam();
      if (joinTeamError) resetJoinTeam();
    }
  }, [createTeamError, joinTeamError, toastId, updateToast, showToast, resetCreateTeam, resetJoinTeam]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !memberName.trim()) return;
    const id = showToast('loading', 'Creating Team...', 'Please confirm in your wallet');
    setToastId(id);
    createTeam(teamName, memberName);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamCodeInput.trim() || !memberName.trim()) return;
    const code = teamCodeInput.startsWith('0x') ? teamCodeInput as `0x${string}` : `0x${teamCodeInput}` as `0x${string}`;
    const id = showToast('loading', 'Joining Team...', 'Please confirm in your wallet');
    setToastId(id);
    joinTeam(code, memberName);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {mode === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  >
                    <Image
                      src="/ToDoBetLogo.png"
                      alt="ToDoBet Logo"
                      width={48}
                      height={48}
                      className="rounded-xl"
                    />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Team Bet ToDo</h1>
                </div>
                <p className="text-zinc-400 text-lg">
                  Stake MNT on tasks.<br />
                  Complete tasks before deadline or fund the party!
                </p>
              </div>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('create')}
                  className="w-full p-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-green-500/50 hover:bg-zinc-900 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">Create Team</h3>
                      <p className="text-sm text-zinc-500">Start a new team and become the lead</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode('join')}
                  className="w-full p-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-purple-500/50 hover:bg-zinc-900 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">Join Team</h3>
                      <p className="text-sm text-zinc-500">Enter a team code to join an existing team</p>
                    </div>
                  </div>
                </motion.button>

                {address && (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('list')}
                    className="w-full p-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-blue-500/50 hover:bg-zinc-900 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20">
                        <ListTodo className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">Your Teams</h3>
                        <p className="text-sm text-zinc-500">{teamCodes.length} Joined</p>
                      </div>
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          <TeamListModal
            isOpen={mode === 'list'}
            onClose={() => setMode('choose')}
            teamCodes={teamCodes}
            onSelect={onTeamReady}
          />

          {mode === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Create Team</h2>
                    <p className="text-xs text-zinc-500">You&apos;ll be the team lead</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Your Name</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Alpha Squad"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                    required
                  />
                </div>

                <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <p className="text-xs text-zinc-400">
                    👑 As team lead, you can verify tasks and withdraw the party fund. Share your team code with friends to invite them!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('choose')}
                    className="flex-1 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800 transition-all"
                  >
                    Back
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: isCreatingTeam ? 1 : 1.02 }}
                    whileTap={{ scale: isCreatingTeam ? 1 : 0.98 }}
                    disabled={isCreatingTeam || !teamName.trim() || !memberName.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingTeam ? 'Creating...' : 'Create Team'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Join Team</h2>
                    <p className="text-xs text-zinc-500">Enter the team code shared by your lead</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleJoin} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Your Name</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Hash className="w-4 h-4" />
                    Team Code
                  </label>
                  <input
                    type="text"
                    value={teamCodeInput}
                    onChange={(e) => setTeamCodeInput(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono text-sm"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('choose')}
                    className="flex-1 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-xl hover:bg-zinc-800 transition-all"
                  >
                    Back
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: isJoiningTeam ? 1 : 1.02 }}
                    whileTap={{ scale: isJoiningTeam ? 1 : 0.98 }}
                    disabled={isJoiningTeam || !teamCodeInput.trim() || !memberName.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoiningTeam ? 'Joining...' : 'Join Team'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div >
    </div >
  );
}

// =============================================
// Team Dashboard
// =============================================
function TeamDashboard({
  teamCode,
  onLeaveTeam
}: {
  teamCode: `0x${string}`;
  onLeaveTeam: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const { address, isConnected } = useAccount();
  const { showToast, updateToast } = useToast();
  const [actionToastId, setActionToastId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    type: 'leave' | 'delete' | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  const { team, members, taskIds, partyFund, refetch: refetchTeam } = useTeam(teamCode);

  const {
    leaveTeam, isLeavingTeam, isLeaveTeamSuccess, leaveTeamError, resetLeaveTeam,
    deleteTeam, isDeletingTeam, isDeleteTeamSuccess, deleteTeamError, resetDeleteTeam
  } = useTeamActions();

  // Handle leave/delete success
  useEffect(() => {
    if (isLeaveTeamSuccess || isDeleteTeamSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', isDeleteTeamSuccess ? 'Team Deleted' : 'Left Team', 'redirecting...');
      setActionToastId(null);
      setTimeout(() => {
        onLeaveTeam(); // This clears local storage and goes back to entry screen
      }, 1500);
      if (isLeaveTeamSuccess) resetLeaveTeam();
      if (isDeleteTeamSuccess) resetDeleteTeam();
    }
  }, [isLeaveTeamSuccess, isDeleteTeamSuccess, actionToastId, updateToast, onLeaveTeam, resetLeaveTeam, resetDeleteTeam]);

  // Handle leave/delete errors
  useEffect(() => {
    const error = leaveTeamError || deleteTeamError;
    if (error) {
      if (actionToastId) updateToast(actionToastId, 'error', 'Action Failed', error.message.slice(0, 50));
      setActionToastId(null);
      if (leaveTeamError) resetLeaveTeam();
      if (deleteTeamError) resetDeleteTeam();
    }
  }, [leaveTeamError, deleteTeamError, actionToastId, updateToast, resetLeaveTeam, resetDeleteTeam]);

  const handleLeaveTeamAction = () => {
    setConfirmModal({ type: 'leave', isOpen: true });
  };

  const handleDeleteTeamAction = () => {
    setConfirmModal({ type: 'delete', isOpen: true });
  };

  const proceedLeave = () => {
    setConfirmModal({ type: null, isOpen: false });
    const id = showToast('loading', 'Leaving Team...', 'Please confirm in your wallet');
    setActionToastId(id);
    leaveTeam(teamCode);
  };

  const proceedDelete = () => {
    setConfirmModal({ type: null, isOpen: false });
    const id = showToast('loading', 'Deleting Team...', 'Please confirm in your wallet');
    setActionToastId(id);
    deleteTeam(teamCode);
  };

  const {
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
  } = useToDo(teamCode);

  const taskCount = taskIds.length;

  const activeTasksCount = useMemo(() =>
    allTasks.filter(t => getTaskStatus(t) === 'in-progress').length,
    [allTasks]
  );

  const isTeamLead = address && team && address.toLowerCase() === team.lead.toLowerCase();

  // Eligibility Checks
  const canLeave = useMemo(() => {
    if (!address) return false;
    // Check if user has any active pending tasks (stakedAmount > 0)
    // In our app logic, stakedAmount > 0 is true for in-progress or verified tasks that are not claimed/forfeited
    const myPendingTasks = allTasks.filter(t =>
      t.owner.toLowerCase() === address.toLowerCase() &&
      t.stakedAmount > BigInt(0)
    );
    return myPendingTasks.length === 0;
  }, [allTasks, address]);

  const canDelete = useMemo(() => {
    // Check no active tasks (any user) and party fund == 0
    const hasActiveTasks = allTasks.some(t => t.stakedAmount > BigInt(0));
    const hasFunds = partyFund > BigInt(0);
    return !hasActiveTasks && !hasFunds;
  }, [allTasks, partyFund]);

  const cantDeleteReason = useMemo(() => {
    const hasActiveTasks = allTasks.some(t => t.stakedAmount > BigInt(0));
    const hasFunds = partyFund > BigInt(0);
    if (hasActiveTasks && hasFunds) return "Team has active tasks and funds in the party fund.";
    if (hasActiveTasks) return "Team has active tasks. All tasks must be completed or forfeited.";
    if (hasFunds) return "Team has funds in the party fund. Withdraw them first.";
    return undefined;
  }, [allTasks, partyFund]);

  // Success handlers
  useEffect(() => {
    if (isCompleteSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Task Completed!', 'Awaiting team lead verification');
      setActionToastId(null);
      resetComplete();
      refetchTeam();
    }
    if (isVerifySuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Task Verified!', 'Owner can now claim their stake');
      setActionToastId(null);
      resetVerify();
      refetchTeam();
    }
    if (isClaimSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Stake Claimed!', 'MNT returned to your wallet');
      setActionToastId(null);
      resetClaim();
      refetchTeam();
    }
    if (isForfeitSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Stake Forfeited!', 'Funds moved to Party Fund');
      setActionToastId(null);
      resetForfeit();
      refetchTeam();
    }
    if (isWithdrawSuccess) {
      if (actionToastId) updateToast(actionToastId, 'success', 'Party Fund Withdrawn!', 'Funds sent to your wallet');
      setActionToastId(null);
      resetWithdraw();
      refetchTeam();
    }
  }, [isCompleteSuccess, isVerifySuccess, isClaimSuccess, isForfeitSuccess, isWithdrawSuccess, actionToastId, updateToast, resetComplete, resetVerify, resetClaim, resetForfeit, resetWithdraw, refetchTeam]);

  // Error handlers
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setAllTasks([]);
    refetchTeam();
    setRefreshKey(k => k + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleTaskLoaded = useCallback((task: Task) => {
    setAllTasks(prev => {
      const exists = prev.some(t => t.id === task.id);
      return exists ? prev.map(t => t.id === task.id ? task : t) : [...prev, task];
    });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(teamCode);
    setCodeCopied(true);
    showToast('success', 'Team Code Copied!', 'Share it with your teammates');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  useEffect(() => {
    if (taskCount === 0) {
      setAllTasks([]);
    }
  }, [taskCount]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none" />

      <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Team Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-4xl font-bold text-white">{team?.name || 'Team Dashboard'}</h1>
            {isTeamLead && (
              <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1">
                <Crown className="w-4 h-4" />
                Team Lead
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-zinc-400">
              Stake MNT on tasks. Complete before deadline or fund the party!
            </p>
            <div className="flex items-center gap-2">
              {isTeamLead && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-all text-zinc-300"
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {codeCopied ? 'Copied!' : 'Share Code'}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-all text-zinc-300"
              >
                <Users className="w-3.5 h-3.5" />
                {team?.memberCount || 0} Members
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLeaveTeam}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-all text-zinc-400"
                title="Switch to another team view"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Switch View
              </motion.button>

              {!isTeamLead && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveTeamAction}
                  disabled={isLeavingTeam}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-red-900/50 rounded-lg hover:border-red-700/50 hover:bg-red-950/20 transition-all text-zinc-400 hover:text-red-400 disabled:opacity-50"
                  title="Leave this team permanently"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isLeavingTeam ? 'Leaving...' : 'Leave Team'}
                </motion.button>
              )}

              {isTeamLead && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteTeamAction}
                  disabled={isDeletingTeam}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-950/30 border border-red-900/50 rounded-lg hover:border-red-600/50 hover:bg-red-900/40 transition-all text-red-500 hover:text-red-400 disabled:opacity-50"
                  title="Delete this team forever"
                >
                  <span className="text-sm">🗑️</span>
                  {isDeletingTeam ? 'Deleting...' : 'Delete Team'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Members Panel */}
          <AnimatePresence>
            {showMembers && members && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Team Members
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {members.addresses.map((addr, i) => (
                      <div
                        key={addr}
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 rounded-lg border border-zinc-700/50"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                          {(members.names[i] || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium">{members.names[i]}</span>
                          {addr.toLowerCase() === team?.lead.toLowerCase() && (
                            <Crown className="w-3 h-3 text-yellow-400 inline ml-1" />
                          )}
                          <span className="text-[10px] text-zinc-500 block font-mono">
                            {addr.slice(0, 6)}...{addr.slice(-4)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-700/50">
                    <p className="text-xs text-zinc-500 font-mono break-all">
                      Team Code: {teamCode}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatsCard
            title="Tasks"
            value={activeTasksCount}
            subtitle="Active now"
            icon={ListTodo}
            color="blue"
            index={0}
          />
          <StatsCard
            title="Min Stake"
            value="0.1 MNT"
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

        {isConnected && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-2xl font-semibold text-white"
                >
                  Active Tasks
                </motion.h2>

                {taskCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="relative"
                  >
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all text-sm font-medium text-white min-w-[150px] justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-zinc-400" />
                        <span>
                          {filter === 'all' ? 'All Tasks' :
                            filter === 'in-progress' ? 'In Progress' :
                              filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </span>
                      </div>
                      <motion.svg
                        animate={{ rotate: isFilterOpen ? 180 : 0 }}
                        className="w-4 h-4 text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {isFilterOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 top-full mt-2 w-full min-w-[150px] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                          >
                            {(['all', 'in-progress', 'verified', 'failed'] as const).map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setFilter(option);
                                  setIsFilterOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between
                                  ${filter === option ? 'bg-purple-500/10 text-purple-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
                                `}
                              >
                                {option === 'all' ? 'All Tasks' :
                                  option === 'in-progress' ? 'In Progress' :
                                    option.charAt(0).toUpperCase() + option.slice(1)}
                                {filter === option && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all text-sm font-medium text-white disabled:opacity-50"
                  title="Refresh tasks"
                >
                  <motion.div
                    animate={{ rotate: isRefreshing ? 360 : 0 }}
                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4 text-zinc-400" />
                  </motion.div>
                </motion.button>
              </div>

              <div className="flex items-center gap-3">
                {isTeamLead && partyFund > BigInt(0) && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWithdraw}
                    disabled={isWithdrawing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                  >
                    <span className="text-xl">💸</span>
                    {isWithdrawing ? 'Withdrawing...' : 'Withdraw Fund'}
                  </motion.button>
                )}

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
                {sortAndFilterTasks(allTasks, filter).map((task, idx) => (
                  <TaskCard
                    key={task.id.toString()}
                    task={task}
                    index={idx}
                    isTeamLead={!!isTeamLead}
                    onClick={() => handleTaskClick(task)}
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

        {/* Hidden task loaders */}
        {taskCount > 0 && (
          <div className="hidden">
            {taskIds.map((tid, i) => (
              <TaskCardWithData
                key={`loader-${refreshKey}-${tid.toString()}`}
                taskId={tid}
                index={i}
                isTeamLead={!!isTeamLead}
                onClick={handleTaskClick}
                onComplete={handleComplete}
                onVerify={handleVerify}
                onClaim={handleClaim}
                onForfeit={handleForfeit}
                isCompleting={isCompleting}
                isVerifying={isVerifying}
                isClaiming={isClaiming}
                isForfeiting={isForfeiting}
                onTaskLoaded={handleTaskLoaded}
              />
            ))}
          </div>
        )}
      </main>

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

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isTeamLead={!!isTeamLead}
        isOwner={!!(address && selectedTask && address.toLowerCase() === selectedTask.owner.toLowerCase())}
        onComplete={handleComplete}
        onVerify={handleVerify}
        onClaim={handleClaim}
        onForfeit={handleForfeit}
        isCompleting={isCompleting}
        isVerifying={isVerifying}
        isClaiming={isClaiming}
        isForfeiting={isForfeiting}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'leave'}
        onClose={() => setConfirmModal({ type: null, isOpen: false })}
        title="Leave Team"
        message={canLeave
          ? "Are you sure you want to leave this team? You won't be able to rejoin unless you satisfy entry requirements again."
          : "You cannot leave this team yet."}
        reason="You have pending tasks with active stakes. Please complete, verify, or forfeit them before leaving."
        onConfirm={proceedLeave}
        confirmText="Leave Team"
        isDestructive
        isLoading={isLeavingTeam}
        canConfirm={canLeave}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'delete'}
        onClose={() => setConfirmModal({ type: null, isOpen: false })}
        title="Delete Team"
        message={canDelete
          ? "Are you sure you want to DELETE this team? This action is permanent and cannot be undone."
          : "You cannot delete this team yet."}
        reason={cantDeleteReason}
        onConfirm={proceedDelete}
        confirmText="Delete Team"
        isDestructive
        isLoading={isDeletingTeam}
        canConfirm={canDelete}
      />
    </div>
  );
}

// =============================================
// Main Page - Route between entry & dashboard
// =============================================
export default function Home() {
  const [teamCode, setTeamCode] = useState<`0x${string}` | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { isConnected } = useAccount();

  // Load team code from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('teamCode');
    if (stored) {
      setTeamCode(stored as `0x${string}`);
    }
    setLoaded(true);
  }, []);

  const handleTeamReady = (code: `0x${string}`) => {
    setTeamCode(code);
  };

  const handleLeaveTeam = () => {
    localStorage.removeItem('teamCode');
    localStorage.removeItem('memberName');
    setTeamCode(null);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not connected, show navbar + connect prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <Navbar />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none" />
        <main className="relative pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 max-w-md"
          >
            <Wallet className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-zinc-400">
              Connect your wallet to create or join a team on the Mantle Sepolia network.
            </p>
          </motion.div>
        </main>
      </div>
    );
  }

  // If no team code, show the team entry screen
  if (!teamCode) {
    return (
      <>
        <Navbar />
        <TeamEntryScreen onTeamReady={handleTeamReady} />
      </>
    );
  }

  // Show the team dashboard
  return <TeamDashboard teamCode={teamCode} onLeaveTeam={handleLeaveTeam} />;
}
