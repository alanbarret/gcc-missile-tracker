# 🎯 GCC Missile Tracker

Live dashboard monitoring Iranian missile and drone attacks on UAE, Qatar, Kuwait & Bahrain. Auto-updated from official Ministry of Defence Twitter/X accounts.

![Dashboard Preview](preview.png)

## Features

- **📊 Real-time Stats** — Total threats, interceptions, impacts, and casualty counts
- **🗺️ Theatre Map** — Interactive map showing GCC countries and attack origins
- **📈 Daily Timeline** — Stacked bar chart of daily attack breakdown
- **🎯 Interception Rates** — Visual circular gauges per weapon type
- **⚔️ Arsenal Analysis** — Iranian weapon specifications and threat composition
- **🔄 Auto-Updates** — Scraper fetches latest tweets from official MoD accounts

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Maps**: Leaflet + react-leaflet
- **AI Parsing**: Google Gemini API (for extracting stats from tweets)
- **Data Source**: Twitter/X API v2

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/gcc-missile-tracker.git
cd gcc-missile-tracker
npm install
```

### 2. Environment variables

Create `.env.local`:

```env
X_BEARER_TOKEN=your_twitter_bearer_token
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run the scraper

```bash
npm run scrape
```

This fetches new tweets from MoD accounts and updates the JSON data files.

### 4. Start the dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Sources

| Country | Twitter Account | Description |
|---------|-----------------|-------------|
| 🇦🇪 UAE | [@modgovae](https://twitter.com/modgovae) | UAE Ministry of Defence |
| 🇶🇦 Qatar | [@MOD_Qatar](https://twitter.com/MOD_Qatar) | Qatar Ministry of Defence |
| 🇰🇼 Kuwait | [@MOD_KW](https://twitter.com/MOD_KW) | Kuwait Ministry of Defence |
| 🇧🇭 Bahrain | [@BDF_Bahrain](https://twitter.com/BDF_Bahrain) | Bahrain Defence Force |

## Data Schema

Each country has a JSON file in `/public/data-{country}.json`:

```json
{
  "country": "UAE",
  "countryCode": "uae",
  "cumulative": {
    "ballisticDetected": 120,
    "ballisticIntercepted": 115,
    "ballisticImpacted": 5,
    "cruiseDetected": 45,
    "cruiseIntercepted": 43,
    "dronesDetected": 200,
    "dronesIntercepted": 195,
    ...
  },
  "daily": [
    { "date": "2026-03-01", "label": "1 Mar", ... }
  ],
  "lastUpdated": "2026-03-09T10:00:00Z"
}
```

## Automation

Set up a cron job to run the scraper periodically:

```bash
# Every 15 minutes
*/15 * * * * cd /path/to/gcc-missile-tracker && npm run scrape >> /var/log/missile-tracker.log 2>&1
```

## License

MIT — Use responsibly. This is for informational purposes only.

## Disclaimer

This dashboard aggregates publicly available data from official government sources. It does not endorse or promote any military action. Data accuracy depends on official reporting.
