import { useQuery, useQueryClient } from '@tanstack/react-query'

import { sharedSpacesApi } from '@/api/shared-spaces.api'
import { getAuthToken } from '@/services/auth-token'

export const sharedSpacesKey = ['shared-spaces'] as const
export const sharedSpacesKeyForUser = (userId: string | null | undefined) => ['shared-spaces', userId ?? 'anonymous'] as const

export function useSharedSpaces(userId?: string | null) {
  return useQuery({
    queryKey: sharedSpacesKeyForUser(userId),
    queryFn: sharedSpacesApi.listMine,
    enabled: Boolean(getAuthToken() && userId),
    staleTime: 60 * 1000,
  })
}

export function useRefreshSharedSpaces() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: sharedSpacesKey })
}
