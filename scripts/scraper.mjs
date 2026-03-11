#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Country config ───────────────────────────────────────────────────────────
const COUNTRIES = {
  uae: { code: "uae", name: "United Arab Emirates", file: "data-uae.json", username: "modgovae", flag: "🇦🇪", keywords: /missile|drone|ballistic|cruise|intercept|attack|iranian|صاروخ|طائرة مسيّرة|اعتراض|إيران|باليستي|هجوم|دفاعات جوية|بيان/i },
  qatar: { code: "qatar", name: "Qatar", file: "data-qatar.json", username: "MOD_Qatar", flag: "🇶🇦", keywords: /missile|drone|ballistic|cruise|intercept|attack|iranian|صاروخ|طائرة مسيّرة|اعتراض|إيران|باليستي|هجوم|دفاعات جوية|بيان/i },
  kuwait: { code: "kuwait", name: "Kuwait", file: "data-kuwait.json", username: "KuwaitArmyGHQ", flag: "🇰🇼", keywords: /missile|drone|ballistic|cruise|intercept|attack|iranian|صاروخ|طائرة مسيّرة|اعتراض|إيران|باليستي|هجوم|دفاعات جوية|بيان/i },
  bahrain: { code: "bahrain", name: "Bahrain", file: "data-bahrain.json", username: "BDF_Bahrain", flag: "🇧🇭", keywords: /missile|drone|ballistic|cruise|intercept|attack|iranian|صاروخ|طائرة مسيّرة|اعتراض|إيران|باليستي|هجوم|دفاعات جوية|بيان/i },
};

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Shared fetchers ─────────────────────────────────────────────────────────
async function fetchTimelineViaSyndication(username) {
  try {
    const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${username}`;
    log(`Trying Syndication API for @${username}...`);

    const html = execSync(`curl -sL -m 20 '${url}'`, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) throw new Error("No __NEXT_DATA__ found in syndication response");

    const data = JSON.parse(match[1]);
    const entries = data?.props?.pageProps?.timeline?.entries || [];
    const tweets = [];

    for (const entry of entries) {
      if (entry.type !== 'tweet') continue;
      const tweet = entry.content.tweet;
      const id = tweet.id_str;
      const text = tweet.full_text || tweet.text || '';

      let imageUrls = [];
      if (tweet.entities && tweet.entities.media) {
        imageUrls = tweet.entities.media.filter(m => m.type === 'photo').map(m => m.media_url_https);
      }
      if (tweet.extended_entities && tweet.extended_entities.media) {
        const extUrls = tweet.extended_entities.media.filter(m => m.type === 'photo').map(m => m.media_url_https);
        imageUrls = [...new Set([...imageUrls, ...extUrls])];
      }

      tweets.push({
        id,
        text,
        imageUrls,
        createdAt: new Date(tweet.created_at)
      });
    }

    if (tweets.length > 0) {
      log(`✓ Syndication found ${tweets.length} tweets`);
    } else {
      log(`✓ Syndication found no tweets`);
    }
    return tweets;
  } catch (err) {
    log(`Syndication failed: ${err.message}`);
    return [];
  }
}

async function fetchTweetViaFxTwitter(username, tweetId) {
  const url = `https://api.fxtwitter.com/${username}/status/${tweetId}`;
  log(`Fetching tweet ${tweetId} via FxTwitter...`);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GCC-Tracker/1.0)" },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`${res.status}`);

    const data = await res.json();
    if (data.code !== 200) throw new Error(data.message || "Error");

    return {
      id: tweetId,
      text: data.tweet.text,
      createdAt: data.tweet.created_at,
      media: data.tweet.media?.all || [],
    };
  } catch (err) {
    log(`FxTwitter ${tweetId}: ${err.message}`);
    return null;
  }
}

async function fetchUserTimeline(username, sinceId) {
  let tweets = await fetchTimelineViaSyndication(username);

  const needsContent = tweets.filter(t => !t.text || t.text.length < 10);
  if (needsContent.length > 0) {
    log(`Fetching content for ${needsContent.length} tweets via FxTwitter...`);
    for (const tweet of needsContent) {
      const full = await fetchTweetViaFxTwitter(username, tweet.id);
      if (full) {
        tweet.text = full.text;
        tweet.media = full.media;
        tweet.createdAt = full.createdAt;
      }
      await sleep(300);
    }
  }

  tweets = tweets.filter(t => t.text && t.text.length > 10);

  if (sinceId && tweets.length > 0) {
    tweets = tweets.filter(t => BigInt(t.id) > BigInt(sinceId));
  }
  return tweets;
}

