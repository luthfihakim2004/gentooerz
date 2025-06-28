import { getVoiceConnection } from '@discordjs/voice';

export default {
  name: 'voiceStateUpdate',
  once: false,
  async execute(client, oldState, newState) {
    if (oldState.channelId === newState.channelId) return;

    const connection = getVoiceConnection(oldState.guild.id);
    if (!connection) return;

    let channel = oldState.guild.channels.cache.get(connection.joinConfig.channelId);
    if (!channel) {
      try {
        channel = await oldState.guild.channels.fetch(connection.joinConfig.channelId);
      } catch (e) {
        console.error('[voiceStateUpdate] Failed to fetch channel:', e);
        return;
      }
    }

    const botMember = channel.members.get(client.user.id);
    if (!botMember || channel.members.size <= 1) {
      connection.destroy();
    }
  }
};
