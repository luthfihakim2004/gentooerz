import axios from 'axios';
import { client } from '../client.js';
import { NodeManager } from 'lavalink-client';
let accessToken = null;
let tokenExpires = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpires) return accessToken;

  const { data } = await axios.post('https://accounts.spotify.com/api/token', 
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        Authorization: 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  accessToken = data.access_token;
  tokenExpires = Date.now() + data.expires_in * 1000;
  return accessToken;
}

export async function searchTrack(query) {
  const token = await getAccessToken();

  const { data } = await axios.get('https://api.spotify.com/v1/search', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: query,
      type: 'track',
      limit: 1,
    },
  });

  if (data.tracks.items.length === 0) return null;

  const track = data.tracks.items[0];
  return {
    name: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    url: track.external_urls.spotify,
    thumbnail: track.album.images[0]?.url,
    duration_ms: track.duration_ms,
  };
}

const manager = new NodeManager(client.lavalink);
export const testnode = manager.createNode({
  id: 'testnode', // Node IDhost
  host: process.env.LAVALINK_HOST, // Lavalink host (e.g., Heroku URL)
  port: parseInt(process.env.LAVALINK_PORT), // Lavalink port (e.g., 2333)
  authorization: process.env.LAVALINK_SECRET // Lavalink password (make sure to set this in your .env file)
}) 

