export interface CumulativeStats {
  ballisticDetected: number;
  ballisticIntercepted: number;
  ballisticSea: number;
  ballisticImpacted: number;
  cruiseDetected: number;
  cruiseIntercepted: number;
  cruiseSea: number;
  cruiseImpacted: number;
  dronesDetected: number;
  dronesIntercepted: number;
  dronesSea: number;
  dronesImpacted: number;
  killed: number;
  injured: number;
}

export interface DailyEntry {
  date: string;
  label: string;
  ballisticDetected: number;
  ballisticIntercepted: number;
  ballisticSea: number;
  ballisticImpacted: number;
  cruiseDetected: number;
  cruiseIntercepted: number;
  dronesDetected: number;
  dronesIntercepted: number;
  dronesImpacted: number;
  total: number;
}

export interface ImpactSite {
  lat: number;
  lng: number;
  date: string;
  type: 'ballistic' | 'cruise' | 'drone';
  description?: string;
}

export interface CountryData {
  country: string;
  countryCode: CountryCode;
  flag: string;
  coordinates: { lat: number; lng: number };
  cumulative: CumulativeStats;
  daily: DailyEntry[];
  impactSites: ImpactSite[];
  alerts?: import('@/components/LiveAlerts').Alert[];
  lastUpdated: string | null;
  sources: Record<string, { lastTweetId?: string }>;
}
