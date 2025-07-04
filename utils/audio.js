import axios from 'axios';
import { client } from '../client.js';
import { NodeManager } from 'lavalink-client';

const manager = new NodeManager(client.lavalink);
export const mainnode = manager.createNode({
  id: 'mainnode', // Node IDhost
  host: process.env.LAVALINK_HOST, // Lavalink host (e.g., Heroku URL)
  port: parseInt(process.env.LAVALINK_PORT), // Lavalink port (e.g., 2333)
  authorization: process.env.LAVALINK_SECRET // Lavalink password (make sure to set this in your .env file)
})



