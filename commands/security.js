import { 
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder
} from 'discord.js';
import { config, getConfig } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('security')
    .setDescription('Select security modules to activate'),
  async execute(interaction) {
    const config = getConfig();
		const row1 = new ActionRowBuilder()
			.addComponents(
        new ButtonBuilder()
          .setCustomId('spam')
          .setLabel('Anti Spam')
          .setStyle(config.spam ? ButtonStyle.Success : ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('urlScan')
          .setLabel('URL Scanner')
          .setStyle(config.urlScan ? ButtonStyle.Success : ButtonStyle.Danger)
      );
    
    const allModules = ['spam', 'urlScan'];
    const statusLines = allModules.map(module => {
      const label = module === 'spam' ? 'Anti Spam' : 'URL Scanner';
      const enabled = config[module] ? '✅' : '❌';
      return `${label}: ${enabled}`;
    }).join('\n');
		
    await interaction.reply({
      content: `🔒 **Security Module Status**\n${statusLines}`,
			components: [row1],
		});

  }
};
