'use client';

import { CumulativeStats } from '@/types';
import { formatNumber } from '@/lib/utils';

interface ArsenalAnalysisProps {
  stats: CumulativeStats;
}

interface WeaponCardProps {
  name: string;
  icon: string;
  count: number;
  description: string;
  specs: { label: string; value: string }[];
}

function WeaponCard({ name, icon, count, description, specs }: WeaponCardProps) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-400">{formatNumber(count)}</p>
          <p className="text-xs text-gray-500">detected</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {specs.map((spec, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded px-2 py-1">
            <p className="text-xs text-gray-500">{spec.label}</p>
            <p className="text-sm font-medium">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArsenalAnalysis({ stats }: ArsenalAnalysisProps) {
  const weapons: WeaponCardProps[] = [
    {
      name: 'Ballistic Missiles',
      icon: '🚀',
      count: stats.ballisticDetected,
      description: 'Medium-range ballistic missiles',
      specs: [
        { label: 'Type', value: 'Shahab / Fateh' },
        { label: 'Range', value: '300-2000 km' },
        { label: 'Warhead', value: '500-1000 kg' },
        { label: 'Speed', value: 'Mach 5+' },
      ],
    },
    {
      name: 'Cruise Missiles',
      icon: '✈️',
      count: stats.cruiseDetected,
      description: 'Land-attack cruise missiles',
      specs: [
        { label: 'Type', value: 'Paveh / Hoveyzeh' },
        { label: 'Range', value: '1000-1650 km' },
        { label: 'Warhead', value: '350-450 kg' },
        { label: 'Speed', value: 'Subsonic' },
      ],
    },
    {
      name: 'Attack Drones',
      icon: '🛸',
      count: stats.dronesDetected,
      description: 'One-way attack UAVs',
      specs: [
        { label: 'Type', value: 'Shahed-136' },
        { label: 'Range', value: '2000+ km' },
        { label: 'Warhead', value: '30-50 kg' },
        { label: 'Speed', value: '185 km/h' },
      ],
    },
  ];

  const totalThreats = stats.ballisticDetected + stats.cruiseDetected + stats.dronesDetected;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">⚔️</span>
        Arsenal Analysis
        <span className="text-sm font-normal text-gray-500 ml-2">
          (Iranian weapons identified)
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {weapons.map((weapon) => (
          <WeaponCard key={weapon.name} {...weapon} />
        ))}
      </div>

      {/* Proportions */}
      {totalThreats > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Threat composition</p>
          <div className="h-4 rounded-full overflow-hidden flex bg-gray-800">
            <div
              className="bg-red-500 h-full"
              style={{ width: `${(stats.ballisticDetected / totalThreats) * 100}%` }}
              title={`Ballistic: ${stats.ballisticDetected}`}
            />
            <div
              className="bg-amber-500 h-full"
              style={{ width: `${(stats.cruiseDetected / totalThreats) * 100}%` }}
              title={`Cruise: ${stats.cruiseDetected}`}
            />
            <div
              className="bg-purple-500 h-full"
              style={{ width: `${(stats.dronesDetected / totalThreats) * 100}%` }}
              title={`Drones: ${stats.dronesDetected}`}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>🚀 {Math.round((stats.ballisticDetected / totalThreats) * 100)}%</span>
            <span>✈️ {Math.round((stats.cruiseDetected / totalThreats) * 100)}%</span>
            <span>🛸 {Math.round((stats.dronesDetected / totalThreats) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
