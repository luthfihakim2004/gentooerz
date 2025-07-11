import { MessageFlags } from 'discord.js';
import { playerMenu } from '../../../utils/ui/player.js';

export async function playerBtn(client, interaction) {
  const player = client.lavalink.getPlayer(interaction.guildId);
  if (!player) {
    return interaction.reply({ content: '❌ No player found.', flags: MessageFlags.Ephemeral });
  }

  const msg = await interaction.message.fetch();
  const curStat = msg.embeds[0];

  if (interaction.customId === 'play-pause') {
    const newTitle = player.paused ? '🎶 Playing' : '⏸ Paused';
    player.paused ? await player.resume() : await player.pause();

    const updated = { ...curStat.toJSON(), title: newTitle };
    await interaction.update({ embeds: [updated], components: msg.components });
  }

  if (interaction.customId === 'loop') {
    const loop = ['off', 'track', 'queue'];
    let current = player.repeatMode;
    let nextIndex = (loop.indexOf(current) + 1) % loop.length;
    let next = loop[nextIndex];

    await player.setRepeatMode(next);

    const updated = {
      ...curStat.toJSON(),
      footer: { text: `🔁 Repeat mode: ${next}` }
    };
    await interaction.update({ embeds: [updated], components: msg.components });
  }

  if (interaction.customId === 'next') {
    await player.skip();

    const newMsg = await player.queue.current;
    const updated = playerMenu(newMsg, newMsg.requester, player);
    await interaction.update(updated);
  }

  if (interaction.customId === 'rewind') {
    await player.play();
    await interaction.deferUpdate();
  }
  
  if (interaction.customId === 'stop') {
    await player.destroy(`Player has been stopped by ${interaction.user.id}`, false);
    
    const updated = {
      title: `Player has been stopped by ${interaction.user.username}` 
    };
    await interaction.update({ embeds: [updated], components: []});
  }
}
