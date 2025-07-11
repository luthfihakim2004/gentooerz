import { MessageFlags } from 'discord.js';

export async function cmdHandler(client, interaction) {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Command execution error:', error);
    const replyPayload = {
      flags: MessageFlags.Ephemeral,
      content: 'There was an error executing that command.',
    };

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyPayload);
      } else {
        await interaction.reply(replyPayload);
      }
    } catch (followupError) {
      console.error('Failed to send error reply:', followupError);
    }
  }
}
