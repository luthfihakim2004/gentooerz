import { getPlayerData, delPlayerData, lavaManUtil } from '../utils/audio.js';

export let availSources = [];

export function registerNodeEvents(client) {
  const nodeManager = client.lavalink.nodeManager;

  nodeManager
    .on("raw", (node, payload) => {
      // console.debug(node.id, ":: RAW ::", payload);
    })
    .on("disconnect", (node, reason) => {
      //console.log(`${node.id} :: DISCONNECT ::`, reason);
    })
    .on("connect", async (node) => {
      //console.log(`${node.id} :: CONNECTED ::`);
      availSources = await loadSources(node);
      node.updateSession(true, 360e3);
      //console.log(availSources)
    })
    .on("reconnecting", (node) => {
      //console.log(`${node.id} :: RECONNECTING ::`);
    })
    .on("create", (node) => {
      console.log(`${node.id} :: CREATED ::`);
    })
    .on("destroy", (node) => {
      console.log(`${node.id} :: DESTROYED ::`);
    })
    .on("error", (node, error, payload) => {
      console.error(`${node.id} :: ERROR ::`, error);
      console.error("Payload:", payload);
    })
    .on("resumed", async (node, payload, fetchedPlayers) => {
      for (const data of fetchedPlayers) {
        const saved = getPlayerData(data.guildId);
        if (!saved) continue;

        if (!data.state.connected) {
          console.log("skipping resuming player, because it already disconnected");
          delPlayerData(data.guildId);
          continue;
        }

        const player = client.lavalink.createPlayer({
          guildId: data.guildId,
          node: node.id,
          volume: saved.volume,
          voiceChannelId: saved.voiceChannelId,
          textChannelId: saved.textChannelId,
          selfDeaf: saved.options?.selfDeaf ?? true,
          selfMute: saved.options?.selfMute ?? false,
          applyVolumeAsFilter: saved.options?.applyVolumeAsFilter,
          instaUpdateFiltersFix: saved.options?.instaUpdateFiltersFix,
          vcRegion: saved.options?.vcRegion
        });

        await player.connect();

        player.filterManager.data = saved.filters;
        await player.queue.utils.sync(true, false);

        if (data.track) {
          player.queue.current = client.lavalink.utils.buildTrack(data.track, player.queue.current?.requester || client.user);
        }

        player.lastPosition = data.state.position;
        player.lastPositionChange = Date.now();
        player.ping.lavalink = data.state.ping;
        player.paused = data.paused;
        player.playing = !data.paused && !!data.track;
      }
    });
  
}

async function loadSources(node) {
  try {
    const info = await node.fetchInfo();
    return info.sourceManagers?.filter(src => {
      try {
        lavaManUtil.validateSourceString(node, src); // Throws if invalid
        return true;
      } catch {
        //console.warn(`Filtered out unsupported source: ${src}`);
        return false;
      }
    }) || [];  } catch (e) {
    console.error('Failed to fetch sources from Lavalink server:', e);
  }
}
