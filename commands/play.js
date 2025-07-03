import { SlashCommandBuilder } from 'discord.js';
import { searchTrack } from '../utils/spotify.js';
import { client } from '../client.js';
// You’ll also need to add YouTube audio handling (e.g., Lavalink, ytdl-core, etc.)

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from Spotify')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song title or artist')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    await interaction.deferReply();

    const result = await searchTrack(query);
    if (!result) return interaction.editReply('❌ No results found on Spotify.');
    const searchQuery = `${result.name} ${result.artist}`;
    
    const vc = interaction.member.voice.channel;
    if (!vc) return interaction.editReply('❗ Join a voice channel first.');

    console.log('before player');
    const player = client.lavalink.createPlayer({
      guildId: interaction.guild.id,
      voiceChannelId: interaction.member.voice.channelId,
      textChannelId: interaction.channel.id,
      selfDeaf: true,
      volume: 100
    });
    await player.connect(interaction.member.voice.channelId, { deaf: true });

    console.log('after player');
    
    const search = await player.search({
      query,
      source: 'ytsearch' // or 'ytmsearch' for YouTube Music
    });

    if (!search || !search.tracks.length)
      return interaction.editReply('❌ No results found.');

    const track = search.tracks[0];
    player.queue.add(track);

    if (!player.playing && !player.paused) player.play();
    setTimeout(() => {
        console.log(player.queue.current);
        console.log('Is playing:', player.playing);
        console.log('Node VC status:', player.node.connectionStatus); // Should be CONNECTED
    }, 3000);

    await interaction.editReply({
      content: `🎶 **${result.name}** by *${result.artist}* — Now playing!`,
      embeds: [{
        color: 0x1DB954,
        title: result.name,
        url: result.url,
        description: `by ${result.artist}`,
        thumbnail: { url: result.thumbnail },
        footer: { text: `Duration: ${(result.duration_ms / 60000).toFixed(2)} mins` }
      }]
    });
  }
};
