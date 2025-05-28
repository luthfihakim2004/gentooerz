import 'dotenv/config';
import { client } from './client.js';
import { handleMessage } from './handlers/msgHandler.js';
import { ActivityType } from 'discord.js';
import { logToDiscord } from './utils/logger.js'

const PASSIVE_MODE = process.env.PASSIVE_MODE === 'true';

client.once('ready', () => {
  client.user.setPresence({
    activities: [{
      name: 'ur ass 👀',
      type: ActivityType.Watching,
    }],
    status: 'online',
  });
  if(PASSIVE_MODE){
    console.log(`✅ Logged in as ${client.user.tag} [PASSIVE_MODE]`);
    logToDiscord(`Bot is now online as ${client.user.tag} [PASSIVE_MODE]`);
  }else{
    console.log(`✅ Logged in as ${client.user.tag}`);
    logToDiscord(`Bot is now online as ${client.user.tag}`);
  }
});

client.on('messageCreate', handleMessage);

client.login(process.env.BOT_TOKEN);
