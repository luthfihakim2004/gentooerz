import { ActivityType } from 'discord.js';
import { logToDiscord } from '../utils/logger.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setPresence({
      activities: [{ name: 'ur ass 👀', type: ActivityType.Watching }],
      status: 'online',
    });
    console.log(`✅ Logged in as ${client.user.tag}`);
    logToDiscord(`Bot is now online as ${client.user.tag}`);
  }
};
