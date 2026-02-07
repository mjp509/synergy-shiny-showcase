import { getLocalPokemonGif } from '../utils/pokemon'

const WORKER_BASE = 'https://adminpage.hypersmmo.workers.dev/admin'
const TWITCH_API = 'https://twitch-api.hypersmmo.workers.dev/api/streamers'

export const API = {
  database: `${WORKER_BASE}/database`,
  streamers: TWITCH_API,
  adminCheck: `${WORKER_BASE}/check`,
  updateDatabase: `${WORKER_BASE}/update-database`,
  updateStreamers: `${WORKER_BASE}/update-streamers`,
  adminLog: `${WORKER_BASE}/log`,
  pokemonSprite: (name) => getLocalPokemonGif(name),
}
