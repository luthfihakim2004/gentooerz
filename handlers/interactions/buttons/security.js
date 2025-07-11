import {
  ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags
} from 'discord.js';
import { isAdmin } from '../../../utils/permissions.js';
import { getConfig, switchState } from '../../../config.js';
import { logToDiscord } from '../../../utils/logger.js';

const validModules = ['spam', 'urlScan'];

export async function secBtn(client, interaction) {
  if (!isAdmin(interaction)) {
    const method = interaction.deferred || interaction.replied ? 'followUp' : 'reply';
    return interaction[method]({
      content: '🚫 STOP! Mau ngapain anda!?',
      flags: MessageFlags.Ephemeral
    });
  }

  const module = interaction.customId;
  if (!validModules.includes(module)) return;

  const userId = interaction.user.id;
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

  await interaction.update({
    content: `🔒 **Security Module Status**\n${statusText}`,
    components: [row],
  });
}
