import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { isAdmin } from '../utils/permissions.js';
import { config, setPassiveMode } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('togglepassive')
    .setDescription('Toggle passive mode (global, for now)'),
  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '🚫 STOP! Mau ngapain anda!?', flags: MessageFlags.Ephemeral });
    }

    const newState = !config.passive;
    setPassiveMode(newState);

    await interaction.reply({
      content: `✅ Passive mode is now **${newState ? 'enabled' : 'disabled'}**.`,
      flags: MessageFlags.Ephemeral,
    });
  }
};
