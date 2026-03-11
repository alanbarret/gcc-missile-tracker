'use client';

import { motion } from 'framer-motion';
import { CountryData, CountryCode } from '@/types';

interface CountrySelectorProps {
  countries: CountryData[];
  selected: CountryCode | 'all';
  onSelect: (code: CountryCode | 'all') => void;
}

const countryInfo: Record<CountryCode | 'all', { flag: string; name: string; short: string }> = {
  all: { flag: '🌍', name: 'All Countries', short: 'ALL' },
  uae: { flag: '🇦🇪', name: 'United Arab Emirates', short: 'UAE' },
  qatar: { flag: '🇶🇦', name: 'Qatar', short: 'QAT' },
  kuwait: { flag: '🇰🇼', name: 'Kuwait', short: 'KWT' },
  bahrain: { flag: '🇧🇭', name: 'Bahrain', short: 'BHR' },
};

export default function CountrySelector({ countries, selected, onSelect }: CountrySelectorProps) {
  const options: (CountryCode | 'all')[] = ['all', ...countries.map(c => c.countryCode)];

  return (
    <div className="glass-card rounded-2xl p-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {options.map((code, index) => {
          const info = countryInfo[code];
          const isSelected = selected === code;

          return (
            <motion.button
              key={code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(code)}
              className={`
                country-btn relative flex items-center gap-3 px-5 py-3 rounded-xl
                font-medium text-sm whitespace-nowrap
                transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 text-white shadow-lg shadow-red-500/10' 
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selector-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <span className="text-2xl relative z-10">{info.flag}</span>
              <div className="relative z-10">
                <span className="hidden sm:inline">{info.name}</span>
                <span className="sm:hidden">{info.short}</span>
              </div>

              {/* Active dot */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-red-500 rounded-full live-pulse"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
