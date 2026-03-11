'use client';

import { motion } from 'framer-motion';
import { CumulativeStats } from '@/types';

interface InterceptionRatesProps {
  stats: CumulativeStats;
}

interface RateCircleProps {
  label: string;
  rate: number;
  color: string;
  delay: number;
}

function RateCircle({ label, rate, color, delay }: RateCircleProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <div className="relative w-28 h-28">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/5"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            className="drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5 }}
            className="text-2xl font-bold text-white"
          >
            {rate}%
          </motion.span>
        </div>
      </div>
      
      <p className="mt-3 text-sm font-medium text-gray-400">{label}</p>
    </motion.div>
  );
}

export default function InterceptionRates({ stats }: InterceptionRatesProps) {
  const calculateRate = (detected: number | null, intercepted: number | null) => {
    if (!detected || detected === 0) return 0;
    return Math.round(((intercepted || 0) / detected) * 100);
  };

  const rates = [
    {
      label: 'Ballistic',
      rate: calculateRate(stats.ballisticDetected, stats.ballisticIntercepted),
      color: '#ef4444',
    },
    {
      label: 'Cruise',
      rate: calculateRate(stats.cruiseDetected, stats.cruiseIntercepted),
      color: '#f59e0b',
    },
    {
      label: 'Drones',
      rate: calculateRate(stats.dronesDetected, stats.dronesIntercepted),
      color: '#8b5cf6',
    },
  ];

  const overallDetected = (stats.ballisticDetected || 0) + (stats.cruiseDetected || 0) + (stats.dronesDetected || 0);
  const overallIntercepted = (stats.ballisticIntercepted || 0) + (stats.cruiseIntercepted || 0) + (stats.dronesIntercepted || 0);
  const overallRate = calculateRate(overallDetected, overallIntercepted);

  return (
    <div className="space-y-6">
      {/* Overall Rate - Large */}
      <div className="flex flex-col items-center py-4">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-white/5"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="60"
              stroke="url(#gradient)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 60}
              initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 60 - (overallRate / 100) * 2 * Math.PI * 60 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold gradient-text-green"
            >
              {overallRate}%
            </motion.span>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Overall</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-400">Combined Defense Rate</p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Individual Rates */}
      <div className="grid grid-cols-3 gap-4">
        {rates.map((item, index) => (
          <RateCircle
            key={item.label}
            {...item}
            delay={index * 0.15}
          />
        ))}
      </div>
    </div>
  );
}
