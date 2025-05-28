import { analyzeUrl } from '../utils/urlAnalyzer.js';
import { detectSpam } from '../utils/detector.js';
import { TTLMap } from '../utils/ttlMap.js';

const messageBuckets = new TTLMap();
const notifiedGuilds = new TTLMap();
const TIME_WINDOW = 10000;
const SAME_MSG_THRESHOLD = 3;
const NOTIFY_COOLDOWN = 60 * 60 * 1000;
const PASSIVE_MODE = process.env.PASSIVE_MODE == 'true';

export async function handleMessage(message) {
  if (message.author.bot || !message.guild) return;

  const alertChannel = await message.client.channels.fetch(process.env.LOG_CHANNEL_ID);
  const guildId = message.guild.id;
  const userId = message.author.id;
  const now = Date.now();
  const content = message.content.trim();

  const urls = extractUrls(message);
  if (urls.length > 0) {
    for (const url of urls) {
      const res = await analyzeUrl(url);
      if (res.malicious > 0 || res.suspicious > 3) {
        if (!PASSIVE_MODE) {
          await safeDelete(message);
        }
        const msg = `${
          PASSIVE_MODE ? '🔍 [Passive Mode]' : '🚨'
        } Malicious URL from <@${userId}>: ${url} at <#${message.channel.id}>`;

        await alertChannel.send(msg);
        return;
      }
    }
  }

  if (!messageBuckets.has(guildId)) messageBuckets.set(guildId, []);
  const bucket = messageBuckets.get(guildId);

  bucket.push({ userId, content, messageId: message.id, channelId: message.channel.id, timestamp: now });
  const recent = bucket.filter(entry => now - entry.timestamp < TIME_WINDOW);
  messageBuckets.set(guildId, recent, TIME_WINDOW);

  const { isSpam, messagesToDelete } = detectSpam(recent, userId, content, SAME_MSG_THRESHOLD);
  if (isSpam) {
    const deletedIds = new Set();

    if (!PASSIVE_MODE) {
      for (const entry of messagesToDelete) {
        if (deletedIds.has(entry.messageId)) continue;
        try {
          const channel = await message.client.channels.fetch(entry.channelId);
          if (!channel.isTextBased()) continue;

          const msg = await channel.messages.fetch(entry.messageId);
          if (msg && msg.deletable) {
            await msg.delete();
            deletedIds.add(entry.messageId);
          }
        } catch (err) {
          if (err.code !== 10008) {
            console.warn(`❌ Error deleting message ${entry.messageId}: ${err.message}`);
          }
        }
      }
    }

    const lastNotified = notifiedGuilds.get(guildId) || 0;
    if (now - lastNotified > NOTIFY_COOLDOWN) {
      const alertMsg = `${
        PASSIVE_MODE ? '🔍 [Passive Mode]' : '🚨'
      } Spam detected by <@${userId}> in guild **${message.guild.name}** at <#${message.channel.id}>`;

      await alertChannel.send(alertMsg);
      notifiedGuilds.set(guildId, now);
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
    } catch (err) {
      console.error(`❌ Failed to delete message from ${message.author.id}: ${err.message}`);
    }
  } else {
    console.warn(`⚠️ Message from ${message.author.id} not deletable.`);
  }
}
