import { secBtn } from './buttons/security.js';
import { MessageFlags, ButtonInteraction } from 'discord.js';

export async function btnHandler(client, interaction) {
  const securityButtons = ['spam', 'urlScan'];

  //console.log("entering btn handler")

  if (securityButtons.includes(interaction.customId)) {
    return secBtn(client, interaction);
  }

  // default fallback
  return interaction.reply({ content: '❓ Unknown button action.', flags: MessageFlags.Ephemeral });
}
