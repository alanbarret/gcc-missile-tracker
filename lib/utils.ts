import { CumulativeStats, CountryData } from '@/types';

export function calculateInterceptionRate(stats: CumulativeStats): number {
  const totalDetected =
    stats.ballisticDetected + stats.cruiseDetected + stats.dronesDetected;
  const totalIntercepted =
    stats.ballisticIntercepted + stats.cruiseIntercepted + stats.dronesIntercepted;
  
  if (totalDetected === 0) return 0;
  return Math.round((totalIntercepted / totalDetected) * 100);
}

export function calculateTotalThreats(stats: CumulativeStats): number {
  return (
    stats.ballisticDetected + stats.cruiseDetected + stats.dronesDetected
  );
}

export function calculateTotalIntercepted(stats: CumulativeStats): number {
  return (
    stats.ballisticIntercepted + stats.cruiseIntercepted + stats.dronesIntercepted
  );
}

export function calculateTotalImpacted(stats: CumulativeStats): number {
  return (
    stats.ballisticImpacted + stats.cruiseImpacted + stats.dronesImpacted
  );
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function aggregateAllCountries(countries: CountryData[]): CumulativeStats {
  return countries.reduce(
    (acc, country) => ({
      ballisticDetected: acc.ballisticDetected + country.cumulative.ballisticDetected,
      ballisticIntercepted: acc.ballisticIntercepted + country.cumulative.ballisticIntercepted,
      ballisticSea: acc.ballisticSea + country.cumulative.ballisticSea,
      ballisticImpacted: acc.ballisticImpacted + country.cumulative.ballisticImpacted,
      cruiseDetected: acc.cruiseDetected + country.cumulative.cruiseDetected,
      cruiseIntercepted: acc.cruiseIntercepted + country.cumulative.cruiseIntercepted,
      cruiseSea: acc.cruiseSea + country.cumulative.cruiseSea,
      cruiseImpacted: acc.cruiseImpacted + country.cumulative.cruiseImpacted,
      dronesDetected: acc.dronesDetected + country.cumulative.dronesDetected,
      dronesIntercepted: acc.dronesIntercepted + country.cumulative.dronesIntercepted,
      dronesSea: acc.dronesSea + country.cumulative.dronesSea,
      dronesImpacted: acc.dronesImpacted + country.cumulative.dronesImpacted,
      killed: acc.killed + country.cumulative.killed,
      injured: acc.injured + country.cumulative.injured,
    }),
    {
      ballisticDetected: 0,
      ballisticIntercepted: 0,
      ballisticSea: 0,
      ballisticImpacted: 0,
      cruiseDetected: 0,
      cruiseIntercepted: 0,
      cruiseSea: 0,
      cruiseImpacted: 0,
      dronesDetected: 0,
      dronesIntercepted: 0,
      dronesSea: 0,
      dronesImpacted: 0,
      killed: 0,
      injured: 0,
    }
  );
}
