import { 
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('security')
    .setDescription('Select security modules to activate'),
  async execute(interaction) {
		const moduleSelect = new StringSelectMenuBuilder()
			.setCustomId('security')
			.setPlaceholder('Select security modules.')
			.setMinValues(1)
      .setMaxValues(2) 
      .addOptions(
      {
        label: 'Anti Spam',
        description: 'Detects repeated or spammy messages',
        value: 'spam',
      },
      {
        label: 'URL Scanner',
        description: 'Scans messages that contain links.',
        value: 'urlScan',
      },
      );

		const row1 = new ActionRowBuilder()
			.addComponents(moduleSelect);
    
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
