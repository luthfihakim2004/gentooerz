export function registerPlayerEvents(client) {
  const lavalink = client.lavalink;

  lavalink
    .on("playerCreate", (player) => {
      console.log(`🟢 Player created for guild ${player.guildId}`);
    })
    .on("playerDestroy", (player, reason) => {
      console.log(`🛑 Player destroyed for guild ${player.guildId}: ${reason}`);
    })
    .on("trackStart", (player, track) => {
      console.log(`🎶 Track started in ${player.guildId}: ${track.info.title}`);
    })
    .on("trackEnd", (player, track, payload) => {
      console.log(`⏹️ Track ended in ${player.guildId}: ${track.info.title}`);
    })
    .on("trackError", (player, track, payload) => {
      console.error(`❌ Error on track in ${player.guildId}: ${track.info.title}`, payload);
    })
    .on("trackStuck", (player, track, payload) => {
      console.warn(`⚠️ Track stuck in ${player.guildId}: ${track.info.title}`);
    })
    .on("queueEnd", (player) => {
      console.log(`📭 Queue ended in ${player.guildId}`);
    })
    .on("playerSocketClosed", (player, payload) => {
      console.warn(`🔌 Socket closed in ${player.guildId}`, payload);
    })
    .on("playerMove", (player, oldChannelId, newChannelId) => {
      console.log(`🔁 Moved player from ${oldChannelId} to ${newChannelId} in ${player.guildId}`);
    });
}
