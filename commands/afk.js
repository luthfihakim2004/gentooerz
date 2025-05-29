import { SlashCommandBuilder } from 'discord.js';
import { monitorVoice } from '../handlers/vcHandler.js';

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

    const afkChannelId = process.env.AFK_ROOM;
    await monitorVoice(interaction.client, member, afkChannelId);
    await interaction.reply({ content: `Joined ${voiceChannel.name} and started monitoring.`, flags: MessageFlags.Ephemeral });
  }
};
