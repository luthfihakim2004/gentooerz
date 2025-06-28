import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from 'discord.js';

import { enableModule, disableModule, config } from '../config.js';

export async function handleSelectMenu(interaction) {
  if (interaction.customId !== 'security') return;

  const allModules = ['spam', 'urlScan'];

  for (const module of allModules) {
    if (interaction.values.includes(module)) {
      enableModule(module);
    } else {
      disableModule(module);
    }
  }

  const statusLines = allModules.map(module => {
    const label = module === 'spam' ? 'Anti Spam' : 'URL Scanner';
    const enabled = config[module] ? '✅' : '❌';
    return `${label}: ${enabled}`;
  }).join('\n');

  const updatedMenu = new StringSelectMenuBuilder()
    .setCustomId('security')
    .setPlaceholder('Select security modules.')
    .setMinValues(0)
    .setMaxValues(allModules.length)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Anti Spam')
        .setDescription('Detects repeated or spammy messages')
        .setValue('spam'),
      new StringSelectMenuOptionBuilder()
        .setLabel('URL Scanner')
        .setDescription('Scans messages that contain links.')
        .setValue('urlScan'),
    );

  const updatedRow = new ActionRowBuilder().addComponents(updatedMenu);

  await interaction.update({
    content: `🔒 **Security Module Status**\n${statusLines}`,
    components: [updatedRow],
  });
}
