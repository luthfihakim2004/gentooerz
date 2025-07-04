export default {
  name: 'raw',
  once: false,
  async execute(client, data) {
    client.lavalink.sendRawData(data);
    //console.log('[RAW]', data.t);
  }
};
