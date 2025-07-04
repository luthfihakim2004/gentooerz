import { SlashCommandBuilder } from 'discord.js';
import { availSources } from '../lavaEvents/nodes.js';
import { client } from '../client.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play an audio from an lavalink source')
    .addStringOption(option =>
      option.setName('source')
        .setDescription('Select available sources')
        .setRequired(true)
        .setAutocomplete(true)
        .addChoices(
          ...availSources
        )
    )
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song title or artist')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const source = interaction.options.getString('source');
    await interaction.deferReply();

    if (!availSources.includes(source)){
      return interaction.editReply('❌ Invalid source selected.');
    }

    const vc = interaction.member.voice.channel;
    if (!vc) return interaction.editReply('❗ Join a voice channel first.');

    const player = client.lavalink.createPlayer({
      guildId: interaction.guild.id,
      voiceChannelId: interaction.member.voice.channelId,
      textChannelId: interaction.channel.id,
      selfDeaf: true,
      volume: 100
    });
    await player.connect(interaction.member.voice.channelId, { deaf: true });

    const search = await player.search({ query, source });

    if (!search || !search.tracks.length)
      return interaction.editReply('❌ No results found.');

    const track = search.tracks[0];
    await player.queue.add(track);
    console.log(track);

    if (!player.playing && !player.paused) await player.play();
   // setTimeout(() => {
   //     console.log(player.queue.current);
   //     console.log('Is playing:', player.playing);
   //     console.log('Node VC status:', player.node.connectionStatus); // Should be CONNECTED
   // }, 3000);

    await interaction.editReply({
      content: `🎶 **${track.info.title}** by *${track.info.author}* — Now playing!`,
      embeds: [{
        color: 0x1DB954,
        title: track.info.title,
        url: track.info.uri,
        description: `by ${track.info.author}`,
        thumbnail: { url: track.info.artworkUrl },
        footer: { text: `Duration: ${(track.info.duration / 60000).toFixed(2)} mins` }
      }]
    });
  },

  autocomplete: async (interaction) => {
  const focusedValue = interaction.options.getFocused();
  const choices = availSources; // from your Lavalink connection

  const filtered = choices
    .filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
    .slice(0, 25); // Discord max autocomplete entries = 25

  await interaction.respond(
    filtered.map(choice => ({ name: choice, value: choice }))
  );
}
};