// ── Claude Parsers ──────────────────────────────────────────────────────────
async function parseTweetWithClaude(tweetText, imageUrls, currentData, countryCode, anthropic, mode) {
  let prompt = "";
  if (mode === "alertsOnly") {
    prompt = `Parse this ${countryCode.toUpperCase()} Ministry of Defence statement about security/missiles/drones.
Return ONLY JSON:
{
  "alert": {
    "type": "missile"|"drone"|"aircraft"|"siren"|"interception"|"impact"|"info",
    "severity": "critical"|"high"|"medium"|"low",
    "title": "string (short title in English)",
    "description": "string (summary in English)",
    "location": "string"
  }
}

Text:
"""
${tweetText}
"""`;
  } else {
    prompt = `Parse this ${countryCode.toUpperCase()} Ministry of Defence statement about Iranian attacks.
May be in Arabic or English. Extract ALL numbers.

Arabic patterns:
- "عدد (X)" = number X
- "صواريخ باليستية" = ballistic missiles
- "طائرات مسيّرة" = drones
- "اعتراض/تدمير" = intercepted/destroyed
- "رصد" = detected

IMPORTANT: The statistics may be located inside the attached images (infographics/tables) rather than the tweet text itself. Ensure you carefully read all text and numbers inside the images.

Current totals: ${JSON.stringify(currentData.cumulative)}

Text:
"""
${tweetText}
"""

Return ONLY JSON:
{
  "hasCumulativeData": boolean,
  "daily": {
    "ballisticDetected": number|null,
    "ballisticIntercepted": number|null,
    "ballisticImpacted": number|null,
    "dronesDetected": number|null,
    "dronesIntercepted": number|null,
    "dronesImpacted": number|null
  },
  "impactSites": [{"name": "string", "description": "string"}],
  "date": "YYYY-MM-DD",
  "alert": {
    "type": "missile"|"drone"|"aircraft"|"siren"|"interception"|"impact"|"info",
    "severity": "critical"|"high"|"medium"|"low",
    "title": "string (short title in English)",
    "description": "string (summary in English)",
    "location": "string"
  }
}

Calculate impacted = detected - intercepted if not stated.`;
  }

  const content = [{ type: "text", text: prompt }];

  if (imageUrls && imageUrls.length > 0 && mode !== "alertsOnly") {
    for (const url of imageUrls.slice(0, 3)) {
      let success = false;
      for (let j = 0; j < 3; j++) {
        try {
          const buffer = execSync(`curl -sL -m 20 '${url}'`, { stdio: ['pipe', 'pipe', 'pipe'] });
          if (buffer.length > 0) {
            const base64 = buffer.toString("base64");
            content.push({
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: base64 },
            });
            success = true;
            break;
          }
        } catch (err) {
          log(`Attempt ${j + 1} failed to fetch image ${url}: ${err.message}`);
          await sleep(1000);
        }
      }
      if (!success) {
        log(`Failed all attempts to fetch image ${url}`);
      }
    }
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  const raw = response.content[0].text.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response");

  return JSON.parse(match[0].trim());
}

