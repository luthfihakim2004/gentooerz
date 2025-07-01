import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: 'guildMemberAdd',
  once: false,
  async execute(client, member) {
    const channel = client.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return;
    
    const count = member.guild.memberCount;

    const banner = new AttachmentBuilder(path.join(__dirname, '..', 'assets', 'welcome.gif'), { name: 'welcome.gif' });

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Greeting' })
      .setColor('#ffffff')
      .setTitle('Welcome!')
      .setDescription(`${member.user.tag}\n\nMAY ALL THE BLESS WITH U`)
      .setImage('attachment://welcome.gif');

    channel.send({ 
      content: `Welcome <@${member.id}>, u are the ${count} member here.`,
      embeds: [embed], 
      files: [banner]
    });
  }
};
