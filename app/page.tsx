import { CountryData } from '@/types';
import Dashboard from '@/components/Dashboard';

async function getData(): Promise<CountryData[]> {
  const countries = ['uae', 'qatar', 'kuwait', 'bahrain'];
  const data: CountryData[] = [];

  for (const code of countries) {
    try {
      const res = await import(`@/public/data-${code}.json`);
      data.push(res.default as CountryData);
    } catch (e) {
      console.error(`Failed to load data for ${code}:`, e);
    }
  }

  return data;
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const countriesData = await getData();

  return (
    <main className="min-h-screen bg-dark-bg">
      <Dashboard countriesData={countriesData} />
    </main>
  );
}
