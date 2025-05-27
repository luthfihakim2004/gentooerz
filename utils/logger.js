import fetch from 'node-fetch';

const webhookURL = process.env.HEROKU_LOG;

export async function logToDiscord(message) {
  if (!webhookURL) return console.warn('No webhook URL configured');

  try {
    await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📘 **Log:** ${message}`,
      }),
    });
  } catch (error) {
    console.error('Failed to send log to Discord:', error);
  }
}
