import { Client, GatewayIntentBits, Partials } from 'discord.js';
import ttlMap from 'ttl-map';
import 'dotenv/config';
import { analyzeUrl } from './url-analyze.js';
import { logToDiscord } from './logger.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const PASSIVE_MODE = process.env.PASSIVE_MODE === 'true';
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

const TIME_WINDOW = 10_000; // 10 seconds
const SAME_MSG_THRESHOLD = 3;
const NOTIFY_COOLDOWN = 30 * 60 * 1000; // 30 minutes

const guildMessageBuckets = ttlMap({ ttl: TIME_WINDOW });
const notifiedGuilds = ttlMap({ ttl: NOTIFY_COOLDOWN });

client.once('ready', () => {
  const status = `[${PASSIVE_MODE ? 'PASSIVE_MODE' : 'ACTIVE'}]`;
  console.log(`✅ Logged in as ${client.user.tag} ${status}`);
  logToDiscord(`Bot is now online as ${client.user.tag} ${status}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const now = Date.now();
  const guildId = message.guild.id;
  const userId = message.author.id;
  const content = message.content.trim();

  const rawUrls = content.match(/https?:\/\/[^\s<]+/g) || [];
  const embedUrls = message.embeds.flatMap(embed => {
    const urls = [];
    if (embed.url) urls.push(embed.url);
    if (embed.description) urls.push(...(embed.description.match(/https?:\/\/[^\s<]+/g) || []));
    for (const field of embed.fields || []) {
      urls.push(...(field.value.match(/https?:\/\/[^\s<]+/g) || []));
    }
    return urls;
  });
  const urls = [...new Set([...rawUrls, ...embedUrls])];

  // Push to TTLMap bucket
  const bucket = guildMessageBuckets.get(guildId) || [];
  bucket.push({ userId, content, messageId: message.id, channelId: message.channel.id, timestamp: now });
  guildMessageBuckets.set(guildId, bucket);

  const recentSameContent = bucket.filter(entry =>
    entry.content === content && entry.userId === userId
  );
  const uniqueChannels = new Set(recentSameContent.map(e => e.channelId));

  if (urls.length > 0) {
    const results = await Promise.all(urls.map(url => analyzeUrl(url).then(result => ({ url, result }))));

    const malUrls = results.filter(r => r.result.malicious > 0 || r.result.suspicious > 0);
    if (malUrls.length > 0) {
      const badUrls = malUrls.map(r => r.url).join('\n');
      const logMsg = `Detected malicious URLs in message by ${message.author.tag}:\n${badUrls} at <#${message.channel.id}>`;

      if (PASSIVE_MODE) {
        console.log(`⚠️ Passive mode: Detected malicious URLs`);
        logToDiscord(`🔍 [PASSIVE MODE] ${logMsg}`);
      } else {
        try {
          if (message.deletable) await message.delete();
          logToDiscord(logMsg);

          const alertChannel = await client.channels.fetch(LOG_CHANNEL_ID);
          if (alertChannel?.isTextBased?.()) {
            await alertChannel.send(`🚨 Malicious URLs from <@${userId}>:\n${badUrls} at <#${message.channel.id}>`);
          }
        } catch (err) {
          console.error(`❌ Failed to delete message or notify: ${err.message}`);
          logToDiscord(`❌ Error processing malicious message: ${err.message}`);
        }
      }
    }
  }

  if (recentSameContent.length >= SAME_MSG_THRESHOLD || uniqueChannels.size >= 3) {
    const deletedIds = new Set();

    for (const entry of recentSameContent) {
      if (deletedIds.has(entry.messageId)) continue;
      try {
        const channel = await client.channels.fetch(entry.channelId);
        if (!channel.isTextBased()) continue;

        const msg = await channel.messages.fetch(entry.messageId);
        if (msg && msg.deletable && !PASSIVE_MODE) {
          await msg.delete();
          deletedIds.add(entry.messageId);
        }
      } catch (err) {
        if (err.code !== 10008) {
          console.warn(`❌ Error deleting message ${entry.messageId}: ${err.message}`);
        }
      }
    }

    if (deletedIds.size > 0) {
      logToDiscord(`✅ Deleted ${deletedIds.size} spam messages from ${message.author.tag}`);
    }

    if (PASSIVE_MODE) {
      logToDiscord(`🔍 [PASSIVE MODE] Detected spam by ${message.author.tag} in guild **${message.guild.name}**`);
    }

    if (!notifiedGuilds.get(guildId)) {
      const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
      if (logChannel?.isTextBased?.()) {
        await logChannel.send(`🚨 Spam detected by <@${userId}> in guild **${message.guild.name}** at <#${message.channel.id}>`);
        notifiedGuilds.set(guildId, now);
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);
