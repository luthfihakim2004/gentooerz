import { isAdmin } from '../utils/permissions.js';
import { InteractionType } from 'discord.js';
import { switchState, getConfig } from '../config.js';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    if (interaction.isButton()){
      if (!isAdmin(interaction)) {
        return interaction.reply({ content: '🚫 STOP! Mau ngapain anda!?', flags: MessageFlags.Ephemeral });
      }
      const module = interaction.customId;
      if (['spam', 'urlScan'].includes(module)) {
        switchState(module);
      
        const config = getConfig();

      // Rebuild button row
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('spam')
            .setLabel('Anti Spam')
            .setStyle(config.spam ? ButtonStyle.Success : ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('urlScan')
            .setLabel('URL Scanner')
            .setStyle(config.urlScan ? ButtonStyle.Success : ButtonStyle.Danger)
        );

        // Rebuild updated status message
        const allModules = ['spam', 'urlScan'];
        const statusLines = allModules.map(module => {
          const label = module === 'spam' ? 'Anti Spam' : 'URL Scanner';
          const enabled = config[module] ? '✅' : '❌';
          return `${label}: ${enabled}`;
        }).join('\n');

        await interaction.update({
          content: `🔒 **Security Module Status**\n${statusLines}`,
          components: [row],
        });
        return;
      }
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
