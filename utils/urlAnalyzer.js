import axios from 'axios';
import {logToDiscord} from './logger.js'
import { getWhitelist, getBlacklist, normalize } from './filters.js';
const VT_API_KEY = process.env.VIRUSTOTAL_KEY;
const cache = new Map();

const CACHE_DURATION_MS = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of cache.entries()) {
    if (now - val.timestamp > CACHE_DURATION_MS) {
      cache.delete(key);
    }
  }
}, 12 * 60 * 60 * 1000); // every 12 hours

export async function analyzeUrl(url) {
  // Check whitelist and blacklist of url
  const whitelist = getWhitelist();
  const blacklist = getBlacklist();
  
  const normalizedUrl = normalize(url);
  if (getWhitelist().includes(normalizedUrl)) {
    console.log(`✅ URL whitelisted: ${url}`);
    return { malicious: 0, suspicious: 0, whitelisted: true };
  }

  if (getBlacklist().includes(normalizedUrl)) {
    console.log(`❌ URL blacklisted: ${url}`);
    return { malicious: 10, suspicious: 10, blacklisted: true };
  }

  // Check cache
  const cached = cache.get(normalizedUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    console.log(`⚡ Cache hit for ${url}`);
    return cached.result;
  }

  try {
    logToDiscord(`Submitting ${normalizedUrl} to VirusTotal`)

    // Submit URL for scanning
    const submitRes = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      new URLSearchParams({ url }),
      {
        headers: {
          'x-apikey': VT_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const scanId = submitRes.data.data.id;

    // Wait a bit before fetching report (optional delay here)
    await new Promise(r => setTimeout(r, 15000)); // 10 seconds

    // Fetch analysis report
    const reportRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${scanId}`,
      { headers: { 'x-apikey': VT_API_KEY } }
    );    

    const result = reportRes.data.data.attributes.stats;
    //const result = (stats.malicious || 0) > 0 || (stats.suspicious || 0) > 0;
    console.log("VirusTotal stats:", result);

    cache.set(normalizedUrl, { result, timestamp: Date.now() });
    return result;
  } catch (err) {
    console.error('VirusTotal error:', err.response?.data || err.message);
    return false; // Default to false if API fails
  }
}
