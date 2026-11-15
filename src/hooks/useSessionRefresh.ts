import { useEffect } from 'react'

import { authApi } from '@/api/auth.api'
import { getAuthToken, getAuthTokenIssuedAt, replaceAuthToken } from '@/services/auth-token'

// Renueva el token mientras la app se usa: la sesion solo caduca tras JWT_EXPIRES_IN sin actividad.
const REFRESH_AFTER_MS = 60 * 60 * 1000
const CHECK_INTERVAL_MS = 15 * 60 * 1000

let refreshInFlight: Promise<void> | null = null

function refreshSessionIfStale() {
  const token = getAuthToken()
  if (!token || refreshInFlight) return

  const issuedAt = getAuthTokenIssuedAt(token)
  if (issuedAt !== null && Date.now() - issuedAt < REFRESH_AFTER_MS) return

  refreshInFlight = authApi.refresh()
    .then(response => replaceAuthToken(token, response.token))
    // Un 401 ya cierra la sesion en http(); los errores de red se reintentan en el siguiente chequeo.
    .catch(() => undefined)
    .finally(() => {
      refreshInFlight = null
    })
}

export function useSessionRefresh(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshSessionIfStale()
    }

    refreshSessionIfStale()
    const interval = window.setInterval(refreshSessionIfStale, CHECK_INTERVAL_MS)
    window.addEventListener('focus', refreshSessionIfStale)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refreshSessionIfStale)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled])
}
