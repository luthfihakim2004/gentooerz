export const botStats = {
  deletedMessages: 0,
};

export function incrementDeletedMessages(count = 1) {
  botStats.deletedMessages += count;
}
