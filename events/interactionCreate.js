import { handleSelectMenu } from '../handlers/selectHandler.js';
import { InteractionType, StringSelectMenuInteraction, ComponentType } from 'discord.js';
import { switchState, getConfig } from '../config.js';
import { client } from '../client.js';
import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    if (interaction.customId === 'security') {
      const allModules = ['spam', 'urlScan'];

      for (const module of allModules) {
        if (interaction.values.includes(module)) {
          switchState(module);
        }
      }

      const currentConfig = getConfig();
      const statusLines = allModules.map(module => {
        const label = module === 'spam' ? 'Anti Spam' : 'URL Scanner';
        const enabled = currentConfig[module] ? '✅' : '❌';
        return `${label}: ${enabled}`;
      }).join('\n');;

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

      return;
    }

    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error executing that command.',
        ephemeral: true,
      });
    }
  }
};
