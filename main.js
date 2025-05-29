import 'dotenv/config';
import { client } from './client.js';
import { handleMessage } from './handlers/msgHandler.js';
import { ActivityType, Collection } from 'discord.js';
import { logToDiscord } from './utils/logger.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPassiveMode } from './config.js';
import { getVoiceConnection } from '@discordjs/voice';

client.commands = new Collection();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
});

client.once('ready', async () => {
  client.user.setPresence({
    activities: [{
      name: 'ur ass 👀',
      type: ActivityType.Watching,
    }],
    status: 'online',
  });
  if(getPassiveMode()){
    console.log(`✅ Logged in as ${client.user.tag} [PASSIVE_MODE]`);
    logToDiscord(`Bot is now online as ${client.user.tag} [PASSIVE_MODE]`);
  }else{
    console.log(`✅ Logged in as ${client.user.tag}`);
    logToDiscord(`Bot is now online as ${client.user.tag}`);
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const connection = getVoiceConnection(oldState.guild.id);
  if (!connection) return;

  const channel = oldState.guild.channels.cache.get(connection.joinConfig.channelId);
  if (!channel || channel.members.size <= 1) {
    //console.log(`[DISCONNECT] Leaving voice channel: ${channel.name}`);
    connection.destroy();
  }
});

client.on('messageCreate', handleMessage);


client.login(process.env.DISCORD_TOKEN);
