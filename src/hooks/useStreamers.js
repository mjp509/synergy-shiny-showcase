import { useQuery } from '@tanstack/react-query'
import { API } from '../api/endpoints'

async function fetchStreamers() {
  console.log("Fetching streamers...")

  const res = await fetch(API.streamers)
  console.log("Raw response:", res)

  if (!res.ok) {
    console.error("Failed to load streamer list:", res.status, res.statusText)
    throw new Error('Failed to load streamer list')
  }

  const data = await res.json()
  console.log("JSON data:", data)

  const allStreamers = Object.values(data)
  const live = allStreamers.filter(s => s.live)
  const offline = allStreamers.filter(s => !s.live)

  console.log("Live streamers:", live)
  console.log("Offline streamers:", offline)

  return { live, offline }
}


export function useStreamers() {
  return useQuery({
    queryKey: ['streamers'],
    queryFn: fetchStreamers,
    staleTime: 2 * 60 * 1000, // 2 min
  })
}
