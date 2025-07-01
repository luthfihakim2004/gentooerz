import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: 'guildMemberRemove',
  once: false,
  async execute(client, member) {
    const channel = client.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
    if (!channel) return;
    
    const bannerPath = path.join(__dirname, '..', 'assets', 'bye.jpg');
    const bannerImage = await loadImage(bannerPath);

    const avatarURL = member.displayAvatarURL({ extension: 'jpg', size: 256 });
    const avatarArrayBuffer = await fetch(avatarURL).then(res => res.arrayBuffer());
    const avatarBuffer = Buffer.from(avatarArrayBuffer);
    const avatarImage = await loadImage(avatarBuffer);

    const canvas = createCanvas(bannerImage.width, bannerImage.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bannerImage, 0, 0, canvas.width, canvas.height);

    const avatarSize = 128;
    const avatarX = canvas.width - avatarSize - 210;
    const avatarY = 175;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    const buffer = await canvas.encode('jpeg');
    const attachment = new AttachmentBuilder(buffer, { name: 'bye.jpg' });

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Good Bye :wave: :wave:' })
      .setColor('#ffffff')
      .setTitle('さようなら')
      .setDescription(`${member.user.tag}\n\nCYA`)
      .setImage('attachment://bye.jpg');

    channel.send({ 
      content: `SAD NEWS! <@${member.id}> is leaving the ${client.guild.name}`,
      embeds: [embed], 
      files: [attachment]
    });
  }
};
