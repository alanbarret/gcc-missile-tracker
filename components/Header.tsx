'use client';

import { getTimeAgo } from '@/lib/utils';

interface HeaderProps {
  lastUpdated: string | null;
}

export default function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="glass-card border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            {/* Animated Radar Icon */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
              <div className="absolute inset-1 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              {/* Radar sweep line */}
              <div className="absolute inset-0 radar-sweep">
                <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-red-500 to-transparent origin-left" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="gradient-text">GCC Defense</span>
                <span className="text-white/90"> Monitor</span>
              </h1>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full threat-blink" />
                Iranian Threat Assessment Dashboard
              </p>
            </div>
          </div>

          {/* Right side indicators */}
          <div className="flex items-center gap-6">
            {/* Alert Status */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 glow-pulse">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <div className="absolute inset-0 bg-red-500 rounded-full live-pulse" />
              </div>
              <span className="text-sm font-semibold text-red-400 tracking-wider">ACTIVE THREAT</span>
            </div>

            {/* Last Updated */}
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Intelligence Update</p>
              <p className="text-sm font-medium text-gray-300 flex items-center gap-1.5 justify-end">
                <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {getTimeAgo(lastUpdated)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
