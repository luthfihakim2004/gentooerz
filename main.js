import 'dotenv/config';
import { client } from './client.js';
import { handleMessage } from './handlers/msgHandler.js';
import { ActivityType } from 'discord.js';

client.once('ready', () => {
  client.user.setPresence({
    activities: [{
      name: 'ur ass 👀',
      type: ActivityType.Watching,
    }],
    status: 'online',
  });
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', handleMessage);

client.login(process.env.BOT_TOKEN);
