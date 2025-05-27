export function detectSpam(messages, userId, content, threshold) {
  const matching = messages.filter(
    entry => entry.userId === userId && entry.content === content
  );
  const uniqueChannels = new Set(matching.map(m => m.channelId));

  return {
    isSpam: matching.length > threshold || uniqueChannels.size > 2,
    messagesToDelete: matching,
  };
}
