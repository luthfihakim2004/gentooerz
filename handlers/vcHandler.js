import {
  joinVoiceChannel,
  getVoiceConnection,
  EndBehaviorType,
  entersState,
  VoiceReceiver,
  VoiceConnectionStatus
} from '@discordjs/voice';

const afkTimeoutMs = 60 * 60 * 1000;
const trackedUsers = new Map(); // userId => lastSpokeTimestamp

export async function monitorVoice(client, member, afkChannelId) {
  const voiceChannel = member.voice.channel;
  const mainChannel = await client.channels.fetch(process.env.GENERAL_ROOM);
  if (!voiceChannel) return;

  // Join the same VC
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: true,
  });

  await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

  const receiver = connection.receiver;

  receiver.speaking.on('start', userId => {
    trackedUsers.set(userId, Date.now());
    //console.log(`[SPEAKING] ${userId} started speaking`);
  });

  receiver.speaking.on('end', userId => {
    //console.log(`[SPEAKING] ${userId} stopped speaking`);
  });

  setInterval(async () => {
    const now = Date.now();
    for (const [userId, lastSpoke] of trackedUsers.entries()) {
      const inactiveMs = now - lastSpoke;

      //AFK logic
      if (inactiveMs > afkTimeoutMs) {
        const guildMember = await voiceChannel.guild.members.fetch(userId).catch(() => null);
        if (
          guildMember &&
          guildMember.voice.channelId === voiceChannel.id &&
          guildMember.voice.channelId !== afkChannelId &&
          !guildMember.user.bot
        ) {
          const afkChannel = voiceChannel.guild.channels.cache.get(afkChannelId);
          if (!afkChannel) return;
          //console.log(`[AFK MOVE] Moving ${guildMember.user.tag} to AFK`);
          await guildMember.voice.setChannel(afkChannel);
          const msg = `Sianying <@${userId}> lagi coli cuy!`;
          await mainChannel.send(msg);
          trackedUsers.delete(userId);
        }
      }
    }
  }, 10_000);

  connection.on('stateChange', (oldState, newState) => {
    if (newState.status === VoiceConnectionStatus.Destroyed) {
      //console.log('[CLEANUP] Voice connection destroyed, clearing tracked users.');
      trackedUsers.clear();
    }
  });
}
