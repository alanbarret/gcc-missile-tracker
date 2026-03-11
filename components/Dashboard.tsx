'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CountryData, CountryCode } from '@/types';
import { aggregateAllCountries } from '@/lib/utils';
import Header from './Header';
import StatsOverview from './StatsOverview';
import CountrySelector from './CountrySelector';
import ThreatBreakdown from './ThreatBreakdown';
import DailyChart from './DailyChart';
import InterceptionRates from './InterceptionRates';
import ArsenalAnalysis from './ArsenalAnalysis';
import LiveAlerts, { Alert } from './LiveAlerts';
import dynamic from 'next/dynamic';

// Dynamic import for map (no SSR due to Leaflet)
const TheatreMap = dynamic(() => import('./TheatreMap'), { ssr: false });

interface DashboardProps {
  countriesData: CountryData[];
}

// Section wrapper component
function Section({ children, title, icon, delay = 0, className = '' }: {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card rounded-2xl overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );
}

export default function Dashboard({ countriesData }: DashboardProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | 'all'>('all');

  const filteredData = selectedCountry === 'all'
    ? countriesData
    : countriesData.filter(c => c.countryCode === selectedCountry);

  const aggregatedStats = aggregateAllCountries(filteredData);

  const lastUpdated = countriesData
    .map(c => c.lastUpdated)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  // Compile alerts from filtered data
  const allAlerts = filteredData
    .flatMap(c => c.alerts || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="min-h-screen bg-grid">
      <Header lastUpdated={lastUpdated} />

      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 border-b border-red-500/20"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full live-pulse" />
            <span className="text-red-400 font-medium">SITUATION MONITOR</span>
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">Tracking active threats across GCC airspace</span>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Country Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CountrySelector
            countries={countriesData}
            selected={selectedCountry}
            onSelect={setSelectedCountry}
          />
        </motion.div>

        {/* Stats Overview */}
        <StatsOverview stats={aggregatedStats} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theatre Map - Full Width */}
          <Section
            title="Theatre of Operations"
            icon="🗺️"
            delay={0.1}
            className="lg:col-span-2"
          >
            <div className="h-[450px] rounded-xl overflow-hidden border border-white/5">
              <TheatreMap countries={filteredData} />
            </div>
          </Section>

          {/* Threat Breakdown */}
          <Section title="Threat Analysis" icon="🎯" delay={0.2}>
            <ThreatBreakdown stats={aggregatedStats} />
          </Section>

          {/* Interception Rates */}
          <Section title="Defense Performance" icon="🛡️" delay={0.25}>
            <InterceptionRates stats={aggregatedStats} />
          </Section>

          {/* Live Alerts - Full Width */}
          <Section title="Live Threat Feed" icon="📡" delay={0.28} className="lg:col-span-2">
            <LiveAlerts
              alerts={allAlerts}
              onRefresh={() => {
                // Future: Trigger re-fetch from the client if needed
              }}
            />
          </Section>

          {/* Daily Chart - Full Width */}
          <Section title="Activity Timeline" icon="📈" delay={0.3} className="lg:col-span-2">
            <DailyChart countries={filteredData} />
          </Section>

          {/* Arsenal Analysis - Full Width */}
          <Section title="Arsenal Intelligence" icon="🔍" delay={0.35} className="lg:col-span-2">
            <ArsenalAnalysis stats={aggregatedStats} />
          </Section>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-gray-400 mb-3">
            Intelligence sourced from official Ministry of Defence communications
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { flag: '🇦🇪', handle: '@modgovae' },
              { flag: '🇶🇦', handle: '@MOD_Qatar' },
              { flag: '🇰🇼', handle: '@MOD_KW' },
              { flag: '🇧🇭', handle: '@BDF_Bahrain' },
            ].map((source) => (
              <span key={source.handle} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>{source.flag}</span>
                <span className="font-mono">{source.handle}</span>
              </span>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-600">
              Built for situational awareness • Data updates automatically
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
