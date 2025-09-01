import { setPlayerData, delPlayerData } from '../utils/audio.js';
import { playerMenu } from '../utils/ui/player.js';

export function registerPlayerEvents(client) {
  const lavalink = client.lavalink;

  lavalink
    .on("playerCreate", (player) => {
      console.log(`🟢 Player created for guild ${player.guildId}`);
    })
    .on("playerUpdate", (oldPlayer, newPlayer) => {
      setPlayerData(newPlayer.guildId, newPlayer.toJSON());
    })
    .on("playerDestroy", (player, reason) => {
      delPlayerData(player.guildId);
      console.log(`🛑 Player destroyed for guild ${player.guildId}: ${reason}`);
    })
    .on("trackStart", (player, track) => {
      console.log(`🎶 Track started in ${player.guildId}: ${track.info.title}`);
    })
    .on("trackEnd", async (player, track, payload) => {
      console.log(`⏹️ Track ended in ${player.guildId}: ${track.info.title}`);
      
      const nextTrack = player.queue.current;
      if (!nextTrack) return;

      const channel = await client.channels.fetch(player.textChannelId);
      if (!channel || !player.messageId) return;

      try {
        const msg = await channel.messages.fetch(player.messageId);

        // Regenerate the embed/buttons with the new track
        const updatedMenu = playerMenu(nextTrack, nextTrack.requester || null, player);

        // Edit the original message
        await msg.edit(updatedMenu);
      } catch (err) {
        console.error(`❌ Failed to update player message:`, err);
      }
    })
    .on("trackError", (player, track, payload) => {
      console.error(`❌ Error on track in ${player.guildId}: ${track.info.title}`, payload);
    })
    .on("trackStuck", (player, track, payload) => {
      console.warn(`⚠️ Track stuck in ${player.guildId}: ${track.info.title}`);
    })
    .on("queueEnd", async (player) => {
      //console.log(`📭 Queue ended in ${player.guildId}`);

      const channel = await client.channels.fetch(player.textChannelId);
      if (!channel || !player.messageId) return;

      try {
        const msg = await channel.messages.fetch(player.messageId);
        await msg.delete();
      } catch (err) {
        console.error(`❌ Failed to delete player menu:`, err);
      }

      player.destroy('Queue Ended');
    })
    .on("playerSocketClosed", (player, payload) => {
      console.warn(`🔌 Socket closed in ${player.guildId}`, payload);
    })
    .on("playerMove", (player, oldChannelId, newChannelId) => {
      console.log(`🔁 Moved player from ${oldChannelId} to ${newChannelId} in ${player.guildId}`);
    });
}
