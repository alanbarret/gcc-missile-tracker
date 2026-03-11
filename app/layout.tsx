import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GCC Missile Tracker | Live Iranian Attack Monitor',
  description: 'Real-time tracking of Iranian missile and drone attacks on UAE, Qatar, Kuwait & Bahrain. Interactive maps, interception rates, and daily breakdowns from official Ministry of Defence sources.',
  keywords: 'missile tracker, Iran attacks, UAE defense, Gulf states, ballistic missiles, drones, interception rates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
