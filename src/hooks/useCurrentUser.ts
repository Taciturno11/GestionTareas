import { useCallback, useEffect, useState } from 'react'

import { authApi, type AuthUser } from '@/api/auth.api'
import { clearAuthToken, getAuthToken } from '@/services/auth-token'

export function useCurrentUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      .catch(() => {
        clearAuthToken()
        setUser(null)
      })
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
        if (cancelled) return
        clearAuthToken()
        setUser(null)
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
