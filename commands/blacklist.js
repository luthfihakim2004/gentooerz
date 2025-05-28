import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { addToBlacklist, removeFromBlacklist, getBlacklist } from '../utils/filters.js';
import { isAdmin } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage URL blacklist')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a URL to blacklist')
        .addStringOption(opt => opt.setName('url').setDescription('The URL').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a URL from blacklist')
        .addStringOption(opt => opt.setName('url').setDescription('The URL').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Show current blacklist')),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '🚫 STOP! Mau ngapain anda!?', flags: MessageFlags.Ephemeral });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const url = interaction.options.getString('url');
      addToBlacklist(url);
      return interaction.reply({ content: `🚫 Blacklisted: ${url}`, flags: MessageFlags.Ephemeral });
    } else if (sub === 'remove') {
      const url = interaction.options.getString('url');
      removeFromBlacklist(url);
      return interaction.reply({ content: `🗑️ Removed from blacklist: ${url}`, flags: MessageFlags.Ephemeral });
    } else if (sub === 'list') {
      const list = getBlacklist();
      return interaction.reply({ content: `📄 Blacklist:\n${list.join('\n') || 'Empty'}`, flags: MessageFlags.Ephemeral });
    }
  }
};
