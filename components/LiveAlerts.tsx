'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Alert {
  id: string;
  timestamp: string;
  source: string;
  sourceIcon: string;
  type: 'missile' | 'drone' | 'aircraft' | 'siren' | 'interception' | 'impact' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  verified: boolean;
  url?: string;
}

interface LiveAlertsProps {
  alerts: Alert[];
  isLoading?: boolean;
  onRefresh?: () => void;
  maxDisplay?: number;
}

const typeStyles: Record<Alert['type'], { bg: string; icon: string; label: string }> = {
  missile: { bg: 'from-red-500/20 to-red-900/20', icon: '🚀', label: 'MISSILE' },
  drone: { bg: 'from-orange-500/20 to-orange-900/20', icon: '🛸', label: 'UAV' },
  aircraft: { bg: 'from-blue-500/20 to-blue-900/20', icon: '✈️', label: 'AIRCRAFT' },
  siren: { bg: 'from-yellow-500/20 to-yellow-900/20', icon: '🚨', label: 'ALERT' },
  interception: { bg: 'from-green-500/20 to-green-900/20', icon: '🛡️', label: 'INTERCEPT' },
  impact: { bg: 'from-purple-500/20 to-purple-900/20', icon: '💥', label: 'IMPACT' },
  info: { bg: 'from-gray-500/20 to-gray-900/20', icon: 'ℹ️', label: 'INFO' },
};

const severityStyles: Record<Alert['severity'], { border: string; pulse: boolean }> = {
  critical: { border: 'border-red-500', pulse: true },
  high: { border: 'border-orange-500', pulse: true },
  medium: { border: 'border-yellow-500', pulse: false },
  low: { border: 'border-gray-500', pulse: false },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return then.toLocaleDateString();
}

function AlertCard({ alert, index }: { alert: Alert; index: number }) {
  const typeStyle = typeStyles[alert.type];
  const severityStyle = severityStyles[alert.severity];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        relative rounded-xl border-l-4 ${severityStyle.border}
        bg-gradient-to-r ${typeStyle.bg}
        backdrop-blur-sm overflow-hidden
        ${severityStyle.pulse ? 'alert-pulse' : ''}
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeStyle.icon}</span>
            <span className="text-xs font-bold text-white/80 tracking-wider">
              {typeStyle.label}
            </span>
            {alert.verified && (
              <span className="text-xs bg-green-500/30 text-green-400 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{alert.sourceIcon}</span>
            <span>{alert.source}</span>
            <span>•</span>
            <span suppressHydrationWarning>{isMounted ? formatTimeAgo(alert.timestamp) : ''}</span>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-white font-semibold mb-1">{alert.title}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{alert.description}</p>

        {/* Location */}
        {alert.location && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <span>📍</span>
            <span>{alert.location}</span>
            {alert.coordinates && (
              <span className="font-mono text-gray-500">
                [{alert.coordinates.lat.toFixed(3)}, {alert.coordinates.lng.toFixed(3)}]
              </span>
            )}
          </div>
        )}

        {/* Link */}
        {alert.url && (
          <a
            href={alert.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View source →
          </a>
        )}
      </div>

      {/* Severity indicator */}
      {alert.severity === 'critical' && (
        <div className="absolute top-0 right-0 w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
        </div>
      )}
    </motion.div>
  );
}

export default function LiveAlerts({
  alerts,
  isLoading = false,
  onRefresh,
  maxDisplay = 10
}: LiveAlertsProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const displayAlerts = alerts.slice(0, maxDisplay);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;
    const interval = setInterval(onRefresh, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 live-pulse'}`} />
            <span className="text-sm text-gray-400">
              {isLoading ? 'Updating...' : 'Live Feed'}
            </span>
          </div>
          {criticalCount > 0 && (
            <span className="text-xs bg-red-500/30 text-red-400 px-2 py-1 rounded-full animate-pulse">
              {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span className="text-xs bg-orange-500/30 text-orange-400 px-2 py-1 rounded-full">
              {highCount} High Priority
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3 h-3 rounded bg-gray-700 border-gray-600"
            />
            Auto-refresh
          </label>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors disabled:opacity-50"
            >
              🔄 Refresh
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {displayAlerts.length > 0 ? (
            displayAlerts.map((alert, index) => (
              <AlertCard key={alert.id} alert={alert} index={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <span className="text-4xl mb-4 block">📡</span>
              <p>No active alerts</p>
              <p className="text-xs mt-1">Monitoring OSINT sources...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {alerts.length > maxDisplay && (
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-white/5">
          Showing {maxDisplay} of {alerts.length} alerts
        </div>
      )}
    </div>
  );
}
