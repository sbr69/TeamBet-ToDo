'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color: 'green' | 'blue' | 'yellow' | 'purple';
    index: number;
}

const colorConfig = {
    green: {
        gradient: 'from-green-500 to-emerald-600',
        bg: 'bg-green-500/10',
        text: 'text-green-400',
        glow: 'shadow-green-500/20',
    },
    blue: {
        gradient: 'from-blue-500 to-cyan-600',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20',
    },
    yellow: {
        gradient: 'from-yellow-500 to-orange-600',
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/20',
    },
    purple: {
        gradient: 'from-purple-500 to-pink-600',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
    },
};

export function StatsCard({ title, value, subtitle, icon: Icon, color, index }: StatsCardProps) {
    const config = colorConfig[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className={clsx(
                'relative p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm',
                'hover:border-zinc-700 transition-all duration-300',
                'shadow-xl',
                config.glow
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-400">{title}</p>
                    <p className={clsx('text-3xl font-bold', config.text)}>{value}</p>
                    {subtitle && (
                        <p className="text-xs text-zinc-500">{subtitle}</p>
                    )}
                </div>

                <div className={clsx('p-3 rounded-xl bg-gradient-to-br', config.gradient)}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className={clsx('absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r opacity-50', config.gradient)} />
        </motion.div>
    );
}
