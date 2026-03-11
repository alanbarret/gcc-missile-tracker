'use client';

import { CumulativeStats } from '@/types';
import { motion } from 'framer-motion';
import {
  calculateTotalThreats,
  calculateTotalIntercepted,
  calculateTotalImpacted,
  calculateInterceptionRate,
  formatNumber,
} from '@/lib/utils';

interface StatsOverviewProps {
  stats: CumulativeStats;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'red' | 'green' | 'amber' | 'blue';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  delay?: number;
}

function StatCard({ label, value, icon, color, subtitle, trend, delay = 0 }: StatCardProps) {
  const colorConfig = {
    red: {
      bg: 'from-red-500/20 to-red-600/5',
      border: 'border-red-500/30 hover:border-red-500/50',
      text: 'text-red-400',
      glow: 'shadow-red-500/10 hover:shadow-red-500/20',
      icon: 'bg-red-500/20 text-red-400',
    },
    green: {
      bg: 'from-green-500/20 to-green-600/5',
      border: 'border-green-500/30 hover:border-green-500/50',
      text: 'text-green-400',
      glow: 'shadow-green-500/10 hover:shadow-green-500/20',
      icon: 'bg-green-500/20 text-green-400',
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10 hover:shadow-amber-500/20',
      icon: 'bg-amber-500/20 text-amber-400',
    },
    blue: {
      bg: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30 hover:border-blue-500/50',
      text: 'text-blue-400',
      glow: 'shadow-blue-500/10 hover:shadow-blue-500/20',
      icon: 'bg-blue-500/20 text-blue-400',
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative overflow-hidden rounded-2xl p-5
        bg-gradient-to-br ${config.bg}
        border ${config.border}
        shadow-lg ${config.glow}
        hover-lift cursor-default
        transition-all duration-300
      `}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 opacity-10">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${config.bg}`} />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</p>
          <motion.p 
            className={`text-4xl font-bold ${config.text} ticker-number`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {trend && (
                <span className={trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-gray-400'}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${config.icon}`}>
          {icon}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.bg} opacity-50`} />
    </motion.div>
  );
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const totalThreats = calculateTotalThreats(stats);
  const totalIntercepted = calculateTotalIntercepted(stats);
  const totalImpacted = calculateTotalImpacted(stats);
  const interceptionRate = calculateInterceptionRate(stats);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Threats"
        value={formatNumber(totalThreats)}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        color="red"
        subtitle="Missiles & drones detected"
        trend="up"
        delay={0}
      />
      <StatCard
        label="Intercepted"
        value={formatNumber(totalIntercepted)}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        color="green"
        subtitle="Successfully neutralized"
        delay={0.1}
      />
      <StatCard
        label="Impacted"
        value={formatNumber(totalImpacted)}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        color="amber"
        subtitle="Reached targets"
        trend="stable"
        delay={0.2}
      />
      <StatCard
        label="Defense Rate"
        value={`${interceptionRate}%`}
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        color="blue"
        subtitle="Interception effectiveness"
        delay={0.3}
      />
    </div>
  );
}
