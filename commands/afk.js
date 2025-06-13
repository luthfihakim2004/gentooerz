import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { monitorVoice } from '../handlers/vcHandler.js';
import { logToDiscord } from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Monitoring ur ass'),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({ content: 'You need to be in a voice channel first.', flags: MessageFlags.Ephemeral });
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
     try {
       const afkChannelId = process.env.AFK_ROOM;

      await monitorVoice(interaction.client, member, afkChannelId);

      await interaction.editReply({
        content: `✅ Joined ${voiceChannel.name} and started monitoring.`
      });
       //console.log(voiceChannel)
      logToDiscord(`Monitoring ${voiceChannel.name}...`);
    
     } catch (error) {
      console.error('💥 monitorVoice() error:', error);
      await interaction.editReply({
        content: '❌ Failed to join and monitor. Please try again later.'
      });
    }  
  }
};
