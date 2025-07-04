import { isAdmin } from '../../utils/permissions.js';
import { getConfig, switchState } from '../../config.js';
import { logToDiscord } from '../../utils/logger.js';
import {
  ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags
} from 'discord.js';

export async function btnHandler(client, interaction) {
  if (!isAdmin(interaction)) {
    try {
      const method = interaction.deferred || interaction.replied ? 'followUp' : 'reply';
      await interaction[method]({
        content: '🚫 STOP! Mau ngapain anda!?',
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Reply error (admin check):', error);
    }
    return;
  }

  const userId = interaction.user.id;
  const module = interaction.customId;
  const validModules = ['spam', 'urlScan'];

  if (!validModules.includes(module)) return;

  switchState(module);
  const config = getConfig();

  logToDiscord(`Module ${module} ${config[module] ? 'enabled' : 'disabled'} by <@${userId}>`);

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

  const statusText = validModules.map(mod => {
    const label = mod === 'spam' ? 'Anti Spam' : 'URL Scanner';
    const status = config[mod] ? '✅' : '❌';
    return `${label}: ${status}`;
  }).join('\n');

  try {
    await interaction.update({
      content: `🔒 **Security Module Status**\n${statusText}`,
      components: [row],
    });
  } catch (error) {
    console.error('Interaction update error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Failed to update button state.', flags: MessageFlags.Ephemeral });
    }
  }
}
