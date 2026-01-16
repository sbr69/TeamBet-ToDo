'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListTodo, Coins, Clock, PartyPopper } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { TaskCard, Task } from '@/components/TaskCard';
import { StatsCard } from '@/components/StatsCard';
import { CreateTaskModal } from '@/components/CreateTaskModal';

// Mock data - will be replaced with blockchain data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete smart contract audit',
    description: 'Review and test all functions in the ToDo smart contract for security vulnerabilities.',
    assignee: '0x1234...5678',
    stakedAmount: '0.5',
    deadline: 'Jan 20, 2026',
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Design UI mockups',
    description: 'Create Figma designs for the dashboard, task creation, and team management pages.',
    assignee: '0xabcd...ef01',
    stakedAmount: '0.25',
    deadline: 'Jan 18, 2026',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Deploy to Mantle Sepolia',
    description: 'Deploy the verified smart contract to Mantle Sepolia testnet and update frontend configs.',
    assignee: '0x9876...5432',
    stakedAmount: '1.0',
    deadline: 'Jan 15, 2026',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Write documentation',
    description: 'Document the API, smart contract interfaces, and user guides for the platform.',
    assignee: '0xfedc...ba98',
    stakedAmount: '0.3',
    deadline: 'Jan 14, 2026',
    status: 'failed',
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate stats from mock data
  const pendingTasks = mockTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  const totalStaked = mockTasks
    .filter(t => t.status !== 'completed' && t.status !== 'failed')
    .reduce((sum, t) => sum + parseFloat(t.stakedAmount), 0);
  const partyFund = mockTasks
    .filter(t => t.status === 'failed')
    .reduce((sum, t) => sum + parseFloat(t.stakedAmount), 0);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

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
            title="Tasks Pending"
            value={pendingTasks}
            subtitle="Active tasks"
            icon={ListTodo}
            color="blue"
            index={0}
          />
          <StatsCard
            title="MNT Staked"
            value={`${totalStaked.toFixed(2)}`}
            subtitle="In active tasks"
            icon={Coins}
            color="green"
            index={1}
          />
          <StatsCard
            title="Due This Week"
            value={3}
            subtitle="Upcoming deadlines"
            icon={Clock}
            color="yellow"
            index={2}
          />
          <StatsCard
            title="Party Fund"
            value={`${partyFund.toFixed(2)} MNT`}
            subtitle="From missed deadlines"
            icon={PartyPopper}
            color="purple"
            index={3}
          />
        </div>

        {/* Task List Section */}
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

          {/* Task Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