// ── Data Merging ────────────────────────────────────────────────────────────
function mergeData(currentData, parsed, tweet, username, mode) {
  const updated = JSON.parse(JSON.stringify(currentData));

  if (mode !== "alertsOnly") {
    const d = parsed.daily || {};

    // Add to cumulative
    if (parsed.hasCumulativeData) {
      for (const key of ['ballisticDetected', 'ballisticIntercepted', 'ballisticImpacted',
        'dronesDetected', 'dronesIntercepted', 'dronesImpacted']) {
        if (d[key]) updated.cumulative[key] = (updated.cumulative[key] || 0) + d[key];
      }
    }

    // Add daily entry
    if (parsed.date && Object.values(d).some(v => v > 0)) {
      const entry = {
        date: parsed.date,
        label: new Date(parsed.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        ...d,
        total: (d.ballisticDetected || 0) + (d.dronesDetected || 0),
      };

      const idx = updated.daily.findIndex(x => x.date === parsed.date);
      if (idx >= 0) {
        for (const [k, v] of Object.entries(entry)) {
          if (typeof v === 'number') updated.daily[idx][k] = (updated.daily[idx][k] || 0) + v;
        }
      } else {
        updated.daily.push(entry);
        updated.daily.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
    }

    // Impact sites
    if (parsed.impactSites?.length) {
      if (!updated.impactSites) updated.impactSites = [];
      for (const site of parsed.impactSites) {
        if (site.name && !updated.impactSites.find(s => s.name === site.name)) {
          updated.impactSites.push(site);
        }
      }
    }

    if (!updated.sources) updated.sources = {};
    if (!updated.sources[username]) updated.sources[username] = {};
    if (!updated.sources[username].lastTweetId || BigInt(tweet.id) > BigInt(updated.sources[username].lastTweetId)) {
      updated.sources[username].lastTweetId = tweet.id;
    }
  }

  // Alerts
  if (parsed.alert || mode === "alertsOnly") {
    if (!updated.alerts) updated.alerts = [];
    const alertData = parsed.alert || {};

    if (!updated.alerts.find(a => a.id === tweet.id)) {
      const flagInfo = Object.values(COUNTRIES).find(c => c.username.toLowerCase() === username.toLowerCase());
      updated.alerts.push({
        id: tweet.id,
        timestamp: typeof tweet.createdAt === 'string' ? tweet.createdAt : new Date(tweet.createdAt).toISOString(),
        source: flagInfo ? `${flagInfo.name} Ministry of Defence` : username,
        sourceIcon: flagInfo ? flagInfo.flag : '🛡️',
        type: alertData.type || 'info',
        severity: alertData.severity || 'medium',
        title: alertData.title || 'Security Update',
        description: alertData.description || tweet.text,
        location: alertData.location || 'Unknown',
        verified: true,
        url: `https://x.com/${username}/status/${tweet.id}`
      });

      // Sort descending and cap at 20
      updated.alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (updated.alerts.length > 20) {
        updated.alerts = updated.alerts.slice(0, 20);
      }
    }
  }

  updated.lastUpdated = new Date().toISOString();
  return updated;
}

// ── Modes ───────────────────────────────────────────────────────────────────

async function processNormalMode(anthropic) {
  for (const country of Object.values(COUNTRIES)) {
    const dataPath = path.join(__dirname, "../public", country.file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    } catch (e) {
      log(`[${country.code}] Can't load data: ${e.message}`);
      continue;
    }

    const sinceId = data.sources?.[country.username]?.lastTweetId || null;
    log(`[${country.code}] @${country.username} since: ${sinceId || 'start'}`);

    const tweets = await fetchUserTimeline(country.username, sinceId);
    if (!tweets.length) {
      log(`[${country.code}] No new tweets`);
      continue;
    }

    const relevant = tweets.filter(t => country.keywords.test(t.text || ""));
    log(`[${country.code}] ${tweets.length} tweets, ${relevant.length} relevant`);

    if (!relevant.length) {
      const maxId = tweets.reduce((m, t) => BigInt(t.id) > BigInt(m) ? t.id : m, tweets[0].id);
      if (!data.sources) data.sources = {};
      if (!data.sources[country.username]) data.sources[country.username] = {};
      data.sources[country.username].lastTweetId = maxId;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      continue;
    }

    const sorted = [...relevant].sort((a, b) => BigInt(a.id) < BigInt(b.id) ? -1 : (BigInt(a.id) > BigInt(b.id) ? 1 : 0));

    for (const tweet of sorted) {
      log(`[${country.code}] Parsing: "${(tweet.text).slice(0, 50)}..."`);
      try {
        const parsed = await parseTweetWithClaude(tweet.text, tweet.imageUrls, data, country.code, anthropic, "normal");

        // Only update if it has cumulative data or an alert
        if (parsed.hasCumulativeData || parsed.alert) {
          data = mergeData(data, parsed, tweet, country.username, "normal");
          log(`[${country.code}] ✓ Updated data for tweet ${tweet.id}`);
        } else {
          // just advance cursor
          if (!data.sources) data.sources = {};
          if (!data.sources[country.username]) data.sources[country.username] = {};
          data.sources[country.username].lastTweetId = tweet.id;
        }
      } catch (e) {
        log(`[${country.code}] Parse error: ${e.message}`);
      }
      await sleep(1000);
    }
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    log(`[${country.code}] ✓ Saved`);
  }
}

async function processAlertsOnlyMode(anthropic) {
  for (const country of Object.values(COUNTRIES)) {
    const dataPath = path.join(__dirname, "../public", country.file);
    let data;
    try { data = JSON.parse(fs.readFileSync(dataPath, "utf-8")); } catch (e) { continue; }

    log(`[${country.code}] Fetching recent tweets for alerts...`);
    const tweets = await fetchTimelineViaSyndication(country.username);
    const relevant = tweets.filter(t => country.keywords.test(t.text || ""));

    if (!data.alerts) data.alerts = [];

    for (const tweet of relevant.slice(0, 5)) {
      if (data.alerts.find(a => a.id === tweet.id)) continue;
      log(`[${country.code}] Parsing tweet ${tweet.id} ...`);
      try {
        const parsed = await parseTweetWithClaude(tweet.text, [], data, country.code, anthropic, "alertsOnly");
        if (parsed && parsed.alert) {
          data = mergeData(data, parsed, tweet, country.username, "alertsOnly");
        }
      } catch (e) {
        log(`Error parsing: ${e.message}`);
      }
      await sleep(1000);
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    log(`[${country.code}] Saved alerts`);
  }
}

async function processAddMode(tweetUrl, countryOverride, anthropic) {
  const match = tweetUrl.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)/);
  if (!match) throw new Error(`Invalid tweet URL: ${tweetUrl}`);
  const username = match[1];
  const tweetId = match[2];

  log(`Tweet: ${tweetId} from @${username}`);

  let countryCode = countryOverride;
  if (!countryCode) {
    const un = username.toLowerCase();
    const found = Object.values(COUNTRIES).find(c => c.username.toLowerCase() === un || c.username.toLowerCase().replace('_', '') === un.replace('_', ''));
    if (found) countryCode = found.code;
  }

  if (!countryCode || !COUNTRIES[countryCode]) {
    throw new Error(`Unknown country for @${username}. Provide country_code.`);
  }

  const country = COUNTRIES[countryCode];
  log(`Country: ${country.name}`);

  const tweet = await fetchTweetViaFxTwitter(username, tweetId);
  if (!tweet) throw new Error("Could not fetch tweet");
  log(`Tweet text: "${tweet.text.slice(0, 100)}..."`);

  const dataPath = path.join(__dirname, "../public", country.file);
  let data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  if (data.sources?.[username]?.lastTweetId === tweetId && data.alerts?.find(a => a.id === tweetId)) {
    log("⚠️ This tweet was already fully processed!");
    process.exit(0);
  }

  const parsed = await parseTweetWithClaude(tweet.text, tweet.media?.map(m => m.url) || [], data, countryCode, anthropic, "normal");

  console.log("\n📊 Parsed data:");
  console.log(JSON.stringify(parsed, null, 2));

  if (!parsed.hasCumulativeData && !parsed.alert) {
    log("⚠️ No statistics or alerts found in this tweet");
    process.exit(0);
  }

  data = mergeData(data, parsed, tweet, username, "normal");
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  console.log("\n✅ Data updated!");
  console.log(`📁 Saved to: ${country.file}`);
  console.log(`\n📈 New cumulative totals:`);
  console.log(JSON.stringify(data.cumulative, null, 2));
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (mode === "--help" || mode === "-h") {
    console.log(`
Usage:
  node scripts/scraper.mjs                # Polls for all latest stats and alerts
  node scripts/scraper.mjs --alerts       # Polls only for latest alerts (bypasses cumulative DB)
  node scripts/scraper.mjs --add <url>    # Manually adds a specific tweet by URL
`);
    process.exit(0);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY in .env");

  const anthropic = new Anthropic({ apiKey });

  log("═══════════════════════════════════════════════════════════");
  log("  GCC Missile Tracker - Unified Scraper");
  log("═══════════════════════════════════════════════════════════");

  if (mode === "--add") {
    const url = args[1];
    const country = args[2];
    if (!url) {
      console.log("Usage: node scripts/scraper.mjs --add <tweet_url> [country_code]");
      process.exit(1);
    }
    await processAddMode(url, country, anthropic);
  } else if (mode === "--alerts") {
    log("Mode: Alerts Only (no cumulative updates)");
    await processAlertsOnlyMode(anthropic);
  } else {
    log("Mode: Standard Poll (updating all stats)");
    await processNormalMode(anthropic);
  }

  log("═══════════════════════════════════════════════════════════");
  log("Done!");
}

main().catch(e => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
