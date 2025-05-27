import 'dotenv/config';
import { TTLMap } from './utils/ttlmap.js' 
import { analyzeUrl } from './utils/url-analyze.js'
import { client } from './client.js'

const LOG_CHANNEL_ID= process.env.LOG_CHANNEL_ID
const guildMessageBuckets = new TTLMap(); // guildId -> [{ userId, content, messageId, channelId, timestamp }]
const notifiedGuilds = new TTLMap(); // guildId -> timestamp

const TIME_WINDOW = 10000;
const SAME_MSG_THRESHOLD = 3;
const NOTIFY_COOLDOWN = 1800000; // Only notify once every 30m per guild

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const alertChannel = await client.channels.fetch(process.env.LOG_CHANNEL_ID);
  const rawUrls = message.content.match(/https?:\/\/[^\s<]+/g) || [];

  // Extract any embedded URLs (like from rich embeds)
  const embedUrls = message.embeds
    .flatMap(embed => {
      const urls = [];
      if (embed.url) urls.push(embed.url);
      if (embed.description) {
        urls.push(...(embed.description.match(/https?:\/\/[^\s<]+/g) || []));
      }
      if (embed.fields) {
        for (const field of embed.fields) {
          if (field.value) {
            urls.push(...(field.value.match(/https?:\/\/[^\s<]+/g) || []));
          }
        }
      }
      return urls;
    });

  const urls = [...new Set([...rawUrls, ...embedUrls])]; // Remove duplicates
  const guildId = message.guild.id;
  const userId = message.author.id;
  const now = Date.now();

  // Initialize bucket if not exists
  if (!guildMessageBuckets.has(guildId)) guildMessageBuckets.set(guildId, []);
  const bucket = guildMessageBuckets.get(guildId);

  // Log this message
  bucket.push({
    userId,
    content: message.content.trim(),
    messageId: message.id,
    channelId: message.channel.id,
    timestamp: now,
  });

  // Clean old messages from the bucket
  const recent = bucket.filter(entry => now - entry.timestamp < TIME_WINDOW);
  guildMessageBuckets.set(guildId, recent, TIME_WINDOW);

  // Check for spam: same content across channels from same user
  const recentSameContent = recent.filter(
    entry => entry.content === message.content.trim() && entry.userId === userId
  );
  
  const uniqueChannels = new Set(recentSameContent.map(e => e.channelId));
  // Check Url
  if (urls.length != 0){
    for (const url of urls) {
      const res = await analyzeUrl(url);
      if (res.malicious > 0 || res.suspicious > 3) {
        if (message.deletable) {
          try {
            await message.delete();
          } catch (err) {
            console.error(`❌ Failed to delete message from ${message.author.id}: ${err.message}`);
          }

        } else {
          console.warn(`⚠️ Message from ${message.author.id} not deletable.`);
        }

        await alertChannel.send(`🚨 Malicious URL from <@${message.author.id}>: ${url} at <#${message.channel.id}>`);
        break;
      }
    }
  }

  if (recentSameContent.length > SAME_MSG_THRESHOLD || uniqueChannels.size > 2) {
    console.log(`🚨 Spam detected in guild ${guildId} by user ${userId}`);

    // Delete all matching messages
    const deletedIds = new Set();

    for (const entry of recentSameContent) {
      if (deletedIds.has(entry.messageId)) continue;
      try {
        const channel = await client.channels.fetch(entry.channelId);
        if (!channel.isTextBased()) continue;

        const msg = await channel.messages.fetch(entry.messageId);
        if (msg && msg.deletable) {
          await msg.delete();
          deletedIds.add(entry.messageId);
        }
      } catch (err) {
        if (err.code !== 10008) { // 10008 = Unknown Message
          console.warn(`❌ Error deleting message ${entry.messageId}: ${err.message}`);
        }
      }
    }

    // Notify only if cooldown passed
    const lastNotified = notifiedGuilds.get(guildId) || 0;
    if (now - lastNotified > NOTIFY_COOLDOWN) {
      try {
        const channel = await client.channels.fetch(recentSameContent[0].channelId);
          if (alertChannel && alertChannel.isTextBased()) {
            await alertChannel.send(`🚨 Spam detected by <@${userId}> in guild **${message.guild.name}** at <#${message.channel.id}>`);
          }

        notifiedGuilds.set(guildId, now);
      } catch (err) {
        console.error('❌ Failed to send notification:', err.message);
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);
