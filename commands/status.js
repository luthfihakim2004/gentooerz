import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getPassiveMode } from '../config.js';
import { botStats } from '../utils/stats.js'; // you’ll make this below
import { duration } from '../utils/time.js'; // optional helper

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show bot status and runtime info'),
  async execute(interaction) {
    const passive = getPassiveMode();
    const uptime = duration(process.uptime() * 1000); // uptime in milliseconds

    await interaction.reply({
      //flags: MessageFlags.Ephemeral,
      content: [
        `🤖 **Gentooerz** by **<@328317837904969729>**`,
        `⏱ Uptime: ${uptime}`,
        `⚙️ Mode: ${passive ? 'Passive' : 'Active'}`,
        `🧠 Version: ${process.env.npm_package_version || 'dev'}`,
        `🗑 Messages Deleted: ${botStats.deletedMessages}`,
      ].join('\n'),
    });
  }
};
