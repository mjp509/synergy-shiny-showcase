import { useQuery } from '@tanstack/react-query'
import { getAssetUrl } from '../utils/assets'
import trophiesData from '../data/trophies.json'

export function useTrophies() {
  return useQuery({
    queryKey: ['trophies'],
    queryFn: () => {
      // Transform trophy image paths to include base URL
      const transformed = {}
      for (const [key, value] of Object.entries(trophiesData)) {
        transformed[key] = typeof value === 'string' ? getAssetUrl(value.replace(/^\//, '')) : value
      }
      return transformed
    },
    staleTime: Infinity,
  })
}
