import { useQuery, useQueryClient } from '@tanstack/react-query'

import { sharedSpacesApi } from '@/api/shared-spaces.api'
import { getAuthToken } from '@/services/auth-token'

export const sharedSpacesKey = ['shared-spaces'] as const

export function useSharedSpaces() {
  return useQuery({
    queryKey: sharedSpacesKey,
    queryFn: sharedSpacesApi.listMine,
    enabled: Boolean(getAuthToken()),
    staleTime: 60 * 1000,
  })
}

export function useRefreshSharedSpaces() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: sharedSpacesKey })
}

