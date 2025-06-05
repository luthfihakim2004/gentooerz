import { handleMessage } from '../handlers/msgHandler.js';

export default {
  name: 'messageCreate',
  once: false,
  async execute(client, message) {
    await handleMessage(message);
  }
};
