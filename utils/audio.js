import axios from 'axios';
import { client } from '../client.js';
import { NodeManager, ManagerUtils } from 'lavalink-client';

const manager = new NodeManager(client.lavalink);
export const mainnode = manager.createNode({
  id: 'mainnode', // Node IDhost
  host: process.env.LAVALINK_HOST, // Lavalink host (e.g., Heroku URL)
  port: parseInt(process.env.LAVALINK_PORT), // Lavalink port (e.g., 2333)
  authorization: process.env.LAVALINK_SECRET // Lavalink password (make sure to set this in your .env file)
})

export const lavaManUtil = new  ManagerUtils(client.lavalink);

const playerStore = new Map();

export function setPlayerData(guildId, data) {
  playerStore.set(guildId, data);
}

export function getPlayerData(guildId) {
  return playerStore.get(guildId);
}

export function delPlayerData(guildId) {
  playerStore.delete(guildId);
}
