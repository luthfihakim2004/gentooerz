import { getVoiceConnection } from '@discordjs/voice';

export default {
  name: 'voiceStateUpdate',
  once: false,
  execute(client, oldState, newState) {
    const connection = getVoiceConnection(oldState.guild.id);
    if (!connection) return;

    const channel = oldState.guild.channels.cache.get(connection.joinConfig.channelId);
    if (!channel || channel.members.size <= 1) {
      connection.destroy();
    }
  }
};
