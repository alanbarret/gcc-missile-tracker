'use client';

import { motion } from 'framer-motion';
import { CumulativeStats } from '@/types';
import { formatNumber } from '@/lib/utils';

interface ThreatBreakdownProps {
  stats: CumulativeStats;
}

interface ThreatRowProps {
  label: string;
  detected: number;
  intercepted: number;
  impacted: number;
  icon: string;
  color: string;
  delay: number;
}

function ThreatRow({ label, detected, intercepted, impacted, icon, color, delay }: ThreatRowProps) {
  const interceptionRate = detected > 0 ? Math.round((intercepted / detected) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-xs text-gray-500">
              {interceptionRate}% interception rate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-red-400 font-bold text-lg">{formatNumber(detected)}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Detected</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 font-bold text-lg">{formatNumber(intercepted)}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Intercepted</p>
          </div>
          <div className="text-center">
            <p className="text-amber-400 font-bold text-lg">{formatNumber(impacted)}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Impacted</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${interceptionRate}%` }}
          transition={{ duration: 1, delay: delay + 0.3 }}
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
        />
      </div>
    </motion.div>
  );
}

export default function ThreatBreakdown({ stats }: ThreatBreakdownProps) {
  const threats = [
    {
      label: 'Ballistic Missiles',
      detected: stats.ballisticDetected || 0,
      intercepted: stats.ballisticIntercepted || 0,
      impacted: stats.ballisticImpacted || 0,
      icon: '🚀',
      color: 'bg-red-500/20',
    },
    {
      label: 'Cruise Missiles',
      detected: stats.cruiseDetected || 0,
      intercepted: stats.cruiseIntercepted || 0,
      impacted: stats.cruiseImpacted || 0,
      icon: '✈️',
      color: 'bg-orange-500/20',
    },
    {
      label: 'Attack Drones',
      detected: stats.dronesDetected || 0,
      intercepted: stats.dronesIntercepted || 0,
      impacted: stats.dronesImpacted || 0,
      icon: '🛸',
      color: 'bg-purple-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      {threats.map((threat, index) => (
        <ThreatRow
          key={threat.label}
          {...threat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
