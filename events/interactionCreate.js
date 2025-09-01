import { InteractionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { cmdHandler } from '../handlers/interactions/commands.js';
import { autocmpHandler } from '../handlers/interactions/autocomplete.js';
import { btnHandler } from '../handlers/interactions/button.js';
import { isAdmin } from '../utils/permissions.js';
import { logToDiscord } from '../utils/logger.js';
import { switchState, getConfig } from '../config.js';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(client, interaction) {
    if (interaction.isButton()) await btnHandler(client, interaction);
    
    if (interaction.type === InteractionType.ApplicationCommand) return await cmdHandler(client, interaction);

    if (interaction.isAutocomplete()) return await autocmpHandler(client, interaction);

  }
}
