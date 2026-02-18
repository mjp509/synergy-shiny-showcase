import { useQuery } from '@tanstack/react-query'
import { API } from '../api/endpoints'

export function useDatabase() {
  return useQuery({
    queryKey: ['database'],
    queryFn: () => fetch(API.database).then(r => {
      if (!r.ok) throw new Error(`Failed to load database: ${r.status}`)
      return r.json()
    }),
    staleTime: 10 * 60 * 1000,
  })
}
