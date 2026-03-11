'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CountryData } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyChartProps {
  countries: CountryData[];
}

export default function DailyChart({ countries }: DailyChartProps) {
  // Aggregate daily data from all countries
  const dailyMap = new Map<string, {
    label: string;
    ballistic: number;
    cruise: number;
    drones: number;
  }>();

  countries.forEach(country => {
    country.daily.forEach(day => {
      const existing = dailyMap.get(day.date) || {
        label: day.label,
        ballistic: 0,
        cruise: 0,
        drones: 0,
      };
      existing.ballistic += day.ballisticDetected;
      existing.cruise += day.cruiseDetected;
      existing.drones += day.dronesDetected;
      dailyMap.set(day.date, existing);
    });
  });

  const sortedDays = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14); // Last 14 days

  const labels = sortedDays.map(([_, data]) => data.label);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Ballistic Missiles',
        data: sortedDays.map(([_, d]) => d.ballistic),
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
      {
        label: 'Cruise Missiles',
        data: sortedDays.map(([_, d]) => d.cruise),
        backgroundColor: '#f59e0b',
        borderRadius: 4,
      },
      {
        label: 'Drones',
        data: sortedDays.map(([_, d]) => d.drones),
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1e1e2e',
        borderColor: '#2a2a3a',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#9ca3af',
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        stacked: true,
        grid: {
          color: '#1e1e2e',
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
  };

  if (sortedDays.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Daily Attack Timeline
        </h2>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          No attack data available yet
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">📈</span>
        Daily Attack Timeline
      </h2>
      <div className="h-[300px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
