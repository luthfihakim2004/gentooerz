import { InteractionType } from 'discord.js';
import { cmdHandler } from '../handlers/interactions/commands.js';
import { autocmpHandler } from '../handlers/interactions/autocomplete.js';
import { btnHandler } from '../handlers/interactions/button.js';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    try {
      if (interaction.isAutocomplete()) return await autocmpHandler(client, interaction);
      if (interaction.isButton()) return await btnHandler(client, interaction);
      if (interaction.type === InteractionType.ApplicationCommand) return await cmdHandler(client, interaction);
    } catch (error) {
      console.error('Unhandled interaction error:', error);
    }
  }
}
