import { getLocalPokemonGif } from '../utils/pokemon'

const WORKER_BASE =
  import.meta.env.MODE === 'development'
    ? '' // relative URL so Vite dev server proxy works
    : 'https://adminpage.hypersmmo.workers.dev/admin'

const TWITCH_API =
  import.meta.env.MODE === 'development'
    ? '/api/streamers'
    : 'https://twitch-api.hypersmmo.workers.dev/api/streamers'

export const API = {
  database: `${WORKER_BASE}/database`,
  streamers: TWITCH_API,
  adminCheck: `${WORKER_BASE}/check`,
  updateDatabase: `${WORKER_BASE}/update-database`,
  updateStreamers: `${WORKER_BASE}/update-streamers`,
  adminLog: `${WORKER_BASE}/log`,
  twitchStreamers: TWITCH_API,
  pokemonSprite: (name) => getLocalPokemonGif(name),
}
