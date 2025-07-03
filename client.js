import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { LavalinkManager } from 'lavalink-client';

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel],
});

client.lavalink = new LavalinkManager({
  nodes: [
    {
      authorization: process.env.LAVALINK_SECRET,
      host: process.env.LAVALINK_HOST,
      port: parseInt(process.env.LAVALINK_PORT),
      id: 'mainnode'
    }
  ],
  sendToShard: (guildId, payload) =>
    client.guilds.cache.get(guildId)?.shard?.send(payload),
  autoSkip: true,
  client: {
    id: process.env.APP_ID, // set this in your .env
    username: 'Gentooerz'
  }
});
