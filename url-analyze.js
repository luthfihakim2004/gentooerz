import axios from 'axios';

const VT_API_KEY = process.env.VIRUSTOTAL_KEY;

export async function isUrlMalicious(url) {
  try {
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
    await new Promise(r => setTimeout(r, 3000)); // 3 seconds

    // Fetch analysis report
    const reportRes = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${scanId}`,
      { headers: { 'x-apikey': VT_API_KEY } }
    );    

    const stats = reportRes.data.data.attributes.stats;
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    console.log("VirusTotal stats:", stats);

    return malicious > 0 || suspicious > 0;
  } catch (err) {
    console.error('VirusTotal error:', err.response?.data || err.message);
    return false; // Default to false if API fails
  }
}
