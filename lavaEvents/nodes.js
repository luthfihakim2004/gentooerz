export let availSources = [];

export function registerNodeEvents(client) {
  const nodeManager = client.lavalink.nodeManager;

  nodeManager
    .on("raw", (node, payload) => {
      // console.debug(node.id, ":: RAW ::", payload);
    })
    .on("disconnect", (node, reason) => {
      console.log(`${node.id} :: DISCONNECT ::`, reason);
    })
    .on("connect", async (node) => {
      console.log(`${node.id} :: CONNECTED ::`);
      availSources = await loadSources(node);
      //console.log(availSources)
    })
    .on("reconnecting", (node) => {
      console.log(`${node.id} :: RECONNECTING ::`);
    })
    .on("create", (node) => {
      console.log(`${node.id} :: CREATED ::`);
    })
    .on("destroy", (node) => {
      console.log(`${node.id} :: DESTROYED ::`);
    })
    .on("error", (node, error, payload) => {
      console.error(`${node.id} :: ERRORED ::`, error);
      console.error("Payload:", payload);
    })
    .on("resumed", (node, payload, players) => {
      console.log(`${node.id} :: RESUMED with ${players.length} players ::`);
    });
}

async function loadSources(node) {
  try {
    const info = await node.fetchInfo();
    return info.sourceManagers?.filter(src =>
      typeof src === 'string' || []
    );
  } catch (e) {
    console.error('Failed to fetch sources from Lavalink server:', e);
  }
}
