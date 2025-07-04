export async function autocmpHandler(client, interaction) {
  const command = client.commands.get(interaction.commandName);
  if (!command?.autocomplete) return;

  try {
    await command.autocomplete(interaction);
  } catch (err) {
    console.error('Autocomplete Error:', err);
  }
}
