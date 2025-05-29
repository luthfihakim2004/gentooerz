import 'dotenv/config';
import { Collection } from 'discord.js';

const userActivity = new Collection();
const afkChannelId = process.env.AFK_ROOM;
const afkTimeoutMs = 30 * 60 * 1000;
const checkIntervalMs = 60 * 60 * 1000;

export async function setupAfkHandler(client) {
  const mainChannel = await client.channels.fetch(process.env.GENERAL_ROOM);
  
  client.on('voiceStateUpdate', (oldState, newState) => {
    console.log(`[VOICE] ${newState.member?.user?.tag} changed voice state`);
    const member = newState.member;
    if (member.user.bot) return;

    // User joins or switches to non-AFK channel
    if (newState.channelId && newState.channelId !== afkChannelId) {
      userActivity.set(member.id, Date.now());
    }

    // User leaves voice or goes into AFK channel
    if (!newState.channelId || newState.channelId === afkChannelId) {
      userActivity.delete(member.id);
    }
  });

  setInterval(async () => {
    const now = Date.now();
    client.guilds.cache.forEach(guild => {
      const afkChannel = guild.channels.cache.get(afkChannelId);
      if (!afkChannel) return;

      guild.members.cache.forEach(async member => {
        const voice = member.voice;
        if (!voice?.channel || voice.channel.id === afkChannelId || member.user.bot) return;

        const lastSeen = userActivity.get(member.id) || now;
        const inactive = now - lastSeen;

        if (inactive >= afkTimeoutMs) {
          const msg = `Sianying <@${member.id}> lagi coli cuy!`; // also fixed undefined `userId`
          try {
            await mainChannel.send(msg);
            await member.voice.setChannel(afkChannel);
            //console.log(`Moved ${member.user.tag} to AFK channel.`);
          } catch (err) {
            console.warn(`Failed to move ${member.user.tag}:`, err.message);
          }
        }
      });
    });
  }, checkIntervalMs);
}
