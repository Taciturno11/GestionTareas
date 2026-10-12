const AUTH_TOKEN_KEY = 'gt_auth_token'

export function getAuthTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: unknown }
    return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function getAuthToken() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (token && (getAuthTokenExpiration(token) ?? 0) <= Date.now()) {
    expireAuthSession(token)
    return null
  }
  return token
}

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function expireAuthSession(token: string) {
  if (localStorage.getItem(AUTH_TOKEN_KEY) !== token) return
  clearAuthToken()
  if (window.location.pathname !== '/login') window.location.replace('/login')
}
