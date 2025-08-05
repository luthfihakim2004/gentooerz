import { InteractionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { cmdHandler } from '../handlers/interactions/commands.js';
import { autocmpHandler } from '../handlers/interactions/autocomplete.js';
import { btnHandler } from '../handlers/interactions/button.js';
import { isAdmin } from '../utils/permissions.js';
import { logToDiscord } from '../utils/logger.js';
import { switchState, getConfig } from '../config.js';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    if (interaction.isButton()) {
      // 🔐 Permission check
      if (!isAdmin(interaction)) {
        // ✅ SAFER reply (with error handling)
        try {
          if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ content: '🚫 STOP! Mau ngapain anda!?', flags: MessageFlags.Ephemeral });
          } else {
            await interaction.reply({ content: '🚫 STOP! Mau ngapain anda!?', flags: MessageFlags.Ephemeral });
          }
        } catch (error) {
          console.error('Reply error (admin check):', error);
        }
        return;
      }

      const userId = interaction.user.id;
      const module = interaction.customId;
      if (['spam', 'urlScan'].includes(module)) {
        switchState(module);
        const config = getConfig();

        if(config[module] == false){
          logToDiscord(`Module ${module} turned off by <@${userId}>`);
        } else {
          logToDiscord(`Module ${module} has been turned back on`)
        }

        // ♻️ Rebuild button row
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

        // 🧾 Rebuild updated status message
        const allModules = ['spam', 'urlScan'];
        const statusLines = allModules.map(module => {
          const label = module === 'spam' ? 'Anti Spam' : 'URL Scanner';
          const enabled = config[module] ? '✅' : '❌';
          return `${label}: ${enabled}`;
        }).join('\n');

        try {
          await interaction.update({
            content: `🔒 **Security Module Status**\n${statusLines}`,
            components: [row],
          });
        } catch (error) {
          console.error('Interaction update error:', error);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Failed to update button state.', flags: MessageFlags.Ephemeral });
          }
        }

        return;
      }
    }

    if (interaction.isAutocomplete()) return await autocmpHandler(client, interaction);
    if (interaction.type !== InteractionType.ApplicationCommand) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (interaction.isButton()) return await btnHandler(client, interaction);
      if (interaction.type === InteractionType.ApplicationCommand) return await cmdHandler(client, interaction);
    } catch (error) {
      console.error('Unhandled interaction error:', error);
    }
  }
}
