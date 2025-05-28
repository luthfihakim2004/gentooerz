import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { addToWhitelist, removeFromWhitelist, getWhitelist } from '../utils/filters.js';
import { isAdmin } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Manage URL whitelist')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a URL to whitelist')
        .addStringOption(opt => opt.setName('url').setDescription('The URL').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a URL from whitelist')
        .addStringOption(opt => opt.setName('url').setDescription('The URL').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Show current whitelist')),

  async execute(interaction) {
    if (!isAdmin(interaction)) {
      return interaction.reply({ content: '🚫 STOP! Mau ngapain anda!?', flags: MessageFlags.Ephemeral });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const url = interaction.options.getString('url');
      addToWhitelist(url);
      return interaction.reply({ content: `✅ Whitelisted: ${url}`, flags: MessageFlags.Ephemeral });
    } else if (sub === 'remove') {
      const url = interaction.options.getString('url');
      removeFromWhitelist(url);
      return interaction.reply({ content: `🗑️ Removed from whitelist: ${url}`, flags: MessageFlags.Ephemeral });
    } else if (sub === 'list') {
      const list = getWhitelist();
      return interaction.reply({ content: `📄 Whitelist:\n${list.join('\n') || 'Empty'}`, flags: MessageFlags.Ephemeral });
    }
  }
};
