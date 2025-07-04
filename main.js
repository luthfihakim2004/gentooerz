import 'dotenv/config';
import fs from 'fs';
import pkg from 'discord.js';
import path from 'path';
import { client } from './client.js';
import { fileURLToPath } from 'url';

const { Collection } = pkg;

client.commands = new Collection();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Load events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = await import(`./events/${file}`);
  const eventName = file.replace('.js', '');
  if (event.default.once) {
    client.once(eventName, (...args) => event.default.execute(client, ...args));
  } else {
    client.on(eventName, (...args) => event.default.execute(client, ...args));
  }
}

const lavaEventFiles = fs.readdirSync(path.join(__dirname, 'lavaEvents')).filter(f => f.endsWith('.js'));
for (const file of lavaEventFiles) {
  const lavaEvent = await import(`./lavaEvents/${file}`);
  // Each should export a function like `registerNodeEvents(client)`
  if (typeof lavaEvent.registerNodeEvents === 'function') {
    lavaEvent.registerNodeEvents(client);
  } else if (typeof lavaEvent.registerPlayerEvents === 'function') {
    lavaEvent.registerPlayerEvents(client);
  }
}

client.login(process.env.DISCORD_TOKEN);
