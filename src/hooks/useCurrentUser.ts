import { useCallback, useEffect, useState } from 'react'

import { authApi, type AuthUser } from '@/api/auth.api'
import { getAuthToken } from '@/services/auth-token'

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(getAuthToken()))

  const refreshUser = useCallback(() => {
    if (!getAuthToken()) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    authApi.me()
      .then(response => {
        setUser(response.user)
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!getAuthToken()) return

    let cancelled = false

    authApi.me()
      .then(response => {
        if (!cancelled) setUser(response.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return {
    user,
    isLoading,
    refreshUser,
  }
}
