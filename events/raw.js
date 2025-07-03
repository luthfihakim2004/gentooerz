import { client } from '../client.js';

export default {
  name: 'raw',
  once: false,
  async execute(d) {
    client.lavalink.sendRawData(d);
    console.log('[RAW]', d.t);
  }
};
