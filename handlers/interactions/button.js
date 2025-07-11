import { playerBtn } from './buttons/player.js';
import { secBtn } from './buttons/security.js';
import { MessageFlags } from 'discord.js';

export async function btnHandler(client, interaction) {
  const musicButtons = ['play-pause', 'loop', 'next', 'rewind', 'stop'];
  const securityButtons = ['spam', 'urlScan'];

  if (musicButtons.includes(interaction.customId)) {
    return playerBtn(client, interaction);
  }

  if (securityButtons.includes(interaction.customId)) {
    return secBtn(client, interaction);
  }

  // default fallback
  return interaction.reply({ content: '❓ Unknown button action.', flags: MessageFlags.Ephemeral });
}
