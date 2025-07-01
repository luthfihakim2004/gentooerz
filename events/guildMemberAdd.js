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
      .setAuthor({ name: 'Ketua JMK69' })
      .setColor('#ffffff')
      .setTitle('Welcome Deck!')
      .setDescription(`${member.user.tag}\n\nMAY ALL THE GAYS BURN IN HELL`)
      .setImage('attachment://welcome.gif');

    channel.send({ 
      content: `Selamat Datang Wir <@${member.id}>, Lu adalah Jawir ke ${count} di server ini, Semoga Betah gk kyk Bro Oit`,
      embeds: [embed], 
      files: [banner]
    });
  }
};
