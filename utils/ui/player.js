import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

export function playerMenu(track, user, player) {
  const embed = new EmbedBuilder()
    .setColor('#DDDFFF')
    .setTitle('🎶 Playing')
    .setDescription(`**${track.info.title}** - [${track.info.author}](${track.info.uri})\n• \`(${formatDuration(track.info.duration)})\`\n• Requested by <@${user.id}>`)
    .setThumbnail(track.info.artworkUrl || null)
    .setFooter({ text: `🔁 Repeat mode: ${player.repeatMode}` });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('rewind').setLabel('Rewind').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('play-pause').setLabel('Play/Pause').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Success),
    //new ButtonBuilder().setCustomId('skip').setLabel('SKIP').setStyle(ButtonStyle.Success),
  );
     
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('queue').setLabel('Queue').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('loop').setLabel('Loop').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
    //new ButtonBuilder().setCustomId('back').setLabel('Back').setStyle(ButtonStyle.Success),
    //new ButtonBuilder().setCustomId('replay').setLabel('REPLAY').setStyle(ButtonStyle.Success)
  );

  return {
    embeds: [embed],
    components: [row1, row2]
  };
}

function formatDuration(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${min}:${sec}`;
}
