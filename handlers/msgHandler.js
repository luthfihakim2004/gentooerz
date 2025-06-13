import { analyzeUrl } from '../utils/urlAnalyzer.js';
import { detectSpam } from '../utils/detector.js';
import { TTLMap } from '../utils/ttlMap.js';
import { getWhitelist, getBlacklist } from '../utils/filters.js';
import { incrementDeletedMessages } from '../utils/stats.js';
import { getConfig } from '../config.js';

const messageBuckets = new TTLMap();
const notifiedGuilds = new TTLMap();
const TIME_WINDOW = 10000;
const SAME_MSG_THRESHOLD = 3;
const NOTIFY_COOLDOWN = 60 * 60 * 1000;

export async function handleMessage(message) {
  if (message.author.bot || message.webhookId) return;

  const whitelist = getWhitelist();
  const blacklist = getBlacklist();
  const configEnabled = getConfig();
  const alertChannel = await message.client.channels.fetch(process.env.LOG_CHANNEL_ID);
  const guildId = message.guild.id;
  const userId = message.author.id;
  const now = Date.now();
  const content = message.content.trim();

  if (configEnabled.urlScan) {
    const urls = extractUrls(message);
    if (urls.length > 0) {
      for (const url of urls) {
        if (whitelist.some(prefix => url.startsWith(prefix))) {
          continue;
        }
        if (blacklist.some(prefix => url.startsWith(prefix))) {
          await safeDelete(message);
          continue;
        }
        const res = await analyzeUrl(url);
        if (res.malicious > 3 || res.suspicious > 3) {
          await safeDelete(message);
          incrementDeletedMessages();

          const msg = `🚨 Malicious URL from <@${userId}>: ${url} in <#${message.channel.id}>`;
          await alertChannel.send(msg);
          return; // Stop further checks
        }
      }
    }
  }

  // ✅ Anti-Spam Feature
  if (configEnabled.spam) {
    if (!messageBuckets.has(guildId)) messageBuckets.set(guildId, []);
    const bucket = messageBuckets.get(guildId);

    bucket.push({ userId, content, messageId: message.id, channelId: message.channel.id, timestamp: now });
    const recent = bucket.filter(entry => now - entry.timestamp < TIME_WINDOW);
    messageBuckets.set(guildId, recent, TIME_WINDOW);

    const { isSpam, messagesToDelete } = detectSpam(recent, userId, content, SAME_MSG_THRESHOLD);
    if (isSpam) {
      const deletedIds = new Set();
      for (const entry of messagesToDelete) {
        if (deletedIds.has(entry.messageId)) continue;
        try {
          const channel = await message.client.channels.fetch(entry.channelId);
          if (!channel.isTextBased()) continue;

          const msg = await channel.messages.fetch(entry.messageId);
          if (msg && msg.deletable) {
            await msg.delete();
            incrementDeletedMessages();
            deletedIds.add(entry.messageId);
          }
        } catch (err) {
          if (err.code !== 10008) {
            console.warn(`❌ Error deleting message ${entry.messageId}: ${err.message}`);
          }
        }
      }

      const lastNotified = notifiedGuilds.get(guildId) || 0;
      if (now - lastNotified > NOTIFY_COOLDOWN) {
        const alertMsg = `🛑 Spam detected from <@${userId}> in guild **${message.guild.name}** at <#${message.channel.id}>`;

        await alertChannel.send(alertMsg);
        notifiedGuilds.set(guildId, now);
      }
    }
  }
}

function extractUrls(message) {
  const rawUrls = message.content.match(/https?:\/\/[^\s<]+/g) || [];

  const embedUrls = message.embeds.flatMap(embed => {
    const urls = [];
    if (embed.url) urls.push(embed.url);
    if (embed.description) urls.push(...(embed.description.match(/https?:\/\/[^\s<]+/g) || []));
    if (embed.fields) {
      for (const field of embed.fields) {
        if (field.value) urls.push(...(field.value.match(/https?:\/\/[^\s<]+/g) || []));
      }
    }
    return urls;
  });

  return [...new Set([...rawUrls, ...embedUrls])];
}

async function safeDelete(message) {
  if (message.deletable) {
    try {
      await message.delete();
      incrementDeletedMessages();
    } catch (err) {
      console.error(`❌ Failed to delete message from ${message.user.id}: ${err.message}`);
    }
  } else {
    console.warn(`⚠️ Message from ${message.user.id} not deletable.`);
  }
}
