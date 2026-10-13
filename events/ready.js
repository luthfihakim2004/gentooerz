import { ActivityType } from 'discord.js';
import { logToDiscord } from '../utils/logger.js';
//import { mainnode } from '../utils/audio.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setPresence({
      activities: [{ name: 'ur ass 👀', type: ActivityType.Watching }],
      status: 'online',
    });
    client.lavalink.init(client.user);
    console.log(`succesfully init lavalink`)
    console.log(`✅ Logged in as ${client.user.tag}`);
    logToDiscord(`Bot is now online as ${client.user.tag}`);

    try {
      // Try to connect to the node
      //mainnode.connect();

    } catch (error) {
      console.log(`❌ Test node failed to connect. Error: ${error.message}`);
    }
  }
};
