//import { MessageFlags, SlashCommandBuilder } from 'discord.js';
//import { availSources } from '../lavaEvents/nodes.js';
//import { client } from '../client.js';
//import { playerMenu } from '../utils/ui/player.js';
//
//export default {
//  data: new SlashCommandBuilder()
//    .setName('play')
//    .setDescription('Play an audio from an lavalink source')
//    .addStringOption(option =>
//      option.setName('source')
//        .setDescription('Select available sources')
//        .setRequired(true)
//        .setAutocomplete(true)
//        .addChoices(
//          ...availSources
//        )
//    )
//    .addStringOption(option =>
//      option.setName('query')
//        .setDescription('Song title or artist')
//        .setRequired(true)
//    ),
//
//  async execute(interaction) {
//    try{
//      await interaction.deferReply();
//
//      const query = interaction.options.getString('query');
//      const source = interaction.options.getString('source');
//      
//      if (!availSources.includes(source)){
//        return interaction.reply({ content: '❌ Invalid lavalink source selected.', flags: MessageFlags.Ephemeral });
//      }
//
//      const vc = interaction.member.voice.channel;
//      if (!vc) return interaction.reply({ content: '❗ Join a voice channel first.', flags: MessageFlags.Ephemeral });
//
//      const player = client.lavalink.createPlayer({
//        guildId: interaction.guild.id,
//        voiceChannelId: interaction.member.voice.channelId,
//        textChannelId: interaction.channel.id,
//        selfDeaf: true,
//        volume: 100
//      });
//      //console.log("player created...")
//      await player.connect(interaction.member.voice.channelId, { deaf: true });
//
//      const search = await player.search({ query, source });
//      if (!search || !search.tracks.length)
//        return interaction.reply('❌ No results found.');
//
//      const track = search.tracks[0];
//      await player.queue.add(track);
//
//      if (player.playing || player.paused){
//        return interaction.editReply({ content: `Added ${track.info.title} to the queue.`, flags: MessageFlags.Ephemeral}); 
//      }
//
//      await player.play();
//      
//      //const menuMsg = await interaction.followUp(playerMenu(track, interaction.user, player));
//      const menuMsg = await interaction.editReply(playerMenu(track, interaction.user, player));
//
//      player.messageId = menuMsg.id;
//    }catch(err){
//      //console.error("❌ /play failed:", err);
//
//      if (interaction.deferred || interaction.replied) {
//        await interaction.editReply('❌ Failed to play the track.');
//      }
//    }
//  },
//
//  autocomplete: async (interaction) => {
//  const focusedValue = interaction.options.getFocused();
//  const choices = availSources; 
//
//  const filtered = choices
//    .filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()))
//    .slice(0, 25); // Discord max autocomplete entries = 25
//
//  await interaction.respond(
//    filtered.map(choice => ({ name: choice, value: choice }))
//  );
//}
//};
//
//
